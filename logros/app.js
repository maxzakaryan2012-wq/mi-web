(()=>{

const badges=[["primer_xp","⭐","Primer paso","First step","Առաջին քայլ","Consigue 1 XP","Earn 1 XP","Ստացիր 1 XP"],["xp_100","🌟","Aprendiz","Learner","Սկսնակ","Acumula 100 XP","Earn 100 XP","Հավաքիր 100 XP"],["xp_1000","💫","Mil puntos","One thousand","Հազար միավոր","Acumula 1000 XP","Earn 1000 XP","Հավաքիր 1000 XP"],["xp_5000","👑","Maestro del XP","XP master","XP վարպետ","Acumula 5000 XP","Earn 5000 XP","Հավաքիր 5000 XP"],["xp_10000","🏆","Leyenda","Legend","Լեգենդ","Acumula 10 000 XP","Earn 10,000 XP","Հավաքիր 10 000 XP"],["explorador_5","🧭","Explorador","Explorer","Հետազոտող","Juega en 5 juegos diferentes","Play 5 different games","Խաղա 5 տարբեր խաղ"],["explorador_10","🌍","Aventurero","Adventurer","Արկածախնդիր","Juega en 10 juegos diferentes","Play 10 different games","Խաղա 10 տարբեր խաղ"],["2048_128","🔢","Fusión perfecta","Perfect merge","Կատարյալ միացում","Alcanza la ficha 128 en 2048","Reach tile 128 in 2048","2048-ում հասիր 128 սալիկին"],["2048_2048","💎","Rey de 2048","King of 2048","2048-ի արքա","Consigue la ficha 2048","Reach the 2048 tile","Հասիր 2048 սալիկին"],["secuencia_10","🧩","Mente ordenada","Pattern finder","Օրինաչափություն","Racha de 10 en Secuencia","10 streak in Sequence","Հաջորդականությունում 10 շարք"],["secuencia_50","🧠","Genio de secuencias","Sequence genius","Հաջորդականության հանճար","Racha de 50 en Secuencia","50 streak in Sequence","Հաջորդականությունում 50 շարք"],["primos_100","🎯","Cazaprimos","Prime hunter","Պարզ թվերի որսորդ","100 puntos en Disparador de primos","100 points in Prime Shooter","Պարզ թվերի խաղում 100 միավոր"],["verdadero_50","✅","Detector de verdades","Truth detector","Ճշմարտության գիտակ","50 aciertos en Verdadero/Falso","50 correct in True/False","Ճիշտ/սխալ խաղում 50 ճիշտ պատասխան"],["verdadero_10","🎓","Nivel máximo","Maximum level","Առավելագույն մակարդակ","Nivel 10 en Verdadero/Falso","Level 10 in True/False","Ճիշտ/սխալ խաղում մակարդակ 10"],["ajedrez_victoria","♟️","Primera victoria","First victory","Առաջին հաղթանակ","Gana una partida de ajedrez","Win one chess game","Հաղթիր շախմատում"],["ajedrez_mate","♚","Jaque mate","Checkmate","Շախ և մատ","Consigue un jaque mate","Deliver checkmate","Հասցրու շախ և մատ"],["carrera_victoria","🏎️","Piloto veloz","Speed racer","Արագ մրցարշավորդ","Gana una carrera matemática","Win a math race","Հաղթիր մաթեմատիկական մրցավազքում"],["pulsa_100","⚡","Dedos rápidos","Fast fingers","Արագ մատներ","100 puntos en Pulsa el botón","100 points in Button Click","Կոճակի խաղում 100 միավոր"],["dardos_100","🎯","Puntería matemática","Math marksman","Մաթեմատիկական դիպուկահար","100 puntos en Dardos matemáticos","100 points in Math Darts","Մաթեմատիկական տեգերում 100 միավոր"]];
const labels={
es:{title:'Logros y medallas',subtitle:'Completa desafíos y colecciona medallas permanentes.',all:'Todos',earned:'Conseguidos',locked:'Pendientes',progress:'Progreso',total:'Medallas',error:'No se pudieron cargar tus logros de Supabase.',retry:'Reintentar',unlocked:'Desbloqueado',date:'Conseguido el',info:'Las medallas se guardan en Supabase y no dan XP adicional.'},
en:{title:'Achievements and medals',subtitle:'Complete challenges and collect permanent medals.',all:'All',earned:'Unlocked',locked:'Locked',progress:'Progress',total:'Medals',error:'Cannot load your achievements from Supabase.',retry:'Retry',unlocked:'Unlocked',date:'Earned on',info:'Medals are saved in Supabase and do not give extra XP.'},
hy:{title:'Նվաճումներ և մեդալներ',subtitle:'Կատարիր առաջադրանքները և հավաքիր մեդալներ։',all:'Բոլորը',earned:'Ստացված',locked:'Չստացված',progress:'Առաջընթաց',total:'Մեդալներ',error:'Հնարավոր չէ բեռնել մեդալները Supabase-ից։',retry:'Կրկին փորձել',unlocked:'Ստացված',date:'Ստացվել է',info:'Մեդալները պահպանվում են Supabase-ում և լրացուցիչ XP չեն տալիս։'}
};
const $=id=>document.getElementById('logros-'+id);
let entries=[],tab='all';
function lang(){const v=localStorage.getItem('idioma')||'es';return labels[v]?v:'es'}
function node(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
function render(){
 const l=lang(),t=labels[l],ix={es:0,en:1,hy:2}[l],light=localStorage.getItem('tema')==='claro';
 // Language and theme are controlled by the main mi-web header.

 $('title').textContent='🏅 '+t.title;$('subtitle').textContent=t.subtitle;$('info').textContent=t.info;
 $('all').textContent=t.all;$('earned').textContent=t.earned;$('locked').textContent=t.locked;$('retry').textContent=t.retry;
 $('totalLabel').textContent=t.total;$('earnedLabel').textContent=t.earned;$('lockedLabel').textContent=t.locked;
 const obtained=entries.filter(x=>x.unlocked_at).length;
 $('total').textContent=entries.length;$('obtained').textContent=obtained;$('remaining').textContent=entries.length-obtained;
 for(const id of ['all','earned','locked']){const e=$(id);e.classList.toggle('active',tab===id);e.setAttribute('aria-pressed',String(tab===id))}
 const byId=new Map(entries.map(x=>[x.badge_id,x])),grid=$('grid');grid.replaceChildren();
 const filtered=badges.map(b=>({b,x:byId.get(b[0])})).filter(item=>item.x&&(tab==='all'||(tab==='earned')===!!item.x.unlocked_at));
 filtered.sort((a,b)=>Number(!!b.x.unlocked_at)-Number(!!a.x.unlocked_at));
 for(const {b,x} of filtered){
   const got=!!x.unlocked_at,box=node('article','medal '+(got?'obtained':'pending')),emoji=node('div','emoji',b[1]),body=node('div','medal-body');
   const line=node('div','topline');line.append(node('h2','',b[2+ix]),node('span','flag',got?'✓ '+t.unlocked:'🔒 '+t.locked));
   body.append(line,node('p','description',b[5+ix]));
   const value=Math.max(0,Number(x.progress)||0),target=Math.max(1,Number(x.target)||1);
   const counter=node('div','counter');counter.append(node('span','',t.progress),node('strong','',Math.min(value,target).toLocaleString()+' / '+target.toLocaleString()));
   const track=node('div','track'),fill=node('div','fill');fill.style.width=Math.min(100,100*value/target)+'%';track.setAttribute('role','progressbar');track.setAttribute('aria-valuenow',String(Math.min(value,target)));track.setAttribute('aria-valuemax',String(target));track.setAttribute('aria-valuemin','0');track.append(fill);body.append(counter,track);
   if(got)body.append(node('small','date',t.date+' '+new Date(x.unlocked_at).toLocaleDateString(l==='hy'?'hy-AM':l)));
   box.append(emoji,body);grid.append(box);
 }
 $('empty').hidden=filtered.length>0;
}
async function load(){
 $('error').hidden=true;$('loading').hidden=false;
 try{const data=await MiWeb.getAchievements();entries=Array.isArray(data)?data:[];render()}
 catch(e){$('error').hidden=false;$('errorText').textContent=labels[lang()].error;console.warn(e)}
 finally{$('loading').hidden=true}
}
document.querySelectorAll('#logrosSeccion [data-logros-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.logrosTab;render()}));


$('retry').onclick=load;
window.MiWebLogros={show:load,render};
window.addEventListener('miweb-achievements',e=>{
    if(!e.detail || !Array.isArray(e.detail.rows))return;
    entries=e.detail.rows;
    render();
});
render();
if(location.hash==='#logros')load();

})();