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
