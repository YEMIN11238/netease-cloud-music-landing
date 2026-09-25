'use strict';
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const page=$('#page'), chapters=$$('.chapter'), reduce=matchMedia('(prefers-reduced-motion: reduce)');
if('scrollRestoration' in history)history.scrollRestoration='manual';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
let paused=reduce.matches, active=0, scrollAnimation=null, wheelLock=0;
const motionOK=()=>!paused&&!reduce.matches;
const animate=(target,options)=>{if(window.anime&&motionOK())return anime.animate(target,options);return null;};
if(motionOK())document.body.classList.add('js-motion');

const artists=[
 {name:'陈粒',en:'CHEN LI',file:'chen-li.jpg',id:1007170,tag:'独立 / 自由生长',description:'从《小梦大半》开始，听见不被定义的旋律。细腻的表达与鲜明的声音，让每一次重听都成为新的发现。'},
 {name:'毛不易',en:'MAO BUYI',file:'mao-buyi.jpg',id:12138269,tag:'叙事 / 平凡的诗',description:'在《小王》里，把目光放回具体的生活。平凡的人与微小的心事，也值得被认真唱成一首歌。'},
 {name:'房东的猫',en:'LANDLORD’S CAT',file:'landlords-cat.jpg',id:1050282,tag:'双人 / 温柔日常',description:'从一把吉他、两个人的声音里，听见生活的温柔切面。推荐从专辑《柔软》开始，给忙碌的日常留一点呼吸。'},
 {name:'陈鸿宇',en:'CHEN HONGYU',file:'chen-hongyu.jpg',id:1058228,tag:'民谣 / 诗与远方',description:'低回的人声、朴素的吉他，还有关于路途与生活的想象。从《浓烟下的诗歌电台》出发，走进他的音乐世界。'}
];
const albums=[
 {title:'小梦大半',artist:'陈粒',file:'album-xiaomeng.jpg',id:34780579,moods:['road','night'],tag:'天马行空',description:'在细腻与锋利之间，让想象自由生长。留出一段完整的时间，走进陈粒的声音世界。'},
 {title:'小王',artist:'毛不易',file:'album-xiaowang.jpg',id:83823905,moods:['quiet','night'],tag:'平凡生活',description:'把宏大的世界放在一边，听听普通人的心事。生活的褶皱里，也藏着值得珍藏的光。'},
 {title:'柔软',artist:'房东的猫',file:'album-soft.jpg',id:37989114,moods:['quiet','road'],tag:'温柔片刻',description:'人声和吉他之间，留着足够的空气。一张适合慢慢听的唱片，给日常一点柔软的余地。'},
 {title:'浓烟下的诗歌电台',artist:'陈鸿宇',file:'album-poetry-radio.jpg',id:3116882,moods:['road','quiet'],tag:'路上的诗',description:'低回的声音，把路途唱成诗。从第一段前奏到最后一个尾音，让心绪随着音乐去远行。'}
];

