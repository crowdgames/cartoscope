from PIL import Image
import sys

for arg in sys.argv:
    print arg

baseDir = sys.argv[1]
fileName = sys.argv[2]
target = sys.argv[3]

img = Image.open(baseDir+'/'+fileName)
img.thumbnail((512,512), Image.ANTIALIAS)
img.save(target+'/'+fileName, 'JPEG')
