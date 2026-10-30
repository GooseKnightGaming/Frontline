# Recolours the Fantasy pack's Ranger texture as field kit: the ranger's greens
# become two tones of dark field cloth, leather goes near-black brown, metal
# stays grey. Only the local fold shading is kept (a fold relative to its
# surroundings), so pale and dark panels both land on the cloth colours and
# the painted light and shade - the Battlefront look - survives.
# Input: T_Ranger_BaseColor.png (4096). Output: T_Ranger_Tactical.png (1024).
import numpy as np
from PIL import Image, ImageFilter
im=Image.open('/tmp/fant/parts/T_Ranger_BaseColor.png').convert('RGB').resize((1024,1024),Image.LANCZOS)
a=np.asarray(im).astype(np.float32)/255
hsv=np.asarray(im.convert('HSV')).astype(np.float32)
h=hsv[...,0]*360/255; sat=hsv[...,1]/255; lum=a.mean(2)
green=(h>55)&(h<175)&(sat>0.18)
brown=((h<=55)|(h>=330))&(sat>0.18)
grey=~green&~brown
local=np.asarray(Image.fromarray((lum*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14))).astype(np.float32)/255
fold=np.clip(0.9+2.4*(lum-local),0.45,1.45)
t=np.clip((local-0.22)/0.35,0,1)[...,None]          # which of two cloth tones
dark=np.array((52,56,50))/255; light=np.array((84,90,80))/255
cloth=(dark*(1-t)+light*t)*fold[...,None]
leather=np.array((46,40,33))/255*np.clip(0.85+2.0*(lum-local),0.45,1.45)[...,None]
out=np.zeros_like(a)
out[green]=cloth[green]; out[brown]=leather[brown]
out[grey]=np.repeat((0.16+0.6*lum[grey])[:,None],3,1)
out=np.clip(out,0,1)
Image.fromarray((out*255).astype(np.uint8)).save('/tmp/fant/T_Ranger_Tactical.png', optimize=True)
