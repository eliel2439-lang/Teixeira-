(() => {
'use strict';
const D = JSON.parse(document.getElementById('dados').textContent);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINO = matchMedia('(pointer: fine)').matches;
const CELQ = matchMedia('(max-width:760px), (max-height:520px) and (max-width:1000px) and (pointer:coarse)');
const CEL = () => CELQ.matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const OLA = 'Olá! Vim pelo site da Advocacia Teixeira Mendes.';
const sepOla = t => String(t || '').replace(/^Olá! Vim pelo site da Advocacia Teixeira Mendes e (\S)/, (m, c) => OLA + '\n\n' + c.toUpperCase()).replace(/^Olá! Vim pelo site da Advocacia Teixeira Mendes\. +/, OLA + '\n\n').replace(/^Olá! Vim pelo site da Advocacia Teixeira Mendes\. *$/, OLA);
const fraseDe = t => sepOla(t).replace(/^Olá! Vim pelo site da Advocacia Teixeira Mendes\.\s*/, '').trim();
const rotMsg = r => { r = String(r).trim().replace(/[:?]$/, ''); return /^(qual|quais|quando|quanto|quantos|quantas|como|onde|o que|há|você|tem|já|foi|existe)\b/i.test(r) ? `*${r}?*` : `*${r}:*`; };
const linhaMsg = (r, v) => `${rotMsg(r)} ${v}`;
const listaMsg = (tit, it) => it.length ? `*${tit}*\n- ${it.join('\n- ')}` : '';
const montaMsg = (partes, ola = OLA) => [ola, ...partes].map(p => Array.isArray(p) ? p.filter(Boolean).join('\n') : p).filter(Boolean).join('\n\n');
const WA = t => 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent(sepOla(t));
const raiz = document.documentElement;
let pagina = null;
let vh = innerHeight;
addEventListener('resize', () => { vh = innerHeight; }, { passive: true });

const balancas = new Map();
class Balanca {
  constructor(svg) {
    this.svg = svg; this.beam = $('.lg-beam', svg); this.pl = $('.lg-pan-l', svg); this.pr = $('.lg-pan-r', svg);
    this.a = 0; this.v = 0; this.alvo = 0; this.vis = false; this.k = 34; this.c = 4.6;
  }
  impulso(x) { if (RM) return; this.v = clamp(this.v + x, -90, 90); acordar(); }
  mira(a) { this.alvo = a; if (RM) { this.a = a; this.render(); } else acordar(); }
  passo(dt) {
    const acc = -this.k * (this.a - this.alvo) - this.c * this.v;
    this.v += acc * dt; this.a = clamp(this.a + this.v * dt, -18, 18); this.render();
    return Math.abs(this.v) > .02 || Math.abs(this.a - this.alvo) > .02;
  }
  render() {
    if (!this.beam) return;
    const r = this.a * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r), ex = 50, ey = 12.6;
    const lx = -ex * cs - ey * sn, ly = -ex * sn + ey * cs, rx = ex * cs - ey * sn, ry = ex * sn + ey * cs;
    this.beam.setAttribute('transform', `rotate(${this.a.toFixed(3)} 100 64)`);
    this.pl.setAttribute('transform', `translate(${(lx + ex).toFixed(3)} ${(ly - ey).toFixed(3)})`);
    this.pr.setAttribute('transform', `translate(${(rx - ex).toFixed(3)} ${(ry - ey).toFixed(3)})`);
  }
}
const ioBal = new IntersectionObserver(es => es.forEach(e => { const b = balancas.get(e.target); if (b) { b.vis = e.isIntersecting; if (b.vis) acordar(); } }));
function bal(svg) {
  if (!svg) return null;
  if (!balancas.has(svg)) { const b = new Balanca(svg); balancas.set(svg, b); ioBal.observe(svg); }
  return balancas.get(svg);
}
let rodando = false, ultimo = 0;
function acordar() { if (rodando || RM) return; rodando = true; ultimo = performance.now(); requestAnimationFrame(laco); }
function laco(t) {
  const dt = Math.min(.033, (t - ultimo) / 1000); ultimo = t; let ativo = false;
  balancas.forEach(b => { if (b.vis && b.passo(dt)) ativo = true; });
  if (ativo) requestAnimationFrame(laco); else rodando = false;
}

function abertura() {
  const ab = $('#abertura');
  if (!ab || raiz.classList.contains('ab-visto') || RM) { if (ab) ab.classList.add('fim'); return Promise.resolve(); }
  try { sessionStorage.setItem('kx-ab', '1'); } catch (e) {}
  const b = bal($('svg', ab)); b.a = -16; b.vis = true; b.render();
  setTimeout(() => acordar(), 650);
  const heroi = $('.pg.atual .hm-heroi');
  if (heroi) heroi.classList.add('espera');
  return new Promise(res => {
    let feito = false;
    const fim = () => {
      if (feito) return; feito = true;
      const circ = heroi && $('.hm-circ', heroi), lg = $('.ab-logo', ab);
      if (circ && circ.offsetWidth) {
        const a = lg.getBoundingClientRect(), c = circ.getBoundingClientRect();
        const s = (c.width * 1.038) / (a.width * .91), dx = (c.left + c.width / 2) - (a.left + a.width / 2), dy = (c.top + c.height / 2) - (a.top + a.height / 2);
        ab.classList.add('voa'); lg.style.transform = `translate3d(${dx}px,${dy}px,0) scale(${s})`;
        setTimeout(() => { heroi.classList.add('ja-anel', 'chegou'); heroi.classList.remove('espera'); }, 650);
        setTimeout(() => { ab.classList.add('fim'); res(); }, 1150);
        return;
      }
      if (heroi) setTimeout(() => { heroi.classList.remove('espera'); heroi.classList.add('chegou'); }, 700);
      ab.classList.add('fio');
      setTimeout(() => ab.classList.add('abre'), 480);
      setTimeout(() => { ab.classList.add('fim'); res(); }, 1500);
    };
    setTimeout(fim, CEL() ? 950 : 1750);
    $('.ab-pular', ab).addEventListener('click', fim);
  });
}

const topo = $('.topo');
let yAnt = scrollY;
function topoRolagem(y) {
  topo.classList.toggle('solido', y > 24);
  const menuAberto = document.body.classList.contains('menu-aberto');
  if (!menuAberto && y > yAnt + 6 && y > 320) topo.classList.add('some');
  else if (y < yAnt - 6 || y < 320) topo.classList.remove('some');
  if (btSobe) { const v = y > innerHeight * 2.2; if (btSobe.hidden === v) btSobe.hidden = !v; }
  raiz.classList.toggle('topo-fora', topo.classList.contains('some'));
}
const btSobe = $('.bt-sobe');
btSobe && btSobe.addEventListener('click', () => { scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); const h1 = pagina && $('h1', pagina); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); } });

$$('[data-drop]').forEach(bt => {
  const dd = bt.nextElementSibling; let tmr;
  const abre = () => { clearTimeout(tmr); fecharDrops(bt); bt.setAttribute('aria-expanded', 'true'); dd.classList.add('aberto'); };
  const fecha = () => { bt.setAttribute('aria-expanded', 'false'); dd.classList.remove('aberto'); };
  bt.addEventListener('click', e => { e.stopPropagation(); bt.getAttribute('aria-expanded') === 'true' ? fecha() : abre(); });
  if (FINO) {
    bt.parentElement.addEventListener('mouseenter', abre);
    bt.parentElement.addEventListener('mouseleave', () => { tmr = setTimeout(fecha, 220); });
  }
  dd.addEventListener('click', e => { if (e.target.closest('a')) fecha(); });
});
function fecharDrops(exceto) { $$('[data-drop]').forEach(b => { if (b !== exceto) { b.setAttribute('aria-expanded', 'false'); b.nextElementSibling.classList.remove('aberto'); } }); }
document.addEventListener('click', () => fecharDrops());
addEventListener('keydown', e => { if (e.key === 'Escape') { if (PAL.aberto) { fecharPalco(); return; } if (termoAt) { const t = termoAt; fechaTermo(); t.focus(); return; } fecharDrops(); fecharMenu(); fecharTriagem(); } });


const paginas = new Map($$('.pg').map(p => [p.dataset.rota, p]));
const metaDesc = $('meta[name="description"]');
const ogT = $('meta[property="og:title"]'), ogD = $('meta[property="og:description"]');
const ogU = $('meta[property="og:url"]'), twT = $('meta[name="twitter:title"]'), twD = $('meta[name="twitter:description"]'), robo = $('meta[name="robots"]'), roboBase = robo ? robo.getAttribute('content') : '';
function rotaAtual() {
  const h = location.hash;
  if (!h || h === '#') return (document.documentElement.getAttribute('data-pag')||'');
  if (h === '#/') return '';
  if (!h.startsWith('#/')) return null;
  let r = decodeURIComponent(h.slice(2)); const q = r.indexOf('?');
  if (q > -1) { const p = new URLSearchParams(r.slice(q + 1)); if (p.has('aba')) { const v = p.get('aba'); abaPedida = isNaN(+v) ? v : +v; } if (p.has('ancora')) ancoraPedida = p.get('ancora'); r = r.slice(0, q); history.replaceState(history.state, '', location.pathname + location.search); }
  return r.replace(/\/+$/, '');
}
const troca = $('.troca');
function fecharTroca() { if (window.crTrocaFecha) return window.crTrocaFecha(); return new Promise(r => { troca.classList.add('fecha'); setTimeout(r, CEL() ? 300 : 620); }); }
function abrirTroca() { if (window.crTrocaAbre) return window.crTrocaAbre(); requestAnimationFrame(() => troca.classList.remove('fecha')); }
let navegando = false;
const POS = {}; let idxPag = 0, idxMax = 0;
try { idxMax = +sessionStorage.getItem('kx-idx') || 0; } catch (e) {}
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
let abaPedida = null, ancoraPedida = null;
async function ir(primeira) {
  let r = rotaAtual(); if (r === null) return;
  if (pagina && !navegando) POS[idxPag] = scrollY;
  if (PAL.aberto) { if (r.startsWith('ferramentas/')) return; fecharPalco(true); }
  if (!paginas.has(r) && D.redir && D.redir[r]) {
    const x = D.redir[r]; r = x[0];
    if (x[1] !== null) abaPedida = x[1];
    if (x[2]) ancoraPedida = x[2];
    history.replaceState(null, '', '#/' + r);
  }
  const pg = paginas.get(r) || paginas.get('404') || paginas.get((document.documentElement.getAttribute('data-pag')||''));
  if (pg === pagina || navegando) { if (pg === pagina && typeof abaPedida === 'string') { const a = abaPedida; abaPedida = null; abrirPalco(a); } if (pg === pagina && ancoraPedida) { const id = ancoraPedida; ancoraPedida = null; irAncora(id, true); } return; }
  navegando = true;
  const stH = history.state || {}; let idx = stH.idx; const volta = !!idx && !primeira;
  if (!idx) { idx = ++idxMax; try { sessionStorage.setItem('kx-idx', idxMax); } catch (e) {} history.replaceState(Object.assign({}, stH, { idx }), ''); }
  idxPag = idx;
  fecharTriagem(true); fecharMenu(); fecharDrops();
  if (!primeira && !RM) await fecharTroca();
  if (pagina) { pagina.classList.remove('atual'); desmontar(pagina); }
  pg.classList.add('atual'); pagina = pg;
  document.title = pg.dataset.title; metaDesc.setAttribute('content', pg.dataset.desc);
  ogT && ogT.setAttribute('content', pg.dataset.title); ogD && ogD.setAttribute('content', pg.dataset.desc);
  twT && twT.setAttribute('content', pg.dataset.title); twD && twD.setAttribute('content', pg.dataset.desc);
  ogU && ogU.setAttribute('content', D.site + '/' + (pg.dataset.rota && pg.dataset.rota !== '404' ? pg.dataset.rota.split('/').pop() + '.html' : ''));
  robo && robo.setAttribute('content', /^(politica-de-privacidade|termos-de-uso|404)$/.test(pg.dataset.rota) ? 'noindex,follow' : roboBase);
  scrollTo(0, 0); yAnt = 0; topo.classList.remove('some');
  marcarNav(r);
  atualizarWa(pg.dataset.wa);
  montar(pg);
  trocaLd(pg.dataset.rota);
  if (ancoraPedida) { const id = ancoraPedida; ancoraPedida = null; irAncora(id, false); }
  else if (volta && POS[idx]) { scrollTo(0, POS[idx]); yAnt = scrollY; }
  if (!primeira) { const h1 = $('h1', pg); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); } }
  if (!primeira && !RM) abrirTroca();
  navegando = false;
}
addEventListener('hashchange', () => ir(false));
function marcarNav(r) {
  const raizR = r.split('/')[0];
  $$('.nav-l[data-rota]').forEach(a => a.classList.toggle('ativo', a.dataset.rota === raizR || (a.dataset.grupo || '').split(' ').includes(raizR)));
}
function atualizarWa(msg) {
  const m = msg || D.waPadrao;
  $$('[data-wa-dinamico]').forEach(a => { a.href = WA(m); });
}
document.addEventListener('click', e => {
  const pal = e.target.closest('[data-palco]');
  if (pal) { e.preventDefault(); abrirPalco(pal.dataset.palco, pal); return; }
  const l = e.target.closest('a[data-aba],a[data-ancora]');
  if (l) {
    const destino = (l.getAttribute('href') || '').replace(/^#\/?/, '');
    if (l.dataset.aba !== undefined) {
      const v = l.dataset.aba;
      if (destino === 'ferramentas' && isNaN(+v)) { e.preventDefault(); abrirPalco(v, l); return; }
      abaPedida = +v;
    }
    if (l.dataset.ancora) ancoraPedida = l.dataset.ancora;
    if (destino === rotaAtual() && pagina) {
      e.preventDefault(); fecharTriagem(true); fecharMenu(); fecharDrops();
      if (abaPedida !== null) { $$('[data-abas]', pagina).slice(0, 1).forEach(g => g._sel && g._sel(abaPedida, true)); abaPedida = null; }
      if (ancoraPedida) { const id = ancoraPedida; ancoraPedida = null; irAncora(id, true); }
    }
  }
});
document.addEventListener('click', e => {
  const a = e.target.closest('[data-ir]');
  if (a) { e.preventDefault(); const alvo = document.getElementById(a.dataset.ir); if (alvo) alvo.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); }
});

let rolagens = [];
function montar(pg) {
  pg._io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); contar(e.target); pg._io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  $$('[data-r],.split,.janela,.num,.frasco,.prazo-b,.dest,.amp,.hp-portas,.hc-lista,.hcm-dial,.radar-mapa,.revela-q,.ga-cards,.sp-pontos,.bb-estante', pg).forEach(el => pg._io.observe(el));
  pg._ioR = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { $$('.revela', e.target).forEach(r => r.classList.add('in')); pg._ioR.unobserve(e.target); } }), { threshold: .1 });
  $$('.revela', pg).forEach(el => pg._ioR.observe(el.parentElement));
  $$('svg.bal', pg).forEach(s => { const b = bal(s); if (!s.dataset.iniciada) { s.dataset.iniciada = 1; b.a = s.dataset.inicio ? +s.dataset.inicio : -12; b.alvo = s.dataset.alvo ? +s.dataset.alvo : 0; b.render(); } else { b.impulso(-30); } });
  rolagens = [];
  $$('.heroi', pg).forEach(montarHeroi);
  $$('.hm-heroi', pg).forEach(montarHeroiV2);
  $$('.hm-portas', pg).forEach(montarPortas);
  $$('[data-selo]', pg).forEach(montarSelo);
  $$('[data-calc]', pg).forEach(montarCalc);
  $$('.hm-areas', pg).forEach(montarAreas);
  $$('.ampulhetas', pg).forEach(montarAmps);
  $$('.radar-mapa', pg).forEach(montarRadar);
  const aba = abaPedida; abaPedida = null;
  const abaN = typeof aba === 'number' ? aba : null;
  $$('[data-abas]', pg).forEach((g, k) => montarAbas(g, k === 0 ? abaN : null));
  $$('[data-funil-solo]', pg).forEach(f => montarFunilSolo(f, abaN));
  if (typeof aba === 'string' && aba) setTimeout(() => abrirPalco(aba), 420);
  $$('.docs-g', pg).forEach(montarDocs);
  $$('.caminho-h', pg).forEach(montarCaminho);
  $$('.es-portas', pg).forEach(montarEntrada);
  $$('[data-agenda]', pg).forEach(montarAgenda);
  $$('.es-kx-foto', pg).forEach(montarRetrato);
  $$('.hm-casos', pg).forEach(montarCasos);
  $$('.hm-faixa', pg).forEach(montarFaixa);
  $$('.hm-como', pg).forEach(montarComo);
  $$('.hm-jornada', pg).forEach(montarJornadaV2);
  $$('.hm-esc', pg).forEach(montarEscFoto);
  $$('canvas.poeira', pg).forEach(montarPoeira);
  if (pg.dataset.rota === '') montarCabSaida(pg);
  carregarImagens(pg);
  $$('.manifesto, .destaque-g', pg).forEach(montarManifesto);
  $$('.galeria', pg).forEach(montarGaleria);
  $$('.cartoes', pg).forEach(montarCartoes);
  $$('.jornada', pg).forEach(montarJornada);
  $$('.mapa', pg).forEach(montarMapa);
  $$('.esc-topo', pg).forEach(montarFotoCresce);
  $$('.espalhadas', pg).forEach(montarEspalhadas);
  $$('.painel-caso', pg).forEach(montarPainelCaso);
  $$('.texto[data-artigo]', pg).forEach(montarLeitura);
  $$('.busca', pg).forEach(montarBusca);
  $$('.bb-filtro', pg).forEach(montarFiltro);
  $$('[data-faq2]', pg).forEach(montarFaq2);
  $$('.destaque-p', pg).forEach(montarPeso);
  if (pg.dataset.rota === 'contato') montarContato(pg);
  $$('.horario', pg).forEach(marcarHoje);
  if (pg.dataset.rota === '404') { const b = bal($('svg.bal', pg)); if (b) { b.mira(13); } }
  montarCel(pg);
  aoRolar();
}
function desmontar(pg) {
  pg._io && pg._io.disconnect(); pg._ioR && pg._ioR.disconnect();
  (pg._limpar || []).forEach(f => f()); pg._limpar = [];
  rolagens = [];
  $('.leitura').classList.remove('on');
}
function limpar(pg, f) { (pg._limpar = pg._limpar || []).push(f); }

function contar(el) {
  $$('[data-conta]', el).concat(el.matches('[data-conta]') ? [el] : []).forEach(n => {
    if (n._contou) return; n._contou = 1;
    const fim = +n.dataset.conta, ini = +(n.dataset.de || 0), dur = 1600, t0 = performance.now();
    if (RM) { n.textContent = fim; return; }
    const f = t => { const p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3); n.textContent = Math.round(ini + (fim - ini) * e); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
}

let pedido = false, yUlt = scrollY;
function aoRolar() {
  const y = scrollY, dy = y - yUlt; yUlt = y;
  topoRolagem(y); yAnt = y;
  if (dy && !RM) balancas.forEach(b => { if (b.vis) b.impulso(clamp(dy, -70, 70) * .32); });
  rolagens.forEach(f => f(y));
  pedido = false;
}
addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(aoRolar); } }, { passive: true });

function montarHeroi(h) {
  const b = bal($('svg.bal', h)); if (!b) return;
  $$('.prato', h).forEach(p => {
    const lado = p.classList.contains('esq') ? -9 : 9;
    const on = () => { b.mira(lado); p.classList.add('ativo'); };
    const off = () => { b.mira(0); p.classList.remove('ativo'); };
    p.addEventListener('mouseenter', on); p.addEventListener('mouseleave', off);
    p.addEventListener('focusin', on); p.addEventListener('focusout', off);
    p.addEventListener('touchstart', () => { on(); setTimeout(off, 1400); }, { passive: true });
  });
  if (FINO) {
    const mv = e => { if (h.querySelector('.prato.ativo')) return; const x = (e.clientX / innerWidth - .5) * 7; b.mira(x); };
    h.addEventListener('mousemove', mv); h.addEventListener('mouseleave', () => b.mira(0));
  }
}

function montarManifesto(m) {
  const itens = $$('.mw, .pilula', m); if (!itens.length) return;
  rolagens.push(() => {
    const r = m.getBoundingClientRect();
    const p = clamp((vh * .82 - r.top) / (r.height + vh * .3), 0, 1);
    const n = Math.round(p * itens.length * 1.08);
    itens.forEach((w, i) => w.classList.toggle('lit', i < n));
  });
}

