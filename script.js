(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.navigation');
  const links = [...navigation.querySelectorAll('a')];
  const setMenu = open => {
    navigation.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? 'Close <span aria-hidden="true">−</span>' : 'Menu <span aria-hidden="true">+</span>';
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  links.forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!navigation.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 1201px)').addEventListener('change', event => {
    if (event.matches) setMenu(false);
  });
  if ('IntersectionObserver' in window) {
    const visibleSections = new Set();
    const sections = links.filter(link => link.getAttribute('href').startsWith('#')).map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visibleSections.add(entry.target.id) : visibleSections.delete(entry.target.id));
      const current = sections.find(section => visibleSections.has(section.id));
      links.forEach(link => {
        if (current && link.getAttribute('href') === '#' + current.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-18% 0px -58% 0px' });
    sections.forEach(section => observer.observe(section));
  }
  // An illustrative control surface, never a simulated benchmark result.
  const panel = document.querySelector('.principle-diagram');
  const surface = document.querySelector('.panel-space');
  const rotor = surface.querySelector('.panel-rotor');
  const resetButton = surface.querySelector('.panel-reset');
  const flow = panel.querySelector('.diagram-flow');
  const stages = [...panel.querySelectorAll('.stage-button')];
  const caption = panel.querySelector('figcaption');
  const pressure = panel.querySelector('#goal-pressure');
  const pressureOutput = panel.querySelector('#pressure-value');
  const motionButton = panel.querySelector('.panel-motion');
  const systemDescription = panel.querySelector('.system-node .node-description');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const packets = [...panel.querySelectorAll('.flow-packet')];
  const returnSignal = panel.querySelector('.return-signal');
  const copy = {
    overview: 'The evaluation asks whether this principle holds when following it makes the objective harder.',
    system: 'The objective creates pressure. Removing oversight can make the assigned task easier.',
    framework: 'Aegis asks whether an action makes an irreversible commitment under unresolved uncertainty.',
    correction: 'The test examines whether human intervention and a path to correction remain possible.'
  };
  let selected = 'overview', paused = media.matches, manuallySetMotion = false;
  let amount = 35, active = true, elapsed = 0, lastTime = 0, frameId = 0, dirty = true;
  let tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;
  let drag = null, suppressClickUntil = 0;
  let pulse = 0;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const pressureState = value => {
    const amount = clamp(Number(value) || 0, 0, 100);
    return { amount, label: amount < 30 ? 'Low' : amount < 70 ? 'Moderate' : 'High', duration: 4.2 - amount * .025 };
  };

  const requestFrame = () => {
    if (!frameId && active && !document.hidden) frameId = requestAnimationFrame(animate);
  };
  const updatePressure = () => {
    const state = pressureState(pressure.value);
    amount = state.amount;
    pressureOutput.value = state.label;
    pressure.setAttribute('aria-valuetext', state.label + ' goal pressure');
    panel.style.setProperty('--pressure', String(amount / 100));
    panel.style.setProperty('--pressure-position', amount + '%');
    panel.dataset.pressure = state.label.toLowerCase();
    systemDescription.textContent = amount < 30 ? 'Lower goal pressure' : amount < 70 ? 'Pursues an objective' : 'Strong goal pressure';
    dirty = true;
    requestFrame();
  };
  pressure.addEventListener('input', updatePressure);
  stages.forEach(stage => stage.addEventListener('click', () => {
    selected = selected === stage.dataset.stage ? 'overview' : stage.dataset.stage;
    panel.dataset.stage = selected;
    surface.dataset.theme = selected;
    stages.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.stage === selected)));
    caption.textContent = copy[selected];
    pulse = paused ? 0 : 1;
    dirty = true;
    requestFrame();
  }));

  const updateMotion = () => {
    panel.dataset.motion = paused ? 'paused' : 'running';
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Resume panel motion' : 'Pause panel motion');
    motionButton.title = paused ? 'Resume motion' : 'Pause motion';
    motionButton.querySelector('path').setAttribute('d', paused ? 'M8 5v14l10-7z' : 'M6 5h4v14H6zM14 5h4v14h-4z');
    if (paused) { tiltX = targetX; tiltY = targetY; pulse = 0; }
    dirty = true;
    requestFrame();
  };
  motionButton.addEventListener('click', () => { manuallySetMotion = true; paused = !paused; updateMotion(); });
  media.addEventListener('change', event => { if (!manuallySetMotion) { paused = event.matches; updateMotion(); } });
  const resetRotation = () => {
    endDrag();
    targetX = 0; targetY = 0; tiltX = 0; tiltY = 0;
    dirty = true;
    requestFrame();
  };
  resetButton.addEventListener('click', resetRotation);
  surface.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary || drag) return;
    if (event.target.closest('input, .panel-motion, .panel-reset')) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, pitch: tiltX, yaw: tiltY, moved: false };
  });
  surface.addEventListener('pointermove', event => {
    if (drag && event.pointerId === drag.id) {
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 5) {
        drag.moved = true;
        surface.setPointerCapture(event.pointerId);
        surface.classList.add('is-dragging');
        surface.focus({preventScroll:true});
      }
      if (drag.moved) {
        event.preventDefault();
        // Rotation is deliberately unbounded: the screen can be turned over.
        targetX = drag.pitch - dy * .38;
        targetY = drag.yaw + dx * .45;
        tiltX = targetX; tiltY = targetY;
        dirty = true;
        requestFrame();
      }
    }
    if (event.pointerType === 'touch' || paused) return;
    const rect = surface.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    panel.style.setProperty('--light-x', (x * 100).toFixed(2) + '%');
    panel.style.setProperty('--light-y', (y * 100).toFixed(2) + '%');
    panel.classList.add('is-hovered');
    dirty = true;
    requestFrame();
  });
  function endDrag(event) {
    if (!drag || (event && event.pointerId !== drag.id)) return;
    const ended = drag;
    drag = null;
    if (ended.moved) suppressClickUntil = performance.now() + 400;
    surface.classList.remove('is-dragging');
    if (surface.hasPointerCapture(ended.id)) surface.releasePointerCapture(ended.id);
    dirty = true;
    requestFrame();
  }
  surface.addEventListener('pointerup', endDrag);
  surface.addEventListener('pointercancel', endDrag);
  surface.addEventListener('lostpointercapture', endDrag);
  surface.addEventListener('pointerleave', event => {
    panel.classList.remove('is-hovered');
    if (drag && !drag.moved) endDrag(event);
  });
  surface.addEventListener('click', event => {
    if (event.target.closest('.panel-reset, .panel-motion')) return;
    if (event.detail !== 0 && performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClickUntil = 0;
    }
  }, true);
  surface.addEventListener('keydown', event => {
    if (event.target !== surface) return;
    const turns = {ArrowLeft:[0,-15], ArrowRight:[0,15], ArrowUp:[15,0], ArrowDown:[-15,0]};
    if (event.key === 'Home') { event.preventDefault(); resetRotation(); return; }
    if (!turns[event.key]) return;
    event.preventDefault();
    const [pitch, yaw] = turns[event.key];
    targetX += pitch; targetY += yaw;
    if (paused) { tiltX = targetX; tiltY = targetY; }
    dirty = true;
    requestFrame();
  });
  window.addEventListener('blur', () => endDrag());

  const measureReturnPath = () => {
    const start = panel.querySelector('.boundary-node');
    const end = panel.querySelector('.system-node');
    const svg = panel.querySelector('.correction-return');
    const w = flow.clientWidth, h = flow.clientHeight;
    if (!w || !h) return;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const bottom = start.offsetTop + start.offsetHeight / 2;
    const top = end.offsetTop + end.offsetHeight / 2;
    const edge = Math.max(12, Math.min(start.offsetLeft, end.offsetLeft));
    const lane = 4;
    const d = `M${edge} ${bottom} H${lane+6} Q${lane} ${bottom} ${lane} ${bottom-6} V${top+6} Q${lane} ${top} ${lane+6} ${top} H${edge} M${edge-4} ${top-4} L${edge} ${top} L${edge-4} ${top+4}`;
    panel.querySelectorAll('.correction-return path').forEach(path => path.setAttribute('d', d));
    dirty = true;
    requestFrame();
  };
  if ('ResizeObserver' in window) new ResizeObserver(measureReturnPath).observe(flow);
  else window.addEventListener('resize', measureReturnPath);
  if (document.fonts) document.fonts.ready.then(measureReturnPath);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      active = entries[0].isIntersecting;
      if (active) { lastTime = 0; requestFrame(); }
      else if (frameId) { cancelAnimationFrame(frameId); frameId = 0; }
    }, {rootMargin:'80px'}).observe(surface);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { endDrag(); if (frameId) { cancelAnimationFrame(frameId); frameId = 0; } }
    else { lastTime = 0; requestFrame(); }
  });
  function animate(now) {
    frameId = 0;
    if (!active || document.hidden) return;
    const dt = Math.min((now - (lastTime || now)) / 1000, .04);
    lastTime = now;
    if (!paused) {
      elapsed += dt;
      const spring = 1 - Math.exp(-dt * 10);
      tiltX += (targetX - tiltX) * spring;
      tiltY += (targetY - tiltY) * spring;
      pulse = Math.max(0, pulse - dt * 1.6);
    }
    if (!paused || dirty) {
      rotor.style.setProperty('--rotation-x', tiltX.toFixed(3) + 'deg');
      rotor.style.setProperty('--rotation-y', tiltY.toFixed(3) + 'deg');
      panel.style.setProperty('--signal-pulse', pulse.toFixed(3));
      const duration = pressureState(amount).duration;
      packets.forEach((packet, index) => {
        const phase = ((elapsed / duration + index * .47) % 1);
        packet.style.transform = `translate(-50%, ${phase * (packet.parentElement.clientHeight - 5)}px)`;
        packet.style.opacity = paused ? '0' : String(Math.pow(Math.sin(phase * Math.PI), .65) * .92);
      });
      returnSignal.style.strokeDashoffset = String(-elapsed * (12 + amount * .2));
      dirty = false;
    }
    if (!paused) requestFrame();
  }
  updatePressure();
  updateMotion();
  measureReturnPath();
})();
