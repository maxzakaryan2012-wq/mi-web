const T={
es:{title:'🔢 Secuencia matemática',desc:'Descubre qué número viene después.',back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',placeholder:'Tu respuesta',check:'✅ Comprobar',next:'🔄 Nueva secuencia',loading:'Preparando juego…',invalid:'⚠️ Escribe un número entero.',correct:'✅ ¡Correcto!',wrong:'❌ No. La respuesta era',hits:'Aciertos',streak:'Racha',plays:'Jugadas',note:'Las secuencias pueden ser de suma/resta, multiplicación, tipo Fibonacci o alternantes.',download:'Descargar código Python'},
en:{title:'🔢 Math sequence',desc:'Work out which number comes next.',back:'← Back',light:'☀️ Light',dark:'🌙 Dark',placeholder:'Your answer',check:'✅ Check',next:'🔄 New sequence',loading:'Preparing game…',invalid:'⚠️ Enter a whole number.',correct:'✅ Correct!',wrong:'❌ No. The answer was',hits:'Correct',streak:'Streak',plays:'Plays',note:'Sequences can use addition/subtraction, multiplication, Fibonacci-style patterns or alternating rules.',download:'Download Python code'},
hy:{title:'🔢 Թվային հաջորդականություն',desc:'Գուշակիր, թե որ թիվն է հաջորդը։',back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',placeholder:'Քո պատասխանը',check:'✅ Ստուգել',next:'🔄 Նոր հաջորդականություն',loading:'Խաղը պատրաստվում է…',invalid:'⚠️ Գրիր ամբողջ թիվ։',correct:'✅ Ճիշտ է։',wrong:'❌ Ոչ։ Ճիշտ պատասխանն էր',hits:'Ճիշտ',streak:'Շարք',plays:'Փորձեր',note:'Հաջորդականությունները կարող են լինել գումարում/հանում, բազմապատկում, Fibonacci-ի նման կամ հերթագայվող կանոններով։',download:'Ներբեռնել Python կոդը'}
};
const $=id=>document.getElementById(id);
let py=null,juego=null,resuelto=false,aciertos=0,racha=0,jugadas=0;

function lang(){const x=localStorage.getItem('idioma');return T[x]?x:'es'}
function rnd(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function choice(a){return a[Math.floor(Math.random()*a.length)]}
function setTheme(){const claro=localStorage.getItem('tema')==='claro';document.body.classList.toggle('claro',claro);$('botonTema').textContent=T[lang()][claro?'dark':'light']}
function renderText(){const l=lang(),t=T[l];document.documentElement.lang=l;document.title=t.title.replace(/^🔢 /,'')+' - MI WEB';MiWeb.applyLanguage();$('titulo').textContent=t.title;$('descripcion').textContent=t.desc;$('volver').textContent=t.back;$('respuesta').placeholder=t.placeholder;$('botonComprobar').textContent=t.check;$('botonNueva').textContent=t.next;$('textoAciertos').textContent=t.hits;$('textoRacha').textContent=t.streak;$('textoJugadas').textContent=t.plays;$('nota').textContent=t.note;$('descarga').textContent=t.download;$('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';setTheme()}
function actualizarMarcador(){$('aciertos').textContent=aciertos;$('racha').textContent=racha;$('jugadas').textContent=jugadas}

function nuevaJS(){
 const tipo=choice(['aritmetica','geometrica','fibonacci','alternante']);let seq=[],explicacion='';
 if(tipo==='aritmetica'){const inicio=rnd(-20,30);let paso=0;while(paso===0)paso=rnd(-12,12);seq=Array.from({length:6},(_,i)=>inicio+paso*i);explicacion='Cada número cambia en '+(paso>=0?'+':'')+paso+'.'}
 else if(tipo==='geometrica'){const inicio=rnd(1,8),factor=choice([2,3,4]);seq=Array.from({length:6},(_,i)=>inicio*(factor**i));explicacion='Cada número se multiplica por '+factor+'.'}
 else if(tipo==='fibonacci'){seq=[rnd(1,8),rnd(2,12)];while(seq.length<6)seq.push(seq.at(-1)+seq.at(-2));explicacion='Cada número es la suma de los dos anteriores.'}
 else{const inicio=rnd(0,15),suma=rnd(2,8),resta=rnd(1,5);seq=[inicio];for(let i=0;i<5;i++)seq.push(seq.at(-1)+(i%2===0?suma:-resta));explicacion='Alterna +'+suma+' y -'+resta+'.'}
 return {visible:seq.slice(0,5),respuesta:seq[5],tipo,explicacion};
}

function traducirExplicacion(j){
 if(lang()==='es')return j.explicacion;
 if(j.tipo==='fibonacci')return lang()==='en'?'Each number is the sum of the previous two.':'Յուրաքանչյուր թիվ նախորդ երկուսի գումարն է։';
 if(j.tipo==='geometrica'){const f=j.visible[1]/j.visible[0];return lang()==='en'?'Each number is multiplied by '+f+'.':'Յուրաքանչյուր թիվ բազմապատկվում է '+f+'-ով։'}
 if(j.tipo==='aritmetica'){const d=j.visible[1]-j.visible[0],sign=d>=0?'+':'';return lang()==='en'?'Each number changes by '+sign+d+'.':'Յուրաքանչյուր թիվ փոխվում է '+sign+d+'-ով։'}
 return lang()==='en'?'The rule alternates between two changes.':'Կանոնը հերթափոխում է երկու փոփոխություն։'
}

async function nueva(){
 if(py){const fn=py.globals.get('nueva_json');try{juego=JSON.parse(fn())}catch(e){console.warn('Python sequence fallback',e);juego=nuevaJS()}finally{fn.destroy()}}
 else juego=nuevaJS();
 resuelto=false;$('secuencia').textContent=juego.visible.join(', ')+', ?';$('respuesta').value='';$('mensaje').textContent='';$('explicacion').textContent='';$('botonComprobar').disabled=false;$('botonNueva').disabled=true;$('respuesta').focus();
}

async function init(){
 renderText();$('mensaje').textContent=T[lang()].loading;
 try{
  if(!window.loadPyodide)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  py=await window.loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});
  const r=await fetch('secuencia.py',{cache:'no-store'});if(!r.ok)throw new Error('Python file '+r.status);
  await py.runPythonAsync(await r.text());
 }catch(e){console.warn('Pyodide no disponible; se usa modo compatible.',e);py=null}
 $('botonNueva').disabled=false;await nueva();
}

$('formulario').addEventListener('submit',e=>{
 e.preventDefault();if(!juego||resuelto)return;
 let r;
 if(py){const fn=py.globals.get('comprobar_json');try{r=JSON.parse(fn(String(juego.respuesta),$('respuesta').value))}catch(e){console.warn('Python check fallback',e)}finally{fn.destroy()}}
 if(!r){const texto=$('respuesta').value.trim(),n=Number(texto);r=!texto||!Number.isInteger(n)?{error:'invalid'}:{correcto:n===juego.respuesta,respuesta:juego.respuesta}}
 const t=T[lang()];if(r.error){$('mensaje').textContent=t.invalid;return}
 resuelto=true;jugadas++;if(r.correcto){aciertos++;racha++;$('mensaje').textContent=t.correct}else{racha=0;$('mensaje').textContent=t.wrong+' '+r.respuesta}
 $('explicacion').textContent=traducirExplicacion(juego);$('botonComprobar').disabled=true;$('botonNueva').disabled=false;actualizarMarcador();
});

$('botonNueva').addEventListener('click',nueva);
$('botonIdioma').onclick=()=>{$('menuIdiomas').style.display=$('menuIdiomas').style.display==='block'?'none':'block'};
$('menuIdiomas').addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(!b)return;localStorage.setItem('idioma',b.dataset.lang);$('menuIdiomas').style.display='none';renderText();if(resuelto&&juego)$('explicacion').textContent=traducirExplicacion(juego)});
$('botonTema').onclick=()=>{localStorage.setItem('tema',localStorage.getItem('tema')==='claro'?'oscuro':'claro');renderText()};
document.addEventListener('click',e=>{if(!e.target.closest('.menu-idioma'))$('menuIdiomas').style.display='none'});
actualizarMarcador();init();