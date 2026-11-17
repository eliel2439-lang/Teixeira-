(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINO = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const io = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const visivel = el => !!el && !!el.closest('.pg.atual');
  const tarefas = [];
  let q = 0;
  const roda = () => { q = 0; tarefas.forEach(f => { try { f(); } catch (e) { } }); };
  const pede = () => { if (!q) q = requestAnimationFrame(roda); };
  addEventListener('scroll', pede, { passive: true });
  addEventListener('resize', () => { medidas.forEach(f => f()); pede(); });
  const medidas = [];
  $$('section.pg').forEach(pg => new MutationObserver(() => { if (pg.classList.contains('atual')) requestAnimationFrame(() => { medidas.forEach(f => f()); pede(); }); }).observe(pg, { attributes: true, attributeFilter: ['class'] }));
  const conta = (el, ate, dur = 900) => {
    if (RM || !/^\d+$/.test(ate)) { el.textContent = ate; return; }
    const n = +ate, t0 = performance.now();
    const f = t => { const p = clamp((t - t0) / dur, 0, 1); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };
  const dataBR = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const WA = m => 'https://wa.me/5511949865516?text=' + encodeURIComponent(m);

  const et = $('.mq-etapas');
  if (et) {
    const pista = $('.et-pista', et), cs = $$('.et-c', et), nos = $$('.et-trilho b', et), barra = $('.et-barra', et);
    let dist = 0;
    const larga = () => false;
    const mede = () => {
      if (!visivel(et)) return;
      if (larga()) { pista.style.transform = ''; dist = Math.max(0, pista.scrollWidth - innerWidth); et.style.height = (innerHeight + dist + innerHeight * .15) + 'px'; }
      else { et.style.height = ''; pista.style.transform = ''; dist = 0; }
    };
    medidas.push(mede); mede();
    tarefas.push(() => {
      if (!visivel(et)) return;
      const r = et.getBoundingClientRect(); if (r.bottom < -50 || r.top > innerHeight + 50) return;
      if (larga()) {
        if (!dist) mede();
        const p = clamp(-r.top / Math.max(1, dist), 0, 1);
        pista.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
        barra.style.setProperty('--p', p.toFixed(3));
        const alvo = innerWidth * .4; let k = 0, best = 1e9;
        cs.forEach((c, i) => { const b = c.getBoundingClientRect(), d = Math.abs(b.left + b.width / 2 - alvo); if (d < best) { best = d; k = i; } });
        cs.forEach((c, i) => c.classList.toggle('on', i === k));
        nos.forEach((n, i) => n.classList.toggle('on', i <= k));
      } else if (innerWidth <= 980) {
        const pr = pista.getBoundingClientRect();
        pista.style.setProperty('--p', clamp((innerHeight * .62 - pr.top) / pr.height, 0, 1).toFixed(3));
        cs.forEach(c => c.classList.toggle('on', c.getBoundingClientRect().top < innerHeight * .66));
      }
    });
  }

  const pz = $('.mq-prazos');
  if (pz) {
    const regua = $('.pz-regua', pz), ms = $$('.pz-m', pz), cards = $$('.pz-c', pz), chips = $$('.pz-chip', pz);
    const inp = $('.pz-data input', pz), res = $('.pz-res', pz), bt = $('.pz-wa', pz);
    const DIAS = [30, 60, 90, 3652], POS = d => Math.log(1 + d) / Math.log(3653);
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    inp.max = iso(hoje);
    const contados = new Set();
    const liga = (k, on) => {
      ms[k].classList.toggle('on', on); cards[k].classList.toggle('on', on);
      if (on && !contados.has(k)) { contados.add(k); const sp = $('.pz-n span', cards[k]); conta(sp, sp.dataset.to); }
    };
    let modo = 'rola', sel = -1;
    regua.classList.add('rola');
    tarefas.push(() => {
      if (modo !== 'rola' || !visivel(pz)) return;
      const r = regua.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const cel = innerWidth <= 760;
      const p = RM ? 1 : clamp(cel ? (innerHeight * .7 - r.top) / r.height : (innerHeight * .88 - r.top) / (innerHeight * .5), 0, 1);
      regua.style.setProperty('--p', p.toFixed(4)); regua.style.setProperty('--a', p.toFixed(4));
      DIAS.forEach((d, k) => liga(k, p >= POS(d) - .002));
    });
    const soma = (d, regra) => { const x = new Date(d), r = /^([dma])(\d+)$/.exec(regra || ''); if (r) { const n = +r[2]; if (r[1] === 'd') x.setDate(x.getDate() + n); else if (r[1] === 'm') x.setMonth(x.getMonth() + n); else x.setFullYear(x.getFullYear() + n); } return x; };
    const calcula = () => {
      const c = chips[sel];
      ms.forEach((m, k) => m.classList.toggle('sel', k === sel)); cards.forEach((m, k) => m.classList.toggle('sel', k === sel));
      if (!c) return;
      const ass = c.textContent.trim();
      if (!inp.value) {
        res.innerHTML = `<p>Agora informe a data ${c.dataset.de}.</p>`;
        bt.href = WA(`Olá! Vim pelo site da Advocacia Teixeira Mendes. Tenho uma dúvida sobre prazo: ${ass.toLowerCase()}.`);
        return;
      }
      const [y, mo, d] = inp.value.split('-').map(Number), ini = new Date(y, mo - 1, d);
      if (isNaN(ini)) return;
      modo = 'conta'; regua.classList.remove('rola'); regua.classList.add('conta');
      const passados = Math.round((hoje - ini) / 864e5);
      if (passados < 0) { res.innerHTML = '<p>A data informada ainda não chegou. Confira o dia, o mês e o ano.</p>'; return; }
      const a = POS(clamp(passados, 0, 3652));
      regua.style.setProperty('--a', a.toFixed(4)); regua.style.setProperty('--p', a.toFixed(4));
      $('.pz-agora em', regua).textContent = passados === 0 ? 'hoje' : `hoje · ${passados} ${passados === 1 ? 'dia' : 'dias'}`;
      DIAS.forEach((dd, k) => { ms[k].classList.toggle('on', passados >= dd); cards[k].classList.add('on'); if (!contados.has(k)) { contados.add(k); $('.pz-n span', cards[k]).textContent = $('.pz-n span', cards[k]).dataset.to; } });
      const fim = soma(ini, c.dataset.regra), falta = Math.round((fim - hoje) / 864e5);
      const n = c.dataset.n;
      res.innerHTML = falta >= 0
        ? `<p>Contando a partir ${c.dataset.de}, em ${dataBR(ini)}, o prazo geral de ${n} termina em <b>${dataBR(fim)}</b>. ${falta === 0 ? '<b>Termina hoje.</b>' : `Faltam <b>${falta} ${falta === 1 ? 'dia' : 'dias'}</b>.`}</p>`
        : `<p class="pz-passou">Pela data informada, o prazo geral de ${n} terminou em <b>${dataBR(fim)}</b>. Converse com a advogada para avaliar o seu caso.</p>`;
      bt.href = WA(`Olá! Vim pelo site da Advocacia Teixeira Mendes. Tenho uma dúvida sobre prazo: ${ass.toLowerCase()}. Aconteceu em ${dataBR(ini)}.`);
    };
    chips.forEach((c, k) => c.addEventListener('click', () => {
      const on = c.getAttribute('aria-pressed') !== 'true';
      chips.forEach(x => x.setAttribute('aria-pressed', 'false')); c.setAttribute('aria-pressed', String(on));
      sel = on ? k : -1;
      if (sel < 0) { modo = 'rola'; regua.classList.add('rola'); regua.classList.remove('conta'); ms.forEach(m => m.classList.remove('sel')); cards.forEach(m => m.classList.remove('sel')); res.innerHTML = '<p>Escolha a situação e a data para ver a data-limite aproximada.</p>'; pede(); return; }
      calcula();
    }));
    inp.addEventListener('change', calcula); inp.addEventListener('input', () => { if (sel >= 0 && inp.value.length === 10) calcula(); });
  }

  const mp = $('.mq-mapa'), gj = $('#mq-geo');
  if (mp && gj) {
    const G = JSON.parse(gj.textContent), NS = 'http://www.w3.org/2000/svg';
    const svg = $('.mp-svg', mp), base = $('.mp-base', mp), d3 = $('.mp-3d', mp), abas = $$('.mp-aba', mp), ps = $$('.mp-p', mp);
    const el = (n, a = {}, pai) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (pai) pai.appendChild(e); return e; };
    const M = G.cid[0];
    const defs = el('defs', {}, svg);
    const gr = el('radialGradient', { id: 'mpFundo', cx: '50%', cy: '35%', r: '75%' }, defs);
    el('stop', { offset: '0', 'stop-color': '#201C17' }, gr); el('stop', { offset: '1', 'stop-color': '#13100D' }, gr);
    const gX = el('g', { class: 'mp-ext' }, svg), gE = el('g', {}, svg);
    const BR = G.br || G.estados.map(e => e.d).join(''), NX = 16, PX = G.bbox[2] * .0019;
    for (let i = NX; i >= 1; i--) { const k = 1 - i / NX; el('path', { d: BR, class: 'lado', transform: `translate(0 ${(i * PX).toFixed(2)})`, fill: `rgb(${Math.round(26 + 70 * k)},${Math.round(20 + 52 * k)},${Math.round(6 + 14 * k)})` }, gX); }
    el('path', { d: BR, class: 'topo-br' }, gE);
    G.estados.forEach(e => el('path', { d: e.d, class: 'e' + (e.uf === 'SP' ? ' sp' : '') }, gE));
    el('path', { d: BR, class: 'contorno' }, gE);
    const gBr = el('g', { class: 'camada-br' }, svg);
    const SEL = ['Porto Alegre', 'Curitiba', 'Brasília', 'Cuiabá', 'Salvador', 'Recife', 'Fortaleza', 'Belém', 'Manaus'];
    const caps = SEL.map(n => G.cap.find(c => c.n === n)).filter(Boolean), capT = [];
    caps.forEach((c, k) => {
      const dx = c.x - M.x, dy = c.y - M.y, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, s = ny > 0 ? -1 : 1;
      const cx = (M.x + c.x) / 2 + nx * L * .22 * s, cy = (M.y + c.y) / 2 + ny * L * .22 * s;
      const d = `M${M.x} ${M.y}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${c.x} ${c.y}`, st = `--k:${k};--n:${caps.length}`;
      el('path', { d, class: 'arco', pathLength: 1, style: st }, gBr);
      const ch = el('circle', { cx: c.x, cy: c.y, r: 11, class: 'cap-h', style: st }, gBr), cc = el('circle', { cx: c.x, cy: c.y, r: 9, class: 'cap', style: st }, gBr);
      const t = el('text', { x: c.x, y: c.y, class: 'cap-t', style: st, 'text-anchor': c.x < M.x - 300 ? 'end' : 'start' }, gBr); t.textContent = c.n;
      capT.push({ c, t, ch, cc, e: c.x < M.x - 300 });
    });
    const gC = el('g', { class: 'camada-cid', opacity: 0 }, svg);
    const ruasD = $('.mq-capa .mc-ruas > path');
    if (ruasD) el('path', { d: ruasD.getAttribute('d'), class: 'ruas', transform: `translate(${M.x - 15} ${M.y - 9.4}) scale(.0209)` }, gC);
    const aneis = [5, 10, 15].map(km => { const r = km * G.km; el('circle', { cx: M.x, cy: M.y, r, class: 'anel' }, gC); const t = el('text', { x: M.x, y: M.y - r, class: 'anel-t', 'text-anchor': 'middle', dy: '-.4em' }, gC); t.textContent = km + ' km'; return t; });
    const LADO = { 'Campo Belo': [1, 0], 'Brooklin': [1, -1], 'Jabaquara': [1, 0], 'Interlagos': [-1, 1], 'Diadema': [1, 1], 'Taboão da Serra': [-1, 0], 'São Paulo · Centro': [1, -1] };
    const CURTO = { 'Taboão da Serra': 'Taboão', 'São Paulo · Centro': 'Centro' };
    const cids = G.cid.slice(1).map(c => { const g = el('g', { class: 'cid' }, gC); const ci = el('circle', { cx: c.x, cy: c.y, r: .3 }, g); const l = LADO[c.n] || [1, 0];
      const t = el('text', { x: c.x, y: c.y, 'text-anchor': l[0] < 0 ? 'end' : l[0] > 0 ? 'start' : 'middle' }, g); t.textContent = c.n; return { c, ci, t, l }; });
    const nomes = () => { const cel = innerWidth <= 760; cids.forEach(o => { o.t.textContent = cel ? (CURTO[o.c.n] || o.c.n) : o.c.n; }); };
    medidas.push(nomes); nomes();
    const gM = el('g', {}, svg);
    const mh = el('circle', { cx: M.x, cy: M.y, r: 10, class: 'maua-h' }, gM), mc = el('circle', { cx: M.x, cy: M.y, r: 6, class: 'maua' }, gM);
    const mt = el('text', { x: M.x, y: M.y, class: 'maua-t' }, gM); mt.textContent = 'Santo Amaro';
    const bx = G.bbox, pad = 40;
    const VB0 = { cx: bx[0] + bx[2] / 2, cy: bx[1] + bx[3] / 2, w: bx[2] + pad * 2, h: bx[3] + pad * 2 };
    const xs = G.cid.map(c => c.x), ys = G.cid.map(c => c.y);
    const VB1 = { cx: (Math.min(...xs) + Math.max(...xs)) / 2 + 1.5, cy: (Math.min(...ys) + Math.max(...ys)) / 2 + 1, w: Math.max(...xs) - Math.min(...xs) + 14, h: Math.max(...ys) - Math.min(...ys) + 11 };
    let ar = 1, W = 1, vbAtual = null;
    const mede = () => { const r = svg.getBoundingClientRect(); if (r.width) { ar = r.width / r.height; W = r.width; } };
    medidas.push(mede); mede();
    const caixa = v => { let w = v.w, h = v.h; if (w / h > ar) h = w / ar; else w = h * ar; return { cx: v.cx, cy: v.cy, w, h }; };
    const poe = t => {
      const a = caixa(VB0), b = caixa(VB1);
      const w = Math.exp(lerp(Math.log(a.w), Math.log(b.w), t)), h = w / ar;
      const k = (a.w - w) / (a.w - b.w);
      const cx = lerp(a.cx, b.cx, k), cy = lerp(a.cy, b.cy, k);
      const vb = `${(cx - w / 2).toFixed(2)} ${(cy - h / 2).toFixed(2)} ${w.toFixed(3)} ${h.toFixed(3)}`;
      if (vb !== vbAtual) { svg.setAttribute('viewBox', vb); if (t < .02) base.setAttribute('viewBox', vb); vbAtual = vb; }
      mp.classList.toggle('zoom', t >= .02);
      const u = w / W;
      mc.setAttribute('r', (6 * u).toFixed(3)); mh.setAttribute('r', (8 * u).toFixed(3));
      mt.setAttribute('font-size', (lerp(15, 19, t) * u).toFixed(3)); mt.setAttribute('x', (M.x + 11 * u).toFixed(2)); mt.setAttribute('y', (M.y - 9 * u).toFixed(2));
      const fs = innerWidth <= 760 ? 11 : 12.5;
      cids.forEach(o => { o.ci.setAttribute('r', (4.5 * u).toFixed(3)); o.t.setAttribute('font-size', (fs * u).toFixed(3)); o.t.setAttribute('x', (o.c.x + o.l[0] * 9 * u).toFixed(2)); o.t.setAttribute('y', (o.c.y + (o.l[1] ? o.l[1] * 13 : 4) * u).toFixed(2)); });
      aneis.forEach(x => x.setAttribute('font-size', (10 * u).toFixed(3)));
      capT.forEach(o => { o.cc.setAttribute('r', (4.2 * u).toFixed(3)); o.ch.setAttribute('r', (6 * u).toFixed(3)); o.t.setAttribute('font-size', (12 * u).toFixed(3)); o.t.setAttribute('x', (o.c.x + (o.e ? -9 : 9) * u).toFixed(2)); o.t.setAttribute('y', (o.c.y + 4 * u).toFixed(2)); });
      const fBr = clamp(1 - t * 2.4, 0, 1), fC = clamp((t - .55) / .4, 0, 1);
      gBr.setAttribute('opacity', fBr.toFixed(3)); gC.setAttribute('opacity', fC.toFixed(3));
      const fX = clamp(1 - t * 5, 0, 1); gX.setAttribute('opacity', fX.toFixed(3)); gX.style.display = fX <= 0 ? 'none' : '';
      const cel = innerWidth <= 980;
      d3.style.setProperty('--rx', lerp(cel ? 34 : 46, cel ? 14 : 26, t).toFixed(2) + 'deg');
      d3.style.setProperty('--rz', lerp(cel ? -4 : -8, 0, t).toFixed(2) + 'deg');
      const cidade = t > .6;
      if (mp.classList.contains('cidade') !== cidade) {
        mp.classList.toggle('cidade', cidade);
        ps.forEach((p, i) => p.classList.toggle('on', i === (cidade ? 1 : 0)));
        abas.forEach((b, i) => b.setAttribute('aria-selected', String(i === (cidade ? 1 : 0))));
      }
    };
    let tRM = 0, tUlt = -1;
    let tToque = 0, aToque = 0;
    mp._vai = alvo => { cancelAnimationFrame(aToque); const a = tToque, ini = performance.now(); const p = n => { const k = Math.min(1, (n - ini) / 1500); tToque = a + (alvo - a) * io(k); poe(tToque); if (k < 1) aToque = requestAnimationFrame(p); }; aToque = requestAnimationFrame(p); };
    const tDe = () => {
      if (mp.classList.contains('toque')) return tToque;
      if (RM) return tRM;
      const r = mp.getBoundingClientRect(), L = mp.offsetHeight - innerHeight;
      const p = clamp(-r.top / Math.max(1, L), 0, 1);
      return io(clamp((p - .3) / .48, 0, 1));
    };
    tarefas.push(() => {
      if (!visivel(mp)) return;
      const r = mp.getBoundingClientRect(), fora = r.bottom < 0 || r.top > innerHeight;
      mp.classList.toggle('parado', fora); if (fora) return;
      if (!W || W < 2) mede();
      const t = tDe(); if (Math.abs(t - tUlt) < .0015 && t !== 0 && t !== 1) return; tUlt = t; poe(t);
    });
    abas.forEach((b, i) => b.addEventListener('click', () => {
      if (mp.classList.contains('toque')) { mp._vai(i); return; }
      if (RM) { tRM = i; poe(tRM); return; }
      const top = scrollY + mp.getBoundingClientRect().top, L = mp.offsetHeight - innerHeight;
      scrollTo({ top: top + L * (i ? .9 : .12), behavior: 'smooth' });
    }));
    if (FINO && !RM) {
      const cena = $('.mp-cena', mp); let q3 = 0, ex = 0, ey = 0;
      cena.addEventListener('pointermove', e => { ex = e.clientX; ey = e.clientY; if (q3) return; q3 = requestAnimationFrame(() => { q3 = 0; const r = cena.getBoundingClientRect(); const x = (ex - r.left) / r.width - .5, y = (ey - r.top) / r.height - .5; d3.style.setProperty('--ms', 1); d3.style.transform = `rotateX(calc(var(--rx) + ${(-y * 8).toFixed(2)}deg)) rotateZ(calc(var(--rz) + ${(x * 8).toFixed(2)}deg))`; }); });
      cena.addEventListener('pointerleave', () => { d3.style.transform = ''; });
    }
    poe(0);
  }

  const ag = $('.mq-artigos .ar-grade');
  if (ag) {
    const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { ag.classList.add('vis'); io2.disconnect(); } }), { threshold: .15 });
    io2.observe(ag);
    const cs = $$('.ar-c', ag), dots = $('.ar-dots');
    if (dots) dots.innerHTML = cs.map(() => '<i></i>').join('');
    const ds = dots ? $$('i', dots) : [];
    const meio = () => {
      if (innerWidth > 760) { cs.forEach(c => c.classList.remove('meio')); return; }
      const L = ag.getBoundingClientRect(), cx = L.left + L.width / 2; let k = 0, best = 1e9;
      cs.forEach((c, i) => { const r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - cx); if (d < best) { best = d; k = i; } });
      cs.forEach((c, i) => c.classList.toggle('meio', i === k)); ds.forEach((d, i) => d.classList.toggle('on', i === k));
    };
    let q4 = 0; ag.addEventListener('scroll', () => { if (!q4) q4 = requestAnimationFrame(() => { q4 = 0; meio(); }); }, { passive: true });
    medidas.push(meio); meio();
  }

  $$('.secao .faq').forEach(fq => {
    const fecha = d => {
      const r = $('.faq-r', d); if (!r || RM || !r.animate) { d.open = false; return; }
      const a = r.animate([{ height: r.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 260, easing: 'ease-in' });
      a.onfinish = () => { d.open = false; };
    };
    const abre = d => {
      d.open = true; const r = $('.faq-r', d); if (!r || RM || !r.animate) return;
      r.animate([{ height: '0px', opacity: 0 }, { height: r.scrollHeight + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    };
    $$('details', fq).forEach(d => {
      const sm = $('summary', d); if (!sm) return;
      sm.addEventListener('click', e => {
        e.preventDefault();
        if (d.open) fecha(d);
        else { $$('details[open]', fq).forEach(o => { if (o !== d) fecha(o); }); abre(d); }
      });
    });
  });

  const ctt = $('.ct-topo');
  if (ctt && FINO && !RM) {
    const fundo = $('.ct-fundo', ctt), w = $('.ct-cartao-w', ctt); let q5 = 0, ex = 0, ey = 0;
    ctt.addEventListener('pointermove', e => {
      ex = e.clientX; ey = e.clientY; if (q5) return;
      q5 = requestAnimationFrame(() => {
        q5 = 0; const r = ctt.getBoundingClientRect();
        fundo && fundo.style.setProperty('--lx', (ex - r.left) + 'px'); fundo && fundo.style.setProperty('--ly', (ey - r.top) + 'px');
        if (w) { const b = w.getBoundingClientRect(), x = clamp((ex - b.left) / b.width - .5, -.8, .8), y = clamp((ey - b.top) / b.height - .5, -.8, .8);
          w.style.transform = `rotate(-2deg) perspective(1000px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`; }
      });
    }, { passive: true });
    ctt.addEventListener('pointerleave', () => { if (w) w.style.transform = ''; });
  }
  const centro = $('.mq-terr .ct-centro');
  if (centro) {
    const sims = $$('svg', centro), fotos = $$('.ct-foto', centro);
    const acerta = () => { const k = sims.findIndex(s => s.classList.contains('atual')); if (k >= 0) fotos.forEach((f, i) => f.classList.toggle('atual', i === k)); };
    sims.forEach(s => new MutationObserver(acerta).observe(s, { attributes: true, attributeFilter: ['class'] }));
    acerta();
  }
  pede();
})();
