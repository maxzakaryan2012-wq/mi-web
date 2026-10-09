const T={
es:{
    title:'🎯 Disparador de primos',
    desc:'Apunta con la pistola y dispara solo a los números primos antes de que lleguen abajo.',
    back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',
    points:'Puntos',streak:'Racha',lives:'Vidas',level:'Nivel',
    ready:'¿Preparado?',
    startText:'Mueve el ratón para apuntar. Dispara a los números primos.',
    start:'▶️ Empezar',again:'🔄 Jugar otra vez',
    note:'Paintball verde = primo. Rojo = número compuesto. Si disparas al vacío, sale un color aleatorio: naranja, amarillo, azul, morado o rosa. Si disparas a un compuesto o dejas escapar un primo, pierdes una vida.',
    records:'🏆 Tus récords',bestScore:'Mejor puntuación',bestStreak:'Mejor racha',games:'Partidas',
    prime:'✅ Primo · paintball verde',
    composite:'❌ Compuesto · paintball rojo',
    empty:'🎨 Disparo al vacío',
    escaped:'⚠️ Se escapó un primo',
    over:'Fin de la partida · Puntos:'
},
en:{
    title:'🎯 Prime shooter',
    desc:'Aim the gun and shoot only the prime numbers before they reach the bottom.',
    back:'← Back',light:'☀️ Light',dark:'🌙 Dark',
    points:'Points',streak:'Streak',lives:'Lives',level:'Level',
    ready:'Ready?',
    startText:'Move the mouse to aim. Shoot the prime numbers.',
    start:'▶️ Start',again:'🔄 Play again',
    note:'Green paintball = prime. Red = composite. If you shoot empty space, the paintball is randomly orange, yellow, blue, purple or pink. Shooting a composite or letting a prime escape costs one life.',
    records:'🏆 Your records',bestScore:'Best score',bestStreak:'Best streak',games:'Games',
    prime:'✅ Prime · green paintball',
    composite:'❌ Composite · red paintball',
    empty:'🎨 Missed shot',
    escaped:'⚠️ A prime escaped',
    over:'Game over · Score:'
},
hy:{
    title:'🎯 Պարզ թվերի հրաձիգ',
    desc:'Նշան բռնիր ատրճանակով և կրակիր միայն պարզ թվերին՝ մինչև դրանք հասնեն ներքև։',
    back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',
    points:'Միավորներ',streak:'Շարք',lives:'Կյանքեր',level:'Մակարդակ',
    ready:'Պատրա՞ստ ես',
    startText:'Շարժիր մկնիկը՝ նշան բռնելու համար։ Կրակիր պարզ թվերին։',
    start:'▶️ Սկսել',again:'🔄 Կրկին խաղալ',
    note:'Կանաչ paintball = պարզ թիվ։ Կարմիր = բաղադրյալ թիվ։ Դատարկ տեղ կրակելիս գույնը պատահական է՝ նարնջագույն, դեղին, կապույտ, մանուշակագույն կամ վարդագույն։ Բաղադրյալ թվին կրակելը կամ պարզ թիվը բաց թողնելը մեկ կյանք է խլում։',
    records:'🏆 Քո ռեկորդները',bestScore:'Լավագույն միավոր',bestStreak:'Լավագույն շարք',games:'Խաղեր',
    prime:'✅ Պարզ թիվ · կանաչ paintball',
    composite:'❌ Բաղադրյալ թիվ · կարմիր paintball',
    empty:'🎨 Դատարկ կրակոց',
    escaped:'⚠️ Պարզ թիվը փախավ',
    over:'Խաղն ավարտվեց · Միավորներ՝'
}
};

const $=id=>document.getElementById(id);
const canvas=$('juego');
const ctx=canvas.getContext('2d');

const PRIME_COLOR='#35d05b';
const COMPOSITE_COLOR='#ff424f';
const EMPTY_COLORS=['#ff8a00','#ffd60a','#2f8cff','#8b5cf6','#ff4fa3'];

let targets=[];
let shots=[];
let splats=[];
let playing=false;
let last=0;
let spawnTimer=0;
let score=0;
let streak=0;
let bestRunStreak=0;
let lives=3;
let level=1;
let raf=0;
let aimX=canvas.width/2;
let aimY=canvas.height/2;

