(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CEL = matchMedia('(max-width: 760px)'), TAB = matchMedia('(max-width: 980px)');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const CAR = ['.tx-meds', '.tx-linha', '.artigos', '.mq-terr .ct-paineis', '.et-pista', '.pz-cards', '.mq-canais', '.mq-tiles', '.cp-g', '.mq-passos', '.ar-grade',
    '.hm-ferr-g', '.hp-portas', '.hcm-dir', '.ferr', '.hm-arts', '.er-jeito', '.caminho-h', '.eq-g', '.ga-cards', '.sp-pontos', '.bb-grade', '.af-rel', '.ep-cards', '.lc-blocos'].join(',');
  const carrossel = el => {
    if (el._car || el.closest('.mq-car')) return;
    const itens = [...el.children].filter(c => !c.matches('i,b,.crs-ui,.hcm-fim,.ab-ind,[hidden],.ps-fio,.ar-dots,.mq-car-ui'));
    if (itens.length < 2) return;
    el._car = 1; el.classList.add('mq-car');
    const n = itens.length;
    el.setAttribute('aria-roledescription', 'carrossel');
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    const ui = document.createElement('div'); ui.className = 'mq-car-ui'; ui.style.setProperty('--n', n);
    ui.innerHTML = `<span class="mc-n" aria-live="polite"><b>01</b> de ${String(n).padStart(2, '0')}</span><span aria-hidden="true" class="mc-barra"><i></i></span><span class="mc-pts">${itens.map((_, i) => `<button aria-label="Ir para o cartão ${i + 1} de ${n}" type="button"></button>`).join('')}</span>`;
    el.after(ui);
    const bts = $$('button', ui), nb = $('b', ui);
    let k = -1, q = 0;
    const vai = i => { const it = itens[clamp(i, 0, n - 1)]; el.scrollTo({ left: it.offsetLeft - (el.clientWidth - it.offsetWidth) / 2, behavior: RM ? 'auto' : 'smooth' }); };
    bts.forEach((b, i) => b.addEventListener('click', () => vai(i)));
    el.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); vai(k + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); vai(k - 1); } });
    const passo = () => {
      q = 0; if (!CEL.matches) return;
      const r = el.getBoundingClientRect(); if (!r.width) return;
      const cx = r.left + r.width / 2; let best = 1e9, bi = 0;
      itens.forEach((it, i) => {
        const a = it.getBoundingClientRect(), d = (a.left + a.width / 2 - cx) / Math.max(1, a.width);
        if (Math.abs(d) < best) { best = Math.abs(d); bi = i; }
        if (!RM) { const ad = Math.min(1, Math.abs(d)); it.style.setProperty('--sc', (1 - ad * .09).toFixed(3)); it.style.setProperty('--op', (1 - ad * .42).toFixed(3)); it.style.setProperty('--ry', (clamp(-d, -1, 1) * 11).toFixed(2) + 'deg'); }
      });
      if (bi !== k) { k = bi; nb.textContent = String(k + 1).padStart(2, '0'); ui.style.setProperty('--k', k); bts.forEach((b, i) => b.setAttribute('aria-current', String(i === k))); }
    };
    el.addEventListener('scroll', () => { if (!q) q = requestAnimationFrame(passo); }, { passive: true });
    addEventListener('resize', () => { if (!q) q = requestAnimationFrame(passo); });
    passo(); setTimeout(passo, 500);
    el._carPasso = passo;
  };
  const montaCar = () => { if (!CEL.matches) return; $$(CAR).forEach(carrossel); $$('.mq-car').forEach(c => c._carPasso && c._carPasso()); };

  const minFonte = () => {
    if (!CEL.matches) return;
    [$('.pg.atual'), $('footer'), $('.topo')].filter(Boolean).forEach(r => $$('small,span,b,em,a,p,li,label,strong,button,dt,dd,h4', r).forEach(e => {
      if (e._mf || e.closest('nav.barra,svg,.mq-car-ui')) return;
      if (![...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim().length > 1)) return;
      const fs = parseFloat(getComputedStyle(e).fontSize);
      if (fs && fs < 11.9) { e.style.fontSize = '12px'; e._mf = 1; }
    }));
  };

  const mp = $('.mq-mapa');
  if (mp) {
    const leg = $('.mp-leg0', mp), leg0 = leg ? leg.textContent : '';
    const ajusta = () => { mp.classList.toggle('toque', CEL.matches); if (leg) leg.textContent = CEL.matches ? 'Toque nas abas para ir do Brasil até Santo Amaro' : leg0; };
    ajusta(); CEL.addEventListener('change', ajusta);
  }

  $$('.mq-ver-cartao').forEach(b => b.addEventListener('click', () => {
    const c = b.closest('.ct-comp'), on = !c.classList.contains('cartao-on');
    c.classList.toggle('cartao-on', on); b.setAttribute('aria-expanded', String(on));
    b.lastChild.textContent = on ? 'Fechar cartão de contato' : 'Ver cartão de contato';
  }));

  const topo = $('.topo');
  $$('.mq-secnav').forEach(nav => {
    const bts = $$('button', nav), alvos = bts.map(b => document.getElementById(b.dataset.alvo));
    bts.forEach((b, i) => b.addEventListener('click', () => {
      const a = alvos[i]; if (!a) return;
      const off = nav.offsetHeight + Math.max(0, topo ? topo.getBoundingClientRect().bottom : 0) + 8;
      scrollTo({ top: a.getBoundingClientRect().top + scrollY - off, behavior: RM ? 'auto' : 'smooth' });
    }));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const i = alvos.indexOf(e.target);
      bts.forEach((b, j) => b.classList.toggle('on', j === i));
      const b = bts[i]; if (b) { const s = b.parentElement; s.scrollTo({ left: b.offsetLeft - 20, behavior: RM ? 'auto' : 'smooth' }); }
    }), { rootMargin: '-30% 0px -60% 0px' });
    alvos.forEach(a => a && io.observe(a));
  });
  let qn = 0;
  const poeNav = () => { qn = 0; const b = topo ? Math.max(0, Math.round(topo.getBoundingClientRect().bottom)) : 0; document.documentElement.style.setProperty('--sn-top', b + 'px'); };
  addEventListener('scroll', () => { if (!qn) qn = requestAnimationFrame(poeNav); }, { passive: true }); poeNav();

  $$('.mq-docs .dc-caixa').forEach(cx => {
    const rod = $('.dc-rod', cx); if (!rod) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'dc-mais'; b.textContent = 'Ver todos os documentos';
    rod.before(b);
    b.addEventListener('click', () => cx.classList.add('todos'));
  });

  $$('.mq-prazos .pz-calc, .mq-pza .pza-calc').forEach(c => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-linha mq-calc-tg';
    b.innerHTML = '<svg aria-hidden="true"><use href="#i-calendario"></use></svg>Calcular a minha data-limite';
    c.before(b); b.addEventListener('click', () => { c.classList.add('aberta'); b.remove(); const i = c.querySelector('input'); i && i.focus({ preventScroll: true }); });
  });

  const fechaFs = f => { f.classList.remove('mq-aberto'); document.documentElement.style.overflow = ''; document.body.classList.remove('mq-fs-on'); };
  $$('.mq-fs-abre').forEach(b => b.addEventListener('click', () => {
    const f = $('.mq-fs', b.closest('.ps-topo')); if (!f) return;
    f.classList.add('mq-aberto'); document.body.classList.add('mq-fs-on'); document.documentElement.style.overflow = 'hidden'; f.scrollTop = 0;
    setTimeout(() => { const x = $('.mq-fs-x', f); x && x.focus({ preventScroll: true }); }, 60);
  }));
  $$('.mq-fs').forEach(f => {
    $('.mq-fs-x', f).addEventListener('click', () => fechaFs(f));
    f.addEventListener('click', e => { if (e.target.closest('a[href^="#/"],a[data-v^="#/"]')) fechaFs(f); });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.mq-fs.mq-aberto').forEach(fechaFs); });
  addEventListener('hashchange', () => $$('.mq-fs.mq-aberto').forEach(fechaFs));

  const fqGs = $$('.fq2-g');
  if (fqGs.length) {
    fqGs.forEach((g, i) => {
      const h = $('.fq2-h', g); if (!h) return;
      const n = $$('.fq2-i', g).length, t = h.textContent;
      h.innerHTML = `<button aria-expanded="${i === 0}" class="fq-tg" type="button"><span>${t}</span><small>${n}</small><i aria-hidden="true"></i></button>`;
      if (i > 0 && CEL.matches) g.classList.add('fq-fechado');
      $('.fq-tg', h).addEventListener('click', e => { const on = g.classList.toggle('fq-fechado'); e.currentTarget.setAttribute('aria-expanded', String(!on)); });
    });
    const abreTodos = () => fqGs.forEach(g => { g.classList.remove('fq-fechado'); const b = $('.fq-tg', g); b && b.setAttribute('aria-expanded', 'true'); });
    const inp = $('.fq2-topo input[type=search]');
    if (inp) inp.addEventListener('input', () => { if (inp.value.trim()) abreTodos(); });
    $$('.fq2-s .bb-filtro .bb-p').forEach(b => b.addEventListener('click', () => { if (b.dataset.f) abreTodos(); }));
    document.addEventListener('click', e => { if (e.target.closest('.fq2-topo .bc-s')) abreTodos(); });
  }

  $$('.rodape .rd-gr').forEach(g => {
    const h = $(':scope > h4', g); if (!h) return;
    const t = h.textContent;
    h.innerHTML = `<button aria-expanded="false" class="rd-tg" type="button">${t}<i aria-hidden="true"></i></button>`;
    const sinc = () => { const fecha = CEL.matches && !g._aberto; g.classList.toggle('rd-fechado', fecha); $('.rd-tg', h).setAttribute('aria-expanded', String(!fecha)); };
    $('.rd-tg', h).addEventListener('click', () => { if (!CEL.matches) return; g._aberto = !g._aberto; sinc(); });
    sinc(); CEL.addEventListener('change', sinc);
  });

  const acerta = () => { montaCar(); minFonte(); };
  setTimeout(acerta, 350);
  addEventListener('hashchange', () => setTimeout(acerta, 750));
  CEL.addEventListener('change', () => setTimeout(acerta, 100));
})();
