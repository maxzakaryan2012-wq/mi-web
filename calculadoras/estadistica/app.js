const T={
es:{
title:'📊 Calculadora estadística',
desc:'Escribe varios números y calcula cinco medidas estadísticas básicas.',
back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',
numbers:'Números separados por espacios, comas o punto y coma',
calc:'📊 Calcular',clear:'Limpiar',
mean:'Media',median:'Mediana',mode:'Moda',min:'Mínimo',max:'Máximo',
note:'Ejemplo: 2, 4, 4, 5, 7, 9. Los decimales se escriben con punto, por ejemplo 2.5.',
bad:'Escribe al menos un número válido.',
tooMany:'Máximo 1000 números.',
noMode:'Sin moda',
multipleModes:'Modas'
},
en:{
title:'📊 Statistics calculator',
desc:'Enter several numbers and calculate five basic statistical measures.',
back:'← Back',light:'☀️ Light',dark:'🌙 Dark',
numbers:'Numbers separated by spaces, commas or semicolons',
calc:'📊 Calculate',clear:'Clear',
mean:'Mean',median:'Median',mode:'Mode',min:'Minimum',max:'Maximum',
note:'Example: 2, 4, 4, 5, 7, 9. Use a dot for decimals, for example 2.5.',
bad:'Enter at least one valid number.',
tooMany:'Maximum 1000 numbers.',
noMode:'No mode',
multipleModes:'Modes'
},
hy:{
title:'📊 Վիճակագրական հաշվիչ',
desc:'Գրիր մի քանի թիվ և հաշվիր հինգ հիմնական վիճակագրական չափանիշ։',
back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',
numbers:'Թվերը բաժանիր բացատով, ստորակետով կամ կետ-ստորակետով',
calc:'📊 Հաշվել',clear:'Մաքրել',
mean:'Միջին',median:'Մեդիան',mode:'Մոդա',min:'Նվազագույն',max:'Առավելագույն',
note:'Օրինակ՝ 2, 4, 4, 5, 7, 9։ Տասնորդական թվերի համար օգտագործիր կետ, օրինակ՝ 2.5։',
bad:'Գրիր առնվազն մեկ ճիշտ թիվ։',
tooMany:'Առավելագույնը 1000 թիվ։',
noMode:'Մոդա չկա',
multipleModes:'Մոդաներ'
}
};

const $=id=>document.getElementById(id);

function lang(){
    const x=localStorage.getItem('idioma');
    return T[x]?x:'es';
}

function fmt(n){
    return new Intl.NumberFormat(lang(),{maximumFractionDigits:10}).format(n);
}

function parseNumbers(){
    const raw=$('numeros').value.trim();
    if(!raw)return [];
    return raw
        .split(/[\s,;]+/)
        .filter(Boolean)
        .map(Number)
        .filter(Number.isFinite);
}

function calculate(track=false){
    const t=T[lang()];
    const nums=parseNumbers();

    if(!nums.length){
        $('mensaje').textContent='⚠️ '+t.bad;
        ['media','mediana','moda','minimo','maximo'].forEach(id=>$(id).textContent='—');
        if(track)MiWeb.xpAction('tool_invalid');
        return;
    }

    if(nums.length>1000){
        $('mensaje').textContent='⚠️ '+t.tooMany;
        if(track)MiWeb.xpAction('tool_invalid');
        return;
    }

    const sorted=[...nums].sort((a,b)=>a-b);
    const mean=nums.reduce((a,b)=>a+b,0)/nums.length;
    const mid=Math.floor(sorted.length/2);
    const median=sorted.length%2
        ? sorted[mid]
        : (sorted[mid-1]+sorted[mid])/2;

    const counts=new Map();
    for(const n of nums)counts.set(n,(counts.get(n)||0)+1);
    const maxCount=Math.max(...counts.values());
    const modes=[...counts.entries()]
        .filter(([,count])=>count===maxCount)
        .map(([value])=>value)
        .sort((a,b)=>a-b);

    let modeText;
    if(maxCount===1)modeText=t.noMode;
    else if(modes.length===1)modeText=fmt(modes[0]);
    else modeText=modes.map(fmt).join(', ');

    $('media').textContent=fmt(mean);
    $('mediana').textContent=fmt(median);
    $('moda').textContent=modeText;
    $('minimo').textContent=fmt(sorted[0]);
    $('maximo').textContent=fmt(sorted[sorted.length-1]);
    $('mensaje').textContent='';
    if(track)MiWeb.xpAction('tool_success');
}

function setTheme(){
    const claro=localStorage.getItem('tema')==='claro';
    document.body.classList.toggle('claro',claro);
    $('botonTema').textContent=T[lang()][claro?'dark':'light'];
}

function renderText(){
    const t=T[lang()],l=lang();
    document.documentElement.lang=l;
    document.title=t.title.replace(/^📊 /,'')+' - MI WEB';
    MiWeb.applyLanguage();
    $('titulo').textContent=t.title;
    $('descripcion').textContent=t.desc;
    $('volver').textContent=t.back;
    $('labelNumeros').textContent=t.numbers;
    $('calcular').textContent=t.calc;
    $('limpiar').textContent=t.clear;
    $('txtMedia').textContent=t.mean;
    $('txtMediana').textContent=t.median;
    $('txtModa').textContent=t.mode;
    $('txtMinimo').textContent=t.min;
    $('txtMaximo').textContent=t.max;
    $('nota').textContent=t.note;
    $('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';
    setTheme();
    calculate();
}

$('form').addEventListener('submit',e=>{
    e.preventDefault();
    calculate(true);
});

$('limpiar').addEventListener('click',()=>{
    $('numeros').value='';
    ['media','mediana','moda','minimo','maximo'].forEach(id=>$(id).textContent='—');
    $('mensaje').textContent='';
    $('numeros').focus();
});

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

renderText();