function montarGaleria(g) {
  const sl = $$('.gl-slide', g), bts = $$('.gl-prog button', g), pausa = $('.gl-pausa', g);
  let i = 0, tmr = null, pausada = false, visivel = false, t0 = 0, resta = 7000;
  const DUR = 7000;
  function vai(n, manual, origem) {
    const ant = sl[i]; i = (n + sl.length) % sl.length;
    if (ant !== sl[i]) {
      const o = (origem || $('.gl-prox', g)).getBoundingClientRect(), gr = g.getBoundingClientRect();
      sl[i].style.setProperty('--cx', ((o.left + o.width / 2 - gr.left) / gr.width * 100).toFixed(1) + '%');
      sl[i].style.setProperty('--cy', ((o.top + o.height / 2 - gr.top) / gr.height * 100).toFixed(1) + '%');
      void sl[i].offsetWidth;
      ant.classList.remove('atual'); ant.classList.add('sai'); setTimeout(() => ant.classList.remove('sai'), 1400); sl[i].classList.add('atual');
    }
    sl.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== i)));
    bts.forEach((b, k) => { b.classList.toggle('feito', k < i); b.classList.remove('atual'); b.setAttribute('aria-current', String(k === i)); });
    void g.offsetWidth; bts[i].classList.add('atual');
    resta = DUR; agenda();
  }
  function agenda() { clearTimeout(tmr); if (pausada || !visivel || RM) return; t0 = Date.now(); tmr = setTimeout(() => vai(i + 1), resta); }
  function pausar(v) {
    pausada = v; g.classList.toggle('pausada', v);
    pausa.textContent = v ? 'Continuar' : 'Pausar'; pausa.setAttribute('aria-pressed', String(v));
    if (v) { clearTimeout(tmr); resta = Math.max(400, resta - (Date.now() - t0)); } else agenda();
  }
  $('.gl-ant', g).addEventListener('click', e => vai(i - 1, true, e.currentTarget));
  $('.gl-prox', g).addEventListener('click', e => vai(i + 1, true, e.currentTarget));
  if (FINO && !RM) g.addEventListener('mousemove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5, a = sl[i];
    $$('.cam-assunto', a).forEach(c => c.style.transform = `translate(${(-x * 46).toFixed(1)}px,${(-y * 30).toFixed(1)}px)`);
    $$('.cam-brilho', a).forEach(c => c.style.transform = `translate(${(-x * 80).toFixed(1)}px,${(-y * 50).toFixed(1)}px)`);
    $$('.cam-fundo', a).forEach(c => c.style.transform = `translate(${(x * 20).toFixed(1)}px,${(y * 14).toFixed(1)}px)`);
  });
  pausa.addEventListener('click', () => pausar(!pausada));
  bts.forEach((b, k) => b.addEventListener('click', e => vai(k, true, e.currentTarget)));
  let x0 = null;
  g.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  g.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) vai(i + (dx < 0 ? 1 : -1), true); x0 = null; });
  g.addEventListener('keydown', e => { if (e.key === 'ArrowRight') vai(i + 1, true); if (e.key === 'ArrowLeft') vai(i - 1, true); });
  const io = new IntersectionObserver(es => { visivel = es[0].isIntersecting; if (visivel) agenda(); else clearTimeout(tmr); }, { threshold: .35 });
  io.observe(g);
  limpar(g.closest('.pg'), () => { io.disconnect(); clearTimeout(tmr); });
  vai(0);
}

function montarCartoes(c) {
  const cs = $$('.cartao', c); if (RM || innerWidth < 760) return;
  rolagens.push(() => {
    cs.forEach((card, k) => {
      const prox = cs[k + 1]; if (!prox) return;
      const d = prox.getBoundingClientRect().top - card.getBoundingClientRect().top;
      const p = clamp(1 - d / card.offsetHeight, 0, 1);
      card.style.transform = `scale(${(1 - p * .06).toFixed(4)})`;
      card.style.filter = `brightness(${(1 - p * .35).toFixed(3)})`;
    });
  });
}

function montarJornada(j) {
  const passos = $$('.jr-passo', j), icos = $$('.jr-ico', j), barras = $$('.jr-barras i', j), cont = $('.jr-cont b', j), cart = $('.jr-cartao', j), pal = $('.jr-palavra', j);
  const rots = [-4, 3.5, -2.5, 4], n = passos.length; let atual = -1;
  rolagens.push(() => {
    const r = j.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
    const p = clamp(-r.top / (r.height - vh), 0, 1);
    const k = Math.min(n - 1, Math.floor(p * n * .999));
    barras.forEach((b, q) => b.style.setProperty('--p', clamp(p * n - q, 0, 1).toFixed(3)));
    if (pal) pal.style.setProperty('--x', (-(p) * (pal.scrollWidth - innerWidth * .55)).toFixed(1) + 'px');
    if (k !== atual) {
      atual = k;
      passos.forEach((s, q) => s.classList.toggle('atual', q === k));
      icos.forEach((s, q) => s.classList.toggle('atual', q === k));
      if (cont) cont.textContent = String(k + 1).padStart(2, '0');
      if (cart) cart.style.setProperty('--rot', rots[k % 4] + 'deg');
    }
  });
}

function montarMapa(m) {
  const vis = () => $$('svg', m).find(s => s.getBoundingClientRect().width > 0);
  rolagens.push(() => {
    const s = vis(); if (!s) return;
    const r = s.getBoundingClientRect();
    const p = m.dataset.estatico ? 1 : clamp((vh * .92 - r.top) / (r.height * .95), 0, 1);
    $$('.trilho', s).forEach(t => { const a = +(t.dataset.a || 0), b = +(t.dataset.b || 1); t.style.setProperty('--traco', (1 - clamp((p - a) / (b - a), 0, 1)).toFixed(4)); });
    $$('.pt', s).forEach(pt => pt.classList.toggle('on', p >= +(pt.dataset.t || 0)));
  });
}

function montarFotoCresce(e) {
  const f = $('.et-foto', e); if (RM || innerWidth < 980) return;
  rolagens.push(() => {
    const r = e.getBoundingClientRect(); const p = clamp(-r.top / (r.height - vh), 0, 1);
    const ease = p * p * (3 - 2 * p);
    f.style.setProperty('--w', (42 + 58 * ease).toFixed(2) + 'vw');
    f.style.setProperty('--h', (52 + 48 * ease).toFixed(2) + 'vh');
    f.style.setProperty('--r', (22 * (1 - ease)).toFixed(1) + 'px');
  });
}
function montarEspalhadas(e) {
  const fs = $$('.es-f', e); if (RM) return;
  rolagens.push(() => {
    const r = e.getBoundingClientRect(); const c = (r.top + r.height / 2 - vh / 2);
    fs.forEach(f => { f.style.transform = `translate3d(0,${(c * (+f.dataset.v)).toFixed(1)}px,0)`; });
  });
}

