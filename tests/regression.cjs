// Run with: node tests/regression.cjs (Playwright required; serve the repo on port 8765).
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({headless:true});
 const page = await browser.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.TEST_URL || 'http://127.0.0.1:8765';
 await page.goto(base);
 const fixtures={
  estadisticasNumeroAleatorio:{generados:7},
  estadisticasAdivinaNumero:{mejorIntentos:3,aciertos:4},
  estadisticasAdivinoTuNumero:{mejorIntentos:12,partidas:2},
  estadisticasPulsaBoton:{mejorPuntuacion:20,partidas:3},
  estadisticasCarreraInfinita:{mejorPuntuacion:50,mejorTiempo:12.5,partidas:4}
 };
 await page.evaluate(f=>{
  localStorage.clear(); localStorage.setItem('miWebStatsReset', ':season-2026-10-04-reset-1'); localStorage.setItem('nombreUsuario','Max');
  for(const [key,value] of Object.entries(f)) localStorage.setItem(key,JSON.stringify({Max:value,Other:value}));
 },fixtures);
 await page.reload();
 const id=await page.evaluate(()=>MiWeb.profile().id);
 await page.locator('#nombreUsuario').evaluate(el=>el.value='Nuevo Max');
 await page.evaluate(()=>guardarNombre());
 for(const [key,value] of Object.entries(fixtures)) {
  const data=await page.evaluate(k=>MiWeb.readStats(k),key);
  assert.deepEqual(data[id],value);
  assert.deepEqual(data['legacy:Other'],value);
 }
 const games=['numero-aleatorio','adivina-el-numero','adivino-tu-numero','pulsa-el-boton','carrera-infinita'];
 for(const game of games) {
  await page.goto(`${base}/juegos/${game}/`);
  assert.match(await page.locator('table').innerText(),/Nuevo Max/);
  for(const lang of ['en','hy','es']) {
   await page.evaluate(l=>{localStorage.setItem('idioma',l);aplicarIdioma();},lang);
   assert.equal(await page.locator('html').getAttribute('lang'),lang);
   assert.ok(await page.locator('#avisoLocal').innerText());
  }
  // Exercise each game's actual save path after the migration.
  await page.evaluate(g=>{
   if(g==='numero-aleatorio') guardarNumeroGenerado();
   else if(g==='adivino-tu-numero') {intentos=15;guardarVictoria();}
   else if(g==='adivina-el-numero') guardarEstadistica(2);
   else guardarEstadistica();
  },game);
 }
 await page.goto(`${base}/juegos/numero-aleatorio/`);
 for(const [a,b] of [['','5'],['1.5','5'],['1','1000000001'],['1e309','5']]) {
  const before=await page.evaluate(()=>JSON.stringify(obtenerEstadisticas()));
  await page.evaluate(([a,b])=>{document.getElementById('numero1').value=a;document.getElementById('numero2').value=b;generarNumero();},[a,b]);
  assert.match(await page.locator('#resultado').innerText(),/⚠️/);
  assert.equal(await page.evaluate(()=>JSON.stringify(obtenerEstadisticas())),before);
 }
 for(const [a,b] of [[10,1],[-5,-1],[7,7],[-1000000000,1000000000]]) {
  const results=await page.evaluate(([a,b])=>{
   document.getElementById('numero1').value=a; document.getElementById('numero2').value=b;
   return Array.from({length:25},()=>{generarNumero();return Number(document.getElementById('resultado').textContent);});
  },[a,b]);
  assert.ok(results.every(n=>Number.isInteger(n)&&n>=Math.min(a,b)&&n<=Math.max(a,b)));
 }
 await page.evaluate(()=>MiWeb.rename('__proto__'));
 await page.reload();
 assert.equal(await page.evaluate(()=>MiWeb.profile().id),id);
 assert.match(await page.locator('table').innerText(),/__proto__/);
 // Migration is idempotent, and renaming to an old row does not merge players.
 await page.evaluate(()=>MiWeb.rename('Other'));
 const migrated=await page.evaluate(()=>MiWeb.readStats('estadisticasNumeroAleatorio'));
 assert.equal(migrated['legacy:Other'].generados,7);
 assert.equal(Object.keys(migrated).length,2);
 assert.deepEqual(errors,[]);
 await browser.close();
 console.log('PASS: five games, migration, rename, save paths, languages and number validation.');
})().catch(e=>{console.error(e);process.exit(1);});
