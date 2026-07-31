/* =====================================================================
   METTALINK — script.js
   1. Lenis smooth scroll
   2. Mettalink Splash screen (SVG draw + zoom-through)
   3. Custom Glowing Cursor (Triangle angle tracking)
   4. Scroll reveal & Header background
===================================================================== */

// Previne rolagem automática residual do navegador no recarregamento
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
try { window.scrollTo(0, 0); } catch (e) {}

// Registro seguro de plugins GSAP (sem interromper script se falhar)
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  try { gsap.registerPlugin(ScrollTrigger); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  try { if (typeof initCursor === 'function') initCursor(); } catch (e) {}
  try { if (typeof initAppEvents === 'function') initAppEvents(); } catch (e) {}
});

/* ─── 1. METTALINK SPLASH SCREEN (VINHETA DE ENTRADA CINEMÁTICA & IMPOSSÍVEL DE CONGELAR) ─── */
let hasRevealedEntry = false;
let hasPageAnimated  = false;

function revealEntryScreen() {
  if (hasRevealedEntry) return;
  hasRevealedEntry = true;

  const screen   = document.getElementById('entryScreen');
  const content  = document.getElementById('entryContent');
  const logoSvg  = document.getElementById('splashLogoSvg');
  const wordmark = document.getElementById('splashWordmark');

  const dismissScreen = () => {
    document.body.classList.remove('splash-active');
    if (screen) {
      screen.classList.add('splash-out');
      screen.style.opacity = '0';
      screen.style.pointerEvents = 'none';
      screen.style.visibility = 'hidden';
      screen.style.display = 'none';
      if (screen.parentNode) {
        try { screen.parentNode.removeChild(screen); } catch (e) {}
      }
    }
    if (typeof ScrollTrigger !== 'undefined') {
      try { ScrollTrigger.refresh(); } catch (e) {}
    }
    animatePageEntrance();
  };

  if (!screen) {
    dismissScreen();
    return;
  }

  // Se GSAP estiver disponível, realiza a entrada cinemática com Zoom-Through
  if (typeof gsap !== 'undefined') {
    try {
      const tl = gsap.timeline({ onComplete: dismissScreen });

      if (logoSvg) {
        tl.fromTo(logoSvg,
          { opacity: 0, scale: 0.85, y: 12 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }

      if (wordmark) {
        tl.fromTo(wordmark,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
          '-=0.2'
        );
      }

      tl.to({}, { duration: 0.35 }) // Pausa elegante de apresentação
        .to(content || logoSvg, {
          scale: 6.5,
          opacity: 0,
          filter: 'blur(14px)',
          duration: 0.6,
          ease: 'power3.in'
        })
        .to(screen, {
          opacity: 0,
          duration: 0.45,
          ease: 'power2.inOut'
        }, '-=0.35');

    } catch (e) {
      dismissScreen();
    }
  } else {
    setTimeout(dismissScreen, 800);
  }

  // Garante a liberação total da tela em no máximo 2.2s
  setTimeout(dismissScreen, 2200);
}

// Execução imediata assim que o documento estiver pronto
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  revealEntryScreen();
} else {
  document.addEventListener('DOMContentLoaded', revealEntryScreen);
  window.addEventListener('load', revealEntryScreen);
}

// Fallback universal rápido (800ms)
setTimeout(revealEntryScreen, 800);




/* ─── 2. ANIMAÇÃO DE ENTRADA CINEMÁTICA DO SITE (PAGE ENTRANCE) ─────── */
function animatePageEntrance() {
  if (hasPageAnimated) return;
  hasPageAnimated = true;

  if (typeof gsap === 'undefined') return;

  const header      = document.getElementById('header');
  const coreVisual  = document.getElementById('coreVisualHero');
  const headline    = document.querySelector('.hero-centered-wrap h1');
  const slogan      = document.querySelector('.hero-centered-wrap p.lead');
  const sideTimeline= document.getElementById('sideTimeline');

  // Esconde todos antes de animar (evita flash)
  const els = [header, coreVisual, headline, slogan, sideTimeline].filter(Boolean);
  gsap.set(els, { opacity: 0 });

  const pageTl = gsap.timeline({ defaults: {
    duration: 0.7,
    ease: 'power2.out',
    clearProps: 'transform,opacity'
  }});

  // Cascata uniforme: cada elemento entra 0.1s após o anterior
  if (header) {
    pageTl.fromTo(header,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0 }, 0
    );
  }

  if (coreVisual) {
    pageTl.fromTo(coreVisual,
      { opacity: 0, scale: 0.94, force3D: true },
      { opacity: 1, scale: 1, force3D: true }, 0.1
    );
  }

  if (headline) {
    pageTl.fromTo(headline,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0 }, 0.2
    );
  }

  if (slogan) {
    pageTl.fromTo(slogan,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0 }, 0.3
    );
  }

  if (sideTimeline) {
    pageTl.fromTo(sideTimeline,
      { opacity: 0, x: 16 },
      { opacity: 1, x: 0 }, 0.4
    );
  }
}



/* ─── 3. CUSTOM GLOWING TRIANGLE CURSOR ───────────────────────── */
function initCursor() {
  const cursorEl = document.getElementById('cursor');
  if (!cursorEl) return;

  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (supportsHover) {
    let mouseX = -999;
    let mouseY = -999;
    let cursorX = -999;
    let cursorY = -999;
    let currentAngle = 0;
    let targetAngle = 0;
    let hasAppeared = false;

    // Cursor começa invisible, aparece suavemente no primeiro movimento
    cursorEl.style.opacity = '0';
    cursorEl.style.transition = 'opacity 0.3s ease';

    function updateMousePos(e) {
      if (e.clientX !== undefined && e.clientY !== undefined) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!hasAppeared) {
          hasAppeared = true;
          cursorX = e.clientX;
          cursorY = e.clientY;
          cursorEl.style.opacity = '1';
        }
      }
    }

    window.addEventListener('mousemove', updateMousePos, { capture: true });
    window.addEventListener('pointermove', updateMousePos, { capture: true });
    window.addEventListener('pointerdown', updateMousePos, { capture: true });

    window.addEventListener('mousedown', () => cursorEl.classList.add('clicking'), { capture: true });
    window.addEventListener('mouseup', () => cursorEl.classList.remove('clicking'), { capture: true });
    window.addEventListener('pointerdown', () => cursorEl.classList.add('clicking'), { capture: true });
    window.addEventListener('pointerup', () => cursorEl.classList.remove('clicking'), { capture: true });

    function bindHoverElements() {
      document.querySelectorAll('a, button, .btn, .service-card, .work-card, .testimonial-card, .contact-card, .shape-card-item, .color-card, .origin-card').forEach(el => {
        el.removeEventListener('mouseenter', onHoverEnter);
        el.removeEventListener('mouseleave', onHoverLeave);
        el.addEventListener('mouseenter', onHoverEnter);
        el.addEventListener('mouseleave', onHoverLeave);
      });
    }

    function onHoverEnter() { cursorEl.classList.add('hovering'); }
    function onHoverLeave() { cursorEl.classList.remove('hovering'); }

    bindHoverElements();
    const observer = new MutationObserver(bindHoverElements);
    observer.observe(document.body, { childList: true, subtree: true });

    function animateCursor() {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      cursorX += dx * 0.18;
      cursorY += dy * 0.18;

      const speed = Math.hypot(dx, dy);
      if (speed > 1.2) {
        targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      }
      let angleDiff = targetAngle - currentAngle;
      angleDiff = ((angleDiff + 180) % 360 + 360) % 360 - 180;
      currentAngle += angleDiff * 0.15;

      cursorEl.style.transform = `translate(-50%, -50%) translate(${cursorX}px, ${cursorY}px) rotate(${currentAngle}deg)`;
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);
  } else {
    cursorEl.style.display = 'none';
  }
}


/* ─── 4. APP INITIALIZATION & SCROLL REVEAL ────────────────────── */
function initAppEvents() {
  initCursor();
  initLogoStudio();
  initShapeModal();

  // Parallax do Fundo: O fundo sobe quando desce a tela, e desce quando sobe a tela
  const bgLayer = document.querySelector('.bg-image-layer') || document.getElementById('bg-image-layer');
  if (bgLayer) {
    let currentY = 0;
    let targetY = 0;

    function updateBgParallax() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      targetY = -scrollY * 0.35;
    }

    function renderBgParallax() {
      currentY += (targetY - currentY) * 0.12;
      bgLayer.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
      requestAnimationFrame(renderBgParallax);
    }

    window.addEventListener('scroll', updateBgParallax, { passive: true });
    updateBgParallax();
    renderBgParallax();
  }

  // Header background toggle on scroll
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // Mobile Nav Toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Scroll reveal com IntersectionObserver
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  initCoreBrandInteractivity();
  initInteractiveBackground();
  initSmoothScrollAnchors();
}

/* ─── GLOBAL SMOOTH SCROLL ANCHOR NAVIGATION ────────────────────── */
function initSmoothScrollAnchors() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    if (href === '#' || href === '#hero') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetEl = document.querySelector(href);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/* ─── 5. INTERACTIVE COVER BRAND EMBLEM (LETTER-BY-LETTER DISSOLVE) ─── */
function initCoreBrandInteractivity() {
  const interactiveEls = document.querySelectorAll('.interactive-letter, .interactive-part');
  
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => el.classList.add('is-dissolved'));
    el.addEventListener('mouseleave', () => el.classList.remove('is-dissolved'));
    el.addEventListener('pointerover', () => el.classList.add('is-dissolved'));
    el.addEventListener('pointerout', () => el.classList.remove('is-dissolved'));
  });
}



