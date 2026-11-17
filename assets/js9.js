(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const cel = () => innerWidth <= 760;

  const tc = document.createElement('div'); tc.className = 'tx-troca'; tc.setAttribute('aria-hidden', 'true');
  tc.innerHTML = '<i class="tx-tc-onda"></i><div class="tx-tc-selo"><svg viewBox="0 0 200 200"><use href="#i-logo"></use></svg></div>';
  document.body.append(tc);
  const selo = $('.tx-tc-selo', tc), onda = $('.tx-tc-onda', tc);
  let vez = 0;
  const limpa = el => el.getAnimations().forEach(a => a.cancel());
  const fecha = () => {
    vez++;
    if (RM) return Promise.resolve();
    [tc, selo, onda].forEach(limpa);
    tc.style.webkitMaskImage = tc.style.maskImage = 'none';
    tc.classList.add('on');
    const d = cel() ? 210 : 320;
    tc.animate([{ opacity: 0 }, { opacity: 1 }], { duration: d * .55, fill: 'forwards' });
    const a = selo.animate([{ transform: 'scale(2.6) rotate(-30deg)', opacity: 0 }, { transform: 'scale(1) rotate(-6deg)', opacity: 1 }], { duration: d, easing: 'cubic-bezier(.55,0,.85,.4)', fill: 'forwards' });
    return a.finished.then(() => {
      onda.animate([{ transform: 'scale(1)', opacity: .9 }, { transform: 'scale(2.6)', opacity: 0 }], { duration: 560, easing: 'cubic-bezier(.2,.7,.1,1)' });
    });
  };
  const abre = () => {
    const k = vez;
    if (RM) { tc.classList.remove('on'); return Promise.resolve(); }
    document.body.classList.add('mq-chega'); clearTimeout(abre._t); abre._t = setTimeout(() => document.body.classList.remove('mq-chega'), 1200);
    const d = cel() ? 340 : 540, R = Math.hypot(innerWidth, innerHeight) / 2 + 12, t0 = performance.now();
    selo.animate([{ transform: 'scale(1) rotate(-6deg)', opacity: 1 }, { transform: 'scale(1.4) rotate(-6deg)', opacity: 0 }], { duration: d * .7, easing: 'ease-in', fill: 'forwards' });
    return new Promise(ok => {
      const p = t => {
        const x = Math.min(1, (t - t0) / d), r = R * (1 - Math.pow(1 - x, 3));
        tc.style.webkitMaskImage = tc.style.maskImage = `radial-gradient(circle at 50% 50%, transparent ${r.toFixed(1)}px, #000 ${(r + 1).toFixed(1)}px)`;
        if (x < 1) requestAnimationFrame(p); else ok();
      };
      requestAnimationFrame(p);
    }).then(() => { if (k !== vez) return; tc.classList.remove('on'); [tc, selo, onda].forEach(limpa); tc.style.webkitMaskImage = tc.style.maskImage = ''; });
  };
  const instala = () => { window.crTrocaFecha = fecha; window.crTrocaAbre = abre; };
  instala(); document.addEventListener('DOMContentLoaded', instala); addEventListener('load', () => setTimeout(instala, 0));

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    if (el.classList.contains('tx-carta')) setTimeout(() => el.classList.add('abre'), RM ? 0 : 350);
    else el.classList.add('in');
    io.unobserve(el);
  }), { threshold: .18 });
  $$('.tx-meds, .tx-linha, .tx-carta').forEach(el => io.observe(el));
  $$('.tx-linha li').forEach((li, i) => li.style.setProperty('--k', i % 4));

  document.addEventListener('click', e => {
    const b = e.target.closest('.tx-med-gira');
    if (b) {
      const li = b.closest('.tx-med');
      $$('.tx-med.vira').forEach(x => { if (x !== li) x.classList.remove('vira'); });
      li.classList.add('vira');
      const l = $('.tx-med-c a', li); if (l && e.detail === 0) setTimeout(() => l.focus(), 400);
      return;
    }
    if (!e.target.closest('.tx-med')) $$('.tx-med.vira').forEach(x => x.classList.remove('vira'));
  });

  $$('.tx-abas').forEach(ab => {
    const ol = ab.nextElementSibling;
    ab.addEventListener('click', e => {
      const b = e.target.closest('button[data-g]'); if (!b) return;
      $$('button', ab).forEach(x => x.setAttribute('aria-selected', String(x === b)));
      ol.dataset.g = b.dataset.g;
    });
  });

  const waS = $('.tx-wa-selo'), sobe = $('body > .bt-sobe');
  const lei = document.createElement('div'); lei.className = 'tx-lei'; lei.setAttribute('aria-hidden', 'true'); lei.innerHTML = '<i></i>'; document.body.append(lei);
  let q = 0;
  const passo = () => {
    q = 0;
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? Math.min(1, y / h) : 0;
    const pg = $('.pg.atual');
    if (waS) waS.classList.toggle('on', y > innerHeight * .7 && !(pg && pg.dataset.rota === 'contato'));
    if (sobe) sobe.style.setProperty('--p', p.toFixed(3));
    if (pg) {
      const m = $('.tx-medalhao', pg);
      if (m && !RM && y < innerHeight * 1.5) m.style.setProperty('--rot', (y * .06).toFixed(2) + 'deg');
      const art = /^conteudos\/./.test(pg.dataset.rota || '');
      lei.classList.toggle('on', art && y > 80);
      if (art) lei.style.setProperty('--p', p.toFixed(3));
    }
  };
  const pede = () => { if (!q) q = requestAnimationFrame(passo); };
  addEventListener('scroll', pede, { passive: true }); addEventListener('resize', pede); addEventListener('hashchange', () => setTimeout(pede, 700));
  pede();
})();

