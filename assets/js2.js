(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINO = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const vh = () => innerHeight;
  const rolagens = new Set();
  let pedido = false;
  addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(() => { pedido = false; rolagens.forEach(f => f()); }); } }, { passive: true });
  addEventListener('resize', () => rolagens.forEach(f => f()), { passive: true });

  function luz(alvo, area) {
    if (!FINO || RM || alvo._luz) return; alvo._luz = 1;
    let q = 0, ev = null;
    (area || alvo).addEventListener('pointermove', e => {
      ev = e; if (q) return;
      q = requestAnimationFrame(() => {
        q = 0; const r = alvo.getBoundingClientRect();
        alvo.style.setProperty('--mx', ((ev.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        alvo.style.setProperty('--my', ((ev.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }, { passive: true });
  }

  function territorios(s) { return;
    if (s._ok) return; s._ok = 1;
    const ps = $$('.ct-p', s), bts = $$('.ct-rot button', s), segs = $$('.ct-anel .seg', s), sims = $$('.ct-centro svg', s), fs = $$('.ct-fundo i', s), prog = $('.ct-anel .prog', s), cont = $('.ct-centro small', s);
    const N = ps.length; let atual = -1;
    const fixo = () => getComputedStyle($('.ct-palco', s)).position === 'sticky';
    const mostra = k => {
      if (k === atual) return; atual = k;
      ps.forEach((p, i) => { p.classList.toggle('atual', i === k); if (fixo()) p.setAttribute('aria-hidden', String(i !== k)); else p.removeAttribute('aria-hidden'); });
      bts.forEach((b, i) => b.setAttribute('aria-pressed', String(i === k)));
      [segs, sims, fs].forEach(l => l.forEach((e, i) => e.classList.toggle('atual', i === k)));
      if (cont) cont.textContent = `${k + 1} de ${N}`;
    };
    const aplica = () => {
      if (!fixo()) { ps.forEach(p => p.removeAttribute('aria-hidden')); return; }
      const r = s.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh()) return;
      const p = clamp(-r.top / (r.height - vh()), 0, 1);
      if (prog) prog.style.strokeDashoffset = (1 - p).toFixed(4);
      mostra(Math.min(N - 1, Math.floor(p * N * .999)));
    };
    bts.forEach((b, i) => b.addEventListener('click', () => {
      if (!fixo()) { ps[i].scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); return; }
      const r = s.getBoundingClientRect(), topo = scrollY + r.top;
      scrollTo({ top: topo + (i + .5) / N * (r.height - vh()), behavior: RM ? 'auto' : 'smooth' });
    }));
    s._rol = aplica; rolagens.add(aplica);
    mostra(0); aplica();
  }

  function montar(pg) {
    $$('.hm-heroi', pg).forEach(h => { const r = $('.hm-retrato', h); r && luz(r, h); });
    $$('.mq-luz-alvo', pg).forEach(a => { luz(a); const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { a.classList.add('acesa'); io.disconnect(); } }, { threshold: .3 }); io.observe(a); });
    $$('.mq-terr', pg).forEach(territorios);
  }
  function desmontar(pg) { $$('.mq-terr', pg).forEach(s => { s._rol && rolagens.delete(s._rol); s._ok = 0; }); }
  const vistos = new WeakSet();
  const olha = () => $$('section.pg').forEach(pg => {
    const at = pg.classList.contains('atual');
    if (at && !vistos.has(pg)) { vistos.add(pg); requestAnimationFrame(() => montar(pg)); }
    else if (!at && vistos.has(pg)) { vistos.delete(pg); desmontar(pg); }
  });
  const mo = new MutationObserver(olha);
  $$('section.pg').forEach(pg => mo.observe(pg, { attributes: true, attributeFilter: ['class'] }));
  olha();
})();

(() => {
  const fio = document.querySelector('.mq-fio'); if (!fio) return;
  const home = fio.closest('section.pg'), i = fio.querySelector('i');
  let q = 0;
  const f = () => { q = 0; const on = home.classList.contains('atual'); fio.classList.toggle('on', on && scrollY > innerHeight * .6); if (!on) return;
    const h = document.documentElement.scrollHeight - innerHeight; i.style.setProperty('--p', h > 0 ? Math.min(1, scrollY / h).toFixed(4) : 0); };
  addEventListener('scroll', () => { if (!q) q = requestAnimationFrame(f); }, { passive: true });
  new MutationObserver(f).observe(home, { attributes: true, attributeFilter: ['class'] }); f();
})();
