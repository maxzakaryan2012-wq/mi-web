const T={
es:{title:'🔢 2048',desc:'Une fichas iguales hasta conseguir 2048. Puedes seguir jugando después.',back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',points:'Puntos',best:'Mejor',tile:'Mayor ficha',new:'🔄 Nueva partida',note:'Usa las flechas o WASD. En móvil también puedes deslizar sobre el tablero.',win:'🎉 ¡Has conseguido 2048! Puedes seguir jugando.',over:'💥 No quedan movimientos. Fin de la partida.'},
en:{title:'🔢 2048',desc:'Merge equal tiles until you reach 2048. You can keep playing afterwards.',back:'← Back',light:'☀️ Light',dark:'🌙 Dark',points:'Score',best:'Best',tile:'Highest tile',new:'🔄 New game',note:'Use the arrow keys or WASD. On mobile you can also swipe on the board.',win:'🎉 You reached 2048! You can keep playing.',over:'💥 No moves left. Game over.'},
hy:{title:'🔢 2048',desc:'Միացրու նույն թվերով վանդակները մինչև ստանաս 2048։ Հետո կարող ես շարունակել խաղալ։',back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',points:'Միավորներ',best:'Լավագույն',tile:'Ամենամեծ վանդակ',new:'🔄 Նոր խաղ',note:'Օգտագործիր սլաքները կամ WASD։ Հեռախոսում կարող ես նաև սահեցնել տախտակի վրա։',win:'🎉 Դու ստացար 2048։ Կարող ես շարունակել խաղալ։',over:'💥 Այլ քայլ չկա։ Խաղն ավարտվեց։'}
};

const $=id=>document.getElementById(id);
const SIZE=4;
const SAVE_KEY='miWeb2048CurrentV1';
const BEST_KEY='miWeb2048BestV1';

let board=Array(SIZE*SIZE).fill(0);
let score=0;
let wonShown=false;
let ended=false;
let movedAtLeastOnce=false;
let touchStart=null;
let newIndex=-1;
let mergedIndices=new Set();

function lang(){
    const l=localStorage.getItem('idioma');
    return T[l]?l:'es';
}

function currentStats(){
    const all=MiWeb.readExtraStats('2048');
    return all[MiWeb.profile().id]||{mejorPuntuacion:0,mejorCasilla:0,partidas:0};
}

function localBest(){
    return Math.max(Number(localStorage.getItem(BEST_KEY))||0,currentStats().mejorPuntuacion||0);
}

function maxTile(){
    return Math.max(0,...board);
}

function saveCurrent(){
    localStorage.setItem(SAVE_KEY,JSON.stringify({board,score,wonShown,ended,movedAtLeastOnce}));
    localStorage.setItem(BEST_KEY,String(Math.max(localBest(),score)));
}

function loadCurrent(){
    try{
        const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
        if(s&&Array.isArray(s.board)&&s.board.length===16&&s.board.every(n=>Number.isInteger(n)&&n>=0)){
            board=s.board;
            score=Number(s.score)||0;
            wonShown=!!s.wonShown;
            ended=!!s.ended;
            movedAtLeastOnce=!!s.movedAtLeastOnce;
            return true;
        }
    }catch{}
    return false;
}

function syncFinishedGame(increment){
    const bestScore=Math.max(score,localBest());
    const tile=maxTile();
    localStorage.setItem(BEST_KEY,String(bestScore));
    MiWeb.updateExtraStats('2048',v=>({
        ...v,
        mejorPuntuacion:Math.max(v.mejorPuntuacion||0,bestScore),
        mejorCasilla:Math.max(v.mejorCasilla||0,tile),
        partidas:(v.partidas||0)+(increment?1:0)
    }));
}

function emptyCells(){
    const out=[];
    board.forEach((v,i)=>{if(v===0)out.push(i)});
    return out;
}

function addRandomTile(){
    const empty=emptyCells();
    if(!empty.length)return;
    const i=empty[Math.floor(Math.random()*empty.length)];
    board[i]=Math.random()<.9?2:4;
    newIndex=i;
}

function startNew(countPrevious=true){
    if(countPrevious&&movedAtLeastOnce&&!ended)syncFinishedGame(true);
    board=Array(16).fill(0);
    score=0;
    wonShown=false;
    ended=false;
    movedAtLeastOnce=false;
    newIndex=-1;
    mergedIndices.clear();
    addRandomTile();
    addRandomTile();
    $('mensaje').textContent='';
    saveCurrent();
    render();
}

function lineValues(indices){
    return indices.map(i=>board[i]);
}

function collapse(values){
    const filtered=values.filter(Boolean);
    const result=[];
    const mergePositions=[];
    let gained=0;
    for(let i=0;i<filtered.length;i++){
        if(i+1<filtered.length&&filtered[i]===filtered[i+1]){
            const value=filtered[i]*2;
            result.push(value);
            gained+=value;
            mergePositions.push(result.length-1);
            i++;
        }else result.push(filtered[i]);
    }
    while(result.length<SIZE)result.push(0);
    return {result,gained,mergePositions};
}

function getLines(direction){
    const lines=[];
    if(direction==='left'||direction==='right'){
        for(let r=0;r<SIZE;r++){
            let line=[0,1,2,3].map(c=>r*SIZE+c);
            if(direction==='right')line.reverse();
            lines.push(line);
        }
    }else{
        for(let c=0;c<SIZE;c++){
            let line=[0,1,2,3].map(r=>r*SIZE+c);
            if(direction==='down')line.reverse();
            lines.push(line);
        }
    }
    return lines;
}

function move(direction){
    if(ended)return;
    const before=board.slice();
    let gained=0;
    mergedIndices.clear();
    newIndex=-1;

    for(const indices of getLines(direction)){
        const {result,gained:lineGain,mergePositions}=collapse(lineValues(indices));
        gained+=lineGain;
        result.forEach((v,j)=>board[indices[j]]=v);
        mergePositions.forEach(j=>mergedIndices.add(indices[j]));
    }

    if(before.every((v,i)=>v===board[i]))return;

    movedAtLeastOnce=true;
    score+=gained;
    addRandomTile();

    if(!wonShown&&maxTile()>=2048){
        wonShown=true;
        $('mensaje').textContent=T[lang()].win;
    }

    if(!canMove()){
        ended=true;
        $('mensaje').textContent=T[lang()].over;
        syncFinishedGame(true);
    }

    saveCurrent();
    render();
}

function canMove(){
    if(board.some(v=>v===0))return true;
    for(let r=0;r<SIZE;r++){
        for(let c=0;c<SIZE;c++){
            const i=r*SIZE+c;
            if(c<SIZE-1&&board[i]===board[i+1])return true;
            if(r<SIZE-1&&board[i]===board[i+SIZE])return true;
        }
    }
    return false;
}

function tileClass(value){
    if(!value)return '';
    return value<=2048?'v'+value:(value<=8192?'v'+value:'vbig');
}

function render(){
    const grid=$('tablero');
    grid.innerHTML='';
    board.forEach((value,i)=>{
        const cell=document.createElement('div');
        cell.className='celda';
        if(value){
            cell.classList.add(tileClass(value));
            cell.textContent=value;
        }
        if(i===newIndex)cell.classList.add('nueva');
        if(mergedIndices.has(i))cell.classList.add('merge');
        grid.appendChild(cell);
    });
    $('puntos').textContent=score.toLocaleString(document.documentElement.lang||'es');
    $('mejor').textContent=Math.max(localBest(),score).toLocaleString(document.documentElement.lang||'es');
    $('mayor').textContent=maxTile()||2;
}

function setTheme(){
    const claro=localStorage.getItem('tema')==='claro';
    document.body.classList.toggle('claro',claro);
    $('botonTema').textContent=T[lang()][claro?'dark':'light'];
}

function renderText(){
    const t=T[lang()],l=lang();
    document.documentElement.lang=l;
    document.title='2048 - MI WEB';
    MiWeb.applyLanguage();
    $('titulo').textContent=t.title;
    $('descripcion').textContent=t.desc;
    $('volver').textContent=t.back;
    $('txtPuntos').textContent=t.points;
    $('txtMejor').textContent=t.best;
    $('txtMayor').textContent=t.tile;
    $('nuevo').textContent=t.new;
    $('nota').textContent=t.note;
    $('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';
    if(ended)$('mensaje').textContent=t.over;
    else if(wonShown)$('mensaje').textContent=t.win;
    setTheme();
    render();
    MiWeb.refreshRanking('2048');
}

function directionFromKey(key){
    const k=key.toLowerCase();
    if(k==='arrowleft'||k==='a')return'left';
    if(k==='arrowright'||k==='d')return'right';
    if(k==='arrowup'||k==='w')return'up';
    if(k==='arrowdown'||k==='s')return'down';
    return null;
}

addEventListener('keydown',e=>{
    const d=directionFromKey(e.key);
    if(!d)return;
    e.preventDefault();
    move(d);
});

document.querySelectorAll('[data-dir]').forEach(b=>{
    b.addEventListener('click',()=>move(b.dataset.dir));
});

$('tablero').addEventListener('pointerdown',e=>{
    touchStart={x:e.clientX,y:e.clientY};
});

$('tablero').addEventListener('pointerup',e=>{
    if(!touchStart)return;
    const dx=e.clientX-touchStart.x;
    const dy=e.clientY-touchStart.y;
    touchStart=null;
    if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;
    move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
});

$('nuevo').addEventListener('click',()=>startNew(true));

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
    game:'2048',
    columns:[
        {key:'mejorPuntuacion',label:{es:'Mejor puntuación',en:'Best score',hy:'Լավագույն միավոր'}},
        {key:'mejorCasilla',label:{es:'Mayor ficha',en:'Highest tile',hy:'Ամենամեծ վանդակ'}},
        {key:'partidas',label:{es:'Partidas',en:'Games',hy:'Խաղեր'}}
    ],
    compare:(a,b)=>(b.mejorPuntuacion||0)-(a.mejorPuntuacion||0)||(b.mejorCasilla||0)-(a.mejorCasilla||0)
});

if(!loadCurrent())startNew(false);
renderText();
