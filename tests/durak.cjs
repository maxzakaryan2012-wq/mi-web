const assert=require('node:assert/strict'),D=require('../juegos/durak/engine.js');
const c=(s,r)=>({id:s*9+r-6,s,r});
assert(D.beats(c(0,9),c(0,8),1));assert(!D.beats(c(0,8),c(0,9),1));assert(D.beats(c(1,6),c(0,14),1));assert(!D.beats(c(0,14),c(1,6),1));
function check(s){const all=[...s.hands.flat(),...s.deck,...s.discard,...s.table.flatMap(p=>[p.a,...(p.d?[p.d]:[])])];assert.equal(all.length,36);assert.equal(new Set(all.map(c=>c.id)).size,36);assert(s.table.length<=s.limit);for(const p of s.table)if(p.d)assert(D.beats(p.d,p.a,s.trump))}
for(let k=0;k<100;k++){const s=D.create();check(s);assert.equal(s.deck.length,24);assert.deepEqual(s.face,s.deck[0]);let n=0;while(s.winner===null&&n++<1500){const old=JSON.stringify(s);const m=D.choose(s,k<4?k: k%3);assert.equal(JSON.stringify(s),old,'AI must not mutate live state');D.apply(s,m);check(s)}assert.notEqual(s.winner,null,'game terminates')}
// Taking retains the attacker's turn and includes covered cards; draw attacker first.
let s={hands:[[c(0,6),c(2,6)],[c(0,7)]],deck:[c(3,14),c(3,13)],discard:[],table:[],trump:3,face:c(3,14),attacker:0,turn:0,limit:1,taking:false,round:1,winner:null};D.apply(s,{type:'attack',id:0});D.apply(s,{type:'take'});assert(!D.actions(s).some(x=>x.type==='attack'));D.apply(s,{type:'end'});assert.equal(s.attacker,0);assert.equal(s.deck.length,0);assert(s.hands[0].some(x=>x.r===14));assert(s.hands[1].some(x=>x.id===0));
// Last cards of both hands are resolved as a draw after the defense.
s={hands:[[c(0,6)],[c(0,7)]],deck:[],discard:[],table:[],trump:3,attacker:0,turn:0,limit:1,taking:false,round:1,winner:null};D.apply(s,{type:'attack',id:0});D.apply(s,{type:'defend',id:1,index:0});assert.equal(s.winner,null);D.apply(s,{type:'end'});assert.equal(s.winner,2);
// Impossible cannot inspect hidden order: swapping unseen cards with identical RNG produces the same choice.
s=D.create();const other=structuredClone(s);[other.hands[1-s.turn][0],other.deck[1]]=[other.deck[1],other.hands[1-s.turn][0]];const random=Math.random;function seeded(){let x=17;Math.random=()=>((x=Math.imul(1664525,x)+1013904223>>>0)/4294967296)}seeded();const a=D.choose(s,3);seeded();const b=D.choose(other,3);Math.random=random;assert.deepEqual(a,b);
console.log('PASS: 100 complete games; card conservation; legal defenses; attack limit; taking/draw order; final draw; hidden-information AI.');
