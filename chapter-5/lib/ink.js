export function paint(svg, strokes) {
  svg.replaceChildren();
  for (const stroke of strokes) {
    if (!stroke.length) continue;
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    const pts=stroke.map(([x,y])=>[x*612,y*792]);
    let d=pts.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' ');
    if (pts.length===1) d+=` l0.01 0.01`;
    p.setAttribute('d',d); p.setAttribute('fill','none');p.setAttribute('stroke','#154eb2');p.setAttribute('stroke-width','1.9');p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round');svg.append(p);
  }
}
// Fractions of the page, rounded to 4 decimals (0.03 px on a 816 px page) to keep saved handwriting small.
const r4 = (n) => Math.round(Math.max(0, Math.min(1, n)) * 1e4) / 1e4;
export function point(e, el) { const r=el.getBoundingClientRect();return [r4((e.clientX-r.left)/r.width),r4((e.clientY-r.top)/r.height)]; }
export function hit(stroke, [x,y], radius=.014) {
  // Segment distance also erases sparsely sampled strokes.
  for(let i=0;i<stroke.length;i++) {
    const a=stroke[i],b=stroke[Math.max(0,i-1)],dx=b[0]-a[0],dy=(b[1]-a[1])*792/612;
    const px=x-a[0],py=(y-a[1])*792/612,t=Math.max(0,Math.min(1,(px*dx+py*dy)/(dx*dx+dy*dy||1)));
    if(Math.hypot(px-t*dx,py-t*dy)<radius)return true;
  } return false;
}