(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const CELQ = matchMedia('(max-width: 760px)');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const atual = () => $('.pg.atual');

  let nd = 0;
  const dobras = pg => {
    $$('.tx-dobra', pg).forEach((d, i) => {
      if (d._ok) return;
      const h = d.previousElementSibling; if (!h || h.tagName !== 'H2') return;
      d._ok = 1;
      const ab = i === 0, bt = document.createElement('button');
      bt.type = 'button'; bt.className = 'tx-dobra-bt'; d.id = d.id || 'txd' + (++nd);
      bt.setAttribute('aria-controls', d.id); bt.setAttribute('aria-expanded', String(ab));
      while (h.firstChild) bt.appendChild(h.firstChild);
      bt.insertAdjacentHTML('beforeend', '<i aria-hidden="true"></i>');
      h.appendChild(bt); h.classList.add('tx-dobra-h');
      d.classList.toggle('fechada', !ab);
      bt.addEventListener('click', () => abre(d, bt.getAttribute('aria-expanded') !== 'true'));
    });
  };
  const abre = (d, ab) => {
    const bt = d.previousElementSibling && $('.tx-dobra-bt', d.previousElementSibling); if (!bt) return;
    bt.setAttribute('aria-expanded', String(ab)); d.classList.toggle('fechada', !ab);
    if (ab) $$('[data-r]', d).forEach(x => x.classList.add('in'));
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#s"]'); if (!a) return;
    const h = document.getElementById(a.getAttribute('href').slice(1));
    const d = h && h.nextElementSibling;
    if (d && d.classList.contains('tx-dobra') && d.classList.contains('fechada')) abre(d, true);
  }, true);

  const BLOCOS = ['.qm-txt', '.es-txt', '.hp-cab', '.ct-chegar .ch-txt', '.lc-saber .wrap'];
  const PARAS = ['.cab-secao > p', '.hcm-cab > p', '.pz-cab p', '.ar-cab p', '.et-tit p', '.hp-cab > p', '.ch-txt > p.lead', '.pa-txt > p.lead', '.ps-txt > p.lead', '.mp-txt p', '.od-c p', '.tx-med-c p'];
  const botao = (depois, fn) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tx-lermais'; b.setAttribute('aria-expanded', 'false');
    b.innerHTML = 'Ler mais<svg aria-hidden="true"><use href="#i-baixo"></use></svg>';
    b.addEventListener('click', () => { fn(); b.remove(); });
    depois.after(b);
  };
  const resumos = pg => {
    BLOCOS.forEach(s => $$(s, pg).forEach(c => {
      if (c._rs) return;
      const ps = [...c.children].filter(x => x.tagName === 'P' && x.offsetHeight);
      if (ps.length < 2) return;
      const tot = ps.reduce((a, p) => a + p.offsetHeight, 0);
      if (tot < 260) return;
      c._rs = 1;
      ps.slice(1).forEach(p => p.classList.add('tx-oc'));
      ps[0].classList.add('tx-curto');
      botao(ps[0], () => { ps[0].classList.remove('tx-curto'); ps.forEach(p => p.classList.remove('tx-oc')); });
    }));
    PARAS.forEach(s => $$(s, pg).forEach(p => {
      if (p._rs || p.classList.contains('tx-oc') || !p.offsetHeight) return;
      const lh = parseFloat(getComputedStyle(p).lineHeight) || 26;
      if (p.offsetHeight < lh * 5.6) return;
      p._rs = 1; p.classList.add('tx-curto');
      botao(p, () => p.classList.remove('tx-curto'));
    }));
  };

  const ROT = [['tx-areas', 'Áreas'], ['hm-casos', 'Situações'], ['mq-etapas', 'Como funciona'], ['hm-ferr', 'Ferramentas'], ['mq-prazos', 'Prazos'], ['mq-mapa', 'Onde atende'],
    ['mq-artigos', 'Artigos'], ['mq-zap', 'Contato'], ['tx-tempo', 'Trajetória'], ['mq-quem', 'Quem atende'], ['mq-compr', 'Compromissos'], ['mq-es-areas', 'Áreas'], ['mq-onde', 'Onde fica'],
    ['ct-portas', 'Atendimento'], ['ct-como', 'Como funciona'], ['ct-mont-s', 'Mensagem'], ['ct-chegar-s', 'Como chegar'], ['mq-ct-areas', 'Assuntos'], ['ga-sec', 'Assuntos'], ['mq-docs', 'Documentos'],
    ['lc-saber', 'Assuntos'], ['art-leia', 'Artigos'], ['tx-rel', 'Veja também'], ['chamada', 'Fale conosco']];
  const rotulo = s => {
    for (const [c, r] of ROT) if (s.classList.contains(c)) return r;
    if ($('.faq', s)) return 'Dúvidas';
    const h = $('h2', s); if (!h) return '';
    return h.textContent.replace(/\s+/g, ' ').trim().split(/[:?]/)[0].split(' ').slice(0, 3).join(' ');
  };
  const atalhos = pg => {
    if (pg._at !== undefined) return;
    pg._at = null;
    const rota = pg.dataset.rota || '';
    if ($('.mq-secnav', pg) || /^conteudos\//.test(rota) || pg.scrollHeight < innerHeight * 3.4) return;
    const secs = [...pg.children].filter(s => s.tagName === 'SECTION' && s.offsetHeight > 120 && !s.classList.contains('p-topo') && !s.classList.contains('mq-capa'));
    const usados = new Set(), lista = [];
    secs.forEach(s => { const r = rotulo(s); if (r && !usados.has(r)) { usados.add(r); lista.push([s, r]); } });
    if (lista.length < 3) return;
    const nav = document.createElement('nav'); nav.className = 'tx-atalhos'; nav.setAttribute('aria-label', 'Atalhos desta página');
    nav.innerHTML = lista.map(([, r], i) => `<button type="button" data-i="${i}">${r}</button>`).join('');
    const pri = [...pg.children].find(s => s.tagName === 'SECTION');
    pri.after(nav);
    const bts = $$('button', nav);
    bts.forEach((b, i) => b.addEventListener('click', () => {
      const topo = $('.topo'), desce = lista[i][0].getBoundingClientRect().top > 0, alt = (topo && !desce ? topo.offsetHeight : 0) + nav.offsetHeight + 6;
      scrollTo({ top: lista[i][0].getBoundingClientRect().top + scrollY - alt, behavior: RM ? 'auto' : 'smooth' });
    }));
    let q = 0, k = -1;
    const marca = () => {
      q = 0; if (!pg.classList.contains('atual')) return;
      nav.classList.toggle('on', pri.getBoundingClientRect().bottom < 70);
      const lim = innerHeight * .35; let novo = -1;
      lista.forEach(([s], i) => { if (s.getBoundingClientRect().top < lim) novo = i; });
      if (novo !== k) {
        k = novo; bts.forEach((b, i) => b.setAttribute('aria-current', String(i === k)));
        const b = bts[k]; if (b) nav.scrollTo({ left: b.offsetLeft - nav.clientWidth / 2 + b.offsetWidth / 2, behavior: RM ? 'auto' : 'smooth' });
      }
    };
    addEventListener('scroll', () => { if (!q) q = requestAnimationFrame(marca); }, { passive: true });
    pg._at = nav; marca();
  };

  const monta = () => {
    const pg = atual(); if (!pg) return;
    if (!CELQ.matches) return;
    dobras(pg); resumos(pg); atalhos(pg);
  };
  const depois = () => { setTimeout(monta, 750); setTimeout(monta, 1600); };
  addEventListener('hashchange', depois);
  if (document.readyState === 'complete') depois(); else addEventListener('load', depois);
  CELQ.addEventListener('change', monta);
})();

