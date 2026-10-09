const T={
 es:{title:'🎯 Dardos matemáticos',desc:'Resuelve la operación, ajusta el ángulo y la fuerza, y lanza el dardo a la diana correcta.',back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',solve:'Resuelve:',angle:'↗ Ángulo',power:'💪 Fuerza',points:'Puntos',hits:'Aciertos',throws:'Dardos',lives:'Vidas',launch:'🎯 Lanzar dardo',ready:'¿Preparado?',intro:'Resuelve la operación. Ajusta el ángulo y la fuerza para que el dardo llegue al número correcto. Tienes 10 dardos y 3 vidas.',start:'▶️ Empezar',again:'🔄 Jugar otra vez',instructions:'La línea de puntos muestra la trayectoria aproximada. Un impacto en una diana equivocada también cuenta como fallo.',records:'🏆 Tus récords',bestScore:'Mejor puntuación',bestStreak:'Mejor racha',games:'Partidas',correct:'¡Diana! Respuesta correcta: ',wrongTarget:'Diana equivocada. La respuesta era ',miss:'El dardo no alcanzó ninguna diana. La respuesta era ',finished:'Partida terminada · Puntos: ',hitsOf:' · Aciertos: ',answer:'La respuesta era ',shotsLeft:' dardos restantes',golden:'¡Racha de ',pointsWord:'! +',pointsShort:' puntos',empty:'Ajusta el ángulo y la fuerza para empezar.'},
 en:{title:'🎯 Math darts',desc:'Solve the operation, adjust the angle and power, then throw at the correct target.',back:'← Back',light:'☀️ Light',dark:'🌙 Dark',solve:'Solve:',angle:'↗ Angle',power:'💪 Power',points:'Points',hits:'Hits',throws:'Darts',lives:'Lives',launch:'🎯 Throw dart',ready:'Ready?',intro:'Solve the operation. Adjust the angle and power so the dart reaches the correct number. You have 10 darts and 3 lives.',start:'▶️ Start',again:'🔄 Play again',instructions:'The dotted line shows the approximate path. Hitting the wrong target also counts as a miss.',records:'🏆 Your records',bestScore:'Best score',bestStreak:'Best streak',games:'Games',correct:'Bullseye! Correct answer: ',wrongTarget:'Wrong target. The answer was ',miss:'The dart missed every target. The answer was ',finished:'Game over · Score: ',hitsOf:' · Hits: ',answer:'The answer was ',shotsLeft:' darts left',golden:'Streak of ',pointsWord:'! +',pointsShort:' points',empty:'Adjust the angle and power to get started.'},
 hy:{title:'🎯 Մաթեմատիկական տեգեր',desc:'Լուծիր գործողությունը, կարգավորիր անկյունն ու ուժը և նետիր տեգը ճիշտ թիրախին։',back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',solve:'Լուծիր՝',angle:'↗ Անկյուն',power:'💪 Ուժ',points:'Միավորներ',hits:'Դիպուկ հարվածներ',throws:'Տեգեր',lives:'Կյանքեր',launch:'🎯 Նետել տեգը',ready:'Պատրա՞ստ ես',intro:'Լուծիր գործողությունը։ Կարգավորիր անկյունն ու ուժը, որպեսզի տեգը հասնի ճիշտ թվին։ Ունես 10 նետում և 3 կյանք։',start:'▶️ Սկսել',again:'🔄 Կրկին խաղալ',instructions:'Կետագիծը ցույց է տալիս մոտավոր ուղին։ Սխալ թիրախին հարվածելը նույնպես սխալ է։',records:'🏆 Քո ռեկորդները',bestScore:'Լավագույն միավոր',bestStreak:'Լավագույն շարք',games:'Խաղեր',correct:'Դիպուկ հարված։ Ճիշտ պատասխանն էր՝ ',wrongTarget:'Սխալ թիրախ։ Պատասխանն էր՝ ',miss:'Տեգը չհարվածեց թիրախներին։ Պատասխանն էր՝ ',finished:'Խաղն ավարտվեց · Միավորներ՝ ',hitsOf:' · Դիպուկ հարվածներ՝ ',answer:'Պատասխանն էր՝ ',shotsLeft:' տեգ է մնացել',golden:'Շարք՝ ',pointsWord:'! +',pointsShort:' միավոր',empty:'Սկսելու համար կարգավորիր անկյունն ու ուժը։'}
};

const $=id=>document.getElementById(id);
const canvas=$('juego'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height,GROUND=354,LAUNCH_X=W/2,LAUNCH_Y=GROUND-14,G=420;
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
function speed(){return Number($('fuerza').value)}
function angle(){return Number($('angulo').value)*Math.PI/180}
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
  // Perspective arm: shaded forearm, wrist, palm and curled fingers.
  const p=shot?Math.min(1,shot.elapsed):0;
  const thrust=shot?Math.sin(Math.min(1,p/.3)*Math.PI)*25:0;
  ctx.save();ctx.translate(W/2,H+18);ctx.rotate((shot?shot.a:angle())*.35);
  ctx.shadowColor='#0006';ctx.shadowBlur=12;ctx.shadowOffsetX=8;
  const skin=ctx.createLinearGradient(-40,0,38,0);
  skin.addColorStop(0,'#895139');skin.addColorStop(.35,'#d79b74');skin.addColorStop(.65,'#f2c49c');skin.addColorStop(1,'#a26748');
  ctx.fillStyle=skin;ctx.beginPath();ctx.moveTo(-47,20);ctx.lineTo(-22,-78-thrust);ctx.quadraticCurveTo(-20,-100-thrust,4,-99-thrust);ctx.quadraticCurveTo(24,-96-thrust,25,-75-thrust);ctx.lineTo(54,20);ctx.closePath();ctx.fill();
  ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(0,-94-thrust,25,32,-.12,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.strokeStyle='#9b6449';ctx.lineWidth=2;
  for(let i=0;i<4;i++){ctx.fillStyle=skin;roundRect(ctx,-20+i*10,-119-thrust,12,27,6);ctx.fill();ctx.stroke();}
  ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(21,-94-thrust,11,22,.6,0,Math.PI*2);ctx.fill();ctx.stroke();
  const sleeve=ctx.createLinearGradient(-50,0,50,0);sleeve.addColorStop(0,'#222');sleeve.addColorStop(.5,'#666');sleeve.addColorStop(1,'#292929');ctx.fillStyle=sleeve;
  ctx.beginPath();ctx.moveTo(-48,-5);ctx.lineTo(49,-5);ctx.lineTo(63,35);ctx.lineTo(-62,35);ctx.closePath();ctx.fill();ctx.restore();
  if(!shot)drawDart(LAUNCH_X,LAUNCH_Y-20,Math.sin(angle()),-1);
}
function draw(){
  drawBackground();targets.forEach(drawTarget);drawAim();drawLauncher();
  if(shot){const p=projectileAt(shot.elapsed,shot.a,shot.v),q=projectileAt(Math.min(1,shot.elapsed+.01),shot.a,shot.v);
    ctx.save();ctx.translate(p.x,p.y);const scale=1.2-.65*Math.min(1,shot.elapsed);ctx.scale(scale,scale);drawDart(0,0,q.x-p.x,q.y-p.y||-1);ctx.restore();}
}

function updateControls(){
  $('valorAngulo').textContent=$('angulo').value+'°';$('valorFuerza').textContent=$('fuerza').value;draw();
}

function stats(){const rows=MiWeb.readExtraStats(STATS_GAME),id=MiWeb.profile().id;return rows[id]||{mejorPuntuacion:0,mejorRacha:0,partidas:0}}
function showStats(){const s=stats();$('mejorPuntuacion').textContent=s.mejorPuntuacion||0;$('mejorRacha').textContent=s.mejorRacha||0;$('partidas').textContent=s.partidas||0}
function saveStats(){
  MiWeb.updateExtraStats(STATS_GAME,old=>({...old,mejorPuntuacion:Math.max(old.mejorPuntuacion||0,score),mejorRacha:Math.max(old.mejorRacha||0,bestRun),partidas:(old.partidas||0)+1}));showStats();
}
function updateHud(){ $('puntos').textContent=score;$('aciertos').textContent=hits;$('lanzamientos').textContent=shots;$('vidas').textContent='❤️'.repeat(lives)||'0'; }
function newRound(){difficultyQuestion();makeTargets();draw();if(active)$('botonLanzar').disabled=false;}
function startGame(){
  clearTimeout(nextRoundTimer);cancelAnimationFrame(raf);active=true;flying=false;$('angulo').disabled=false;$('fuerza').disabled=false;shots=10;lives=3;score=0;hits=0;streak=0;bestRun=0;shot=null;newRound();updateHud();
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
  flying=true;$('botonLanzar').disabled=true;$('angulo').disabled=true;$('fuerza').disabled=true;
  shot={elapsed:0,a:angle(),v:speed()};let last=performance.now();
  const frame=now=>{
    if(!flying||!shot)return;
    shot.elapsed=Math.min(1,shot.elapsed+Math.min(.05,(now-last)/1000)/.8);last=now;draw();
    if(shot.elapsed>=1){
      const end=landing(shot.a,shot.v),target=targets.find(t=>Math.hypot(end.x-t.x,end.y-t.y)<=t.r);
      $('angulo').disabled=false;$('fuerza').disabled=false;finishThrow(target||null);return;
    }
    raf=requestAnimationFrame(frame);
  };raf=requestAnimationFrame(frame);
}

function renderText(){
  const l=lang(),t=T[l];document.body.classList.toggle('claro',localStorage.getItem('tema')==='claro');document.documentElement.lang=l;document.title=t.title.replace(/^🎯 /,'')+' - MI WEB';MiWeb.applyLanguage();
  $('titulo').textContent=t.title;$('descripcion').textContent=t.desc;$('volver').textContent=t.back;$('etiquetaOperacion').textContent=t.solve;$('etiquetaAngulo').textContent=t.angle;$('etiquetaFuerza').textContent=t.power;
  $('textoPuntos').textContent=t.points;$('textoAciertos').textContent=t.hits;$('textoLanzamientos').textContent=t.throws;$('textoVidas').textContent=t.lives;$('botonLanzar').textContent=t.launch;
  $('overlayTitulo').textContent=active?'':t.ready;$('overlayTexto').textContent=t.intro;$('botonInicio').textContent=active?t.start:(hits||score?t.again:t.start);
  $('instrucciones').textContent=t.instructions;$('tituloRecords').textContent=t.records;$('textoMejorPuntuacion').textContent=t.bestScore;$('textoMejorRacha').textContent=t.bestStreak;$('textoPartidas').textContent=t.games;
  $('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';$('botonIdioma').setAttribute('aria-expanded',$('menuIdiomas').style.display==='block');$('botonTema').textContent=localStorage.getItem('tema')==='claro'?t.dark:t.light;
  if(!active)$('mensaje').textContent=t.empty;showStats();MiWeb.refreshRanking(STATS_GAME);draw();
}
function menuToggle(force){const open=force??$('menuIdiomas').style.display!=='block';$('menuIdiomas').style.display=open?'block':'none';$('botonIdioma').setAttribute('aria-expanded',String(open))}

$('angulo').addEventListener('input',updateControls);$('fuerza').addEventListener('input',updateControls);
$('botonLanzar').addEventListener('click',throwDart);$('botonInicio').addEventListener('click',startGame);
$('botonIdioma').addEventListener('click',()=>menuToggle());$('menuIdiomas').addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(!b)return;localStorage.setItem('idioma',b.dataset.lang);menuToggle(false);renderText()});
$('botonTema').addEventListener('click',()=>{localStorage.setItem('tema',localStorage.getItem('tema')==='claro'?'oscuro':'claro');renderText()});
document.addEventListener('click',e=>{if(!e.target.closest('.menu-idioma'))menuToggle(false)});
MiWeb.mountRanking({game:STATS_GAME,columns:[{key:'mejorPuntuacion',label:{es:'Mejor puntuación',en:'Best score',hy:'Լավագույն միավոր'}},{key:'mejorRacha',label:{es:'Mejor racha',en:'Best streak',hy:'Լավագույն շարք'}},{key:'partidas',label:{es:'Partidas',en:'Games',hy:'Խաղեր'}}],compare:(a,b)=>(b.mejorPuntuacion||0)-(a.mejorPuntuacion||0)||(b.mejorRacha||0)-(a.mejorRacha||0)||(b.partidas||0)-(a.partidas||0)});
updateHud();showStats();renderText();
