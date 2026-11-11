(() => {
'use strict';
const $=s=>document.querySelector(s), canvas=$('#game'), ctx=canvas.getContext('2d');
const chars=[
 {name:'Naruto Uzumaki',world:'Naruto',tag:'THE HIDDEN FLAME',ability:'Rasengan Dash',colors:['#ff812e','#31559c','#f6c39c'],hair:'spikes',mark:'☯',stats:[90,72,80]},
 {name:'Adult Sasuke',world:'Naruto',tag:'SHADOW OF THE UCHIHA',ability:'Chidori Surge',colors:['#283145','#6558a8','#d8b8a5'],hair:'sweep',mark:'◉',stats:[78,92,76]},
 {name:'Kurama',world:'Naruto',tag:'NINE-TAILED TITAN',ability:'Tailed Beast Pulse',colors:['#fb762f','#e04732','#ffd05d'],hair:'flame',mark:'狐',stats:[96,68,88]},
 {name:'Yuji Itadori',world:'Jujutsu Kaisen',tag:'VESSEL OF CURSES',ability:'Divergent Impact',colors:['#d95d57','#7b3246','#eab798'],hair:'crop',mark:'虎',stats:[83,78,84]},
 {name:'Ryomen Sukuna',world:'Jujutsu Kaisen',tag:'KING OF CURSES',ability:'Malevolent Burst',colors:['#ee746d','#682f46','#edbaa0'],hair:'spikes',mark:'呪',stats:[98,88,73]},
 {name:'Satoru Gojo',world:'Jujutsu Kaisen',tag:'THE LIMITLESS',ability:'Infinity Break',colors:['#eff3ff','#536fbd','#e8c2ad'],hair:'spikes',mark:'∞',stats:[87,95,91]},
 {name:'Tanjiro Kamado',world:'Demon Slayer',tag:'WATER & SUN',ability:'Hinokami Flow',colors:['#253347','#a43b3b','#e6b99f'],hair:'crop',mark:'水',stats:[85,79,88]},
 {name:'Nezuko Kamado',world:'Demon Slayer',tag:'NIGHT BLOOM',ability:'Blood Moon Bloom',colors:['#342339','#e88b9b','#f2c5ad'],hair:'long',mark:'花',stats:[79,86,94]},
 {name:'Inosuke Hashibira',world:'Demon Slayer',tag:'BEAST BREATHING',ability:'Beast Pounce',colors:['#a6c4df','#6584a8','#f1cbb2'],hair:'wild',mark:'牙',stats:[95,75,69]},
 {name:'Zenitsu Agatsuma',world:'Demon Slayer',tag:'THUNDERCLAP',ability:'Thunder Flash',colors:['#f4c64d','#df8930','#f2bea0'],hair:'spikes',mark:'雷',stats:[87,89,82]},
 {name:'Saitama',world:'One Punch Man',tag:'CAPED BALD-E',ability:'Serious Series',colors:['#e8c944','#d64a44','#f2c7a6'],hair:'bald',mark:'拳',stats:[99,83,74]},
 {name:'Genos',world:'One Punch Man',tag:'DEMON CYBORG',ability:'Incineration Cannon',colors:['#e4d7b8','#d5a333','#efbd9a'],hair:'spikes',mark:'⚙',stats:[88,93,79]},
 {name:'Tatsumaki',world:'One Punch Man',tag:'TORNADO OF TERROR',ability:'Psychic Tempest',colors:['#29372e','#65cc83','#e9bca6'],hair:'long',mark:'✧',stats:[82,97,96]}
];
const worlds=[
 {name:'Hidden Leaf',universe:'Naruto',glyph:'木',desc:'Where the will of fire never fades.',colors:['#243f43','#83c47b','#edbd63'],sky:['#18273a','#536875','#d39368']},
 {name:'Cursed Tokyo',universe:'Jujutsu Kaisen',glyph:'呪',desc:'A city haunted by unseen forces.',colors:['#332c50','#a47be1','#e78ac2'],sky:['#17172e','#51446b','#bd7296']},
 {name:'Wisteria Pass',universe:'Demon Slayer',glyph:'藤',desc:'A moonlit path through ancient woods.',colors:['#293e44','#78dfc3','#e5b3e4'],sky:['#101f32','#344f64','#b383a4']},
 {name:'Neo City',universe:'One Punch Man',glyph:'拳',desc:'The skyline is just another challenge.',colors:['#333b4b','#ff9c65','#e6d677'],sky:['#192439','#536579','#d89072']}
];
const state={screen:'home',char:0,world:0,filter:'All',coins:+localStorage.getItem('ar-coins')||0,best:+localStorage.getItem('ar-best')||0,audio:true,run:null,last:0,w:0,h:0,dpr:1,toastTimer:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function resize(){state.dpr=Math.min(devicePixelRatio||1,2);state.w=innerWidth;state.h=innerHeight;canvas.width=Math.floor(state.w*state.dpr);canvas.height=Math.floor(state.h*state.dpr);ctx.setTransform(state.dpr,0,0,state.dpr,0,0)}
addEventListener('resize',resize);resize();
function show(id){document.querySelectorAll('.screen').forEach(e=>e.classList.remove('visible'));$('#'+id).classList.add('visible');$('#topbar').classList.toggle('game-running',id==='game');state.screen=id;}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>t.classList.remove('show'),2100)}
function saveCoins(){localStorage.setItem('ar-coins',state.coins);$('#coin-total').textContent=String(state.coins).padStart(5,'0')}
saveCoins();
function characterFigure(index,mini=false){const c=chars[index];return `<div class="hero-figure ${mini?'mini-figure':''}" style="--hair:${c.colors[0]};--suit:${c.colors[1]};--skin:${c.colors[2]}"><span class="hero-cape"></span><span class="hero-head ${c.hair}"><i></i><b>${c.mark}</b></span><span class="hero-body"></span><span class="hero-leg left"></span><span class="hero-leg right"></span><span class="hero-aura"></span></div>`}
function renderRoster(){const filters=['All',...worlds.map(w=>w.universe)];$('#character-filters').innerHTML=filters.map(f=>`<button class="filter-chip ${state.filter===f?'active':''}" data-filter="${f}">${f.toUpperCase()}</button>`).join('');const shown=chars.map((c,i)=>({...c,i})).filter(c=>state.filter==='All'||c.world===state.filter);$('#roster').innerHTML=shown.map(c=>`<button class="runner-card ${c.i===state.char?'active':''}" data-char="${c.i}" style="--card-color:${c.colors[1]}66"><span class="runner-avatar">${characterFigure(c.i,true)}</span><b>${c.name}</b><small>${c.world.toUpperCase()}</small></button>`).join('');renderDetail()}
function renderDetail(){const c=chars[state.char];const bars=['SPEED','POWER','FOCUS'];$('#character-detail').innerHTML=`<div class="detail-art">${characterFigure(state.char)}</div><div class="detail-info"><div class="detail-tag">${c.tag}</div><h3>${c.name.toUpperCase()}</h3><p>${c.world.toUpperCase()} UNIVERSE · RUNNER #${String(state.char+1).padStart(2,'0')}</p><div class="stat-list">${c.stats.map((v,i)=>`<div class="stat">${bars[i]}<i style="--v:${v}%"></i></div>`).join('')}</div><div class="ability-label">SIGNATURE ABILITY</div><div class="ability-name">✦ &nbsp;${c.ability}</div></div>`}
function renderWorlds(){const cmap=['#78c48b','#bd85dd','#72d9c6','#ffa36e'];$('#world-grid').innerHTML=worlds.map((w,i)=>`<button class="world-card ${i===state.world?'active':''}" data-world="${i}" style="--world:${w.colors[0]};--accent:${cmap[i]}"><div class="world-art"></div><span class="world-glyph">${w.glyph}</span><div class="world-card-content"><small>DIMENSION 0${i+1} · ${w.universe.toUpperCase()}</small><h3>${w.name.toUpperCase()}</h3><p>${w.desc}</p></div></button>`).join('');updateWorldLabel()}
function updateWorldLabel(){const w=worlds[state.world];$('#world-selected').innerHTML=`CURRENT DESTINATION <b>${w.name.toUpperCase()}</b>`}
renderRoster();renderWorlds();
$('#start-btn').onclick=()=>{state.filter='All';renderRoster();show('characters')};$('#how-btn').onclick=()=>show('howto');$('#audio-btn').onclick=()=>{state.audio=!state.audio;$('#audio-btn').textContent=state.audio?'♫':'♪';toast(state.audio?'SOUND ENABLED':'SOUND MUTED')};
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>show(b.dataset.back));
$('#roster').addEventListener('click',e=>{const b=e.target.closest('[data-char]');if(!b)return;state.char=+b.dataset.char;renderRoster()});$('#character-filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;state.filter=b.dataset.filter;renderRoster()});
$('#characters').querySelector('.screen-head .back-btn').onclick=()=>show('home');
$('#character-continue').onclick=()=>{renderWorlds();show('worlds')};
$('#world-grid').addEventListener('click',e=>{const b=e.target.closest('[data-world]');if(!b)return;state.world=+b.dataset.world;renderWorlds()});$('#world-play').onclick=startRun;
$('#resume-btn').onclick=()=>{if(state.run){state.run.paused=false;gameUI.classList.add('active');show('game')} };
$('#quit-btn').onclick=()=>finishRun(false);$('#retry-btn').onclick=startRun;$('#result-home').onclick=()=>show('home');

// A self-contained, locally-rendered arena: no remote art or gameplay assets required.
const gameUI=$('#game-ui');let audioCtx=null;function tone(freq=440,dur=.08,type='sine'){if(!state.audio)return;try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.055,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur)}catch{}}
function startRun(){const c=chars[state.char],w=worlds[state.world];state.run={lane:1,target:1,distance:0,coins:0,energy:0,health:2,elapsed:0,speed:1,items:[],spawn:0,coinSpawn:0,jump:0,slide:0,ability:0,invuln:0,shake:0,particles:[],bossAt:260,bossTime:0,bossActive:false,bossCount:0,flash:0,combo:0};$('#hud-world').textContent=w.name.toUpperCase();$('#ability-title').textContent=c.ability.toUpperCase();$('#ability-short').textContent='UNLEASH';$('#boss-hud').classList.remove('active');gameUI.classList.add('active');show('game');toast(`${c.name} enters ${w.name}`)}
function pauseRun(){if(!state.run)return;state.run.paused=true;gameUI.classList.remove('active');show('pause')}
function finishRun(won=false){if(!state.run)return;const r=state.run;state.best=Math.max(state.best,Math.floor(r.distance));localStorage.setItem('ar-best',state.best);$('#result-distance').textContent=Math.floor(r.distance)+'m';$('#result-coins').textContent=r.coins;$('#result-best').textContent=state.best+'m';$('#result-title').innerHTML=won?'HUNTER <em>DEFEATED</em>':'THE RIFT <em>CLAIMS ALL</em>';$('#result-kicker').textContent=won?'BOSS ENCOUNTER CLEARED':'RUN COMPLETE';$('#result-message').textContent=won?'A new dimension falls silent. Your legend grows.':'Every ending is another beginning. The multiverse remembers.';gameUI.classList.remove('active');state.run=null;show('result')}
$('#pause-btn').onclick=pauseRun;$('#ability-btn').onclick=activateAbility;
function move(dir){const r=state.run;if(!r||state.screen!=='game')return;r.target=clamp(r.target+dir,0,2);r.combo=0}
function jump(){const r=state.run;if(r&&state.screen==='game'&&r.jump<=0&&r.slide<=0){r.jump=.78;tone(280,.1,'triangle')}}
function slide(){const r=state.run;if(r&&state.screen==='game'&&r.jump<=0)r.slide=.65}
function activateAbility(){const r=state.run;if(!r||state.screen!=='game')return;if(r.energy>=100){r.energy=0;r.ability=4.5;r.invuln=Math.max(r.invuln,4.5);if(r.bossActive)r.bossTime=Math.min(13.5,r.bossTime+3.5);r.items=r.items.filter(i=>i.type==='coin'&&i.p>.8);r.particles.push({type:'burst',x:.5,y:.74,t:0});tone(660,.25,'sawtooth');toast(chars[state.char].ability+'!')}else toast(`ENERGY ${Math.floor(r.energy)}% · COLLECT SHARDS`)}
$('#ability-btn').addEventListener('touchstart',e=>e.preventDefault(),{passive:false});
document.addEventListener('keydown',e=>{if(state.screen==='game'){if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')move(-1);if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')move(1);if(e.key==='ArrowUp'||e.key.toLowerCase()==='w')jump();if(e.key==='ArrowDown'||e.key.toLowerCase()==='s')slide();if(e.key===' '||e.key.toLowerCase()==='e')activateAbility();if(e.key==='Escape')pauseRun()}else if(state.screen==='pause'&&e.key==='Escape')$('#resume-btn').click()});
document.querySelectorAll('.touch-controls button').forEach(b=>{const action=()=>({left:()=>move(-1),right:()=>move(1),jump,slide}[b.dataset.control])();b.addEventListener('pointerdown',e=>{e.preventDefault();action()})});
$('#ability-btn').addEventListener('pointerdown',e=>{e.preventDefault();activateAbility()});
let touchStart=null;canvas.addEventListener('touchstart',e=>{if(state.screen!=='game')return;const t=e.changedTouches[0];touchStart=[t.clientX,t.clientY]},{passive:true});canvas.addEventListener('touchend',e=>{if(!touchStart||state.screen!=='game')return;const t=e.changedTouches[0],dx=t.clientX-touchStart[0],dy=t.clientY-touchStart[1];touchStart=null;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;if(Math.abs(dx)>Math.abs(dy))move(dx>0?1:-1);else dy<0?jump():slide()},{passive:true});
function laneX(lane,p=1){return state.w/2+(lane-1)*state.w*.235*(.35+p*.65)}
function skyAndWorld(t,world){const w=state.w,h=state.h,hor=h*.29;let grad=ctx.createLinearGradient(0,0,0,hor+50);grad.addColorStop(0,world.sky[0]);grad.addColorStop(.68,world.sky[1]);grad.addColorStop(1,world.sky[2]);ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);for(let i=0;i<48;i++){const x=((i*197.3)%w),y=((i*83.7)%Math.max(1,hor*.9));ctx.globalAlpha=.2+.2*Math.sin(t*1.7+i);ctx.fillStyle='#fff';ctx.fillRect(x,y,1.3,1.3)}ctx.globalAlpha=1;
 // angular horizon skyline / forest silhouettes keyed to the selected dimension
 for(let layer=0;layer<3;layer++){const base=hor+layer*22;ctx.fillStyle=layer===0?'rgba(15,21,34,.32)':layer===1?'rgba(10,18,28,.48)':'rgba(8,15,23,.66)';for(let i=-1;i<13;i++){let x=i*w/11-(t*(8+layer*9)% (w/11)),ww=w/(12-layer),hh=(25+((i*37+layer*91+2000)%80))*(h/700);if(world.universe==='Demon Slayer'){ctx.beginPath();ctx.moveTo(x,base+hh);ctx.lineTo(x+ww*.5,base-hh*.35);ctx.lineTo(x+ww,base+hh);ctx.fill()}else if(world.universe==='Naruto'){ctx.fillRect(x,base-hh,ww*.72,hh);ctx.beginPath();ctx.moveTo(x-ww*.1,base-hh);ctx.lineTo(x+ww*.36,base-hh-16);ctx.lineTo(x+ww*.8,base-hh);ctx.fill()}else{ctx.fillRect(x,base-hh,ww*.7,hh);ctx.fillStyle='rgba(214,251,85,.12)';for(let yy=base-hh+8;yy<base;yy+=14)ctx.fillRect(x+4,yy,3,3)}}}
 // far floating rift arch
 ctx.strokeStyle=world.colors[1]+'55';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(w*.5,hor-6,w*.13,h*.11,0,Math.PI,Math.PI*2);ctx.stroke();ctx.fillStyle=world.colors[1]+'11';ctx.beginPath();ctx.ellipse(w*.5,hor-6,w*.13,h*.11,0,Math.PI,Math.PI*2);ctx.fill()}