/* ─── 7. ANIMATED INTERACTIVE BACKGROUND (COMPLEX GEOMETRIC SCALE) ─── */
function initInteractiveBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 160 };

  const CORES = {
    azul:    '#2F6FED',
    azulMid: '#00D2FF',
    cinza:   '#60A5FA',
    amarelo: '#FFDE59'
  };

  const PALETA = [CORES.azul, CORES.azulMid, CORES.amarelo, CORES.cinza];

  function hexParaRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  // ─── REGRA DE PROTEÇÃO DA CAPA (SÓ DESENHA FORA DA CAPA) ───────
  let naCapa = window.scrollY < (window.innerHeight * 0.6);
  window.addEventListener('scroll', () => {
    naCapa = window.scrollY < (window.innerHeight * 0.6);
  }, { passive: true });

  // ─── CICLO DA ANIMAÇÃO (10S DE ESPERA LIVRE) ────────────────────
  const DURACAO_LIVRE       = 10000;
  const DURACAO_FORMANDO    = 1800;
  const DURACAO_FORMADO     = 4000;
  const DURACAO_DISPERSANDO = 1200;
  const DURACAO_CICLO = DURACAO_LIVRE + DURACAO_FORMANDO + DURACAO_FORMADO + DURACAO_DISPERSANDO;

  let inicioCiclo = performance.now();
  let faseAnterior = 'livre';

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function obterFase(agora) {
    if (naCapa) return { nome: 'livre', progresso: 0 };
    let t = (agora - inicioCiclo) % DURACAO_CICLO;
    if (t < DURACAO_LIVRE)       return { nome: 'livre',       progresso: t / DURACAO_LIVRE };
    t -= DURACAO_LIVRE;
    if (t < DURACAO_FORMANDO)    return { nome: 'formando',    progresso: t / DURACAO_FORMANDO };
    t -= DURACAO_FORMANDO;
    if (t < DURACAO_FORMADO)     return { nome: 'formado',     progresso: t / DURACAO_FORMADO };
    t -= DURACAO_FORMADO;
    return                              { nome: 'dispersando', progresso: t / DURACAO_DISPERSANDO };
  }

  // ─── GEOMETRIA: BALANÇA ESTILO "CONSTELAÇÃO DE LUXO" ─────────────
  function gerarPontosBalanca() {
    const nos = [];
    const arestas = [];
    const add  = (id, x, y, tipo) => nos.push({ id, x, y, tipo });
    const edge = (a, b) => arestas.push([a, b]);

    const bez = (p0, c, p1, t) => {
      const mt = 1 - t;
      return {
        x: mt * mt * p0.x + 2 * mt * t * c.x + t * t * p1.x,
        y: mt * mt * p0.y + 2 * mt * t * c.y + t * t * p1.y,
      };
    };

    const CX = 50;

    // ── 1. POMO SUPERIOR — coroa/flor de 4 pétalas ────────────────
    const CROWN_Y = 6;
    add('crownTop', CX, CROWN_Y - 2.2, 'destaque');
    const petL = { x: CX - 3.4, y: CROWN_Y + 1.2 };
    const petR = { x: CX + 3.4, y: CROWN_Y + 1.2 };
    add('petL', petL.x, petL.y, 'estrutura');
    add('petR', petR.x, petR.y, 'estrutura');
    add('crownMid', CX, CROWN_Y + 3.4, 'estrutura');
    edge('crownTop', 'petL'); edge('crownTop', 'petR');
    edge('petL', 'crownMid'); edge('petR', 'crownMid');

    // ── 2. Pescoço — losango simples até o pivô ────────────────────
    add('neckTop', CX, CROWN_Y + 6.4, 'estrutura');
    add('neckL',   CX - 2.2, CROWN_Y + 9.5, 'estrutura');
    add('neckR',   CX + 2.2, CROWN_Y + 9.5, 'estrutura');
    const PIVOT_Y = CROWN_Y + 13.5;
    add('pivot', CX, PIVOT_Y, 'destaque');
    edge('crownMid', 'neckTop');
    edge('neckTop', 'neckL'); edge('neckTop', 'neckR');
    edge('neckL', 'pivot'); edge('neckR', 'pivot');

    // ── 3. BRAÇO — curva dupla tipo "chifre de carneiro" ───────────
    const ARM_HALF = 33;
    const ARM_Y    = PIVOT_Y + 3;
    const AX_L = CX - ARM_HALF, AX_R = CX + ARM_HALF;

    function buildArmSide(side) {
      const sign = side === 'L' ? -1 : 1;
      const p0 = { x: CX, y: PIVOT_Y };
      const cUp = { x: CX + sign * ARM_HALF * 0.42, y: PIVOT_Y - 9 };
      const pTop = { x: CX + sign * ARM_HALF * 0.68, y: ARM_Y - 6 };
      const N1 = 5;
      const ids1 = [];
      for (let i = 1; i <= N1; i++) {
        const t = i / N1;
        const pt = bez(p0, cUp, pTop, t);
        const id = `arm${side}a${i}`;
        ids1.push(id);
        add(id, pt.x, pt.y, i === N1 ? 'destaque' : 'estrutura');
        if (i > 1) edge(ids1[i-2], id); else edge('pivot', id);
      }
      const cDown = { x: CX + sign * ARM_HALF * 0.9, y: ARM_Y + 5 };
      const pEnd = { x: side === 'L' ? AX_L : AX_R, y: ARM_Y + 4 };
      const N2 = 5;
      const ids2 = [];
      for (let i = 1; i <= N2; i++) {
        const t = i / N2;
        const pt = bez(pTop, cDown, pEnd, t);
        const id = `arm${side}b${i}`;
        ids2.push(id);
        add(id, pt.x, pt.y, i === N2 ? 'destaque' : 'estrutura');
        if (i > 1) edge(ids2[i-2], id); else edge(ids1[N1-1], id);
      }
      const centerVol = pTop;
      const idVolC = `volC${side}`;
      add(idVolC, centerVol.x, centerVol.y, 'destaque');
      const N_VOL = 6;
      let prevVol = idVolC;
      for (let i = 1; i <= N_VOL; i++) {
        const ang = (i / N_VOL) * Math.PI * 1.7 * sign;
        const rad = 1.1 + i * 0.15;
        const id = `vol${side}${i}`;
        add(id, centerVol.x + Math.cos(ang) * rad, centerVol.y + Math.sin(ang) * rad - 0.5, 'secundario');
        edge(prevVol, id);
        prevVol = id;
      }
      edge(ids1[N1-1], idVolC);

      return { roseta: ids2[N2-1] };
    }

    const armL = buildArmSide('L');
    const armR = buildArmSide('R');

    // ── 4. ROSETA — pequeno anel concêntrico de onde saem as correntes ─
    function buildRoseta(side, anchorId) {
      const anchor = nos.find(n => n.id === anchorId);
      const idOuter = `rosOuter${side}`;
      const idInner = `rosInner${side}`;
      add(idOuter, anchor.x, anchor.y, 'estrutura');
      add(idInner, anchor.x, anchor.y + 1.8, 'destaque');
      edge(anchorId, idOuter);
      edge(idOuter, idInner);
      return idInner;
    }
    const roseL = buildRoseta('L', armL.roseta);
    const roseR = buildRoseta('R', armR.roseta);

    // ── 5. CORRENTES EM "X" — dois fios cruzados até o topo do prato ──
    const PLATE_TOP_Y = ARM_Y + 24;
    function buildChainX(side, roseId) {
      const rose = nos.find(n => n.id === roseId);
      const cx = side === 'L' ? AX_L : AX_R;
      const spread = 7.5;
      const left  = { x: cx - spread, y: PLATE_TOP_Y };
      const right = { x: cx + spread, y: PLATE_TOP_Y };
      const N_CH = 5;

      const buildStrand = (target, tag) => {
        let prev = roseId;
        const ids = [];
        for (let i = 1; i <= N_CH; i++) {
          const t = i / N_CH;
          const x = rose.x + (target.x - rose.x) * t;
          const y = rose.y + (target.y - rose.y) * t;
          const id = `ch${side}${tag}${i}`;
          ids.push(id);
          add(id, x, y, i % 2 === 0 ? 'secundario' : 'estrutura');
          edge(prev, id);
          prev = id;
        }
        return ids[ids.length - 1];
      };

      const endA = buildStrand(left, 'A');
      const endB = buildStrand(right, 'B');
      return { left: endA, right: endB, plateY: PLATE_TOP_Y, cx };
    }
    const chainL = buildChainX('L', roseL);
    const chainR = buildChainX('R', roseR);

    // ── 6. PRATOS TRIANGULARES + TRELIÇA GEOMÉTRICA NA BASE ────────
    const PLATE_BOT_Y = PLATE_TOP_Y + 33;
    const PLATE_HALF  = 10.5;
    function buildPlate(side, chain) {
      const cx = chain.cx;
      const apexL = nos.find(n => n.id === chain.left);
      const apexR = nos.find(n => n.id === chain.right);

      const N_BASE = 7;
      const baseIds = [];
      for (let i = 0; i < N_BASE; i++) {
        const t = i / (N_BASE - 1);
        const x = (cx - PLATE_HALF) + t * PLATE_HALF * 2;
        const y = PLATE_BOT_Y - Math.sin(t * Math.PI) * 1.5;
        const id = `base${side}${i}`;
        baseIds.push(id);
        const tipo = (i === 0 || i === N_BASE - 1) ? 'destaque' : (i % 2 === 0 ? 'estrutura' : 'secundario');
        add(id, x, y, tipo);
        if (i > 0) edge(baseIds[i-1], id);
      }

      const N_SIDE = 4;
      let prevL = chain.left, prevR = chain.right;
      const baseFirst = nos.find(n => n.id === baseIds[0]);
      const baseLast  = nos.find(n => n.id === baseIds[N_BASE-1]);
      for (let i = 1; i <= N_SIDE; i++) {
        const t = i / N_SIDE;
        const lx = apexL.x + (baseFirst.x - apexL.x) * t;
        const ly = apexL.y + (baseFirst.y - apexL.y) * t;
        const idL = `sideL${side}${i}`;
        add(idL, lx, ly, i % 2 === 0 ? 'estrutura' : 'secundario');
        edge(prevL, idL);
        prevL = idL;

        const rx = apexR.x + (baseLast.x - apexR.x) * t;
        const ry = apexR.y + (baseLast.y - apexR.y) * t;
        const idR = `sideR${side}${i}`;
        add(idR, rx, ry, i % 2 === 0 ? 'estrutura' : 'secundario');
        edge(prevR, idR);
        prevR = idR;
      }
      edge(prevL, baseIds[0]);
      edge(prevR, baseIds[N_BASE-1]);

      const apexMidL = `sideL${side}2`;
      const apexMidR = `sideR${side}2`;
      for (let i = 1; i < N_BASE - 1; i += 2) {
        edge(apexMidL, baseIds[i]);
        edge(apexMidR, baseIds[i]);
      }
      const midBase = baseIds[Math.floor(N_BASE / 2)];
      add(`platePin${side}`, cx, PLATE_BOT_Y - 4, 'destaque');
      edge(midBase, `platePin${side}`);
      edge(`platePin${side}`, apexMidL);
      edge(`platePin${side}`, apexMidR);
    }
    buildPlate('L', chainL);
    buildPlate('R', chainR);

    // ── 7. HASTE CENTRAL — losangos entrelaçados ───────────────────
    const POST_TOP_Y = PIVOT_Y + 2;
    const POST_BOT_Y = PLATE_BOT_Y - 5;
    const N_DIAMOND = 4;
    let prevTop = 'pivot';
    const diamondSpan = (POST_BOT_Y - POST_TOP_Y) / N_DIAMOND;
    for (let i = 0; i < N_DIAMOND; i++) {
      const yTop = POST_TOP_Y + i * diamondSpan;
      const yMid = yTop + diamondSpan * 0.5;
      const yBot = yTop + diamondSpan;
      const w = 3.2 - i * 0.15;
      const idL = `diaL${i}`, idR = `diaR${i}`, idB = `diaB${i}`;
      add(idL, CX - w, yMid, 'estrutura');
      add(idR, CX + w, yMid, 'estrutura');
      add(idB, CX, yBot, i === N_DIAMOND - 1 ? 'destaque' : 'estrutura');
      edge(prevTop, idL); edge(prevTop, idR);
      edge(idL, idB); edge(idR, idB);
      prevTop = idB;
    }

    // ── 8. BASE — taça/pedestal com curva contínua ──────────────────
    const PED_TOP_Y = POST_BOT_Y;
    const PED_BOT_Y = PED_TOP_Y + 16;
    const N_PED = 7;
    const R_TOP = 1.6, R_BOT = 11, WAIST = 2.2;
    const pedLIds = [];
    const pedRIds = [];
    for (let i = 0; i < N_PED; i++) {
      const t = i / (N_PED - 1);
      const y = PED_TOP_Y + t * (PED_BOT_Y - PED_TOP_Y);
      const r = R_TOP + (R_BOT - R_TOP) * Math.pow(t, 1.8) - Math.sin(t * Math.PI) * WAIST;
      const idL = `pedL${i}`, idR = `pedR${i}`;
      pedLIds.push(idL); pedRIds.push(idR);
      const tipo = i === N_PED - 1 ? 'destaque' : 'estrutura';
      add(idL, CX - r, y, tipo);
      add(idR, CX + r, y, tipo);
      if (i > 0) { edge(pedLIds[i-1], idL); edge(pedRIds[i-1], idR); }
    }
    edge(prevTop, pedLIds[0]);
    edge(prevTop, pedRIds[0]);

    const N_FOOT = 5;
    const footL = { x: CX - R_BOT, y: PED_BOT_Y };
    const footR = { x: CX + R_BOT, y: PED_BOT_Y };
    const footC = { x: CX, y: PED_BOT_Y + 3 };
    const footIds = [];
    for (let i = 0; i < N_FOOT; i++) {
      const t = i / (N_FOOT - 1);
      const pt = bez(footL, footC, footR, t);
      const id = `foot${i}`;
      footIds.push(id);
      add(id, pt.x, pt.y, i === Math.floor(N_FOOT / 2) ? 'destaque' : 'estrutura');
      if (i > 0) edge(footIds[i-1], id);
    }
    edge(pedLIds[N_PED-1], footIds[0]);
    edge(pedRIds[N_PED-1], footIds[N_FOOT-1]);

    return { pontos: nos, arestas };
  }

  const { pontos: pontosBalanca, arestas: arestasBalanca } = gerarPontosBalanca();

  function corDoTipo(tipo) {
    if (tipo === 'destaque')  return CORES.amarelo;
    if (tipo === 'secundario') return CORES.azulMid;
    return CORES.azul;
  }

  function calcularAlvos() {
    const escalaX = width * 0.62;
    const escalaY = height * 0.68;
    const offX = (width - escalaX) / 2;
    const offY = (height - escalaY) / 2;
    return pontosBalanca.map(n => ({
      id: n.id, tipo: n.tipo,
      x: offX + (n.x / 100) * escalaX,
      y: offY + (n.y / 100) * escalaY,
    }));
  }

  let alvosBalanca = [];

  class Particula {
    constructor() {
      this.reset();
      this.alvoId = null;
      this.corAlvo = null;
      this.tipoAlvo = null;
      this.inicioX = 0;
      this.inicioY = 0;
      this._alvoRef = null;
      this.curveArcX = 0;
      this.curveArcY = 0;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.55;
      this.vy = (Math.random() - 0.5) * 0.55;
      this.radius = Math.random() * 2.0 + 1.4;
      this.cor = PALETA[Math.floor(Math.random() * PALETA.length)];
      this.densidade = Math.random() * 22 + 9;
    }

    moverLivre() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const forca = (mouse.radius - dist) / mouse.radius;
          const ang = Math.atan2(dy, dx);
          this.x += Math.cos(ang) * forca * this.densidade * 0.07;
          this.y += Math.sin(ang) * forca * this.densidade * 0.07;
        }
      }
    }

    draw(alpha, corForcada) {
      const cor = corForcada ?? this.cor;
      ctx.save();
      ctx.globalAlpha = Math.min(alpha * 0.75, 0.55);
      ctx.shadowBlur = 6;
      ctx.shadowColor = cor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = cor;
      ctx.fill();
      ctx.restore();
    }
  }

  function criarParticulas() {
    particles = [];
    const n = Math.max(Math.floor((width * height) / 6500), pontosBalanca.length + 30);
    for (let i = 0; i < n; i++) particles.push(new Particula());
  }

  function sortearParticulasParaDesenho() {
    particles.forEach(p => { p.alvoId = null; p._alvoRef = null; });
    alvosBalanca = calcularAlvos();

    const indices = [...particles.keys()];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const qtd = Math.min(alvosBalanca.length, indices.length);
    for (let i = 0; i < qtd; i++) {
      const p = particles[indices[i]];
      const alvo = alvosBalanca[i];
      p.alvoId  = alvo.id;
      p.corAlvo = corDoTipo(alvo.tipo);
      p.tipoAlvo = alvo.tipo;
      p.inicioX  = p.x;
      p.inicioY  = p.y;
      p._alvoRef = alvo;

      // Deslocamento de arco suave e orgânico
      const dx = alvo.x - p.x;
      const dy = alvo.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const perpAngle = Math.atan2(dy, dx) + (i % 2 === 0 ? 1 : -1) * (Math.PI / 3.5);
      const arcDist = Math.min(dist * 0.35, 75);
      p.curveArcX = Math.cos(perpAngle) * arcDist;
      p.curveArcY = Math.sin(perpAngle) * arcDist;
    }
  }

  function conectarDesenho(alpha) {
    if (alpha <= 0) return;
    const mapa = {};
    particles.forEach(p => { if (p.alvoId) mapa[p.alvoId] = p; });

    arestasBalanca.forEach(([a, b]) => {
      const pa = mapa[a], pb = mapa[b];
      if (!pa || !pb) return;

      const isGold = pa.tipoAlvo === 'destaque' || pb.tipoAlvo === 'destaque';
      const cor = isGold
        ? `rgba(${hexParaRgb(CORES.amarelo)}, ${0.55 * alpha})`
        : `rgba(${hexParaRgb(CORES.azul)}, ${0.42 * alpha})`;

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = cor;
      ctx.lineWidth = isGold ? 1.6 : 1.1;
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
      ctx.restore();
    });
  }

  function desenharRedeParticulas() {
    const LINK_DIST = 115;
    const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
    ctx.lineWidth = 1.0;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < LINK_DIST_SQ) {
          const dist = Math.sqrt(distSq);
          const alpha = (1 - dist / LINK_DIST) * 0.22;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(47, 111, 237, ${alpha})`;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
    criarParticulas();
    alvosBalanca = calcularAlvos();
    inicioCiclo = performance.now();
    faseAnterior = 'livre';
  }

  function animar() {
    const agora = performance.now();
    const fase  = obterFase(agora);

    if (fase.nome !== faseAnterior) {
      if (fase.nome === 'formando') sortearParticulasParaDesenho();
      faseAnterior = fase.nome;
    }

    ctx.clearRect(0, 0, width, height);

    if (fase.nome === 'livre') {
      particles.forEach(p => { p.moverLivre(); p.draw(0.7); });
      desenharRedeParticulas();

    } else if (fase.nome === 'formando') {
      // Movimento suave com easing e arco orgânico (como se as bolinhas já flutuassem para lá)
      const t = easeInOutCubic(fase.progresso);
      const arcFactor = Math.sin(t * Math.PI);

      particles.forEach(p => {
        if (p.alvoId && p._alvoRef) {
          p.x = p.inicioX + (p._alvoRef.x - p.inicioX) * t + p.curveArcX * arcFactor;
          p.y = p.inicioY + (p._alvoRef.y - p.inicioY) * t + p.curveArcY * arcFactor;
          p.draw(0.7 + 0.3 * t, p.corAlvo);
        } else {
          p.moverLivre();
          p.draw(0.7 * (1 - t * 0.7));
        }
      });
      if (t > 0.15) conectarDesenho((t - 0.15) / 0.85);

    } else if (fase.nome === 'formado') {
      const pulse = 0.85 + Math.sin(agora / 600) * 0.15;
      particles.forEach(p => {
        if (p.alvoId && p._alvoRef) {
          p.x = p._alvoRef.x + Math.sin(agora * 0.002 + p._alvoRef.x) * 0.4;
          p.y = p._alvoRef.y + Math.cos(agora * 0.002 + p._alvoRef.y) * 0.4;
          p.draw(pulse, p.corAlvo);
        } else {
          p.moverLivre();
          p.draw(0.12);
        }
      });
      conectarDesenho(0.85 + Math.sin(agora / 700) * 0.15);

    } else if (fase.nome === 'dispersando') {
      const t = easeInOutCubic(fase.progresso);
      particles.forEach(p => {
        if (p.alvoId && p._alvoRef && t < 1) {
          p.x += p.vx * t * 2.5;
          p.y += p.vy * t * 2.5;
          p.draw(0.7 * (1 - t));
        } else {
          p.moverLivre();
          p.draw(0.7);
        }
      });
      conectarDesenho(1 - t);
      if (t > 0.6) desenharRedeParticulas();
    }

    requestAnimationFrame(animar);
  }

  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });
  window.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });
  window.addEventListener('resize', resize);

  resize();
  animar();
}

// Fallback in case load fires after script execution
if (document.readyState === 'complete') {
  revealEntryScreen();
}

/* ─── 8. ESTÚDIO INTERATIVO DE APLICAÇÃO DA LOGO (VARIANCE & COLOR SWITCHER) ──────── */
function initLogoStudio() {
  const stage = document.getElementById('mainLogoStage');
  const stageSvgBox = document.getElementById('stageSvgBox');
  const stageVariationNum = document.getElementById('stageVariationNum');
  const stageVariationName = document.getElementById('stageVariationName');
  const stageContrastBadge = document.getElementById('stageContrastBadge');
  const referenceGrid = document.getElementById('logoReferenceGrid');

  const prevBtn = document.getElementById('logoPrevBtn');
  const nextBtn = document.getElementById('logoNextBtn');
  const copyBtn = document.getElementById('copySvgBtn');
  const downloadBtn = document.getElementById('downloadSvgBtn');
  const toast = document.getElementById('actionToast');
  const resetBtn = document.getElementById('resetColorsBtn');

  const pickerBg = document.getElementById('pickerBg');
  const pickerPrimary = document.getElementById('pickerPrimary');
  const pickerSecondary = document.getElementById('pickerSecondary');
  const pickerText = document.getElementById('pickerText');

  if (!stage || !stageSvgBox) return;

  // As 3 Variações Escolhidas (02, 05 e 03)
  const VARIATIONS = [
    {
      id: '01',
      name: '01 · Azul Mono Branco (100% Branco)',
      tag: 'VARIAÇÃO 01 · FUNDO AZUL & MONO BRANCO',
      bg: '#013894',
      primary: '#FFFFFF',
      secondary: '#FFFFFF',
      contrast: '15.2:1 (AAA)'
    },
    {
      id: '02',
      name: '02 · Fundo Branco Oficial (#FFFFFF)',
      tag: 'VARIAÇÃO 02 · FUNDO BRANCO OFICIAL',
      bg: '#FFFFFF',
      primary: '#013894',
      secondary: '#3D3D3D',
      contrast: '14.5:1 (AAA)'
    },
    {
      id: '03',
      name: '03 · Fundo Preto (#000000)',
      tag: 'VARIAÇÃO 03 · FUNDO PRETO & AZUL/BRANCO',
      bg: '#000000',
      primary: '#013894',
      secondary: '#FFFFFF',
      contrast: '16.4:1 (AAA)'
    }
  ];

  let currentPresetIndex = 0;
  let currentFormat = 'stacked';
  let customColors = null;

  // Path "M" da marca oficial (Marca/mettalink-logo-symbol.svg). Usada duas vezes:
  // espelhada (matrix flip) no lugar do antigo "W", e normal como "M".
  const PATH_M = "M131.702728,71.164474 C149.320740,66.748489 166.410675,67.055771 182.537689,75.183899 C189.582092,78.734337 196.003876,83.640221 202.365417,88.389938 C208.133484,92.696548 209.808273,93.040634 215.283630,88.246346 C230.212997,75.174133 247.078888,66.796585 267.383240,68.262421 C275.075470,68.817741 282.627747,71.311226 290.621918,72.925613 C296.710297,75.973198 302.728333,78.557434 308.075409,82.142456 C327.056458,94.868553 337.174805,113.348778 338.700073,135.669037 C340.149536,156.879303 339.578003,178.233337 339.691406,199.525223 C339.719330,204.765976 337.202301,206.883270 331.762970,206.987732 C325.607086,207.105972 319.446289,207.106232 313.289673,207.016785 C304.939148,206.895493 303.304871,205.331131 303.255737,197.049362 C303.166870,182.070831 303.338196,167.090286 303.179993,152.112900 C303.118713,146.309372 303.193298,140.345840 301.926910,134.744354 C298.584595,119.960258 289.561462,110.022163 274.387756,105.779526 C263.455109,103.878517 253.456039,105.125832 244.397385,111.201134 C233.427673,118.558113 227.268097,128.627457 227.313934,142.125031 C227.372726,159.438858 227.315140,176.753250 227.424271,194.066666 C227.490280,204.539825 225.060349,207.111755 214.589401,207.049500 C209.595184,207.019806 204.598099,207.040802 199.607880,206.873108 C192.665771,206.639847 191.076523,205.110306 191.038712,198.166138 C190.945343,181.018646 191.041687,163.870163 190.984238,146.722351 C190.952911,137.367752 188.784378,128.566345 183.523880,120.706314 C169.035538,99.058273 136.797455,98.939362 121.984703,120.466545 C116.626091,128.254150 114.177391,136.988831 114.102242,146.348145 C113.981941,161.329727 113.949150,176.314255 114.104973,191.295181 C114.257805,205.989380 113.350342,207.061737 98.456322,207.172424 C93.520119,207.091415 89.029640,206.972992 84.544647,206.746292 C80.964630,206.565338 78.108513,204.946671 78.164841,201.112915 C78.506927,177.828354 77.023376,154.279388 80.041878,131.330688 C83.988495,101.325752 102.443901,81.230919 131.702728,71.164474 z";
  const PATH_M_MIRROR_TRANSFORM = "translate(110.92,161.80) matrix(1,0,0,-1,0,273.92)";
  const PATH_TRI = "M444.312866,191.627960 C447.180664,196.680954 449.861298,201.418457 452.886841,206.765442 C439.280396,206.765442 426.323212,206.765442 412.695038,206.765442 C419.335083,195.100494 425.857971,183.641434 432.761932,171.512833 C436.745026,178.452728 440.435394,184.882599 444.312866,191.627960 z";
  // O ponto agora é uma elipse (ver Marca/mettalink-logo-symbol.svg), não mais um path recortado.
  const DOT_ELLIPSE = { cx: 95.3, cy: 243, rx: 19, ry: 18 };

  const PATHS_WORDMARK_P1 = [
    { d: "M131.702728,71.164474 C149.320740,66.748489 166.410675,67.055771 182.537689,75.183899 C189.582092,78.734337 196.003876,83.640221 202.365417,88.389938 C208.133484,92.696548 209.808273,93.040634 215.283630,88.246346 C230.212997,75.174133 247.078888,66.796585 267.383240,68.262421 C275.075470,68.817741 282.627747,71.311226 290.621918,72.925613 C296.710297,75.973198 302.728333,78.557434 308.075409,82.142456 C327.056458,94.868553 337.174805,113.348778 338.700073,135.669037 C340.149536,156.879303 339.578003,178.233337 339.691406,199.525223 C339.719330,204.765976 337.202301,206.883270 331.762970,206.987732 C325.607086,207.105972 319.446289,207.106232 313.289673,207.016785 C304.939148,206.895493 303.304871,205.331131 303.255737,197.049362 C303.166870,182.070831 303.338196,167.090286 303.179993,152.112900 C303.118713,146.309372 303.193298,140.345840 301.926910,134.744354 C298.584595,119.960258 289.561462,110.022163 274.387756,105.779526 C263.455109,103.878517 253.456039,105.125832 244.397385,111.201134 C233.427673,118.558113 227.268097,128.627457 227.313934,142.125031 C227.372726,159.438858 227.315140,176.753250 227.424271,194.066666 C227.490280,204.539825 225.060349,207.111755 214.589401,207.049500 C209.595184,207.019806 204.598099,207.040802 199.607880,206.873108 C192.665771,206.639847 191.076523,205.110306 191.038712,198.166138 C190.945343,181.018646 191.041687,163.870163 190.984238,146.722351 C190.952911,137.367752 188.784378,128.566345 183.523880,120.706314 C169.035538,99.058273 136.797455,98.939362 121.984703,120.466545 C116.626091,128.254150 114.177391,136.988831 114.102242,146.348145 C113.981941,161.329727 113.949150,176.314255 114.104973,191.295181 C114.257805,205.989380 113.350342,207.061737 98.456322,207.172424 C93.520119,207.091415 89.029640,206.972992 84.544647,206.746292 C80.964630,206.565338 78.108513,204.946671 78.164841,201.112915 C78.506927,177.828354 77.023376,154.279388 80.041878,131.330688 C83.988495,101.325752 102.443901,81.230919 131.702728,71.164474 z", transform: "translate(-1.142231,422.618602) scale(0.401125)" },
    "M182.411591,479.410858 C176.527344,485.226898 170.893234,490.792755 165.016098,496.598663 C172.550629,499.383331 179.953568,495.692413 182.847992,488.403442 C184.792130,483.507568 191.927811,480.809174 196.514679,483.615265 C197.546082,484.246216 198.136459,486.752441 197.859695,488.189178 C195.034866,502.853333 181.850037,513.149719 167.319412,512.274536 C152.134094,511.359955 140.460968,499.327698 139.370941,483.466217 C138.424438,469.693085 148.770447,456.979614 163.327759,453.858398 C173.153625,451.751678 181.384659,455.070129 188.699097,461.244049 C193.008987,464.881927 193.087982,468.078766 189.303314,472.379547 C187.216064,474.751343 184.883652,476.907349 182.411591,479.410858 M166.570831,474.070374 C168.307373,472.307709 170.043930,470.545074 172.332153,468.222443 C159.009842,467.715912 151.112823,476.012482 155.370270,486.214966 C159.130371,482.122223 162.600021,478.345642 166.570831,474.070374 z",
    "M291.718781,453.758362 C293.233704,454.223511 294.748657,454.688660 296.810089,455.403381 C298.523773,456.124451 299.690918,456.596008 300.858093,457.067535 C306.900208,461.273560 311.674347,466.487701 314.232544,474.276367 C314.672394,475.615784 314.904816,476.307373 315.137238,476.998993 C315.122162,485.359100 315.107086,493.719177 315.185608,502.539673 C315.218445,503.753418 315.157715,504.506805 318.188873,505.629578 C313.847107,506.715637 312.481354,507.795898 310.966644,508.078735 C306.921387,508.834045 302.812134,509.246796 298.362793,509.972198 C296.216492,510.513123 294.422668,510.823700 292.656982,511.250610 C279.769531,514.366638 266.565735,508.724274 260.257355,497.381378 C253.936035,486.015289 256.031097,470.963867 265.305847,461.934479 C267.149811,460.139343 269.334412,458.694061 271.898132,456.902283 C272.743713,456.619232 272.943146,456.414307 273.411194,456.062653 C277.526367,455.030182 281.262909,454.037323 285.412354,453.151733 C287.789734,453.425476 289.754272,453.591919 291.718781,453.758362 M279.371490,496.410400 C286.781128,499.156281 292.841400,497.884308 297.461365,492.613708 C301.630280,487.857574 302.406097,481.341125 299.449249,475.916077 C296.391846,470.306580 290.406342,467.207855 284.045502,467.941498 C278.089264,468.628479 272.805756,473.244507 271.307892,479.070007 C269.618530,485.640198 272.135315,491.440002 279.371490,496.410400 z",
    "M225.233734,460.022339 C225.615463,467.091278 225.413116,467.336243 218.291107,468.189331 C218.291107,476.314148 218.162231,484.530823 218.421844,492.735168 C218.463623,494.055450 220.010605,495.625641 221.254807,496.553192 C224.656342,499.089111 227.049194,506.703064 224.857010,510.352356 C224.247055,511.367706 221.732056,511.918213 220.290085,511.642181 C211.950027,510.045593 205.243240,502.970062 203.997360,494.205109 C203.346649,489.627136 203.393600,484.931427 203.363190,480.287354 C203.281509,467.821564 203.418045,455.353882 203.271317,442.889252 C203.224213,438.888702 204.652206,436.905365 208.768616,437.181732 C209.761688,437.248383 210.772324,437.290009 211.758270,437.185944 C216.424393,436.693481 218.579315,438.471222 218.043472,443.412842 C217.710022,446.487946 217.981522,449.628662 217.981522,453.054108 C223.222717,452.720367 226.550018,453.956390 225.233734,460.022339 z",
    "M253.633734,460.022339 C254.015463,467.091278 253.813116,467.336243 246.691107,468.189331 C246.691107,476.314148 246.562231,484.530823 246.821844,492.735168 C246.863623,494.055450 248.410605,495.625641 249.654807,496.553192 C253.056342,499.089111 255.449194,506.703064 253.257010,510.352356 C252.647055,511.367706 250.132056,511.918213 248.690085,511.642181 C240.350027,510.045593 233.643240,502.970062 232.397360,494.205109 C231.746649,489.627136 231.793600,484.931427 231.763190,480.287354 C231.681509,467.821564 231.818045,455.353882 231.671317,442.889252 C231.624213,438.888702 233.052206,436.905365 237.168616,437.181732 C238.161688,437.248383 239.172324,437.290009 240.158270,437.185944 C244.824393,436.693481 246.979315,438.471222 246.443472,443.412842 C246.110022,446.487946 246.381522,449.628662 246.381522,453.054108 C251.622717,452.720367 254.950018,453.956390 253.633734,460.022339 z"
  ];

  const PATHS_WORDMARK_P2 = [
    "M456.955719,512.602539 C447.369080,513.200928 445.892761,511.849365 445.660797,502.423645 C445.624390,482.015686 445.727081,462.032196 445.722137,442.048706 C445.721039,437.576630 446.969086,434.074707 451.744843,433.029297 C457.075409,431.862427 460.950439,435.262177 461.072784,441.130676 C461.173462,445.959839 461.093781,450.792786 461.093903,455.624054 C461.094025,460.281250 461.093933,464.938477 461.093933,470.640564 C464.560211,468.277557 467.487305,466.331390 470.361542,464.309998 C473.766235,461.915588 477.069611,459.373840 480.517883,457.045563 C485.071655,453.970917 489.303162,454.481171 491.944092,458.247803 C494.515472,461.915253 493.496887,466.436188 489.180939,469.454895 C482.813049,473.908813 476.341705,478.214844 469.271973,483.020538 C476.674072,488.210175 483.491638,492.878296 490.183594,497.720062 C494.829193,501.081177 495.571503,506.676605 491.895020,510.143890 C488.410370,513.430298 484.705933,512.994995 481.039429,510.303345 C474.653473,505.615234 468.259521,500.938049 461.750702,496.169678 C459.474579,501.732971 464.158875,508.653381 456.955719,512.602539 z",
    "M394.621094,498.003937 C394.530640,500.098083 394.440186,502.192200 394.352295,504.994446 C394.418793,506.092987 394.482666,506.483398 394.546570,506.873840 C392.687134,511.944824 389.696350,513.770569 384.707794,512.846069 C379.933197,511.961273 378.896973,508.692596 378.997131,504.370300 C379.162750,497.221069 379.182251,490.061890 379.008881,482.913086 C378.828156,475.460968 380.834778,468.803284 385.535034,462.580017 C393.995697,453.702820 403.994293,450.602600 415.621399,453.212280 C427.926544,455.974152 436.703186,466.533691 437.166656,479.175964 C437.409546,485.801910 437.272064,492.441742 437.305145,499.921875 C437.371277,501.842377 437.438568,502.916290 437.404388,504.321503 C437.368988,505.105042 437.435059,505.557281 437.389648,506.371948 C437.234497,507.489868 437.190796,508.245331 437.147095,509.000824 C434.469696,513.175293 430.573639,513.794922 426.268799,512.381104 C422.104095,511.013367 422.046356,507.412506 422.081024,503.789490 C422.147461,496.834106 422.081696,489.877441 422.068970,482.063599 C421.288849,470.844299 413.829803,465.473114 403.999695,468.195648 C402.116699,469.272125 400.233734,470.348602 397.928497,471.905701 C396.608826,474.590576 395.711395,476.794861 394.813995,478.999115 C394.663971,480.803101 394.513947,482.607117 394.450653,490.013245 394.621094,498.003937 z",
    "M355.694763,505.997101 C355.767090,491.531891 355.892578,477.066589 355.874634,462.601501 C355.870087,458.952972 356.589783,455.989288 360.736450,454.524170 C365.460510,454.458862 370.152374,454.192993 371.211609,460.634521 C371.252563,464.034790 371.189789,467.070099 371.128235,470.921570 C371.190491,472.492615 371.251495,473.247528 371.312500,474.002411 C371.242249,483.969971 371.212341,493.938141 371.067078,503.904602 C371.038635,505.856018 370.563354,507.800964 369.928894,510.261597 C368.979218,511.288300 368.394775,511.802277 367.810333,512.316284 C365.502228,512.468018 363.194092,512.619690 360.263672,512.544434 C358.835022,511.852295 358.028717,511.387085 357.222443,510.921875 C356.852570,510.140564 356.482666,509.359283 356.016754,507.953796 C355.845398,506.885468 355.770081,506.441284 355.694763,505.997101 z",
    "M361.416046,451.110901 C360.019348,450.441742 359.040710,449.757874 357.800171,448.933655 C356.986877,447.086853 356.062408,445.402618 355.959381,443.669495 C355.721222,439.664551 358.854675,436.362000 362.845093,435.961395 C367.047302,435.539520 370.774811,438.479187 371.279144,442.612854 C371.773224,446.662506 369.307312,450.215088 365.291351,451.036438 C364.181305,451.263489 362.988770,451.087341 361.416046,451.110901 z",
    "M330.360535,507.091431 C328.819061,502.254639 326.601624,497.560089 326.473145,492.809021 C326.023071,476.164032 326.180969,459.498047 326.406067,442.844116 C326.441223,440.245392 327.303375,436.774231 329.093536,435.322510 C331.020538,433.759888 334.663086,433.270416 337.244934,433.809082 C340.863129,434.563965 342.126190,437.876984 342.111816,441.591797 C342.053833,456.582947 342.063477,471.574402 342.066650,486.565765 C342.068054,493.186737 340.462463,500.461578 349.032440,504.346619 C349.286224,505.978943 349.379791,507.027161 349.473328,508.075409 C348.971527,509.128815 348.469727,510.182220 347.534546,511.625916 C344.997307,513.656845 338.001731,512.675779 334.554840,510.591003 C333.011932,509.375153 331.827179,508.291443 330.360535,507.091431 z"
  ];

  function generateLogoSvg(format, colors) {
    const p1 = colors.primary;
    const p2 = colors.secondary;

    // Marca (símbolo): M espelhado (posição do antigo "W") + M normal + triângulo + ponto (elipse)
    const markMarkup = `
        <path fill="${p1}" transform="${PATH_M_MIRROR_TRANSFORM}" d="${PATH_M}"/>
        <path fill="${p2}" d="${PATH_M}"/>
        <path fill="${p1}" d="${PATH_TRI}"/>
        <ellipse fill="${p2}" cx="${DOT_ELLIPSE.cx}" cy="${DOT_ELLIPSE.cy}" rx="${DOT_ELLIPSE.rx}" ry="${DOT_ELLIPSE.ry}"/>`;

    if (format === 'mark') {
      return `<svg viewBox="65 65 395 315" fill="none">${markMarkup}
      </svg>`;
    }

    const roundedMettaPaths = PATHS_WORDMARK_P1.map(item => {
      if (typeof item === 'string') return `<path d="${item}" />`;
      return `<path d="${item.d}"${item.transform ? ` transform="${item.transform}"` : ''} />`;
    }).join('');
    const roundedLinkPaths = PATHS_WORDMARK_P2.map(d => `<path d="${d}" />`).join('');

    if (format === 'wordmark') {
      return `<svg viewBox="25 425 475 95" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="${p2}">${roundedMettaPaths}</g>
        <g fill="${p1}">${roundedLinkPaths}</g>
      </svg>`;
    }

    if (format === 'horizontal') {
      return `<svg viewBox="0 0 620 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, 5)">
          <svg viewBox="65 65 395 315" width="135" height="110">
            ${markMarkup}
          </svg>
        </g>
        <g transform="translate(145, 12)">
          <svg viewBox="25 425 475 95" width="475" height="95">
            <g fill="${p2}">${roundedMettaPaths}</g>
            <g fill="${p1}">${roundedLinkPaths}</g>
          </svg>
        </g>
      </svg>`;
    }

    // Default: 'stacked' (Vertical Completa)
    return `<svg viewBox="0 0 500 450" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(50, 0)">
        <svg viewBox="65 65 395 315" width="400" height="315">
          ${markMarkup}
        </svg>
      </g>
      <g transform="translate(12, 330)">
        <svg viewBox="25 425 475 95" width="475" height="95">
          <g fill="${p2}">${roundedMettaPaths}</g>
          <g fill="${p1}">${roundedLinkPaths}</g>
        </svg>
      </g>
    </svg>`;
  }

    // Atualizar Palco Principal
  function updateStage(animate = true) {
    const preset = VARIATIONS[currentPresetIndex];
    const colors = customColors || {
      bg: preset.bg,
      primary: preset.primary,
      secondary: preset.secondary,
      text: preset.text
    };

    // Atualiza background do palco
    stage.style.background = colors.bg;

    // Detecta se fundo é claro para ajustar texto das badges
    const isLightBg = isColorLight(colors.bg);
    stageVariationNum.style.color = isLightBg ? '#0B111E' : '#FFFFFF';
    stageVariationName.style.color = isLightBg ? '#0B111E' : '#FFFFFF';

    stageVariationNum.textContent = `${(currentPresetIndex + 1).toString().padStart(2, '0')} / ${VARIATIONS.length.toString().padStart(2, '0')}`;
    stageVariationName.textContent = preset.name;
    stageContrastBadge.textContent = `Contraste: ${preset.contrast}`;

    // Atualiza Pickers
    pickerBg.value = rgbToHex(colors.bg);
    pickerPrimary.value = rgbToHex(colors.primary);
    pickerSecondary.value = rgbToHex(colors.secondary);

    // Animação de entrada do SVG no palco
    if (animate && typeof gsap !== 'undefined') {
      gsap.to(stageSvgBox, {
        scale: 0.92,
        opacity: 0.3,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => {
          stageSvgBox.innerHTML = generateLogoSvg(currentFormat, colors);
          gsap.to(stageSvgBox, {
            scale: 1.0,
            opacity: 1,
            duration: 0.25,
            ease: 'back.out(1.4)'
          });
        }
      });
    } else {
      stageSvgBox.innerHTML = generateLogoSvg(currentFormat, colors);
    }

    // Atualiza estados dos botões preset
    document.querySelectorAll('#logoPresetButtons .preset-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === currentPresetIndex && !customColors);
    });

    // Atualiza estados dos cards no Grid
    document.querySelectorAll('.logo-card-item').forEach((card, idx) => {
      card.classList.toggle('active', idx === currentPresetIndex);
    });
  }

  // Renderizar o Grid de 6 Cards (Estilo Exato da Imagem de Referência)
  function renderReferenceGrid() {
    referenceGrid.innerHTML = '';

    VARIATIONS.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `logo-card-item ${index === currentPresetIndex ? 'active' : ''}`;
      card.style.background = item.bg;

      const isLight = isColorLight(item.bg);
      const textColor = isLight ? '#0B111E' : '#FFFFFF';
      card.style.color = textColor;

      const svgMarkup = generateLogoSvg('stacked', {
        primary: item.primary,
        secondary: item.secondary,
        text: item.text
      });

      card.innerHTML = `
        <div class="card-top-tag" style="color: ${textColor};">${item.tag}</div>
        <div class="card-svg-container">${svgMarkup}</div>
        <div class="card-bottom-info">
          <div class="card-colors-preview">
            <span class="color-dot-mini" style="background: ${item.primary};" title="Primária"></span>
            <span class="color-dot-mini" style="background: ${item.secondary};" title="Secundária"></span>
            <span class="color-dot-mini" style="background: ${item.text};" title="Texto"></span>
          </div>
          <span class="card-click-label" style="color: ${textColor};">Expandir ➔</span>
        </div>
      `;

      card.addEventListener('click', () => {
        currentPresetIndex = index;
        customColors = null;
        updateStage(true);

        // Smooth scroll suave para o palco se o usuário clicar num card
        stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });

      referenceGrid.appendChild(card);
    });
  }

  // Auxiliares de Cor & Contraste
  function isColorLight(color) {
    let hex = rgbToHex(color).replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 140;
  }

  function rgbToHex(colorStr) {
    if (!colorStr) return '#000000';
    if (colorStr.startsWith('#')) return colorStr;
    const matches = colorStr.match(/\d+/g);
    if (!matches || matches.length < 3) return '#000000';
    const r = parseInt(matches[0]).toString(16).padStart(2, '0');
    const g = parseInt(matches[1]).toString(16).padStart(2, '0');
    const b = parseInt(matches[2]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  // --- EVENT LISTENERS DOS CONTROLES ---

  // Setas de Navegação ◀ e ▶
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentPresetIndex = (currentPresetIndex - 1 + VARIATIONS.length) % VARIATIONS.length;
      customColors = null;
      updateStage(true);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentPresetIndex = (currentPresetIndex + 1) % VARIATIONS.length;
      customColors = null;
      updateStage(true);
    });
  }

  // Botões Presets
  document.querySelectorAll('#logoPresetButtons .preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPresetIndex = parseInt(btn.getAttribute('data-preset'));
      customColors = null;
      updateStage(true);
    });
  });

  // Botões de Formato (Empilhada, Horizontal, Mark, Wordmark)
  document.querySelectorAll('#logoFormatButtons .format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#logoFormatButtons .format-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFormat = btn.getAttribute('data-format');
      updateStage(true);
    });
  });

  // Color Pickers (Laboratório de Cores)
  function onCustomColorChange() {
    customColors = {
      bg: pickerBg.value,
      primary: pickerPrimary.value,
      secondary: pickerSecondary.value
    };
    updateStage(false);
  }

  [pickerBg, pickerPrimary, pickerSecondary].forEach(picker => {
    if (picker) picker.addEventListener('input', onCustomColorChange);
  });

  // Resetar Cores
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      customColors = null;
      updateStage(true);
    });
  }

  // Copiar Código SVG
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const preset = VARIATIONS[currentPresetIndex];
      const colors = customColors || {
        bg: preset.bg,
        primary: preset.primary,
        secondary: preset.secondary,
        text: preset.text
      };
      const svgCode = generateLogoSvg(currentFormat, colors);

      navigator.clipboard.writeText(svgCode).then(() => {
        showToast('✓ Código SVG copiado para a área de transferência!');
      }).catch(() => {
        showToast('Erro ao copiar SVG');
      });
    });
  }

  // Baixar SVG
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const preset = VARIATIONS[currentPresetIndex];
      const colors = customColors || {
        bg: preset.bg,
        primary: preset.primary,
        secondary: preset.secondary,
        text: preset.text
      };
      const svgCode = generateLogoSvg(currentFormat, colors);
      const blob = new Blob([svgCode], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mettalink-logo-${currentFormat}-${preset.id}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('✓ Download do arquivo SVG iniciado!');
    });
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // Inicializa a renderização
  renderReferenceGrid();
  updateStage(false);
}

/* ─── 9. ANATOMIA DAS 4 FORMAS DA LOGO (MODAL INTERATIVO EXPANDÍVEL) ──────── */
function initShapeModal() {
  // NOTA: estas constantes precisam existir aqui porque PATH_W/PATH_TRI/PATH_DOT
  // originalmente só existiam dentro de initLogoStudio(), causando um
  // ReferenceError que travava toda a execução de initAppEvents() antes de
  // initInteractiveBackground() (o fundo animado de bolinhas) ser chamada.
  const PATH_W = "M247.998184,368.102173 C238.956818,363.970032 229.216461,360.899139 221.012482,355.495605 C200.907028,342.253143 191.842194,322.064087 190.325760,298.754761 C189.063049,279.345215 189.356674,259.827820 189.205017,240.356308 C189.155655,234.017105 192.270081,230.751175 198.702927,230.446472 C205.333969,230.132401 212.004181,230.537292 218.653290,230.751221 C223.089966,230.893951 225.316818,233.367798 225.330383,237.782669 C225.359024,247.104095 225.157745,256.430939 225.410568,265.745789 C225.739517,277.865356 225.803848,290.043640 227.139252,302.068146 C228.217636,311.778564 233.359436,319.881256 241.648132,325.991211 C253.762421,334.720886 266.667084,335.990906 279.697449,330.159607 C293.836456,323.832214 301.443176,312.090851 301.939270,296.655975 C302.500885,279.181732 302.144470,261.676300 302.095581,244.184662 C302.064209,232.960678 304.655060,230.125046 315.737915,230.127609 C320.723328,230.128754 325.722321,230.358521 330.690033,230.780212 C335.084198,231.153214 337.619293,233.837753 338.145874,238.198822 C338.524231,241.332001 338.829803,244.495361 338.847870,247.647095 C338.939575,263.640533 338.591156,279.644196 339.047821,295.625671 C339.478760,310.705750 345.929779,322.843140 359.871521,329.549072 C373.411713,336.061890 386.856903,334.679840 399.111023,325.922119 C408.622955,319.124176 413.755554,309.389557 414.167603,297.823303 C414.784149,280.517212 414.667175,263.183624 414.774811,245.861206 C414.864563,231.419113 415.811096,230.380371 430.462616,230.228577 C434.453491,230.187241 438.450745,230.375122 442.439148,230.575226 C447.640991,230.836197 450.177673,233.878387 450.730865,238.848083 C450.822937,239.675308 450.921692,240.507401 450.926941,241.337814 C451.033600,258.327026 451.951843,275.366394 450.925537,292.287598 C450.270569,303.086639 447.953857,314.151611 444.275726,324.336670 C428.863312,367.015228 368.039520,387.049316 328.864532,351.769226 C320.804260,344.510345 319.962524,344.723999 311.711182,351.537781 C308.380859,354.287964 304.772888,356.701904 300.762177,359.619110 C296.763214,361.789337 293.293335,363.609375 289.494904,365.479126 C288.778351,365.738281 288.390289,365.947754 287.628845,366.168518 C282.836029,367.362946 278.416626,368.546051 273.657837,369.657898 C272.878815,369.712311 272.439148,369.837982 271.540527,369.893066 C267.054413,369.885620 263.027161,369.948792 258.681061,369.877899 C257.907684,369.772156 257.453186,369.800446 256.800293,369.674866 C256.301910,369.605347 256.001892,369.689697 255.487274,369.550964 C254.868515,369.323639 254.464401,369.319458 253.699402,369.163696 C251.558411,368.708801 249.778305,368.405487 247.998184,368.102173 z";
  const PATH_M = "M131.702728,71.164474 C149.320740,66.748489 166.410675,67.055771 182.537689,75.183899 C189.582092,78.734337 196.003876,83.640221 202.365417,88.389938 C208.133484,92.696548 209.808273,93.040634 215.283630,88.246346 C230.212997,75.174133 247.078888,66.796585 267.383240,68.262421 C275.075470,68.817741 282.627747,71.311226 290.621918,72.925613 C296.710297,75.973198 302.728333,78.557434 308.075409,82.142456 C327.056458,94.868553 337.174805,113.348778 338.700073,135.669037 C340.149536,156.879303 339.578003,178.233337 339.691406,199.525223 C339.719330,204.765976 337.202301,206.883270 331.762970,206.987732 C325.607086,207.105972 319.446289,207.106232 313.289673,207.016785 C304.939148,206.895493 303.304871,205.331131 303.255737,197.049362 C303.166870,182.070831 303.338196,167.090286 303.179993,152.112900 C303.118713,146.309372 303.193298,140.345840 301.926910,134.744354 C298.584595,119.960258 289.561462,110.022163 274.387756,105.779526 C263.455109,103.878517 253.456039,105.125832 244.397385,111.201134 C233.427673,118.558113 227.268097,128.627457 227.313934,142.125031 C227.372726,159.438858 227.315140,176.753250 227.424271,194.066666 C227.490280,204.539825 225.060349,207.111755 214.589401,207.049500 C209.595184,207.019806 204.598099,207.040802 199.607880,206.873108 C192.665771,206.639847 191.076523,205.110306 191.038712,198.166138 C190.945343,181.018646 191.041687,163.870163 190.984238,146.722351 C190.952911,137.367752 188.784378,128.566345 183.523880,120.706314 C169.035538,99.058273 136.797455,98.939362 121.984703,120.466545 C116.626091,128.254150 114.177391,136.988831 114.102242,146.348145 C113.981941,161.329727 113.949150,176.314255 114.104973,191.295181 C114.257805,205.989380 113.350342,207.061737 98.456322,207.172424 C93.520119,207.091415 89.029640,206.972992 84.544647,206.746292 C80.964630,206.565338 78.108513,204.946671 78.164841,201.112915 C78.506927,177.828354 77.023376,154.279388 80.041878,131.330688 C83.988495,101.325752 102.443901,81.230919 131.702728,71.164474 z";
  const PATH_TRI = "M444.312866,191.627960 C447.180664,196.680954 449.861298,201.418457 452.886841,206.765442 C439.280396,206.765442 426.323212,206.765442 412.695038,206.765442 C419.335083,195.100494 425.857971,183.641434 432.761932,171.512833 C436.745026,178.452728 440.435394,184.882599 444.312866,191.627960 z";
  const PATH_DOT = "M94.411690,260.912872 C77.987854,257.448639 75.352371,242.229614 80.885361,233.698654 C84.284531,228.457703 89.017288,225.596115 95.617996,225.062103 C104.644707,225.724838 110.764954,229.826248 113.276375,238.383011 C115.305992,245.298233 113.011917,253.036011 106.857887,256.933868 C103.408455,259.118683 98.870750,259.585327 94.411690,260.912872 z";

  const SHAPE_DATA = [
    {
      id: '01',
      title: "01 · O 'W' Estrutural",
      sub: "Sustentação de Sistemas & Redes Distribuídas",
      tag: "FORMA 01 DE 04 · ANATOMIA VETORIAL W",
      color: "#013894",
      viewBox: "180 220 280 160",
      path: PATH_W,
      origin: "O 'W' vetorial da Mettalink foi gerado a partir de arcos parabólicos de tração estrutural utilizados em engenharia de grande porte e gráficos de suporte a alta carga de dados.",
      why: "Escolhemos o 'W' como base gráfica porque ele garante ancoragem de marca, peso institucional e estabilidade. Ele impede qualquer sensação de fragilidade visual na identidade.",
      meaning: "Sustentação de infraestruturas críticas, resiliência contra picos de tráfego e suporte contínuo de código limpo desenhado para durar décadas."
    },
    {
      id: '02',
      title: "02 · O 'M' Central",
      sub: "Ponte de Integrabilidade & União Estratégica",
      tag: "FORMA 02 DE 04 · ANATOMIA VETORIAL M",
      color: "#3D3D3D",
      viewBox: "70 60 280 160",
      path: PATH_M,
      origin: "O 'M' central deriva da geometria de arcos duplos de travessia e rotas de conexão de APIs, onde dois fluxos convergem em um vértice único de equilíbrio.",
      why: "Escolhemos este arco duplo porque a Mettalink conecta os objetivos de negócio do cliente à execução técnica impecável, agindo como ponte de valor real.",
      meaning: "Integrabilidade perfeita entre sistemas, conectividade via microserviços e parceria de longo prazo fundada em transparência e entrega."
    },
    {
      id: '03',
      title: "03 · O Triângulo Acento",
      sub: "Vetor de Aceleração, Foco & Direção",
      tag: "FORMA 03 DE 04 · TRIÂNGULO VETORIAL",
      color: "#013894",
      viewBox: "400 165 60 50",
      path: PATH_TRI,
      origin: "O triângulo acento foi projetado com inclinação precisa de elevação, inspirado em vetores de força direcional e cursores de navegação espacial de alta precisão.",
      why: "Escolhemos o triângulo acento para injetar dinamismo à logo, criando um ponto de tensão positivo que aponta constantemente para o futuro.",
      meaning: "Aceleração de prazos de desenvolvimento, foco no objetivo final do produto digital e busca inegociável por inovação contínua."
    },
    {
      id: '04',
      title: "04 · O Ponto (Dot Central)",
      sub: "Nó de Rede & Precisão Absoluta de Dados",
      tag: "FORMA 04 DE 04 · NÓ DE REDE DOT",
      color: "#3D3D3D",
      viewBox: "70 220 50 45",
      path: PATH_DOT,
      origin: "O ponto (Dot) nasce do conceito fundamental de nó de rede em topologias distribuídas e o ponto final de validação lógica matemática.",
      why: "Escolhemos destacar este elemento para sinalizar que na engenharia de software cada detalhe importa e a precisão dos dados é a alma do negócio.",
      meaning: "Zero erro em tempo de execução, dado puro validado, rigor técnico e o ponto focal onde a tecnologia converge com a experiência humana."
    }
  ];

  const shapeCards = document.querySelectorAll('.shape-card-item');
  const backdrop   = document.getElementById('shapeModalBackdrop');
  const closeBtn   = document.getElementById('shapeModalClose');
  const actionBtn  = document.getElementById('modalActionCloseBtn');
  
  const tagEl      = document.getElementById('modalShapeTag');
  const svgBox     = document.getElementById('modalSvgDisplay');
  const titleEl    = document.getElementById('modalShapeTitle');
  const subEl      = document.getElementById('modalShapeSub');
  const originEl   = document.getElementById('modalShapeOrigin');
  const whyEl      = document.getElementById('modalShapeWhy');
  const meaningEl  = document.getElementById('modalShapeMeaning');

  if (!backdrop || !shapeCards.length) return;

  function openModal(index) {
    const item = SHAPE_DATA[index];
    if (!item) return;

    if (tagEl) tagEl.textContent = item.tag;
    if (titleEl) titleEl.textContent = item.title;
    if (subEl) subEl.textContent = item.sub;
    if (originEl) originEl.textContent = item.origin;
    if (whyEl) whyEl.textContent = item.why;
    if (meaningEl) meaningEl.textContent = item.meaning;

    if (svgBox) {
      svgBox.innerHTML = `
        <svg viewBox="${item.viewBox}" fill="none">
          <path fill="${item.color}" d="${item.path}" class="modal-path-anim"/>
        </svg>
      `;
    }

    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (typeof gsap !== 'undefined') {
      gsap.fromTo('#shapeModalCard', 
        { scale: 0.88, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
      );
      gsap.fromTo('.modal-path-anim',
        { scale: 0.8, transformOrigin: 'center center', opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out', delay: 0.1 }
      );
    }
  }

  function closeModal() {
    if (typeof gsap !== 'undefined') {
      gsap.to('#shapeModalCard', {
        scale: 0.92,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          backdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    } else {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  shapeCards.forEach((card, idx) => {
    card.addEventListener('click', () => openModal(idx));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (actionBtn) actionBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ─── INICIALIZADOR ANATOMIA DA MARCA (BLOCOS BK-) ─ */
function initBkReveal() {
  const els = document.querySelectorAll('.bk-reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('bk-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('bk-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => io.observe(el));
}

/* ─── VISUALIZADOR DE APLICAÇÕES DE MARCA (bap-root) ─── */
function initBrandApplicationsViewer() {
  const rootEl = document.getElementById('brandAppsViewer');
  if (!rootEl) return;

  const applications = [
    { id: 0, tag: "01", label: "Branding & Identidade Visual", image: "Mockups/IDV - Mettalink_pages-to-jpg-0014.jpg" },
    { id: 1, tag: "02", label: "Aplicações de Marca", image: "Mockups/IDV - Mettalink_pages-to-jpg-0015.jpg" },
    { id: 2, tag: "03", label: "Papelaria & Material Institucional", image: "Mockups/IDV - Mettalink_pages-to-jpg-0016.jpg" },
    { id: 3, tag: "04", label: "Sinalização & Presença Física", image: "Mockups/IDV - Mettalink_pages-to-jpg-0017.jpg" }
  ];

  let order = [0, 1, 2, 3];
  let mainStack = [];
  let layerCounter = 0;

  const mainFrameEl = document.getElementById('bapMainFrame');
  const thumbsRowEl = document.getElementById('bapThumbsRow');
  const dotsEl = document.getElementById('bapDots');
  const prevBtn = document.getElementById('bapPrevBtn');
  const nextBtn = document.getElementById('bapNextBtn');

  function renderMainLayer(item) {
    const isFirst = mainStack.length === 0;
    if (!isFirst && mainStack[mainStack.length - 1].id === item.id) return;

    const layer = document.createElement('div');
    layer.className = 'bap-layer' + (isFirst ? '' : ' bap-layer-enter');
    layer.style.zIndex = isFirst ? '1' : '2';

    layer.innerHTML = `
      <img src="${item.image}" alt="${item.label}" class="bap-img" />
      <div class="bap-scrim"></div>
      <div class="bap-caption">
        <span class="bap-caption-tag">${item.tag}</span>
        <span class="bap-caption-label">${item.label}</span>
      </div>
    `;

    mainFrameEl.appendChild(layer);
    mainStack.push({ id: item.id, element: layer });

    if (mainStack.length > 2) {
      const oldest = mainStack.shift();
      oldest.element.remove();
    }

    if (!isFirst) {
      setTimeout(() => {
        if (mainStack.length > 1) {
          const prevLayer = mainStack.shift();
          prevLayer.element.remove();
        }
      }, 420);
    }
  }

  function renderThumbs() {
    thumbsRowEl.innerHTML = '';
    const thumbIds = order.slice(1);

    thumbIds.forEach((id, idx) => {
      const item = applications[id];
      const box = document.createElement('div');
      box.className = 'bap-thumb-box';

      box.innerHTML = `
        <div class="bap-frame bap-frame-thumb">
          <div class="bap-layer">
            <img src="${item.image}" alt="${item.label}" class="bap-img" loading="lazy" />
            <div class="bap-scrim"></div>
            <div class="bap-caption">
              <span class="bap-caption-tag">${item.tag}</span>
              <span class="bap-caption-label">${item.label}</span>
            </div>
          </div>
          <div class="bap-thumb-ring"></div>
        </div>
      `;

      box.addEventListener('click', () => bringToFront(idx + 1));
      thumbsRowEl.appendChild(box);
    });
  }

  function renderDots() {
    dotsEl.innerHTML = '';
    applications.forEach((it) => {
      const dot = document.createElement('div');
      const isActive = order[0] === it.id;
      dot.className = `bap-dot ${isActive ? 'bap-dot-active' : 'bap-dot-inactive'}`;
      dot.addEventListener('click', () => {
        const posInOrder = order.indexOf(it.id);
        if (posInOrder !== -1) bringToFront(posInOrder);
      });
      dotsEl.appendChild(dot);
    });
  }

  function update() {
    const mainItem = applications[order[0]];
    renderMainLayer(mainItem);
    renderThumbs();
    renderDots();
  }

  function bringToFront(posInOrder) {
    if (posInOrder === 0) return;
    const clickedId = order[posInOrder];
    const rest = order.filter((_, i) => i !== posInOrder);
    order = [clickedId, ...rest];
    update();
  }

  function rotateNext() {
    order = [...order.slice(1), order[0]];
    update();
  }

  function rotatePrev() {
    order = [order[order.length - 1], ...order.slice(0, -1)];
    update();
  }

  if (prevBtn) prevBtn.addEventListener('click', rotatePrev);
  if (nextBtn) nextBtn.addEventListener('click', rotateNext);

  rootEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') rotateNext();
    if (e.key === 'ArrowLeft') rotatePrev();
  });

  let touchStartX = null;
  rootEl.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  rootEl.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      if (delta < 0) { rotateNext(); } else { rotatePrev(); }
    }
    touchStartX = null;
  });

  update();
}

/* ─── DECK DE DEPOIMENTOS INTERATIVO (td-root) ─── */
function initTestimonialsDeck() {
  const stage = document.getElementById('tdStage');
  const dotsEl = document.getElementById('tdDots');
  const btnPrev = document.getElementById('tdPrev');
  const btnNext = document.getElementById('tdNext');
  if (!stage || !dotsEl || !btnPrev || !btnNext) return;

  const TESTIMONIALS = [
    {
      quote: "A Mettalink assumiu um sistema que três fornecedores anteriores não conseguiram estabilizar. Em quatro meses estava em produção.",
      name: "Renata Cabral",
      tone: "#013894"
    },
    {
      quote: "Entregaram em três semanas o que a nossa equipe interna estimava em dois meses, sem cortar canto nenhum na qualidade do código.",
      name: "Marcos Teixeira",
      tone: "#2F6FED"
    },
    {
      quote: "Migramos um monólito inteiro para microsserviços sem um único minuto de downtime. Isso não é sorte, é processo bem feito.",
      name: "Juliana Prado",
      tone: "#0A1F3D"
    },
    {
      quote: "Comunicação técnica de verdade é raro nesse mercado. Todo relatório de sprint vinha explicado, com o porquê de cada decisão.",
      name: "Thiago Bittencourt",
      tone: "#1E4D8C"
    },
    {
      quote: "Depois de dois fornecedores que sumiram no meio do caminho, a Mettalink terminou exatamente o que prometeu, no prazo combinado.",
      name: "Camila Nogueira",
      tone: "#3D3D3D"
    },
    {
      quote: "O nível de atenção a detalhe de segurança foi além do que qualquer auditoria pediu. Fizeram mais do que o contrato exigia.",
      name: "Rafael Andrade",
      tone: "#013894"
    }
  ];

  let order = TESTIMONIALS.map((_, i) => i);
  let dragging = false;
  let startX = 0;
  let dragDeltaX = 0;
  let cardEls = [];

  function initials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  function wrapWords(text) {
    return text.split(' ').map(w => `<span class="td-word">${w}</span>`).join(' ');
  }

  function buildCard(idx) {
    const t = TESTIMONIALS[idx];
    const el = document.createElement('div');
    el.className = 'td-card';
    el.style.setProperty('--td-accent', t.tone);
    el.dataset.idx = idx;
    el.innerHTML = `
      <div class="td-edge-glow"></div>
      <div class="td-quotemark">&ldquo;</div>
      <p class="td-quote">${wrapWords(t.quote)}</p>
      <div class="td-footer">
        <div class="td-avatar">${initials(t.name)}</div>
        <div class="td-author">
          <strong>${t.name}</strong>
        </div>
      </div>
      <div class="td-stamp">✓ CLIENTE REAL</div>
    `;
    attachDrag(el);
    return el;
  }

  function attachDrag(el) {
    el.addEventListener('pointerdown', onPointerDown);
  }

  function onPointerDown(e) {
    if (order[0] !== Number(this.dataset.idx)) return;
    dragging = true;
    startX = e.clientX;
    dragDeltaX = 0;
    this.classList.add('td-dragging');
    this.setPointerCapture(e.pointerId);
    this.addEventListener('pointermove', onPointerMove);
    this.addEventListener('pointerup', onPointerUp);
    this.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    dragDeltaX = e.clientX - startX;
    const rotate = dragDeltaX / 18;
    this.style.transform = `translateX(${dragDeltaX}px) rotate(${rotate}deg)`;
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    this.classList.remove('td-dragging');
    this.removeEventListener('pointermove', onPointerMove);
    this.removeEventListener('pointerup', onPointerUp);

    const threshold = 90;
    if (Math.abs(dragDeltaX) > threshold) {
      commitSwipe(dragDeltaX > 0 ? 1 : -1);
    } else {
      this.classList.add('td-settle');
      this.style.transform = '';
      setTimeout(() => this.classList.remove('td-settle'), 460);
    }
  }

  function commitSwipe(direction) {
    const front = cardEls[0];
    if (!front) return;
    front.classList.add('td-flyout', 'td-stamped');
    front.style.transform = `translateX(${direction * 560}px) rotate(${direction * 22}deg)`;
    front.style.opacity = '0';

    order.push(order.shift());
    setTimeout(render, 380);
  }

  function goPrev() {
    order.unshift(order.pop());
    render(true);
  }

  function jumpTo(targetIdx) {
    const pos = order.indexOf(targetIdx);
    if (pos <= 0) return;
    for (let i = 0; i < pos; i++) order.push(order.shift());
    render();
  }

  function render(reverseEnter) {
    stage.innerHTML = '';
    cardEls = order.map(buildCard);

    cardEls.forEach((el, i) => {
      stage.appendChild(el);
      const depth = Math.min(i, 3);
      requestAnimationFrame(() => {
        el.style.transform = `translateY(${depth * 10}px) scale(${1 - depth * 0.045})`;
        el.style.zIndex = String(100 - i);
        el.style.opacity = depth > 3 ? '0' : '1';
        if (i === 0) {
          el.classList.add('td-enter');
          el.style.transform = reverseEnter
            ? 'translateX(-40px) rotate(-6deg) scale(0.96)'
            : 'translateX(40px) rotate(6deg) scale(0.96)';
          el.style.opacity = '0';
          requestAnimationFrame(() => {
            el.style.transform = 'translateY(0) scale(1)';
            el.style.opacity = '1';
            setTimeout(() => {
              el.classList.remove('td-enter');
              el.classList.add('td-active');
            }, 500);
          });
        }
      });
    });

    dotsEl.innerHTML = '';
    TESTIMONIALS.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'td-dot ' + (order[0] === i ? 'td-dot-active' : 'td-dot-inactive');
      dot.addEventListener('click', () => jumpTo(i));
      dotsEl.appendChild(dot);
    });
  }

  btnNext.addEventListener('click', () => commitSwipe(-1));
  btnPrev.addEventListener('click', goPrev);

  render();
}

/* ============================================================
   JOGO DE CAPTURA DE CORES DA METTALINK
============================================================ */
function initColorGame(){
  const playBtn = document.getElementById('playBtn');
  const startScreen = document.getElementById('startScreen');
  const resultsView = document.getElementById('resultsView');
  const gameLayer = document.getElementById('gameLayer');
  const closeBtn = document.getElementById('closeBtn');
  const toastLayer = document.getElementById('toastLayer');
  const columnsOverlay = document.getElementById('columnsOverlay');
  const replayBtn = document.getElementById('replayBtn');

  if (!playBtn || !gameLayer) return;

  let capturedCount = 0;
  let gameFinished = false; // trava permanente após concluir
  const REQUIRED_SHAKES = 7;

  function rand(min,max){ return Math.random()*(max-min)+min; }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

  /* ===================== ABERTURA / FECHAMENTO ===================== */
  function setClipOrigin(el, fromEl){
    if(!fromEl) return;
    const r = fromEl.getBoundingClientRect();
    const cx = r.left + r.width/2;
    const cy = r.top + r.height/2;
    el.style.setProperty('--cx', cx+'px');
    el.style.setProperty('--cy', cy+'px');
  }

  playBtn.addEventListener('click', ()=>{
    setClipOrigin(gameLayer, playBtn);
    playBtn.classList.add('hide');
    document.getElementById('header')?.classList.add('game-hidden');
    requestAnimationFrame(()=>{
      gameLayer.classList.add('open');
    });
  });

  closeBtn.addEventListener('click', ()=>{
    if(gameFinished) return;
    setClipOrigin(gameLayer, closeBtn);
    gameLayer.classList.remove('open');
    document.getElementById('header')?.classList.remove('game-hidden');
    setTimeout(()=>{
      resetGame();
      playBtn.classList.remove('hide');
    }, 850);
  });

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      resultsView.classList.remove('show');
      gameFinished = false;
      resetGame();
      setTimeout(() => {
        setClipOrigin(gameLayer, playBtn);
        playBtn.classList.add('hide');
        document.getElementById('header')?.classList.add('game-hidden');
        requestAnimationFrame(() => {
          gameLayer.classList.add('open');
        });
      }, 300);
    });
  }

  /* ===================== BOLAS / FÍSICA ===================== */
  class Ball{
    constructor(el){
      this.el = el;
      this.r = 32;
      this.captured = false;
      this.revealed = false;
      this.dragging = false;
      this.pointerId = null;
      this.offsetX = 0; this.offsetY = 0;
      this.lastPX = 0; this.lastPY = 0;
      this.lastDirSign = 0;
      this.shakeScore = 0;
      this.ring = el.querySelector('.shake-ring circle');
      this.wanderTimer = 0;
      this.resetPosition();

      el.addEventListener('pointerdown', (e)=>this.onGrab(e));
      el.addEventListener('pointermove', (e)=>this.onMove(e));
      el.addEventListener('pointerup', (e)=>this.onRelease(e));
      el.addEventListener('pointercancel', (e)=>this.onRelease(e));
    }

    resetPosition(){
      const w = window.innerWidth, h = window.innerHeight;
      this.x = rand(this.r, w-this.r);
      this.y = rand(h*0.28, h-this.r-40);
      this.vx = rand(-1.4,1.4) || 0.8;
      this.vy = rand(-1.4,1.4) || 0.8;
    }

    onGrab(e){
      if(this.revealed || !gameLayer.classList.contains('open')) return;
      if (e.cancelable) e.preventDefault();
      if (window.getSelection) window.getSelection().removeAllRanges();
      this.dragging = true;
      this.captured = true;
      this.pointerId = e.pointerId;
      try { this.el.setPointerCapture(e.pointerId); } catch(err){}
      this.el.classList.add('dragging');
      this.lastPX = e.clientX;
      this.lastPY = e.clientY;
      this.lastDirSign = 0;
      this.shakeScore = 0;
      this.offsetX = e.clientX - this.x;
      this.offsetY = e.clientY - this.y;
    }

    onMove(e){
      if(!this.dragging) return;
      if (e.cancelable) e.preventDefault();
      if (window.getSelection) window.getSelection().removeAllRanges();
      const nx = e.clientX - this.offsetX;
      const ny = e.clientY - this.offsetY;
      this.x = clamp(nx, this.r, window.innerWidth - this.r);
      this.y = clamp(ny, this.r, window.innerHeight - this.r);

      const dx = e.clientX - this.lastPX;
      if(Math.abs(dx) > 5){
        const sign = dx > 0 ? 1 : -1;
        if(this.lastDirSign !== 0 && sign !== this.lastDirSign){
          this.shakeScore = Math.min(REQUIRED_SHAKES + 2, this.shakeScore + 1);
          this.updateRing();
          if(this.shakeScore >= REQUIRED_SHAKES){
            this.reveal();
          }
        }
        this.lastDirSign = sign;
        this.lastPX = e.clientX;
        this.lastPY = e.clientY;
      }
      this.el.classList.toggle('shaking', this.shakeScore > 2);
    }

    onRelease(){
      if(!this.dragging) return;
      this.dragging = false;
      this.captured = false;
      this.el.classList.remove('dragging','shaking');
      this.pointerId = null;
      this.vx = rand(-2,2);
      this.vy = rand(-2,2);
      this.shakeScore = 0;
      this.updateRing();
    }

    updateRing(){
      if(!this.ring) return;
      const pct = Math.max(0, 1 - (this.shakeScore / REQUIRED_SHAKES));
      this.ring.style.strokeDashoffset = (pct*100).toFixed(1);
    }

    reveal(){
      if(this.revealed) return;
      this.revealed = true;
      this.dragging = false;
      this.captured = false;
      if(this.pointerId !== null){
        try{ this.el.releasePointerCapture(this.pointerId); }catch(err){}
      }
      const hex = this.el.getAttribute('data-hex');
      const name = this.el.getAttribute('data-name');
      this.el.style.setProperty('--rc', hex);
      this.el.classList.add('revealed-color');
      this.el.classList.remove('dragging','shaking');

      showToast(hex, name);
      bumpSlot(capturedCount, hex);
      capturedCount++;

      setTimeout(()=>{
        this.el.classList.add('pop');
        setTimeout(()=>{ this.el.style.display='none'; }, 550);
      }, 420);

      if(capturedCount >= 3){
        closeBtn.classList.add('hidden');
        setTimeout(startFinalSequence, 1200);
      }
    }

    step(){
      if(this.dragging || this.revealed || !gameLayer.classList.contains('open')) return;
      this.wanderTimer -= 1;
      if(this.wanderTimer <= 0){
        this.vx += rand(-0.35,0.35);
        this.vy += rand(-0.35,0.35);
        const maxV = 2.2;
        this.vx = clamp(this.vx, -maxV, maxV);
        this.vy = clamp(this.vy, -maxV, maxV);
        this.wanderTimer = rand(30,80);
      }
      this.x += this.vx;
      this.y += this.vy;
      const w = window.innerWidth, h = window.innerHeight;
      if(this.x < this.r){ this.x = this.r; this.vx *= -1; }
      if(this.x > w - this.r){ this.x = w - this.r; this.vx *= -1; }
      if(this.y < this.r + 90){ this.y = this.r + 90; this.vy *= -1; }
      if(this.y > h - this.r - 20){ this.y = h - this.r - 20; this.vy *= -1; }
    }

    render(){
      this.el.style.transform = `translate(${(this.x-this.r).toFixed(1)}px, ${(this.y-this.r).toFixed(1)}px)`;
    }
  }

  function showToast(hex, name){
    if(!toastLayer) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `
      <div class="toast-swatch" style="background:${hex};"></div>
      <div class="toast-text">
        <span class="toast-eyebrow">COR CAPTURADA</span>
        <div class="toast-title">${name}</div>
        <div class="toast-hex">${hex}</div>
      </div>`;
    toastLayer.appendChild(t);
    setTimeout(()=>{ t.remove(); }, 2700);
  }

  function bumpSlot(index, hex){
    const slot = document.getElementById('slot'+index);
    if(!slot) return;
    slot.style.setProperty('--slot-glow', hex);
    slot.style.background = hex;
    slot.style.borderColor = hex;
    slot.classList.add('filled');
  }

  /* ===================== SEQUÊNCIA FINAL ===================== */
  function startFinalSequence(){
    if(!columnsOverlay) return;
    columnsOverlay.classList.add('show');
    setTimeout(()=>{
      // fecha as colunas e a janela do jogo, mostrando a tela branca com resultado
      columnsOverlay.classList.remove('show');
      gameLayer.style.setProperty('--cx', '50%');
      gameLayer.style.setProperty('--cy', '50%');
      gameLayer.classList.remove('open');
      document.getElementById('header')?.classList.remove('game-hidden');
      gameFinished = true;

      setTimeout(()=>{
        resultsView.classList.add('show');
      }, 500);
    }, 3000);
  }

  function resetGame(){
    capturedCount = 0;
    if(closeBtn) closeBtn.classList.remove('hidden');
    [0,1,2].forEach(i=>{
      const slot = document.getElementById('slot'+i);
      if(slot) {
        slot.classList.remove('filled');
        slot.style.background = 'rgba(255,255,255,.03)';
        slot.style.borderColor = 'rgba(255,255,255,.18)';
      }
    });
    balls.forEach(b=>{
      b.revealed = false;
      b.captured = false;
      b.dragging = false;
      b.shakeScore = 0;
      b.el.classList.remove('revealed-color','pop','dragging','shaking');
      b.el.style.display = '';
      b.el.style.removeProperty('--rc');
      b.updateRing();
      b.resetPosition();
    });
  }

  const b0 = document.getElementById('ball0');
  const b1 = document.getElementById('ball1');
  const b2 = document.getElementById('ball2');
  const balls = [];
  if(b0) balls.push(new Ball(b0));
  if(b1) balls.push(new Ball(b1));
  if(b2) balls.push(new Ball(b2));

  function loop(){
    balls.forEach(b=>{ b.step(); b.render(); });
    requestAnimationFrame(loop);
  }
  loop();
}

document.addEventListener('DOMContentLoaded', () => {
  initBkReveal();
  initBrandApplicationsViewer();
  initTestimonialsDeck();
  initColorGame();
});