const suave = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function montarHeroiV2(h) {
  const txt = $('.hm-txt', h), ret = $('.hm-retrato img', h), rol = $('.hm-rolar', h);
  if (!h.classList.contains('espera')) setTimeout(() => h.classList.add('chegou'), 120);
  if (ret) setTimeout(() => { ret.style.transition = 'opacity 1.4s'; }, 2800);
  rolagens.push(() => {
    if (RM) return;
    const r = h.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
    const p = clamp(-r.top / r.height, 0, 1);
    txt.style.transform = p > .001 ? `translate3d(0,${(-p * 70).toFixed(1)}px,0)` : '';
    txt.style.opacity = p > .001 ? clamp(1 - p * 1.3, 0, 1).toFixed(3) : '';
    if (ret && h.classList.contains('chegou')) ret.style.transform = p > .001 ? `translate3d(0,${(p * 90).toFixed(1)}px,0) scale(${(1 + p * .06).toFixed(4)})` : '';
    if (rol) rol.style.opacity = clamp(1 - p * 6, 0, 1).toFixed(3);
  });
}
function montarPortas(s) {
  const ps = $$('.hp-porta', s);
  const abre = p => ps.forEach(x => x.classList.toggle('aberta', x === p));
  ps.forEach(p => {
    p.addEventListener('mouseenter', () => { if (FINO) abre(p); });
    p.addEventListener('focus', () => abre(p));
    if (FINO && !RM) p.addEventListener('mousemove', e => { const r = p.getBoundingClientRect(); p.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px'); p.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px'); });
  });
}
function montarCalc(c) {
  if (!c._calc) {
    const ts = $$('.c3-t', c), q = $('.c3-q', c), r = $('.c3-r', c), corpo = $('.c3-corpo', c);
    const st = { i: 0, tm: 0, dg: 0, parado: false, vivo: false };
    const mostra = (t, anim) => {
      ts.forEach(x => x.classList.toggle('on', x === t));
      clearInterval(st.dg); r.textContent = t.dataset.res; r.classList.remove('vem'); void r.offsetWidth; r.classList.add('vem');
      const txt = t.dataset.q;
      if (!anim || RM) { q.textContent = txt; return; }
      let n = 0; q.textContent = '';
      st.dg = setInterval(() => { n++; q.textContent = txt.slice(0, n); if (n >= txt.length) clearInterval(st.dg); }, 34);
    };
    const ciclo = () => { if (st.parado || !st.vivo) return; mostra(ts[st.i % ts.length], true); st.i++; st.tm = setTimeout(ciclo, 3400); };
    ts.forEach((t, k) => {
      const fixa = () => { st.parado = true; clearTimeout(st.tm); mostra(t, false); st.i = k + 1; };
      t.addEventListener('mouseenter', fixa); t.addEventListener('focus', fixa);
      t.addEventListener('mouseleave', () => { st.parado = false; clearTimeout(st.tm); st.tm = setTimeout(ciclo, 1600); });
    });
    if (FINO && !RM) {
      c.addEventListener('pointermove', e => { const b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5; corpo.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg'); corpo.style.setProperty('--ry', (x * 16).toFixed(2) + 'deg'); });
      c.addEventListener('pointerleave', () => { corpo.style.setProperty('--rx', '0deg'); corpo.style.setProperty('--ry', '0deg'); });
    }
    c._calc = {
      inicia: () => { if (RM) { mostra(ts[0], false); return; } st.vivo = true; st.parado = false; clearTimeout(st.tm); st.tm = setTimeout(ciclo, 900); },
      para: () => { st.vivo = false; clearTimeout(st.tm); clearInterval(st.dg); }
    };
  }
  c._calc.inicia();
  limpar(c.closest('.pg'), () => c._calc.para());
}
function montarSelo(s) {
  if (s._selo || !FINO || RM) return; s._selo = 1;
  const corpo = $('.sa-corpo', s);
  s.addEventListener('pointermove', e => {
    const r = s.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    corpo.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg'); corpo.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
    s.style.setProperty('--mx', ((x + .5) * 100).toFixed(1) + '%'); s.style.setProperty('--my', ((y + .5) * 100).toFixed(1) + '%');
  });
  s.addEventListener('pointerleave', () => { corpo.style.setProperty('--rx', '0deg'); corpo.style.setProperty('--ry', '0deg'); });
}
function montarCasos(s) {
  const itens = $$('.hc-item', s), painel = $('.hc-funil', s), alvo = $('.hf-in', s), dir = $('.hc-dir', s), fio = $('.hc-fio', s), f0 = $('.f0', fio), f1 = $('.f1', fio), f2 = $('.f2', fio);
  let ativo = null, sobre = null;
  const mob = () => innerWidth <= 980;
  const curva = bt => {
    const g = s.getBoundingClientRect(), a = bt.getBoundingClientRect(), p = painel.getBoundingClientRect();
    const x1 = a.right - g.left - 4, y1 = a.top + a.height / 2 - g.top, x2 = p.left - g.left + 1, y2 = clamp(y1, p.top - g.top + 44, p.bottom - g.top - 44);
    const m = (x2 - x1) * .55;
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} C${(x1 + m).toFixed(1)} ${y1.toFixed(1)} ${(x2 - m).toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  const desenhaFio = () => {
    if (mob()) { f0.setAttribute('d', ''); f1.setAttribute('d', ''); f2.setAttribute('r', '0'); return; }
    f1.setAttribute('d', ativo ? curva(ativo) : '');
    if (ativo) { const m = f1.getAttribute('d').split(' ').slice(-2); f2.setAttribute('cx', m[0]); f2.setAttribute('cy', m[1]); f2.setAttribute('r', '5'); } else f2.setAttribute('r', '0');
    f0.setAttribute('d', sobre && sobre !== ativo ? curva(sobre) : '');
  };
  [f0, f1].forEach(f => f.setAttribute('pathLength', '1'));
  function escolhe(bt) {
    ativo = bt;
    itens.forEach(x => { x.classList.toggle('ativo', x === bt); x.setAttribute('aria-pressed', String(x === bt)); });
    const def = achaDef(bt.dataset.funil); if (!def) return;
    if (mob()) bt.parentElement.appendChild(painel); else if (painel.parentElement !== dir) dir.appendChild(painel);
    painel.classList.add('on'); s.classList.add('com-caso');
    funil(def, alvo, { rolo: mob() ? null : painel, foco: false, foto: D.fotoCaso && D.fotoCaso[bt.dataset.funil] });
    painel.classList.remove('muda'); void painel.offsetWidth; painel.classList.add('muda');
    f1.classList.remove('vai'); void f1.getBoundingClientRect(); f1.classList.add('vai');
    desenhaFio();
    if (mob()) setTimeout(() => bt.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }), 60);
    else painel.scrollTop = 0;
    const b = bal($('.pg.atual .hm-bal')); b && b.impulso(-40);
  }
  itens.forEach(bt => {
    bt.addEventListener('click', () => escolhe(bt));
    bt.addEventListener('mouseenter', () => { sobre = bt; desenhaFio(); });
    bt.addEventListener('mouseleave', () => { sobre = null; desenhaFio(); });
  });
  s._tem = id => itens.some(x => x.dataset.funil === id);
  s._escolhe = id => { const bt = itens.find(x => x.dataset.funil === id) || itens[0]; if (bt) escolhe(bt); };
  rolagens.push(() => { const r = s.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh && (ativo || sobre)) desenhaFio(); });
  const rs = () => { if (!mob() && painel.parentElement !== dir) dir.appendChild(painel); desenhaFio(); };
  addEventListener('resize', rs); limpar(s.closest('.pg'), () => removeEventListener('resize', rs));
}
let seloN = 0;
let _av = null;
const avDr = () => { if (_av === null) { const b = document.getElementById('im-av-casos-d'); _av = b ? 'data:image/webp;base64,' + b.textContent.trim() : ''; } return _av; };
const achaDef = id => (D.funis && D.funis[id]) || D.triagem.find(t => t.id === id);
function funil(def, cx, o = {}) {
  const resp = (o.pre || []).slice();
  const larg = [62, 48, 70, 54];
  const pergs = () => def.ramos && resp.length ? [def.perguntas[0], ...def.ramos[resp[0]].perguntas] : def.perguntas;
  const total = () => def.ramos && !resp.length ? 1 + Math.max(...def.ramos.map(r => r.perguntas.length)) : pergs().length;
  const nota = i => { const q = pergs()[i]; return q && q.notas ? q.notas[resp[i]] : ''; };
  function desenha(nova) {
    const P = pergs(), n = total(), feito = resp.length >= n;
    const fu = o.foto ? `<div class="hf-foto" aria-hidden="true"><img class="ft" src="${o.foto.replace('w=900', 'w=' + (innerWidth <= 760 ? 640 : 900))}" alt="" data-ok="" data-rm=""></div>` : '';
    const cont = !feito ? `<span class="hf-cont" aria-live="polite">Pergunta ${resp.length + 1} de ${n}<i class="hf-barra" style="--p:${(resp.length / n).toFixed(3)}" aria-hidden="true"><b></b></i></span>` : '';
    let h = `<div class="hf-topo${fu ? ' com-foto' : ''}">${fu}<small>A ficha do seu caso</small><b>${def.titulo}</b>${def.intro ? `<p>${def.intro}</p>` : ''}${cont}</div><ol class="hf-trilha">`;
    h += `<li class="hf-est raiz feita"><span class="hf-no"></span><span class="hf-r"><small>Situação</small><b>${def.area}</b></span></li>`;
    resp.forEach((r, i) => {
      const q = P[i], nt = nota(i);
      h += `<li class="hf-est feita${nova && i === resp.length - 1 ? ' nova' : ''}"><button type="button" class="hf-volta" data-i="${i}" aria-label="Alterar a resposta: ${q.rot}"><span class="hf-no"></span><span class="hf-r"><small>${q.rot}</small><b>${q.op[r]}</b></span><em>alterar</em></button>${nt ? `<p class="hf-nota"><svg aria-hidden="true"><use href="#i-lupa"/></svg>${nt}</p>` : ''}</li>`;
    });
    if (!feito) {
      const q = P[resp.length];
      h += `<li class="hf-est atual"><span class="hf-no"></span><h3>${q.q}</h3><div class="hf-ramos" role="group" aria-label="${q.q}">${q.op.map((op, k) => `<button type="button" class="hf-ramo" data-k="${k}" style="--k:${k}">${op}</button>`).join('')}</div>${resp.length ? '<button type="button" class="hf-tras">Voltar uma pergunta</button>' : ''}</li>`;
      for (let i = resp.length + 1; i < n; i++) h += `<li class="hf-est vaga"><span class="hf-no"></span><i style="--w:${larg[i % 4]}%"></i></li>`;
      h += `<li class="hf-est destino"><span class="hf-no"><svg aria-hidden="true"><use href="#i-balanca"/></svg></span><b>Ficha e mensagem prontas</b></li></ol>`;
    } else {
      const ramo = def.ramos ? def.ramos[resp[0]] : null;
      const base = ramo ? ramo.res : def.res;
      const res = !ramo && def.res_por ? Object.assign({}, base, def.res_por[resp[0]] || {}) : base;
      const baseMsg = ramo ? ramo.wa : def.wa, id = 'seloC' + (++seloN), docsL = res.docs || [];
      const msgDe = tem => mensagem(baseMsg, P, resp, { ola: 'Olá! Vim pelo site da Advocacia Teixeira Mendes.', caminho: res.nome, tem: docsL.filter((d, k) => tem[k]), falta: docsL.filter((d, k) => !tem[k]) });
      const msg = msgDe(docsL.map(() => false)); cx._msgDe = msgDe;
      const ab = res.aba !== undefined && res.aba !== null ? ` data-aba="${res.aba}"` : '';
      h += `<li class="hf-est destino feita nova"><span class="hf-no"><svg aria-hidden="true"><use href="#i-balanca"/></svg></span><span class="hf-r"><small>Encaminhamento</small><b>${res.nome}</b></span></li></ol>
      <div class="hf-fim"><div class="hf-fim-cab"><svg class="hf-selo" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="${id}" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0"/></defs><circle cx="60" cy="60" r="57"/><circle cx="60" cy="60" r="35"/><text><textPath href="#${id}">FICHA PRONTA · TEIXEIRA MENDES · SANTO AMARO ·</textPath></text><use href="#i-logo" x="38" y="38" width="44" height="44"/></svg>
      <div><small>Primeiros passos</small><h3>${res.nome}</h3></div></div>
      ${res.prazo ? `<p class="hf-prazo"><svg aria-hidden="true"><use href="#i-ampulheta"/></svg><span>${res.prazo}</span></p>` : ''}
      <div class="hf-blocos"><div><h4>${res.titulo_passos || 'O que fazer agora'}</h4><ol>${(res.passos || []).map(p => `<li>${p}</li>`).join('')}</ol></div><div class="hf-docs-b"><h4>Separe estes documentos</h4>${docsL.length ? `<p class="hf-docs-c" aria-live="polite"><span>Toque no que você já tem</span><i><b></b></i></p>` : ''}<ul class="hf-docs">${docsL.map((p, k) => `<li><button type="button" aria-pressed="false" data-k="${k}"><i aria-hidden="true"></i>${p}</button></li>`).join('')}</ul></div></div>
      ${avDr() ? `<p class="hf-quem"><img class="hf-av" src="${avDr()}" alt="" width="56" height="56"><span><b>O escritório recebe a sua mensagem</b>Maria · OAB/SP 104587</span></p>` : ''}<div class="acoes"><a class="btn btn-ouro hf-env" href="${WA(msg)}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>Enviar ao escritório pelo WhatsApp</a>${o.semPagina ? '' : `<a class="btn btn-linha" href="#/${res.caminho}"${ab}>Ver a página<span class="sr"> de ${res.nome}</span></a>`}</div>
      <p class="aviso-p">A mensagem já vai com as suas respostas. As orientações são gerais e não substituem a análise do seu caso.</p>
      <button type="button" class="hf-tras" data-rec>Começar de novo</button></div>`;
    }
    cx.innerHTML = h;
    if (feito) {
      const dbs = $$('.hf-docs button', cx), env = $('.hf-env', cx), cont = $('.hf-docs-c', cx);
      dbs.forEach(d => d.addEventListener('click', () => {
        d.setAttribute('aria-pressed', String(d.getAttribute('aria-pressed') !== 'true'));
        const tem = dbs.map(x => x.getAttribute('aria-pressed') === 'true'), n = tem.filter(Boolean).length;
        if (cont) { $('span', cont).textContent = n ? (n === dbs.length ? 'Todos os documentos separados' : `${n} de ${dbs.length} separados`) : 'Toque no que você já tem'; $('b', cont).style.width = (n / dbs.length * 100) + '%'; cont.classList.toggle('completo', n === dbs.length); }
        if (env && cx._msgDe) env.href = WA(cx._msgDe(tem));
      }));
    }
    $$('.hf-ramo', cx).forEach(bt => bt.addEventListener('click', () => {
      if (cx.classList.contains('escolhendo')) return;
      cx.classList.add('escolhendo'); bt.classList.add('escolhido');
      const b = o.bal || bal($('.pg.atual .hm-bal')); b && b.impulso(resp.length % 2 ? 40 : -40);
      setTimeout(() => { cx.classList.remove('escolhendo'); resp.push(+bt.dataset.k); desenha(true); }, RM ? 0 : 340);
    }));
    $$('.hf-volta', cx).forEach(bt => bt.addEventListener('click', () => { resp.length = +bt.dataset.i; desenha(false); }));
    const tras = $('.hf-tras:not([data-rec])', cx); tras && tras.addEventListener('click', () => { resp.pop(); desenha(false); });
    const rec = $('[data-rec]', cx); rec && rec.addEventListener('click', () => { resp.length = 0; desenha(false); });
    const foco = $('.hf-est.atual, .hf-fim', cx);
    if (nova && foco) {
      if (o.rolo && o.rolo.scrollHeight > o.rolo.clientHeight + 4) { const d = foco.getBoundingClientRect().top - o.rolo.getBoundingClientRect().top - 90; o.rolo.scrollTo({ top: o.rolo.scrollTop + d, behavior: RM ? 'auto' : 'smooth' }); }
      else { const r = foco.getBoundingClientRect(); if (r.bottom > vh - 20 || r.top < 80) window.scrollBy({ top: r.top - vh * .3, behavior: RM ? 'auto' : 'smooth' }); }
    }
    if (o.foco !== false || nova) { const f = $('.hf-ramo', cx) || $('.hf-fim .btn', cx); f && f.focus({ preventScroll: true }); }
  }
  desenha(false);
}
function montarFunilSolo(el, aba) {
  const def = achaDef(el.dataset.funilSolo); if (!def) return;
  const pre = def.ramos && aba !== null && aba !== undefined && aba < def.ramos.length ? [aba] : [];
  funil(def, $('.hf-in', el), { rolo: el, foco: false, pre, semPagina: true });
}
function montarAbas(g, ini) {
  const bts = $$('.ab-lista [role=tab]', g), ps = $$('.ab-p', g), ind = $('.ab-ind', g), lista = $('.ab-lista', g);
  let at = -1;
  const marca = () => { const b = bts[at]; if (!b || !ind) return; ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft}px)`; };
  const sel = (k, rola) => {
    k = clamp(k, 0, bts.length - 1); if (k === at && !rola) return; at = k;
    bts.forEach((b, i) => { b.setAttribute('aria-selected', String(i === k)); b.tabIndex = i === k ? 0 : -1; });
    ps.forEach((p, i) => { const on = i === k; p.hidden = !on; p.classList.toggle('atual', on); if (on) { p.classList.remove('entra'); void p.offsetWidth; p.classList.add('entra'); } });
    marca(); if (lista.scrollWidth > lista.clientWidth) lista.scrollTo({ left: Math.max(0, bts[k].offsetLeft - 24), behavior: RM ? 'auto' : 'smooth' });
    $$('.ps-chips button', g.closest('.pg')).forEach((c, i) => c.classList.toggle('ativo', i === k));
    if (rola) g.closest('section').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
  };
  g._sel = sel;
  const rolarAlvo = () => { const al = g.dataset.rolar && $(g.dataset.rolar, g); al && al.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); };
  bts.forEach((b, i) => {
    b.addEventListener('click', () => { sel(i); rolarAlvo(); });
    b.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); sel(at + (e.key === 'ArrowRight' ? 1 : -1)); bts[at].focus(); } });
  });
  $$('[data-ir-aba]', g.closest('.pg')).forEach(c => c.addEventListener('click', () => sel(+c.dataset.irAba, true)));
  const rs = () => marca(); addEventListener('resize', rs); limpar(g.closest('.pg'), () => removeEventListener('resize', rs));
  sel(ini !== null && ini !== undefined ? ini : 0);
  if (ini !== null && ini !== undefined && g.dataset.rolar) setTimeout(rolarAlvo, 350);
  $$('.fr-filtros button', g).forEach(f => f.addEventListener('click', () => {
    const c = f.dataset.cat;
    $$('.fr-filtros button', g).forEach(x => x.setAttribute('aria-pressed', String(x === f)));
    bts.forEach(b => { const v = c === 'tudo' || b.dataset.cat === c; b.hidden = !v; if (v) { b.classList.remove('surge'); void b.offsetWidth; b.classList.add('surge'); } });
  }));
  requestAnimationFrame(marca); setTimeout(marca, 400);
}
function montarDocs(d) {
  if (d._ok) return; d._ok = 1;
  const bts = $$('li button', d), cont = $('.dg-cont', d), lk = $('.dg-wa', d), base = d.dataset.wa || D.waPadrao;
  const atualiza = () => {
    const tem = bts.filter(b => b.getAttribute('aria-pressed') === 'true'), falta = bts.filter(b => b.getAttribute('aria-pressed') !== 'true').map(b => b.textContent.trim());
    cont.textContent = tem.length ? `${tem.length} de ${bts.length} separados` : 'Toque no que você já tem';
    d.classList.toggle('completo', !falta.length);
    const temN = tem.map(b => b.textContent.trim());
    lk.href = WA(montaMsg([fraseDe(base), listaMsg('Já separei', temN), falta.length ? listaMsg('Ainda falta separar', falta) : 'Já separei todos os documentos.', 'Gostaria de agendar uma conversa.']));
  };
  bts.forEach(b => b.addEventListener('click', () => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); atualiza(); }));
  atualiza();
}
function montarCaminho(c) {
  const lis = $$('li', c), fio = $('.cm-linha b', c);
  if (RM) { lis.forEach(l => l.classList.add('on')); if (fio) fio.style.transform = 'none'; return; }
  rolagens.push(() => {
    const r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
    const p = clamp((vh * .78 - r.top) / (r.height + vh * .2), 0, 1);
    if (fio) fio.style.setProperty('--p', p.toFixed(4)); c.style.setProperty('--p', p.toFixed(4));
    lis.forEach((l, i) => l.classList.toggle('on', p >= (i + .3) / lis.length));
  });
}
function montarFaixa(f) {
  const t = $('.ft', f); if (RM) return;
  let x = 0, v = 0, ult = scrollY, vis = false;
  const laco = () => {
    if (!vis) return;
    const dy = scrollY - ult; ult = scrollY; v += (Math.min(40, Math.abs(dy)) * .12 - v) * .08;
    x -= .55 + v; const w = t.scrollWidth / 3; if (-x > w) x += w;
    t.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`; requestAnimationFrame(laco);
  };
  const io = new IntersectionObserver(es => { const a = vis; vis = es[0].isIntersecting; if (vis && !a) laco(); });
  io.observe(f); limpar(f.closest('.pg'), () => { io.disconnect(); vis = false; });
}
function montarEntrada(s) {
  const fe = $('.ep-porta.e', s), fd = $('.ep-porta.d', s), fr = $('.ep-fresta', s), bo = $('.ep-boas', s), tx = $('.ep-txt', s), fu = $('.ep-fundo > *', s), ve = $('.ep-veu', s), ro = $('.ep-rolar', s);
  const aplica = p => {
    const e = suave(clamp(p / .62, 0, 1)), t = clamp((p - .38) / .4, 0, 1);
    fe.style.transform = `rotateY(${(e * 80).toFixed(2)}deg)`; fd.style.transform = `rotateY(${(-e * 80).toFixed(2)}deg)`;
    fe.style.setProperty('--sombra', e.toFixed(3)); fd.style.setProperty('--sombra', e.toFixed(3));
    fr.style.opacity = (Math.sin(Math.min(1, e * 1.4) * Math.PI) * .9).toFixed(3); fr.style.transform = `scaleX(${(1 + e * 26).toFixed(2)})`;
    bo.style.opacity = clamp(1 - e * 2.6, 0, 1).toFixed(3); bo.style.transform = `translate(-50%,-50%) scale(${(1 + e * .25).toFixed(3)})`;
    tx.style.opacity = t.toFixed(3); tx.style.transform = `translate3d(0,${((1 - t) * 40).toFixed(1)}px,0)`; tx.style.pointerEvents = t > .5 ? 'auto' : 'none';
    if (fu) fu.style.transform = `scale(${(1.16 - e * .16).toFixed(4)})`;
    if (ve) ve.style.opacity = (.35 + t * .5).toFixed(3);
    if (ro) ro.style.opacity = clamp(1 - p * 8, 0, 1).toFixed(3);
    s.classList.toggle('aberta', e > .98);
  };
  if (RM) { s.classList.add('estatica'); aplica(1); return; }
  if (CEL()) {
    s.classList.add('auto'); aplica(0); const t0 = performance.now() + 350, dur = 1500;
    const anda = t => { const p = clamp((t - t0) / dur, 0, 1); aplica(p); if (p < 1 && s.isConnected) requestAnimationFrame(anda); };
    requestAnimationFrame(anda); return;
  }
  rolagens.push(() => { const r = s.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; aplica(clamp(-r.top / (r.height - vh), 0, 1)); });
  aplica(0);
}
function montarAgenda(a) {
  const dias = $$('.oq-dias li', a), ag = $('.oq-agora', a), lb = $('b', ag);
  const atual = () => {
    const { d, m } = agoraSP(), h = m / 60;
    dias.forEach(li => li.classList.toggle('hoje', +li.dataset.d === d));
    a.classList.toggle('fds', d === 0 || d === 6);
    const pos = clamp((h - 8) / 12, 0, 1);
    ag.hidden = false; ag.style.left = (pos * 100).toFixed(2) + '%';
    lb.textContent = 'Agora ' + Math.floor(h) + 'h' + String(m % 60).padStart(2, '0');
    ag.classList.toggle('fora', h < 8 || h > 20);
    ag.classList.toggle('dir', pos > .8);
  };
  atual(); const t = setInterval(atual, 60000); limpar(a.closest('.pg'), () => clearInterval(t));
}
function montarRetrato(f) {
  const p = $('.er-par', f), an = $('.er-anel', f); if (RM || !p) return;
  rolagens.push(() => { const r = f.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; const c = (r.top + r.height / 2 - vh / 2) / vh; p.style.transform = `translate3d(0,${(c * -40).toFixed(1)}px,0)`; if (an) an.style.transform = `rotate(${(c * -60).toFixed(1)}deg)`; });
}
function montarComo(c) {
  const passos = $$('.hcm-passo', c), ims = $$('.hcm-im', c), nos = $$('.hcm-no', c), gnos = $('.hcm-nos', c), arco = $('.hcm-arco', c), rot = $('.hcm-rot-dial', c), n = passos.length;
  if (!n || !gnos) return;
  const rotulos = passos.map(p => ($('.hcm-rot', p) || {}).textContent || '');
  let at = -1;
  const aplica = P => {
    gnos.style.transform = `rotate(${(-90 * P).toFixed(2)}deg)`; gnos.style.setProperty('--r', (90 * P).toFixed(2) + 'deg');
    arco.style.strokeDashoffset = (1 - (P + .0001) / 4).toFixed(4);
    const k = clamp(Math.round(P), 0, n - 1);
    if (k !== at) {
      at = k;
      passos.forEach((p, i) => p.classList.toggle('atual', i === k));
      ims.forEach((m, i) => m.classList.toggle('atual', i === k));
      nos.forEach((m, i) => { m.classList.toggle('atual', i === k); m.classList.toggle('feito', i < k); });
      if (rot) { rot.classList.add('muda'); setTimeout(() => { rot.textContent = rotulos[k]; rot.classList.remove('muda'); }, 180); }
    }
  };
  if (CEL()) { const dir = $('.hcm-dir', c); if (dir && !dir._comoCel) { dir._comoCel = 1; dir.addEventListener('crs', e => aplica(RM ? e.detail.i : clamp(e.detail.p, 0, n - 1))); } aplica(0); return; }
  rolagens.push(() => {
    const r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
    const linha = vh * .5; let P = 0;
    for (let i = 0; i < n; i++) {
      const t = passos[i].getBoundingClientRect().top;
      if (t <= linha) { P = i; const prox = passos[i + 1]; if (prox) { const t2 = prox.getBoundingClientRect().top; P = i + clamp((linha - t) / (t2 - t), 0, 1); } }
    }
    aplica(RM ? Math.round(P) : P);
  });
  aplica(0);
}
const ANG = [-14, -10.5, -7, -3.5, 0];
function pesosEm(svg, st) { $$('.peso', svg).forEach(r => r.classList.toggle('sai', +r.dataset.k <= st)); }
function montarJornadaV2(j) {
  const passos = $$('.jr-tela .jr-passo', j), lis = $$('.jr-legenda li', j);
  const svgD = $('.jr-tela svg.bal', j), bD = bal(svgD);
  let atual = -2;
  const aplica = (st, svg, b) => { pesosEm(svg, st); if (b) { b.mira(ANG[st + 1]); b.impulso(st % 2 ? 36 : -36); } };
  rolagens.push(() => {
    const r = j.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh || innerWidth <= 980) return;
    const p = clamp(-r.top / (r.height - vh), 0, 1);
    const s2 = Math.min(3, Math.floor(p * 5 * .999) - 1);
    if (s2 !== atual) {
      atual = s2;
      passos.forEach(s => s.classList.toggle('atual', +s.dataset.k === s2));
      lis.forEach(li => { const k = +li.dataset.k; li.classList.toggle('fora', k < s2); li.classList.toggle('atual', k === s2); });
      aplica(s2, svgD, bD); j.classList.toggle('nivelada', s2 === 3);
    }
  });
  const m = $('[data-jrm]', j); if (!m || m._jrm) return; m._jrm = 1;
  const svgM = $('svg.bal', m), bM = bal(svgM), bts = $$('.jrm-bts button', m), ps = $$('.jrm-p', m);
  let st = -1;
  const vai = k => {
    st = k; aplica(k, svgM, bM); m.classList.toggle('nivelada', k === 3);
    bts.forEach((b, i) => { b.setAttribute('aria-pressed', String(i === k)); b.classList.toggle('fora', i < k); b.classList.toggle('atual', i === k); });
    ps.forEach(p => { const on = +p.dataset.k === k; p.hidden = !on; p.classList.toggle('atual', on); });
  };
  bts.forEach(b => b.addEventListener('click', () => vai(+b.dataset.k === st ? st - 1 : +b.dataset.k)));
  svgM && svgM.addEventListener('click', () => vai(st >= 3 ? -1 : st + 1));
  vai(-1);
}
function montarAreas(s) {
  if (CEL()) { $$('.ha-txt', s).forEach(t => t.removeAttribute('aria-hidden')); return; }
  const cenas = $$('.ha-cena', s), txts = $$('.ha-txt', s), bts = $$('.ha-regua button', s), regua = $('.ha-regua', s), N = cenas.length, TIRAS = innerWidth <= 760 ? 5 : 8;
  let mostrada = 0;
  const mascara = t => {
    const L = [], st = .07, w = (100 / TIRAS + .4).toFixed(3);
    for (let j = 0; j < TIRAS; j++) {
      const q = clamp((t - j * st) / (1 - (TIRAS - 1) * st), 0, 1), e = (suave(q) * 100).toFixed(2);
      L.push(`linear-gradient(${j % 2 ? 'to top' : 'to bottom'},#000000 ${e}%,transparent ${e}%) ${(j / (TIRAS - 1) * 100).toFixed(3)}% 0/${w}% 100% no-repeat`);
    }
    return L.join(',');
  };
  const mostraTxt = k => {
    if (k === mostrada) return; mostrada = k;
    txts.forEach((t, i) => { t.classList.toggle('atual', i === k); t.setAttribute('aria-hidden', String(i !== k)); });
    bts.forEach((b, i) => b.classList.toggle('atual', i === k));
  };
  const aplica = P => {
    const sg = Math.min(N - 1, Math.floor(P)), u = P - sg, t = sg >= N - 1 ? 0 : clamp((u - .3) / .55, 0, 1);
    cenas.forEach((c, i) => {
      if (i <= sg) { c.style.visibility = ''; c.style.webkitMask = c.style.mask = ''; c.style.setProperty('--sai', i === sg ? t.toFixed(3) : '1'); }
      else if (i === sg + 1 && t > 0) { const m = mascara(t); c.style.visibility = ''; c.style.webkitMask = m; c.style.mask = m; c.style.setProperty('--sai', '0'); }
      else c.style.visibility = 'hidden';
    });
    mostraTxt(t >= .5 ? sg + 1 : sg);
    if (regua) regua.style.setProperty('--p', (P / (N - 1)).toFixed(4));
  };
  if (RM) {
    bts.forEach((b, i) => b.addEventListener('click', () => aplica(i)));
    aplica(0); return;
  }
  rolagens.push(() => {
    const r = s.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
    const p = clamp(-r.top / (r.height - vh), 0, 1); aplica(p * (N - 1));
  });
  bts.forEach((b, i) => b.addEventListener('click', () => {
    const r = s.getBoundingClientRect(), topo = scrollY + r.top, alvo = topo + (i / (N - 1)) * (r.height - vh) + (i === N - 1 ? 0 : 2);
    scrollTo({ top: alvo, behavior: 'smooth' });
  }));
  if (FINO) s.addEventListener('mousemove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5, a = cenas[mostrada];
    $$('.cam-assunto', a).forEach(c => c.style.transform = `translate(${(-x * 46).toFixed(1)}px,${(-y * 30).toFixed(1)}px)`);
    $$('.cam-brilho', a).forEach(c => c.style.transform = `translate(${(-x * 80).toFixed(1)}px,${(-y * 50).toFixed(1)}px)`);
    $$('.cam-fundo', a).forEach(c => c.style.transform = `translate(${(x * 20).toFixed(1)}px,${(y * 14).toFixed(1)}px)`);
  });
  aplica(0);
}
function montarAmps(sec) {
  $$('.amp', sec).forEach(a => {
    if (a._ok) return; a._ok = 1;
    const c = $('.ar-c', a), bb = $('.ar-b', a), dur = (+a.dataset.dur || 8) * 1000;
    let t = RM ? .55 : 0, vis = false, raf = 0, ult = 0, virando = false, espera = 0;
    const pinta = () => { c.style.transform = `scaleY(${(1 - t).toFixed(4)})`; bb.style.transform = `scaleY(${t.toFixed(4)})`; a.classList.toggle('escoa', t > 0.002 && t < .998 && !virando && vis); };
    const vira = () => {
      if (virando) return; virando = true; espera = 0; a.classList.remove('escoa'); a.classList.add('vira');
      setTimeout(() => { a.classList.add('sem-trans'); a.classList.remove('vira'); t = 1 - t; pinta(); void a.offsetWidth; a.classList.remove('sem-trans'); a.classList.add('assenta'); setTimeout(() => a.classList.remove('assenta'), 460); virando = false; }, RM ? 0 : 950);
    };
    const laco = now => {
      if (!vis) { raf = 0; return; }
      const dt = Math.min(64, now - ult); ult = now;
      if (!virando) {
        if (t < 1) { t = Math.min(1, t + dt / dur); pinta(); }
        else if (!espera) espera = now; else if (now - espera > 1100) vira();
      }
      raf = requestAnimationFrame(laco);
    };
    const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; pinta(); if (vis && !raf && !RM) { ult = performance.now(); raf = requestAnimationFrame(laco); } }, { threshold: .25 });
    io.observe(a); limpar(a.closest('.pg'), () => { io.disconnect(); vis = false; });
    a.addEventListener('click', e => { if (e.target.closest('a')) return; vira(); });
    a.addEventListener('keydown', e => { if (e.target === a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); vira(); } });
    pinta();
  });
}
function montarRadar(m) {
  if (m._ok) return; m._ok = 1;
  const pts = $$('.rd-pt', m), card = $('.rd-card', m), foco = m.dataset.foco, bloco = m.closest('.hm-mapa-g');
  const raio = bloco && $('.rd-raio input', bloco), saida = bloco && $('.rd-raio output', bloco), lis = bloco ? $$('.rd-lista a', bloco) : [];
  const svg = $('svg', m);
  let fixo = null;
  const mostra = pt => {
    if (!pt) { if (fixo) return mostra(fixo); card.classList.remove('on'); pts.forEach(p => p.classList.remove('ativo')); lis.forEach(l => l.classList.remove('ativo')); $$('.rd-liga', m).forEach(l => l.classList.remove('on')); return; }
    pts.forEach(p => p.classList.toggle('ativo', p === pt));
    lis.forEach(l => l.classList.toggle('ativo', l.dataset.alvo === pt.getAttribute('href').slice(2)));
    $('small', card).textContent = pt.dataset.tipo; $('b', card).textContent = pt.dataset.nome;
    $('span', card).textContent = `cerca de ${Math.round(+pt.dataset.km)} km do escritório, em linha reta`;
    card.style.left = pt.dataset.x + '%'; card.style.top = pt.dataset.y + '%';
    card.classList.toggle('esq', +pt.dataset.x > 62); card.classList.add('on');
    $$('.rd-liga', m).forEach(l => l.classList.toggle('on', l.dataset.p === pt.getAttribute('href').slice(2)));
  };
  pts.forEach(p => { p.addEventListener('mouseenter', () => mostra(p)); p.addEventListener('focus', () => mostra(p)); p.addEventListener('mouseleave', () => mostra(null)); p.addEventListener('blur', () => mostra(null)); });
  lis.forEach(l => { const p = pts.find(x => x.getAttribute('href') === '#/' + l.dataset.alvo); l.addEventListener('mouseenter', () => mostra(p)); l.addEventListener('focus', () => mostra(p)); l.addEventListener('mouseleave', () => mostra(null)); l.addEventListener('blur', () => mostra(null)); });
  if (foco) { fixo = pts.find(p => p.getAttribute('href') === '#/' + foco) || null; mostra(fixo); }
  if (raio && svg) {
    const NS = 'http://www.w3.org/2000/svg', c = document.createElementNS(NS, 'circle'), sede = $('.rd-sede-c', svg);
    c.setAttribute('class', 'rd-raio-c'); c.setAttribute('cx', sede.getAttribute('cx')); c.setAttribute('cy', sede.getAttribute('cy'));
    $('.rd-farol', svg).before(c);
    const atual = () => {
      const v = +raio.value; c.setAttribute('r', (v * (+m.dataset.k || 22)).toFixed(0));
      let n = 0; pts.forEach(p => { const d = +p.dataset.km <= v; p.classList.toggle('dentro', d); if (d) n++; });
      lis.forEach(l => { const p = pts.find(x => x.getAttribute('href') === '#/' + l.dataset.alvo); l.classList.toggle('dentro', !!p && p.classList.contains('dentro')); });
      const nb = $('.rd-n', saida), ant = nb ? nb.textContent : '';
      saida.innerHTML = `<b class="rd-n">${n}</b><span>${n === 1 ? 'região' : 'regiões'} até <b>${String(v).replace('.', ',')} km</b> ${n ? 'além de Santo Amaro' : '(só Santo Amaro)'}</span>`;
      if (ant && ant !== String(n) && !RM) { const b2 = $('.rd-n', saida); b2.classList.add('muda'); }
      raio.style.setProperty('--v', ((v - raio.min) / (raio.max - raio.min) * 100).toFixed(1) + '%');
    };
    raio.addEventListener('input', atual); atual();
  } else pts.forEach(p => p.classList.add('dentro'));
  if (CEL()) radarCel(m, pts, lis, raio, bloco);
  const io = new IntersectionObserver(es => m.classList.toggle('pausa', !es[0].isIntersecting));
  io.observe(m); limpar(m.closest('.pg'), () => io.disconnect());
}
function radarCel(m, pts, lis, raio, bloco) {
  m.classList.add('rd-cel');
  $$('a', m).forEach(a => a.removeAttribute('tabindex'));
  const svg = $('svg', m); svg && svg.removeAttribute('aria-hidden');
  const cc = document.createElement('div'); cc.className = 'rd-cc'; cc.hidden = true; cc.setAttribute('aria-live', 'polite');
  m.after(cc);
  const nomeDe = p => p.dataset.nome, rotaDe = p => p.getAttribute('href').slice(2);
  const toca = p => {
    if (!p) return;
    pts.forEach(x => x.classList.toggle('ativo', x === p));
    lis.forEach(l => l.classList.toggle('ativo', l.dataset.alvo === rotaDe(p)));
    $$('.rd-liga', m).forEach(l => { const on = l.dataset.p === rotaDe(p); l.classList.toggle('on', false); if (on) { void l.getBoundingClientRect(); l.classList.add('on'); } });
    const zap = WA(`Olá! Vim pelo site da Advocacia Teixeira Mendes. Estou em ${nomeDe(p)} e gostaria de combinar um atendimento.`);
    cc.innerHTML = `<div class="rd-mc-t"><small>${p.dataset.tipo}</small><b>${nomeDe(p)}</b><span>cerca de ${Math.round(+p.dataset.km)} km do escritório, em linha reta</span></div><div class="rd-mc-a"><a class="btn btn-ouro" href="${zap}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>WhatsApp</a><a class="btn btn-linha" href="#/${rotaDe(p)}">Ver a página</a></div>`;
    cc.hidden = false; cc.classList.remove('vem'); void cc.offsetWidth; cc.classList.add('vem');
  };
  pts.forEach(p => p.addEventListener('click', e => { e.preventDefault(); toca(p); }));
  lis.forEach(l => l.addEventListener('click', e => { const p = pts.find(x => rotaDe(x) === l.dataset.alvo); if (!p || l.classList.contains('ativo')) return; e.preventDefault(); toca(p); }));
  const rr = raio && raio.closest('.rd-raio');
  if (rr && !$('.rd-km', rr)) {
    const g = document.createElement('div'); g.className = 'rd-km'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Distância do escritório');
    g.innerHTML = [5, 10, 12].map(v => `<button type="button" data-v="${v}" aria-pressed="${v === 10}">até ${v} km</button>`).join('');
    raio.after(g);
    $$('button', g).forEach(b => b.addEventListener('click', () => { raio.value = b.dataset.v; raio.dispatchEvent(new Event('input')); $$('button', g).forEach(x => x.setAttribute('aria-pressed', String(x === b))); }));
    raio.value = 10; raio.dispatchEvent(new Event('input'));
  }
  const ord = [...pts].sort((a, b) => +a.dataset.km - +b.dataset.km);
  ord.forEach((p, i) => { p.style.setProperty('--o', i); const l = $(`.rd-liga[data-p="${rotaDe(p)}"]`, m); l && l.style.setProperty('--o', i); });
  if (RM) { m.classList.add('rd-pronto'); return; }
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { m.classList.add('rd-chega'); io.disconnect(); setTimeout(() => { m.classList.add('rd-pronto'); m.classList.remove('rd-chega'); }, 1700 + ord.length * 160); } }, { threshold: .35 });
  io.observe(m); limpar(m.closest('.pg'), () => io.disconnect());
}
function montarEscFoto(s) {
  const im = $('.hm-esc-foto .img', s); if (!im || RM || CEL()) return;
  rolagens.push(() => { const r = s.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; const p = clamp((vh - r.top) / (vh * .9), 0, 1); im.style.setProperty('--fs', (.88 + .12 * p).toFixed(3)); });
}
function montarCabSaida(pg) {
  if (RM) return;
  const cabs = $$('.cab-secao', pg);
  rolagens.push(() => cabs.forEach(c => {
    const r = c.getBoundingClientRect(), lim = vh * .28;
    if (r.bottom > lim + 200 || r.bottom < -50) { if (c.style.opacity) { c.style.opacity = ''; c.style.transform = ''; } return; }
    const p = clamp((lim - r.bottom) / lim, 0, 1); c.style.opacity = (1 - p * .7).toFixed(3); c.style.transform = `translate3d(0,${(-p * 40).toFixed(1)}px,0)`;
  }));
}
function montarPoeira(c) {
  if (RM || c._ok || CEL()) return; c._ok = 1;
  const ctx = c.getContext('2d'), n = Math.round(+c.dataset.n * (innerWidth < 760 ? .5 : 1)), dpr = Math.min(1.5, devicePixelRatio || 1);
  let w = 0, hh = 0, vis = false, raf = 0; const ps = [];
  const tam = () => { w = c.clientWidth; hh = c.clientHeight; c.width = w * dpr; c.height = hh * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  tam(); for (let i = 0; i < n; i++) ps.push({ x: Math.random() * w, y: Math.random() * hh, r: .6 + Math.random() * 1.9, v: .12 + Math.random() * .42, a: .18 + Math.random() * .55, o: Math.random() * 6.28 });
  const laco = () => {
    if (!vis) return; ctx.clearRect(0, 0, w, hh); ctx.fillStyle = '#F0D179';
    for (const p of ps) { p.y -= p.v; p.o += .012; p.x += Math.sin(p.o) * .25; if (p.y < -6) { p.y = hh + 6; p.x = Math.random() * w; } ctx.globalAlpha = p.a * (.55 + .45 * Math.sin(p.o * 2)); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
    raf = requestAnimationFrame(laco);
  };
  const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; cancelAnimationFrame(raf); if (vis) laco(); });
  io.observe(c); addEventListener('resize', tam);
}
const ioImg = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; ioImg.unobserve(e.target);
  const d = e.target, id = innerWidth <= 760 ? d.dataset.m : d.dataset.d, b = document.getElementById(id), im = $('img', d);
  if (b && im) { im.onload = () => im.classList.add('ok'); im.src = 'data:image/webp;base64,' + b.textContent.trim(); }
}), { rootMargin: '900px 0px' });
const fotoComo = e => { const i = e.target; if (i.matches && i.matches('.hcm-im img.ft')) $$('.hcm-im img.ft[loading="lazy"]').forEach(x => { x.loading = 'eager'; }); };
document.addEventListener('load', fotoComo, true); document.addEventListener('error', fotoComo, true);
function carregarImagens(raizEl) { $$('.img[data-d]', raizEl).forEach(d => { if (!d._obs) { d._obs = 1; ioImg.observe(d); } }); }
(function fundo3d() {
  const box = $('.fundo3d'); if (!box) return;
  const cv = $('.f3-tela', box);
  const luzes = () => { const h = (document.documentElement.scrollHeight - innerHeight) || 1; box.style.setProperty('--f3p', clamp(scrollY / h, 0, 1).toFixed(4)); };
  if (!FINO || innerWidth < 981 || !cv.getContext) { cv.remove(); return; }
  addEventListener('scroll', luzes, { passive: true }); luzes();
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, mx = 0, my = 0, ult = 0, vivo = !document.hidden, rodando = false;
  const tam = () => { const dpr = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (RM) desenha(0); };
  const LIN = 24, PTS = 44;
  function desenha(t) {
    ctx.clearRect(0, 0, W, H);
    const sc = scrollY * .0004, hz = H * (.42 + my * .04);
    for (let j = 0; j < LIN; j++) {
      const zz = j / (LIN - 1), z = 1.1 + zz * 8.5;
      ctx.beginPath();
      for (let i = 0; i < PTS; i++) {
        const xx = (i / (PTS - 1) - .5) * 18 + mx * 1.4;
        const h = Math.sin(xx * .5 + t * .00032 + zz * 3.2 + sc * 5) * .34 + Math.cos(zz * 5.5 - t * .00022 + xx * .28) * .22;
        const px = W / 2 + xx / z * W * .5, py = hz + (1.5 - h) / z * H * .5;
        if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.strokeStyle = `rgba(234,190,71,${((1 - zz) * .085 + .015).toFixed(3)})`; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  function laco(t) { if (!vivo) { rodando = false; return; } if (t - ult > 33) { desenha(t); ult = t; } requestAnimationFrame(laco); }
  const liga = () => { if (!rodando && vivo && !RM) { rodando = true; requestAnimationFrame(laco); } };
  tam(); addEventListener('resize', tam);
  addEventListener('pointermove', e => { mx = e.clientX / W - .5; my = e.clientY / H - .5; }, { passive: true });
  document.addEventListener('visibilitychange', () => { vivo = !document.hidden; liga(); });
  if (RM) desenha(0); else liga();
})();
if (FINO && !RM) {
  const luz = $('.luz'); let lx = innerWidth / 2, ly = innerHeight / 3, tx = lx, ty = ly, mov = false;
  const laco = () => { lx += (tx - lx) * .08; ly += (ty - ly) * .08; luz.style.transform = `translate3d(${lx.toFixed(1)}px,${ly.toFixed(1)}px,0)`; if (Math.abs(tx - lx) + Math.abs(ty - ly) > .5) requestAnimationFrame(laco); else mov = false; };
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; if (!mov) { mov = true; requestAnimationFrame(laco); } }, { passive: true });
  let mag = null;
  document.addEventListener('mousemove', e => {
    const b = e.target.closest('.btn'); if (mag && mag !== b) { mag.style.transform = ''; mag = null; } if (!b) return;
    mag = b; const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .2).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * .3).toFixed(1)}px)`;
  }, { passive: true });
}

function motor(def, alvo, b, aoFim) {
  const resp = [];
  const prog = alvo.prog;
  function desenhaProg() { if (prog) $$('i', prog).forEach((i, k) => i.classList.toggle('ok', k < resp.length)); }
  function pergunta() {
    desenhaProg();
    const q = def.perguntas[resp.length];
    alvo.corpo.innerHTML = `<div class="tm-passo"><div class="tm-q">Pergunta ${resp.length + 1} de ${def.perguntas.length}</div><h3>${q.q}</h3><div class="tm-opc">${q.op.map((o, k) => `<button type="button" data-k="${k}">${o}<svg aria-hidden="true"><use href="#i-seta"/></svg></button>`).join('')}</div>${resp.length ? '<button type="button" class="tm-voltar"><svg aria-hidden="true"><use href="#i-seta"/></svg>Voltar</button>' : ''}</div>`;
    $$('.tm-opc button', alvo.corpo).forEach(bt => bt.addEventListener('click', () => {
      resp.push(+bt.dataset.k); b && b.impulso(resp.length % 2 ? 46 : -46);
      if (resp.length < def.perguntas.length) pergunta(); else { desenhaProg(); b && b.mira(0); aoFim(resp); }
    }));
    const v = $('.tm-voltar', alvo.corpo); v && v.addEventListener('click', () => { resp.pop(); b && b.impulso(-30); pergunta(); });
    const f = $('.tm-opc button', alvo.corpo); f && alvo.foco !== false && f.focus({ preventScroll: true });
  }
  pergunta();
  return { reiniciar() { resp.length = 0; pergunta(); } };
}
function mensagem(base, P, resp, ext = {}) {
  const linhas = P.map((q, k) => resp[k] !== undefined ? linhaMsg(q.rot, q.op[resp[k]]) : '');
  const docs = ext.tem || ext.falta ? [listaMsg('Já separei', ext.tem || []), listaMsg('Ainda falta separar', ext.falta || [])].filter(Boolean).join('\n\n') : '';
  return montaMsg([fraseDe(base), linhas, ext.caminho ? linhaMsg('Caminho visto no site', ext.caminho) : '', docs, ext.fecho || 'Gostaria de agendar uma conversa.'], ext.ola || OLA);
}
const tm = $('.triagem-m');
let tmOrigem = null;
function abrirTriagem(id) {
  const def = achaDef(id); if (!def) return;
  fecharMenu(); fecharDrops();
  const casos = pagina && $$('.hm-casos', pagina).find(c => c._tem && c._tem(id));
  if (casos) {
    casos.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => casos._escolhe(id), RM ? 0 : 450); return;
  }
  tmOrigem = document.activeElement;
  $('.tm-sit', tm).textContent = def.titulo;
  tm.classList.add('aberta'); tm.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
  camadaAbre('triagem', () => fecharTriagem(true, true));
  const b = bal($('svg.bal', tm)); b.vis = true; b.impulso(-40);
  funil(def, $('.tm-corpo-in', tm), { rolo: $('.tm-corpo', tm), bal: b });
}
function fecharTriagem(rapido, semHist) {
  if (!tm || !tm.classList.contains('aberta')) return;
  tm.classList.remove('aberta'); tm.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
  if (!semHist) camadaSai('triagem');
  if (!rapido && tmOrigem) tmOrigem.focus({ preventScroll: true });
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-triagem]');
  if (t) { e.preventDefault(); abrirTriagem(t.dataset.triagem); return; }
  if (e.target.closest('[data-fecha-triagem]')) fecharTriagem();
  if (e.target.closest('.triagem-m .hf-fim a[href^="#/"],.triagem-m .hf-fim a[data-v^="#/"]')) fecharTriagem(true);
});
tm && tm.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const f = $$('button, a[href]', tm).filter(x => x.offsetParent); if (!f.length) return;
  if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
  else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
});

function montarPainelCaso(p) {
  const def = D.paineis[p.dataset.painel]; if (!def) return;
  const b = bal($('svg.bal', p));
  const alvo = { corpo: $('.pc-corpo', p), prog: $('.tm-prog', p), foco: false };
  const m = motor(def, alvo, b, resp => {
    const msg = mensagem(def.wa, def.perguntas, resp);
    alvo.corpo.innerHTML = `<div class="tm-passo pc-fim"><h3>Pronto. Agora é só enviar.</h3><p>A mensagem já vai com as suas respostas para o escritório entender o seu caso antes da conversa.</p>
      <a class="btn btn-ouro" href="${WA(msg)}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>Enviar pelo WhatsApp</a>
      <button type="button" class="pc-rec">Responder de novo</button></div>`;
    $('.pc-rec', alvo.corpo).addEventListener('click', () => { alvo.foco = true; m.reiniciar(); });
  });
}

const DIA = 864e5;
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const fmtD = d => new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const fmtDc = d => new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
const fmtMA = d => { const x = new Date(d); return MESES[x.getUTCMonth()].slice(0, 3) + '/' + String(x.getUTCFullYear()).slice(2); };
const fmtR = v => (+v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtV = v => 'R$ ' + (+v || 0).toLocaleString('pt-BR', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
const fmtN = v => (+v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const hojeUTC = () => { const h = new Date(); return Date.UTC(h.getFullYear(), h.getMonth(), h.getDate()); };
const isoUTC = ts => new Date(ts).toISOString().slice(0, 10);
const lerData = v => { if (!v) return null; const [a, m, d] = String(v).split('-').map(Number); return a > 1900 && m && d ? Date.UTC(a, m - 1, d) : null; };
const somaMeses = (ts, n) => { const d = new Date(ts), y = d.getUTCFullYear(), m = d.getUTCMonth() + n, dia = d.getUTCDate(); const ult = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); return Date.UTC(y, m, Math.min(dia, ult)); };
const lerNum = v => { const n = parseFloat(String(v || '').replace(/[^\d,.]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; };
const anosMeses = k => { const a = Math.floor(k / 12), m = k % 12; return [a ? a + (a > 1 ? ' anos' : ' ano') : '', m ? m + (m > 1 ? ' meses' : ' mês') : ''].filter(Boolean).join(' e ') || 'menos de 1 mês'; };
const icn = n => `<svg aria-hidden="true"><use href="#i-${n}"/></svg>`;
const pl = (n, a, b) => (n === 1 ? a : b);
const frase = t => { const m = String(t || '').match(/^[\s\S]*?[.!?](?=\s|$)/); return m ? m[0] : String(t || ''); };
const vzVazio = (i, t) => `<div class="vz vz-vazio" data-chave="vazio">${icn(i)}<p>${t}</p></div>`;
const vzErro = t => ({ html: `<div class="vz vz-erro" data-chave="erro"><b>Confira os dados</b><p>${t}</p></div>` });
const vzConta = (rot, html) => `<details class="vz-conta"><summary>${rot}</summary>${html}</details>`;

function contaApos(e) {
  const mulher = e.sexo !== 'h', antes = e.antes === 's', continua = e.cont === 's';
  const idade0 = e.ia * 12 + e.im, c0 = e.ca * 12 + e.cm;
  const h = new Date(), y0 = h.getFullYear(), m0 = h.getMonth();
  const pts = a => mulher ? Math.min(100, 86 + Math.max(0, a - 2019)) : Math.min(105, 96 + Math.max(0, a - 2019));
  const idMin = a => mulher ? Math.min(62, 56 + .5 * Math.max(0, a - 2019)) : Math.min(65, 61 + .5 * Math.max(0, a - 2019));
  const cMin = mulher ? 360 : 420;
  const R = antes ? [
    { nome: 'Aposentadoria por idade', curto: 'Por idade', req: mulher ? '62 anos de idade e 15 de contribuição' : '65 anos de idade e 15 de contribuição', ok: (A, C) => A >= (mulher ? 744 : 780) && C >= 180 },
    { nome: 'Regra dos pontos', curto: 'Pontos', req: `${mulher ? 30 : 35} anos de contribuição e pontos (idade + contribuição) que sobem 1 por ano até ${mulher ? 100 : 105}`, ok: (A, C, a) => C >= cMin && (A + C) >= pts(a) * 12 },
    { nome: 'Idade mínima progressiva', curto: 'Idade mínima', req: `${mulher ? 30 : 35} anos de contribuição e idade mínima que sobe 6 meses por ano até ${mulher ? 62 : 65}`, ok: (A, C, a) => C >= cMin && A >= idMin(a) * 12 }
  ] : [
    { nome: 'Aposentadoria por idade', curto: 'Por idade', req: mulher ? '62 anos de idade e 15 de contribuição' : '65 anos de idade e 20 de contribuição', ok: (A, C) => A >= (mulher ? 744 : 780) && C >= (mulher ? 180 : 240) }
  ];
  R.forEach(r => {
    r.k = null;
    for (let k = 0; k <= 600; k++) {
      const a = y0 + Math.floor((m0 + k) / 12), A = idade0 + k, C = c0 + (continua ? k : 0);
      if (r.ok(A, C, a)) { r.k = k; r.a = a; r.m = (m0 + k) % 12; break; }
    }
  });
  const melhor = R.filter(r => r.k !== null).sort((a, b) => a.k - b.k)[0] || null;
  return { R, melhor, mulher, idade0, c0, continua, y0, m0 };
}
const apOk = e => e.ca * 12 + e.cm <= e.ia * 12 + e.im - 168;

const TIPO_RC = { 'sem-justa-causa': 'Demitido sem justa causa', pedido: 'Pedi demissão', 'justa-causa': 'Demitido por justa causa', acordo: 'Acordo com a empresa', 'fim-experiencia': 'Fim do contrato de experiência' };
const rcOk = e => { const a = lerData(e.ad), s = lerData(e.sa); return !!a && !!s && s > a && s <= hojeUTC() + 60 * DIA; };


const PZ = {
  inss: { nome: 'Recurso no INSS', q: 'Quando você soube da decisão do INSS?', base: 'Decreto 3.048/1999, art. 305', link: 'direito-previdenciario/aposentadorias',
    nota: 'São 30 dias contados da ciência da decisão. Se o último dia cair em sábado ou domingo, a conta passa para o dia útil seguinte.',
    venc: 'Mesmo depois do prazo do recurso, pode haver caminho, como um novo pedido ou a ação na Justiça Federal.' },

  inv: { nome: 'Inventário', q: 'Qual foi a data do falecimento?', base: 'Código de Processo Civil, art. 611; Lei SP 10.705/2000', link: 'familia-e-sucessoes/inventario-e-sucessao' }
};
function contaPrazo(e) {
  const t = PZ[e.tp], d = lerData(e.d), hj = hojeUTC();
  if (!t || !d) return null;
  let ini = d, fim, avDias = 0;
  if (e.tp === 'inss') { fim = d + 30 * DIA; while ([0, 6].includes(new Date(fim).getUTCDay())) fim += DIA; }
  if (e.tp === 'trab') { if (e.av === 's') { avDias = Math.min(90, 30 + 3 * e.anos); ini = d + avDias * DIA; } fim = somaMeses(ini, 24); }
  if (e.tp === 'inv') fim = d + 60 * DIA;
  const total = Math.max(1, (fim - d) / DIA), resta = Math.round((fim - hj) / DIA);
  return { t, d, ini, fim, resta, fr: Math.max(0, Math.min(1, resta / total)), avDias, hj };
}
const AMP_P = 'M16 14C16 58 46 66 46 84S16 110 16 154H80C80 110 50 102 50 84S80 58 80 14Z';
const ampSvg = (fr, fio) => `<svg viewBox="0 0 96 168" aria-hidden="true"><defs><clipPath id="pvc"><path d="${AMP_P}"/></clipPath><linearGradient id="pvg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3DC96"/><stop offset="1" stop-color="#C89F42"/></linearGradient></defs><rect class="tamp" x="6" y="4" width="84" height="8" rx="3"/><rect class="tamp" x="6" y="156" width="84" height="8" rx="3"/><g clip-path="url(#pvc)"><rect class="pa-c" x="8" y="24" width="80" height="60" style="transform:scaleY(${fr.toFixed(3)})"/><rect class="pa-b" x="8" y="94" width="80" height="60" style="transform:scaleY(${(1 - fr).toFixed(3)})"/><line class="pa-fio${fio ? '' : ' off'}" x1="48" y1="84" x2="48" y2="154"/></g><path class="pa-vid" d="M16 14C16 58 46 66 46 84S16 110 16 154M80 14C80 58 50 66 50 84S80 110 80 154"/></svg>`;
function visorInv(x) {
  const ms = (D.inventario.marcos || []).map(mc => Object.assign({}, mc, { dt: mc.meses ? somaMeses(x.d, mc.meses) : x.d + (mc.dias || 0) * DIA }));
  const r = x.resta;
  const lis = ms.map((mc, k) => {
    const n = Math.round((mc.dt - x.hj) / DIA), st = k === 0 ? 'inicio' : n < 0 ? 'passou' : n <= 15 ? 'breve' : 'ok';
    return `<li class="${st}"><i></i><span><b>${mc.titulo}</b><small>${fmtDc(mc.dt)}</small></span><em>${k === 0 ? 'início' : n < 0 ? 'já passou' : n === 0 ? 'hoje' : `em ${n} ${pl(n, 'dia', 'dias')}`}</em></li>`;
  }).join('');
  const num = r > 0 ? `<i data-num="${r}" data-fmt="d"></i> ${pl(r, 'dia', 'dias')}` : r === 0 ? 'Último dia' : 'Prazo vencido';
  return {
    html: `<div class="vz vz-iv ${r < 0 ? 'vencido' : r <= 7 ? 'urgente' : 'ok'}" data-chave="iv"><div class="vz-top"><small>Inventário · abrir sem multa</small><b class="vz-num${r > 0 ? '' : ' vz-n2'}">${num}</b><span class="vz-sub">${r < 0 ? 'A abertura sem multa ia até' : 'Abertura sem multa até'} ${fmtD(x.fim)}</span></div><ol class="iv-tl">${lis}</ol>${r < 0 ? '<p class="vz-extra">O inventário ainda pode ser aberto. Em São Paulo, o atraso gera multa no ITCMD.</p>' : ''}${vzConta('Ver detalhes', `<ul class="vz-lista">${ms.map(mc => `<li><span>${mc.titulo}<small>${mc.texto}${mc.base_legal ? ' (' + mc.base_legal + ')' : ''}</small></span></li>`).join('')}</ul>`)}</div>`,
    fala: r > 0 ? `Faltam ${r} dias para abrir o inventário sem multa.` : 'O prazo para abrir sem multa já passou.'
  };
}



const lerDocs = id => { try { return JSON.parse(localStorage.getItem('kx-docs-' + id) || '{}') || {}; } catch (e) { return {}; } };
const gravarDocs = (id, m) => { try { localStorage.setItem('kx-docs-' + id, JSON.stringify(m)); } catch (e) {} };
const grupoDocs = e => (D.docs || []).find(x => x.id === e.g);
const contaMarc = e => { const g = grupoDocs(e); return g ? g.itens.filter((_, k) => e.marc[k]).length : 0; };
const DOC_ICO = { aposentadoria: 'ampulheta', pensao: 'familia', acidente: 'capacete', inventario: 'casa', divorcio: 'familia', interdicao: 'pessoa', consignado: 'moeda', juros: 'calc', fraude: 'escudo' };

const ST_INSS = { 'em-analise': ['Em análise', 'relogio', 1, 0, 'Prazo de análise: de 45 a 90 dias'], 'em-exigencia': ['Em exigência', 'doc', 2, 0, 'Responda dentro do prazo da carta'], negado: ['Negado', 'x', 3, 1, '30 dias para recorrer'], cessado: ['Benefício cessado', 'escudo', 3, 1, '30 dias para recorrer'], 'pericia-marcada': ['Perícia marcada', 'calendario', 1, 0, 'Perícia em até 45 dias do agendamento'], 'valor-errado': ['Valor que parece errado', 'moeda', 3, 1, '30 dias para recorrer'] };
const TR_INSS = ['Pedido', 'Análise', 'Exigência', 'Decisão', 'Recurso'];
const sitInss = e => (D.inss.situacoes || []).find(x => x.id === e.st);

const FT = {
  'simulador-de-aposentadoria': {
    ini: () => ({ sexo: '', ia: 55, im: 0, ca: 20, cm: 0, antes: 's', cont: 's' }), vivo: 2,
    link: () => 'direito-previdenciario/aposentadorias',
    aviso: 'Simulação simplificada pelas regras da Reforma da Previdência (Emenda Constitucional 103/2019). Não considera atividade especial, professor, pessoa com deficiência, carência, as regras de pedágio de 50% e de 100% nem o valor do benefício. A análise do CNIS é indispensável.',
    vazio: 'A previsão aparece aqui assim que você informar o tempo de contribuição.',
    passos: [
      { rot: 'Sexo', q: 'Você é:', c: [{ t: 'escolha', k: 'sexo', auto: true, op: [['m', 'Mulher'], ['h', 'Homem']] }], ok: e => !!e.sexo, resp: e => (e.sexo === 'm' ? 'Mulher' : 'Homem') },
      { rot: 'Idade', q: 'Qual é a sua idade?', c: [{ t: 'num', k: 'ia', rot: 'Anos', min: 16, max: 90, un: ['ano', 'anos'] }, { t: 'num', k: 'im', rot: 'Meses', min: 0, max: 11, un: ['mês', 'meses'] }], resp: e => anosMeses(e.ia * 12 + e.im) + ' de idade' },
      { rot: 'Contribuição', q: 'Quanto tempo de contribuição você tem?', ajuda: 'Está no extrato do CNIS, no Meu INSS.', c: [{ t: 'num', k: 'ca', rot: 'Anos', min: 0, max: 50, un: ['ano', 'anos'] }, { t: 'num', k: 'cm', rot: 'Meses', min: 0, max: 11, un: ['mês', 'meses'] }], ok: apOk, resp: e => anosMeses(e.ca * 12 + e.cm) + ' de contribuição' },
      { rot: 'Antes da Reforma', q: 'Já contribuía antes de 13/11/2019?', c: [{ t: 'escolha', k: 'antes', auto: true, op: [['s', 'Sim'], ['n', 'Não']] }], resp: e => (e.antes === 's' ? 'Contribuía antes de 2019' : 'Começou depois de 2019') },
      { rot: 'Continua', q: 'Vai continuar contribuindo?', c: [{ t: 'escolha', k: 'cont', auto: true, op: [['s', 'Sim'], ['n', 'Não']] }], resp: e => (e.cont === 's' ? 'Vai continuar contribuindo' : 'Não vai continuar') }
    ],
    visor(e) {
      if (!apOk(e)) return vzErro('O tempo de contribuição está maior do que a idade permite.');
      const x = contaApos(e), m = x.melhor;
      const ach = x.R.filter(r => r.k !== null).sort((a, b) => a.k - b.k), kmax = Math.max(12, ...ach.map(r => r.k));
      const quando = r => (r.k === 0 ? 'já cumpre hoje' : `${MESES[r.m]} de ${r.a}`);
      const top = m ? (m.k === 0
        ? `<small>Pelos dados informados</small><b class="vz-num vz-n2">Você já cumpre os requisitos</b><span class="vz-sub">${m.nome}</span>`
        : `<small>Você pode se aposentar</small><b class="vz-num">em <i data-num="${m.k}" data-fmt="am"></i></b><span class="vz-sub">${MESES[m.m]} de ${m.a} · ${m.nome}</span>`)
        : `<small>Resultado</small><b class="vz-num vz-n2">Nenhuma regra próxima</b><span class="vz-sub">${x.continua ? 'Vale conferir o CNIS: podem faltar períodos.' : 'Sem novas contribuições, nenhuma regra é alcançada.'}</span>`;
      const pos = r => r.k / kmax * 100;
      const tl = ach.length ? `<ol class="ap-tl" style="--fim:${m ? pos(m).toFixed(1) : 0}%"><li class="hoje" style="--x:0%"><i></i><span><b>Hoje</b>${fmtMA(Date.UTC(x.y0, x.m0, 1))}</span></li>${ach.map(r => `<li class="${r === m ? 'perto' : ''}${pos(r) > 78 ? ' ult' : pos(r) < 16 ? ' ini' : ''}" style="--x:${pos(r).toFixed(1)}%"><i></i><span><b>${r.curto}</b>${r.k === 0 ? 'já cumpre' : fmtMA(Date.UTC(r.a, r.m, 1))}</span></li>`).join('')}</ol>` : '';
      const regras = vzConta('Ver as regras', `<ul class="vz-lista">${x.R.map(r => `<li><span>${r.nome}<small>${r.req}</small></span><b>${r.k === null ? 'não alcança' : quando(r)}</b></li>`).join('')}</ul>`);
      return { html: `<div class="vz vz-ap" data-chave="ap"><div class="vz-top">${top}</div>${tl}${regras}</div>`, fala: m ? (m.k === 0 ? 'Você já cumpre os requisitos.' : `Previsão: ${MESES[m.m]} de ${m.a}, pela ${m.nome.toLowerCase()}.`) : 'Nenhuma regra próxima.' };
    },
    wa(e) {
      const x = contaApos(e), m = x.melhor;
      return montaMsg(['*Simulação de aposentadoria*', [linhaMsg('Perfil', `${x.mulher ? 'Mulher' : 'Homem'}, ${anosMeses(x.idade0)} de idade`), linhaMsg('Contribuição', anosMeses(x.c0)), m ? linhaMsg('Resultado aproximado', `${m.nome}, ${m.k === 0 ? 'já cumpre hoje' : MESES[m.m] + ' de ' + m.a}`) : 'A simulação não encontrou uma regra próxima.'], 'Quero conferir com o meu CNIS.']);
    }
  },

  'onde-meu-pedido-no-inss-parou': {
    ini: () => ({ st: '' }), vivo: 0,
    link: e => { const s = sitInss(e); return (s && s.caminho) || 'direito-previdenciario/aposentadorias'; },
    aviso: 'Orientação geral com base nas regras do INSS e no acordo homologado pelo STF (RE 1.171.152). Cada pedido tem detalhes próprios: confira sempre a carta de decisão e as comunicações do Meu INSS.',
    vazio: 'Escolha a situação para ver o que ela significa e o que fazer.',
    passos: [
      { rot: 'Situação', q: 'Qual situação aparece no Meu INSS?', c: [{ t: 'escolha', k: 'st', auto: true, col: 2, op: (D.inss.situacoes || []).map(s => [s.id, (ST_INSS[s.id] || [s.rotulo])[0], (ST_INSS[s.id] || [0, 'doc'])[1]]) }], ok: e => !!e.st, resp: e => (ST_INSS[e.st] || [''])[0] }
    ],
    visor(e) {
      const s = sitInss(e); if (!s) return null;
      const [curto, , p, prox, selo] = ST_INSS[s.id] || [s.rotulo, 'doc', 1, 0, ''];
      const tr = TR_INSS.map((t, k) => `<li class="${k < p ? 'feito' : k === p ? 'atual' : prox && k === p + 1 ? 'prox' : ''}"><i></i>${t}</li>`).join('');
      const conta = ['negado', 'cessado', 'valor-errado'].includes(s.id);
      return {
        html: `<div class="vz vz-in" data-chave="in"><div class="vz-top"><small>Situação no Meu INSS</small><b class="vz-num vz-n2">${curto}</b><span class="vz-sub">${frase(s.o_que_significa)}</span></div><ol class="in-tr" aria-label="Etapas do pedido">${tr}</ol><div class="in-fazer"><small>O que fazer agora</small><ol>${(s.o_que_fazer || []).slice(0, 3).map(x => `<li>${x}</li>`).join('')}</ol></div>${selo ? `<div class="in-selo">${icn('relogio')}<span>${selo}</span>${conta ? `<button type="button" class="btn-txt" data-outra="contador-de-prazos:inss">Analisar documentação${icn('seta')}</button>` : ''}</div>` : ''}${vzConta('Ver detalhes', `<p>${s.o_que_significa}</p>${s.prazo ? `<p><b>Prazo:</b> ${s.prazo}</p>` : ''}`)}</div>`,
        fala: `${curto}. ${selo}`
      };
    },
    wa: e => { const s = sitInss(e); return montaMsg(['*Pedido no INSS*', [linhaMsg('Situação no Meu INSS', s ? s.rotulo : '')], 'Quero entender o que fazer.']); }
  },

  'contador-de-prazos': {
    ini: m => ({ tp: PZ[m] ? m : '', d: '', av: 'n', anos: 1 }), vivo: 1,
    link: e => (PZ[e.tp] || PZ.inss).link,
    aviso: 'Conta simplificada: não considera feriados nem situações que suspendem ou interrompem o prazo. No inventário, segue o Código de Processo Civil e a lei do ITCMD de São Paulo. Na dúvida, confira com o escritório.',
    vazio: 'Escolha a data para ver quanto tempo ainda resta.',
    passos: [
      { rot: 'Prazo', q: 'Qual prazo você quer contar?', c: [{ t: 'escolha', k: 'tp', auto: true, col: 1, op: [['inss', 'Recurso no INSS', 'escudo', '30 dias da decisão'], ['inv', 'Inventário', 'familia', '2 meses do falecimento']] }], ok: e => !!e.tp, resp: e => PZ[e.tp].nome },
      { rot: 'Data', q: e => (PZ[e.tp] || PZ.inss).q, c: [{ t: 'data', k: 'd', atalhos: true, rot: 'Data' }], ok: e => { const d = lerData(e.d); return !!d && d <= hojeUTC(); }, resp: e => fmtDc(lerData(e.d)) },
      { rot: 'Aviso prévio', se: e => e.tp === 'trab', q: 'O aviso prévio foi indenizado?', ajuda: 'Indenizado é quando a empresa paga o aviso e você não trabalha nesse período.', c: [{ t: 'escolha', k: 'av', col: 2, op: [['n', 'Não'], ['s', 'Sim']] }, { t: 'num', k: 'anos', rot: 'Anos completos na empresa', min: 0, max: 40, un: ['ano', 'anos'], se: e => e.av === 's' }], resp: e => (e.av === 's' ? `Aviso indenizado, ${e.anos} ${pl(e.anos, 'ano', 'anos')} de casa` : 'Aviso não indenizado') }
    ],
    visor(e) {
      const x = contaPrazo(e); if (!x) return null;
      if (x.d > x.hj) return vzErro('A data não pode ser no futuro.');
      if (e.tp === 'inv') return visorInv(x);
      const { t, resta: r, fr, fim } = x, cls = r < 0 ? 'vencido' : r <= 7 ? 'urgente' : 'ok';
      const num = r > 0 ? `<i data-num="${r}" data-fmt="d"></i> ${pl(r, 'dia', 'dias')}` : r === 0 ? 'Vence hoje' : 'Prazo vencido';
      return {
        html: `<div class="vz vz-pz ${cls}" data-chave="pz"><div class="pz-amp">${ampSvg(fr, r > 0)}</div><div class="vz-top"><small>${t.nome} · ${r > 0 ? 'faltam' : r === 0 ? 'último dia' : 'venceu'}</small><b class="vz-num${r > 0 ? '' : ' vz-n2'}">${num}</b><span class="vz-sub">${r < 0 ? `Venceu há ${-r} ${pl(-r, 'dia', 'dias')}, em` : 'Vence em'} ${fmtD(fim)}</span></div>${x.avDias ? `<p class="vz-extra">Aviso projetado de ${x.avDias} dias: a contagem começa em ${fmtD(x.ini)}.</p>` : ''}${r < 0 ? `<p class="vz-extra">${t.venc}</p>` : ''}${vzConta('Ver a conta', `<p>${t.nota}</p><small>${t.base}</small>`)}</div>`,
        fala: r > 0 ? `Faltam ${r} dias. Vence em ${fmtD(fim)}.` : r === 0 ? 'O prazo vence hoje.' : 'O prazo já venceu.'
      };
    },
    wa(e) {
      const x = contaPrazo(e); if (!x) return '';
      return montaMsg(['*Contador de prazos*', [linhaMsg('Prazo', x.t.nome), linhaMsg('Data informada', fmtDc(x.d)), linhaMsg(e.tp === 'inv' ? 'Abertura sem multa até' : 'Vencimento calculado', fmtDc(x.fim))], 'Quero conferir o meu prazo.']);
    }
  },







  'documentos-que-voce-precisa': {
    ini: m => { const g = (D.docs || []).some(x => x.id === m) ? m : ''; return { g, marc: g ? lerDocs(g) : {} }; }, vivo: 1,
    link: e => { const g = grupoDocs(e); return g ? g.caminho : ''; },
    aviso: 'A lista fica guardada só neste aparelho. É uma orientação geral: cada caso pode pedir documentos a mais.',
    vazio: 'Escolha o assunto para ver a lista.', waRot: 'Enviar o que falta',
    passos: [
      { rot: 'Assunto', q: 'Para qual assunto?', c: [{ t: 'escolha', k: 'g', auto: true, col: 2, op: (D.docs || []).map(g => [g.id, g.titulo, DOC_ICO[g.id] || 'doc']), depois: e => { e.marc = lerDocs(e.g); } }], ok: e => !!e.g, resp: e => grupoDocs(e).titulo },
      { rot: 'Documentos', q: 'Toque no que você já tem', c: [{ t: 'docs' }], resp: e => `${contaMarc(e)} de ${grupoDocs(e).itens.length} separados` }
    ],
    visor(e) {
      const g = grupoDocs(e); if (!g) return null;
      const tot = g.itens.length, f = contaMarc(e), falta = g.itens.filter((_, k) => !e.marc[k]);
      return {
        html: `<div class="vz vz-dc${f === tot ? ' completo' : ''}" data-chave="dc"><div class="vz-top"><small>${g.titulo}</small><b class="vz-num"><i data-num="${f}" data-fmt="n"></i> de ${tot}</b><span class="vz-sub">${f === tot ? 'Tudo separado. Pode enviar ao escritório.' : `${pl(tot - f, 'Falta', 'Faltam')} ${tot - f} ${pl(tot - f, 'documento', 'documentos')}`}</span></div><div class="dc-anel"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="t" cx="60" cy="60" r="52"/><circle class="a" cx="60" cy="60" r="52" pathLength="1" style="stroke-dashoffset:${(1 - f / tot).toFixed(4)}"/></svg><span class="dc-pct">${Math.round(f / tot * 100)}%</span><span class="dc-selo">${icn('balanca')}</span></div>${falta.length ? vzConta('Ver o que falta', `<ul class="vz-lista">${falta.map(t => `<li><span>${t}</span></li>`).join('')}</ul>`) : ''}</div>`,
        fala: `${f} de ${tot} documentos separados.`
      };
    },
    wa(e) {
      const g = grupoDocs(e); if (!g) return '';
      const falta = g.itens.filter((_, k) => !e.marc[k]);
      const tem = g.itens.filter((_, k) => e.marc[k]);
      return montaMsg([`*Documentos para ${g.titulo.toLowerCase()}*`, listaMsg('Já separei', tem), falta.length ? listaMsg('Ainda falta separar', falta) : 'Já separei todos os documentos.', 'Gostaria de agendar uma conversa.']);
    }
  }
};

const P = $('#palco');
const PAL = { aberto: false, slug: '', def: null, est: null, i: 0, fim: false, tela: null, foco: null, tAuto: 0, tFala: 0 };

function morph(a, b) {
  if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName || (a.nodeType === 1 && a.getAttribute('data-chave') !== b.getAttribute('data-chave'))) { a.replaceWith(b); return; }
  if (a.nodeType === 3) { if (a.data !== b.data) a.data = b.data; return; }
  if (a.nodeType !== 1) return;
  for (const at of [...a.attributes]) if (!b.hasAttribute(at.name) && !(at.name === 'open' && a.nodeName === 'DETAILS')) a.removeAttribute(at.name);
  for (const at of [...b.attributes]) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
  const ca = [...a.childNodes], cb = [...b.childNodes];
  ca.slice(cb.length).forEach(n => n.remove());
  cb.forEach((n, k) => { if (k < ca.length) morph(ca[k], n); else a.appendChild(n); });
}
function pinta(el, html) { const t = el.cloneNode(false); t.innerHTML = html; morph(el, t); }
const FMT = { R: v => fmtR(v), d: v => String(Math.round(v)), n: v => String(Math.round(v)), am: v => anosMeses(Math.max(0, Math.round(v))) };
function correr(box) {
  $$('[data-num]', box).forEach(el => {
    const alvo = +el.dataset.num, f = FMT[el.dataset.fmt] || FMT.n;
    if (el._alvo === alvo) { el.textContent = f(el._v === undefined ? alvo : el._v); return; }
    el._alvo = alvo;
    const ini = el._v === undefined ? (RM ? alvo : 0) : el._v;
    cancelAnimationFrame(el._raf);
    if (RM || ini === alvo) { el._v = alvo; el.textContent = f(alvo); return; }
    const t0 = performance.now(), dur = 700;
    el.textContent = f(ini);
    const passo = t => { const p = Math.min(1, (t - t0) / dur), q = 1 - Math.pow(1 - p, 3); el._v = ini + (alvo - ini) * q; el.textContent = f(el._v); if (p < 1) el._raf = requestAnimationFrame(passo); else el._v = alvo; };
    el._raf = requestAnimationFrame(passo);
  });
}

function controle(c) {
  const E = PAL.est, w = document.createElement('div');
  w.className = 'pc pk-' + c.t; w._c = c;
  const rot = c.rot ? `<span class="pc-rot">${c.rot}</span>` : '';
  if (c.t === 'escolha') {
    const col = c.col || 2, colm = c.colm || Math.min(col, c.peq ? 4 : 2);
    w.innerHTML = rot + `<div class="pc-op${c.peq ? ' peq' : ''}${colm > 1 ? ' estreito' : ''}" role="group"${c.rot ? ` aria-label="${c.rot}"` : ''} style="--col:${col};--colm:${colm}"></div>`;
    const g = $('.pc-op', w);
    c.op.forEach(([v, t, i, sub]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pc-b'; b.setAttribute('aria-pressed', String(E[c.k] === v));
      b.innerHTML = `${i ? `<span class="pc-bi">${icn(i)}</span>` : ''}<span class="pc-bt">${t}${sub ? `<small>${sub}</small>` : ''}</span><span class="pc-bk" aria-hidden="true">${icn('check')}</span>`;
      b.addEventListener('click', () => {
        E[c.k] = v;
        $$('.pc-b', g).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        b.classList.remove('pulso'); void b.offsetWidth; b.classList.add('pulso');
        if (c.depois) c.depois(E);
        mudou();
        if (c.auto) avancarAuto();
      });
      g.appendChild(b);
    });
  } else if (c.t === 'num') {
    w.innerHTML = rot + `<div class="pc-num" role="group"${c.rot ? ` aria-label="${c.rot}"` : ''}><button type="button" class="pc-m" aria-label="Diminuir">−</button><output aria-live="polite"></output><button type="button" class="pc-p" aria-label="Aumentar">+</button></div>`;
    const out = $('output', w), bm = $('.pc-m', w), bp = $('.pc-p', w), ps = c.passo || 1;
    const mostra = () => { const v = E[c.k]; out.innerHTML = `${c.pre ? `<small>${c.pre}</small>` : ''}<b>${fmtN(v)}</b>${c.un ? `<small>${v === 1 ? c.un[0] : c.un[1]}</small>` : ''}`; bm.disabled = v <= c.min; bp.disabled = v >= c.max; };
    const passo = d => { const v = clamp(+(E[c.k] + d * ps).toFixed(2), c.min, c.max); if (v === E[c.k]) return false; E[c.k] = v; mostra(); mudou(); return true; };
    [[bm, -1], [bp, 1]].forEach(([b, d]) => {
      let t1 = 0, t2 = 0;
      const para = () => { clearTimeout(t1); clearInterval(t2); };
      b.addEventListener('pointerdown', ev => { if (ev.button) return; ev.preventDefault(); para(); passo(d); t1 = setTimeout(() => { t2 = setInterval(() => { if (!passo(d)) para(); }, 85); }, 430); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(x => b.addEventListener(x, para));
      b.addEventListener('click', ev => { if (ev.detail === 0) passo(d); });
      b.addEventListener('contextmenu', ev => ev.preventDefault());
    });
    mostra();
  } else if (c.t === 'faixa') {
    const fm = c.fmt === 'meses' ? (v => `${v} ${pl(v, 'mês', 'meses')}`) : fmtV;
    w.innerHTML = rot + `<input class="pc-txt" inputmode="decimal" autocomplete="off" aria-label="${c.rot || 'Valor'}, digitar"><input type="range" min="${c.min}" max="${c.max}" step="${c.passo || 1}" aria-label="${c.rot || 'Valor'}"><div class="pc-fx" aria-hidden="true"><span>${fm(c.min)}</span><span>${fm(c.max)}${c.fmt === 'meses' ? '' : ' ou mais'}</span></div>`;
    const tx = $('.pc-txt', w), r = $('input[type=range]', w);
    const enche = () => r.style.setProperty('--p', ((clamp(E[c.k], c.min, c.max) - c.min) / (c.max - c.min) * 100).toFixed(2) + '%');
    const mostra = () => { r.value = clamp(E[c.k], c.min, c.max); r.setAttribute('aria-valuetext', fm(E[c.k])); if (document.activeElement !== tx) tx.value = fm(E[c.k]); enche(); };
    r.addEventListener('input', () => { E[c.k] = +r.value; mostra(); mudou(); });
    tx.addEventListener('focus', () => { tx.value = fmtN(E[c.k]); setTimeout(() => tx.select(), 0); });
    tx.addEventListener('input', () => { if (!/\d/.test(tx.value)) return; const v = lerNum(tx.value); E[c.k] = c.fmt === 'meses' ? clamp(Math.round(v), c.min, c.max) : Math.min(Math.max(0, v), 1e7); r.value = clamp(E[c.k], c.min, c.max); enche(); mudou(); });
    tx.addEventListener('blur', mostra);
    tx.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); tx.blur(); } });
    mostra();
  } else if (c.t === 'data') {
    const hj = hojeUTC();
    w.innerHTML = rot + `<div class="pc-data"><input type="date" max="${isoUTC(hj + (c.futuro || 0) * DIA)}" aria-label="${c.rot || 'Data'}">${c.atalhos ? '<div class="pc-at"><button type="button" data-d="0" aria-pressed="false">Hoje</button><button type="button" data-d="1" aria-pressed="false">Ontem</button></div>' : ''}</div>`;
    const inp = $('input', w), ats = $$('.pc-at button', w);
    const marca = () => ats.forEach(b => b.setAttribute('aria-pressed', String(E[c.k] === isoUTC(hj - +b.dataset.d * DIA))));
    inp.value = E[c.k] || '';
    ['input', 'change'].forEach(x => inp.addEventListener(x, () => { E[c.k] = inp.value; marca(); mudou(); }));
    ats.forEach(b => b.addEventListener('click', () => { E[c.k] = inp.value = isoUTC(hj - +b.dataset.d * DIA); marca(); mudou(); }));
    marca();
  } else if (c.t === 'chave') {
    w.innerHTML = `<button type="button" class="pc-sw" role="switch" aria-checked="${!!E[c.k]}"><span>${c.rot}</span><span class="pc-sw-k" aria-hidden="true"><i></i></span></button>`;
    const b = $('button', w);
    b.addEventListener('click', () => { E[c.k] = !E[c.k]; b.setAttribute('aria-checked', String(E[c.k])); mudou(); });
  } else if (c.t === 'docs') {
    const g = grupoDocs(E);
    w.innerHTML = '<div class="pc-docs" role="group" aria-label="Documentos"></div>';
    const box = $('.pc-docs', w);
    (g ? g.itens : []).forEach((t, k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pc-doc'; b.setAttribute('aria-pressed', String(!!E.marc[k]));
      b.innerHTML = `<span class="pc-dk" aria-hidden="true">${icn('check')}</span><span>${t}</span>`;
      b.addEventListener('click', () => { if (E.marc[k]) delete E.marc[k]; else E.marc[k] = 1; b.setAttribute('aria-pressed', String(!!E.marc[k])); gravarDocs(E.g, E.marc); mudou(); });
      box.appendChild(b);
    });
  }
  return w;
}

const aplica = k => { const p = PAL.def.passos[k]; return !!p && (!p.se || p.se(PAL.est)); };
const proximo = (i, dir) => { for (let k = i + dir; k >= 0 && k < PAL.def.passos.length; k += dir) if (aplica(k)) return k; return -1; };
function telaPasso(k) {
  const p = PAL.def.passos[k], d = document.createElement('div');
  d.className = 'ps-tela';
  d.innerHTML = `<h3 class="ps-q" tabindex="-1">${typeof p.q === 'function' ? p.q(PAL.est) : p.q}</h3>${p.ajuda ? `<p class="ps-ajuda">${p.ajuda}</p>` : ''}<div class="ps-ctrls"></div>`;
  const box = $('.ps-ctrls', d);
  p.c.forEach(c => box.appendChild(controle(c)));
  return d;
}
function telaFim() {
  const def = PAL.def, E = PAL.est, d = document.createElement('div'), lk = def.link ? def.link(E) : '';
  d.className = 'ps-tela ps-fim';
  const rs = def.passos.map((p, k) => (aplica(k) && p.resp ? `<li><button type="button" data-ir-passo="${k}"><small>${p.rot}</small><span>${p.resp(E)}</span></button></li>` : '')).join('');
  const outras = (D.ferr || []).filter(x => x.s !== PAL.slug).map(x => `<button type="button" data-outra="${x.s}">${icn(x.i)}<span>${x.t}</span></button>`).join('');
  d.innerHTML = `<h3 class="ps-q" tabindex="-1">Pronto. Este é o resultado.</h3><p class="ps-kx-t">Suas respostas. Toque em uma para mudar.</p><ul class="ps-resps">${rs}</ul>${lk ? `<a class="ps-conf" href="#/${lk}"><span>Quer que o escritório confira o seu caso?<b>Ver o caminho do seu caso</b></span>${icn('seta')}</a>` : ''}<div class="ps-outras"><small>Outras perguntas</small><div>${outras}</div></div>`;
  return d;
}
function trocaTela(nova, dir) {
  const box = $('.pl-passos', P), velha = PAL.tela;
  PAL.tela = nova;
  $$('.ps-tela', box).forEach(x => { if (x !== velha) x.remove(); });
  if (!velha || !dir || RM) { if (velha) velha.remove(); box.appendChild(nova); }
  else {
    velha.classList.add(dir > 0 ? 'sai-e' : 'sai-d'); velha.inert = true; velha.setAttribute('aria-hidden', 'true');
    nova.classList.add(dir > 0 ? 'de-d' : 'de-e'); box.appendChild(nova);
    nova.getBoundingClientRect();
    requestAnimationFrame(() => nova.classList.remove('de-d', 'de-e'));
    setTimeout(() => velha.remove(), 500);
  }
  $('.pl-lado', P).scrollTop = 0; $('.pl-corpo', P).scrollTop = 0; $('.pl-visor', P).scrollTop = 0;
}
function focoTela() { const h = PAL.tela && $('.ps-q', PAL.tela); if (h) setTimeout(() => { if (PAL.aberto) h.focus({ preventScroll: true }); }, 40); }
function irPasso(k, dir) {
  clearTimeout(PAL.tAuto);
  PAL.fim = false; PAL.i = Math.max(0, k); P.classList.remove('fim');
  trocaTela(telaPasso(PAL.i), dir); mudou(); focoTela();
}
function irFim() {
  clearTimeout(PAL.tAuto);
  PAL.fim = true; P.classList.add('fim');
  trocaTela(telaFim(), 1); mudou(); focoTela();
}
function seguir() {
  if (!PAL.def || PAL.fim) return;
  clearTimeout(PAL.tAuto);
  const p = PAL.def.passos[PAL.i]; if (p.ok && !p.ok(PAL.est)) return;
  const n = proximo(PAL.i, 1);
  if (n < 0) irFim(); else irPasso(n, 1);
}
function voltar() {
  if (PAL.fim) { irPasso(proximo(PAL.def.passos.length, -1), -1); return; }
  const k = proximo(PAL.i, -1); if (k >= 0) irPasso(k, -1);
}
function avancarAuto() { clearTimeout(PAL.tAuto); const i = PAL.i; PAL.tAuto = setTimeout(() => { if (PAL.aberto && !PAL.fim && PAL.i === i) seguir(); }, RM ? 120 : 360); }
function mudou() {
  if (!PAL.def) return;
  if (PAL.tela) $$('.pc', PAL.tela).forEach(w => { const c = w._c; if (!c) return; if (c.se) w.hidden = !c.se(PAL.est); if (c.t === 'info') w.innerHTML = c.html(PAL.est); });
  visor(); trilhaPal(); botoes();
}
function visor() {
  const def = PAL.def, V = $('.pl-visor', P), info = (D.ferr || []).find(x => x.s === PAL.slug);
  const r = (PAL.fim || PAL.i >= (def.vivo || 0)) ? def.visor(PAL.est) : null;
  pinta(V, r && r.html ? r.html : vzVazio(info ? info.i : 'calc', def.vazio || 'O resultado aparece aqui enquanto você responde.'));
  correr(V);
  if (r && r.fala) { clearTimeout(PAL.tFala); PAL.tFala = setTimeout(() => { $('.pl-fala', P).textContent = r.fala; }, 900); }
}
function trilhaPal() {
  const T = $('.pl-trilha', P), ps = PAL.def.passos, ks = ps.map((_, k) => k).filter(aplica);
  const pos = PAL.fim ? ks.length : ks.indexOf(PAL.i);
  pinta(T, ks.map((k, n) => `<li class="${n < pos ? 'feito' : n === pos ? 'atual' : ''}"><button type="button" data-ir-passo="${k}"${n < pos ? '' : ' disabled'} title="${ps[k].rot}"><span>${ps[k].rot}${n === pos ? ' (etapa atual)' : ''}</span></button></li>`).join('') + `<li class="pl-selo${PAL.fim ? ' atual' : ''}"><span title="Resultado">${icn('balanca')}</span></li>`);
}
function botoes() {
  const vt = $('.pl-volta', P), sg = $('.pl-segue', P), wa = $('.pl-wa', P), p = PAL.def.passos[PAL.i];
  const semVolta = !PAL.fim && proximo(PAL.i, -1) < 0;
  vt.disabled = semVolta; vt.classList.toggle('oculto', semVolta);
  sg.hidden = PAL.fim; wa.hidden = !PAL.fim;
  if (PAL.fim) { wa.href = WA(PAL.def.wa(PAL.est)); $('span', wa).textContent = PAL.def.waRot || 'Enviar este resultado'; }
  else { sg.disabled = !!(p.ok && !p.ok(PAL.est)); $('span', sg).textContent = proximo(PAL.i, 1) < 0 ? 'Ver resultado' : 'Continuar'; }
}

function abrirPalco(alvo, origem, semHist) {
  const [slug, modo] = String(alvo || '').split(':'), def = FT[slug], info = (D.ferr || []).find(x => x.s === slug);
  if (!def || !info || !P) return;
  const jaAberto = PAL.aberto;
  clearTimeout(PAL.tAuto);
  PAL.slug = slug; P.dataset.ferr = slug; PAL.def = def; PAL.est = def.ini(modo || ''); PAL.fim = false;
  $('.pl-ico', P).innerHTML = icn(info.i); $('.pl-tit small', P).textContent = info.e; $('#pl-t').textContent = info.t;
  const av = $('.pl-aviso-c', P), dt = $('.pl-det', P);
  av.textContent = def.aviso; av.hidden = true; dt.setAttribute('aria-expanded', 'false'); dt.textContent = 'Ver detalhes';
  $('.pl-visor', P).innerHTML = '';
  let k = 0;
  if (modo) { k = def.passos.findIndex(p => !(p.ok && p.ok(PAL.est))); if (k < 0) k = 0; }
  if (!jaAberto) {
    PAL.foco = origem || document.activeElement;
    P.hidden = false; PAL.aberto = true; raiz.classList.add('palco-on');
    $$('.ps-tela', P).forEach(x => x.remove()); PAL.tela = null;
    const cx = $('.pl-caixa', P);
    if (origem && origem.getBoundingClientRect && !RM && innerWidth > 760) {
      const r1 = origem.getBoundingClientRect();
      cx.style.transition = 'none'; cx.style.transform = 'none'; cx.style.opacity = '1';
      const r2 = cx.getBoundingClientRect();
      cx.style.transformOrigin = '0 0';
      cx.style.transform = `translate(${r1.left - r2.left}px,${r1.top - r2.top}px) scale(${(r1.width / r2.width).toFixed(4)},${(r1.height / r2.height).toFixed(4)})`;
      cx.getBoundingClientRect();
      requestAnimationFrame(() => {
        P.classList.add('on');
        cx.style.transition = 'transform .62s var(--e1)'; cx.style.transform = ''; cx.style.opacity = '';
        setTimeout(() => { cx.style.transition = ''; cx.style.transformOrigin = ''; }, 680);
      });
    } else requestAnimationFrame(() => requestAnimationFrame(() => P.classList.add('on')));
  }
  irPasso(k, jaAberto ? 1 : 0);
  if (!semHist) {
    const h = '#/ferramentas/' + slug;
    if (jaAberto || (history.state && history.state.palco)) history.replaceState({ palco: alvo }, '', h);
    else history.pushState({ palco: alvo }, '', h);
  }
}
function fecharPalco(semHist) {
  if (!PAL.aberto) return;
  PAL.aberto = false; clearTimeout(PAL.tAuto);
  P.classList.remove('on'); raiz.classList.remove('palco-on');
  setTimeout(() => { if (!PAL.aberto) { P.hidden = true; $$('.ps-tela', P).forEach(x => x.remove()); PAL.tela = null; } }, RM ? 0 : 520);
  if (!semHist) {
    if (history.state && history.state.palco) history.back();
    else history.replaceState(null, '', '#/' + (pagina ? pagina.dataset.rota : ''));
  }
  const f = PAL.foco; PAL.foco = null;
  if (f && f.isConnected && f.focus) f.focus({ preventScroll: true });
}

if (P) {
  P.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-fecha]')) { fecharPalco(); return; }
    if (t.closest('.pl-segue')) { seguir(); return; }
    if (t.closest('.pl-volta')) { voltar(); return; }
    const ip = t.closest('[data-ir-passo]'); if (ip && !ip.disabled) { irPasso(+ip.dataset.irPasso, -1); return; }
    const ou = t.closest('[data-outra]'); if (ou) { abrirPalco(ou.dataset.outra); return; }
    const dt = t.closest('.pl-det');
    if (dt) { const c = $('.pl-aviso-c', P), ab = c.hidden; c.hidden = !ab; dt.setAttribute('aria-expanded', String(ab)); dt.textContent = ab ? 'Fechar detalhes' : 'Ver detalhes'; }
  });
  P.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const cx = $('.pl-caixa', P);
    const fs = $$('button,a[href],input,summary', cx).filter(x => !x.disabled && !x.closest('[inert],[hidden]') && x.getClientRects().length);
    if (!fs.length) return;
    const a = fs[0], z = fs[fs.length - 1];
    if (!cx.contains(document.activeElement)) { e.preventDefault(); a.focus(); }
    else if (e.shiftKey && (document.activeElement === a || document.activeElement.classList.contains('ps-q'))) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
}
addEventListener('popstate', ev => {
  const st = ev.state;
  if (PAL.aberto && !(st && st.palco)) fecharPalco(true);
  else if (!PAL.aberto && st && st.palco) abrirPalco(st.palco, null, true);
});
if (FINO && !RM) {
  document.addEventListener('pointermove', e => {
    const c = e.target.closest && e.target.closest('.ga-c'); if (!c) return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.setProperty('--tx', (-y * 7).toFixed(2) + 'deg'); c.style.setProperty('--ty', (x * 9).toFixed(2) + 'deg');
    c.style.setProperty('--gx', ((x + .5) * 100).toFixed(1) + '%'); c.style.setProperty('--gy', ((y + .5) * 100).toFixed(1) + '%');
  }, { passive: true });
  document.addEventListener('pointerout', e => { const c = e.target.closest && e.target.closest('.ga-c'); if (c && !c.contains(e.relatedTarget)) { c.style.setProperty('--tx', '0deg'); c.style.setProperty('--ty', '0deg'); } }, { passive: true });
}
if (FINO) document.addEventListener('pointermove', e => {
  const c = e.target.closest && e.target.closest('.fq-c'); if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px'); c.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
}, { passive: true });

const tiraAcento = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const escH = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PARADAS = new Set(['o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'e', 'que', 'meu', 'minha', 'um', 'uma', 'no', 'na', 'em', 'para', 'com', 'eu', 'se', 'me', 'ao', 'por', 'foi', 'ser', 'sou', 'tem', 'como', 'qual', 'quais', 'nao', 'mais', 'esta', 'estou']);
const tokens = q => tiraAcento(q).split(/[^a-z0-9/]+/).filter(t => t.length > 1 && !PARADAS.has(t));
function marca(txt, ts) {
  const o = String(txt || ''); let n = ''; const mapa = [];
  for (let i = 0; i < o.length; i++) for (const ch of tiraAcento(o[i])) { n += ch; mapa.push(i); }
  const on = new Array(o.length).fill(false);
  ts.forEach(t => { let i = n.indexOf(t); while (i >= 0) { for (let j = i; j < i + t.length; j++) on[mapa[j]] = true; i = n.indexOf(t, i + t.length); } });
  let out = '', ab = false;
  for (let i = 0; i < o.length; i++) { if (on[i] && !ab) { out += '<b class="achou">'; ab = true; } if (!on[i] && ab) { out += '</b>'; ab = false; } out += escH(o[i]); }
  return out + (ab ? '</b>' : '');
}
function pontua(e, ts) {
  if (!ts.length) return 0;
  const t = tiraAcento(e.t); let p = 0;
  for (const k of ts) { const noT = t.indexOf(k) >= 0; if (!noT && e.x.indexOf(k) < 0) return 0; p += noT ? 3 : 1; }
  return p + (e.k === 'a' ? .5 : e.k === 'g' ? .7 : 0);
}
const msgDuvida = q => montaMsg(['*Tenho uma dúvida*', q]);
const vazioHTML = q => `<div class="bilhete br-vazio"><small>Não achamos essa dúvida aqui</small><p class="bl-txt">Olá! Vim pelo site da Advocacia Teixeira Mendes e tenho uma dúvida: <span class="bl-duvida">${escH(q)}</span></p><span class="bl-ass">enviada pelo site da Advocacia Teixeira Mendes</span><a class="btn btn-ouro" href="${WA(msgDuvida(q))}" target="_blank" rel="noopener">${icn('wa')}Enviar pelo WhatsApp</a></div>`;

function montarBusca(b) {
  const inp = $('input', b), lp = $('.bc-limpa', b), res = $('.bc-res', b), fala = $('.bc-fala', b), modo = b.dataset.busca, pg = b.closest('.pg');
  let t = 0;
  const roda = () => { const q = inp.value.trim(); lp.hidden = !q; if (!q) $$('.bc-s', b).forEach(x => x.setAttribute('aria-pressed', 'false')); if (modo === 'site') site(q); else faq(q); };
  inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(roda, 80); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Escape' && inp.value) { e.stopPropagation(); inp.value = ''; roda(); }
    if (e.key === 'Enter') { e.preventDefault(); inp.blur(); }
    if (e.key === 'ArrowDown' && res && !res.hidden) { e.preventDefault(); const a = $('.br-i', res); a && a.focus(); }
  });
  lp.addEventListener('click', () => { inp.value = ''; roda(); inp.focus(); });
  $$('.bc-s', b).forEach(s => s.addEventListener('click', () => { inp.value = s.dataset.q; roda(); $$('.bc-s', b).forEach(x => x.setAttribute('aria-pressed', String(x === s))); }));
  if (res) res.addEventListener('keydown', e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault(); const is = $$('.br-i', res), i = is.indexOf(document.activeElement);
    const n = e.key === 'ArrowDown' ? Math.min(is.length - 1, i + 1) : i - 1;
    if (n < 0) inp.focus(); else is[n].focus();
  });
  const noMenu = !!b.closest('.painel-menu');
  const camBusca = ab => { if (noMenu || !CEL()) return; if (ab) camadaAbre('busca', () => { inp.value = ''; lp.hidden = true; res.hidden = true; res.innerHTML = ''; }); else camadaSai('busca'); };
  function site(q) {
    if (noMenu) b.closest('.painel-menu').classList.toggle('pm-buscando', !!q);
    if (!q) { res.hidden = true; res.innerHTML = ''; fala.textContent = ''; camBusca(false); return; }
    camBusca(true);
    const ts = tokens(q);
    const r = (D.busca || []).map(e => ({ e, p: pontua(e, ts) })).filter(x => x.p > 0).sort((x, y) => y.p - x.p);
    const g = { g: [], a: [], p: [], f: [] }; r.forEach(x => { if (g[x.e.k] && g[x.e.k].length < (x.e.k === 'g' ? 3 : 4)) g[x.e.k].push(x.e); });
    const tot = g.g.length + g.a.length + g.p.length + g.f.length;
    res.hidden = false;
    if (!tot) { res.innerHTML = vazioHTML(q); fala.textContent = 'Nenhum resultado. Você pode mandar a dúvida pelo WhatsApp.'; return; }
    const item = e => {
      const ic = e.k === 'a' ? 'doc' : e.k === 'p' ? 'mais' : e.k === 'g' ? 'balanca' : 'calc';
      const at = e.k === 'f' ? `href="#/ferramentas/${e.pl}" data-palco="${e.pl}"` : `href="#/${e.u}"`;
      return `<li><a class="br-i" ${at}><span class="br-ico">${icn(ic)}</span><span class="br-t"><b>${marca(e.t, ts)}</b><small>${marca(e.s, ts)}</small></span>${icn('seta')}</a></li>`;
    };
    const sec = (rot, l, k) => l.length ? `<div class="br-g" style="--g:${k}"><small>${rot} <span>${l.length}</span></small><ul>${l.map(item).join('')}</ul></div>` : '';
    res.innerHTML = sec('Páginas', g.g, 0) + sec('Artigos', g.a, 1) + sec('Perguntas', g.p, 2) + sec('Ferramentas', g.f, 3);
    fala.textContent = `${g.g.length} páginas, ${g.a.length} artigos, ${g.p.length} perguntas e ${g.f.length} ferramentas encontradas.`;
  }
  function faq(q) {
    const ts = tokens(q), filtro = $('.bb-filtro', pg);
    if (ts.length && filtro) $$('.bb-p', filtro).forEach((x, k) => x.setAttribute('aria-pressed', String(k === 0)));
    const v = filtro ? ($('.bb-p[aria-pressed="true"]', filtro) || {}).dataset?.f || '' : '';
    let n = 0;
    $$('.fq2-i', pg).forEach(d => {
      const ok = !ts.length || ts.every(t => d.dataset.x.includes(t));
      d.hidden = !ok; if (ok) n++;
      const qe = $('.fq2-q', d); if (!qe._o) qe._o = qe.textContent;
      qe.innerHTML = ts.length ? marca(qe._o, ts) : escH(qe._o);
    });
    $$('.fq2-g', pg).forEach(g => { g.hidden = (!!v && g.dataset.cat !== v) || !$$('.fq2-i:not([hidden])', g).length; });
    const vz = $('.fq2-vazio', pg);
    if (vz) { vz.hidden = !(ts.length && !n); if (!vz.hidden) { $('.bl-duvida', vz).textContent = q; $('.bl-wa', vz).href = WA(msgDuvida(q)); } }
    fala.textContent = ts.length ? (n ? `${n} perguntas encontradas.` : 'Nenhuma pergunta encontrada. Você pode mandar a dúvida pelo WhatsApp.') : '';
  }
}

function montarFiltro(f) {
  const pg = f.closest('.pg'), ehFaq = !!f.closest('[data-faq2]');
  const itens = () => ehFaq ? $$('.fq2-g', pg) : $$('.bb-grade .art-c2', pg);
  const attr = ehFaq ? 'cat' : 'ass';
  $$('.bb-p', f).forEach(b => b.addEventListener('click', () => {
    if (ehFaq) { const inp = $('.busca input', pg); if (inp && inp.value) { inp.value = ''; inp.dispatchEvent(new Event('input')); $$('.fq2-i', pg).forEach(d => { d.hidden = false; const qe = $('.fq2-q', d); if (qe._o) qe.textContent = qe._o; }); const vz = $('.fq2-vazio', pg); if (vz) vz.hidden = true; } }
    $$('.bb-p', f).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const v = b.dataset.f, els = itens();
    const antes = new Map(els.filter(e => !e.hidden).map(e => [e, e.getBoundingClientRect()]));
    els.forEach(e => { e.hidden = !!v && e.dataset[attr] !== v; });
    if (RM || !Element.prototype.animate) return;
    els.forEach(e => {
      if (e.hidden) return;
      const a = antes.get(e), r = e.getBoundingClientRect();
      if (a) { const dx = a.left - r.left, dy = a.top - r.top; if (dx || dy) e.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' }); }
      else e.animate([{ opacity: 0, transform: 'translateY(16px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 440, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  }));
}

function alterna(d, abrir) {
  const vai = abrir !== undefined ? abrir : !d.open;
  if (vai) { d.open = true; if (RM) d.classList.add('ab'); else requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('ab'))); }
  else { d.classList.remove('ab'); setTimeout(() => { if (!d.classList.contains('ab')) d.open = false; }, RM ? 0 : 400); }
}
function montarFaq2(s) {
  $$('.fq2-i', s).forEach(d => $('summary', d).addEventListener('click', e => { e.preventDefault(); alterna(d); }));
}
function irAncora(id, suave) {
  const alvo = document.getElementById(id); if (!alvo) return;
  if (alvo.tagName === 'DETAILS') { if (alvo.closest('.fq2-g')) alvo.closest('.fq2-g').hidden = false; alvo.hidden = false; alterna(alvo, true); alvo.classList.add('pisca'); setTimeout(() => alvo.classList.remove('pisca'), 2200); }
  setTimeout(() => { const y = alvo.getBoundingClientRect().top + scrollY - (innerWidth < 900 ? 90 : 120); scrollTo({ top: Math.max(0, y), behavior: suave && !RM ? 'smooth' : 'auto' }); }, 70);
}

function montarLeitura(t) {
  const pg = t.closest('.pg'), lb = $('.leitura'), g = $('.lb-g', lb), fio = $('.lb-fio', lb); lb.classList.add('on');
  const hs = $$('h2[id]', t), links = $$('a[href^="#s"]', pg), linha = $('.sumario2 .sm-linha em', pg);
  const pil = $('.art-pilula', pg), pnome = pil && $('.apl-nome', pil), pfalta = pil && $('.apl-falta', pil), pb = pil && $('.apl-b', pil), plista = pil && $('.apl-lista', pil);
  const min = +t.dataset.min || 5;
  const fecha = () => { if (!plista) return; plista.hidden = true; pb.setAttribute('aria-expanded', 'false'); pil.classList.remove('aberta'); };
  const vai = h => { if (!h) return; const y = h.getBoundingClientRect().top + scrollY - (innerWidth < 900 ? 86 : 112); scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' }); };
  const clique = e => { const a = e.target.closest('a[href^="#s"]'); if (!a || !pg.contains(a)) return; e.preventDefault(); vai(pg.querySelector(a.getAttribute('href'))); fecha(); };
  pg.addEventListener('click', clique); limpar(pg, () => pg.removeEventListener('click', clique));
  if (pil) {
    pil.hidden = false;
    pb.addEventListener('click', () => { const ab = plista.hidden; plista.hidden = !ab; pb.setAttribute('aria-expanded', String(ab)); pil.classList.toggle('aberta', ab); });
    const ps = $('.apl-sobe', pil); ps && ps.addEventListener('click', () => { fecha(); scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); const h1 = $('h1', pg); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); } });
    limpar(pg, () => { pil.classList.remove('on'); fecha(); });
  }
  let at = -2;
  rolagens.push(() => {
    const r = t.getBoundingClientRect(), p = clamp((vh * .5 - r.top) / (r.height - vh * .3), 0, 1);
    fio.style.strokeDashoffset = (1 - p).toFixed(4);
    g.setAttribute('transform', `rotate(${(-(1 - p) * 1.6).toFixed(3)} 500 13)`);
    let k = -1; hs.forEach((h, i) => { if (h.getBoundingClientRect().top < vh * .35) k = i; });
    if (k !== at) {
      at = k; const id = k >= 0 ? '#' + hs[k].id : '';
      links.forEach(a => a.classList.toggle('ativo', a.getAttribute('href') === id));
      if (pnome) { pnome.classList.remove('rola'); void pnome.offsetWidth; pnome.textContent = (hs[Math.max(0, k)] || {}).textContent || ''; pnome.classList.add('rola'); }
    }
    if (linha) linha.style.transform = `scaleY(${p.toFixed(3)})`;
    if (pil) { pil.style.setProperty('--p', p.toFixed(3)); pil.classList.toggle('on', r.top < vh * .55 && r.bottom > vh * .6); pfalta.textContent = p >= .97 ? 'leitura concluída' : `faltam ${Math.max(1, Math.ceil(min * (1 - p)))} min`; }
  });
}
function montarPeso(p) {
  const s = $('span', p);
  if (RM) { s.style.fontVariationSettings = '"wght" 520'; p.style.setProperty('--k', 1); return; }
  rolagens.push(() => {
    const r = p.getBoundingClientRect(), k = clamp((vh * .95 - r.top) / (vh * .5), 0, 1);
    s.style.fontVariationSettings = `"wght" ${Math.round(280 + 260 * k)}`; p.style.setProperty('--k', k.toFixed(3));
  });
}

const termoPop = document.createElement('div');
termoPop.className = 'termo-pop'; termoPop.id = 'termo-pop'; termoPop.setAttribute('role', 'tooltip'); termoPop.hidden = true;
document.body.appendChild(termoPop);
let termoAt = null;
function fechaTermo(semHist) { if (!termoAt) return; if (semHist !== true) camadaSai('termo'); termoAt.setAttribute('aria-expanded', 'false'); termoAt.removeAttribute('aria-describedby'); termoAt = null; termoPop.classList.remove('on'); termoPop.hidden = true; }
function posTermo(t) {
  const r = t.getBoundingClientRect(), w = Math.min(320, innerWidth - 32);
  let x = clamp(r.left + r.width / 2 - w / 2, 16, innerWidth - w - 16);
  const baixo = r.bottom + 170 < innerHeight || r.top < 170;
  termoPop.style.width = w + 'px'; termoPop.style.left = x + 'px'; termoPop.style.top = (baixo ? r.bottom + 12 : r.top - 12) + 'px';
  termoPop.classList.toggle('cima', !baixo); termoPop.style.setProperty('--sx', (r.left + r.width / 2 - x).toFixed(0) + 'px');
}
document.addEventListener('click', e => {
  const t = e.target.closest('.termo');
  if (t) {
    e.preventDefault();
    if (termoAt === t) { fechaTermo(); return; }
    fechaTermo(); termoAt = t;
    termoPop.innerHTML = `<b>${escH(t.dataset.termo)}</b><span>${escH((D.termos || {})[t.dataset.termo] || '')}</span>`;
    termoPop.hidden = false; posTermo(t); t.setAttribute('aria-expanded', 'true'); t.setAttribute('aria-describedby', 'termo-pop');
    requestAnimationFrame(() => termoPop.classList.add('on')); if (CEL()) camadaAbre('termo', () => fechaTermo(true)); return;
  }
  if (termoAt && !e.target.closest('.termo-pop')) fechaTermo();
});
addEventListener('scroll', () => { if (termoAt) fechaTermo(); }, { passive: true });
addEventListener('resize', () => { if (termoAt) fechaTermo(); });

const avisoOk = document.createElement('div');
avisoOk.className = 'aviso-ok'; avisoOk.setAttribute('role', 'status');
avisoOk.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1"/></svg><span></span>';
document.body.appendChild(avisoOk);
let tAviso = 0;
function avisar(txt) { $('span', avisoOk).textContent = txt; avisoOk.classList.remove('on'); void avisoOk.offsetWidth; avisoOk.classList.add('on'); clearTimeout(tAviso); tAviso = setTimeout(() => avisoOk.classList.remove('on'), 2300); }
async function copiarTxt(txt) {
  try { await navigator.clipboard.writeText(txt); return true; } catch (e) {
    const ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0';
    document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok;
  }
}
document.addEventListener('click', async e => {
  const c = e.target.closest('[data-copiar]');
  if (c) { e.preventDefault(); const ok = await copiarTxt(c.dataset.copiar); avisar(ok ? (c.dataset.copiarOk || 'Copiado') : 'Não foi possível copiar'); if (ok) { c.classList.add('ok'); setTimeout(() => c.classList.remove('ok'), 1800); } return; }
  if (e.target.closest('[data-imprimir]')) { e.preventDefault(); window.print(); }
});

function statusVivo() { return {ab:false,txt:'Atendimento presencial e on-line mediante agendamento'}; }
function montarContato(pg) {
  const st = $('[data-status-vivo]', pg), m = $('[data-montador]', pg), ct = $('[data-cartao]', pg);
  const tick = () => { const s = statusVivo(); if (st) { st.classList.toggle('aberto', !!s.ab); st.classList.toggle('almoco', !!s.alm); $('span', st).innerHTML = s.txt; } if (m) $('.mt-fora', m).hidden = !!s.ab; };
  tick(); const iv = setInterval(tick, 30000); limpar(pg, () => clearInterval(iv));
  if (m) {
    const E = { frase: '', ass: '', onde: '', hora: '' }, nome = $('input[name=nome]', m), linha = $('input[name=linha]', m), txt = $('.mt-texto', m), wa = $('.mt-wa', m), mail = $('.mt-mail', m);
    const base = mail.getAttribute('href').split('?')[0];
    const monta = () => {
      const pref = [E.onde, E.hora].filter(Boolean).join(', ');
      const n = nome.value.trim(), l = linha.value.trim();
      return montaMsg([E.frase, [n ? linhaMsg('Nome', n) : '', E.ass ? linhaMsg('Assunto', E.ass) : '', pref ? linhaMsg('Prefiro conversar', pref) : '', l ? linhaMsg('Mensagem', /[.!?]$/.test(l) ? l : l + '.') : '']]);
    };
    const semAst = t => t.replace(/\*([^*\n]+)\*/g, '$1');
    const prev = t => escH(t).replace(/\*([^*\n]+)\*/g, '<b>$1</b>');
    const atualiza = efeito => {
      const s = monta();
      if (txt.dataset.msg !== s) { txt.dataset.msg = s; txt.innerHTML = prev(s); if (efeito && !RM) { txt.classList.remove('tinta'); void txt.offsetWidth; txt.classList.add('tinta'); } }
      wa.href = WA(s); mail.href = `${base}?subject=${encodeURIComponent('Contato pelo site' + (E.ass ? ' · ' + E.ass : ''))}&body=${encodeURIComponent(semAst(s))}`;
    };
    $$('.mt-a', m).forEach(b => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      $$('.mt-a', m).forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', String(on));
      E.frase = on ? b.dataset.frase : ''; E.ass = on ? b.dataset.ass : ''; atualiza(true);
    }));
    $$('.mt-seg button', m).forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.k, on = b.getAttribute('aria-pressed') !== 'true';
      $$(`.mt-seg button[data-k="${k}"]`, m).forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', String(on));
      E[k] = on ? b.dataset.v : ''; atualiza(true);
    }));
    [nome, linha].forEach(i => i.addEventListener('input', () => atualiza(false)));
    $$('[data-onde]', pg).forEach(b => b.addEventListener('click', () => {
      const alvo = $(`.mt-seg button[data-v="${b.dataset.onde}"]`, m);
      if (alvo && alvo.getAttribute('aria-pressed') !== 'true') alvo.click();
      $$('[data-onde]', pg).forEach(x => x.classList.toggle('on', x === b));
      const y = m.getBoundingClientRect().top + scrollY - 90; scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
    }));
    atualiza(false);
  }
  if (ct) {
    const w = ct.parentElement, fr = $('.mc-frente', ct), vs = $('.mc-verso', ct), bt = $('.mc-so-desk', ct);
    $$('[data-virar]', ct).forEach(b => b.addEventListener('click', () => {
      const v = !ct.classList.contains('virado');
      ct.classList.toggle('virado', v); fr.setAttribute('aria-hidden', String(v)); vs.setAttribute('aria-hidden', String(!v));
      $$('a,button', fr).forEach(x => { x.tabIndex = v ? -1 : 0; }); $$('button', vs).forEach(x => { x.tabIndex = v ? 0 : -1; });
      bt.setAttribute('aria-expanded', String(v));
      setTimeout(() => (v ? $('button', vs) : bt).focus({ preventScroll: true }), RM ? 0 : 420);
    }));
    if (FINO && !RM) {
      const mv = e => { const r = w.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; ct.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg'); ct.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg'); ct.style.setProperty('--gx', ((x + .5) * 100).toFixed(1) + '%'); ct.style.setProperty('--gy', ((y + .5) * 100).toFixed(1) + '%'); };
      const sai = () => { ct.style.setProperty('--rx', '0deg'); ct.style.setProperty('--ry', '0deg'); };
      w.addEventListener('pointermove', mv); w.addEventListener('pointerleave', sai);
    }
  }
}

function trocaLd(r) {
  let el = document.getElementById('ld-pg'); const dados = (D.ld || {})[r];
  if (!dados) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = 'ld-pg'; document.head.appendChild(el); }
  el.textContent = JSON.stringify(dados);
}

function agoraSP() {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
  const g = k => (p.find(x => x.type === k) || {}).value;
  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { d: dias[g('weekday')], m: (+g('hour') % 24) * 60 + +g('minute') };
}
function status() { $$('[data-status]').forEach(s=>{s.classList.remove('aberto');const x=$('span',s);if(x)x.textContent='Atendimento mediante contato prévio';}); }
function marcarHoje(tb) { const { d } = agoraSP(); $$('tr', tb).forEach(tr => tr.classList.toggle('hoje', +tr.dataset.d === d)); }

if (FINO && !RM) {
  const c = $('.cursor'), sp = $('span', c); let x = -100, y = -100, cx = -100, cy = -100;
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
  (function anda() { cx += (x - cx) * .2; cy += (y - cy) * .2; c.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(anda); })();
  document.addEventListener('mouseover', e => {
    const a = e.target.closest('[data-cursor]');
    c.classList.toggle('on', !!a); c.classList.toggle('grande', !!a); if (a) sp.textContent = a.dataset.cursor;
  });
}


const CAM = [];
let popIgnora = 0, depoisPop = null;
function camadaAbre(n, fecha) {
  if (CAM.some(c => c.n === n)) return;
  CAM.push({ n, fecha });
  history.pushState(Object.assign({}, history.state, { camada: n }), '');
}
function camadaSai(n) {
  const i = CAM.findIndex(c => c.n === n); if (i < 0) return;
  CAM.splice(i, 1);
  if (history.state && history.state.camada === n) { popIgnora++; history.back(); }
}
addEventListener('popstate', () => {
  if (popIgnora) { popIgnora--; if (!popIgnora && depoisPop) { const f = depoisPop; depoisPop = null; f(); } return; }
  const st = history.state || {};
  while (CAM.length && CAM[CAM.length - 1].n !== st.camada) { const c = CAM.pop(); c.fecha(); }
});
document.addEventListener('click', e => {
  if (!CAM.length) return;
  const a = e.target.closest('a[href^="#/"],a[data-v^="#/"]'); if (!a || a.target === '_blank') return;
  const h = a.getAttribute('href'), pal = a.dataset.palco;
  e.preventDefault(); if (pal) e.stopPropagation();
  const n = CAM.length; CAM.splice(0).reverse().forEach(c => c.fecha());
  popIgnora++;
  depoisPop = () => { if (pal) abrirPalco(pal, null); else if (location.hash !== h) location.hash = h; };
  history.go(-n);
}, true);

const PM = $('.painel-menu'), btMenu = $('.bt-menu'), btMenu2 = $('.bt-menu2'), PMR = PM && $('.pm-rola', PM);
let pmOrigem = null, pmUlt = null;
const menuAberto = () => document.body.classList.contains('menu-aberto');
function travaRolagem(v) { raiz.classList.toggle('trava', v); }
function marcarMenu() {
  if (!PM) return;
  const r = pagina ? pagina.dataset.rota : '', raizR = r.split('/')[0];
  $$('.pm-l', PM).forEach(a => a.toggleAttribute('aria-current', a.dataset.rotaL === raizR));
  $$('.pm-a', PM).forEach(b => b.classList.toggle('aqui', b.dataset.n2 === raizR));
  $$('.pm-n2 a', PM).forEach(a => { if (a.getAttribute('href') === '#/' + r) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
}
function nivel(h, inst) {
  if (!PM) return;
  $$('.pm-n2', PM).forEach(d => { d.hidden = d.dataset.h !== h; });
  $('.pm-n1', PM).hidden = !!h;
  $$('.pm-a', PM).forEach(b => b.setAttribute('aria-expanded', String(b.dataset.n2 === h)));
  PM.classList.toggle('pm-em-n2', !!h);
  if (PMR) PMR.scrollTop = 0;
  if (!inst) { const alvo = h ? $(`#pm-n2-${h} .pm-volta`, PM) : $(`.pm-a[data-n2="${pmUlt}"]`, PM); alvo && alvo.focus({ preventScroll: true }); }
  if (h) pmUlt = h;
}
function abrirMenu(o = {}) {
  if (!PM) return;
  if (!menuAberto()) {
    pmOrigem = o.origem || document.activeElement;
    fecharTriagem(true); if (termoAt) fechaTermo();
    document.body.classList.add('menu-aberto'); [btMenu, btMenu2].forEach(x => x && x.setAttribute('aria-expanded', 'true'));
    topo.classList.remove('some'); PM.style.transform = '';
    marcarMenu(); nivel(null, true); travaRolagem(true);
    camadaAbre('menu', () => fecharMenu(true));
  }
  if (o.busca) $('.pm-busca input', PM).focus();
  else PM.focus({ preventScroll: true });
}
function fecharMenu(semHist) {
  if (!PM || !menuAberto()) return;
  document.body.classList.remove('menu-aberto'); [btMenu, btMenu2].forEach(x => x && x.setAttribute('aria-expanded', 'false'));
  travaRolagem(false); PM.style.transform = '';
  const inp = $('.pm-busca input', PM); if (inp && inp.value) { inp.value = ''; inp.dispatchEvent(new Event('input')); }
  if (inp) inp.blur();
  if (semHist !== true) camadaSai('menu');
  const f = pmOrigem; pmOrigem = null; if (f && f.focus && f.isConnected && f !== document.body) f.focus({ preventScroll: true });
}
if (PM) {
  [btMenu, btMenu2].forEach(bt => bt && bt.addEventListener('click', () => menuAberto() ? fecharMenu() : abrirMenu({ origem: bt })));
  $('.pm-fecha', PM) && $('.pm-fecha', PM).addEventListener('click', () => fecharMenu());
  const bb = $('.bt-busca'); bb && bb.addEventListener('click', () => abrirMenu({ busca: true, origem: bb }));
  $('.pm-fundo') && $('.pm-fundo').addEventListener('click', () => fecharMenu());
  PM.addEventListener('click', e => {
    const a = e.target.closest('.pm-a'); if (a) { nivel(a.dataset.n2); return; }
    if (e.target.closest('.pm-volta')) { nivel(null); return; }
  });
  PM.addEventListener('keydown', e => {
    if (e.key === 'Escape' && PM.classList.contains('pm-em-n2')) { e.stopPropagation(); nivel(null); return; }
    if (e.key !== 'Tab') return;
    const fs = $$('a[href],button,input', PM).filter(x => !x.disabled && x.getClientRects().length && !x.closest('[hidden]'));
    if (!fs.length) return;
    const a = fs[0], z = fs[fs.length - 1];
    if (e.shiftKey && (document.activeElement === a || document.activeElement === PM)) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  let y0 = null, dy = 0, pega = false;
  PM.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const naAlca = !!e.target.closest('.pm-alca,.pm-busca'), noTopo = !PMR || PMR.scrollTop <= 0;
    if (!naAlca && !(noTopo && e.target.closest('.pm-rola'))) return;
    y0 = e.touches[0].clientY; dy = 0; pega = false;
  }, { passive: true });
  PM.addEventListener('touchmove', e => {
    if (y0 === null) return;
    dy = e.touches[0].clientY - y0;
    if (!pega && dy > 12 && (!PMR || PMR.scrollTop <= 0)) { pega = true; PM.classList.add('arrasta'); }
    if (pega) PM.style.transform = `translateY(${Math.max(0, dy - 12).toFixed(0)}px)`;
    if (dy < -6 && !pega) y0 = null;
  }, { passive: true });
  const solta = () => {
    if (y0 === null) return; y0 = null; PM.classList.remove('arrasta');
    if (pega && dy > 110) fecharMenu(); else PM.style.transform = '';
    pega = false;
  };
  PM.addEventListener('touchend', solta); PM.addEventListener('touchcancel', solta);
  const bm = $('.pm-busca .busca', PM); bm && montarBusca(bm);
}

