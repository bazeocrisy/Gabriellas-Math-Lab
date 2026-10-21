// Original problems aligned to Chapter 4. All arithmetic uses integer hundredths.
(function(G){
'use strict';
const E=G.engine,K=G.kit,M=G.models,lessons=G.chapter4Curriculum.lessons;
const f=n=>G.D.canonical(G.D.fromThousandths(n*10,2));
const grid=n=>`<div class="c4-models">${Array.from({length:Math.max(1,Math.ceil(n/100))},(_,i)=>M.grid(Math.max(0,Math.min(100,n-i*100)))).join('')}</div>`;
const operands=(a,b,op)=>`<div class="c4-operands"><figure>${grid(a)}<figcaption>${f(a)}</figcaption></figure><b>${op}</b><figure>${grid(b)}<figcaption>${f(b)}</figcaption></figure></div><p class="fine">Each full grid is 1; each square is 0.01. ${op==='+'?'Combine the amounts.':'Remove the second amount from the first.'}</p>`;
function line(a,b){const end=Math.ceil(Math.max(a,b)/100)*1000;return M.line({from:0,to:end,points:[{v:a*10,label:''},{v:b*10,label:''}],label:`Number line from 0 to ${end/1000}, with points at ${f(b)} and ${f(a)}. Find their distance.`})+`<p>Left point: ${f(b)}. Right point: ${f(a)}. Find the distance between them.</p>`;}

const kinds=['calculate','visual','word','reason','error','multi'];
function task(n,kind,level,r){
 const sub=(n===1||n===8)?r.int(0,1)===1:n>=5&&n<=7,op=sub?'−':'+';
 let a=r.int(12,level===1?89:level===2?399:3999),b=r.int(11,level===1?79:level===2?299:2999);
 if([2,3,5,6].includes(n)){a=r.int(21,99);b=r.int(11,89);}
 if([2,5].includes(n)&&level===1){a=r.int(3,9)*10;b=r.int(1,8)*10;}
 if(n===3){a=level===1?r.int(2,5)*10:level===2?r.int(6,9)*10:r.int(11,19)*10;b=level===1?r.int(11,39):r.int(41,89);}
 if(sub&&a<b)[a,b]=[b,a]; if(sub&&a===b)b-=10;
 if(n===6){a=(level===3?r.int(11,19):r.int(5,9))*10;b=level===1?r.int(1,4)*10:r.int(1,4)*10+r.int(1,9);}
 if([2,5].includes(n)&&level===3)a+=100;
 if([4,7,8].includes(n)&&kind==='calculate'){a=r.int(3,level===1?9:59)*100;if(!sub)a+=r.int(1,9)*10;b=r.int(11,Math.min(a-1,399));}
 const v=sub?a-b:a+b,eq=`${f(a)} ${op} ${f(b)}`;
 const q={type:'number',answer:f(v),answerText:f(v),prompt:`Find ${eq}.`,sig:`${n}:${kind}:${level}:${a}:${b}:${op}`,meta:{n,kind,level,a,b,op,value:v},
 hints:['Decide whether to combine amounts or find a difference. Keep each place value in its own column.','Line up decimal points. Write trailing zeros if needed. One tenth is ten hundredths.',sub?'Exchange a unit from the place to the left if a column has too few units. Subtract from right to left and add back to check.':'Combine like units. Exchange ten hundredths for one tenth, and ten tenths for one whole when needed.'],
 why:`${eq} = ${f(v)}. ${sub?`Check: ${f(b)} + ${f(v)} = ${f(a)}.`:`In hundredths: ${a} + ${b} = ${v}.`}`,
 solution:K.columnSolution([f(a),f(b)],op),
 diagnose(resp){if(G.D.equal(resp,sub?K.noBorrowSub(f(a),f(b)):K.noCarryAdd(f(a),f(b))))return 'Check regrouping. Subtracting the smaller digit from the larger in each column, or leaving out a carried unit, changes the value.';if(G.D.equal(resp,K.misaligned(f(a),f(b),op)))return 'Line up decimal points, not the last digits. Use zeros to hold empty places.';return 'Check the operation and each exchange. A tenth is ten hundredths.';}};
 const mc=(answer,correct,wrongs)=>{q.type='mc';q.answer=answer;q.answerText=correct;q.choices=K.textChoices(r,correct,wrongs).map(c=>({value:c.value===correct?answer:c.value,text:c.text}));};
 if(n===1){
  const unit=level===1?100:10,ra=Math.floor((a+unit/2)/unit)*unit,rb=Math.floor((b+unit/2)/unit)*unit,est=sub?ra-rb:ra+rb;
  Object.assign(q.meta,{unit,ra,rb,value:est});q.answer=f(est);q.answerText=q.answer;
  q.prompt=`Estimate ${eq} by rounding EACH number to the nearest ${unit===100?'whole number':'tenth'} first.`;
  q.hints=['This asks for an estimate. Round each operand before calculating.','Look at the digit just to the right of the rounding place. A digit 5 or greater rounds up.','Use the operation shown on the rounded numbers. Do not round the exact result instead.'];
  q.why=`${f(a)} rounds to ${f(ra)}; ${f(b)} rounds to ${f(rb)}. ${f(ra)} ${op} ${f(rb)} = ${f(est)}. An estimate checks size; it need not equal the exact answer.`;
  q.solution=`<ol class="sol-steps"><li>Round each operand separately.</li><li>${f(a)} → ${f(ra)}; ${f(b)} → ${f(rb)}.</li><li>${f(ra)} ${op} ${f(rb)} = ${f(est)}.</li></ol>`;
  q.diagnose=()=> 'Round each operand first, then calculate. Rounding only the exact result can give a different estimate.';
  if(kind==='visual')q.visual=M.line({from:Math.floor(a/100)*1000,to:(Math.floor(a/100)+1)*1000,point:a*10,pointLabel:f(a),mid:true,label:`Number line showing ${f(a)} between neighboring whole numbers.`});
  if(kind==='word')q.prompt=`A trail is ${f(a)} km long. ${sub?`${f(b)} km has been walked. Estimate the distance remaining`:`Another section is ${f(b)} km long. Estimate the combined length`} by rounding EACH length to the nearest ${unit===100?'whole number':'tenth'} first.`;
  if(kind==='reason'||kind==='error'){q.prompt=`Which method follows “estimate ${eq} by rounding each operand to the nearest ${unit===100?'whole number':'tenth'}”?`;mc('round','Round each operand first, then calculate.',['Calculate exactly, then round only the result.','Remove the decimal points, then calculate.']);}
  if(kind==='multi'){q.prompt=`Which explanation helps judge whether an answer to ${eq} is reasonable?`;mc('check','Use nearby compatible numbers to check the size, then compute exactly if needed.',['Every estimate must equal the exact answer.','Ignore place value when checking the size.']);q.why='Compatible numbers are nearby numbers that are easy to combine or subtract mentally. Estimates check reasonableness; exact calculation gives the precise amount.';q.solution='<ol class="sol-steps"><li>Choose nearby easy numbers.</li><li>Calculate mentally and compare the size to the proposed result.</li></ol>';}
 }else{
  if(kind==='visual')q.visual=n===5&&level>1?line(a,b):[2,3,5,6].includes(n)?operands(a,b,op):M.vertical([f(a),f(b)],op,{pad:true});
  if(kind==='word')q.prompt=sub?`A ribbon is ${f(a)} m long. ${f(b)} m is cut off. How many meters remain?`:`Nia walks ${f(a)} km, then ${f(b)} km. How many kilometers does she walk altogether?`;
  if(kind==='reason'){
   const correct=n===4?'Decompose into like place values, add the partial sums, then combine them.':n===7?`Subtract the whole-number part of ${f(b)}, then its decimal part; add back to check.`:n===8?(sub?`Count up from ${f(b)} to ${f(a)}; the total distance is the difference.`:'Decompose the addends by place value and combine partial sums.'):sub?'Rename one tenth as ten hundredths when needed, then remove the second amount.':'Combine hundredths; exchange 100 hundredths for one whole when needed.';
   q.prompt=`Which explanation correctly describes a strategy for ${eq}?`;mc('valid',correct,[sub?'Subtract the smaller digit from the larger in every column.':'Add digits without exchanging when a place totals ten or more.','Align final digits even if decimal points do not line up.']);q.why=`${correct} ${q.why}`;
  }
  if(kind==='error'){
   const base=f(a),padded=base.includes('.')?base+'0':base+'.00';q.prompt=`A student says ${base} and ${padded} have different values. Which explanation corrects this mistake?`;
   mc('place','Trailing zeros preserve the amount because the existing digits stay in the same places.',['A trailing zero always multiplies a decimal by ten.','The number with more digits is always larger.']);q.why=`${base} = ${padded}. A tenth is ten hundredths; trailing zeros do not change the quantity.`;q.solution=`<ol class="sol-steps"><li>Zeros on the right do not move existing digits.</li><li>${q.why}</li></ol>`;
  }
  if(kind==='multi'){
   const c=r.int(1,Math.max(1,Math.min(39,v))),result=v-c;
   Object.assign(q.meta,{c,value:sub?result:c});q.answer=f(sub?result:c);q.answerText=q.answer;
   q.prompt=sub?`A bottle holds ${f(a)} L. First ${f(b)} L is used, then ${f(c)} L more is used. How many liters remain?`:`A runner travels ${f(a)} km, then ${f(b)} km. Her goal is ${f(a+b+c)} km. How many more kilometers must she travel?`;
   q.why=sub?`First ${eq} = ${f(v)}. Then ${f(v)} − ${f(c)} = ${f(result)} L.`:`First ${eq} = ${f(v)}. Then ${f(a+b+c)} − ${f(v)} = ${f(c)} km.`;
   q.solution=`<ol class="sol-steps"><li>Write an equation for each of the two steps.</li><li>${eq} = ${f(v)}.</li><li>${q.why}</li></ol>`;
   if([2,3].includes(n)){q.meta.value=a+b+c;q.answer=f(a+b+c);q.answerText=q.answer;q.prompt=`Three ribbons measure ${f(a)} m, ${f(b)} m and ${f(c)} m. What is their total length?`;q.why=`First ${eq} = ${f(v)}. Then ${f(v)} + ${f(c)} = ${f(a+b+c)} m.`;q.solution=`<ol class="sol-steps"><li>Add the first two amounts in hundredths.</li><li>${eq} = ${f(v)}.</li><li>${q.why}</li></ol>`;}
   q.hints=['Find what is known and what must be found. This problem has two steps.','First find the combined distance or the amount left after the first use.',[2,3].includes(n)?'Combine the first two lengths, then add the third length. Keep the same units.':'Subtract the amount already traveled from the goal, or remove the second amount used. Check units.'];
  }
 }
 if(q.type==='mc')q.diagnose=()=> 'Read each explanation carefully. Check whether it preserves place value and matches the operation.';
 return q;
}
lessons.forEach((l,i)=>{const templates=[];for(let level=1;level<=3;level++)for(const kind of kinds)templates.push({id:`${kind}-${level}`,skill:l.id+':'+kind,make:r=>task(i+1,kind,level,r)});E.register({lessonId:l.id,skills:Object.fromEntries(kinds.map(k=>[l.id+':'+k,k])),templates});});
function build(id,mode,serial,level=2,avoid=[]){
 const ids=id==='final'||id==='review'?lessons.map(l=>l.id):[id],count=id==='final'?25:id==='review'?24:10,r=E.rng(serial),used=new Set(avoid),out=[];
 for(let i=0;i<count;i++){
  const lid=ids.length>1&&i===24?'4-8':ids[i%ids.length];const blueprints=[['calculate','reason','word'],['visual','calculate','reason'],['visual','word','calculate'],['calculate','reason','multi'],['visual','word','calculate'],['visual','calculate','reason'],['calculate','reason','word'],['reason','word','multi']];const kind=ids.length>1?(i===24?'multi':blueprints[i%8][Math.floor(i/8)]):kinds[i%kinds.length];let q,x;
  for(let tries=0;tries<1000;tries++){const lv=mode==='practice'?level:1+(i%3);x={lesson:lid,id:`${kind}-${lv}`,seed:r.int(1,2147483646)};q=E.make(lid,x.id,x.seed);if(!used.has(q.sig))break;}
  if(used.has(q.sig))throw new Error('Unable to create fresh questions');used.add(q.sig);out.push({...x,sig:q.sig});
 }
 return r.shuffle(out);
}
G.chapter4={lessons,kinds,f,grid,operands,line,build,make:x=>E.make(x.lesson,x.id,x.seed)};
})(window.GML=window.GML||{});