function renderAlbums(mood='all'){
 const selected=albums.filter(a=>mood==='all'||a.moods.includes(mood));
 $('#dailyAlbums').innerHTML=selected.map(a=>`<article class="album-card"><a href="https://music.163.com/#/album?id=${a.id}" target="_blank" rel="noopener" aria-label="在网易云音乐打开 ${a.artist}《${a.title}》"><div class="album-cover"><img src="assets/${a.file}" alt="${a.artist}《${a.title}》专辑封面" loading="lazy"><span class="album-tag">${a.tag}</span></div><h3>${a.title}</h3><p>${a.artist} / 编辑选听</p></a></article>`).join('');
 $('#filterStatus').textContent=mood==='all'?'4 张唱片，4 种心情':`${selected.length} 张唱片，留给此刻的你`;
 document.dispatchEvent(new CustomEvent('albums:rendered'));
}
renderAlbums();
$$('[data-mood]').forEach(button=>button.addEventListener('click',()=>{ $$('[data-mood]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderAlbums(button.dataset.mood); }));

$('#artistGallery').innerHTML=artists.map((a,i)=>`<button class="artist-card" data-artist="${i}" aria-label="查看${a.name}音乐人海报和介绍"><div class="artist-portrait"><img src="assets/${a.file}" alt="${a.name}官方肖像" loading="lazy"><span>${a.en} / 0${i+1}</span></div><div class="artist-info"><h3>${a.name}</h3><span>${a.tag}</span></div></button>`).join('');
function openDialog(dialog){dialog.showModal();animate(dialog,{opacity:[0,1],y:[24,0],scale:[.97,1],duration:450,ease:'outExpo'});}
$$('[data-artist]').forEach(button=>button.addEventListener('click',()=>{const a=artists[Number(button.dataset.artist)];$('#dialogName').textContent=a.name;$('#dialogImage').src=`assets/${a.file}`;$('#dialogImage').alt=`${a.name}官方肖像`;$('#dialogDescription').textContent=a.description;$('#dialogLink').href=`https://music.163.com/#/artist?id=${a.id}`;openDialog($('#artistDialog'));}));
$$('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close).close()));
$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}));
$('#creditsButton').addEventListener('click',()=>openDialog($('#creditsDialog')));

chapters.forEach((section,index)=>{
 const number=String(index+1).padStart(2,'0');
 $('#menuLinks').insertAdjacentHTML('beforeend',`<a href="#${section.id}"><span>${number}</span>${section.dataset.name}</a>`);
 $('#railLinks').insertAdjacentHTML('beforeend',`<a href="#${section.id}" aria-label="第${index+1}章：${section.dataset.name}" title="${number} ${section.dataset.name}"></a>`);
});
$('#menuButton').addEventListener('click',()=>{openDialog($('#chapterMenu'));$('#menuButton').setAttribute('aria-expanded','true');animate('#menuLinks a',{y:[25,0],opacity:[0,1],delay:window.anime?anime.stagger(35):0,duration:500,ease:'outExpo'});});
$('#chapterMenu').addEventListener('close',()=>$('#menuButton').setAttribute('aria-expanded','false'));
function chapterTop(target){return target.dataset.opening!==undefined?Number(target.dataset.opening)*page.clientHeight:target.getBoundingClientRect().top-page.getBoundingClientRect().top+page.scrollTop;}
function goTo(id){const target=document.getElementById(id);if(!target)return;scrollAnimation?.cancel();const destination=chapterTop(target)-(target.classList.contains('stack-card')?110:0);wheelLock=performance.now()+1150;const state={top:page.scrollTop};if(motionOK()&&window.anime){page.style.scrollBehavior='auto';scrollAnimation=anime.animate(state,{top:destination,duration:1000,ease:'inOutQuart',onUpdate:()=>{page.scrollTop=state.top;},onComplete:()=>{scrollAnimation=null;page.style.scrollBehavior='';}});}else page.scrollTo({top:destination,behavior:'instant'});}
document.addEventListener('click',event=>{const anchor=event.target.closest('a[href^="#"]');if(!anchor)return;const id=anchor.getAttribute('href').slice(1);if(!document.getElementById(id))return;event.preventDefault();if($('#chapterMenu').open)$('#chapterMenu').close();goTo(id);history.replaceState(null,'',`#${id}`);});
window.addEventListener('hashchange',()=>{const id=decodeURIComponent(location.hash.slice(1));if(document.getElementById(id))goTo(id);});
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>goTo(b.dataset.go)));