const ehCampo = el => !!el && (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || (el.tagName === 'INPUT' && !/^(checkbox|radio|range|button|submit|reset|file|color)$/.test(el.type)));
document.addEventListener('focusin', e => {
  if (!ehCampo(e.target)) return;
  raiz.classList.add('teclado');
  if (CEL() && !e.target.closest('.painel-menu,.ft-palco,.triagem-m')) setTimeout(() => { if (document.activeElement === e.target) e.target.scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' }); }, 380);
});
document.addEventListener('focusout', e => { if (ehCampo(e.target)) setTimeout(() => { if (!ehCampo(document.activeElement)) raiz.classList.remove('teclado'); }, 150); });
if (window.visualViewport) visualViewport.addEventListener('resize', () => { if (innerHeight - visualViewport.height < 120 && !ehCampo(document.activeElement)) raiz.classList.remove('teclado'); });

const CRS_SEL = ['.hm-ferr-g', '.hp-portas', '.ha-txts', '.hcm-dir', '.ampulhetas:not(.solo)', '.ferr', '.hm-arts', '.er-jeito', '.caminho-h', '.eq-g', '.ga-cards', '.sp-pontos', '.bb-grade', '.bb-trilhas', '.af-rel', '.ep-cards', '.lc-blocos'].join(',');
function montarCrs(el) {
  if (el._crs) { el._crs(); return; }
  const itens = [...el.children].filter(c => !c.matches('i,b,.hcm-fim,.ab-ind,[hidden],.crs-ui'));
  if (itens.length < 3) return;
  el.classList.add('crs'); el.setAttribute('aria-roledescription', 'carrossel');
  const ioF = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; $$('img[loading="lazy"]', el).forEach(i => { i.loading = 'eager'; }); ioF.disconnect(); }, { rootMargin: '700px 0px' });
  ioF.observe(el);
  if (!/^(OL|UL)$/.test(el.tagName) && !el.hasAttribute('aria-label')) {
    const s = el.closest('section'), h = s && $('h2', s);
    el.setAttribute('role', 'group'); el.setAttribute('aria-label', (h ? h.textContent.trim().replace(/\s+/g, ' ') + ' · ' : '') + itens.length + ' cartões');
  }
  const n = itens.length;
  itens.forEach((it, k) => { it.classList.add('crs-i'); if (!$('.crs-sr', it)) it.insertAdjacentHTML('beforeend', `<span class="sr crs-sr">, ${k + 1} de ${n}</span>`); });
  const ui = document.createElement('div'); ui.className = 'crs-ui';
  ui.innerHTML = `<span class="crs-n" aria-hidden="true"><b>01</b> / ${String(n).padStart(2, '0')}</span><span class="crs-barra" aria-hidden="true"><i></i></span><span class="crs-dica" aria-hidden="true">deslize${icn('seta')}</span>`;
  el.after(ui);
  const nb = $('b', ui), bar = $('.crs-barra i', ui);
  let raf = 0, at = -1;
  const passo = () => (itens[1].offsetLeft - itens[0].offsetLeft) || el.clientWidth || 1;
  const atual = () => {
    raf = 0;
    const max = el.scrollWidth - el.clientWidth, ativo = max > 4;
    ui.classList.toggle('off', !ativo);
    if (!ativo) { if (at !== -1) { at = -1; itens.forEach(x => x.classList.remove('crs-on')); } return; }
    const x = el.scrollLeft, p = x >= max - 4 ? n - 1 : Math.min(n - 1, x / passo()), k = clamp(Math.round(p), 0, n - 1);
    bar.style.transform = `scaleX(${clamp((k + 1) / n * .35 + x / max * .65, 0, 1).toFixed(3)})`;
    if (k !== at) { at = k; nb.textContent = String(k + 1).padStart(2, '0'); itens.forEach((it, i) => it.classList.toggle('crs-on', i === k)); }
    el.dispatchEvent(new CustomEvent('crs', { detail: { i: k, p } }));
  };
  el._crs = atual;
  el.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(atual); if (!ui.classList.contains('mexeu') && el.scrollLeft > 24) ui.classList.add('mexeu'); }, { passive: true });
  el.addEventListener('keydown', e => {
    if ((e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') || el.scrollWidth - el.clientWidth <= 4 || e.target.matches('input,textarea')) return;
    e.preventDefault(); el.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * passo(), behavior: RM ? 'auto' : 'smooth' });
    setTimeout(() => { const alvo = itens[at]; const f = alvo && (alvo.matches('a,button') ? alvo : $('a,button', alvo)); f && f.focus({ preventScroll: true }); }, RM ? 0 : 380);
  });
  if (!RM) {
    const io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return; io.disconnect();
      if (el.scrollLeft > 4 || el.scrollWidth - el.clientWidth <= 4) return;
      setTimeout(() => { if (el.scrollLeft < 4) { el.classList.add('crs-mostra'); setTimeout(() => el.classList.remove('crs-mostra'), 1300); } }, 350);
    }, { threshold: .6 });
    io.observe(el); limpar(el.closest('.pg') || document.body, () => io.disconnect());
  }
  atual();
}
addEventListener('resize', () => { if (pagina) $$('.crs', pagina).forEach(c => c._crs && c._crs()); });

