export const WEIGHTS=[128,64,32,16,8,4,2,1];
export const SHAPES=[[[0,0]],[[0,0],[0,1]],[[0,0],[1,0]],[[0,0],[0,1],[1,0]],[[0,0],[0,1],[1,0],[1,1]],[[0,0],[0,1],[0,2]],[[0,0],[0,1],[0,2],[0,3]]];
export const TARGETS=[15,240,60,195,170,85,129,126];
export const fresh=()=>({board:Array(64).fill(0),tray:[6,1,0],score:0,rescued:0,combo:0,moves:0});
export const target=s=>TARGETS[s.rescued%TARGETS.length];
export const row=s=>s.rescued%8;
export const value=(board,r)=>WEIGHTS.reduce((n,w,c)=>n+(board[r*8+c]?w:0),0);
export function fits(s,i,r,c){return Number.isInteger(r)&&Number.isInteger(c)&&SHAPES[s.tray[i]]?.every(([y,x])=>r+y>=0&&r+y<8&&c+x>=0&&c+x<8&&!s.board[(r+y)*8+c+x]);}
export function available(s){return s.tray.some((_,i)=>s.board.some((__,n)=>fits(s,i,n>>3,n%8)));}
export function place(s,i,r,c,random=Math.random){if(!fits(s,i,r,c))return null;const n=structuredClone(s);const shape=SHAPES[n.tray[i]];for(const[y,x]of shape)n.board[(r+y)*8+c+x]=i+1;const rescued=value(n.board,row(s))===target(s);const rows=[],cols=[];for(let j=0;j<8;j++){if(n.board.slice(j*8,j*8+8).every(Boolean))rows.push(j);if(n.board.filter((_,k)=>k%8===j).every(Boolean))cols.push(j);}const clear=new Set();for(const y of rows)for(let x=0;x<8;x++)clear.add(y*8+x);for(const x of cols)for(let y=0;y<8;y++)clear.add(y*8+x);if(rescued)for(let x=0;x<8;x++)clear.add(row(s)*8+x);for(const k of clear)n.board[k]=0;n.combo=clear.size?s.combo+1:0;n.score+=shape.length*10+clear.size*10*n.combo+(rescued?200:0);n.rescued+=Number(rescued);n.moves++;n.tray[i]=null;if(n.tray.every(x=>x===null))n.tray=n.rescued<3?[6,1,0]:[Math.floor(random()*SHAPES.length),Math.floor(random()*SHAPES.length),0];return {state:n,rescued,cleared:clear.size,lines:rows.length+cols.length};}
export function restore(raw){try{const s=JSON.parse(raw);if(s.board?.length===64&&s.board.every(x=>Number.isInteger(x)&&x>=0&&x<=3)&&s.tray?.length===3&&s.tray.every(x=>x===null||Number.isInteger(x)&&x>=0&&x<SHAPES.length)&&['score','rescued','combo','moves'].every(k=>Number.isSafeInteger(s[k])&&s[k]>=0))return s;}catch{}return fresh();}
