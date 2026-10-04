const translations = {
 es:{home:'← Inicio',title:'Triángulo de Pitágoras',intro:'Dos medidas conocidas. Un lado por descubrir.',missing:'¿Qué lado falta?',a:'Cateto (a)',b:'Cateto (b)',c:'Hipotenusa (c)',units:'Usa la misma unidad en ambas medidas. Se admiten decimales con punto o coma.',calculate:'Calcular',retry:'Reintentar carga',loading:'Preparando la calculadora… La primera carga puede tardar.',ready:'Calculadora lista.',failed:'No se ha podido cargar. Comprueba tu conexión y reintenta.',positive:'Introduce medidas positivas y finitas, como máximo 1.000.000.000.000.',hypotenuse:'La hipotenusa debe ser mayor que el cateto.',side:'Selecciona el lado que falta.',diagram:'Dibujo orientativo, no a escala. La hipotenusa está enfrente del ángulo de 90°.',download:'Descargar código Python',svg:'Triángulo rectángulo con catetos a y b e hipotenusa c',theme:'Cambiar tema',rounded:'Resultado aproximado; hasta 10 cifras significativas.'},
 en:{home:'← Home',title:'Pythagorean triangle',intro:'Two known lengths. One side to discover.',missing:'Which side is missing?',a:'Leg (a)',b:'Leg (b)',c:'Hypotenuse (c)',units:'Use the same unit for both lengths. Decimal points and commas are accepted.',calculate:'Calculate',retry:'Retry loading',loading:'Preparing the calculator… The first load may take a while.',ready:'Calculator ready.',failed:'Could not load. Check your connection and retry.',positive:'Enter finite positive lengths, at most 1,000,000,000,000.',hypotenuse:'The hypotenuse must be longer than the leg.',side:'Select the missing side.',diagram:'Illustration, not to scale. The hypotenuse is opposite the 90° angle.',download:'Download Python code',svg:'Right triangle with legs a and b and hypotenuse c',theme:'Change theme',rounded:'Approximate result; up to 10 significant digits.'},
 hy:{home:'← Գլխավոր',title:'Պյութագորասի եռանկյուն',intro:'Երկու հայտնի երկարություն։ Գտիր երրորդը։',missing:'Ո՞ր կողմն է անհայտ։',a:'Էջ (a)',b:'Էջ (b)',c:'Ներքնաձիգ (c)',units:'Երկու չափերի համար օգտագործիր նույն միավորը։ Կարելի է գրել տասնորդական կետով կամ ստորակետով։',calculate:'Հաշվել',retry:'Կրկին բեռնել',loading:'Հաշվիչը բեռնվում է… Առաջին բեռնումը կարող է տևել։',ready:'Հաշվիչը պատրաստ է։',failed:'Չհաջողվեց բեռնել։ Ստուգիր կապը և կրկին փորձիր։',positive:'Մուտքագրիր դրական վերջավոր չափեր՝ առավելագույնը 1 000 000 000 000։',hypotenuse:'Ներքնաձիգը պետք է էջից մեծ լինի։',side:'Ընտրիր անհայտ կողմը։',diagram:'Գծապատկերը մասշտաբային չէ։ Ներքնաձիգը 90° անկյան դիմաց է։',download:'Ներբեռնել Python կոդը',svg:'Ուղղանկյուն եռանկյուն՝ a և b էջերով ու c ներքնաձիգով',theme:'Փոխել թեման',rounded:'Մոտավոր արդյունք՝ մինչև 10 նշանակալի թվանշան։'}
};
const $ = id => document.getElementById(id);
let state='loading', answer=null, runtime=null;
function language(){return translations[localStorage.getItem('idioma')] ? localStorage.getItem('idioma') : 'es';}
function render(){
 const lang=language(), t=translations[lang];
 document.documentElement.lang=lang;document.title=t.title;$('idioma').value=lang;
 document.querySelectorAll('[data-text]').forEach(el=>el.textContent=t[el.dataset.text]);
 $('svgTitle').textContent=t.svg;$('tema').setAttribute('aria-label',t.theme);
 document.body.classList.toggle('claro',localStorage.getItem('tema')==='claro');
 const side=$('lado').value;$('etiqueta1').textContent=t[side==='c'?'a':'c'];$('etiqueta2').textContent=t[side==='b'?'a':'b'];
 $('primero').placeholder=side==='c'?'3':'5';$('segundo').placeholder=side==='b'?'3':'4';
 $('estado').textContent=t[state] || t.failed;$('calcular').disabled=!runtime;$('reintentar').hidden=state!=='failed';
 $('resultado').textContent='';$('pasos').textContent='';
 if(answer){
  if(answer.error){$('resultado').textContent=t[answer.error] || t.failed;return;}
  const f=n=>new Intl.NumberFormat(lang,{maximumSignificantDigits:10}).format(n);
  const {lado,x,y,resultado,cuadrado}=answer, sign=lado==='c'?'+':'−';
  $('resultado').textContent=`${lado} ≈ ${f(resultado)}`;
  $('pasos').textContent=`a² + b² = c²\n${lado}² = ${lado==='c'?'a² + b²':`c² − ${lado==='a'?'b':'a'}²`}\n${lado}² = ${f(x)}² ${sign} ${f(y)}² ≈ ${f(cuadrado)}\n${lado} = √(${f(x)}² ${sign} ${f(y)}²) ≈ ${f(resultado)}\n${t.rounded}`;
 }
}
async function initialize(){
 state='loading';render();
 try{
  if(!window.loadPyodide) await new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.js';
   script.onload=resolve;script.onerror=()=>{script.remove();reject(new Error('load'));};document.head.appendChild(script);
  });
  const python=await window.loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/'});
  const response=await fetch('calculadora.py');if(!response.ok)throw new Error('source');
  await python.runPythonAsync(await response.text());runtime=python;state='ready';
 }catch(error){state='failed';console.error(error);}
 render();
}
$('formulario').addEventListener('submit',event=>{
 event.preventDefault();if(!runtime)return;
 const calculate=runtime.globals.get('calcular_json');
 try{answer=JSON.parse(calculate($('lado').value,$('primero').value,$('segundo').value));}
 catch{answer={error:'failed'};}
 finally{calculate.destroy();}render();
});
['lado','primero','segundo'].forEach(id=>$(id).addEventListener('input',()=>{answer=null;render();}));
$('idioma').addEventListener('change',()=>{localStorage.setItem('idioma',$('idioma').value);render();});
$('tema').addEventListener('click',()=>{localStorage.setItem('tema',localStorage.getItem('tema')==='claro'?'oscuro':'claro');render();});
$('reintentar').addEventListener('click',initialize);
initialize();
