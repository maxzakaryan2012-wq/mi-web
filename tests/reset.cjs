const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../assets/common.js'), 'utf8');
const keys = ['estadisticasNumeroAleatorio', 'estadisticasAdivinaNumero', 'estadisticasAdivinoTuNumero', 'estadisticasPulsaBoton', 'estadisticasCarreraInfinita'];
for (let visitor = 0; visitor < 3; visitor++) {
 const data = new Map([['nombreUsuario', 'Max'], ['tema', 'oscuro'], ['idioma', 'hy']]);
 for (const key of keys) { data.set(key, '{"old":{}}'); data.set(key + ':v2', '{"old":{}}'); }
 const context = vm.createContext({window: {}, localStorage: {
  getItem: key => data.get(key) ?? null,
  setItem: (key, value) => data.set(key, value),
  removeItem: key => data.delete(key)
 }});
 vm.runInContext(source, context);
 for (const key of keys) {
  assert.equal(data.has(key), false); assert.equal(data.has(key + ':v2'), false);
  assert.equal(Object.keys(context.window.MiWeb.readStats(key)).length, 0);
 }
 assert.equal(data.get('nombreUsuario'), 'Max');assert.equal(data.get('tema'), 'oscuro');assert.equal(data.get('idioma'), 'hy');
 context.window.MiWeb.writeStats(keys[0], {newPlayer: {generados: 2}});
 // An old open tab cannot put its old scores in the new season.
 data.set(keys[0] + ':v2', '{"oldPlayer":{"generados":100}}');
 vm.runInContext(source, context);
 const scores = context.window.MiWeb.readStats(keys[0]);
 assert.equal(scores.newPlayer.generados, 2);assert.equal(scores.oldPlayer, undefined);
}
console.log('PASS: all visitors reset once, all five games clear, preferences and new scores survive reloads, old tabs isolated.');
