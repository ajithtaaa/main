import json,re
lines=open('chunks.txt').read().splitlines()
chunks=[];scene=None
for l in lines:
    if not l.strip(): continue
    if l.startswith('#'): scene=l[1:].split()[1]; continue
    chunks.append({'scene':scene,'text':l})
def weight(t):
    w=0
    for ch in t:
        o=ord(ch)
        if 0x0D3E<=o<=0x0D4D or o==0x0D57 or o==0x0D02: w+=0.35
        elif 0x0D00<=o<=0x0D7F: w+=1
        elif ch in ',': w+=1.5
        elif ch in '.?!': w+=0.5
        elif ch==' ': w+=0.3
    return w
# speech islands
sil=[];cur=None
for l in open('sil.txt'):
    p=l.split()
    if p[0]=='silence_start:': cur=float(p[1])
    else: sil.append((cur,float(p[1])))
T=233.95
isl=[];prev=0.0
for s,e in sil:
    if s>prev+0.02: isl.append((prev,s))
    prev=e
if prev<T: isl.append((prev,T))
M=len(isl);N=len(chunks)
ws=[weight(c['text']) for c in chunks]
speech=sum(e-s for s,e in isl);rate=speech/sum(ws)
print('islands',M,'chunks',N,'sec/unit',round(rate,4))
pre=[0]
for s,e in isl: pre.append(pre[-1]+e-s)
INF=1e18
def cost(i,a,b): # chunk i covers islands a..b-1
    d=pre[b]-pre[a]; exp=ws[i]*rate
    c=((d-exp)/max(exp,0.6))**2
    # internal gaps penalty (long gaps likely boundaries)
    for k in range(a,b-1):
        g=isl[k+1][0]-isl[k][1]; c+=max(0,g-0.3)*1.5
    return c
dp=[[INF]*(M+1) for _ in range(N+1)];bk=[[0]*(M+1) for _ in range(N+1)]
dp[0][0]=0
for i in range(N):
    for a in range(M):
        if dp[i][a]>=INF: continue
        for b in range(a+1,min(M,a+12)+1):
            v=dp[i][a]+cost(i,a,b)
            if v<dp[i+1][b]: dp[i+1][b]=v;bk[i+1][b]=a
b=M;segs=[]
for i in range(N,0,-1):
    a=bk[i][b];segs.append((a,b));b=a
segs.reverse()
for c,(a,b) in zip(chunks,segs):
    c['start']=round(isl[a][0],3);c['end']=round(isl[b-1][1],3);c['n']=b-a
json.dump(chunks,open('timing.json','w'),ensure_ascii=False,indent=1)
for i,c in enumerate(chunks): print(i,c['scene'],c['start'],c['end'],c['n'],round(ws[i]*rate,1),round(c['end']-c['start'],1),c['text'][:30])