function road(t,world){const w=state.w,h=state.h,hor=h*.29,cx=w/2,roadTop=w*.16,roadBot=w*.89;ctx.fillStyle=world.colors[0];ctx.fillRect(0,hor,w,h-hor);const floor=ctx.createLinearGradient(0,hor,0,h);floor.addColorStop(0,world.colors[0]);floor.addColorStop(1,'#10131c');ctx.fillStyle=floor;ctx.fillRect(0,hor,w,h-hor);ctx.fillStyle='#171923';ctx.beginPath();ctx.moveTo(cx-roadTop/2,hor);ctx.lineTo(cx+roadTop/2,hor);ctx.lineTo(cx+roadBot/2,h);ctx.lineTo(cx-roadBot/2,h);ctx.closePath();ctx.fill();ctx.strokeStyle=world.colors[1]+'55';ctx.lineWidth=2;ctx.stroke();for(let lane=1;lane<=2;lane++)for(let j=0;j<9;j++){let p=((j/9+(t*.45)%1)%1),y=hor+Math.pow(p,1.55)*(h-hor),half=roadTop/2+(roadBot-roadTop)/2*p,x=cx-half+roadBot*p*lane/3,width=1+p*2;ctx.fillStyle=`rgba(255,255,255,${.1+p*.22})`;ctx.fillRect(x-width/2,y,width,7+p*12)}ctx.strokeStyle=world.colors[1]+'55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-roadTop/2,hor);ctx.lineTo(cx-roadBot/2,h);ctx.moveTo(cx+roadTop/2,hor);ctx.lineTo(cx+roadBot/2,h);ctx.stroke();ctx.globalAlpha=.12;ctx.fillStyle=world.colors[1];ctx.fillRect(cx-roadBot/2,hor+((t*110)%(h-hor)),roadBot,3);ctx.globalAlpha=1}
function drawObstacle(item,world){const p=clamp(item.p,0,1.15),y=state.h*.29+Math.pow(Math.min(p,1.1),1.55)*state.h*.63,x=laneX(item.lane,p),s=.25+p*1.08;ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.shadowBlur=15;ctx.shadowColor=world.colors[1];if(item.type==='gate'){ctx.fillStyle='#3e3542';ctx.fillRect(-39,-58,78,13);ctx.fillRect(-34,-58,9,65);ctx.fillRect(25,-58,9,65);ctx.fillStyle=world.colors[1];ctx.fillRect(-39,-60,78,4);ctx.fillStyle='#fa658a';ctx.beginPath();ctx.moveTo(-14,-49);ctx.lineTo(0,-42);ctx.lineTo(14,-49);ctx.fill()}else if(item.type==='gap'){ctx.fillStyle='#080a11';ctx.beginPath();ctx.ellipse(0,-3,43,12,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=world.colors[1];ctx.lineWidth=2;ctx.stroke()}else{ctx.fillStyle='#343342';ctx.beginPath();ctx.moveTo(-31,0);ctx.lineTo(-27,-43);ctx.lineTo(0,-55);ctx.lineTo(27,-43);ctx.lineTo(31,0);ctx.closePath();ctx.fill();ctx.fillStyle=world.colors[1];ctx.fillRect(-25,-43,50,5);ctx.fillStyle='#171925';ctx.fillRect(-12,-34,24,17);ctx.strokeStyle='#f6d984';ctx.lineWidth=2;ctx.strokeRect(-12,-34,24,17)}ctx.restore()}
function drawCollectible(item,t){let p=clamp(item.p,0,1.1),y=state.h*.29+Math.pow(p,1.55)*state.h*.63-19,x=laneX(item.lane,p);ctx.save();ctx.translate(x,y);const spin=Math.abs(Math.cos(t*7+item.offset));ctx.scale(.45+spin*.55,.85);ctx.shadowBlur=12;ctx.shadowColor=item.type==='shard'?'#75f7ff':'#ffe66a';ctx.fillStyle=item.type==='shard'?'#7df6ff':'#ffd95b';if(item.type==='coin'){ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#bd762f';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✦',0,1)}else{ctx.rotate(Math.PI/4);ctx.fillRect(-7,-7,14,14);ctx.fillStyle='#fff';ctx.fillRect(-2,-5,4,10)}ctx.restore()}
function drawBoss(r,world,t){if(!r.bossActive)return;const w=state.w,h=state.h,x=w/2,y=h*.23;ctx.save();ctx.globalAlpha=.72+.12*Math.sin(t*5);ctx.shadowBlur=30;ctx.shadowColor=world.colors[1];ctx.fillStyle='#18121d';ctx.beginPath();ctx.ellipse(x,y,68,85,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=world.colors[1];ctx.beginPath();ctx.ellipse(x-23,y-9,6,9,0,0,Math.PI*2);ctx.ellipse(x+23,y-9,6,9,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=world.colors[1];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-38,y-53);ctx.lineTo(x-67,y-95);ctx.lineTo(x-18,y-72);ctx.moveTo(x+38,y-53);ctx.lineTo(x+67,y-95);ctx.lineTo(x+18,y-72);ctx.stroke();ctx.restore()}
function drawRunner(r,t){const c=chars[state.char],h=state.h,x=laneX(r.lane,1),baseY=h*.83,jumpY=r.jump>0?Math.sin((.78-r.jump)/.78*Math.PI)*h*.18:0,sliding=r.slide>0;ctx.save();ctx.translate(x,baseY-jumpY);ctx.scale(clamp(h/760,.68,1.08),clamp(h/760,.68,1.08));ctx.globalAlpha=r.invuln>0?.72+.28*Math.sin(t*25):1;ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(0,0,27+(jumpY?jumpY*.04:0),7,0,0,Math.PI*2);ctx.fill();let bob=Math.sin(t*13)*4,legSwing=Math.sin(t*14)*13;if(sliding){ctx.translate(0,15);ctx.rotate(-.08)}else ctx.translate(0,bob);ctx.fillStyle='#242432';if(sliding){ctx.fillRect(-20,-24,24,12);ctx.fillRect(3,-23,27,11)}else{ctx.save();ctx.translate(-9,-17);ctx.rotate(legSwing*.018);ctx.fillRect(-7,-34,14,34);ctx.fillStyle='#d5d9e3';ctx.fillRect(-9,-5,19,7);ctx.restore();ctx.save();ctx.translate(9,-17);ctx.rotate(-legSwing*.018);ctx.fillStyle='#242432';ctx.fillRect(-7,-34,14,34);ctx.fillStyle='#d5d9e3';ctx.fillRect(-9,-5,19,7);ctx.restore()}ctx.fillStyle=c.colors[1];ctx.beginPath();if(sliding){ctx.moveTo(-27,-47);ctx.lineTo(24,-46);ctx.lineTo(31,-19);ctx.lineTo(-34,-19)}else{ctx.moveTo(-20,-91);ctx.lineTo(20,-91);ctx.lineTo(28,-36);ctx.lineTo(-27,-36)}ctx.closePath();ctx.fill();ctx.fillStyle=c.colors[0];ctx.beginPath();if(sliding){ctx.moveTo(-25,-47);ctx.lineTo(21,-47);ctx.lineTo(12,-36);ctx.lineTo(-18,-37)}else{ctx.moveTo(-19,-87);ctx.lineTo(19,-87);ctx.lineTo(23,-47);ctx.lineTo(-22,-47)}ctx.fill();ctx.fillStyle=c.colors[0];ctx.fillRect(-25,sliding?-44:-83,10,29);ctx.fillStyle=c.colors[2];ctx.beginPath();ctx.arc(-20,sliding?-16:-50,5,0,Math.PI*2);ctx.arc(23,sliding?-15:-51,5,0,Math.PI*2);ctx.fill();if(!sliding){ctx.fillStyle=c.colors[2];ctx.beginPath();ctx.arc(0,-102,16,0,Math.PI*2);ctx.fill();ctx.fillStyle=c.colors[0];if(c.hair==='bald'){ctx.beginPath();ctx.ellipse(0,-114,15,7,0,Math.PI,0);ctx.fill()}else if(c.hair==='long'){ctx.beginPath();ctx.moveTo(-15,-109);ctx.lineTo(-21,-75);ctx.lineTo(-12,-85);ctx.lineTo(-8,-71);ctx.lineTo(0,-85);ctx.lineTo(14,-78);ctx.lineTo(14,-111);ctx.fill()}else{const points=c.hair==='sweep'?[-18,-106,-12,-122,0,-111,9,-126,17,-108,20,-114,19,-102]:[-17,-108,-18,-121,-8,-112,-3,-131,5,-112,17,-124,15,-107,23,-115,18,-100];ctx.beginPath();ctx.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)ctx.lineTo(points[i],points[i+1]);ctx.closePath();ctx.fill()}ctx.fillStyle='#242436';ctx.fillRect(-10,-102,6,2);ctx.fillRect(5,-102,6,2);ctx.strokeStyle='#532f36';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-4,-94);ctx.lineTo(4,-94);ctx.stroke();if(state.char===4||state.char===5){ctx.strokeStyle='#8c4961';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-12,-101);ctx.lineTo(12,-101);ctx.moveTo(-12,-96);ctx.lineTo(12,-96);ctx.stroke()}}if(r.ability>0){ctx.strokeStyle=c.colors[0];ctx.globalAlpha=.45+.3*Math.sin(t*20);ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-50,37,67,0,0,Math.PI*2);ctx.stroke()}ctx.restore()}
function drawHUD(r){$('#hud-distance').innerHTML=`${Math.floor(r.distance)} <small>M</small>`;$('#hud-coins').textContent=r.coins;$('#energy-fill').style.width=r.energy+'%';$('#ability-btn').classList.toggle('ready',r.energy>=100);$('#boss-hud').classList.toggle('active',r.bossActive);$('#boss-fill').style.width=r.bossActive?`${Math.max(0,100-r.bossTime/14*100)}%`:'0%';$('#health-display').textContent='♥ '.repeat(r.health).trim()||'♡'}

// The runner advances through perspective space; hazards are readable before they reach the player.
function spawnHazard(r){
 const lane=Math.floor(Math.random()*3),roll=Math.random();
 const type=roll<.34?'block':roll<.67?'gate':'gap';
 r.items.push({type,lane,p:0});
}
function spawnRewards(r){
 const lane=Math.floor(Math.random()*3),count=3+Math.floor(Math.random()*3);
 for(let i=0;i<count;i++)r.items.push({type:'coin',lane,p:-i*.105,offset:Math.random()*6});
 if(Math.random()<.58)r.items.push({type:'shard',lane:(lane+1+Math.floor(Math.random()*2))%3,p:-.12,offset:Math.random()*6});
}
function updateRun(dt){
 const r=state.run;if(!r||state.screen!=='game')return;
 const world=worlds[state.world],t=performance.now()/1000;
 r.elapsed+=dt;r.speed=Math.min(.7,.36+r.elapsed*.0028);r.distance+=dt*(7+r.elapsed*.1);
 r.lane+=(r.target-r.lane)*Math.min(1,dt*12);
 r.jump=Math.max(0,r.jump-dt);r.slide=Math.max(0,r.slide-dt);r.ability=Math.max(0,r.ability-dt);r.invuln=Math.max(0,r.invuln-dt);r.shake=Math.max(0,r.shake-dt*2.7);r.flash=Math.max(0,r.flash-dt*2.5);
 if(r.bossActive){r.bossTime+=dt;if(r.bossTime>=14){r.bossActive=false;r.bossCount++;r.bossAt=r.distance+300;r.bossTime=0;r.energy=Math.min(100,r.energy+25);r.particles.push({type:'burst',x:.5,y:.36,t:0});tone(520,.3,'triangle');toast('RIFT HUNTER DEFEATED · KEEP RUNNING')}}
 else if(r.distance>=r.bossAt){r.bossActive=true;r.bossTime=0;toast('RIFT HUNTER APPROACHING · SURVIVE 14 SECONDS');tone(160,.35,'sawtooth')}
 r.spawn-=dt;r.coinSpawn-=dt;
 if(r.spawn<=0){spawnHazard(r);r.spawn=(r.bossActive?1.05:1.55)+Math.random()*.55}
 if(r.coinSpawn<=0){spawnRewards(r);r.coinSpawn=1.15+Math.random()*.6}
 for(const item of r.items)item.p+=r.speed*dt;
 for(let i=r.items.length-1;i>=0;i--){const item=r.items[i];
  if(item.p>.82&&item.p<1.04&&Math.abs(item.lane-r.lane)<.42){
   if(item.type==='coin'){r.coins++;state.coins++;saveCoins();tone(760,.045,'sine');r.particles.push({type:'spark',x:(item.lane-1)*.18+.5,y:.79,t:0})}
   else if(item.type==='shard'){r.energy=Math.min(100,r.energy+28);tone(460,.12,'triangle');r.particles.push({type:'burst',x:(item.lane-1)*.18+.5,y:.78,t:0});if(r.bossActive)r.bossTime=Math.min(13.7,r.bossTime+1)}
   else if(r.invuln<=0){const cleared=item.type==='gap'?r.jump>.12:item.type==='gate'?r.slide>.08:false;if(!cleared){r.health--;r.invuln=1.15;r.shake=1;r.flash=.65;tone(105,.24,'sawtooth');$('#health-display').textContent='♥ '.repeat(r.health).trim()||'♡';if(r.health<=0){r.items.splice(i,1);finishRun(false);return}}}
   r.items.splice(i,1);continue;
  }
  if(item.p>1.16)r.items.splice(i,1);
 }
 for(const p of r.particles)p.t+=dt;
 r.particles=r.particles.filter(p=>p.t<.55);
 drawHUD(r);
}
function drawEffects(r){
 for(const p of r.particles){const x=state.w*p.x,y=state.h*p.y,life=p.t/.55;ctx.save();ctx.globalAlpha=1-life;ctx.strokeStyle=p.type==='spark'?'#ffe66a':worlds[state.world].colors[1];ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,8+life*48,0,Math.PI*2);ctx.stroke();ctx.restore()}
 if(r.flash>0){ctx.fillStyle=`rgba(250,70,100,${r.flash*.22})`;ctx.fillRect(0,0,state.w,state.h)}
}
function renderFrame(now){
 requestAnimationFrame(renderFrame);const dt=Math.min(.05,Math.max(0,(now-state.last)/1000));state.last=now;
 if(state.screen==='game'&&state.run){updateRun(dt);if(!state.run||state.screen!=='game')return;const r=state.run,w=worlds[state.world],t=now/1000;ctx.save();if(r.shake>0)ctx.translate((Math.random()-.5)*8*r.shake,(Math.random()-.5)*6*r.shake);skyAndWorld(t,w);road(t,w);drawBoss(r,w,t);for(const item of r.items){if(item.type==='coin'||item.type==='shard')drawCollectible(item,t);else drawObstacle(item,w)}drawRunner(r,t);drawEffects(r);ctx.restore()}
 else if(state.screen==='home'){const w=worlds[0],t=now/1000;skyAndWorld(t,w);road(t*.12,w)}
}
requestAnimationFrame(renderFrame);
})();
