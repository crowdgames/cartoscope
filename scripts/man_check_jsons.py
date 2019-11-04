import sys,os,json
from PIL import Image


folder = sys.argv[1]
atrs = []

image_list = os.listdir(folder)
init = 1
start = ""
for file in image_list:
    f = os.path.join(folder,file)
    #print(f)
    if f.endswith(".jpg"):
        outfile = os.path.splitext(f)[0] + ".json"
        #check if exists
        if not os.path.exists(outfile):
            print("ERROR: MISSING JSON")
            print(os.path.splitext(f)[0])
    elif f.endswith(".json"):
        outfile = os.path.splitext(f)[0] + ".jpg"
        #check if exists
        if not os.path.exists(outfile):
            print("ERROR: MISSING IMAGE")
            print(os.path.splitext(f)[0])


        # #read json
        # with open(f) as json_file:
        #     data = json.load(json_file)
        #     im_attr = data['attribution']
        #     items = im_attr.split(",")
        #     print(items[1])
        #     if (init):
        #         start = items[0]+": "
        #         init = 0
        #     if not items[1] in atrs:
        #         atrs.append(items[1])
