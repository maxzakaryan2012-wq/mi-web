const T={
 es:{title:'🎯 Dardos matemáticos',desc:'Resuelve la operación, ajusta el ángulo y la fuerza, y lanza el dardo a la diana correcta.',back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',solve:'Resuelve:',angle:'↗ Ángulo',power:'💪 Fuerza',points:'Puntos',hits:'Aciertos',throws:'Dardos',lives:'Vidas',launch:'🎯 Lanzar dardo',ready:'¿Preparado?',intro:'Resuelve la operación. Ajusta el ángulo y la fuerza para que el dardo llegue al número correcto. Tienes 10 dardos y 3 vidas.',start:'▶️ Empezar',again:'🔄 Jugar otra vez',instructions:'La línea de puntos muestra la trayectoria aproximada. Un impacto en una diana equivocada también cuenta como fallo.',records:'🏆 Tus récords',bestScore:'Mejor puntuación',bestStreak:'Mejor racha',games:'Partidas',correct:'¡Diana! Respuesta correcta: ',wrongTarget:'Diana equivocada. La respuesta era ',miss:'El dardo no alcanzó ninguna diana. La respuesta era ',finished:'Partida terminada · Puntos: ',hitsOf:' · Aciertos: ',answer:'La respuesta era ',shotsLeft:' dardos restantes',golden:'¡Racha de ',pointsWord:'! +',pointsShort:' puntos',empty:'Ajusta el ángulo y la fuerza para empezar.'},
 en:{title:'🎯 Math darts',desc:'Solve the operation, adjust the angle and power, then throw at the correct target.',back:'← Back',light:'☀️ Light',dark:'🌙 Dark',solve:'Solve:',angle:'↗ Angle',power:'💪 Power',points:'Points',hits:'Hits',throws:'Darts',lives:'Lives',launch:'🎯 Throw dart',ready:'Ready?',intro:'Solve the operation. Adjust the angle and power so the dart reaches the correct number. You have 10 darts and 3 lives.',start:'▶️ Start',again:'🔄 Play again',instructions:'The dotted line shows the approximate path. Hitting the wrong target also counts as a miss.',records:'🏆 Your records',bestScore:'Best score',bestStreak:'Best streak',games:'Games',correct:'Bullseye! Correct answer: ',wrongTarget:'Wrong target. The answer was ',miss:'The dart missed every target. The answer was ',finished:'Game over · Score: ',hitsOf:' · Hits: ',answer:'The answer was ',shotsLeft:' darts left',golden:'Streak of ',pointsWord:'! +',pointsShort:' points',empty:'Adjust the angle and power to get started.'},
 hy:{title:'🎯 Մաթեմատիկական տեգեր',desc:'Լուծիր գործողությունը, կարգավորիր անկյունն ու ուժը և նետիր տեգը ճիշտ թիրախին։',back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',solve:'Լուծիր՝',angle:'↗ Անկյուն',power:'💪 Ուժ',points:'Միավորներ',hits:'Դիպուկ հարվածներ',throws:'Տեգեր',lives:'Կյանքեր',launch:'🎯 Նետել տեգը',ready:'Պատրա՞ստ ես',intro:'Լուծիր գործողությունը։ Կարգավորիր անկյունն ու ուժը, որպեսզի տեգը հասնի ճիշտ թվին։ Ունես 10 նետում և 3 կյանք։',start:'▶️ Սկսել',again:'🔄 Կրկին խաղալ',instructions:'Կետագիծը ցույց է տալիս մոտավոր ուղին։ Սխալ թիրախին հարվածելը նույնպես սխալ է։',records:'🏆 Քո ռեկորդները',bestScore:'Լավագույն միավոր',bestStreak:'Լավագույն շարք',games:'Խաղեր',correct:'Դիպուկ հարված։ Ճիշտ պատասխանն էր՝ ',wrongTarget:'Սխալ թիրախ։ Պատասխանն էր՝ ',miss:'Տեգը չհարվածեց թիրախներին։ Պատասխանն էր՝ ',finished:'Խաղն ավարտվեց · Միավորներ՝ ',hitsOf:' · Դիպուկ հարվածներ՝ ',answer:'Պատասխանն էր՝ ',shotsLeft:' տեգ է մնացել',golden:'Շարք՝ ',pointsWord:'! +',pointsShort:' միավոր',empty:'Սկսելու համար կարգավորիր անկյունն ու ուժը։'}
};

const $=id=>document.getElementById(id);
const canvas=$('juego'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height,GROUND=354,LAUNCH_X=78,LAUNCH_Y=GROUND-14,G=420;
const TARGET_X=[190,307,424,541,658];
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
function speed(){return 120+Number($('fuerza').value)*54}
function angle(){return Number($('angulo').value)*Math.PI/180}
function projectileAt(t,a=angle(),v=speed()){
  const vx=v*Math.cos(a),vy=-v*Math.sin(a);
  return{x:LAUNCH_X+vx*t,y:LAUNCH_Y+vy*t+.5*G*t*t};
}
function projectileTimeAtX(x,a=angle(),v=speed()){return(x-LAUNCH_X)/(v*Math.cos(a))}
function predictedTarget(){
  const a=angle(),v=speed();let best=null;
  for(const t of targets){const at=projectileAt(projectileTimeAtX(t.x,a,v),a,v);const d=Math.abs(at.y-t.y);if(!best||d<best.d)best={target:t,d};}
  return best;
}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function drawBackground(){
  const light=document.body.classList.contains('claro');
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,light?'#d8eee5':'#1d3a35');g.addColorStop(.72,light?'#b9d9c6':'#162e2b');g.addColorStop(1,light?'#8bb18e':'#183328');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle=light?'#ffffff80':'#f1ffd019';ctx.beginPath();ctx.arc(715,62,30,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=light?'#5e896b':'#123028';ctx.beginPath();ctx.moveTo(0,GROUND);ctx.quadraticCurveTo(230,GROUND-23,405,GROUND);ctx.quadraticCurveTo(620,GROUND+4,W,GROUND-30);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
  ctx.strokeStyle=light?'#416951':'#9dd09a55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,GROUND);ctx.lineTo(W,GROUND);ctx.stroke();
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
  ctx.fillStyle='#111e1b';roundRect(ctx,t.x-25,t.y-t.r-29,50,23,7);ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 16px Arial,"Noto Sans Armenian",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(t.n),t.x,t.y-t.r-17);
  ctx.fillStyle='#ffffffaa';ctx.font='bold 10px Arial,sans-serif';ctx.fillText(String(index+1),t.x,t.y+t.r+13);
  ctx.restore();
}
function drawAim(){
  const a=angle(),v=speed();ctx.save();ctx.setLineDash([4,8]);ctx.lineWidth=3;ctx.strokeStyle='#e8ffaeaa';ctx.beginPath();
  for(let t=0;t<1.35;t+=.035){const p=projectileAt(t,a,v);if(t===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);if(p.x>W-12||p.y>GROUND)break;}ctx.stroke();ctx.setLineDash([]);ctx.restore();
}
function drawDart(x,y,vx,vy){
  const rot=Math.atan2(vy,vx);ctx.save();ctx.translate(x,y);ctx.rotate(rot);
  ctx.strokeStyle='#eee2c5';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-19,0);ctx.lineTo(9,0);ctx.stroke();
  ctx.fillStyle='#ffc65a';ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(5,-5);ctx.lineTo(5,5);ctx.closePath();ctx.fill();
  ctx.fillStyle='#f06451';ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(-26,-7);ctx.lineTo(-23,0);ctx.lineTo(-26,7);ctx.closePath();ctx.fill();ctx.restore();
}
function drawLauncher(){
  const a=angle();ctx.save();ctx.translate(LAUNCH_X,LAUNCH_Y);ctx.fillStyle='#182522';ctx.beginPath();ctx.arc(-4,10,17,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e2c486';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*39,-Math.sin(a)*39);ctx.stroke();ctx.fillStyle='#ffce6b';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.restore();
}
function draw(){
  drawBackground();drawAim();targets.forEach(drawTarget);drawLauncher();
  if(shot){const t=shot.elapsed,x=LAUNCH_X+shot.vx*t,y=LAUNCH_Y+shot.vy*t+.5*G*t*t;drawDart(x,y,shot.vx,shot.vy)}
}
function updateControls(){
  $('valorAngulo').textContent=$('angulo').value+'°';$('valorFuerza').textContent=$('fuerza').value;draw();
  const best=predictedTarget();$('mensaje').textContent=active&&!flying&&best?`${T[lang()].empty} · ${T[lang()].angle.replace('↗ ','')}: ${$('angulo').value}° · ${T[lang()].power.replace('💪 ','')}: ${$('fuerza').value}`:(!active?T[lang()].empty:'');
}
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
  if(!active||flying)return;flying=true;$('botonLanzar').disabled=true;const a=angle(),v=speed();shot={elapsed:0,vx:v*Math.cos(a),vy:-v*Math.sin(a),previousX:LAUNCH_X,passed:new Set()};
  let last=performance.now();
  const frame=now=>{if(!flying||!shot)return;const dt=Math.min(.04,(now-last)/1000);last=now;shot.elapsed+=dt;const x=LAUNCH_X+shot.vx*shot.elapsed,y=LAUNCH_Y+shot.vy*shot.elapsed+.5*G*shot.elapsed*shot.elapsed;
    for(const t of targets){if(!shot.passed.has(t.x)&&shot.previousX<t.x&&x>=t.x){shot.passed.add(t.x);const at=projectileAt(projectileTimeAtX(t.x,a,v),a,v);if(Math.abs(at.y-t.y)<=t.r){draw();finishThrow(t);return}}}
    shot.previousX=x;draw();if(x>W+35||y>H+40||shot.elapsed>2.5){finishThrow(null);return}raf=requestAnimationFrame(frame)};
  raf=requestAnimationFrame(frame);
}
function renderText(){
  const l=lang(),t=T[l];document.documentElement.lang=l;document.title=t.title.replace(/^🎯 /,'')+' - MI WEB';MiWeb.applyLanguage();
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