// The opening five scenes advance one beat at a time; long editorial chapters
// resume normal scrolling. Touch follows the same scene stops without trapping
// readers in the longer card and article sections.
const introSceneIds=['hero','discover','roaming','pulse','echo','daily'];
function introStops(){return introSceneIds.map(id=>({id,top:chapterTop(document.getElementById(id))}));}
function nextIntroScene(direction){
 const stops=introStops(),y=page.scrollTop,end=stops.at(-1).top;
 if(direction>0&&y>=end-18)return null;
 if(direction<0&&y>end+25)return null;
 return direction>0
  ?stops.find(stop=>stop.top>y+18)||null
  :stops.findLast(stop=>stop.top<y-18)||null;
}
page.addEventListener('wheel',event=>{
 if(!motionOK()||Math.abs(event.deltaY)<3||event.ctrlKey)return;
 const target=nextIntroScene(event.deltaY);
 if(!target)return;
 event.preventDefault();
 if(performance.now()<wheelLock)return;
 goTo(target.id);
},{passive:false});
let touchStart=null;
page.addEventListener('touchstart',event=>{
 if(event.touches.length!==1)return;
 touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY,top:page.scrollTop};
},{passive:true});
page.addEventListener('touchmove',event=>{
 if(!touchStart||!motionOK()||event.touches.length!==1)return;
 const dx=event.touches[0].clientX-touchStart.x,dy=touchStart.y-event.touches[0].clientY;
 if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)*1.1&&nextIntroScene(dy))event.preventDefault();
},{passive:false});
page.addEventListener('touchend',event=>{
 if(!touchStart)return;
 const dy=touchStart.y-event.changedTouches[0].clientY,dx=touchStart.x-event.changedTouches[0].clientX;
 if(motionOK()&&Math.abs(dy)>42&&Math.abs(dy)>Math.abs(dx)*1.1&&performance.now()>wheelLock){
  const target=nextIntroScene(dy);
  if(target)goTo(target.id);
 }
 touchStart=null;
},{passive:true});
page.addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{root:page,threshold:.12});
$$('.reveal').forEach(el=>revealObserver.observe(el));
const entered=new Set();
function animateChapter(section){if(entered.has(section.id))return;entered.add(section.id);if(section.id==='hero')animate('.headline-line',{x:(_,i)=>[i%2?140:-140,0],y:[40,0],opacity:[0,1],duration:1400,delay:window.anime?anime.stagger(150):0,ease:'outExpo'});
 if(section.id==='roaming'){animate('.cargo-title>span',{x:(_,i)=>[i%2?900:-900,0],opacity:[0,1],duration:1100,delay:window.anime?anime.stagger(130):0,ease:'outExpo'});animate('.word-reveal',{y:['100%',0],rotateX:[45,0],opacity:[0,1],duration:800,delay:window.anime?anime.stagger(80,{start:350}):0,ease:'outExpo'});scramble();}
 if(section.id==='connections')animate('.map-node',{scale:[.2,1],opacity:[0,1],delay:window.anime?anime.stagger(120):0,duration:1300,ease:'outElastic(1, .6)'});
}
let framePending=false;const cards=$$('.stack-card'),parallax=$$('[data-parallax]');
function updateScroll(){framePending=false;const y=page.scrollTop,h=page.clientHeight;const current=chapters.findLastIndex(s=>chapterTop(s)<=y+h*.42);active=Math.max(0,current);$('#currentChapter').textContent=String(active+1).padStart(2,'0');$$('#railLinks a').forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});chapters.forEach((s,i)=>s.classList.toggle('is-active',i===active));animateChapter(chapters[active]);$('#pageProgress').style.width=`${y/Math.max(1,page.scrollHeight-h)*100}%`;
 const p=motionOK()?clamp(y/(h*1.15)):(y>h*.5?1:0),ease=p*p*(3-2*p),radius=Math.hypot(page.clientWidth,h)/2;
 const orbRadius=radius+(Math.min(page.clientWidth*.098,145)-radius)*ease;
 $('.music-orb').style.clipPath=`circle(${orbRadius}px at 50% 50%)`;
 $('.orb-inner').style.scale=String(Math.max(.68,Math.min(1,orbRadius*2/h+.06)));
 $('.hero').style.opacity=String(1-clamp(p*3));$('.hero').style.pointerEvents=p>.4?'none':'';
 const reveal=clamp((p-.73)/.27);$('.discovery').style.opacity=String(reveal);$('.discovery').style.pointerEvents=reveal>.8?'auto':'none';
 $('.hero').inert=p>.4;$('.discovery').inert=reveal<.8;
 $('.discovery-left').style.transform=`translateY(${(1-reveal)*70}px)`;$('.discovery-right').style.transform=`translateY(${(1-reveal)*100}px)`;
 $('.opening-axis').style.opacity=String(reveal);$('.orb-caption').style.opacity=String(reveal);
 document.body.classList.toggle('header-light',y>h*.35&& !['roaming','pulse','original','live','download'].includes(chapters[active].id));
 document.body.classList.toggle('header-hidden',y>h*.15&&y<1.2*h);
 if(motionOK()){
 cards.forEach((card,i)=>{const next=cards[i+1];if(!next){card.style.transform='none';return;}const amount=clamp((h*.82-next.getBoundingClientRect().top)/(h*.72));card.style.transform=`scale(${1-amount*.075}) rotate(${-amount*3}deg)`;});
 parallax.forEach(el=>{const rect=el.parentElement.getBoundingClientRect();if(rect.bottom>0&&rect.top<h)el.style.transform=`translateY(${clamp(-rect.top,-h,h)*Number(el.dataset.parallax)}px)`;});
 }
}
page.addEventListener('scroll',()=>{if(!framePending){framePending=true;requestAnimationFrame(updateScroll);}},{passive:true});window.addEventListener('resize',updateScroll);

