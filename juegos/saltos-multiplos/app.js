const T={
es:{
title:'🦘 Saltos de múltiplos',
desc:'Elige la plataforma que sea múltiplo del número objetivo y salta antes de que se acabe el tiempo.',
back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',
points:'Puntos',streak:'Racha',lives:'Vidas',level:'Nivel',
objective:'Salta a un múltiplo de',
ready:'¿Preparado?',startText:'Busca el múltiplo correcto. Puedes pulsar una plataforma o usar las teclas 1, 2 y 3.',
start:'▶️ Empezar',again:'🔄 Jugar otra vez',
note:'Cada 5 aciertos subes de nivel. El número objetivo cambia y tienes menos tiempo para elegir.',
correct:'✅ ¡Buen salto!',wrong:'❌ Ese número no es múltiplo de',timeout:'⏱️ Se acabó el tiempo.',
levelUp:'🚀 Nivel',over:'Fin de la partida',score:'Puntuación'
},
en:{
title:'🦘 Multiple jumps',
desc:'Choose the platform that is a multiple of the target number and jump before time runs out.',
back:'← Back',light:'☀️ Light',dark:'🌙 Dark',
points:'Points',streak:'Streak',lives:'Lives',level:'Level',
objective:'Jump to a multiple of',
ready:'Ready?',startText:'Find the correct multiple. Tap a platform or use keys 1, 2 and 3.',
start:'▶️ Start',again:'🔄 Play again',
note:'Every 5 correct jumps you level up. The target changes and you get less time to choose.',
correct:'✅ Great jump!',wrong:'❌ That number is not a multiple of',timeout:'⏱️ Time is up.',
levelUp:'🚀 Level',over:'Game over',score:'Score'
},
hy:{
title:'🦘 Բազմապատիկների ցատկեր',
desc:'Ընտրիր այն հարթակը, որի թիվը նպատակային թվի բազմապատիկն է, և ցատկիր մինչև ժամանակը վերջանա։',
back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',
points:'Միավորներ',streak:'Շարք',lives:'Կյանքեր',level:'Մակարդակ',
objective:'Ցատկիր այս թվի բազմապատիկին՝',
ready:'Պատրա՞ստ ես',startText:'Գտիր ճիշտ բազմապատիկը։ Սեղմիր հարթակին կամ օգտագործիր 1, 2 և 3 ստեղները։',
start:'▶️ Սկսել',again:'🔄 Կրկին խաղալ',
note:'Յուրաքանչյուր 5 ճիշտ ցատկից հետո մակարդակը բարձրանում է։ Նպատակային թիվը փոխվում է, իսկ ժամանակը՝ կրճատվում։',
correct:'✅ Հիանալի ցատկ։',wrong:'❌ Այդ թիվը բազմապատիկ չէ՝',timeout:'⏱️ Ժամանակն ավարտվեց։',
levelUp:'🚀 Մակարդակ',over:'Խաղն ավարտվեց',score:'Միավորներ'
}
};

const $=id=>document.getElementById(id);
const buttons=[...document.querySelectorAll('.plataforma')];

let playing=false;
let locked=false;
let score=0;
let streak=0;
let bestRunStreak=0;
let lives=3;
let level=1;
let correctCount=0;
let target=4;
let values=[0,0,0];
let correctIndex=0;
let roundDuration=5;
let roundDeadline=0;
let timerRaf=0;
let jumpAnimation=null;

function lang(){
    const l=localStorage.getItem('idioma');
    return T[l]?l:'es';
}

function rand(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
}

