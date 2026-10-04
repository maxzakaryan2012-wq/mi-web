// Run with node tests/data.cjs. No dependencies required.
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const storage=new Map([['miWebStatsReset', ':season-2026-10-04-reset-1']]);
const notice={textContent:''};
const context=vm.createContext({window:{},crypto:{randomUUID},
 localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v))},
 document:{documentElement:{lang:'es'},getElementById:()=>notice}});
vm.runInContext(readFileSync(require('node:path').join(__dirname,'../assets/common.js'),'utf8'),context);
const app=context.window.MiWeb;
const fixtures={
 estadisticasNumeroAleatorio:{generados:7},estadisticasAdivinaNumero:{mejorIntentos:3,aciertos:4},
 estadisticasAdivinoTuNumero:{mejorIntentos:12,partidas:2},estadisticasPulsaBoton:{mejorPuntuacion:20,partidas:3},
 estadisticasCarreraInfinita:{mejorPuntuacion:50,mejorTiempo:12.5,partidas:4}
};
storage.set('nombreUsuario','Max');
for(const [key,value] of Object.entries(fixtures)) storage.set(key,JSON.stringify({Max:value,Other:value}));
const id=app.profile().id;
app.rename('Nuevo Max');
for(const [key,value] of Object.entries(fixtures)) {
 const data=app.readStats(key);
 assert.equal(JSON.stringify(data[id]),JSON.stringify(value));
 assert.equal(JSON.stringify(data['legacy:Other']),JSON.stringify(value));
 assert.equal(Object.keys(data).length,2);
 assert.ok(JSON.parse(storage.get(key)).Max);
 app.writeStats(key,data);
 assert.equal(JSON.stringify(app.readStats(key)),JSON.stringify(data));
}
app.rename('__proto__');assert.equal(app.profile().id,id);assert.equal(app.playerName(id),'__proto__');
app.rename('Other');assert.equal(Object.keys(app.readStats('estadisticasNumeroAleatorio')).length,2);
for(const pair of [['','5'],[' ','5'],['1.5','5'],['NaN','5'],['Infinity','5'],['1000000001','1'],['1e309','2']]) assert.equal(app.validIntegerRange(...pair),false);
for(const pair of [['10','1'],['-5','-1'],['7','7'],['-1000000000','1000000000']]) assert.equal(app.validIntegerRange(...pair),true);
for(const lang of ['es','en','hy']) {storage.set('idioma',lang);app.applyLanguage();assert.equal(context.document.documentElement.lang,lang);assert.ok(notice.textContent);}
storage.set('estadisticasNumeroAleatorio:season-2026-10-04-reset-1','{broken');assert.equal(Object.keys(app.readStats('estadisticasNumeroAleatorio')).length,0);
storage.set('estadisticasNumeroAleatorio:season-2026-10-04-reset-1',JSON.stringify({bad:{generados:-2},null:null,good:{generados:3}}));
assert.equal(Object.keys(app.readStats('estadisticasNumeroAleatorio')).join(','),'good');
console.log('PASS: migration of five games, stable identity, preserved legacy data, repeat migration, special names, validation, languages and corrupt data.');
