/* shared helpers for the per-project identity scripts (no dependencies) */
(function(){'use strict';
var d=document,R=d.documentElement;
var FX=window.FX={
 reduce:!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches),
 $:function(s,c){return(c||d).querySelector(s)},
 $$:function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))},
 mouse:{x:-1e3,y:-1e3,px:.5,py:.5},
 /* add .rv and reveal on scroll */
 reveal:function(sel,cls){cls=cls||'in';var els=FX.$$(sel);els.forEach(function(e){e.classList.add('rv')});
  if(FX.reduce||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add(cls)});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add(cls);io.unobserve(x.target)}})},{rootMargin:'0px 0px -6% 0px'});els.forEach(function(e,i){e.style.setProperty('--i',i%6);io.observe(e)})},
 /* canvas loop: sizes to its box, pauses offscreen / hidden tab; draw(ctx,w,h,t,dt,m) with m = mouse in canvas px */
 loop:function(cv,draw,o){o=o||{};var ctx=cv.getContext('2d'),w=0,h=0,dpr=1,raf=0,on=false,vis=true,last=0,t0=performance.now(),m={x:-1e3,y:-1e3,in:false};
  function size(){var r=cv.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(o.dpr||2,window.devicePixelRatio||1);cv.width=Math.max(1,Math.round(w*dpr));cv.height=Math.max(1,Math.round(h*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);if(o.resize)o.resize(w,h)}
  function fr(now){if(!on)return;var t=(now-t0)/1000,dt=Math.min(.05,(now-last)/1000||.016);last=now;ctx.setTransform(dpr,0,0,dpr,0,0);draw(ctx,w,h,t,dt,m);raf=requestAnimationFrame(fr)}
  function go(){if(on||FX.reduce||d.hidden||!vis)return;on=true;last=performance.now();raf=requestAnimationFrame(fr)}
  function stop(){on=false;cancelAnimationFrame(raf)}
  size();addEventListener('resize',function(){size();if(!on){ctx.setTransform(dpr,0,0,dpr,0,0);draw(ctx,w,h,0,0,m)}});
  var host=o.host||cv.parentElement;host.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();m.x=e.clientX-r.left;m.y=e.clientY-r.top;m.in=true},{passive:true});host.addEventListener('pointerleave',function(){m.in=false;m.x=m.y=-1e3});
  if(FX.reduce){draw(ctx,w,h,o.still||2,0,m)}else{
   if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;vis?go():stop()},{threshold:0}).observe(cv);else go();
   d.addEventListener('visibilitychange',function(){d.hidden?stop():go()});draw(ctx,w,h,0,0,m)}
  return{size:size,draw:function(){draw(ctx,w,h,(performance.now()-t0)/1000,0,m)},ctx:ctx};},
 /* create an absolutely positioned canvas as the first child of host */
 layer:function(host,cls){var cv=d.createElement('canvas');cv.className='fx '+(cls||'');cv.setAttribute('aria-hidden','true');cv.setAttribute('role','presentation');if(getComputedStyle(host).position==='static')host.style.position='relative';host.insertBefore(cv,host.firstChild);return cv},
 css:function(n){return getComputedStyle(R).getPropertyValue(n).trim()},
 rnd:function(a,b){return a+Math.random()*(b-a)},
 theme:function(){return R.getAttribute('data-theme')==='dark'?'dark':'light'}
};
addEventListener('pointermove',function(e){FX.mouse.x=e.clientX;FX.mouse.y=e.clientY;FX.mouse.px=e.clientX/innerWidth;FX.mouse.py=e.clientY/innerHeight},{passive:true});
R.classList.add('fxjs');
})();

(function(){var hero=FX.$('.hero');if(!hero)return;var cv=FX.layer(hero),E=[],S=[],R=[],tick=0;
function glow(t){return t>.75?'255,244,207':t>.5?'255,176,32':t>.25?'255,90,20':'150,30,8'}
function spawnEmber(w,h,fromBottom){E.push({x:Math.random()*w,y:fromBottom?h+10:Math.random()*h,vy:FX.rnd(14,60),ph:Math.random()*6,r:FX.rnd(.8,2.6),l:1,d:FX.rnd(.06,.16)})}
function strike(x,y,n){R.push({x:x,y:y,r:4,a:1});for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,s=FX.rnd(80,420);S.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-120,l:1,d:FX.rnd(.8,1.8)})}}
var lp=FX.loop(cv,function(c,w,h,t,dt,m){c.clearRect(0,0,w,h);
 if(E.length<(w<600?40:90)&&Math.random()<.6)spawnEmber(w,h,true);
 c.globalCompositeOperation='lighter';
 for(var i=E.length-1;i>=0;i--){var e=E[i];e.y-=e.vy*dt;e.x+=Math.sin(t*1.4+e.ph)*14*dt;e.l-=e.d*dt;if(m.in){var dx=e.x-m.x,dy=e.y-m.y,q=dx*dx+dy*dy;if(q<14000){var f=(1-q/14000)*220*dt;e.x+=dx/Math.sqrt(q+1)*f;e.y+=dy/Math.sqrt(q+1)*f}}
  if(e.l<=0||e.y<-10){E.splice(i,1);continue}c.fillStyle='rgba('+glow(e.l)+','+(.15+e.l*.7)+')';c.beginPath();c.arc(e.x,e.y,e.r*(.6+e.l*.6),0,6.3);c.fill()}
 for(i=S.length-1;i>=0;i--){var s=S[i];s.vy+=520*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vx*=.985;s.l-=s.d*dt;if(s.l<=0){S.splice(i,1);continue}c.strokeStyle='rgba('+glow(s.l)+','+s.l+')';c.lineWidth=1.6;c.beginPath();c.moveTo(s.x,s.y);c.lineTo(s.x-s.vx*.03,s.y-s.vy*.03);c.stroke()}
 for(i=R.length-1;i>=0;i--){var r=R[i];r.r+=520*dt;r.a-=1.9*dt;if(r.a<=0){R.splice(i,1);continue}c.strokeStyle='rgba(255,176,32,'+r.a+')';c.lineWidth=2+r.a*3;c.beginPath();c.arc(r.x,r.y,r.r,0,6.3);c.stroke()}
 c.globalCompositeOperation='source-over';
 tick+=dt;if(tick>5.5){tick=0;var an=FX.$('.anvil',hero),b=cv.getBoundingClientRect();if(an){var q=an.getBoundingClientRect();strike(q.left-b.left+q.width*.5,q.top-b.top+q.height*.35,50)}}
},{resize:function(w,h){E.length=0;for(var i=0;i<(w<600?30:70);i++)spawnEmber(w,h,false)}});
hero.addEventListener('pointerdown',function(e){if(e.target.closest('a,button,input,code'))return;var b=cv.getBoundingClientRect();strike(e.clientX-b.left,e.clientY-b.top,70)});
FX.$$('.sk,.cat,.sv,.packg,.lintg').forEach(function(el){el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px')})});
})();