const VER_MAIS = [['.docs-g ul', 3, 'documentos'], ['.pg:not([data-rota=""]) .hc-lista', 5, 'situações'], ['.pg:not([data-rota=""]) .faq', 3, 'perguntas']];
function montarMais(el, n, rot) {
  if (el._vm || !n) return;
  const it = [...el.children]; if (it.length <= n + 1) return; el._vm = 1;
  it.slice(n).forEach(x => x.classList.add('vm-x')); el.classList.add('vm', 'vm-fechado');
  const b = document.createElement('button'); b.type = 'button'; b.className = 'vm-bt'; b.setAttribute('aria-expanded', 'false');
  b.innerHTML = `Ver mais ${it.length - n} ${rot}${icn('baixo')}`;
  b.addEventListener('click', () => { el.classList.remove('vm-fechado'); b.remove(); const f = $('a,button', it[n]) || it[n]; if (f.focus) { if (!f.matches('a,button')) f.tabIndex = -1; f.focus({ preventScroll: true }); } });
  el.after(b);
}

const RESUMO_SEL = '.es-kx-txt .lead, .lc-txt';
function montarResumo(p) {
  if (p._rs) return; p._rs = 1;
  p.classList.add('kx-curto');
  if (p.scrollHeight <= p.clientHeight + 6) { p.classList.remove('kx-curto'); p._rs = 0; return; }
  const b = document.createElement('button'); b.type = 'button'; b.className = 'kx-bt'; b.setAttribute('aria-expanded', 'false'); b.textContent = 'Ler mais';
  b.addEventListener('click', () => { p.classList.remove('kx-curto'); b.remove(); });
  p.after(b);
}

