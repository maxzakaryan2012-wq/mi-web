// Run with node tests/pages.cjs (jsdom required).
const {JSDOM}=require('jsdom');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');const storage=new Map([['nombreUsuario','Max']]);
const fixtures={estadisticasNumeroAleatorio:{generados:7},estadisticasAdivinaNumero:{mejorIntentos:3,aciertos:4},estadisticasAdivinoTuNumero:{mejorIntentos:12,partidas:2},estadisticasPulsaBoton:{mejorPuntuacion:20,partidas:3},estadisticasCarreraInfinita:{mejorPuntuacion:50,mejorTiempo:12.5,partidas:4}};
for(const [key,value] of Object.entries(fixtures))storage.set(key,JSON.stringify({Max:value}));
function load(file){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const dom=new JSDOM(html,{url:'https://example.org/'+file,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;Object.defineProperty(w,'localStorage',{value:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v))}});
 w.eval(fs.readFileSync(path.join(root,'assets/common.js'),'utf8'));
 for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) w.eval(m[1]);
 return dom;
}
let dom=load('index.html');dom.window.document.getElementById('nombreUsuario').value='Nuevo Max';dom.window.guardarNombre();dom.window.close();
for(const game of ['numero-aleatorio','adivina-el-numero','adivino-tu-numero','pulsa-el-boton','carrera-infinita']){
 dom=load(`juegos/${game}/index.html`);const w=dom.window;
 assert.match(w.document.querySelector('table').textContent,/Nuevo Max/);
 for(const lang of ['es','en','hy']){storage.set('idioma',lang);w.aplicarIdioma();assert.equal(w.document.documentElement.lang,lang);}
 if(game==='numero-aleatorio'){
  for(const [a,b] of [['','5'],['1.5','5'],['1','1000000001']]){
   const before=JSON.stringify(w.obtenerEstadisticas());w.document.getElementById('numero1').value=a;w.document.getElementById('numero2').value=b;w.generarNumero();
   assert.match(w.document.getElementById('resultado').textContent,/⚠️/);assert.equal(JSON.stringify(w.obtenerEstadisticas()),before);
  }
  w.document.getElementById('numero1').value=10;w.document.getElementById('numero2').value=1;
  for(let i=0;i<25;i++){w.generarNumero();const n=Number(w.document.getElementById('resultado').textContent);assert.ok(Number.isInteger(n)&&n>=1&&n<=10);}
  assert.equal(w.obtenerEstadisticas()[w.MiWeb.profile().id].generados,32);
 } else if(game==='adivina-el-numero') {w.guardarEstadistica(2);assert.equal(w.obtenerEstadisticas()[w.MiWeb.profile().id].aciertos,5);}
 else if(game==='adivino-tu-numero') {w.guardarVictoria();assert.equal(w.obtenerEstadisticas()[w.MiWeb.profile().id].partidas,3);}
 else {w.guardarEstadistica();assert.equal(w.obtenerEstadisticas()[w.MiWeb.profile().id].partidas,game==='pulsa-el-boton'?4:5);}
 dom.window.close();
}
console.log('PASS: all six pages initialize; actual rename, tables, language and five save paths work; invalid numbers do not count.');
