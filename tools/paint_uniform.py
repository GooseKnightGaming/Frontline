# RETIRED in M5.18.0: the operative wears real clothes (tools/dress_operative.mjs).
# Kept because painting by bone region is a quick way to recolour bodies.
# Paints a plain dark tactical uniform onto the Universal Base male body's
# texture, region by region from each triangle's main bone (see build_operative.mjs).
# Part 1 reads the mesh; part 2 paints. Paths are the sandbox's /tmp/ual staging.
# ---- part 1: read the mesh ----
import json, numpy as np
# ---- part 1: read the mesh ----
import json, numpy as np
B='/tmp/ual/base/'
j=json.load(open(B+'Superhero_Male_FullBody.gltf')); bin=open(B+'Superhero_Male_FullBody.bin','rb').read()
CT={5126:np.float32,5123:np.uint16,5125:np.uint32,5121:np.uint8}
NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}
def acc(i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]
    off=bv.get('byteOffset',0)+a.get('byteOffset',0); dt=CT[a['componentType']]; n=NC[a['type']]
    stride=bv.get('byteStride'); size=np.dtype(dt).itemsize*n
    if stride and stride!=size:
        raw=np.frombuffer(bin,np.uint8,count=stride*a['count'],offset=off).reshape(a['count'],stride)[:,:size].copy()
        arr=raw.view(dt).reshape(a['count'],n)
    else: arr=np.frombuffer(bin,dt,count=a['count']*n,offset=off).reshape(a['count'],n)
    if a.get('normalized') and dt!=np.float32: arr=arr/np.iinfo(dt).max
    return arr
