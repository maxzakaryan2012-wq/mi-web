const T={
es:{title:'📐 Triángulo de Pitágoras',desc:'Introduce dos lados y calcula el tercero paso a paso.',back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',missing:'¿Qué lado falta?',a:'Cateto (a)',b:'Cateto (b)',c:'Hipotenusa (c)',note:'Usa la misma unidad en ambas medidas. Puedes usar punto o coma para los decimales.',calc:'📐 Calcular',loading:'Preparando Python…',ready:'Listo.',failed:'⚠️ No se pudo cargar Python. Revisa la conexión y recarga.',positive:'⚠️ Escribe dos medidas positivas válidas.',hypotenuse:'⚠️ La hipotenusa debe ser mayor que el cateto.',download:'Descargar código Python',rounded:'Resultado aproximado.'},
en:{title:'📐 Pythagorean triangle',desc:'Enter two sides and calculate the third step by step.',back:'← Back',light:'☀️ Light',dark:'🌙 Dark',missing:'Which side is missing?',a:'Leg (a)',b:'Leg (b)',c:'Hypotenuse (c)',note:'Use the same unit for both measurements. Decimal points or commas are accepted.',calc:'📐 Calculate',loading:'Preparing Python…',ready:'Ready.',failed:'⚠️ Python could not be loaded. Check your connection and reload.',positive:'⚠️ Enter two valid positive measurements.',hypotenuse:'⚠️ The hypotenuse must be longer than the leg.',download:'Download Python code',rounded:'Approximate result.'},
hy:{title:'📐 Պյութագորասի եռանկյուն',desc:'Մուտքագրիր երկու կողմը և քայլ առ քայլ հաշվիր երրորդը։',back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',missing:'Ո՞ր կողմն է անհայտ։',a:'Էջ (a)',b:'Էջ (b)',c:'Ներքնաձիգ (c)',note:'Երկու չափերի համար օգտագործիր նույն միավորը։ Կարելի է գրել կետով կամ ստորակետով։',calc:'📐 Հաշվել',loading:'Python-ը պատրաստվում է…',ready:'Պատրաստ է։',failed:'⚠️ Python-ը չբեռնվեց։ Ստուգիր կապը և թարմացրու էջը։',positive:'⚠️ Գրիր երկու ճիշտ դրական չափ։',hypotenuse:'⚠️ Ներքնաձիգը պետք է էջից մեծ լինի։',download:'Ներբեռնել Python կոդը',rounded:'Մոտավոր արդյունք։'}
};
const $=id=>document.getElementById(id);let py=null,state='loading',answer=null;
function lang(){const x=localStorage.getItem('idioma');return T[x]?x:'es'}
function setTheme(){const claro=localStorage.getItem('tema')==='claro';document.body.classList.toggle('claro',claro);$('botonTema').textContent=T[lang()][claro?'dark':'light']}
function render(){
 const l=lang(),t=T[l];document.documentElement.lang=l;document.title=t.title.replace(/^📐 /,'')+' - MI WEB';MiWeb.applyLanguage();
 $('titulo').textContent=t.title;$('descripcion').textContent=t.desc;$('volver').textContent=t.back;$('labelFalta').textContent=t.missing;$('nota').textContent=t.note;$('botonCalcular').textContent=t.calc;$('descarga').textContent=t.download;
 $('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';const side=$('lado').value;
 [...$('lado').options].forEach(o=>o.textContent=t[o.value]);$('etiqueta1').textContent=t[side==='c'?'a':'c'];$('etiqueta2').textContent=t[side==='b'?'a':'b'];$('primero').placeholder=side==='c'?'3':'5';$('segundo').placeholder=side==='b'?'3':'4';
 $('botonCalcular').disabled=!py;$('estado').textContent=state==='loading'?t.loading:state==='failed'?t.failed:state==='ready'?t.ready:'';
 if(!answer){$('resultado').textContent='—';$('pasos').textContent='';}else if(answer.error){$('resultado').textContent=t[answer.error]||t.failed;$('pasos').textContent='';}else{
  const f=n=>new Intl.NumberFormat(l,{maximumSignificantDigits:10}).format(n),s=answer.lado,sign=s==='c'?'+':'−';
  $('resultado').textContent=`${s} ≈ ${f(answer.resultado)}`;
  $('pasos').textContent=`a² + b² = c²\n${s}² = ${s==='c'?'a² + b²':`c² − ${s==='a'?'b':'a'}²`}\n${s}² = ${f(answer.x)}² ${sign} ${f(answer.y)}²\n${s} = √(${f(answer.cuadrado)}) ≈ ${f(answer.resultado)}\n${t.rounded}`;
 } setTheme();
}
async function initPython(){state='loading';render();try{
 if(!window.loadPyodide)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});
 py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});const r=await fetch('calculadora.py');if(!r.ok)throw Error();await py.runPythonAsync(await r.text());state='ready';
}catch(e){console.error(e);state='failed'}render()}
$('formulario').addEventListener('submit',e=>{e.preventDefault();if(!py)return;const fn=py.globals.get('calcular_json');try{answer=JSON.parse(fn($('lado').value,$('primero').value,$('segundo').value))}catch(e){answer={error:'failed'}}finally{fn.destroy()}if(answer&&!answer.error)MiWeb.updateExtraStats('pitagoras',v=>({...v,calculos:(v.calculos||0)+1}));render()});
$('lado').addEventListener('change',()=>{answer=null;render()});['primero','segundo'].forEach(id=>$(id).addEventListener('input',()=>{answer=null;render()}));
$('botonIdioma').onclick=()=>{$('menuIdiomas').style.display=$('menuIdiomas').style.display==='block'?'none':'block'};
$('menuIdiomas').addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(!b)return;localStorage.setItem('idioma',b.dataset.lang);$('menuIdiomas').style.display='none';render()});
$('botonTema').onclick=()=>{localStorage.setItem('tema',localStorage.getItem('tema')==='claro'?'oscuro':'claro');render()};
document.addEventListener('click',e=>{if(!e.target.closest('.menu-idioma'))$('menuIdiomas').style.display='none'});
MiWeb.mountRanking({game:'pitagoras',columns:[{key:'calculos',label:{es:'Cálculos',en:'Calculations',hy:'Հաշվարկներ'}}],compare:(a,b)=>(b.calculos||0)-(a.calculos||0)});render();initPython();