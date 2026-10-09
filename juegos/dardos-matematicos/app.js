const T={
 es:{title:'🎯 Dardos matemáticos',desc:'Resuelve la operación, ajusta el ángulo y la fuerza, y lanza el dardo a la diana correcta.',back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',solve:'Resuelve:',angle:'↗ Ángulo',power:'💪 Fuerza',points:'Puntos',hits:'Aciertos',throws:'Dardos',lives:'Vidas',launch:'🎯 Lanzar dardo',ready:'¿Preparado?',intro:'Resuelve la operación. Ajusta el ángulo y la fuerza para que el dardo llegue al número correcto. Tienes 10 dardos y 3 vidas.',start:'▶️ Empezar',again:'🔄 Jugar otra vez',instructions:'La línea de puntos muestra la trayectoria aproximada. Un impacto en una diana equivocada también cuenta como fallo.',records:'🏆 Tus récords',bestScore:'Mejor puntuación',bestStreak:'Mejor racha',games:'Partidas',correct:'¡Diana! Respuesta correcta: ',wrongTarget:'Diana equivocada. La respuesta era ',miss:'El dardo no alcanzó ninguna diana. La respuesta era ',finished:'Partida terminada · Puntos: ',hitsOf:' · Aciertos: ',answer:'La respuesta era ',shotsLeft:' dardos restantes',golden:'¡Racha de ',pointsWord:'! +',pointsShort:' puntos',empty:'Ajusta el ángulo y la fuerza para empezar.'},
 en:{title:'🎯 Math darts',desc:'Solve the operation, adjust the angle and power, then throw at the correct target.',back:'← Back',light:'☀️ Light',dark:'🌙 Dark',solve:'Solve:',angle:'↗ Angle',power:'💪 Power',points:'Points',hits:'Hits',throws:'Darts',lives:'Lives',launch:'🎯 Throw dart',ready:'Ready?',intro:'Solve the operation. Adjust the angle and power so the dart reaches the correct number. You have 10 darts and 3 lives.',start:'▶️ Start',again:'🔄 Play again',instructions:'The dotted line shows the approximate path. Hitting the wrong target also counts as a miss.',records:'🏆 Your records',bestScore:'Best score',bestStreak:'Best streak',games:'Games',correct:'Bullseye! Correct answer: ',wrongTarget:'Wrong target. The answer was ',miss:'The dart missed every target. The answer was ',finished:'Game over · Score: ',hitsOf:' · Hits: ',answer:'The answer was ',shotsLeft:' darts left',golden:'Streak of ',pointsWord:'! +',pointsShort:' points',empty:'Adjust the angle and power to get started.'},
 hy:{title:'🎯 Մաթեմատիկական տեգեր',desc:'Լուծիր գործողությունը, կարգավորիր անկյունն ու ուժը և նետիր տեգը ճիշտ թիրախին։',back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',solve:'Լուծիր՝',angle:'↗ Անկյուն',power:'💪 Ուժ',points:'Միավորներ',hits:'Դիպուկ հարվածներ',throws:'Տեգեր',lives:'Կյանքեր',launch:'🎯 Նետել տեգը',ready:'Պատրա՞ստ ես',intro:'Լուծիր գործողությունը։ Կարգավորիր անկյունն ու ուժը, որպեսզի տեգը հասնի ճիշտ թվին։ Ունես 10 նետում և 3 կյանք։',start:'▶️ Սկսել',again:'🔄 Կրկին խաղալ',instructions:'Կետագիծը ցույց է տալիս մոտավոր ուղին։ Սխալ թիրախին հարվածելը նույնպես սխալ է։',records:'🏆 Քո ռեկորդները',bestScore:'Լավագույն միավոր',bestStreak:'Լավագույն շարք',games:'Խաղեր',correct:'Դիպուկ հարված։ Ճիշտ պատասխանն էր՝ ',wrongTarget:'Սխալ թիրախ։ Պատասխանն էր՝ ',miss:'Տեգը չհարվածեց թիրախներին։ Պատասխանն էր՝ ',finished:'Խաղն ավարտվեց · Միավորներ՝ ',hitsOf:' · Դիպուկ հարվածներ՝ ',answer:'Պատասխանն էր՝ ',shotsLeft:' տեգ է մնացել',golden:'Շարք՝ ',pointsWord:'! +',pointsShort:' միավոր',empty:'Սկսելու համար կարգավորիր անկյունն ու ուժը։'}
};

Object.assign(T.es,{desc:'Resuelve la operación, apunta con el ratón y haz clic en la diana correcta.',intro:'Mueve el ratón para apuntar y haz clic para lanzar. En móvil, arrastra el dedo y suelta. Tienes 10 dardos y 3 vidas.',instructions:'Ratón: apunta y haz clic. Móvil: arrastra para apuntar y suelta para lanzar.',empty:'Apunta a la respuesta correcta y lanza.'});
Object.assign(T.en,{desc:'Solve the operation, aim with the mouse and click the correct target.',intro:'Move the mouse to aim and click to throw. On mobile, drag and release. You have 10 darts and 3 lives.',instructions:'Mouse: aim and click. Mobile: drag to aim and release to throw.',empty:'Aim at the correct answer and throw.'});
Object.assign(T.hy,{desc:'Լուծիր գործողությունը, նշան բռնիր մկնիկով և սեղմիր ճիշտ թիրախի վրա։',intro:'Շարժիր մկնիկը՝ նշան բռնելու համար, և սեղմիր՝ նետելու համար։ Հեռախոսով շարժիր մատը և բաց թող։ Ունես 10 տեգ և 3 կյանք։',instructions:'Մկնիկով՝ նշան բռնիր և սեղմիր։ Հեռախոսով՝ շարժիր մատը և բաց թող։',empty:'Նշան բռնիր ճիշտ պատասխանի վրա և նետիր։'});
const $=id=>document.getElementById(id);
const canvas=$('juego'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height,GROUND=354,LAUNCH_X=W/2,LAUNCH_Y=GROUND-48,G=420;
const TARGET_X=[110,260,410,560,710];
const STATS_GAME='dardos-matematicos';
let targets=[],answer=0,expression='',active=false,flying=false,shots=10,lives=3,score=0,hits=0,streak=0,bestRun=0,shot=null,raf=0,nextRoundTimer=0;

function lang(){const x=localStorage.getItem('idioma');return T[x]?x:'es'}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function difficultyQuestion(){
  const op=rand(0,2);
  let a,b;
  if(op===2){a=rand(3,12);b=rand(2,9);expression=`${a} × ${b} = ?`;answer=a*b;return}
  if(op===0){a=rand(8,28);b=rand(4,24);expression=`${a} + ${b} = ?`;answer=a+b;return}
  a=rand(12,35);b=rand(3,a-2);expression=`${a} − ${b} = ?`;answer=a-b;
}
function makeTargets(){
  const nums=new Set([answer]);
  while(nums.size<5){const offset=rand(-12,12);const n=answer+offset;if(n>0&&n!==answer)nums.add(n)}
  const values=[...nums].sort(()=>Math.random()-.5);
  targets=TARGET_X.map((x,i)=>({x,y:218,r:33,n:values[i]}));
  $('operacion').textContent=expression;
}
let aimX=W/2,aimY=218,aimPointer=null;
function speed(){return 5+(218-aimY)/30}
function angle(){return Math.atan((aimX-W/2)/360)}
function landing(a=angle(),v=speed()){return {x:W/2+Math.tan(a)*360,y:218+(5-v)*30}}
function projectileAt(t,a=angle(),v=speed()){
  const p=Math.max(0,Math.min(1,t)),end=landing(a,v);
  return {x:LAUNCH_X+(end.x-LAUNCH_X)*p,y:LAUNCH_Y+(end.y-LAUNCH_Y)*p-65*Math.sin(Math.PI*p)};
}

function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function drawBackground(){
  const light=document.body.classList.contains('claro');
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,light?'#fafafa':'#171717');g.addColorStop(1,light?'#ddd':'#303030');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=light?'#ccc':'#444';ctx.lineWidth=1;
  for(let x=-400;x<W+500;x+=160){ctx.beginPath();ctx.moveTo(W/2,270);ctx.lineTo(x,H);ctx.stroke();}
  ctx.fillStyle=light?'#eee':'#222';ctx.fillRect(0,0,W,275);
  ctx.strokeStyle=light?'#bbb':'#555';ctx.beginPath();ctx.moveTo(0,275);ctx.lineTo(W,275);ctx.stroke();
}

function drawTarget(t,index){
  ctx.save();
  ctx.strokeStyle='#514234';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(t.x,GROUND-2);ctx.lineTo(t.x,t.y+t.r-3);ctx.stroke();
  ctx.strokeStyle='#d5bd8e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(t.x-17,GROUND-2);ctx.lineTo(t.x+17,GROUND-2);ctx.stroke();
  ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(t.x+4,t.y+6,t.r+3,t.r+2,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f4e9d3';ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e4483e';ctx.beginPath();ctx.arc(t.x,t.y,t.r*.78,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f5ead4';ctx.beginPath();ctx.arc(t.x,t.y,t.r*.56,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e4483e';ctx.beginPath();ctx.arc(t.x,t.y,t.r*.34,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffd65b';ctx.beginPath();ctx.arc(t.x,t.y,t.r*.13,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#222';roundRect(ctx,t.x-25,t.y-t.r-29,50,23,7);ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 16px Arial,"Noto Sans Armenian",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(t.n),t.x,t.y-t.r-17);
  ctx.fillStyle='#ffffffaa';ctx.font='bold 10px Arial,sans-serif';ctx.fillText(String(index+1),t.x,t.y+t.r+13);
  ctx.restore();
}
function drawAim(){
  if(flying)return;
  ctx.save();ctx.setLineDash([4,9]);ctx.lineWidth=2;ctx.strokeStyle=document.body.classList.contains('claro')?'#777':'#aaa';ctx.beginPath();
  for(let t=0;t<=1.001;t+=.025){const p=projectileAt(t);if(t===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}
  ctx.stroke();ctx.setLineDash([]);const end=landing();ctx.beginPath();ctx.arc(end.x,end.y,8,0,Math.PI*2);ctx.moveTo(end.x-13,end.y);ctx.lineTo(end.x+13,end.y);ctx.moveTo(end.x,end.y-13);ctx.lineTo(end.x,end.y+13);ctx.stroke();ctx.restore();
}

function drawDart(x,y,vx,vy){
  const rot=Math.atan2(vy,vx);ctx.save();ctx.translate(x,y);ctx.rotate(rot);
  ctx.strokeStyle='#eee2c5';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-19,0);ctx.lineTo(9,0);ctx.stroke();
  ctx.fillStyle='#ffc65a';ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(5,-5);ctx.lineTo(5,5);ctx.closePath();ctx.fill();
  ctx.fillStyle='#f06451';ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(-26,-7);ctx.lineTo(-23,0);ctx.lineTo(-26,7);ctx.closePath();ctx.fill();ctx.restore();
}
function drawLauncher(){
  const progress=shot?shot.elapsed:0;
  const release=shot?Math.sin(Math.min(1,progress/.55)*Math.PI):0;
  const turn=shot?shot.a:angle();
  ctx.save();ctx.translate(W/2,H+25);ctx.rotate(turn*.23);ctx.translate(0,-release*28);
  ctx.shadowColor='#0005';ctx.shadowBlur=14;ctx.shadowOffsetX=7;
  const skin=ctx.createLinearGradient(-42,0,38,-15);
  skin.addColorStop(0,'#8b513b');skin.addColorStop(.2,'#bc805c');skin.addColorStop(.53,'#f0bf94');skin.addColorStop(.8,'#d99d74');skin.addColorStop(1,'#945b40');
  ctx.fillStyle=skin;
  // Tapered forearm flowing into the wrist.
  ctx.beginPath();ctx.moveTo(-51,30);ctx.bezierCurveTo(-46,-10,-26,-57,-22,-90);
  ctx.bezierCurveTo(-18,-107,17,-110,23,-90);ctx.bezierCurveTo(28,-57,48,-8,55,30);ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;
  // Palm and knuckles, with an asymmetric natural grip.
  ctx.beginPath();ctx.moveTo(-22,-83);ctx.bezierCurveTo(-35,-95,-35,-119,-25,-134);
  ctx.bezierCurveTo(-18,-146,9,-145,20,-130);ctx.bezierCurveTo(30,-115,26,-94,19,-84);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#9e674b';ctx.lineWidth=1.4;
  // Three curled fingers unfold slightly during release.
  for(let i=0;i<3;i++){
    ctx.save();ctx.translate(-20+i*13,-123+i*3);ctx.rotate(-.18+release*(i-1)*.23);
    const length=24+release*(18-i*3);
    ctx.fillStyle=skin;roundRect(ctx,-5,-length,13,length+14,6);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#b77f5e';ctx.beginPath();ctx.moveTo(-2,1);ctx.quadraticCurveTo(3,3,6,1);ctx.stroke();ctx.restore();
  }
  // Index finger and thumb pinch the dart shaft.
  ctx.fillStyle=skin;ctx.beginPath();ctx.moveTo(-21,-110);ctx.bezierCurveTo(-31,-128,-22,-155,-12,-155);
  ctx.bezierCurveTo(-3,-155,-5,-145,-11,-140);ctx.lineTo(-9,-115);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(24,-97);ctx.bezierCurveTo(36,-110,29,-123,11,-131);
  ctx.bezierCurveTo(1,-137,-6,-129,1,-122);ctx.lineTo(15,-108);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#edc7ad';ctx.beginPath();ctx.ellipse(4,-127,5,7,-.65,0,Math.PI*2);ctx.fill();
  // Wrist creases and soft reflected highlight.
  ctx.strokeStyle='#af755655';ctx.beginPath();ctx.moveTo(-15,-87);ctx.quadraticCurveTo(0,-82,15,-88);ctx.moveTo(-12,-79);ctx.quadraticCurveTo(0,-75,13,-81);ctx.stroke();
  const sleeve=ctx.createLinearGradient(-55,0,55,0);sleeve.addColorStop(0,'#242424');sleeve.addColorStop(.55,'#656565');sleeve.addColorStop(1,'#292929');
  ctx.fillStyle=sleeve;ctx.beginPath();ctx.moveTo(-48,-6);ctx.quadraticCurveTo(0,5,48,-6);ctx.lineTo(64,40);ctx.lineTo(-64,40);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#888';ctx.beginPath();ctx.moveTo(-45,-2);ctx.quadraticCurveTo(0,8,46,-2);ctx.stroke();ctx.restore();
  if(!shot)drawDart(LAUNCH_X,LAUNCH_Y,Math.sin(turn)*.4,-1);
}
function draw(){
  drawBackground();targets.forEach(drawTarget);drawAim();drawLauncher();
  if(shot){const p=projectileAt(shot.elapsed,shot.a,shot.v),q=projectileAt(Math.min(1,shot.elapsed+.01),shot.a,shot.v);
    ctx.save();ctx.translate(p.x,p.y);const scale=1.2-.65*Math.min(1,shot.elapsed);ctx.scale(scale,scale);drawDart(0,0,q.x-p.x,q.y-p.y||-1);ctx.restore();}
}

function pointAt(e){
  const rect=canvas.getBoundingClientRect();
  aimX=Math.max(0,Math.min(W,(e.clientX-rect.left)*W/rect.width));
  aimY=Math.max(0,Math.min(H,(e.clientY-rect.top)*H/rect.height));draw();
}
canvas.addEventListener('pointerdown',e=>{
  if(!active||flying||$('botonLanzar').disabled||e.button!==0||aimPointer!==null)return;
  e.preventDefault();aimPointer=e.pointerId;canvas.setPointerCapture(e.pointerId);pointAt(e);
});
canvas.addEventListener('pointermove',e=>{
  if(!active||flying||$('botonLanzar').disabled)return;
  if(e.pointerType==='mouse'||e.pointerId===aimPointer)pointAt(e);
});
canvas.addEventListener('pointerup',e=>{
  if(e.pointerId!==aimPointer)return;
  e.preventDefault();aimPointer=null;
  const rect=canvas.getBoundingClientRect();
  if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)return;
  pointAt(e);throwDart();
});
canvas.addEventListener('pointercancel',()=>{aimPointer=null});
canvas.addEventListener('lostpointercapture',()=>{aimPointer=null});
canvas.addEventListener('keydown',e=>{
  if(!active||flying||$('botonLanzar').disabled)return;
  const moves={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]};
  if(moves[e.key]){e.preventDefault();aimX=Math.max(0,Math.min(W,aimX+moves[e.key][0]));aimY=Math.max(0,Math.min(H,aimY+moves[e.key][1]));draw();}
  else if(e.key==='Enter'||e.key===' '){e.preventDefault();throwDart();}
});
function stats(){const rows=MiWeb.readExtraStats(STATS_GAME),id=MiWeb.profile().id;return rows[id]||{mejorPuntuacion:0,mejorRacha:0,partidas:0}}
function showStats(){const s=stats();$('mejorPuntuacion').textContent=s.mejorPuntuacion||0;$('mejorRacha').textContent=s.mejorRacha||0;$('partidas').textContent=s.partidas||0}
function saveStats(){
  MiWeb.updateExtraStats(STATS_GAME,old=>({...old,mejorPuntuacion:Math.max(old.mejorPuntuacion||0,score),mejorRacha:Math.max(old.mejorRacha||0,bestRun),partidas:(old.partidas||0)+1}));showStats();
}
function updateHud(){ $('puntos').textContent=score;$('aciertos').textContent=hits;$('lanzamientos').textContent=shots;$('vidas').textContent='❤️'.repeat(lives)||'0'; }
function newRound(){difficultyQuestion();makeTargets();draw();if(active)$('botonLanzar').disabled=false;}
function startGame(){
  clearTimeout(nextRoundTimer);cancelAnimationFrame(raf);active=true;flying=false;shots=10;lives=3;score=0;hits=0;streak=0;bestRun=0;shot=null;newRound();updateHud();
  $('overlay').classList.add('oculto');$('botonLanzar').disabled=false;$('mensaje').textContent=T[lang()].empty;
}
function finishGame(){
  if(!active)return;active=false;flying=false;shot=null;cancelAnimationFrame(raf);saveStats();MiWeb.xpAction('game_finish');
  $('botonLanzar').disabled=true;$('overlay').classList.remove('oculto');$('overlayTitulo').textContent=T[lang()].finished+score;$('overlayTexto').textContent=T[lang()].hitsOf+hits+' / 10';$('botonInicio').textContent=T[lang()].again;$('mensaje').textContent=T[lang()].finished+score;draw();
}
function finishThrow(target){
  if(!active||!flying)return;flying=false;shot=null;shots--;
  if(target&&target.n===answer){hits++;streak++;bestRun=Math.max(bestRun,streak);const gained=10+Math.min(20,(streak-1)*2);score+=gained;MiWeb.xpAction('correct');$('mensaje').textContent=T[lang()].correct+answer+(streak>=3?` · ${T[lang()].golden}${streak}${T[lang()].pointsWord}${gained}${T[lang()].pointsShort}`:` · +${gained}${T[lang()].pointsShort}`)}
  else{lives--;streak=0;MiWeb.xpAction('wrong');$('mensaje').textContent=(target?T[lang()].wrongTarget:T[lang()].miss)+answer}
  updateHud();draw();
  if(shots<=0||lives<=0){nextRoundTimer=setTimeout(finishGame,850);return}
  nextRoundTimer=setTimeout(()=>{newRound();if(active)$('mensaje').textContent=T[lang()].empty},950);
}
function throwDart(){
  if(!active||flying||$('botonLanzar').disabled)return;
  flying=true;$('botonLanzar').disabled=true;
  shot={elapsed:0,a:angle(),v:speed()};let last=performance.now();
  const frame=now=>{
    if(!flying||!shot)return;
    shot.elapsed=Math.min(1,shot.elapsed+Math.min(.05,(now-last)/1000)/.8);last=now;draw();
    if(shot.elapsed>=1){
      const end=landing(shot.a,shot.v),target=targets.find(t=>Math.hypot(end.x-t.x,end.y-t.y)<=t.r);
      finishThrow(target||null);return;
    }
    raf=requestAnimationFrame(frame);
  };raf=requestAnimationFrame(frame);
}

function renderText(){
  const l=lang(),t=T[l];document.body.classList.toggle('claro',localStorage.getItem('tema')==='claro');document.documentElement.lang=l;document.title=t.title.replace(/^🎯 /,'')+' - MI WEB';MiWeb.applyLanguage();
  $('titulo').textContent=t.title;$('descripcion').textContent=t.desc;$('volver').textContent=t.back;$('etiquetaOperacion').textContent=t.solve;
  $('textoPuntos').textContent=t.points;$('textoAciertos').textContent=t.hits;$('textoLanzamientos').textContent=t.throws;$('textoVidas').textContent=t.lives;$('botonLanzar').textContent=t.launch;
  $('overlayTitulo').textContent=active?'':t.ready;$('overlayTexto').textContent=t.intro;$('botonInicio').textContent=active?t.start:(hits||score?t.again:t.start);
  $('instrucciones').textContent=t.instructions;$('tituloRecords').textContent=t.records;$('textoMejorPuntuacion').textContent=t.bestScore;$('textoMejorRacha').textContent=t.bestStreak;$('textoPartidas').textContent=t.games;
  $('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';$('botonIdioma').setAttribute('aria-expanded',$('menuIdiomas').style.display==='block');$('botonTema').textContent=localStorage.getItem('tema')==='claro'?t.dark:t.light;
  if(!active)$('mensaje').textContent=t.empty;showStats();MiWeb.refreshRanking(STATS_GAME);draw();
}
function menuToggle(force){const open=force??$('menuIdiomas').style.display!=='block';$('menuIdiomas').style.display=open?'block':'none';$('botonIdioma').setAttribute('aria-expanded',String(open))}


$('botonLanzar').addEventListener('click',throwDart);$('botonInicio').addEventListener('click',startGame);
$('botonIdioma').addEventListener('click',()=>menuToggle());$('menuIdiomas').addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(!b)return;localStorage.setItem('idioma',b.dataset.lang);menuToggle(false);renderText()});
$('botonTema').addEventListener('click',()=>{localStorage.setItem('tema',localStorage.getItem('tema')==='claro'?'oscuro':'claro');renderText()});
document.addEventListener('click',e=>{if(!e.target.closest('.menu-idioma'))menuToggle(false)});
MiWeb.mountRanking({game:STATS_GAME,columns:[{key:'mejorPuntuacion',label:{es:'Mejor puntuación',en:'Best score',hy:'Լավագույն միավոր'}},{key:'mejorRacha',label:{es:'Mejor racha',en:'Best streak',hy:'Լավագույն շարք'}},{key:'partidas',label:{es:'Partidas',en:'Games',hy:'Խաղեր'}}],compare:(a,b)=>(b.mejorPuntuacion||0)-(a.mejorPuntuacion||0)||(b.mejorRacha||0)-(a.mejorRacha||0)||(b.partidas||0)-(a.partidas||0)});
updateHud();showStats();renderText();
