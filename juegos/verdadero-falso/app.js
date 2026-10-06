const T={
es:{
title:'✅❌ Verdadero o falso',
desc:'Decide si la operación es correcta. Consigue 10 aciertos para superar cada nivel.',
back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',
level:'Nivel',hits:'Aciertos',streak:'Racha',xp:'XP por acierto',
true:'✓ Verdadero',false:'✕ Falso',keys:'Teclado: V = verdadero · F = falso',
ready:'¿Preparado?',startText:'Cada acierto da +5 XP. Al conseguir 10 aciertos recibes +5 XP extra y pasas al siguiente nivel.',
start:'▶️ Empezar',again:'🔄 Nueva partida',
note:'Nivel 1: suma y resta. Nivel 2 añade multiplicación. Después aumenta el número de operaciones y la dificultad hasta el nivel 10.',
correct:'✅ ¡Correcto! +5 XP',wrong:'❌ Incorrecto. La respuesta era',levelUp:'🚀 Nivel superado. +5 XP extra',complete:'🏆 ¡Has superado los 10 niveles!',continue:'Siguiente nivel',
difficulty1:'➕➖ 1 operación',difficultyMul:'➕➖✖ 1 operación',difficulty2:'2 operaciones',difficulty3:'3 operaciones',
maxLevel:'Nivel máximo'
},
en:{
title:'✅❌ True or false',
desc:'Decide whether the equation is correct. Get 10 correct answers to clear each level.',
back:'← Back',light:'☀️ Light',dark:'🌙 Dark',
level:'Level',hits:'Correct',streak:'Streak',xp:'XP per correct answer',
true:'✓ True',false:'✕ False',keys:'Keyboard: T = true · F = false',
ready:'Ready?',startText:'Each correct answer gives +5 XP. Get 10 correct answers for +5 bonus XP and advance a level.',
start:'▶️ Start',again:'🔄 New game',
note:'Level 1: addition and subtraction. Level 2 adds multiplication. Then the number of operations and difficulty increase up to level 10.',
correct:'✅ Correct! +5 XP',wrong:'❌ Incorrect. The answer was',levelUp:'🚀 Level cleared. +5 bonus XP',complete:'🏆 You cleared all 10 levels!',continue:'Next level',
difficulty1:'➕➖ 1 operation',difficultyMul:'➕➖✖ 1 operation',difficulty2:'2 operations',difficulty3:'3 operations',
maxLevel:'Maximum level'
},
hy:{
title:'✅❌ Ճիշտ թե սխալ',
desc:'Որոշիր՝ հավասարումը ճիշտ է, թե ոչ։ Յուրաքանչյուր մակարդակ անցնելու համար հավաքիր 10 ճիշտ պատասխան։',
back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',
level:'Մակարդակ',hits:'Ճիշտ',streak:'Շարք',xp:'XP ճիշտ պատասխանի համար',
true:'✓ Ճիշտ',false:'✕ Սխալ',keys:'Ստեղնաշար՝ V = ճիշտ · F = սխալ',
ready:'Պատրա՞ստ ես',startText:'Յուրաքանչյուր ճիշտ պատասխան տալիս է +5 XP։ 10 ճիշտ պատասխանից հետո ստանում ես ևս +5 XP և անցնում հաջորդ մակարդակ։',
start:'▶️ Սկսել',again:'🔄 Նոր խաղ',
note:'Մակարդակ 1՝ գումարում և հանում։ Մակարդակ 2-ում ավելանում է բազմապատկումը։ Հետո գործողությունների քանակն ու դժվարությունը աճում են մինչև 10-րդ մակարդակ։',
correct:'✅ Ճիշտ է։ +5 XP',wrong:'❌ Սխալ է։ Ճիշտ պատասխանը՝',levelUp:'🚀 Մակարդակն անցար։ +5 հավելյալ XP',complete:'🏆 Անցար բոլոր 10 մակարդակները։',continue:'Հաջորդ մակարդակ',
difficulty1:'➕➖ 1 գործողություն',difficultyMul:'➕➖✖ 1 գործողություն',difficulty2:'2 գործողություն',difficulty3:'3 գործողություն',
maxLevel:'Առավելագույն մակարդակ'
}
};