skin=j['skins'][0]; names=[j['nodes'][i]['name'] for i in skin['joints']]
out={}
for mi,m in enumerate(j['meshes']):
    for p in m['primitives']:
        at=p['attributes']
        print(m['name'], 'mat', p['material'], 'verts', j['accessors'][at['POSITION']]['count'], 'tris', j['accessors'][p['indices']]['count']//3, list(at.keys()))
        if p['material']==2:
            out=dict(pos=acc(at['POSITION']),nrm=acc(at['NORMAL']),uv=acc(at['TEXCOORD_0']),jnt=acc(at['JOINTS_0']),wt=acc(at['WEIGHTS_0']),idx=acc(p['indices']).reshape(-1))
np.savez('/tmp/ual/body.npz',**out); json.dump(names,open('/tmp/ual/joints.json','w'))
P=out['pos']; print('bounds', P.min(0), P.max(0)); print('uv range', out['uv'].min(0), out['uv'].max(0))
# which node is the mesh on, any transform?
for n in j['nodes']:
    if 'mesh' in n or 'skin' in n: print('node', n.get('name'), {k:n[k] for k in n if k in ('mesh','skin','rotation','scale','translation')})
print('root node', [ (n['name'], n.get('rotation'), n.get('scale'), n.get('translation')) for n in j['nodes'] if n['name'] in ('root','pelvis') or 'Armature' in n.get('name','')])

# ---- part 2: paint ----
import json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
d=np.load('/tmp/ual/body.npz'); names=json.load(open('/tmp/ual/joints.json'))
P,N,UV,J,W,I=d['pos'],d['nrm'],d['uv'],d['jnt'],d['wt'],d['idx']
dom=np.array([names[J[v][np.argmax(W[v])]] for v in range(len(P))])
y=P[:,1]; nz=N[:,2]
SKIN,SUIT,VEST,GLOVE,BOOT,BELT,KNEE,POCKET,COLLAR,CUFF=1,2,3,4,5,6,7,8,9,10
def cat(v):
    n=dom[v]
    if n in ('Head',) or (n=='neck_01' and y[v]>1.50): return SKIN
    if n.startswith('hand') or any(n.startswith(f) for f in ('index','middle','pinky','ring','thumb')): return GLOVE
    if n.startswith('foot') or n.startswith('ball') or (n.startswith('calf') and y[v]<0.40): return BOOT
    if n in ('pelvis','spine_01') and 0.99<y[v]<1.07: return BELT
    # clothing a body does not have: knee pads, chest pockets, a collar, cuffs
    if (n.startswith('thigh') or n.startswith('calf')) and 0.43<y[v]<0.58 and nz[v]>0.3: return KNEE
    if n=='spine_03' and 1.27<y[v]<1.39 and nz[v]>0.4 and 0.05<abs(P[v,0])<0.15: return POCKET
    if n=='neck_01' and 1.44<y[v]<=1.50: return COLLAR
    if n.startswith('lowerarm') and abs(P[v,0])>0.62: return CUFF
    if n in ('spine_02','spine_03') and 1.12<y[v]<1.46 and abs(nz[v])>0.35 and abs(P[v,0])<0.19: return VEST
    return SUIT
vc=np.array([cat(v) for v in range(len(P))])
S=1024
mask=Image.new('L',(S,S),0); dr=ImageDraw.Draw(mask)
tri=I.reshape(-1,3)
for t in tri:
    c=np.bincount(vc[t]).argmax()
    pts=[(UV[v,0]*S, UV[v,1]*S) for v in t]
    dr.polygon(pts, fill=int(c))
m=np.array(mask)
# grow each region over the seams so nothing samples the background
for _ in range(40):
    grown=np.array(Image.fromarray(m).filter(ImageFilter.MaxFilter(3)))
    m=np.where(m==0, grown, m)
# smooth the borders between parts of the uniform (painting whole triangles
# leaves a saw-tooth edge); skin keeps its exact outline
skin=m==1
sm=m.copy(); sm[skin]=2
for k in (9,9,7):
    sm=np.array(Image.fromarray(sm).filter(ImageFilter.ModeFilter(k)))
m=np.where(skin,1,sm)
orig=np.array(Image.open('/tmp/ual/base/T_Superhero_Male_Dark.png').convert('RGB').resize((S,S),Image.LANCZOS)).astype(np.float32)
lum=orig.mean(2); blur=np.array(Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.GaussianBlur(28))).astype(np.float32)
fine=np.array(Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)
rng=np.random.default_rng(7); noise=rng.normal(0,1,(S,S)).astype(np.float32)
noise=np.array(Image.fromarray(((noise*20)+128).clip(0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)/128-1
COL={SUIT:(58,62,57),VEST:(44,47,43),GLOVE:(30,30,31),BOOT:(26,24,22),BELT:(40,35,29),KNEE:(34,36,33),POCKET:(50,53,48),COLLAR:(48,51,46),CUFF:(46,49,45)}
out=orig.copy()
for c,col in COL.items():
    sel=m==c
    if not sel.any(): continue
    mean=blur[sel].mean()
    shade=np.clip(1.0+0.006*(blur-mean),0.75,1.2)
    shade=shade*(1+0.06*noise)
    yy,xx=np.mgrid[0:S,0:S]
    crease=np.sin(xx*0.09+np.sin(yy*0.013)*6)*np.sin(yy*0.021+np.sin(xx*0.017)*4)
    shade=shade*(1+0.05*crease)
    for k in range(3): out[...,k]=np.where(sel, col[k]*shade, out[...,k])
# stitching: a darker line where one part of the uniform meets another
edge=np.zeros((S,S),bool)
for dy,dx in ((0,1),(1,0)):
    a=m; b=np.roll(m,(dy,dx),(0,1)); edge|=(a!=b)&(a>1)&(b>1)
edge=np.array(Image.fromarray((edge*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)))>0
out[edge]*=0.62
Image.fromarray(out.clip(0,255).astype(np.uint8)).save('/tmp/ual/tex/T_Operative_Base.png')
Image.fromarray((m*40).astype(np.uint8)).resize((512,512)).save('/tmp/ual/mask_preview.png')
Image.fromarray(out.clip(0,255).astype(np.uint8)).resize((512,512)).save('/tmp/ual/uniform_preview.png')
print({c:int((m==c).sum()) for c in range(11)})
