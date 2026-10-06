const T={
es:{
title:'🏆 Ranking XP',
desc:'Clasificación global por XP total. Cuanto más juegas, calculas y experimentas, más subes.',
home:'🏠 Inicio',games:'🎮 Juegos',interesting:'✨ Cosas interesantes',calculator:'🧮 Calculadora',ranking:'🏆 Ranking',register:'👤 Registrarse',user:'👤 Usuario',light:'☀️ Claro',dark:'🌙 Oscuro',
players:'Jugadores',allXp:'XP de todos',yourRank:'Tu puesto',
refresh:'↻ Actualizar ranking',loading:'Cargando ranking...',empty:'No hay jugadores con XP todavía.',
rank:'Puesto',player:'Jugador',level:'Nivel',xp:'XP total',progress:'Progreso',you:'TÚ',max:'MÁX'
},
en:{
title:'🏆 XP Ranking',
desc:'Global ranking by total XP. The more you play, calculate and experiment, the higher you climb.',
home:'🏠 Home',games:'🎮 Games',interesting:'✨ Interesting things',calculator:'🧮 Calculators',ranking:'🏆 Ranking',register:'👤 Register',user:'👤 User',light:'☀️ Light',dark:'🌙 Dark',
players:'Players',allXp:'Everyone’s XP',yourRank:'Your rank',
refresh:'↻ Refresh ranking',loading:'Loading ranking...',empty:'No players have XP yet.',
rank:'Rank',player:'Player',level:'Level',xp:'Total XP',progress:'Progress',you:'YOU',max:'MAX'
},
hy:{
title:'🏆 XP վարկանիշ',
desc:'Ընդհանուր վարկանիշ՝ ըստ հավաքած XP-ի։ Որքան շատ խաղաս, հաշվես և փորձեր անես, այնքան բարձր կբարձրանաս։',
home:'🏠 Գլխավոր',games:'🎮 Խաղեր',interesting:'✨ Հետաքրքիր բաներ',calculator:'🧮 Հաշվիչներ',ranking:'🏆 Վարկանիշ',register:'👤 Գրանցվել',user:'👤 Օգտատեր',light:'☀️ Բաց',dark:'🌙 Մութ',
players:'Խաղացողներ',allXp:'Բոլորի XP-ն',yourRank:'Քո տեղը',
refresh:'↻ Թարմացնել վարկանիշը',loading:'Վարկանիշը բեռնվում է...',empty:'Դեռ XP ունեցող խաղացողներ չկան։',
rank:'Տեղ',player:'Խաղացող',level:'Մակարդակ',xp:'Ընդհանուր XP',progress:'Առաջընթաց',you:'ԴՈՒ',max:'MAX'
}
};

const $=id=>document.getElementById(id);
let rows=[];

function lang(){
 const l=localStorage.getItem('idioma');
 return T[l]?l:'es';
}

function fmt(n){
 return new Intl.NumberFormat(lang()).format(Number(n)||0);
}

function setTheme(){
 const claro=localStorage.getItem('tema')==='claro';
 document.body.classList.toggle('claro',claro);
 $('botonTema').textContent=T[lang()][claro?'dark':'light'];
}