let albumIndex=0;
function changeAlbum(delta){albumIndex=(albumIndex+delta+albums.length)%albums.length;const a=albums[albumIndex];$('#featureCover').src=`assets/${a.file}`;$('#featureCover').alt=`${a.artist}《${a.title}》专辑封面`;$('#featureArtist').textContent=a.artist;$('#featureTitle').textContent=a.title;$('#featureDescription').textContent=a.description;$('#featureLink').href=`https://music.163.com/#/album?id=${a.id}`;$('#albumCounter').textContent=`0${albumIndex+1} / 04`;animate('#featureCover',{x:[delta*35,0],rotate:[delta*3,0],opacity:[.2,1],duration:700,ease:'outExpo'});animate('.album-feature-copy',{y:[15,0],opacity:[.4,1],duration:600,ease:'outExpo'});}
$('#nextAlbum').addEventListener('click',()=>changeAlbum(1));$('#previousAlbum').addEventListener('click',()=>changeAlbum(-1));
let toastTimer;function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2400);}
$('#spinRecord').addEventListener('click',()=>{const spinning=$('.record-stage').classList.toggle('is-spinning');$('#spinRecord').setAttribute('aria-pressed',String(spinning));$('#spinRecord>span').textContent=spinning?'暂停唱片':'转动唱片';$('#recordStatus').textContent=spinning?(motionOK()?'唱片正在旋转 · 这是视觉演示，无音频':'动效已暂停 · 恢复动效后唱片会旋转'):'唱片视觉互动 · 不播放商业录音';});
$$('.like-button').forEach(button=>button.addEventListener('click',()=>{const liked=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(liked));button.innerHTML=liked?'♥ <span>同频了</span>':'♡ <span>有共鸣</span>';animate(button,{scale:[1,.8,1.15,1],duration:480,ease:'outQuad'});toast(liked?'这一刻，我们同频了。':'已取消共鸣');}));
$$('[data-route]').forEach(button=>button.addEventListener('click',()=>{const a=artists[Number(button.dataset.route)];$$('[data-route]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('#routeDescription').textContent=`下一站：${a.name}。${a.description.split('。')[0]}。`;animate(button,{scale:[1,1.2,1.12],duration:600,ease:'outExpo'});}));
const moments=[['07:30','早安，给新的一天一点期待。','#e7e5e1','#111','清晨'],['14:00','让旋律陪伴一段专注的时间。','#d5dfd9','#111','学习'],['18:20','把日落，放进回家的播放列表。','#f2aa82','#4d251f','散步'],['23:45','今晚，慢慢听自己说话。','#292633','#f4f3ef','夜晚']];
const momentArt=['album-soft.jpg','album-poetry-radio.jpg','album-xiaomeng.jpg','album-xiaowang.jpg'];
$('.moment-time').insertAdjacentHTML('afterbegin',momentArt.map((file,i)=>`<img class="moment-art${i===0?' is-current':''}" src="assets/${file}" alt="" aria-hidden="true" loading="lazy">`).join(''));
let selectedMoment=0,shownMoment=0;
function showMoment(index,commit=false){
 const moment=moments[index];
 if(shownMoment!==index){
  shownMoment=index;
  $('#momentClock').textContent=moment[0];
  $('#momentLabel').textContent=moment[1];
  $('.moment-time').style.background=moment[2];
  $('.moment-time').style.color=moment[3];
  $$('.moment-art').forEach((image,i)=>image.classList.toggle('is-current',i===index));
  animate('#momentClock',{y:[16,0],opacity:[.3,1],duration:520,ease:'outExpo'});
 }
 if(commit)$('#momentLink').href=`https://music.163.com/#/discover/playlist/?cat=${encodeURIComponent(moment[4])}`;
}
$$('[data-moment]').forEach(button=>{
 const index=Number(button.dataset.moment);
 button.addEventListener('pointerenter',event=>{if(motionOK()&&event.pointerType==='mouse')showMoment(index);});
 button.addEventListener('pointerleave',()=>showMoment(selectedMoment));
 button.addEventListener('focus',()=>{if(motionOK())showMoment(index);});
 button.addEventListener('blur',()=>showMoment(selectedMoment));
 button.addEventListener('click',()=>{
  selectedMoment=index;
  $$('[data-moment]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  showMoment(index,true);
 });
});

$$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{if(!motionOK()||e.pointerType!=='mouse')return;const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.13}px,${(e.clientY-r.top-r.height/2)*.2}px)`;});el.addEventListener('pointerleave',()=>{el.style.transform='';});});
$$('.artist-card').forEach(el=>{const portrait=$('.artist-portrait',el);el.addEventListener('pointermove',e=>{if(!motionOK()||e.pointerType!=='mouse')return;const r=portrait.getBoundingClientRect();portrait.style.transform=`rotateY(${(e.clientX-r.left-r.width/2)/30}deg) rotateX(${-(e.clientY-r.top-r.height/2)/50}deg)`;});el.addEventListener('pointerleave',()=>portrait.style.transform='');});

let scrambleHandle;function scramble(){if(!motionOK())return;const text='每一种热爱\n都有回响',chars='MUSIC+*#云音悦';let step=0;clearInterval(scrambleHandle);scrambleHandle=setInterval(()=>{step++;$('#scrambleText').textContent=[...text].map((ch,i)=>ch==='\n'?'\n':step>i*2+5?ch:chars[Math.floor(Math.random()*chars.length)]).join('');if(step>32){clearInterval(scrambleHandle);$('#scrambleText').textContent=text;}},45);}
$('#scrambleText').style.whiteSpace='pre-line';
function applyMotion(){document.body.classList.toggle('motion-paused',paused||reduce.matches);$('#motionToggle').setAttribute('aria-pressed',String(paused));$('#motionToggle').textContent=paused?'恢复动效':'暂停动效';if(paused){scrollAnimation?.cancel();scrollAnimation=null;page.style.scrollBehavior='';clearInterval(scrambleHandle);$('#scrambleText').textContent='每一种热爱\n都有回响';$$('.magnetic,.artist-portrait').forEach(el=>el.style.transform='');}if(window.anime)anime.engine.speed=paused?0:1;}
$('#motionToggle').addEventListener('click',()=>{paused=!paused;applyMotion();});reduce.addEventListener('change',()=>{paused=reduce.matches;applyMotion();});applyMotion();

// Original ASCII image field: source image luminance + wave deformation + pointer flow.
const ascii=$('#asciiCanvas'), actx=ascii.getContext('2d'), ambient=$('#ambientCanvas'),ctx=ambient.getContext('2d');
const sample=document.createElement('canvas'),sctx=sample.getContext('2d',{willReadFrequently:true});
const art=new Image();art.src='assets/sound-world.png';let pixels=null,cols=100,rows=60,W=1,H=1,DPR=1,mouse={x:.7,y:.5},pointer={x:.7,y:.5};
function resizeCanvases(){W=page.clientWidth;H=page.clientHeight;const narrow=W<=800;DPR=Math.min(devicePixelRatio||1,narrow?1:1.5);[ascii,ambient].forEach(c=>{c.width=W*DPR;c.height=H*DPR;});actx.setTransform(DPR,0,0,DPR,0,0);ctx.setTransform(DPR,0,0,DPR,0,0);cols=Math.floor(W/(narrow?18:12));rows=Math.floor(H/(narrow?19:14));sample.width=cols;sample.height=rows;if(art.complete&&art.naturalWidth){sctx.drawImage(art,0,0,cols,rows);pixels=sctx.getImageData(0,0,cols,rows).data;}}
art.addEventListener('load',resizeCanvases);window.addEventListener('resize',resizeCanvases);resizeCanvases();
page.addEventListener('pointermove',e=>{pointer.x=e.clientX/W;pointer.y=e.clientY/H;},{passive:true});let last=0,time=0;
function draw(now){requestAnimationFrame(draw);if(document.hidden||now-last<(W<=800?80:42))return;const dt=Math.min((now-last)/1000,.08);last=now;if(motionOK())time+=dt;mouse.x+=(pointer.x-mouse.x)*.09;mouse.y+=(pointer.y-mouse.y)*.09;
 if(active===0){ctx.clearRect(0,0,W,H);for(let i=0;i<65;i++){const a=i*2.39+time*.024,r=H*(.22+(i%17)*.009);const x=W*.67+Math.cos(a)*r+(mouse.x-.5)*10,y=H*.5+Math.sin(a)*r;ctx.fillStyle=`rgba(255,66,74,${.1+(Math.sin(time+i)+1)*.1})`;ctx.beginPath();ctx.arc(x,y,i%8?1:1.8,0,Math.PI*2);ctx.fill();}}
 if(active===2&&pixels){actx.clearRect(0,0,W,H);actx.fillStyle='#080505';actx.fillRect(0,0,W,H);actx.font='11px monospace';const chars=' .:+*#MUSIC';for(let y=0;y<rows;y++){for(let x=0;x<cols;x++){const index=(y*cols+x)*4,light=(pixels[index]*.7+pixels[index+1]*.2+pixels[index+2]*.1)/255;const nx=x/cols,ny=y/rows;const dist=Math.hypot(nx-mouse.x,ny-mouse.y);const ripple=motionOK()?Math.sin(dist*27-time*3.2)*Math.exp(-dist*4)*16:0;const flow=motionOK()?Math.sin(y*.16+time*.4)*5:0;const value=clamp(light*1.3+.07*Math.sin(x*.15+y*.2+time));if(value<.065)continue;actx.fillStyle=`rgba(${130+Math.floor(value*125)},${20+Math.floor(value*45)},${35+Math.floor(value*50)},${.18+value*.8})`;actx.fillText(chars[Math.min(chars.length-1,Math.floor(value*chars.length))],x*W/cols+flow,y*H/rows+ripple);}}}
}
requestAnimationFrame(draw);
const tagline=$('.roaming-copy>p:not(.eyebrow)');
tagline.setAttribute('aria-label','不必提前想好下一首。从此刻的心情出发，让旋律带路。');
tagline.innerHTML='<span class="word-reveal" aria-hidden="true">不必提前</span><span class="word-reveal" aria-hidden="true">想好下一首。</span><br><span class="word-reveal" aria-hidden="true">从此刻的心情出发，</span><span class="word-reveal" aria-hidden="true">让旋律带路。</span>';
updateScroll();
window.addEventListener('pageshow',()=>{const id=decodeURIComponent(location.hash.slice(1));if(document.getElementById(id))goTo(id);});
