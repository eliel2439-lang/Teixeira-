(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINO = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const WA = m => 'https://wa.me/5511949865516?text=' + encodeURIComponent(m);
  const dataBR = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const nav = $('.topo .nav'), ind = $('.nav-ind', nav || document);
  if (nav && ind) {
    let hov = null;
    const vai = el => { const n = nav.getBoundingClientRect(), r = el.getBoundingClientRect(); ind.style.setProperty('--x', (r.left - n.left + 10) + 'px'); ind.style.setProperty('--w', Math.max(0, r.width - 20) + 'px'); if (!nav.classList.contains('ind-on')) nav.classList.add('ind-on'); };
    const ativo = () => { if (hov) return; const a = $('.nav-l.ativo', nav); if (a && a.offsetParent) vai(a); else if (nav.classList.contains('ind-on')) nav.classList.remove('ind-on'); };
    $$('.nav-l', nav).forEach(l => { l.addEventListener('mouseenter', () => { hov = l; vai(l); }); l.addEventListener('focus', () => vai(l)); l.addEventListener('blur', () => setTimeout(ativo, 60)); });
    nav.addEventListener('mouseleave', () => { hov = null; setTimeout(ativo, 60); });
    new MutationObserver(rs => { if (rs.some(r => r.target !== nav && r.target.classList.contains('nav-l'))) ativo(); }).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });
    addEventListener('resize', ativo); addEventListener('load', ativo); ativo();
  }

  $$('.mq-mesa2').forEach(sec => {
    const lista = $('.hc-lista', sec), cartas = $$('.hc-item', sec), fun = $('.hc-funil', sec);
    if (!lista || !fun) return;
    lista._vm = 1; lista.classList.remove('vm', 'vm-fechado');
    [...lista.children].forEach(li => li.classList.remove('vm-x'));
    const vb = lista.nextElementSibling; if (vb && vb.classList.contains('vm-bt')) vb.remove();
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { lista.classList.add('mq-vis'); io.disconnect(); } }), { threshold: .1 });
    io.observe(lista);
    const dots = $('.mq-dots', sec);
    if (dots) {
      const lis = $$('li', lista); dots.innerHTML = lis.map(() => '<i></i>').join(''); const ds = $$('i', dots);
      ds[0] && ds[0].classList.add('on'); lis[0] && lis[0].classList.add('meio');
      let q = 0;
      lista.addEventListener('scroll', () => { if (q) return; q = requestAnimationFrame(() => {
        q = 0; const L = lista.getBoundingClientRect(), cx = L.left + L.width / 2; let k = 0, best = 1e9;
        lis.forEach((li, i) => { const r = li.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - cx); if (d < best) { best = d; k = i; } });
        ds.forEach((d, i) => d.classList.toggle('on', i === k)); lis.forEach((li, i) => li.classList.toggle('meio', i === k));
      }); }, { passive: true });
    }
    const fecha = $('.mq-fecha', fun), volta = $('.mq-volta', fun), prog = $('.mq-prog', fun);
    let ultima = null;
    cartas.forEach(c => c.addEventListener('click', () => { ultima = c; if (c.dataset.foto) fun.style.setProperty('--foto', `url("${c.dataset.foto}")`); }));
    const fechar = () => {
      fun.classList.remove('on'); sec.classList.remove('com-caso');
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
      $('span', prog).textContent = fim ? 'Ficha pronta' : (ct ? ct.firstChild.textContent.trim() : '');
      prog.style.setProperty('--p', fim ? 1 : parseFloat((ct && $('.hf-barra', ct)?.style.getPropertyValue('--p')) || 0));
      volta.lastChild.textContent = (!fim && !$('.hf-tras:not([data-rec])', fun)) ? ' Voltar aos casos' : ' Voltar';
    };
    const hin = $('.hf-in', fun); let q3 = 0;
    if (hin) new MutationObserver(() => {
      barra(); if (!fun.classList.contains('on')) return; clearTimeout(q3);
      q3 = setTimeout(() => {
        if (!fun.classList.contains('fim')) { fun.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); return; }
        const alvo = $('.hf-fim', fun); if (!alvo) return;
        const fr = fun.getBoundingClientRect(), ar = alvo.getBoundingClientRect();
        if (ar.top > fr.top + fr.height * .6) fun.scrollTo({ top: fun.scrollTop + ar.top - fr.top - 96, behavior: RM ? 'auto' : 'smooth' });
      }, 120);
    }).observe(hin, { childList: true, subtree: true });
    volta.addEventListener('click', () => {
      const tras = $('.hf-tras:not([data-rec])', fun); if (tras) { tras.click(); return; }
      const vs = $$('.hf-volta', fun); if ($('.hf-fim', fun) && vs.length) { vs[vs.length - 1].click(); return; }
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
    fun.addEventListener('click', e => { if (e.target.closest('a[href^="#/"],a[data-v^="#/"]')) { fun.classList.remove('on'); sec.classList.remove('com-caso'); } });
  });
  addEventListener('hashchange', () => { if (!$('.hc-funil.mq-tela.on')) { document.documentElement.style.overflow = ''; document.body.classList.remove('mq-gav-on', 'mq-gav-sobe'); } });

  $$('.mq-docs').forEach(sec => {
    const ls = $$('.dc-l', sec), abas = $$('.dc-aba', sec), cont = $('.dc-cont', sec), bt = $('.dc-wa', sec);
    const atual = () => ls.find(l => !l.hidden) || ls[0];
    const conta = () => {
      const l = atual(), bs = $$('button', l), tem = bs.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.textContent.trim()), falta = bs.filter(b => b.getAttribute('aria-pressed') !== 'true').map(b => b.textContent.trim());
      $('span', cont).textContent = tem.length ? (tem.length === bs.length ? 'Todos os documentos separados' : `${tem.length} de ${bs.length} separados`) : 'Nenhum documento marcado';
      $('b', cont).style.width = (tem.length / bs.length * 100) + '%';
      let m = `Olá! Vim pelo site da Advocacia Teixeira Mendes. Quero orientação sobre ${l.dataset.t}.`;
      if (tem.length) m += `\n\n*Já tenho:*\n${tem.map(t => '- ' + t).join('\n')}`;
      if (tem.length && falta.length) m += `\n\n*Ainda falta:*\n${falta.map(t => '- ' + t).join('\n')}`;
      bt.href = WA(m);
    };
    ls.forEach(l => $$('button', l).forEach(b => b.addEventListener('click', () => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); conta(); })));
    abas.forEach(a => a.addEventListener('click', () => {
      abas.forEach(x => x.setAttribute('aria-pressed', String(x === a)));
      ls.forEach(l => { l.hidden = l.dataset.g !== a.dataset.g; }); conta();
    }));
    conta();
  });

  $$('.mq-pza').forEach(sec => {
    const chips = $$('.pza-chip', sec), cards = $$('.pza-c', sec), inp = $('.pza-data input', sec), res = $('.pza-res', sec), bt = $('.pza-wa', sec);
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    inp.max = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    let sel = chips.find(c => c.getAttribute('aria-pressed') === 'true') || chips[0];
    const soma = (d, r) => { const x = new Date(d), m = /^([dma])(\d+)$/.exec(r || ''); if (m) { const n = +m[2]; if (m[1] === 'd') x.setDate(x.getDate() + n); else if (m[1] === 'm') x.setMonth(x.getMonth() + n); else x.setFullYear(x.getFullYear() + n); } return x; };
    const calc = () => {
      cards.forEach(c => { c.hidden = c.dataset.regra !== sel.dataset.regra; });
      res.classList.remove('passou');
      if (!inp.value) { res.textContent = `Informe a data ${sel.dataset.de} para ver a data-limite aproximada.`; bt.href = WA(`Olá! Vim pelo site da Advocacia Teixeira Mendes. Tenho uma dúvida sobre o prazo de ${sel.dataset.n}.`); return; }
      const [y, m, d] = inp.value.split('-').map(Number), ini = new Date(y, m - 1, d); if (isNaN(ini)) return;
      if (ini > hoje) { res.textContent = 'A data informada ainda não chegou. Confira o dia, o mês e o ano.'; return; }
      const fim = soma(ini, sel.dataset.regra), falta = Math.round((fim - hoje) / 864e5);
      if (falta >= 0) res.innerHTML = `Contando a partir ${sel.dataset.de}, em ${dataBR(ini)}, o prazo geral de ${sel.dataset.n} termina em <b>${dataBR(fim)}</b>. ${falta === 0 ? '<b>Termina hoje.</b>' : `Faltam <b>${falta} ${falta === 1 ? 'dia' : 'dias'}</b>.`}`;
      else { res.classList.add('passou'); res.innerHTML = `Pela data informada, o prazo geral de ${sel.dataset.n} terminou em <b>${dataBR(fim)}</b>. Converse com a advogada para avaliar o seu caso.`; }
      bt.href = WA(`Olá! Vim pelo site da Advocacia Teixeira Mendes. Tenho uma dúvida sobre o prazo de ${sel.dataset.n}. Aconteceu em ${dataBR(ini)}.`);
    };
    chips.forEach(c => c.addEventListener('click', () => { chips.forEach(x => x.setAttribute('aria-pressed', String(x === c))); sel = c; calc(); }));
    inp.addEventListener('change', calc); inp.addEventListener('input', () => { if (inp.value.length === 10) calc(); });
    calc();
  });

  const ret = $('#mq-ret-b') || $('.mq-capa .mc-ret img');
  if (ret) $$('.ch-ret-img').forEach(i => { if (!i.getAttribute('src')) i.src = ret.src; });
})();
