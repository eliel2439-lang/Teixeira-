(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINO = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const CEL = () => innerWidth <= 760;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const io = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  $$('.img>img').forEach(i => {
    const ok = () => i.classList.add('mq-ok');
    if ((i.getAttribute('src') || '').startsWith('data:image/webp')) { if (i.complete) ok(); else i.addEventListener('load', ok, { once: true }); }
  });

  const capa = $('.mq-capa'); if (!capa) return;
  const home = capa.closest('section.pg');
  
  const fundo = $('.tm-fundo', capa), selo = $('.tm-selo', capa);
  const chega = () => { if (!capa.classList.contains('chegou')) setTimeout(() => capa.classList.add('chegou'), 40); };
  if (home.classList.contains('atual')) chega();
  new MutationObserver(() => { if (home.classList.contains('atual')) chega(); }).observe(home, { attributes: true, attributeFilter: ['class'] });
  

  if (FINO && !RM && selo) {
    let q = 0, ev = null;
    capa.addEventListener('pointermove', e => { ev = e; if (q) return; q = requestAnimationFrame(() => { q = 0; const r = capa.getBoundingClientRect(); capa.style.setProperty('--tx', ((ev.clientX - r.left) / r.width - .5).toFixed(3)); capa.style.setProperty('--ty', ((ev.clientY - r.top) / r.height - .5).toFixed(3)); }); }, { passive: true });
    capa.addEventListener('pointerleave', () => { capa.style.setProperty('--tx', 0); capa.style.setProperty('--ty', 0); });
  }
  const paralaxe = () => {
    if (RM || !home.classList.contains('atual')) return;
    const y = scrollY, h = capa.offsetHeight; if (y > h * 1.2) return;
    if (fundo) fundo.style.transform = `translate3d(0,${(y * .32).toFixed(1)}px,0)`;
    if (selo && !CEL()) selo.style.translate = `0 ${(y * .14).toFixed(1)}px`;
  };

  let q2 = 0;
  const rolar = () => { q2 = 0; paralaxe(); };
  addEventListener('scroll', () => { if (!q2) q2 = requestAnimationFrame(rolar); }, { passive: true });

  const mesa = $('.mq-mesa', home);
  const cartas = mesa ? $$('.hc-item', mesa) : [];
  if (mesa) {
    const lista = $('.hc-lista', mesa);
    const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { lista.classList.add('mq-vis'); io2.disconnect(); } }), { threshold: .12 });
    io2.observe(lista);
    if (FINO && !RM) {
      const luz = document.createElement('i'); luz.className = 'mq-luz'; luz.setAttribute('aria-hidden', 'true'); mesa.prepend(luz);
      let q4 = 0, ex = 0, ey = 0;
      mesa.addEventListener('pointermove', e => {
        ex = e.clientX; ey = e.clientY; if (q4) return;
        q4 = requestAnimationFrame(() => {
          q4 = 0; const r = mesa.getBoundingClientRect();
          mesa.style.setProperty('--lx', (ex - r.left) + 'px'); mesa.style.setProperty('--ly', (ey - r.top) + 'px'); mesa.classList.add('luz-on');
          const c = document.elementFromPoint(ex, ey)?.closest?.('.hc-item');
          if (c && mesa.contains(c)) { const rc = c.getBoundingClientRect(); c.style.setProperty('--mx', (ex - rc.left) + 'px'); c.style.setProperty('--my', (ey - rc.top) + 'px'); }
        });
      }, { passive: true });
      mesa.addEventListener('pointerleave', () => mesa.classList.remove('luz-on'));
    }
    const dots = $('.mq-dots', mesa);
    if (dots) {
      const lis = $$('li', lista); dots.innerHTML = lis.map(() => '<i></i>').join('');
      const ds = $$('i', dots); ds[0] && ds[0].classList.add('on');
      let q5 = 0;
      lista.addEventListener('scroll', () => { if (q5) return; q5 = requestAnimationFrame(() => {
        q5 = 0; const L = lista.getBoundingClientRect(), cx = L.left + L.width / 2; let k = 0, best = 1e9;
        lis.forEach((li, i) => { const r = li.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - cx); if (d < best) { best = d; k = i; } });
        ds.forEach((d, i) => d.classList.toggle('on', i === k));
        lis.forEach((li, i) => li.classList.toggle('meio', i === k));
      }); }, { passive: true });
      lis[0] && lis[0].classList.add('meio');
    }
  }

  if (!mesa) return;
  const fun = $('.hc-funil', mesa), fecha = $('.mq-fecha', fun), volta = $('.mq-volta', fun), prog = $('.mq-prog', fun);
  fun.classList.add('mq-gav', 'mq-tela');
  let ultima = null;
  cartas.forEach(c => c.addEventListener('click', () => { ultima = c; if (c.dataset.foto) fun.style.setProperty('--foto', `url("${c.dataset.foto}")`); }));
  const fechar = () => {
    fun.classList.remove('on'); mesa.classList.remove('com-caso');
    cartas.forEach(c => { c.classList.remove('ativo'); c.setAttribute('aria-pressed', 'false'); });
    if (ultima) ultima.focus({ preventScroll: true });
  };
  const sinc = () => {
    const on = fun.classList.contains('on');
    document.body.classList.toggle('mq-gav-on', on);
    clearTimeout(fun._t);
    if (on) document.body.classList.add('mq-gav-sobe'); else fun._t = setTimeout(() => document.body.classList.remove('mq-gav-sobe'), 600);
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (on && !fun._aberta) { fun._aberta = true; fun.scrollTop = 0; setTimeout(() => { const f = $('.hf-ramo', fun) || fecha; f && f.focus({ preventScroll: true }); }, 420); }
    if (!on) fun._aberta = false;
  };
  new MutationObserver(sinc).observe(fun, { attributes: true, attributeFilter: ['class'] });
  const barra = () => {
    const fim = !!$('.hf-fim', fun), ct = $('.hf-cont', fun);
    fun.classList.toggle('fim', fim);
    const txt = fim ? 'Ficha pronta' : (ct ? ct.firstChild.textContent.trim() : '');
    const pv = fim ? 1 : parseFloat((ct && $('.hf-barra', ct)?.style.getPropertyValue('--p')) || 0);
    $('span', prog).textContent = txt; prog.style.setProperty('--p', pv);
    volta.lastChild.textContent = (!fim && !$('.hf-tras:not([data-rec])', fun)) ? ' Voltar aos casos' : ' Voltar';
  };
  let q3 = 0;
  new MutationObserver(() => {
    barra();
    if (!fun.classList.contains('on')) return; clearTimeout(q3);
    q3 = setTimeout(() => {
      if (!fun.classList.contains('fim')) { fun.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); return; }
      const alvo = $('.hf-fim', fun); if (!alvo) return;
      const fr = fun.getBoundingClientRect(), ar = alvo.getBoundingClientRect(), topo = 96;
      if (ar.top > fr.top + fr.height * .6) fun.scrollTo({ top: fun.scrollTop + ar.top - fr.top - topo, behavior: RM ? 'auto' : 'smooth' });
    }, 120);
  }).observe($('.hf-in', fun), { childList: true, subtree: true });
  volta.addEventListener('click', () => {
    const tras = $('.hf-tras:not([data-rec])', fun);
    if (tras) { tras.click(); return; }
    const vs = $$('.hf-volta', fun);
    if ($('.hf-fim', fun) && vs.length) { vs[vs.length - 1].click(); return; }
    fechar();
  });
  fecha.addEventListener('click', fechar);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && fun.classList.contains('on')) fechar(); });
  fun.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || !fun.classList.contains('on')) return;
    const f = $$('button, a[href]', fun).filter(x => x.offsetParent); if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  fun.addEventListener('click', e => { if (e.target.closest('a[href^="#/"],a[data-v^="#/"]')) { fun.classList.remove('on'); mesa.classList.remove('com-caso'); } });
})();
