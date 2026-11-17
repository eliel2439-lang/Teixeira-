(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const suave = t => t * t * (3 - 2 * t);
  const cel = () => innerWidth <= 760;
  const tarefas = [];
  let q = 0;
  const quadro = () => { q = 0; tarefas.forEach(f => f()); };
  const pede = () => { if (!q) q = requestAnimationFrame(quadro); };
  addEventListener('scroll', pede, { passive: true });
  addEventListener('resize', pede);

  const et = $('.mq-etapas');
  if (et) {
    const pista = $('.et-pista', et), cs = $$('.et-c:not(.et-fim)', et), fim = $('.et-fim', et), nos = $$('.et-trilho b', et), barra = $('.et-barra', et);
    tarefas.push(() => {
      if (innerWidth <= 980 || !et.offsetParent) return;
      const r = pista.getBoundingClientRect(); if (r.bottom < -80 || r.top > innerHeight + 80) return;
      const p = RM ? 1 : clamp((innerHeight * .9 - r.top) / (r.height * .75 + innerHeight * .25), 0, 1);
      if (barra) barra.style.setProperty('--p', p.toFixed(3));
      cs.forEach((c, i) => { const on = p >= (i + .35) / cs.length; c.classList.toggle('on', on); if (nos[i]) nos[i].classList.toggle('on', on); });
      if (fim) fim.classList.toggle('on', p > .92);
    });
  }

  const PULA = '.art-pilula,.mq-fs,.mq-gav,.hc-funil,.ct-palco,.ft-palco,.termo-pop,.triagem-m,.pl-visor,.ps-funil,.mq-fio,.luz,.cursor,' +
    '.mq-secnav,.cartao,.fixo,.ep-tela,.es-kx-foto,.et-tela,.fq2-lado,.ha-tela,.hc-dir,.hcm-esq,.hm-casos-cab,.hm-esc-foto,.hm-jr-bal,.hm-prev,.hm-tela,.jr-tela,.lateral,.mp-palco,.mt-dir,.mq-car-ui,canvas,.zap';
  const TOPO = '.p-topo,.mq-capa,.mq-es-topo,.p404';
  let blocos = [], vis = new Set(), io = null;
  const serve = el => {
    if (el.matches(PULA) || el.querySelector(PULA)) return false;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.position === 'sticky' || cs.display === 'none' || cs.display === 'contents') return false;
    if (cs.transform !== 'none' || el.style.transform || cs.animationName !== 'none') return false;
    if (/\b(transform|all)\b/.test(cs.transitionProperty) && parseFloat(cs.transitionDuration) > 0) return false;
    const h = el.offsetHeight; return h > 24 && h < innerHeight * 1.35;
  };
  const pega = (el, n, out) => {
    if (n > 4 || el.matches(PULA) || out.length > 90) return;
    if (serve(el)) { out.push(el); return; }
    if (el.matches(PULA)) return;
    [...el.children].forEach(c => { if (c.nodeType === 1 && !/^(SCRIPT|STYLE|TEMPLATE|svg)$/i.test(c.tagName)) pega(c, n + 1, out); });
  };
  const limpa = () => { if (io) io.disconnect(); blocos.forEach(b => { b.el.style.transform = ''; b.el.style.transformOrigin = ''; b.el.classList.remove('d3', 'd3-v'); }); blocos = []; vis = new Set(); };
  const monta = () => {
    limpa(); if (RM) return;
    const pg = $('.pg.atual'); if (!pg) return;
    const art = (pg.dataset.rota || '').startsWith('conteudos/');
    const out = [];
    [...pg.children].forEach(sec => { if (sec.tagName === 'SECTION' && !sec.matches(TOPO)) [...sec.children].forEach(c => pega(c, 0, out)); });
    blocos = out.map(el => ({ el, art, ult: '' }));
    io = new IntersectionObserver(es => es.forEach(e => {
      const b = blocos.find(x => x.el === e.target); if (!b) return;
      if (e.isIntersecting) { vis.add(b); b.el.classList.add('d3-v'); } else { vis.delete(b); b.el.classList.remove('d3-v'); b.el.style.transform = ''; b.ult = ''; }
    }), { rootMargin: '15% 0px 15% 0px' });
    blocos.forEach(b => { b.el.classList.add('d3'); io.observe(b.el); });
    pede();
  };
  tarefas.push(() => {
    if (!vis.size) return;
    const vh = innerHeight, c = cel(), A = c ? 9 : 15, Z = c ? 46 : 110, Y = c ? 26 : 54;
    const rs = []; vis.forEach(b => rs.push([b, b.el.getBoundingClientRect()]));
    rs.forEach(([b, r]) => {
      const m = (r.top + r.height / 2) / vh;
      const e = suave(clamp((m - .58) / .52, 0, 1)), x = suave(clamp((.22 - m) / .5, 0, 1));
      let t = '', o = '';
      if (e > .002) {
        if (b.art) { t = `perspective(1300px) translate3d(0,${(e * Y).toFixed(1)}px,${(-e * Z).toFixed(1)}px) rotateY(${(-e * A * .8).toFixed(2)}deg)`; o = '0% 50%'; }
        else { t = `perspective(1300px) translate3d(0,${(e * Y).toFixed(1)}px,${(-e * Z).toFixed(1)}px) rotateX(${(e * A).toFixed(2)}deg)`; o = '50% 100%'; }
      } else if (x > .002) {
        t = `perspective(1300px) translate3d(0,0,${(-x * Z * .9).toFixed(1)}px) rotateX(${(-x * A * .45).toFixed(2)}deg)`; o = '50% 0%';
      }
      if (t !== b.ult) { b.el.style.transformOrigin = o; b.el.style.transform = t; b.ult = t; }
    });
  });

  const BAL = `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
<path d="M32 15v36M20 55h24M26 51h12"/><circle cx="32" cy="11" r="3"/>
<g class="bl-trave"><path d="M9 16h46"/>
<g class="bl-pe"><path d="M9 16 3 31M9 16l6 15"/><path d="M1 31h16c-1.5 5-4.5 7-8 7s-6.5-2-8-7z"/></g>
<g class="bl-pd"><path d="M55 16l-6 15M55 16l6 15"/><path d="M47 31h16c-1.5 5-4.5 7-8 7s-6.5-2-8-7z"/></g></g></g></svg>`;
  const lado = document.createElement('div'); lado.className = 'mq-bal'; lado.setAttribute('aria-hidden', 'true');
  lado.innerHTML = `<div class="mq-bal-3d">${BAL}</div><i class="mq-bal-fio"><b></b></i>`;
  document.body.appendChild(lado);
  const topo = $('.topo');
  const fio = document.createElement('div'); fio.className = 'mq-balfio'; fio.setAttribute('aria-hidden', 'true');
  fio.innerHTML = `<i></i><span class="mq-balmini">${BAL}</span>`;
  (topo || document.body).appendChild(fio);
  const peca = root => ({ tr: $('.bl-trave', root), pe: $('.bl-pe', root), pd: $('.bl-pd', root) });
  const P1 = peca(lado), P2 = peca(fio);
  let yAnt = scrollY, giro = 0;
  const poe = (p, a) => { p.tr.setAttribute('transform', `rotate(${a.toFixed(2)} 32 16)`); p.pe.setAttribute('transform', `rotate(${(-a).toFixed(2)} 9 16)`); p.pd.setAttribute('transform', `rotate(${(-a).toFixed(2)} 55 16)`); };
  tarefas.push(() => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), p = clamp(scrollY / max, 0, 1);
    const v = scrollY - yAnt; yAnt = scrollY;
    giro = RM ? 0 : clamp(giro * .82 + v * .9, -38, 38);
    const ang = RM ? 0 : (1 - suave(clamp(p / .96, 0, 1))) * -16 + Math.sin(p * 18) * 2.2 * (1 - p);
    poe(P1, ang); poe(P2, ang);
    $('.mq-bal-3d', lado).style.transform = `perspective(420px) rotateY(${giro.toFixed(1)}deg)`;
    $('b', lado).style.transform = `scaleY(${p.toFixed(4)})`;
    $('i', fio).style.transform = `scaleX(${p.toFixed(4)})`;
    $('.mq-balmini', fio).style.left = `calc(${(p * 100).toFixed(2)}% - ${(p * 22).toFixed(1)}px)`;
    const eq = p > .965; lado.classList.toggle('eq', eq); fio.classList.toggle('eq', eq);
  });
  if (!RM) setTimeout(() => { if (!q) { yAnt = scrollY; pede(); } }, 200);

  $$('.zap').forEach(z => {
    const alvo = $('.zap-txt', z), msg = alvo ? alvo.dataset.msg || '' : '';
    if (!alvo) return;
    const fim = () => { alvo.textContent = msg; z.classList.add('vivo', 'feito'); };
    if (RM) { fim(); return; }
    const obs = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return; obs.disconnect();
      z.classList.add('vivo'); let i = 0;
      const passo = () => { i += msg[i] === ' ' ? 1 : 1; alvo.textContent = msg.slice(0, i); if (i < msg.length) setTimeout(passo, 26 + Math.random() * 40); else z.classList.add('feito'); };
      setTimeout(passo, 500);
    }, { threshold: .45 });
    obs.observe(z);
  });

  const tarde = () => setTimeout(() => { monta(); pede(); }, 900);
  addEventListener('hashchange', tarde);
  if (document.readyState === 'complete') tarde(); else addEventListener('load', tarde);
  let larg = innerWidth;
  addEventListener('resize', () => { if (Math.abs(innerWidth - larg) < 40) return; larg = innerWidth; clearTimeout(monta._t); monta._t = setTimeout(monta, 400); });
})();
