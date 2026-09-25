'use strict';
// A new chapter layer, assembled before app.js indexes the page.
(() => {
  const roaming = document.querySelector('#roaming');
  const live = document.querySelector('#live');
  if (!roaming || !live) return;

  roaming.insertAdjacentHTML('afterend', `
    <section class="chapter full-screen pulse-scene" id="pulse" data-name="此刻的节拍">
      <img class="pulse-art" src="assets/sound-world.png" alt="红色声音波形在深色空间中形成光环" loading="lazy">
      <div class="pulse-shade" aria-hidden="true"></div><div class="pulse-curtain" aria-hidden="true"></div>
      <div class="scene-top pulse-top"><span>04 / THE FIRST BEAT</span><span>一秒钟，进入音乐</span></div>
      <div class="pulse-giant" aria-hidden="true"><span>NOW</span><span>PLAYING.</span></div>
      <div class="pulse-copy"><p class="eyebrow">FOLLOW THE SOUND / 跟随声音</p><h2>让这一秒，<br>有自己的节拍。</h2><p>先别急着选下一首。戴上耳机，让此刻的情绪替你按下播放。</p></div>
      <a class="scene-next" href="#echo" aria-label="进入下一幕：留下来的歌">继续听 <span>↓</span></a>
    </section>
    <section class="chapter full-screen echo-scene" id="echo" data-name="留下来的歌">
      <div class="echo-orb echo-orb-one" aria-hidden="true"></div><div class="echo-orb echo-orb-two" aria-hidden="true"></div>
      <div class="scene-top echo-top"><span>05 / THE SONG THAT STAYS</span><span>一张唱片，一段记忆</span></div>
      <h2 class="echo-giant" aria-hidden="true">ECHO.</h2>
      <div class="echo-content"><div class="echo-cover-wrap"><img id="echoCover" src="assets/album-xiaomeng.jpg" alt="陈粒《小梦大半》专辑封面"><span class="echo-orbit" aria-hidden="true"></span></div><div class="echo-copy"><p class="eyebrow">EDITOR'S LISTENING NOTE</p><h2>有些歌，会在后来<br>继续回响。</h2><p id="echoDescription" aria-live="polite">从陈粒《小梦大半》开始，给想象留一段不被打断的时间。</p><div class="echo-controls"><button id="echoPrevious" aria-label="上一张唱片">←</button><span id="echoCounter">01 / 04</span><button id="echoNext" aria-label="下一张唱片">→</button></div><a class="text-link" href="#daily">继续探索唱片 ↗</a></div></div>
      <div class="echo-bottom"><span>每一次重听，都有新的发现。</span><span>SCROLL TO DISCOVER ↓</span></div>
    </section>`);

  live.insertAdjacentHTML('afterend', `
    <section class="chapter encore-scene" id="encore" data-name="散场之后">
      <div class="scene-top encore-top"><span>13 / AFTER THE SHOW</span><span>演出结束，音乐没有结束</span></div>
      <div class="encore-heading"><p class="eyebrow">THE ENCORE IS YOURS</p><h2>散场以后，<br><em>回响还在。</em></h2><p>灯光暗下，喜欢的声音仍会陪你走过回家的路。把今晚记住，也把下一首留给明天。</p></div>
      <div class="encore-gallery" aria-label="散场后的三张推荐唱片">
        <article><img src="assets/album-soft.jpg" alt="房东的猫《柔软》专辑封面" loading="lazy"><span>01 / 温柔片刻</span></article>
        <article><img src="assets/album-xiaowang.jpg" alt="毛不易《小王》专辑封面" loading="lazy"><span>02 / 平凡的诗</span></article>
        <article><img src="assets/album-xiaomeng.jpg" alt="陈粒《小梦大半》专辑封面" loading="lazy"><span>03 / 自由生长</span></article>
      </div>
      <div class="encore-bottom"><span>THE MUSIC GOES ON — 2026</span><a href="#community">去遇见同频的人 ↗</a></div>
    </section>`);

  const sections = [...document.querySelectorAll('.chapter')];
  sections.forEach((section, index) => {
    const label = section.querySelector('.section-top > span:first-child, .collection-intro > .eyebrow, .roaming-copy > .eyebrow, .feature-copy > .eyebrow, .live-copy > .eyebrow, .scene-top > span:first-child');
    if (label && /^\d{2}\s*\//.test(label.textContent)) {
      label.textContent = label.textContent.replace(/^\d{2}/, String(index + 1).padStart(2, '0'));
    }
  });
  document.querySelector('#chapterMenu > p').textContent = `${sections.length} 个章节，一次音乐旅程。`;
  document.querySelector('.chapter-rail > span:last-child').textContent = String(sections.length);
  const referenceNote = document.querySelector('#creditsDialog p:nth-of-type(4)');
  if (referenceNote) referenceNote.textContent = '动效参考 Goodpatch 的全屏收束与编辑式排版、Monomode 周年页的逐幕滚动节奏和明暗幕布；保留 Orange Horse Studio 提示的字符视觉与堆叠卡片，以及 CARGOX 提示的标题和路径动画。所有布局与交互均重新实现，没有复制参考网站代码或素材。';
  const roamingNext = document.querySelector('.roaming .scroll-prompt');
  roamingNext.href = '#pulse';
  roamingNext.innerHTML = '进入下一幕 <span>↓</span>';

  const echoSlides = [
    ['album-xiaomeng.jpg', '陈粒《小梦大半》', '从陈粒《小梦大半》开始，给想象留一段不被打断的时间。'],
    ['album-xiaowang.jpg', '毛不易《小王》', '让毛不易《小王》里的平凡故事，陪你走过日常的褶皱。'],
    ['album-soft.jpg', '房东的猫《柔软》', '在房东的猫《柔软》里，给忙碌的生活留一点温柔的空气。'],
    ['album-poetry-radio.jpg', '陈鸿宇《浓烟下的诗歌电台》', '跟着陈鸿宇的声音，把今天的路途慢慢听成一首诗。']
  ];
  let echoIndex = 0;
  function changeEcho(delta) {
    echoIndex = (echoIndex + delta + echoSlides.length) % echoSlides.length;
    const [file, title, description] = echoSlides[echoIndex];
    const cover = document.querySelector('#echoCover');
    cover.src = `assets/${file}`;
    cover.alt = `${title}专辑封面`;
    document.querySelector('#echoDescription').textContent = description;
    document.querySelector('#echoCounter').textContent = `${String(echoIndex + 1).padStart(2, '0')} / 04`;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !document.body.classList.contains('motion-paused')) {
      cover.animate([{ opacity: .3, transform: `translateX(${delta * 28}px) rotate(${delta * 3}deg)` }, { opacity: 1, transform: 'translateX(0) rotate(0)' }], { duration: 550, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
  }
  document.querySelector('#echoPrevious').addEventListener('click', () => changeEcho(-1));
  document.querySelector('#echoNext').addEventListener('click', () => changeEcho(1));
  // Horizontal swipes change the record without taking over vertical page scroll.
  let echoSwipeStart = null;
  const echoCoverWrap = document.querySelector('.echo-cover-wrap');
  echoCoverWrap.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) return;
    echoSwipeStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  echoCoverWrap.addEventListener('touchend', event => {
    if (!echoSwipeStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - echoSwipeStart.x;
    const dy = event.changedTouches[0].clientY - echoSwipeStart.y;
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.35) changeEcho(dx < 0 ? 1 : -1);
    echoSwipeStart = null;
  }, { passive: true });
  echoCoverWrap.addEventListener('touchcancel', () => { echoSwipeStart = null; }, { passive: true });

  const page = document.querySelector('#page');
  const scenes = [document.querySelector('#pulse'), document.querySelector('#echo'), document.querySelector('#encore')];
  let frame = 0;
  function updateScenes() {
    frame = 0;
    const height = page.clientHeight;
    for (const scene of scenes) {
      const rect = scene.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (height - rect.top) / (height + rect.height)));
      scene.style.setProperty('--scene-progress', progress.toFixed(3));
      scene.style.setProperty('--scene-drift', `${Math.round((progress - .5) * -90)}px`);
      scene.style.setProperty('--scene-image-drift', `${Math.round((progress - .5) * -35)}px`);
    }
  }
  page.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateScenes); }, { passive: true });
  window.addEventListener('resize', updateScenes);
  updateScenes();
})();