const $=id=>document.getElementById(id);
const SAVE_KEY='miWebVerdaderoFalsoCurrentV1';
const GAME='verdadero-falso';

let level=1;
let correctInLevel=0;
let totalCorrect=0;
let streak=0;
let bestRunStreak=0;
let current=null;
let locked=true;
let started=false;
let completed=false;
let answeredQuestions=0;

function lang(){
  const l=localStorage.getItem('idioma');
  return T[l]?l:'es';
}

function rand(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

function choice(values){
  return values[rand(0,values.length-1)];
}

function configForLevel(lvl){
  if(lvl===1)return {ops:1,allowed:['+','-'],max:20,mulMax:0};
  if(lvl===2)return {ops:1,allowed:['+','-','×'],max:25,mulMax:10};
  if(lvl===3)return {ops:2,allowed:['+','-'],max:25,mulMax:0};
  if(lvl===4)return {ops:2,allowed:['+','-','×'],max:20,mulMax:8};
  if(lvl===5)return {ops:2,allowed:['+','-','×'],max:35,mulMax:10};
  if(lvl===6)return {ops:3,allowed:['+','-'],max:35,mulMax:0};
  if(lvl===7)return {ops:3,allowed:['+','-','×'],max:22,mulMax:8};
  if(lvl===8)return {ops:3,allowed:['+','-','×'],max:35,mulMax:10};
  if(lvl===9)return {ops:3,allowed:['+','-','×'],max:50,mulMax:12};
  return {ops:3,allowed:['+','-','×'],max:75,mulMax:15};
}

function evaluate(numbers,ops){
  const nums=numbers.slice();
  const operators=ops.slice();

  for(let i=0;i<operators.length;){
    if(operators[i]==='×'){
      nums.splice(i,2,nums[i]*nums[i+1]);
      operators.splice(i,1);
    }else i++;
  }

  let result=nums[0];
  for(let i=0;i<operators.length;i++){
    result=operators[i]==='+'?result+nums[i+1]:result-nums[i+1];
  }
  return result;
}

function generateExpression(){
  const cfg=configForLevel(level);
  let numbers=[];
  let ops=[];

  for(let guard=0;guard<100;guard++){
    ops=Array.from({length:cfg.ops},()=>choice(cfg.allowed));
    numbers=[];

    for(let i=0;i<cfg.ops+1;i++){
      const touchesMultiply=(i>0&&ops[i-1]==='×')||(i<ops.length&&ops[i]==='×');
      const max=touchesMultiply&&cfg.mulMax?cfg.mulMax:cfg.max;
      numbers.push(rand(level<=2?1:2,max));
    }

    if(level===1&&ops[0]==='-'&&numbers[1]>numbers[0]){
      [numbers[0],numbers[1]]=[numbers[1],numbers[0]];
    }

    const result=evaluate(numbers,ops);
    const limit=level<=3?120:level<=6?500:5000;
    if(Number.isSafeInteger(result)&&Math.abs(result)<=limit&&
       (level>=4||result>=0)){
      const truthful=Math.random()<0.5;
      let shown=result;

      if(!truthful){
        const maxDelta=level<=2?3:level<=5?6:level<=8?10:15;
        let delta=0;
        while(delta===0)delta=rand(-maxDelta,maxDelta);
        shown=result+delta;
      }

      const expression=numbers.map((n,i)=>i<ops.length?n+' '+ops[i]:String(n)).join(' ');
      return {expression,result,shown,truthful};
    }
  }

  return {expression:'2 + 2',result:4,shown:4,truthful:true};
}

function difficultyText(){
  const t=T[lang()];
  const cfg=configForLevel(level);
  if(cfg.ops===1)return level===1?t.difficulty1:t.difficultyMul;
  return (cfg.ops===2?'🧠 '+t.difficulty2:'🔥 '+t.difficulty3)+' · '+cfg.allowed.join(' ');
}

function save(){
  localStorage.setItem(SAVE_KEY,JSON.stringify({
    level,correctInLevel,totalCorrect,streak,bestRunStreak,started,completed,answeredQuestions
  }));
}

function load(){
  try{
    const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(!s||!Number.isInteger(s.level)||s.level<1||s.level>10)return false;
    level=s.level;
    correctInLevel=Math.max(0,Math.min(10,Number(s.correctInLevel)||0));
    totalCorrect=Math.max(0,Number(s.totalCorrect)||0);
    streak=Math.max(0,Number(s.streak)||0);
    bestRunStreak=Math.max(0,Number(s.bestRunStreak)||0);
    started=!!s.started;
    completed=!!s.completed;
    answeredQuestions=Math.max(0,Number(s.answeredQuestions)||0);
    return true;
  }catch{return false}
}

function updateStats({newGame=false,completedRun=false}={}){
  MiWeb.updateExtraStats(GAME,v=>({
    ...v,
    maxNivel:Math.max(v.maxNivel||0,level),
    mejorRacha:Math.max(v.mejorRacha||0,bestRunStreak),
    aciertos:(v.aciertos||0)+(newGame?0:0),
    partidas:(v.partidas||0)+(newGame?1:0),
    completadas:(v.completadas||0)+(completedRun?1:0)
  }));
}

function addGlobalCorrect(){
  MiWeb.updateExtraStats(GAME,v=>({
    ...v,
    maxNivel:Math.max(v.maxNivel||0,level),
    mejorRacha:Math.max(v.mejorRacha||0,bestRunStreak),
    aciertos:(v.aciertos||0)+1,
    partidas:v.partidas||0,
    completadas:v.completadas||0
  }));
}

function updateHud(){
  const t=T[lang()];
  $('nivel').textContent=level+'/10';
  $('aciertos').textContent=totalCorrect;
  $('racha').textContent=streak;
  $('objetivoNivel').textContent=t.level+' '+level;
  $('progresoTexto').textContent=correctInLevel+' / 10';
  $('progresoFill').style.width=(correctInLevel*10)+'%';
  $('dificultad').textContent=difficultyText();
}

function nextQuestion(){
  if(completed)return;
  current=generateExpression();
  locked=false;
  $('operacion').textContent=current.expression+' = '+current.shown;
  $('mensaje').textContent='';
  $('mensaje').className='mensaje';
  $('verdadero').disabled=false;
  $('falso').disabled=false;
  updateHud();
  save();
}

function flash(kind){
  const el=$('flash');
  el.className='flash';
  void el.offsetWidth;
  el.classList.add(kind);
}

function answer(value){
  if(locked||!current||completed)return;
  locked=true;
  answeredQuestions++;
  $('verdadero').disabled=true;
  $('falso').disabled=true;

  const correct=value===current.truthful;
  const t=T[lang()];

  if(correct){
    correctInLevel++;
    totalCorrect++;
    streak++;
    bestRunStreak=Math.max(bestRunStreak,streak);
    $('mensaje').textContent=t.correct;
    $('mensaje').className='mensaje ok';
    flash('ok');
    MiWeb.xpAction('correct');
    addGlobalCorrect();
  }else{
    streak=0;
    const truth=current.expression+' = '+current.result;
    $('mensaje').textContent=t.wrong+' '+truth;
    $('mensaje').className='mensaje bad';
    flash('bad');
    updateStats();
  }

  updateHud();
  save();

  if(correct&&correctInLevel>=10){
    MiWeb.xpAction('level_up');
    $('mensaje').textContent=t.levelUp;
    $('mensaje').className='mensaje level';

    if(level>=10){
      completed=true;
      save();
      updateStats({completedRun:true});
      setTimeout(showComplete,650);
      return;
    }

    level++;
    correctInLevel=0;
    updateStats();
    save();
    setTimeout(nextQuestion,900);
    return;
  }

  setTimeout(nextQuestion,correct?520:850);
}

function startNew(){
  level=1;
  correctInLevel=0;
  totalCorrect=0;
  streak=0;
  bestRunStreak=0;
  answeredQuestions=0;
  completed=false;
  started=true;
  current=null;
  updateStats({newGame:true});
  $('overlay').classList.add('oculto');
  save();
  nextQuestion();
}

function showComplete(){
  const t=T[lang()];
  locked=true;
  $('overlay').classList.remove('oculto');
  $('overlayTitulo').textContent=t.complete;
  $('overlayTexto').textContent=t.maxLevel+': 10 · '+t.hits+': '+totalCorrect;
  $('empezar').textContent=t.again;
}

function setTheme(){
  const claro=localStorage.getItem('tema')==='claro';
  document.body.classList.toggle('claro',claro);
  $('botonTema').textContent=T[lang()][claro?'dark':'light'];
}

function renderText(){
  const t=T[lang()],l=lang();
  document.documentElement.lang=l;
  document.title=t.title.replace(/^✅❌ /,'')+' - MI WEB';
  MiWeb.applyLanguage();
  $('titulo').textContent=t.title;
  $('descripcion').textContent=t.desc;
  $('volver').textContent=t.back;
  $('txtNivel').textContent=t.level;
  $('txtAciertos').textContent=t.hits;
  $('txtRacha').textContent=t.streak;
  $('txtXp').textContent=t.xp;
  $('verdadero').textContent=t.true;
  $('falso').textContent=t.false;
  $('atajos').textContent=t.keys;
  $('nota').textContent=t.note;
  $('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';

  if(!started){
    $('overlayTitulo').textContent=t.ready;
    $('overlayTexto').textContent=t.startText;
    $('empezar').textContent=t.start;
  }else if(completed){
    $('overlayTitulo').textContent=t.complete;
    $('overlayTexto').textContent=t.maxLevel+': 10 · '+t.hits+': '+totalCorrect;
    $('empezar').textContent=t.again;
  }

  setTheme();
  updateHud();
  MiWeb.refreshRanking(GAME);
}

$('verdadero').addEventListener('click',()=>answer(true));
$('falso').addEventListener('click',()=>answer(false));
$('empezar').addEventListener('click',startNew);

addEventListener('keydown',e=>{
  if(e.repeat)return;
  const k=e.key.toLowerCase();
  if(k==='v'||k==='t'||k==='arrowleft'){
    e.preventDefault();
    answer(true);
  }else if(k==='f'||k==='arrowright'){
    e.preventDefault();
    answer(false);
  }
});

$('botonIdioma').onclick=()=>{
  $('menuIdiomas').style.display=$('menuIdiomas').style.display==='block'?'none':'block';
};
$('menuIdiomas').addEventListener('click',e=>{
  const b=e.target.closest('[data-lang]');
  if(!b)return;
  localStorage.setItem('idioma',b.dataset.lang);
  $('menuIdiomas').style.display='none';
  renderText();
});
$('botonTema').onclick=()=>{
  localStorage.setItem('tema',localStorage.getItem('tema')==='claro'?'oscuro':'claro');
  renderText();
};
document.addEventListener('click',e=>{
  if(!e.target.closest('.menu-idioma'))$('menuIdiomas').style.display='none';
});

MiWeb.mountRanking({
  game:GAME,
  columns:[
    {key:'maxNivel',label:{es:'Nivel máximo',en:'Highest level',hy:'Առավելագույն մակարդակ'}},
    {key:'completadas',label:{es:'Completadas',en:'Completed',hy:'Ավարտված'}},
    {key:'aciertos',label:{es:'Aciertos',en:'Correct',hy:'Ճիշտ'}},
    {key:'mejorRacha',label:{es:'Mejor racha',en:'Best streak',hy:'Լավագույն շարք'}}
  ],
  compare:(a,b)=>(b.maxNivel||0)-(a.maxNivel||0)||(b.completadas||0)-(a.completadas||0)||(b.aciertos||0)-(a.aciertos||0)||(b.mejorRacha||0)-(a.mejorRacha||0)
});

const restored=load();
if(restored&&started&&!completed){
  $('overlay').classList.add('oculto');
  nextQuestion();
}else if(restored&&completed){
  showComplete();
}
renderText();