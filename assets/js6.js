(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CEL = () => innerWidth <= 760;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const vis = (els, fn, op = { threshold: .25 }) => { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }), op); els.forEach(e => io.observe(e)); };

  const ret = $('#mq-ret-b') || $('.mq-capa .mc-ret img');
  if (ret) {
    $$('img.mq-ret, img.ch-ret-img').forEach(i => { if (!i.getAttribute('src')) i.src = ret.src; });
    $$('.es-ret').forEach(f => f.style.setProperty('--m', `url("${ret.src}")`));
  }

  const tr = document.createElement('div'); tr.className = 'mq-troca'; tr.setAttribute('aria-hidden', 'true');
  const anel = document.createElement('i'); anel.className = 'mq-troca-anel'; anel.setAttribute('aria-hidden', 'true');
  document.body.append(tr, anel);
  let px = innerWidth / 2, py = innerHeight / 2, tq = 0;
  addEventListener('pointerdown', e => { px = e.clientX; py = e.clientY; tq = performance.now(); }, true);
  addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const a = document.activeElement; if (a && a.getBoundingClientRect) { const r = a.getBoundingClientRect(); px = r.left + r.width / 2; py = r.top + r.height / 2; tq = performance.now(); } } }, true);
  addEventListener('popstate', () => { if (performance.now() - tq > 900) { px = innerWidth / 2; py = innerHeight / 2; } });
  const raio = () => Math.hypot(Math.max(px, innerWidth - px), Math.max(py, innerHeight - py)) + 6;
  const anima = (ms, fn) => new Promise(ok => { const t0 = performance.now(); const p = t => { const k = Math.min(1, (t - t0) / ms); fn(k); if (k < 1) requestAnimationFrame(p); else ok(); }; requestAnimationFrame(p); });
  const poeAnel = r => { anel.style.width = anel.style.height = (2 * r).toFixed(1) + 'px'; anel.style.transform = `translate(${(px - r).toFixed(1)}px,${(py - r).toFixed(1)}px)`; };
  let abrindo = 0;
  window.crTrocaFecha = () => {
    abrindo++;
    const R = raio();
    tr.style.setProperty('--x', px + 'px'); tr.style.setProperty('--y', py + 'px');
    tr.style.webkitMaskImage = tr.style.maskImage = 'none';
    tr.style.clipPath = `circle(0px at ${px}px ${py}px)`;
    tr.classList.add('on'); anel.classList.add('on');
    return anima(CEL() ? 170 : 260, k => { const r = R * k * k; tr.style.clipPath = `circle(${r.toFixed(1)}px at ${px}px ${py}px)`; poeAnel(r); });
  };
  window.crTrocaAbre = () => {
    const n = abrindo, R = raio();
    tr.style.clipPath = 'none';
    document.body.classList.add('mq-chega'); clearTimeout(window.crTrocaAbre._t);
    window.crTrocaAbre._t = setTimeout(() => document.body.classList.remove('mq-chega'), 1200);
    return anima(CEL() ? 300 : 480, k => {
      const r = R * (1 - Math.pow(1 - k, 3));
      const m = `radial-gradient(circle at ${px}px ${py}px, transparent ${r.toFixed(1)}px, #000000 ${(r + 1).toFixed(1)}px)`;
      tr.style.webkitMaskImage = tr.style.maskImage = m; poeAnel(r); anel.style.opacity = (1 - k * k).toFixed(3);
    }).then(() => { if (n !== abrindo) return; tr.classList.remove('on'); anel.classList.remove('on'); anel.style.opacity = ''; tr.style.webkitMaskImage = tr.style.maskImage = ''; tr.style.clipPath = ''; });
  };

  $$('.cp-c').forEach(b => b.addEventListener('click', () => b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'))));
  $$('.od-c').forEach(c => {
    const bs = $$('.od-chave button', c), ps = $$('.od-p', c);
    bs.forEach(b => b.addEventListener('click', () => { bs.forEach(x => x.setAttribute('aria-pressed', String(x === b))); ps.forEach(p => p.classList.toggle('on', p.dataset.od === b.dataset.od)); }));
  });
  $$('.qm-ficha').forEach(f => $$(':scope > div', f).forEach((d, i) => d.style.setProperty('--q', i)));
  vis($$('.qm-ficha'), f => f.classList.add('vis'));

  $$('.mq-rota').forEach(r => {
    const abas = $$('.rt-a', r), ps = $$('.rt-ps', r), palco = $('.rt-palco', r);
    const vai = k => { abas.forEach((a, i) => a.setAttribute('aria-selected', String(i === k))); ps.forEach((p, i) => p.classList.toggle('on', i === k)); palco.classList.remove('anda'); void palco.offsetWidth; palco.classList.add('anda'); };
    abas.forEach((a, i) => a.addEventListener('click', () => vai(i)));
    vis([palco], () => palco.classList.add('anda'), { threshold: .3 });
  });

  vis($$('.mq-cit'), c => c.classList.add('vis'), { threshold: .5 });
  let qa = 0;
  const leitura = () => {
    qa = 0;
    const pg = $('.pg.atual'); if (!pg || !$('.mq-art', pg)) return;
    const ini = $('.mq-art', pg).nextElementSibling, fim = $('.art-fim', pg) || pg.lastElementChild;
    if (!ini || !fim) return;
    const a = ini.getBoundingClientRect().top + scrollY, b = fim.getBoundingClientRect().top + scrollY - innerHeight * .6;
    const p = clamp((scrollY - a + innerHeight * .3) / Math.max(1, b - a), 0, 1);
    $$('.sm-anel-o', pg).forEach(o => o.style.setProperty('--o', (100 - p * 100).toFixed(1)));
    $$('.sm-pct', pg).forEach(t => { t.textContent = Math.round(p * 100) + '%'; });
  };
  addEventListener('scroll', () => { if (!qa) qa = requestAnimationFrame(leitura); }, { passive: true });
  addEventListener('hashchange', () => setTimeout(leitura, 700));

  const fqTopo = null, fqIn = null;
  if (fqIn) {
    const exs = $$('.fq2-i .fq2-q').map(q => q.textContent.trim()).filter((t, i, a) => t.length < 46 && a.indexOf(t) === i);
    const pick = [exs[0], exs.find(t => /aposent/i.test(t)), exs.find(t => /pensão/i.test(t)), exs.find(t => /golpe|desconto/i.test(t)), exs.find(t => /divórcio|invent/i.test(t))].filter(Boolean);
    const base = fqIn.getAttribute('placeholder') || 'Digite a sua dúvida';
    let iE = 0, iC = 0, apaga = false, parado = false, tm = 0;
    const passo = () => {
      if (parado || !pick.length) return;
      if (!$('.pg.atual .fq2-topo')) { tm = setTimeout(passo, 1500); return; }
      const t = pick[iE % pick.length];
      if (!apaga) { iC++; fqIn.setAttribute('placeholder', t.slice(0, iC)); if (iC >= t.length) { apaga = true; tm = setTimeout(passo, 1900); return; } tm = setTimeout(passo, 55); }
      else { iC -= 2; if (iC <= 0) { iC = 0; apaga = false; iE++; fqIn.setAttribute('placeholder', base); tm = setTimeout(passo, 500); return; } fqIn.setAttribute('placeholder', t.slice(0, iC)); tm = setTimeout(passo, 22); }
    };
    if (!RM) tm = setTimeout(passo, 1600);
    const para = () => { parado = true; clearTimeout(tm); fqIn.setAttribute('placeholder', base); };
    fqIn.addEventListener('focus', para); fqIn.addEventListener('pointerdown', para);
  }

  const FOTO_F = { 'simulador-de-aposentadoria': 'photo-1746221331496-a87689fc8eb9', 'onde-meu-pedido-no-inss-parou': 'photo-1716558057044-72f92e6a5654', 'contador-de-prazos': 'photo-1770250959829-de36726e99c4', 'documentos-que-voce-precisa': 'photo-1670420421437-2335c38c0d97' };
  const cx = $('.pl-caixa.mq-pl');
  if (cx) document.addEventListener('click', e => {
    const a = e.target.closest('[data-palco]'); if (!a) return;
    const f = FOTO_F[(a.dataset.palco || '').split(':')[0]];
    cx.style.setProperty('--pl-foto', f ? `url("https://images.unsplash.com/${f}?auto=format&fit=crop&w=1600&q=70")` : 'none');
  }, true);

  $$('.mq-passos').forEach(ol => {
    const lis = $$('li', ol), fio = $('.ps-fio', ol);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }), { rootMargin: '0px 0px -35% 0px' });
    lis.forEach(l => io.observe(l));
    let q = 0;
    const mede = () => { q = 0; const r = ol.getBoundingClientRect(); const p = clamp((innerHeight * .65 - r.top) / Math.max(1, r.height), 0, 1); fio && fio.style.setProperty('--p', p.toFixed(3)); };
    addEventListener('scroll', () => { if (!q) q = requestAnimationFrame(mede); }, { passive: true }); mede();
  });
  $$('.mq-cel').forEach(c => {
    const t = $('.mt-texto', c); if (!t) return;
    const dig = document.createElement('span'); dig.className = 'cel-dig'; dig.setAttribute('aria-hidden', 'true'); dig.innerHTML = '<i></i><i></i><i></i>';
    t.before(dig);
    let tm = 0, ult = t.textContent;
    new MutationObserver(() => {
      if (t.textContent === ult) return; ult = t.textContent;
      if (RM) return;
      clearTimeout(tm); c.classList.remove('chega'); c.classList.add('digita');
      tm = setTimeout(() => { c.classList.remove('digita'); void c.offsetWidth; c.classList.add('chega'); }, 420);
    }).observe(t, { childList: true, characterData: true, subtree: true });
  });
  $$('.ch-mapa').forEach(m => {
    const capa = $('.mq-capa .mc-mapa'); if (!capa) return;
    const VB = CEL() ? '300 500 760 570' : '60 470 1000 625';
    ['.mc-ruas', '.mc-rota'].forEach(sel => { const o = $(sel, capa); if (!o) return; const c = o.cloneNode(true); c.setAttribute('viewBox', VB); c.setAttribute('preserveAspectRatio', 'xMidYMid slice'); c.setAttribute('aria-hidden', 'true'); m.prepend(c); });
    $$('.mc-rota', m).forEach(svg => m.appendChild(svg));
    const pino = $('.chm-pino', m); m.appendChild(pino);
    const poe = () => {
      const c = $('.mc-pino', m); if (!c) return;
      const a = m.getBoundingClientRect(), b = c.getBoundingClientRect(); if (!a.width) return;
      m.style.setProperty('--px', ((b.left + b.width / 2 - a.left) / a.width * 100).toFixed(2) + '%');
      m.style.setProperty('--py', ((b.top + b.height / 2 - a.top) / a.height * 100).toFixed(2) + '%');
    };
    addEventListener('resize', poe); addEventListener('hashchange', () => setTimeout(poe, 800));
    vis([m], () => { poe(); m.classList.add('vis'); }, { threshold: .35 });
    setTimeout(poe, 300);
  });
})();
