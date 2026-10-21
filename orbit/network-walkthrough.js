/** Guided practice keeps each decision explicit, including a zero that is already off. */
import {WEIGHTS,bits,maskFor} from './network-game.js';
export const canWalkThrough=q=>['bits','mask'].includes(q.kind);
export const autoWalkThrough=(q,mode)=>mode==='guided'&&q.round<3&&canWalkThrough(q);
export function createWalkthrough(q){
 if(!canWalkThrough(q))return null;
 const steps=[];
 if(q.kind==='bits'){
  steps.push({kind:'intro',title:'A bit is a tiny switch.',text:'Binary uses two digits: 0 and 1. A 0 leaves a switch off. A 1 turns it on and adds its value. Eight bits make one octet. Each weight is twice the weight to its right.',formula:'128 · 64 · 32 · 16 · 8 · 4 · 2 · 1',instruction:'Read the weights above the eight switches. We will check them from left to right.'});
  steps.push({kind:'intro',title:`Let’s build ${q.target} together.`,text:`Decimal is our everyday counting system. Start with ${q.target} left to make. At each switch, ask: “Is this weight less than or equal to what is left?” If yes, choose 1 and subtract it. If no, choose 0 and keep going.`,formula:`Target ${q.target} − chosen total 0 = ${q.target} left`,instruction:'You will choose 0 or 1 for every bit. Nothing falls while we work.'});
 }else{
  steps.push({kind:'intro',title:`What does /${q.prefix} mean?`,text:`IPv4 has 32 bits, grouped into four octets of 8. The slash number is the prefix length: /${q.prefix} means the first ${q.prefix} bits identify the network. The remaining ${32-q.prefix} bits identify addresses inside it.`,formula:`32 total − ${q.prefix} network = ${32-q.prefix} host bits`,instruction:'In a subnet mask, write 1 for a network position and 0 for a host position. The 1s must stay together on the left.'});
  const before=q.octet*8,ones=Math.max(0,Math.min(8,q.prefix-before));
  steps.push({kind:'intro',title:`Focus on octet ${q.octet+1}.`,text:`The ${q.octet} octets before our highlighted octet use ${before} network bits. Each full network octet is 11111111: its weights add to 255. This octet needs ${ones} more network ${ones===1?'bit':'bits'}, then ${8-ones} host ${8-ones===1?'bit':'bits'}.`,formula:`${q.prefix} − ${before} = ${ones} network ${ones===1?'bit':'bits'} here`,instruction:'We will build only the highlighted octet. The other three octets are already filled in for you.'});
 }
 let remaining=q.target,chosen=0;
 WEIGHTS.forEach((weight,index)=>{
  const expected=(q.target&weight)?1:0;
  let text,formula,success;
  if(q.kind==='bits'){
   text=remaining===0?`We have reached ${q.target}. There is 0 left to make, so adding ${weight} would go past our target. Choose 0.`:weight>remaining?`${weight} is larger than the ${remaining} we still need. Turning it on would go past our target. Choose 0 and leave ${remaining} to make.`:`${weight} fits into the ${remaining} we still need. Choose 1, add ${weight}, and subtract it from what is left.`;
   formula=expected?`${remaining} − ${weight} = ${remaining-weight} left`:`${remaining} left < weight ${weight}`;
   success=expected?`Yes! ${chosen} + ${weight} = ${chosen+weight}. We now have ${remaining-weight} left to make.`:`Yes! Keep this bit at 0. Our total stays ${chosen}; we still need ${remaining}.`;
  }else{
   const position=q.octet*8+index+1;
   text=expected?`This is bit ${position} of the full 32-bit mask. /${q.prefix} says bits 1 through ${q.prefix} belong to the network. This position is inside that group, so choose 1. Its weight adds ${weight} to this octet.`:`This is bit ${position} of the full 32-bit mask. The ${q.prefix} network bits have already ended. This position belongs to the host part, so choose 0. Do not restart the 1s.`;
   formula=`Position ${position} ${expected?'≤':'>'} prefix ${q.prefix} → ${expected?'network bit 1':'host bit 0'}`;
   success=expected?`Correct. This network bit is 1. ${chosen} + ${weight} = ${chosen+weight} in this octet.`:`Correct. This host bit is 0. It adds nothing, so this octet stays at ${chosen}.`;
  }
  steps.push({kind:'bit',index,weight,expected,remaining,chosen,title:`Bit ${index+1} of 8 · weight ${weight}`,text,formula,success,instruction:'Choose 0 to leave it off, or 1 to turn it on.'});
  if(expected){chosen+=weight;remaining-=weight;}
 });
 const terms=WEIGHTS.filter(w=>q.target&w).join(' + ')||'No switches on';
 const mask=q.kind==='mask'?maskFor(q.prefix):null;
 steps.push({kind:'summary',title:q.kind==='mask'?'You built the subnet mask.':'You built the number.',text:q.kind==='mask'?`Add the weights of the 1s: ${terms} = ${q.target}. The highlighted octet is ${bits(q.target)}. Put the four octets together: ${mask}. The whole mask has ${q.prefix} network 1s, followed by ${32-q.prefix} host 0s. The mask marks the boundary; it is not a device’s IP address.`:`Only the 1 bits count: ${terms} = ${q.target}. Read all eight digits, including the zeros: ${bits(q.target)}. The zeros hold each weight in its proper place.`,formula:q.kind==='mask'?`/${q.prefix} = ${mask}`:`${bits(q.target)}₂ = ${q.target}₁₀`,instruction:'Finish the walkthrough, then check your answer to unlock the block.'});
 return {steps,index:0,value:0,accepted:false,done:false,message:'',error:false};
}
export const walkStep=walk=>walk?.steps[walk.index];
export function chooseWalkBit(walk,choice){
 const step=walkStep(walk);
 if(!walk||walk.done||step.kind!=='bit'||walk.accepted||![0,1].includes(choice))return walk;
 if(choice!==step.expected)return {...walk,message:`Not yet. ${step.text}`,error:true};
 return {...walk,value:step.expected?walk.value|step.weight:walk.value&~step.weight,accepted:true,message:step.success,error:false};
}
export function nextWalkStep(walk){
 if(!walk||walk.done)return walk;
 const step=walkStep(walk);
 if(step.kind==='bit'&&!walk.accepted)return walk;
 if(step.kind==='summary')return {...walk,done:true,message:'Walkthrough complete. Check your answer when you are ready.',error:false};
 return {...walk,index:walk.index+1,accepted:false,message:'',error:false};
}
export const walkthroughBlocksSubmit=walk=>!!walk&&!walk.done;
