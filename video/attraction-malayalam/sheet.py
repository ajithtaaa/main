import sys, time
from PIL import Image
import render as R
ts=[float(x) for x in sys.argv[2:]]
ims=[]
t0=time.time()
for t in ts:
    ims.append(Image.fromarray(R.render_frame(int(t*30))).resize((640,360)))
print('per frame',(time.time()-t0)/len(ts))
cols=3; rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(640*cols,360*rows),'black')
for i,im in enumerate(ims): sh.paste(im,((i%cols)*640,(i//cols)*360))
sh.save(sys.argv[1])