function montarCel(pg) {
  $$(CRS_SEL, pg).forEach(montarCrs);
  VER_MAIS.forEach(([s, n, r]) => $$(s, pg).forEach(el => montarMais(el, n, r)));
  if (CEL()) {
    $$(RESUMO_SEL, pg).forEach(montarResumo);
  }
  marcarMenu();
}
function rodapeCel() {
  $$('.rodape .rd-gr:not(.rd-ct)').forEach((g, i) => {
    const h = $('h4', g), ul = $('ul', g); if (!h || !ul) return;
    if (!g._ab) {
      g._ab = 1; const t = h.textContent; ul.id = ul.id || 'rd-gr-' + i;
      h.innerHTML = `<button type="button" class="rd-ab" aria-expanded="false" aria-controls="${ul.id}">${t}${icn('baixo')}</button>`;
      $('button', h).addEventListener('click', e => { const b = e.currentTarget, ab = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(ab)); g.classList.toggle('aberto', ab); });
    }
    g.classList.toggle('rd-dobra', CEL());
  });
}
rodapeCel(); CELQ.addEventListener('change', rodapeCel);
CELQ.addEventListener('change', () => { if (pagina) { desmontar(pagina); montar(pagina); } });

status(); setInterval(status, 60000);
atualizarWa(D.waPadrao);
ir(true);
abertura();
})();