(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const PM = $('.painel-menu');

  if (PM) {
    const rola = $('.pm-rola', PM), gs = $$('.tx-mg', PM);
    const mostra = g => {
      if (!rola) return;
      const r = g.getBoundingClientRect(), rr = rola.getBoundingClientRect();
      if (r.bottom > rr.bottom - 8) rola.scrollBy({ top: Math.min(r.top - rr.top - 6, r.bottom - rr.bottom + 12), behavior: RM ? 'auto' : 'smooth' });
    };
    const abreG = (g, v, inst) => {
      g.classList.toggle('ab', v);
      $('.tx-mg-b', g).setAttribute('aria-expanded', String(v));
      if (v && !inst) setTimeout(() => mostra(g), RM ? 0 : 320);
    };
    gs.forEach(g => $('.tx-mg-b', g).addEventListener('click', () => {
      const v = !g.classList.contains('ab');
      gs.forEach(o => { if (o !== g && o.classList.contains('ab')) abreG(o, false, true); });
      abreG(g, v);
    }));

    const semIndex = p => p.replace(/index\.html$/, '');
    const rotaAtual = () => {
      if (typeof window.TX_ROTA === 'string') return window.TX_ROTA;
      const pg = $('section.pg.atual'); return pg ? (pg.dataset.rota || '') : '';
    };
    const ehAqui = a => {
      const h = a.getAttribute('href') || '';
      if (/^(https?:|tel:|mailto:)/i.test(h) && !a.href.startsWith(location.origin)) return false;
      if (h.indexOf('#/') === 0) return h.slice(2).replace(/\/+$/, '') === rotaAtual();
      try { const u = new URL(a.href, location.href); return !u.hash && semIndex(u.pathname) === semIndex(location.pathname); } catch (e) { return false; }
    };
    const marca = () => {
      let alvo = null;
      gs.forEach(g => g.classList.remove('aqui'));
      $$('.tx-mn .tx-ml', PM).forEach(a => {
        const v = ehAqui(a);
        if (v) { a.setAttribute('aria-current', 'page'); alvo = alvo || a; } else a.removeAttribute('aria-current');
      });
      const r = rotaAtual().split('/')[0];
      gs.forEach(g => { if (g.dataset.g === r) g.classList.add('aqui'); });
      const gAlvo = alvo && alvo.closest('.tx-mg');
      gs.forEach(g => abreG(g, g === gAlvo, true));
      if (gAlvo) { gAlvo.classList.add('aqui'); requestAnimationFrame(() => requestAnimationFrame(() => mostra(gAlvo))); }
    };
    let aberto = false;
    new MutationObserver(() => {
      const ab = document.body.classList.contains('menu-aberto');
      if (ab && !aberto) { aberto = true; marca(); } else if (!ab) aberto = false;
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  const faixa = el => {
    const max = el.scrollWidth - el.clientWidth;
    el.classList.toggle('tx-mais-d', max > 4 && el.scrollLeft < max - 4);
    el.classList.toggle('tx-mais-e', max > 4 && el.scrollLeft > 4);
  };
  const todas = () => $$('.tx-atalhos, .mq-secnav .sn-in').forEach(faixa);
  document.addEventListener('scroll', e => { const t = e.target; if (t && t.nodeType === 1 && t.matches('.tx-atalhos, .sn-in')) faixa(t); }, { capture: true, passive: true });
  addEventListener('resize', todas, { passive: true });
  addEventListener('load', () => { todas(); setTimeout(todas, 900); setTimeout(todas, 1900); });
})();

(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('.tx-mapa').forEach(sec => {
    const abas = $$('.mp-aba', sec), ps = $$('.mp-p', sec);
    const vai = (k, foco) => {
      abas.forEach((a, i) => { a.setAttribute('aria-selected', String(i === k)); a.tabIndex = i === k ? 0 : -1; });
      ps.forEach(p => p.classList.toggle('on', +p.dataset.p === k));
      sec.dataset.modo = String(k);
      if (foco) abas[k].focus();
    };
    abas.forEach((a, i) => {
      a.addEventListener('click', () => vai(+a.dataset.ir || i));
      a.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault(); vai((i + (e.key === 'ArrowRight' ? 1 : abas.length - 1)) % abas.length, true);
      });
    });
    vai(Math.max(0, abas.findIndex(a => a.getAttribute('aria-selected') === 'true')));
  });

  const ajusta = d => {
    d.style.setProperty('--dx', '0px');
    const r = d.getBoundingClientRect(), m = 16;
    let dx = 0;
    if (r.left < m) dx = m - r.left; else if (r.right > innerWidth - m) dx = innerWidth - m - r.right;
    d.style.setProperty('--dx', Math.round(dx) + 'px');
  };
  $$('.topo .drop').forEach(d => {
    new MutationObserver(() => { if (d.classList.contains('aberto')) ajusta(d); }).observe(d, { attributes: true, attributeFilter: ['class'] });
    const li = d.closest('li');
    if (li) ['mouseenter', 'focusin'].forEach(t => li.addEventListener(t, () => requestAnimationFrame(() => ajusta(d))));
  });
  addEventListener('resize', () => $$('.topo .drop.aberto').forEach(ajusta), { passive: true });

  if (!RM && matchMedia('(hover:hover)').matches) {
    $$('.ps-topo').forEach(t => {
      const c = $('.tx-m-c', t); if (!c) return;
      let q = 0;
      t.addEventListener('pointermove', e => {
        if (q) return;
        q = requestAnimationFrame(() => {
          q = 0; const r = t.getBoundingClientRect();
          c.style.setProperty('--tx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
          c.style.setProperty('--ty', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        });
      });
      t.addEventListener('pointerleave', () => { c.style.setProperty('--tx', 0); c.style.setProperty('--ty', 0); });
    });
  }
})();