function renderText(){
 const t=T[lang()],l=lang();
 document.documentElement.lang=l;
 document.title=t.title.replace(/^🏆 /,'')+' - MI WEB';
 MiWeb.applyLanguage();
 $('titulo').textContent=t.title;
 $('descripcion').textContent=t.desc;
 $('navInicio').textContent=t.home;
 $('navJuegos').textContent=t.games;
 $('navInteresantes').textContent=t.interesting;
 $('navCalculadora').textContent=t.calculator;
 $('navRanking').textContent=t.ranking;
 $('navRegistro').textContent=t.register;
 $('usuarioBarra').textContent=t.user;
 $('txtJugadores').textContent=t.players;
 $('txtXpTodos').textContent=t.allXp;
 $('txtTuPuesto').textContent=t.yourRank;
 $('actualizar').textContent=t.refresh;
 $('thPuesto').textContent=t.rank;
 $('thJugador').textContent=t.player;
 $('thNivel').textContent=t.level;
 $('thXp').textContent=t.xp;
 $('thProgreso').textContent=t.progress;
 $('vacio').textContent=t.empty;
 $('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';
 setTheme();
 renderRanking();
}

function podiumHtml(row,position){
 const medals={1:'🥇',2:'🥈',3:'🥉'};
 if(!row)return '<div class="medalla">'+medals[position]+'</div><strong>—</strong>';
 return '<div class="medalla">'+medals[position]+'</div>'+
   '<strong></strong>'+
   '<div class="nivel"></div>'+
   '<div class="xp"></div>';
}

function renderPodium(){
 [1,2,3].forEach(position=>{
   const box=document.querySelector('[data-podium="'+position+'"]');
   const row=rows[position-1];
   box.innerHTML=podiumHtml(row,position);
   if(!row)return;
   box.querySelector('strong').textContent=row.player_name+(row.is_you?' · '+T[lang()].you:'');
   box.querySelector('.nivel').textContent=T[lang()].level+' '+row.level;
   box.querySelector('.xp').textContent=fmt(row.total_xp)+' XP';
 });
}

function renderRanking(){
 const t=T[lang()];
 $('totalJugadores').textContent=fmt(rows.length);
 $('xpTodos').textContent=fmt(rows.reduce((sum,r)=>sum+Number(r.total_xp||0),0));
 const mine=rows.find(r=>r.is_you);
 $('tuPuesto').textContent=mine?'#'+mine.rank:'—';

 renderPodium();

 const tbody=$('rankingBody');
 tbody.innerHTML='';
 $('vacio').hidden=rows.length>0;

 rows.forEach(row=>{
   const tr=document.createElement('tr');
   if(row.is_you)tr.className='tu';

   const tdRank=document.createElement('td');
   tdRank.className='rank';
   tdRank.textContent='#'+row.rank;

   const tdPlayer=document.createElement('td');
   const name=document.createElement('strong');
   name.textContent=row.player_name;
   tdPlayer.appendChild(name);
   if(row.is_you){
     const badge=document.createElement('span');
     badge.className='tu-badge';
     badge.textContent=t.you;
     tdPlayer.appendChild(badge);
   }

   const tdLevel=document.createElement('td');
   tdLevel.className='nivel-num';
   tdLevel.textContent=t.level+' '+row.level;

   const tdXp=document.createElement('td');
   tdXp.className='xp-num';
   tdXp.textContent=fmt(row.total_xp)+' XP';

   const tdProgress=document.createElement('td');
   if(Number(row.level)>=100){
     tdProgress.textContent=t.max;
   }else{
     const label=document.createElement('div');
     label.textContent=fmt(row.current_xp)+' / '+fmt(row.next_xp)+' XP';
     const bar=document.createElement('div');
     bar.className='progreso';
     const fill=document.createElement('span');
     const pct=Math.max(0,Math.min(100,Number(row.current_xp)/Math.max(1,Number(row.next_xp))*100));
     fill.style.width=pct+'%';
     bar.appendChild(fill);
     tdProgress.append(label,bar);
   }

   tr.append(tdRank,tdPlayer,tdLevel,tdXp,tdProgress);
   tbody.appendChild(tr);
 });
}

async function loadRanking(){
 const t=T[lang()];
 $('actualizar').disabled=true;
 $('estado').textContent=t.loading;
 rows=await MiWeb.getXpLeaderboard();
 $('estado').textContent='';
 $('actualizar').disabled=false;
 renderRanking();
}

$('actualizar').addEventListener('click',loadRanking);
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
window.addEventListener('miweb-xp',()=>loadRanking());

renderText();
loadRanking();