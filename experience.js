'use strict';
// A lightweight motion layer kept separate from the original fourteen chapters.
(() => {
  const page = document.querySelector('#page');
  if (!page) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canMove = () => !reduced.matches && !document.body.classList.contains('motion-paused');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const bounded = new WeakSet();
  const trackedAlbumCards = new Set();

  const entrance = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-shown');
      entrance.unobserve(entry.target);
    }
  }, { root: page, threshold: .11, rootMargin: '0px 0px -5% 0px' });

  function observe(selector, step = 0) {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.classList.contains('motion-enter')) return;
      element.classList.add('motion-enter');
      element.style.setProperty('--enter-delay', `${Math.min(index * step, 450)}ms`);
      if (canMove()) entrance.observe(element);
      else element.classList.add('is-shown');
    });
  }

  function bindPointerLens(element) {
    if (bounded.has(element)) return;
    bounded.add(element);
    element.addEventListener('pointermove', event => {
      if (!canMove() || event.pointerType !== 'mouse') return;
      const rect = element.getBoundingClientRect();
      const x = clamp(event.clientX - rect.left, 0, rect.width);
      const y = clamp(event.clientY - rect.top, 0, rect.height);
      element.style.setProperty('--lens-x', `${x}px`);
      element.style.setProperty('--lens-y', `${y}px`);
      const image = element.querySelector('img');
      image?.style.setProperty('--image-x', `${((x / rect.width) - .5) * -14}px`);
      image?.style.setProperty('--image-y', `${((y / rect.height) - .5) * -14}px`);
    }, { passive: true });
    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--lens-x', '50%');
      element.style.setProperty('--lens-y', '50%');
      const image = element.querySelector('img');
      image?.style.setProperty('--image-x', '0px');
      image?.style.setProperty('--image-y', '0px');
    });
  }

  function bindAlbumCards() {
    trackedAlbumCards.forEach(card => entrance.unobserve(card));
    trackedAlbumCards.clear();
    observe('#dailyAlbums .album-card', 85);
    document.querySelectorAll('#dailyAlbums .album-card').forEach(card => trackedAlbumCards.add(card));
    document.querySelectorAll('#dailyAlbums .album-cover').forEach(bindPointerLens);
  }
  document.addEventListener('albums:rendered', bindAlbumCards);

  observe('#artistGallery .artist-card', 140);
  observe('.card-stack .stack-card', 80);
  observe('.community .quote-card', 120);
  observe('.feature-photo, .album-feature-image, .record-stage', 0);
  document.querySelectorAll('.artist-portrait').forEach(bindPointerLens);
  bindAlbumCards();
  document.body.classList.add('experience-ready');

  document.querySelectorAll('.stack-card').forEach(card => {
    const image = card.querySelector('img');
    if (!image) return;
    card.addEventListener('pointermove', event => {
      if (!canMove() || event.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      image.style.setProperty('--stack-x', `${(event.clientX - rect.left - rect.width / 2) * -.035}px`);
      image.style.setProperty('--stack-y', `${(event.clientY - rect.top - rect.height / 2) * -.035}px`);
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      image.style.setProperty('--stack-x', '0px');
      image.style.setProperty('--stack-y', '0px');
    });
  });

  const record = document.querySelector('.record-stage');
  record?.addEventListener('pointermove', event => {
    if (!canMove() || event.pointerType !== 'mouse') return;
    const rect = record.getBoundingClientRect();
    record.style.setProperty('--tilt-x', `${((event.clientY - rect.top) / rect.height - .5) * -8}deg`);
    record.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 8}deg`);
  }, { passive: true });
  record?.addEventListener('pointerleave', () => {
    record.style.setProperty('--tilt-x', '0deg');
    record.style.setProperty('--tilt-y', '0deg');
  });

  const drifting = [
    [document.querySelector('.live-massive'), 140],
    [document.querySelector('.footer-word'), 210],
    [document.querySelector('.oversize-word'), 100]
  ];
  let previousY = page.scrollTop;
  let frame = 0;
  function update() {
    frame = 0;
    const y = page.scrollTop;
    const delta = y - previousY;
    if (y > page.clientHeight * 1.6 && delta < -4) document.body.classList.add('header-floating');
    else if (delta > 4 || y < page.clientHeight * 1.3) document.body.classList.remove('header-floating');
    previousY = y;

    if (!canMove()) return;
    for (const [element, distance] of drifting) {
      if (!element) continue;
      const section = element.closest('.chapter');
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > page.clientHeight) continue;
      const progress = clamp((page.clientHeight - rect.top) / (page.clientHeight + rect.height));
      element.style.setProperty('--drift-x', `${Math.round((.5 - progress) * distance)}px`);
    }
  }
  page.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
