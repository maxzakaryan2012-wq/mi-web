import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm';

const $=id=>document.getElementById(id);
const GAME='ajedrez';
const PIECES={
  wp:'♙',wn:'♘',wb:'♗',wr:'♖',wq:'♕',wk:'♔',
  bp:'♟',bn:'♞',bb:'♝',br:'♜',bq:'♛',bk:'♚'
};
const VALUES={p:1,n:3,b:3,r:5,q:9,k:0};
const T={
es:{title:'♟️ Ajedrez',desc:'Juega con blancas contra el bot. Cada movimiento legal suma XP y las jugadas especiales dan bonificaciones.',back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',you:'Tú · Blancas',bot:'Bot · Negras',yourTurn:'Tu turno',botTurn:'El bot está pensando…',select:'Selecciona una pieza blanca.',illegal:'Movimiento no permitido.',check:'⚠️ Jaque al rey negro.',botCheck:'⚠️ El bot te ha dado jaque.',mateWin:'🏆 ¡Jaque mate! Has ganado.',mateLose:'♟️ Jaque mate. Gana el bot.',draw:'🤝 Tablas.',resigned:'🏳️ Te has rendido.',newGame:'♟️ Nueva partida',resign:'🏳️ Rendirse',xpTitle:'⭐ XP por jugada',move:'Movimiento',checkLab:'Jaque',mate:'Jaque mate',castle:'Enroque',capture:'Captura',captureValue:'+ valor',gameXp:'XP partida',checks:'Jaques',captures:'Capturas',history:'Movimientos',legend:'Valor de captura: peón 1 · caballo 3 · alfil 3 · torre 5 · dama 9. La promoción es automática a dama.'},
en:{title:'♟️ Chess',desc:'Play White against the bot. Every legal move earns XP and special moves give bonuses.',back:'← Back',light:'☀️ Light',dark:'🌙 Dark',you:'You · White',bot:'Bot · Black',yourTurn:'Your turn',botTurn:'Bot is thinking…',select:'Select a white piece.',illegal:'Illegal move.',check:'⚠️ Black king is in check.',botCheck:'⚠️ The bot checked your king.',mateWin:'🏆 Checkmate! You win.',mateLose:'♟️ Checkmate. Bot wins.',draw:'🤝 Draw.',resigned:'🏳️ You resigned.',newGame:'♟️ New game',resign:'🏳️ Resign',xpTitle:'⭐ XP per move',move:'Move',checkLab:'Check',mate:'Checkmate',castle:'Castling',capture:'Capture',captureValue:'+ value',gameXp:'Game XP',checks:'Checks',captures:'Captures',history:'Moves',legend:'Capture value: pawn 1 · knight 3 · bishop 3 · rook 5 · queen 9. Promotion is automatic to queen.'},
hy:{title:'♟️ Շախմատ',desc:'Խաղա սպիտակներով բոտի դեմ։ Յուրաքանչյուր օրինական քայլ XP է տալիս, իսկ հատուկ քայլերը՝ հավելյալ XP։',back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',you:'Դու · Սպիտակներ',bot:'Բոտ · Սևեր',yourTurn:'Քո հերթն է',botTurn:'Բոտը մտածում է…',select:'Ընտրիր սպիտակ խաղաքար։',illegal:'Անթույլատրելի քայլ։',check:'⚠️ Շախ սև արքային։',botCheck:'⚠️ Բոտը շախ է տվել։',mateWin:'🏆 Մատ։ Դու հաղթեցիր։',mateLose:'♟️ Մատ։ Բոտը հաղթեց։',draw:'🤝 Ոչ-ոքի։',resigned:'🏳️ Դու հանձնվեցիր։',newGame:'♟️ Նոր խաղ',resign:'🏳️ Հանձնվել',xpTitle:'⭐ XP յուրաքանչյուր քայլի համար',move:'Քայլ',checkLab:'Շախ',mate:'Մատ',castle:'Ռոկիրովկա',capture:'Վերցնել',captureValue:'+ արժեք',gameXp:'Խաղի XP',checks:'Շախեր',captures:'Վերցրած',history:'Քայլեր',legend:'Վերցնելու արժեք՝ զինվոր 1 · ձի 3 · փիղ 3 · նավակ 5 · թագուհի 9։ Փոխարկումը ավտոմատ թագուհու է։'}
};

let game=new Chess();
let selected=null;
let legal=[];
let locked=false;
let ended=false;
let statsRun={xp:0,checks:0,captures:0,mates:0};
let lastMove=null;
let gameSerial=0;

function lang(){const l=localStorage.getItem('idioma');return T[l]?l:'es'}

function squareName(row,col){
 const file=String.fromCharCode(97+col);
 const rank=8-row;
 return file+rank;
}

function renderBoard(){
 const board=$('tablero');
 board.innerHTML='';
 for(let row=0;row<8;row++){
   for(let col=0;col<8;col++){
     const sq=squareName(row,col);
     const piece=game.get(sq);
     const b=document.createElement('button');
     b.type='button';
     b.className='casilla '+((row+col)%2===0?'clara':'oscura');
     if(selected===sq)b.classList.add('sel');
     if(lastMove&&(lastMove.from===sq||lastMove.to===sq))b.classList.add('ultimo');
     const move=legal.find(m=>m.to===sq);
     if(move)b.classList.add(move.captured?'captura':'legal');
     b.dataset.square=sq;
     if(piece){
       const span=document.createElement('span');
       span.className='pieza';
       span.textContent=PIECES[piece.color+piece.type];
       b.appendChild(span);
     }
     if(row===7){
       const c=document.createElement('span');c.className='coord file';c.textContent=String.fromCharCode(97+col);b.appendChild(c);
     }
     if(col===0){
       const c=document.createElement('span');c.className='coord rank';c.textContent=8-row;b.appendChild(c);
     }
     b.addEventListener('click',()=>clickSquare(sq));
     board.appendChild(b);
   }
 }
 renderHistory();
}

function clickSquare(sq){
 if(locked||ended||game.turn()!=='w')return;
 const p=game.get(sq);

 if(selected){
   const candidate=legal.find(m=>m.to===sq);
   if(candidate){
     doPlayerMove(selected,sq);
     return;
   }
   if(p&&p.color==='w'){
     selectSquare(sq);
     return;
   }
   selected=null;legal=[];renderBoard();
   $('mensaje').textContent=T[lang()].illegal;
   return;
 }
 if(p&&p.color==='w')selectSquare(sq);
}

function selectSquare(sq){
 selected=sq;
 legal=game.moves({square:sq,verbose:true});
 renderBoard();
}

async function doPlayerMove(from,to){
 const piece=game.get(from);
 const promotion=piece&&piece.type==='p'&&(to.endsWith('8'))?'q':undefined;
 let move;
 try{move=game.move({from,to,promotion});}catch{move=null}
 if(!move){$('mensaje').textContent=T[lang()].illegal;return}

 selected=null;legal=[];lastMove={from:move.from,to:move.to};
 locked=true;

 const isMate=game.isCheckmate();
 const isCheck=game.isCheck();
 const isCastle=move.flags.includes('k')||move.flags.includes('q');
 const captured=move.captured||null;
 if(captured)statsRun.captures++;
 if(isCheck)statsRun.checks++;
 if(isMate)statsRun.mates++;

 const award=await MiWeb.awardChessMoveXp({
   captured,
   check:isCheck,
   mate:isMate,
   castle:isCastle
 });
 statsRun.xp+=Math.max(0,Number(award&&award.awarded)||0);

 updateHud();
 renderBoard();

 if(isMate){
   finishGame('win');
   return;
 }
 if(game.isDraw()||game.isGameOver()){
   finishGame('draw');
   return;
 }

 $('mensaje').textContent=isCheck?T[lang()].check:T[lang()].botTurn;
 $('mensaje').className='mensaje '+(isCheck?'check':'');
 $('turno').textContent=T[lang()].botTurn;
 $('turno').classList.add('bot-pensando');

 const serial=gameSerial;
 setTimeout(()=>botMove(serial),480+Math.random()*420);
}

function botMove(serial){
 if(serial!==gameSerial||ended||game.turn()!=='b')return;
 const moves=game.moves({verbose:true});
 if(!moves.length){finishGame(game.isCheckmate()?'win':'draw');return}

 let best=null,bestScore=-Infinity;
 for(const m of moves){
   const temp=new Chess(game.fen());
   const spec={from:m.from,to:m.to};
   if(m.promotion)spec.promotion=m.promotion;
   temp.move(spec);
   let score=Math.random()*2;
   if(m.captured)score+=(VALUES[m.captured]||0)*8;
   if(m.promotion)score+=7;
   if(temp.isCheck())score+=4;
   if(temp.isCheckmate())score+=10000;
   // Prefer central squares slightly.
   const file=m.to.charCodeAt(0)-97,rank=Number(m.to[1])-1;
   score+=(3.5-Math.abs(file-3.5))*.15+(3.5-Math.abs(rank-3.5))*.15;
   if(score>bestScore){bestScore=score;best=m}
 }
 const spec={from:best.from,to:best.to};
 if(best.promotion)spec.promotion=best.promotion;
 const move=game.move(spec);
 lastMove={from:move.from,to:move.to};
 renderBoard();

 if(game.isCheckmate()){finishGame('loss');return}
 if(game.isDraw()||game.isGameOver()){finishGame('draw');return}

 locked=false;
 $('turno').classList.remove('bot-pensando');
 $('turno').textContent=T[lang()].yourTurn;
 $('mensaje').textContent=game.isCheck()?T[lang()].botCheck:T[lang()].select;
 $('mensaje').className='mensaje '+(game.isCheck()?'check':'');
}

function finishGame(result){
 if(ended)return;
 ended=true;locked=true;selected=null;legal=[];
 $('turno').classList.remove('bot-pensando');
 const t=T[lang()];
 if(result==='win'){
   $('mensaje').textContent=t.mateWin;$('mensaje').className='mensaje win';
 }else if(result==='loss'){
   $('mensaje').textContent=t.mateLose;$('mensaje').className='mensaje lose';
 }else if(result==='resign'){
   $('mensaje').textContent=t.resigned;$('mensaje').className='mensaje lose';
 }else{
   $('mensaje').textContent=t.draw;$('mensaje').className='mensaje';
 }
 saveStats(result);
 renderBoard();
}

function saveStats(result){
 MiWeb.updateExtraStats(GAME,v=>({
   ...v,
   victorias:(v.victorias||0)+(result==='win'?1:0),
   mates:(v.mates||0)+statsRun.mates,
   jaques:(v.jaques||0)+statsRun.checks,
   capturas:(v.capturas||0)+statsRun.captures,
   partidas:(v.partidas||0)+1,
   mejorXp:Math.max(v.mejorXp||0,statsRun.xp)
 }));
}

function newGame(){
 gameSerial++;
 game=new Chess();selected=null;legal=[];locked=false;ended=false;lastMove=null;
 statsRun={xp:0,checks:0,captures:0,mates:0};
 updateHud();renderBoard();
 $('mensaje').textContent=T[lang()].select;$('mensaje').className='mensaje';
 $('turno').textContent=T[lang()].yourTurn;$('turno').classList.remove('bot-pensando');
}

function renderHistory(){
 const list=$('historial');list.innerHTML='';
 const moves=game.history();
 moves.forEach(m=>{const li=document.createElement('li');li.textContent=m;list.appendChild(li)});
}

function updateHud(){
 $('xpPartida').textContent=statsRun.xp;
 $('jaques').textContent=statsRun.checks;
 $('capturas').textContent=statsRun.captures;
}

function setTheme(){
 const claro=localStorage.getItem('tema')==='claro';
 document.body.classList.toggle('claro',claro);
 $('botonTema').textContent=T[lang()][claro?'dark':'light'];
}

function renderText(){
 const t=T[lang()],l=lang();
 document.documentElement.lang=l;
 document.title=t.title.replace(/^♟️ /,'')+' - MI WEB';
 $('titulo').textContent=t.title;$('descripcion').textContent=t.desc;$('volver').textContent=t.back;
 $('tuNombre').textContent=t.you;$('botNombre').textContent=t.bot;
 $('tituloXp').textContent=t.xpTitle;$('labMovimiento').textContent=t.move;$('labJaque').textContent=t.checkLab;
 $('labMate').textContent=t.mate;$('labEnroque').textContent=t.castle;$('labCaptura').textContent=t.capture;
 $('capturaValores').textContent=t.captureValue;$('labXpPartida').textContent=t.gameXp;
 $('labJaques').textContent=t.checks;$('labCapturas').textContent=t.captures;$('tituloHistorial').textContent=t.history;
 $('leyenda').textContent=t.legend;$('nueva').textContent=t.newGame;$('rendirse').textContent=t.resign;
 $('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';
 if(!ended&&!locked)$('turno').textContent=t.yourTurn;
 setTheme();renderBoard();MiWeb.refreshRanking(GAME);
}

$('nueva').addEventListener('click',newGame);
$('rendirse').addEventListener('click',()=>{if(!ended)finishGame('resign')});
$('botonIdioma').onclick=()=>{$('menuIdiomas').style.display=$('menuIdiomas').style.display==='block'?'none':'block'};
$('menuIdiomas').addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(!b)return;localStorage.setItem('idioma',b.dataset.lang);$('menuIdiomas').style.display='none';renderText()});
$('botonTema').onclick=()=>{localStorage.setItem('tema',localStorage.getItem('tema')==='claro'?'oscuro':'claro');renderText()};
document.addEventListener('click',e=>{if(!e.target.closest('.menu-idioma'))$('menuIdiomas').style.display='none'});

MiWeb.mountRanking({
 game:GAME,
 columns:[
  {key:'victorias',label:{es:'Victorias',en:'Wins',hy:'Հաղթանակներ'}},
  {key:'mates',label:{es:'Mates',en:'Mates',hy:'Մատեր'}},
  {key:'mejorXp',label:{es:'Mejor XP',en:'Best XP',hy:'Լավագույն XP'}},
  {key:'partidas',label:{es:'Partidas',en:'Games',hy:'Խաղեր'}}
 ],
 compare:(a,b)=>(b.victorias||0)-(a.victorias||0)||(b.mates||0)-(a.mates||0)||(b.mejorXp||0)-(a.mejorXp||0)
});

renderText();updateHud();