from PIL import Image
import sys

for arg in sys.argv:
    print arg

baseDir = sys.argv[1]
fileName = sys.argv[2]
target = sys.argv[3]
size = sys.argv[4]

img = Image.open(baseDir+'/'+fileName)
img.thumbnail((size,size), Image.ANTIALIAS)
img.save(target+'/'+fileName, 'JPEG')