function lang(){
    const x=localStorage.getItem('idioma');
    return T[x]?x:'es';
}

function isPrime(n){
    if(n<2)return false;
    if(n%2===0)return n===2;
    for(let d=3;d*d<=n;d+=2)if(n%d===0)return false;
    return true;
}

function rand(a,b){
    return Math.floor(Math.random()*(b-a+1))+a;
}

function randomEmptyColor(){
    return EMPTY_COLORS[rand(0,EMPTY_COLORS.length-1)];
}

function setTheme(){
    const claro=localStorage.getItem('tema')==='claro';
    document.body.classList.toggle('claro',claro);
    $('botonTema').textContent=T[lang()][claro?'dark':'light'];
    draw();
}

function renderText(){
    const t=T[lang()],l=lang();
    document.documentElement.lang=l;
    document.title=t.title.replace(/^🎯 /,'')+' - MI WEB';
    MiWeb.applyLanguage();
    $('titulo').textContent=t.title;
    $('descripcion').textContent=t.desc;
    $('volver').textContent=t.back;
    $('textoPuntos').textContent=t.points;
    $('textoRacha').textContent=t.streak;
    $('textoVidas').textContent=t.lives;
    $('textoNivel').textContent=t.level;
    $('overlayTitulo').textContent=playing?'':t.ready;
    $('overlayTexto').textContent=t.startText;
    $('botonInicio').textContent=score>0?t.again:t.start;
    $('nota').textContent=t.note;
    $('tituloRecords').textContent=t.records;
    $('textoMejorPuntuacion').textContent=t.bestScore;
    $('textoMejorRacha').textContent=t.bestStreak;
    $('textoPartidas').textContent=t.games;
    $('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';
    setTheme();
    showStats();
    MiWeb.refreshRanking('disparador-primos');
}

function stats(){
    const d=MiWeb.readExtraStats('disparador-primos'),id=MiWeb.profile().id;
    return d[id]||{mejorPuntuacion:0,mejorRacha:0,partidas:0};
}

function showStats(){
    const s=stats();
    $('mejorPuntuacion').textContent=s.mejorPuntuacion||0;
    $('mejorRacha').textContent=s.mejorRacha||0;
    $('partidas').textContent=s.partidas||0;
}

function updateHud(){
    $('puntos').textContent=score;
    $('racha').textContent=streak;
    $('vidas').textContent=lives;
    $('nivel').textContent=level;
}

function spawn(){
    const n=rand(2,99),r=26,x=rand(r+5,canvas.width-r-5),speed=55+level*12+Math.random()*25;
    targets.push({n,x,y:-r,r,speed,prime:isPrime(n)});
}

// Perspective projection of a paintball marker built from shaded 3D faces.
let recoil=0;
function gunPoint(x,y,z){
    const yaw=(aimX/canvas.width-.5)*.65;
    const pitch=(.5-aimY/canvas.height)*.24;
    const xx=x*Math.cos(yaw)+z*Math.sin(yaw);
    const zz=z*Math.cos(yaw)-x*Math.sin(yaw);
    const yy=y*Math.cos(pitch)-zz*Math.sin(pitch);
    const depth=zz*Math.cos(pitch)+y*Math.sin(pitch)+recoil*24;
    const scale=360/(360+depth);
    return {x:canvas.width/2+xx*scale,y:canvas.height-24+yy*scale+recoil*12,z:depth};
}
function gunGeometry(){
    const p=gunPoint(0,-56,155);
    return {muzzleX:p.x,muzzleY:p.y};
}
function drawGun(){
    const faces=[];
    function box(x,y,z,w,h,d,colors){
        const p=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],
          [x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]].map(v=>gunPoint(...v));
        [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]].forEach((ids,i)=>{
            faces.push({p:ids.map(j=>p[j]),z:ids.reduce((n,j)=>n+p[j].z,0)/4,color:colors[i%colors.length]});
        });
    }
    // Grip, receiver, rail, barrel and hopper have real depth coordinates.
    box(-16,-12,-18,32,65,36,['#24282e','#40474f','#68717b','#171b20','#333940','#515b65']);
    box(-25,-52,-20,50,42,90,['#444d58','#333b44','#a4afb9','#232830','#586574','#778491']);
    box(-8,-60,-10,16,8,65,['#242a31','#4c5660','#bbc4cd']);
    box(-12,-65,65,24,18,90,['#495661','#202830','#9daab5','#242c33','#657482','#82909d']);
    box(-15,-68,143,30,24,12,['#586773','#151b21','#c4ced6','#252d35','#657480','#95a2ad']);
    box(-5,-66,156,10,19,1,['#080c10']);
    box(18,-64,8,10,35,18,['#34424c','#53636e','#80919a']);
    box(18,-102,-5,39,38,57,['#3d4b58','#303b46','#8b9ba8','#29323c','#4a5b6a','#657989']);
    // Raised rear sight.
    box(-17,-65,-14,9,13,9,['#303940','#75838f','#c5cdd3']);
    box(8,-65,-14,9,13,9,['#303940','#75838f','#c5cdd3']);
    faces.sort((a,b)=>b.z-a.z);
    ctx.save();ctx.lineWidth=.7;ctx.strokeStyle='#10182055';
    for(const f of faces){
        ctx.beginPath();f.p.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
        ctx.fillStyle=f.color;ctx.fill();ctx.stroke();
    }
    // Soft pressure puff at the muzzle on each shot.
    if(recoil>.55){
        const p=gunGeometry();ctx.globalAlpha=(recoil-.55)*.8;
        ctx.fillStyle='#dbe8ee';ctx.beginPath();ctx.ellipse(p.muzzleX,p.muzzleY-5,13*(1.4-recoil),9,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
}

function makeSplat(x,y,color){
    const droplets=[];
    const count=7+rand(0,4);
    for(let i=0;i<count;i++){
        const a=Math.random()*Math.PI*2;
        const d=14+Math.random()*26;
        droplets.push({
            x:Math.cos(a)*d,
            y:Math.sin(a)*d,
            r:2+Math.random()*4
        });
    }
    splats.push({x,y,color,life:1.15,maxLife:1.15,droplets,rotation:Math.random()*Math.PI});
}

function drawSplats(){
    for(const s of splats){
        const alpha=Math.min(1,s.life/.3);
        ctx.save();
        ctx.globalAlpha=alpha;
        ctx.translate(s.x,s.y);
        ctx.rotate(s.rotation);
        ctx.fillStyle=s.color;

        ctx.beginPath();
        for(let i=0;i<10;i++){
            const a=i/10*Math.PI*2;
            const r=i%2===0?14:9;
            const px=Math.cos(a)*r;
            const py=Math.sin(a)*r;
            if(i===0)ctx.moveTo(px,py); else ctx.lineTo(px,py);
        }
        ctx.closePath();
        ctx.fill();

        for(const d of s.droplets){
            ctx.beginPath();
            ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function firePaintball(targetX,targetY,color){
    recoil=1;
    const g=gunGeometry();
    const distance=Math.hypot(targetX-g.muzzleX,targetY-g.muzzleY);
    shots.push({
        sx:g.muzzleX,sy:g.muzzleY,
        tx:targetX,ty:targetY,
        x:g.muzzleX,y:g.muzzleY,
        color,
        elapsed:0,
        duration:Math.max(.09,Math.min(.28,distance/1200))
    });
}

function updateEffects(dt){
    recoil=Math.max(0,recoil-dt*7);
    const completed=[];
    for(const shot of shots){
        shot.elapsed+=dt;
        const p=Math.min(1,shot.elapsed/shot.duration);
        const eased=1-Math.pow(1-p,2);
        shot.x=shot.sx+(shot.tx-shot.sx)*eased;
        shot.y=shot.sy+(shot.ty-shot.sy)*eased;
        if(p>=1)completed.push(shot);
    }
    if(completed.length){
        shots=shots.filter(s=>!completed.includes(s));
        completed.forEach(s=>makeSplat(s.tx,s.ty,s.color));
    }

    for(const s of splats)s.life-=dt;
    splats=splats.filter(s=>s.life>0);
}

function drawShots(){
    for(const s of shots){
        ctx.save();
        ctx.fillStyle=s.color;
        ctx.shadowColor=s.color;
        ctx.shadowBlur=12;
        ctx.beginPath();
        ctx.arc(s.x,s.y,9-5*Math.min(1,s.elapsed/s.duration),0,Math.PI*2);
        ctx.fill();

        ctx.shadowBlur=0;
        ctx.fillStyle='rgba(255,255,255,.75)';
        ctx.beginPath();
        ctx.arc(s.x-2,s.y-2,2,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}

function draw(){
    const light=document.body.classList.contains('claro'),w=canvas.width,h=canvas.height;
    const wall=ctx.createLinearGradient(0,0,0,h);
    wall.addColorStop(0,light?'#edf0f3':'#141a21');wall.addColorStop(1,light?'#c3ccd3':'#343e49');
    ctx.fillStyle=wall;ctx.fillRect(0,0,w,h);
    // Receding wall panels and floor lines frame the shooting gallery.
    const vx=w/2,vy=100;
    ctx.fillStyle=light?'#dce2e7':'#222b35';ctx.fillRect(0,h*.72,w,h*.28);
    ctx.strokeStyle=light?'#b2bdc7':'#46515d';ctx.lineWidth=1;
    for(let x=-w;x<=w*2;x+=w/6){
        ctx.beginPath();ctx.moveTo(vx+(x-vx)*.2,h*.72);ctx.lineTo(x,h);ctx.stroke();
    }
    for(const y of [.76,.83,.93]){
        ctx.beginPath();ctx.moveTo(0,h*y);ctx.lineTo(w,h*y);ctx.stroke();
    }
    ctx.strokeStyle=light?'#b5bfc9':'#394550';
    for(const x of [0,w]){
        ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(vx+(x-vx)*.72,vy);
        ctx.lineTo(vx+(x-vx)*.72,h*.72);ctx.lineTo(x,h);ctx.stroke();
    }
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 20px Arial';
    for(const t of targets){
        // Spherical shading preserves the exact visible hit radius.
        ctx.save();ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(t.x+5,t.y+8,t.r,t.r,0,0,Math.PI*2);ctx.fill();
        const ball=ctx.createRadialGradient(t.x-t.r*.35,t.y-t.r*.4,1,t.x,t.y,t.r);
        ball.addColorStop(0,light?'#ffffff':'#aab8c5');ball.addColorStop(.55,light?'#e1e7ed':'#526171');ball.addColorStop(1,light?'#7e909f':'#26323e');
        ctx.fillStyle=ball;ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=light?'#6f8495':'#90a1b1';ctx.lineWidth=1;ctx.stroke();
        ctx.fillStyle=light?'#172330':'#fff';ctx.shadowColor=light?'transparent':'#000';ctx.shadowBlur=3;
        ctx.fillText(String(t.n),t.x,t.y+1);ctx.restore();
    }
    drawSplats();drawGun();drawShots();
    if(playing){
        ctx.save();ctx.strokeStyle=light?'#152a40':'#fff';ctx.lineWidth=1.5;ctx.beginPath();
        ctx.arc(aimX,aimY,9,0,Math.PI*2);
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
            ctx.moveTo(aimX+dx*12,aimY+dy*12);ctx.lineTo(aimX+dx*17,aimY+dy*17);
        }
        ctx.stroke();ctx.restore();
    }
}

function endGame(){
    if(!playing)return;
    playing=false;
    MiWeb.updateExtraStats('disparador-primos',v=>({
        ...v,
        mejorPuntuacion:Math.max(v.mejorPuntuacion||0,score),
        mejorRacha:Math.max(v.mejorRacha||0,bestRunStreak),
        partidas:(v.partidas||0)+1
    }));
    showStats();
    $('mensaje').textContent=T[lang()].over+' '+score;
    $('overlay').classList.remove('oculto');
    $('overlayTitulo').textContent=T[lang()].over+' '+score;
    $('botonInicio').textContent=T[lang()].again;
    MiWeb.refreshRanking('disparador-primos');
    MiWeb.xpAction('game_finish');
}

function loseLife(message){
    lives--;
    streak=0;
    $('mensaje').textContent=message;
    updateHud();
    if(lives<=0)endGame();
}

function tick(ts){
    if(!last)last=ts;
    const dt=Math.min((ts-last)/1000,.05);
    last=ts;

    if(playing){
        spawnTimer-=dt;
        level=1+Math.floor(score/8);

        if(spawnTimer<=0){
            spawn();
            spawnTimer=Math.max(.38,1.05-level*.07);
        }

        for(const t of targets)t.y+=t.speed*dt;

        const escaped=[];
        targets=targets.filter(t=>{
            if(t.y-t.r>canvas.height){
                if(t.prime)escaped.push(t);
                return false;
            }
            return true;
        });

        if(escaped.length){MiWeb.xpAction('wrong');loseLife(T[lang()].escaped);}
    }

    updateEffects(dt);
    draw();

    if(playing||shots.length||splats.length){
        raf=requestAnimationFrame(tick);
    }else{
        last=0;
    }
}

function ensureAnimation(){
    if(!playing&&!shots.length&&!splats.length){
        last=0;
        cancelAnimationFrame(raf);
        raf=requestAnimationFrame(tick);
    }
}

function start(){
    cancelAnimationFrame(raf);
    targets=[];
    shots=[];
    splats=[];
    recoil=0;
    playing=true;
    last=0;
    spawnTimer=.25;
    score=0;
    streak=0;
    bestRunStreak=0;
    lives=3;
    level=1;
    aimX=canvas.width/2;
    aimY=canvas.height/2;
    $('mensaje').textContent='';
    $('overlay').classList.add('oculto');
    updateHud();
    raf=requestAnimationFrame(tick);
}

function canvasPoint(e){
    const rect=canvas.getBoundingClientRect();
    return {
        x:(e.clientX-rect.left)*canvas.width/rect.width,
        y:(e.clientY-rect.top)*canvas.height/rect.height
    };
}

function aimPointer(e){
    const p=canvasPoint(e);
    aimX=Math.max(0,Math.min(canvas.width,p.x));
    aimY=Math.max(0,Math.min(canvas.height,p.y));
    if(!playing&&!shots.length&&!splats.length)draw();
}

function pointer(e){
    if(!playing)return;
    e.preventDefault();

    const p=canvasPoint(e);
    aimX=p.x;
    aimY=p.y;

    let hitIndex=-1;
    for(let i=targets.length-1;i>=0;i--){
        const t=targets[i];
        if((p.x-t.x)**2+(p.y-t.y)**2<=t.r**2){
            hitIndex=i;
            break;
        }
    }

    let color;

    if(hitIndex>=0){
        const t=targets[hitIndex];
        targets.splice(hitIndex,1);

        if(t.prime){
            color=PRIME_COLOR;
            score++;
            streak++;
            bestRunStreak=Math.max(bestRunStreak,streak);
            $('mensaje').textContent=T[lang()].prime;
            MiWeb.xpAction('correct');
        }else{
            color=COMPOSITE_COLOR;
            MiWeb.xpAction('wrong');
            loseLife(T[lang()].composite);
        }

        updateHud();
    }else{
        color=randomEmptyColor();
        $('mensaje').textContent=T[lang()].empty;
    }

    firePaintball(p.x,p.y,color);
    draw();
}

canvas.addEventListener('pointermove',aimPointer);
canvas.addEventListener('pointerdown',pointer);
canvas.addEventListener('pointerenter',aimPointer);

$('botonInicio').addEventListener('click',start);
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
    game:'disparador-primos',
    columns:[
        {key:'mejorPuntuacion',label:{es:'Mejor puntuación',en:'Best score',hy:'Լավագույն միավոր'}},
        {key:'mejorRacha',label:{es:'Mejor racha',en:'Best streak',hy:'Լավագույն շարք'}},
        {key:'partidas',label:{es:'Partidas',en:'Games',hy:'Խաղեր'}}
    ],
    compare:(a,b)=>(b.mejorPuntuacion||0)-(a.mejorPuntuacion||0)||(b.mejorRacha||0)-(a.mejorRacha||0)
});

renderText();
updateHud();
draw();
