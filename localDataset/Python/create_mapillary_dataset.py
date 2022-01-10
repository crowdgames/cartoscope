#!/

import base64, hashlib, json, os, ssl, sys, time, urllib.error, urllib.request, uuid
from PIL import Image
import cairosvg
import certifi
import mapbox_vector_tile

NUM_IMAGES = 24
TILE_SIZE = 512
ACCESS_TOKEN = "MLY|4739094372820116|6975bb8ea401253c2343bba480af8b5e" 
NULL = '_'
SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())

_, DIR_NAME, *BBOX = sys.argv
assert len(BBOX) == 4

def url_fetch(url):
    print('fetching', url)
    for attempt in range(5):
        try:
            print('attempt', attempt + 1)
            #time.sleep(1)
            res = urllib.request.urlopen(url, context=SSL_CONTEXT).read()
            print('success!')
            return res
        except urllib.error.HTTPError:
            time.sleep(5)
    print('out of attempts!')
    sys.exit(-1)
    
def url_to_json(url):
    return json.loads(url_fetch(url))

def ob_to_meta(name, id, category, category_hint, ob):
    meta = {
        'id': id,
        'category': category,
        'category_hint': category_hint,
        'attribution': 'Image from [Mapillary](http://mapillary.com), under [CC-BY-SA](https://creativecommons.org/licenses/by-sa/4.0/), and may have been cropped or scaled.',
        'source': {
            'name': 'Mapillary',
            'url': 'http://mapillary.com',
            'meta': ob
            }
        }

    with open(name + '.json', 'w') as outfile:
        json.dump(meta, outfile, sort_keys=True, indent=4, separators=(',', ': '), ensure_ascii=False)

def ob_to_tile(name, ob):
    if ob['is_doc']:
        url_to_tile_doc(name, ob['image_url'])
        
    else:
        url_to_tile_img(name, ob['image_url'], ob['image_geom'])

def url_to_tile_doc(name, url):
    img_data = url_fetch(url)
    scale = TILE_SIZE / 24 # assume svg size is 24
    cairosvg.svg2png(bytestring=img_data, scale=scale, write_to=name + '.png')

def url_to_tile_img(name, url, crop_geom):
    img_data = url_fetch(url)
    with open('tmp.jpg', 'wb') as img_file:
        img_file.write(img_data)
    img = Image.open('tmp.jpg')
    iw, ih = img.size

    extent = crop_geom['mpy-or']['extent']
    features = crop_geom['mpy-or']['features']

    x0, y0 = 99999, 99999
    x1, y1 = -1, -1
    for feature in features:
        points = feature['geometry']['coordinates']

        for point_list in points:
            for xx, yy in point_list:
                x0 = min(x0, int(xx / extent * iw))
                y0 = min(y0, int(yy / extent * ih))
                x1 = max(x1, int(xx / extent * iw + 0.5))
                y1 = max(y1, int(yy / extent * ih + 0.5))
    fy0 = ih - y1 - 1
    fy1 = ih - y0 - 1
    y0 = fy0
    y1 = fy1

    tw = x1 - x0
    th = y1 - y0

    if tw < th:
        tw = th
    if th < tw:
        th = tw

    if x0 + tw >= iw:
        x0 -= (x0 + tw) - iw
    if y0 + th >= ih:
        y0 -= (y0 + th) - ih

    img = img.crop((x0,y0,x0+tw,y0+th))

    img = img.resize((TILE_SIZE, TILE_SIZE), Image.ANTIALIAS)
    img.save(name + '.jpg')
    os.unlink('tmp.jpg')



## fetch list of features
data = url_to_json('https://graph.mapillary.com/map_features?access_token=%s&fields=id,object_value&object_values=regulatory--*,information--*,warning--*,complementary--*&bbox=%f,%f,%f,%f' % (ACCESS_TOKEN, BBOX[0], BBOX[1], BBOX[2], BBOX[3]))

obs = data['data']

print('found', len(obs))



## organize by type
obs_by_type = {}

for obi, ob in enumerate(obs):
    type = ob['object_value']

    # some doc images seem to be missing
    if type in ['information--general-directions--g1']:
        continue

    if type not in obs_by_type:
        obs_by_type[type] = []

    obs_by_type[type].append(ob)


## further process, find doc images
use_obs = []
for type, obs in obs_by_type.items():
    if len(use_obs) >= NUM_IMAGES:
        break

    type = obs[0]['object_value']

    img_ob = {
        'value': type,
        'is_doc': False,
        'obj_id': obs[0]['id']
    }
    use_obs.append((img_ob, True))

    doc_ob = {
        'value': type,
        'is_doc': True,
        'image_url': 'https://raw.githubusercontent.com/mapillary/mapillary_sprite_source/master/package_signs/' + type + '.svg'
    }
    use_obs.append((doc_ob, True))

if len(use_obs) != NUM_IMAGES:
    raise 'Error! Only found ' + str(len(use_obs)) + ' images.'

## lookup image infor for detections
for ob, ob_gt in use_obs:
    if ob['is_doc']:
        continue

    detections = url_to_json('https://graph.mapillary.com/%s/detections?access_token=%s&fields=image,geometry' % (ob['obj_id'], ACCESS_TOKEN))
    images = detections['data']
    image = images[0]
    image_id = image['image']['id']
    image_geom = mapbox_vector_tile.decode(base64.decodebytes(image['geometry'].encode('utf-8')))

    ob['image_id'] = image_id
    ob['image_geom'] = image_geom

    imgdata = url_to_json('https://graph.mapillary.com/%s?access_token=%s&fields=id,thumb_2048_url' % (ob['image_id'], ACCESS_TOKEN))

    ob['image_url'] = imgdata['thumb_2048_url']


# fetch the images
for ob, ob_gt in use_obs:
    type = ob['value']
    ob_id = str(uuid.uuid4())
    filename = f'{DIR_NAME}/mapil-{ob_id}'

    ob_to_tile(filename, ob)
    ob_to_meta(filename, ob_id, type if ob_gt else NULL, type, ob)
