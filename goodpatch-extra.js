'use strict';

// Additional editorial motion. It is deliberately independent of the opening
// scroll controller so it cannot change that controller's wheel behaviour.
(() => {
  function initialise() {
    const page = document.querySelector('#page');
    const collection = document.querySelector('#collection');
    const community = document.querySelector('#community');
    const connections = document.querySelector('#connections');
    if (!page || !collection || !community || !connections) return;

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const motionEnabled = () => !reduceMotion.matches && !document.body.classList.contains('motion-paused');

    // 1. A small cover preview follows each collection title. Its position is
    // eased, clamped inside the viewport and never intercepts the real link.
    const previews = [
      ['assets/album-xiaomeng.jpg', '独立音乐 / 清醒梦境'],
      ['assets/landlords-cat.jpg', '城市民谣 / 城市慢行'],
      ['assets/album-xiaowang.jpg', '夜晚歌单 / 夜晚独白']
    ];
    const collectionLinks = [...collection.querySelectorAll('.collection-intro nav a')];
    const follower = document.createElement('div');
    follower.className = 'gp-cover-follower';
    follower.setAttribute('aria-hidden', 'true');
    follower.innerHTML = '<div class="gp-cover-follower__image"><img alt=""></div><span class="gp-cover-follower__caption"></span>';
    document.body.append(follower);
    const followerImage = follower.querySelector('img');
    const followerCaption = follower.querySelector('span');
    let desiredX = 0;
    let desiredY = 0;
    let easedX = 0;
    let easedY = 0;
    let followFrame = 0;
    let followerVisible = false;

    function hideFollower() {
      followerVisible = false;
      follower.classList.remove('is-visible');
      if (followFrame) cancelAnimationFrame(followFrame);
      followFrame = 0;
    }

    function updateFollower() {
      easedX += (desiredX - easedX) * .2;
      easedY += (desiredY - easedY) * .2;
      follower.style.left = `${easedX}px`;
      follower.style.top = `${easedY}px`;
      if (followerVisible) followFrame = requestAnimationFrame(updateFollower);
      else followFrame = 0;
    }

    function showFollower(index, event) {
      if (!motionEnabled() || !finePointer.matches || event.pointerType !== 'mouse') return;
      const data = previews[index];
      followerImage.src = data[0];
      followerCaption.textContent = data[1];
      desiredX = Math.max(110, Math.min(innerWidth - 110, event.clientX + 120));
      desiredY = Math.max(128, Math.min(innerHeight - 95, event.clientY - 25));
      if (!followerVisible) {
        easedX = desiredX;
        easedY = desiredY;
        followerVisible = true;
        follower.classList.add('is-visible');
        followFrame = requestAnimationFrame(updateFollower);
      }
    }

    collectionLinks.forEach((link, index) => {
      link.addEventListener('pointerenter', event => showFollower(index, event));
      link.addEventListener('pointermove', event => {
        if (!followerVisible) {
          showFollower(index, event);
          return;
        }
        desiredX = Math.max(110, Math.min(innerWidth - 110, event.clientX + 120));
        desiredY = Math.max(128, Math.min(innerHeight - 95, event.clientY - 25));
      });
      link.addEventListener('pointerleave', hideFollower);
      link.addEventListener('blur', hideFollower);
    });
    collection.addEventListener('pointerleave', hideFollower);
    page.addEventListener('scroll', hideFollower, { passive: true });

    // 2. A restrained outlined headline connects the encore and community
    // chapters; duplication makes its animation continuous with no hard jump.
    const runner = document.createElement('div');
    runner.className = 'gp-community-runner';
    runner.setAttribute('aria-hidden', 'true');
    const runnerText = 'HEAR TOGETHER — FEEL TOGETHER — ';
    runner.innerHTML = `<div class="gp-community-runner__track"><span>${runnerText}</span><span>${runnerText}</span></div>`;
    community.prepend(runner);

    const activeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('gp-near', entry.isIntersecting));
    }, { root: page, rootMargin: '20% 0px 20% 0px' });
    activeObserver.observe(community);
    activeObserver.observe(connections);

    // 3. A scroll-linked circular colour field deepens the red section, while
    // the selected music node returns one short, localised visual pulse.
    const sweep = document.createElement('div');
    sweep.className = 'gp-connections-sweep';
    sweep.setAttribute('aria-hidden', 'true');
    connections.prepend(sweep);
    let sweepFrame = 0;
    function updateSweep() {
      sweepFrame = 0;
      const rect = connections.getBoundingClientRect();
      const h = page.clientHeight;
      if (rect.bottom < -h || rect.top > 2 * h) return;
      const progress = Math.max(0, Math.min(1, (h - rect.top) / (h + rect.height)));
      const eased = progress * progress * (3 - 2 * progress);
      connections.style.setProperty('--gp-sweep-scale', motionEnabled() ? (0.18 + eased * 2.35).toFixed(3) : '1.3');
    }
    function queueSweep() {
      if (!sweepFrame) sweepFrame = requestAnimationFrame(updateSweep);
    }
    page.addEventListener('scroll', queueSweep, { passive: true });
    window.addEventListener('resize', () => {
      hideFollower();
      queueSweep();
    });
    updateSweep();

    connections.querySelectorAll('.map-node').forEach(node => {
      node.addEventListener('click', () => {
        if (!motionEnabled()) return;
        const sectionRect = connections.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'gp-node-ripple';
        ripple.setAttribute('aria-hidden', 'true');
        ripple.style.left = `${nodeRect.left + nodeRect.width / 2 - sectionRect.left}px`;
        ripple.style.top = `${nodeRect.top + nodeRect.height / 2 - sectionRect.top}px`;
        connections.append(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        setTimeout(() => ripple.remove(), 1300);
      });
    });

    const pauseButton = document.querySelector('#motionToggle');
    pauseButton?.addEventListener('click', () => {
      hideFollower();
      requestAnimationFrame(updateSweep);
    });
    reduceMotion.addEventListener('change', () => {
      hideFollower();
      queueSweep();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else initialise();
})();