function shuffle(a){
    for(let i=a.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
}

function stats(){
    const all=MiWeb.readExtraStats('saltos-multiplos');
    return all[MiWeb.profile().id]||{};
}

function setTheme(){
    const claro=localStorage.getItem('tema')==='claro';
    document.body.classList.toggle('claro',claro);
    $('botonTema').textContent=T[lang()][claro?'dark':'light'];
}

function renderText(){
    const t=T[lang()],l=lang();
    document.documentElement.lang=l;
    document.title=t.title.replace(/^🦘 /,'')+' - MI WEB';
    MiWeb.applyLanguage();
    $('titulo').textContent=t.title;
    $('descripcion').textContent=t.desc;
    $('volver').textContent=t.back;
    $('txtPuntos').textContent=t.points;
    $('txtRacha').textContent=t.streak;
    $('txtVidas').textContent=t.lives;
    $('txtNivel').textContent=t.level;
    $('txtObjetivo').textContent=t.objective;
    $('overlayTitulo').textContent=playing?'':t.ready;
    $('overlayTexto').textContent=t.startText;
    $('botonInicio').textContent=score>0?t.again:t.start;
    $('nota').textContent=t.note;
    $('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';
    setTheme();
    updateHud();
    MiWeb.refreshRanking('saltos-multiplos');
    MiWeb.xpAction('game_finish');
}

function updateHud(){
    $('puntos').textContent=score;
    $('racha').textContent=streak;
    $('vidas').textContent='❤️'.repeat(Math.max(0,lives))+(lives<3?'🖤'.repeat(3-lives):'');
    $('nivel').textContent=level;
    $('multiploObjetivo').textContent=target;
}

function chooseTarget(){
    const pool=level<=2?[2,3,4,5,6]:level<=5?[3,4,5,6,7,8,9]:[4,5,6,7,8,9,10,11,12];
    let next=pool[rand(0,pool.length-1)];
    if(pool.length>1){
        let guard=0;
        while(next===target&&guard++<10)next=pool[rand(0,pool.length-1)];
    }
    target=next;
}

function makeRound(){
    const multiplierMax=Math.min(18,7+level*2);
    const correct=target*rand(2,multiplierMax);
    const set=new Set([correct]);

    while(set.size<3){
        const near=Math.max(2,correct+rand(-target*2,target*2));
        if(near%target!==0)set.add(near);
    }

    values=shuffle([...set]);
    correctIndex=values.indexOf(correct);

    buttons.forEach((button,i)=>{
        button.textContent=values[i];
        button.classList.remove('correcta','incorrecta');
        button.disabled=false;
    });

    roundDuration=Math.max(2.15,5-level*.28);
    roundDeadline=performance.now()+roundDuration*1000;
    $('timerFill').style.width='100%';
    updateHud();
    cancelAnimationFrame(timerRaf);
    timerRaf=requestAnimationFrame(updateTimer);
}

function updateTimer(now){
    if(!playing||locked)return;
    const remaining=Math.max(0,roundDeadline-now);
    const ratio=remaining/(roundDuration*1000);
    const fill=$('timerFill');
    fill.style.width=(ratio*100)+'%';
    fill.style.background=ratio>.55?'#57d66b':ratio>.25?'#f2c94c':'#ff5a66';

    if(remaining<=0){
        handleTimeout();
        return;
    }

    timerRaf=requestAnimationFrame(updateTimer);
}

function platformCenter(index){
    const zone=$('zonaJuego').getBoundingClientRect();
    const rect=buttons[index].getBoundingClientRect();
    return {
        x:rect.left-zone.left+rect.width/2,
        y:rect.top-zone.top+rect.height*.52
    };
}

function jumpTo(index,success){
    const player=$('jugador');
    const zone=$('zonaJuego').getBoundingClientRect();
    const playerRect=player.getBoundingClientRect();
    const startX=playerRect.left-zone.left+playerRect.width/2;
    const startY=playerRect.top-zone.top+playerRect.height/2;
    const end=platformCenter(index);
    const dx=end.x-startX;
    const dy=end.y-startY;
    const duration=success?430:360;

    if(jumpAnimation)jumpAnimation.cancel();

    jumpAnimation=player.animate([
        {transform:'translateX(-50%) translate(0,0) rotate(0deg)',offset:0},
        {transform:`translateX(-50%) translate(${dx*.5}px,${dy*.5-92}px) rotate(${success?'-8deg':'10deg'})`,offset:.5},
        {transform:`translateX(-50%) translate(${dx}px,${dy}px) rotate(0deg)`,offset:1}
    ],{duration,easing:'cubic-bezier(.25,.75,.35,1)',fill:'forwards'});

    return jumpAnimation.finished.catch(()=>{});
}

function particles(index,good){
    const zone=$('zonaJuego');
    const center=platformCenter(index);
    for(let i=0;i<12;i++){
        const p=document.createElement('span');
        p.className='particula';
        p.style.left=(center.x-4)+'px';
        p.style.top=(center.y-4)+'px';
        p.style.background=good?(i%2?'#69e17b':'#ffe56b'):'#ff6772';
        const angle=Math.random()*Math.PI*2;
        const distance=35+Math.random()*55;
        p.style.setProperty('--dx',Math.cos(angle)*distance+'px');
        p.style.setProperty('--dy',Math.sin(angle)*distance+'px');
        zone.appendChild(p);
        p.addEventListener('animationend',()=>p.remove());
    }
}

function flash(kind){
    const el=$('flash');
    el.className='flash';
    void el.offsetWidth;
    el.classList.add(kind);
}

async function selectPlatform(index){
    if(!playing||locked)return;
    locked=true;
    cancelAnimationFrame(timerRaf);
    buttons.forEach(b=>b.disabled=true);

    const t=T[lang()];
    const correct=index===correctIndex;

    if(correct){
        buttons[index].classList.add('correcta');
        const timeLeft=Math.max(0,roundDeadline-performance.now());
        const timeBonus=Math.floor(timeLeft/550);
        streak++;
        bestRunStreak=Math.max(bestRunStreak,streak);
        correctCount++;
        score+=10+Math.min(20,streak*2)+timeBonus;
        $('mensaje').textContent=t.correct+'  +'+(10+Math.min(20,streak*2)+timeBonus);
        MiWeb.xpAction('correct');
        flash('ok');
        particles(index,true);
        updateHud();
        await jumpTo(index,true);

        const newLevel=1+Math.floor(correctCount/5);
        if(newLevel>level){
            level=newLevel;
            chooseTarget();
            $('mensaje').textContent=t.levelUp+' '+level+' · ×'+target;
        }
    }else{
        buttons[index].classList.add('incorrecta');
        buttons[correctIndex].classList.add('correcta');
        lives--;
        streak=0;
        $('mensaje').textContent=t.wrong+' '+target;
        MiWeb.xpAction('wrong');
        flash('bad');
        particles(index,false);
        updateHud();
        await jumpTo(index,false);
    }

    if(lives<=0){
        endGame();
        return;
    }

    resetPlayer();
    await wait(120);
    locked=false;
    makeRound();
}

function handleTimeout(){
    if(!playing||locked)return;
    locked=true;
    buttons.forEach(b=>b.disabled=true);
    buttons[correctIndex].classList.add('correcta');
    lives--;
    streak=0;
    $('mensaje').textContent=T[lang()].timeout;
    MiWeb.xpAction('wrong');
    flash('bad');
    updateHud();

    if(lives<=0){
        setTimeout(endGame,480);
        return;
    }

    setTimeout(()=>{
        resetPlayer();
        locked=false;
        makeRound();
    },650);
}

function resetPlayer(){
    if(jumpAnimation){
        jumpAnimation.cancel();
        jumpAnimation=null;
    }
    $('jugador').style.transform='translateX(-50%)';
}

function wait(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
}

function startGame(){
    cancelAnimationFrame(timerRaf);
    if(jumpAnimation)jumpAnimation.cancel();
    playing=true;
    locked=false;
    score=0;
    streak=0;
    bestRunStreak=0;
    lives=3;
    level=1;
    correctCount=0;
    target=rand(2,6);
    resetPlayer();
    $('mensaje').textContent='';
    $('overlay').classList.add('oculto');
    updateHud();
    makeRound();
}

function endGame(){
    if(!playing)return;
    playing=false;
    locked=true;
    cancelAnimationFrame(timerRaf);
    buttons.forEach(b=>b.disabled=true);

    MiWeb.updateExtraStats('saltos-multiplos',v=>({
        ...v,
        mejorPuntuacion:Math.max(v.mejorPuntuacion||0,score),
        mejorRacha:Math.max(v.mejorRacha||0,bestRunStreak),
        maxNivel:Math.max(v.maxNivel||0,level),
        partidas:(v.partidas||0)+1
    }));

    const t=T[lang()];
    $('overlay').classList.remove('oculto');
    $('overlayTitulo').textContent=t.over;
    $('overlayTexto').textContent=t.score+': '+score+' · '+t.level+': '+level;
    $('botonInicio').textContent=t.again;
    $('mensaje').textContent=t.over+' · '+t.score+': '+score;
    MiWeb.refreshRanking('saltos-multiplos');
}

buttons.forEach((button,i)=>button.addEventListener('click',()=>selectPlatform(i)));

addEventListener('keydown',e=>{
    if(['1','2','3'].includes(e.key)){
        e.preventDefault();
        selectPlatform(Number(e.key)-1);
    }
});

$('botonInicio').addEventListener('click',startGame);

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
    game:'saltos-multiplos',
    columns:[
        {key:'mejorPuntuacion',label:{es:'Mejor puntuación',en:'Best score',hy:'Լավագույն միավոր'}},
        {key:'mejorRacha',label:{es:'Mejor racha',en:'Best streak',hy:'Լավագույն շարք'}},
        {key:'maxNivel',label:{es:'Nivel máximo',en:'Highest level',hy:'Առավելագույն մակարդակ'}},
        {key:'partidas',label:{es:'Partidas',en:'Games',hy:'Խաղեր'}}
    ],
    compare:(a,b)=>(b.mejorPuntuacion||0)-(a.mejorPuntuacion||0)||(b.mejorRacha||0)-(a.mejorRacha||0)||(b.maxNivel||0)-(a.maxNivel||0)
});

renderText();
updateHud();