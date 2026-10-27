import json
exec(open('align.py').read().split('# speech islands')[0])
sil=[];cur=None
for l in open('sil2.txt'):
    k,v=l.split(); v=float(v)
    if k.startswith('silence_start'): cur=v
    else: sil.append((cur,v))
T=233.95; isl=[];prev=0.0
for s,e in sil:
    if s>prev+0.02: isl.append((prev,s))
    prev=e
if prev<T-0.05: isl.append((prev,T))
M=len(isl);N=len(chunks)
ws=[weight(c['text']) for c in chunks]
pre=[0]
for s,e in isl: pre.append(pre[-1]+e-s)
gapafter=[(isl[k+1][0]-isl[k][1]) if k+1<M else 2.0 for k in range(M)]
def run(rate):
    INF=1e18
    def cost(i,a,b):
        d=pre[b]-pre[a]; exp=ws[i]*rate
        c=((d-exp)/(0.3*exp+0.4))**2
        for k in range(a,b-1):
            g=gapafter[k]; c+=max(0,g-0.35)*6
        c-=2.5*min(gapafter[b-1],1.0)
        return c
    dp=[[INF]*(M+1) for _ in range(N+1)];bk=[[0]*(M+1) for _ in range(N+1)];dp[0][0]=0
    for i in range(N):
        for a in range(M):
            if dp[i][a]>=INF: continue
            for b in range(a+1,min(M,a+40)+1):
                if pre[b]-pre[a]>ws[i]*rate*2.5+2: break
                v=dp[i][a]+cost(i,a,b)
                if v<dp[i+1][b]: dp[i+1][b]=v;bk[i+1][b]=a
    b=M;segs=[]
    for i in range(N,0,-1):
        a=bk[i][b];segs.append((a,b));b=a
    return dp[N][M],segs[::-1]
speech=pre[-1];rate=speech/sum(ws)
best=min((run(rate*f)+(f,) for f in [0.9,1.0,1.1]),key=lambda x:x[0])
print('islands',M,'factor',best[2])
for c,(a,b) in zip(chunks,best[1]):
    c['start']=round(isl[a][0],3);c['end']=round(isl[b-1][1],3)
json.dump(chunks,open('timing.json','w'),ensure_ascii=False,indent=1)
for i,c in enumerate(chunks): print(i,c['start'],c['end'],round(ws[i]*rate*best[2],1),round(c['end']-c['start'],1),c['text'][:28])
