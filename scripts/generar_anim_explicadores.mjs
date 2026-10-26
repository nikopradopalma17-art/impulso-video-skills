#!/usr/bin/env node
// Genera los 6 anim.html de galería para los looks de explainroo
// (estilos/explicador-*/referencia/anim.html) a partir de los tokens REALES
// del tema (engine/themes.js de vincentsch/explainroo, MIT).
//
// Cada anim.html cumple el contrato del motor de estilos IMPULSO IA:
//   canvas #c 1920x1080 · window.DUR · window.ready (fuentes+fondo) ·
//   window.draw({t}) pura y determinista -> JPEG dataURL.
//
// Uso:  node scripts/generar_anim_explicadores.mjs   (desde la raíz del repo)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------------------------------------------------------------------------
 * Tokens tomados literalmente de engine/themes.js (explainroo, MIT).
 * Solo se añaden campos de demo (título, tagline, fuentes-ttf, duración).
 * ------------------------------------------------------------------------ */
const LOOKS = [
  {
    id: 'explicador-paper',
    name: 'paper',
    dur: 4.6,
    background: 'paper', dark: false,
    bg: '#f7f3ea', ink: '#26221d', muted: '#857f73', surface: '#fffdf8', accent: 'red',
    colors: { red: '#df5a3f', orange: '#ee8f3a', yellow: '#f1c04e', green: '#4f9a66', teal: '#2c9c8f', blue: '#3c6fa8', purple: '#7b5fa6', pink: '#e07397', gray: '#8f887b', ink: '#26221d' },
    fonts: [
      { family: 'Kalam', weight: 700, file: 'kalam-700.ttf' },
      { family: 'Kalam', weight: 400, file: 'kalam-400.ttf' },
    ],
    displayFont: { family: 'Kalam', weight: 700 },
    bodyFont: { family: 'Kalam', weight: 400 },
    stroke: { rough: true, roughness: 1.15, width: 4.5 },
    radius: 14, shadow: null, tintStrength: 0.2,
    enter: { shape: 'draw', text: 'write', title: 'write' },
    transition: 'brush',
    title: 'paper', tagline: 'se dibuja mientras la voz narra',
    titleColor: null, // ink
  },
  {
    id: 'explicador-clean',
    name: 'clean',
    dur: 4.6,
    background: 'dots', dark: false,
    bg: '#f4f6fb', ink: '#111827', muted: '#667085', surface: '#ffffff', accent: 'blue',
    colors: { red: '#f04452', orange: '#ff8a3d', yellow: '#f5b829', green: '#12b886', teal: '#0ea5a4', blue: '#3b6cf6', purple: '#7c5cff', pink: '#ec4899', gray: '#98a2b3', ink: '#111827' },
    fonts: [
      { family: 'Plus Jakarta Sans', weight: 800, file: 'plus-jakarta-sans-800.ttf' },
      { family: 'Inter', weight: 400, file: 'inter-400.ttf' },
    ],
    displayFont: { family: 'Plus Jakarta Sans', weight: 800 },
    bodyFont: { family: 'Inter', weight: 400 },
    stroke: { rough: false, width: 3.5 },
    radius: 22,
    shadow: { color: 'rgba(16,24,40,0.12)', blur: 30, y: 12 },
    tintStrength: 0.12,
    enter: { shape: 'pop', text: 'rise', title: 'rise' },
    transition: 'slide',
    title: 'clean', tagline: 'producto y negocio, sin ruido',
    titleColor: null,
  },
  {
    id: 'explicador-chalk',
    name: 'chalk',
    dur: 4.6,
    background: 'chalk', dark: true,
    bg: '#233d31', ink: '#f2f0e6', muted: '#a9b8ae', surface: '#2b4a3c', accent: 'yellow',
    colors: { red: '#f28b82', orange: '#f7b267', yellow: '#f6e27f', green: '#a8e6a1', teal: '#84dcc6', blue: '#9fd3ef', purple: '#c7aef2', pink: '#f6a8bf', gray: '#c9d1cb', ink: '#f2f0e6' },
    fonts: [
      { family: 'Cabin Sketch', weight: 700, file: 'cabin-sketch-700.ttf' },
      { family: 'Patrick Hand', weight: 400, file: 'patrick-hand-400.ttf' },
    ],
    displayFont: { family: 'Cabin Sketch', weight: 700 },
    bodyFont: { family: 'Patrick Hand', weight: 400 },
    stroke: { rough: true, roughness: 1.35, width: 5, texture: 'chalk' },
    radius: 12, shadow: null, tintStrength: 0.16,
    enter: { shape: 'draw', text: 'write', title: 'write' },
    transition: 'brush',
    title: 'chalk', tagline: 'dar clase con tiza viva',
    titleColor: null,
  },
  {
    id: 'explicador-blueprint',
    name: 'blueprint',
    dur: 4.6,
    background: 'grid', dark: true,
    bg: '#12508f', ink: '#f1f7ff', muted: '#a9cbef', surface: '#185c9f', accent: 'yellow',
    colors: { red: '#ff8a80', orange: '#ffbd70', yellow: '#ffd866', green: '#a3f0b8', teal: '#8ff0e4', blue: '#9fd6ff', purple: '#d0b8ff', pink: '#ffb3d1', gray: '#c3daf2', ink: '#f1f7ff' },
    fonts: [
      { family: 'Architects Daughter', weight: 400, file: 'architects-daughter-400.ttf' },
    ],
    displayFont: { family: 'Architects Daughter', weight: 400 },
    bodyFont: { family: 'Architects Daughter', weight: 400 },
    stroke: { rough: true, roughness: 0.55, width: 3.5 },
    radius: 6, shadow: null, tintStrength: 0.14,
    enter: { shape: 'draw', text: 'write', title: 'write' },
    transition: 'wipe',
    title: 'blueprint', tagline: 'el plano técnico de tu idea',
    titleColor: null,
  },
  {
    id: 'explicador-midnight',
    name: 'midnight',
    dur: 4.6,
    background: 'glow', dark: true,
    bg: '#0b1020', ink: '#e8eef8', muted: '#8a97ad', surface: '#141c31', accent: 'teal',
    colors: { red: '#fb7185', orange: '#fb923c', yellow: '#fcd34d', green: '#34d399', teal: '#22d3ee', blue: '#60a5fa', purple: '#a78bfa', pink: '#f472b6', gray: '#64748b', ink: '#e8eef8' },
    fonts: [
      { family: 'Space Grotesk', weight: 700, file: 'space-grotesk-700.ttf' },
      { family: 'Inter', weight: 400, file: 'inter-400.ttf' },
    ],
    displayFont: { family: 'Space Grotesk', weight: 700 },
    bodyFont: { family: 'Inter', weight: 400 },
    stroke: { rough: false, width: 3, glow: 14 },
    radius: 18,
    shadow: { color: 'rgba(0,0,0,0.45)', blur: 34, y: 14 },
    tintStrength: 0.16,
    enter: { shape: 'pop', text: 'rise', title: 'rise' },
    transition: 'zoom',
    title: 'midnight', tagline: 'developer tools con glow',
    titleColor: null,
    titleGlow: '#22d3ee',
  },
  {
    id: 'explicador-editorial',
    name: 'editorial',
    dur: 4.6,
    background: 'paper', dark: false,
    bg: '#f5f1ea', ink: '#1c1a17', muted: '#76706a', surface: '#fffdf9', accent: 'red',
    colors: { red: '#c2462b', orange: '#c7782a', yellow: '#b8932a', green: '#3d7a57', teal: '#2c7a74', blue: '#2f5b88', purple: '#6a4e8c', pink: '#b04870', gray: '#8a847b', ink: '#1c1a17' },
    fonts: [
      { family: 'Instrument Serif', weight: 400, file: 'instrument-serif-400.ttf' },
      { family: 'Inter', weight: 400, file: 'inter-400.ttf' },
    ],
    displayFont: { family: 'Instrument Serif', weight: 400 },
    bodyFont: { family: 'Inter', weight: 400 },
    stroke: { rough: false, width: 2.5 },
    radius: 8,
    shadow: { color: 'rgba(40,32,20,0.10)', blur: 24, y: 8 },
    tintStrength: 0.1,
    enter: { shape: 'fade', text: 'rise', title: 'rise' },
    transition: 'fade',
    title: 'Editorial', tagline: 'ensayos, historia y dinero',
    titleColor: null,
  },
];

/* ---------------------------------------------------------------------------
 * Diagramas: una función por look que pinta su firma visual en la franja
 * central (t en segundos; helpers del runtime: seg/E/T/rough/smooth/arrow).
 * ------------------------------------------------------------------------ */
const DIAGRAMS = {
  paper: `
    // Flujo dibujado a mano: insignia 1 -> flecha -> caja 2 + subrayado doble
    const p1 = seg(t, 1.35, 1.95), p2 = seg(t, 1.75, 2.45), p3 = seg(t, 2.30, 3.05), p4 = seg(t, 3.05, 3.65);
    const y = H * 0.56;
    rough.circle(ctx, W*0.30, y, u*7.2, E.out(p1), { color: L.colors.red, width: L.stroke.width*1.25, amp: u*0.55, phase: 11 });
    if (p1 > 0.55) T.fade(ctx, '1', W*0.30, y+u*2.6, F('display', u*5.2), L.ink, seg(t, 1.6, 1.95));
    arrow(ctx, W*0.40, y, W*0.52, y, E.out(p2), { color: L.ink, width: L.stroke.width, amp: u*0.5, phase: 7, head: 26 });
    rough.rect(ctx, W*0.545, y-u*6.2, u*17, u*12.4, E.out(p3), { color: L.ink, width: L.stroke.width, amp: u*0.55, phase: 23 });
    if (p3 > 0.5) T.writeOn(ctx, 'paso 2', W*0.545+u*8.5, y+u*0.9, F('body', u*3.4), L.ink, seg(t, 2.7, 3.15), { marker: u*0.6 });
    // subrayado doble de énfasis
    const ux = W*0.362, uy = H*0.72;
    rough.line(ctx, ux, uy, ux + u*12*E.out(p4), uy, 1, { color: L.colors.red, width: L.stroke.width*0.9, amp: u*0.4, phase: 31 });
    if (p4 > 0.6) rough.line(ctx, ux-u*0.4, uy+u*1.6, ux + u*12*E.out((p4-0.6)/0.4), uy+u*1.6, 1, { color: L.colors.red, width: L.stroke.width*0.7, amp: u*0.4, phase: 37 });
    if (p4 > 0.15) T.fade(ctx, 'la idea clave, subrayada', ux, uy-u*1.2, F('body', u*2.6), L.muted, seg(t, 3.0, 3.4));
  `,
  clean: `
    // Tres tarjetas blancas que aparecen + chip de acento + conector
    const y = H * 0.55, cw = u*15.5, ch = u*10.5, gap = u*4;
    const xs = [W*0.5 - cw - gap/2 - cw*0.0, W*0.5 + gap/2];
    const labels = ['equipo', 'producto'];
    labels.forEach((lb, i) => {
      const p = seg(t, 1.35 + i*0.45, 1.85 + i*0.45);
      smooth.pop(ctx, xs[i] + cw/2, y, cw, ch, E.back(p), L);
      T.rise(ctx, lb, xs[i] + cw/2, y + u*0.8, F('body', u*2.6), L.ink, p);
    });
    const pc = seg(t, 2.35, 2.95);
    if (pc > 0) {
      smooth.pop(ctx, W*0.5, y - u*1.5, u*10.5, u*5.4, E.back(pc), L, { fill: L.colors.blue, chip: true });
      if (pc > 0.5) T.rise(ctx, 'API', W*0.5, y - u*0.4, F('display', u*2.8), '#ffffff', (pc-0.5)/0.5);
    }
    const pa = seg(t, 2.85, 3.35);
    arrow(ctx, xs[0] + cw, y, xs[1], y, E.out(pa), { color: L.colors.blue, width: L.stroke.width, head: 24 });
    const pd = seg(t, 3.25, 3.7);
    if (pd > 0) {
      smooth.pop(ctx, W*0.5, y + u*9.6, u*13, u*4.6, E.back(pd), L, { fill: L.surface, border: L.colors.green });
      if (pd > 0.5) T.rise(ctx, '✓ listo', W*0.5, y + u*10.7, F('body', u*2.4), L.colors.green, (pd-0.5)/0.5);
    }
  `,
  chalk: `
    // Círculo de tiza alrededor de la idea + flecha a la caja de ejemplo
    const p1 = seg(t, 1.35, 2.05), p2 = seg(t, 2.0, 2.7), p3 = seg(t, 2.55, 3.35);
    const y = H * 0.56;
    T.fade(ctx, 'la idea', W*0.30, y + u*1.1, F('body', u*4.2), L.ink, seg(t, 1.3, 1.65));
    rough.circle(ctx, W*0.30, y, u*8.6, E.out(p1), { color: L.colors.yellow, width: L.stroke.width, amp: u*0.7, phase: 13, chalk: true });
    arrow(ctx, W*0.41, y, W*0.52, y, E.out(p2), { color: L.ink, width: L.stroke.width, amp: u*0.6, phase: 17, head: 26, chalk: true });
    rough.rect(ctx, W*0.545, y-u*6.4, u*17, u*12.8, E.out(p3), { color: L.ink, width: L.stroke.width, amp: u*0.7, phase: 29, chalk: true });
    if (p3 > 0.5) T.writeOn(ctx, 'ejemplo', W*0.545+u*8.5, y+u*1.0, F('body', u*3.4), L.ink, seg(t, 2.95, 3.4), { marker: u*0.6, chalk: true });
    if (p3 > 0.2) T.fade(ctx, 'se explica, se entiende', W*0.30, y + u*13.5, F('body', u*2.6), L.muted, seg(t, 3.1, 3.55));
  `,
  blueprint: `
    // Rectángulo acotado como plano: cotas, cruz de ejes y etiqueta
    const p1 = seg(t, 1.35, 2.0), p2 = seg(t, 1.95, 2.55), p3 = seg(t, 2.45, 3.05), p4 = seg(t, 3.0, 3.6);
    const y = H*0.55, rw = u*30, rh = u*11, rx = W*0.5 - rw/2, ry = y - rh/2;
    rough.rect(ctx, rx, ry, rw, rh, E.out(p1), { color: L.ink, width: L.stroke.width, amp: u*0.28, phase: 41 });
    // cota superior con flechas
    const cy = ry - u*3.2;
    arrow(ctx, rx, cy, rx + rw*E.out(p2), cy, 1, { color: L.ink, width: L.stroke.width*0.8, amp: u*0.25, phase: 43, head: 18, both: true });
    if (p2 > 0.4) T.writeOn(ctx, 'ancho', rx + rw/2 - u*2.2, cy - u*1.2, F('body', u*2.2), L.muted, seg(t, 2.2, 2.55));
    // cota lateral
    const cx2 = rx + rw + u*3.4;
    arrow(ctx, cx2, ry, cx2, ry + rh*E.out(p3), 1, { color: L.ink, width: L.stroke.width*0.8, amp: u*0.25, phase: 47, head: 18, both: true });
    if (p3 > 0.4) T.writeOn(ctx, 'alto', cx2 + u*1.4, y + u*1.0, F('body', u*2.2), L.muted, seg(t, 2.7, 3.05));
    // cruz de centro
    rough.line(ctx, W*0.5 - u*2.4, y, W*0.5 + u*2.4*E.out(p4), y, 1, { color: L.colors.yellow, width: L.stroke.width*0.8, amp: u*0.2, phase: 53 });
    if (p4 > 0.5) rough.line(ctx, W*0.5, y-u*2.4, W*0.5, y + u*2.4*E.out((p4-0.5)/0.5), 1, { color: L.colors.yellow, width: L.stroke.width*0.8, amp: u*0.2, phase: 59 });
    if (p4 > 0.3) T.writeOn(ctx, 'así se acota una idea', rx, ry + rh + u*4.6, F('body', u*2.6), L.ink, seg(t, 3.15, 3.7));
  `,
  midnight: `
    // Terminal que se teclea + chip con glow
    const p1 = seg(t, 1.35, 2.1), y = H*0.55, tw = u*36, th = u*11, tx = W*0.5 - tw/2, ty = y - th/2;
    smooth.pop(ctx, W*0.5, y, tw, th, E.back(p1), L, { fill: '#070b16', border: '#26324a' });
    if (p1 > 0.4) {
      // barra superior del terminal
      ctx.save(); ctx.globalAlpha = Math.min(1,(p1-0.4)/0.3);
      ctx.fillStyle = '#141c31'; rrect(ctx, tx, ty, tw, u*2.4, { tl: L.radius, tr: L.radius, br: 0, bl: 0 }); ctx.fill();
      ctx.fillStyle = '#fb7185'; ctx.beginPath(); ctx.arc(tx+u*1.8, ty+u*1.2, u*0.55, 0, 7); ctx.fill();
      ctx.fillStyle = '#fcd34d'; ctx.beginPath(); ctx.arc(tx+u*3.4, ty+u*1.2, u*0.55, 0, 7); ctx.fill();
      ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.arc(tx+u*5.0, ty+u*1.2, u*0.55, 0, 7); ctx.fill();
      ctx.restore();
      const ptype = seg(t, 1.9, 3.3);
      T.typeOn(ctx, '$ npx explainroo init demo', tx + u*2.2, y + u*2.6, F('mono', u*2.6), '#e2e8f0', ptype,
        { cursor: Math.floor(t * 2.4) % 2 === 0, cursorColor: '#22d3ee' });
    }
    const pc = seg(t, 3.35, 3.85);
    if (pc > 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(34,211,238,0.55)'; ctx.shadowBlur = u*3;
      smooth.pop(ctx, W*0.5, y + u*9.4, u*12, u*4.8, E.back(pc), L, { fill: L.surface, border: '#22d3ee', glowBorder: true });
      ctx.restore();
      if (pc > 0.5) T.rise(ctx, '✓ render listo', W*0.5, y + u*10.5, F('body', u*2.4), '#22d3ee', (pc-0.5)/0.5);
    }
  `,
  editorial: `
    // Cita serif con reglas finas, kicker en versalitas y subrayado rojo
    const y = H * 0.55;
    const pr1 = seg(t, 1.35, 1.9);
    roughLine(ctx, W*0.5 - u*17*E.out(pr1), y - u*5.4, W*0.5 + u*17*E.out(pr1), y - u*5.4, 1,
      { color: L.ink, width: L.stroke.width * 0.8 });
    const pk = seg(t, 1.5, 1.9);
    T.rise(ctx, 'ENSAYO · Nº 1', W*0.5, y - u*2.2, F('body', u*1.9), L.muted, pk);
    const pq = seg(t, 1.75, 2.55);
    if (pq > 0) T.rise(ctx, 'La idea, en una línea.', W*0.5, y + u*2.4, F('display', u*6.4), L.ink, pq);
    const pu = seg(t, 2.6, 3.3);
    roughLine(ctx, W*0.5 - u*8, y + u*4.6, W*0.5 - u*8 + u*16 * E.out(pu), y + u*4.6, 1,
      { color: L.colors.red, width: L.stroke.width * 1.1 });
    const pr2 = seg(t, 3.0, 3.55);
    roughLine(ctx, W*0.5 - u*17*E.out(pr2), y + u*7.8, W*0.5 + u*17*E.out(pr2), y + u*7.8, 1,
      { color: L.ink, width: L.stroke.width * 0.8 });
    if (pr2 > 0.5) T.fade(ctx, 'serif sobria, paleta desaturada', W*0.5, y + u*10.6, F('body', u*2.2), L.muted, seg(t, 3.3, 3.7));
  `,
};

/* ---------------------------------------------------------------------------
 * Plantilla del runtime (idéntica para los 6 looks; cambia LOOK y DIAGRAM).
 * ------------------------------------------------------------------------ */
function fontFaceCss(look) {
  return look.fonts.map(f =>
    `@font-face{font-family:'${f.family}';font-weight:${f.weight};src:url('../../fuentes/${f.file}') format('truetype');}`
  ).join('\n');
}

function html(look, diagramSrc) {
  const L = {
    name: look.name, dur: look.dur, background: look.background, dark: look.dark,
    bg: look.bg, ink: look.ink, muted: look.muted, surface: look.surface,
    accent: look.accent, colors: look.colors,
    displayFont: look.displayFont, bodyFont: look.bodyFont,
    stroke: look.stroke, radius: look.radius, shadow: look.shadow,
    enter: look.enter, transition: look.transition,
    title: look.title, tagline: look.tagline, titleGlow: look.titleGlow || null,
    monoFont: { family: 'JetBrains Mono', weight: 400 },
  };
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>look ${look.name} · demo galería (explainroo, MIT)</title>
<style>
${fontFaceCss(look)}
@font-face{font-family:'JetBrains Mono';font-weight:400;src:url('../../fuentes/jetbrains-mono-400.ttf') format('truetype');}
html,body{margin:0;padding:0;background:${look.bg};}
canvas{display:block}
</style>
</head>
<body>
<canvas id="c" width="1920" height="1080"></canvas>
<script>
"use strict";
/* Demo de galería del look "${look.name}" — tokens del tema explainroo (MIT).
   Contrato del motor de estilos: window.DUR / window.ready / window.draw({t}) pura. */
const LOOK = ${JSON.stringify(L, null, 0)};

/* diagrama firma del look (inyectado por el generador) */
const DIAGRAM = function (ctx, t) {${'\n' + diagramSrc + '\n'}};

/* ---------- determinismo: PRNG + value noise ---------- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash1(n){n=Math.sin(n)*43758.5453;return n-Math.floor(n)}
function vnoise(x){const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return hash1(i)*(1-u)+hash1(i+1)*u}

/* ---------- easing ---------- */
const E={
  out:x=>1-Math.pow(1-x,3),
  io:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,
  back:x=>{const c=1.70158,d=c+1;return 1+d*Math.pow(x-1,3)+c*Math.pow(x-1,2)}
};
const clamp01=x=>x<0?0:x>1?1:x;
const seg=(t,a,b)=>clamp01((t-a)/(b-a));

/* ---------- fuentes ---------- */
function F(role,size){
  const f=role==='display'?LOOK.displayFont:role==='body'?LOOK.bodyFont:LOOK.monoFont;
  return f.weight+' '+Math.round(size*100)/100+'px "'+f.family+'", sans-serif';
}

/* ---------- fondo (puerto de makeBackground de explainroo, semilla fija) ---------- */
function makeBackground(){
  const W=1920,H=1080,c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d'),rand=mulberry32(7919+LOOK.name.length);
  const noise=(count,alphaMax,color,sizeMax=1.6)=>{for(let i=0;i<count;i++){g.fillStyle=color.replace('ALPHA',(rand()*alphaMax).toFixed(3));const s=.5+rand()*sizeMax;g.fillRect(rand()*W,rand()*H,s,s)}};
  const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')'};
  switch(LOOK.background){
    case 'paper':{
      g.fillStyle=LOOK.bg;g.fillRect(0,0,W,H);
      noise(Math.round(W*H*.05),.07,rgba('#6b5a3d','ALPHA'));
      noise(Math.round(W*H*.02),.08,rgba('#ffffff','ALPHA'),2);
      g.lineWidth=.7;
      for(let i=0;i<90;i++){g.strokeStyle=rgba('#8a7654',.05+rand()*.05);const x=rand()*W,y=rand()*H,a=rand()*Math.PI,l=8+rand()*26;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a)*l*.5+rand()*4,y+Math.sin(a)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke()}
      const v=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);
      v.addColorStop(0,'rgba(120,96,60,0)');v.addColorStop(1,'rgba(120,96,60,0.10)');g.fillStyle=v;g.fillRect(0,0,W,H);
      break}
    case 'dots':{
      const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,'#f7f8fc');gr.addColorStop(1,'#eef1f8');
      g.fillStyle=gr;g.fillRect(0,0,W,H);
      g.fillStyle='rgba(17,24,39,0.045)';const step=48;
      for(let y=step/2;y<H;y+=step)for(let x=step/2;x<W;x+=step)g.fillRect(x-1.2,y-1.2,2.4,2.4);
      break}
    case 'chalk':{
      const gr=g.createRadialGradient(W*.45,H*.4,0,W/2,H/2,Math.max(W,H)*.8);
      gr.addColorStop(0,'#2a4a3b');gr.addColorStop(1,'#1b3127');g.fillStyle=gr;g.fillRect(0,0,W,H);
      for(let i=0;i<26;i++){const x=rand()*W,y=rand()*H,r=80+rand()*320;const s=g.createRadialGradient(x,y,0,x,y,r);
        s.addColorStop(0,'rgba(235,240,230,0.035)');s.addColorStop(1,'rgba(235,240,230,0)');g.fillStyle=s;g.fillRect(x-r,y-r,r*2,r*2)}
      noise(Math.round(W*H*.03),.06,rgba('#e8efe6','ALPHA'));
      break}
    case 'grid':{
      const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#14589d');gr.addColorStop(1,'#0f4680');
      g.fillStyle=gr;g.fillRect(0,0,W,H);
      const minor=Math.round(Math.min(W,H)/34);g.lineWidth=1;
      for(let x=0;x<=W;x+=minor){g.strokeStyle=x%(minor*5)===0?'rgba(190,225,255,0.20)':'rgba(190,225,255,0.08)';g.beginPath();g.moveTo(x+.5,0);g.lineTo(x+.5,H);g.stroke()}
      for(let y=0;y<=H;y+=minor){g.strokeStyle=y%(minor*5)===0?'rgba(190,225,255,0.20)':'rgba(190,225,255,0.08)';g.beginPath();g.moveTo(0,y+.5);g.lineTo(W,y+.5);g.stroke()}
      noise(Math.round(W*H*.01),.05,rgba('#ffffff','ALPHA'));
      break}
    case 'glow':{
      g.fillStyle=LOOK.bg;g.fillRect(0,0,W,H);
      const glow=(x,y,r,color)=>{const s=g.createRadialGradient(x,y,0,x,y,r);s.addColorStop(0,color);s.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=s;g.fillRect(0,0,W,H)};
      glow(W*.12,H*.08,Math.max(W,H)*.6,'rgba(34,211,238,0.10)');
      glow(W*.92,H*.95,Math.max(W,H)*.55,'rgba(167,139,250,0.10)');
      noise(Math.round(W*H*.01),.05,rgba('#ffffff','ALPHA'));
      break}
  }
  return c;
}

/* ---------- primitivas de dibujo ---------- */
function rrect(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

const T={
  writeOn(ctx,str,x,y,font,color,p,o){o=o||{};if(p<=0)return;
    ctx.save();ctx.font=font;ctx.textAlign=o.align||'left';ctx.textBaseline=o.baseline||'alphabetic';
    const w=ctx.measureText(str).width;
    const px=o.align==='center'?x-w/2:o.align==='right'?x-w:x;
    ctx.beginPath();ctx.rect(px-4,y-200,Math.max(0,w*p)+4,300);ctx.clip();
    ctx.fillStyle=color;ctx.fillText(str,x,y);ctx.restore();
    if(o.marker&&p>0.02&&p<0.999){ctx.save();ctx.fillStyle=color;ctx.beginPath();
      ctx.arc(px+w*p,y-o.marker*1.4,Math.max(2.5,o.marker),0,7);ctx.fill();ctx.restore()}},
  typeOn(ctx,str,x,y,font,color,p,o){o=o||{};const n=Math.floor(str.length*p),s=str.slice(0,n);
    T.writeOn(ctx,s,x,y,font,color,1,{align:o.align});
    if(o.cursor&&p>0.02&&p<0.999){ctx.save();ctx.font=font;ctx.fillStyle=o.cursorColor||color;
      const w=ctx.measureText(s).width;ctx.fillRect(x+w+4,y-24,14,34);ctx.restore()}},
  rise(ctx,str,x,y,font,color,p){if(p<=0)return;const e=E.out(p);
    ctx.save();ctx.globalAlpha=e;ctx.font=font;ctx.textAlign='center';ctx.fillStyle=color;
    ctx.fillText(str,x,y+(1-e)*26);ctx.restore()},
  fade(ctx,str,x,y,font,color,p,o){o=o||{};if(p<=0)return;
    ctx.save();ctx.globalAlpha=E.out(p);ctx.font=font;ctx.textAlign=o.align||'center';ctx.fillStyle=color;
    ctx.fillText(str,x,y);ctx.restore()}
};

function jpt(x,y,amp,ph){return[x+ (vnoise(x*0.012+ph)-0.5)*2*amp, y+(vnoise(y*0.012+ph*1.7+50)-0.5)*2*amp]}

function roughLine(ctx,x1,y1,x2,y2,p,o){if(p<=0)return;o=o||{};
  const n=Math.max(6,Math.round(Math.hypot(x2-x1,y2-y1)/26)),amp=o.amp||3,ph=o.phase||0;
  ctx.save();ctx.strokeStyle=o.color||LOOK.ink;ctx.lineWidth=o.width||LOOK.stroke.width;
  ctx.lineCap='round';if(o.chalk){ctx.globalAlpha=0.92}
  ctx.beginPath();
  const m=Math.max(1,Math.floor(n*p));
  for(let i=0;i<=m;i++){const s=i/n,[jx,jy]=jpt(x1+(x2-x1)*s,y1+(y2-y1)*s,amp,ph+s*3);
    i===0?ctx.moveTo(jx,jy):ctx.lineTo(jx,jy)}
  ctx.stroke();ctx.restore()}

const rough={
  line:roughLine,
  rect(ctx,x,y,w,h,p,o){if(p<=0)return;o=o||{};const ov=(o.overshoot===undefined?6:o.overshoot);
    const q=clamp01(p*4),i=Math.min(3,Math.floor(q)),lp=q-i;const sides=[
      [x,y,x+w+ov,y],[x+w,y,x+w,y+h+ov],[x+w,y+h,x-ov,y+h],[x,y+h,x,y]];
    for(let k=0;k<=i;k++){const s=sides[k];roughLine(ctx,s[0],s[1],s[2],s[3],k<i?1:lp,o)}},
  circle(ctx,cx,cy,r,p,o){if(p<=0)return;o=o||{};const amp=o.amp||3,ph=o.phase||0;
    ctx.save();ctx.strokeStyle=o.color||LOOK.ink;ctx.lineWidth=o.width||LOOK.stroke.width;ctx.lineCap='round';
    if(o.chalk)ctx.globalAlpha=0.92;
    const total=Math.PI*2*1.06,steps=Math.max(24,Math.round(r/4));
    ctx.beginPath();
    const m=Math.max(2,Math.floor(steps*p));
    for(let i=0;i<=m;i++){const th=-Math.PI/2+total*(i/steps);
      const rr=r+(vnoise(th*1.9+ph)-0.5)*2*amp;
      const jx=cx+Math.cos(th)*rr+(vnoise(i*0.7+ph)-0.5)*amp,jy=cy+Math.sin(th)*rr+(vnoise(i*0.9+ph+31)-0.5)*amp;
      i===0?ctx.moveTo(jx,jy):ctx.lineTo(jx,jy)}
    ctx.stroke();ctx.restore()}
};

function arrow(ctx,x1,y1,x2,y2,p,o){if(p<=0)return;o=o||{};
  roughLine(ctx,x1,y1,x1+(x2-x1)*Math.min(1,p*1.25),y1+(y2-y1)*Math.min(1,p*1.25),1,o);
  if(p<0.85)return;
  const ang=Math.atan2(y2-y1,x2-x1),hl=o.head||22,hw=hl*0.62;
  ctx.save();ctx.strokeStyle=o.color||LOOK.ink;ctx.lineWidth=o.width||LOOK.stroke.width;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x2-hl*Math.cos(ang-hw),y2-hl*Math.sin(ang-hw));ctx.lineTo(x2,y2);
  ctx.lineTo(x2-hl*Math.cos(ang+hw),y2-hl*Math.sin(ang+hw));ctx.stroke();ctx.restore();
  if(o.both){ctx.beginPath();const ang2=ang+Math.PI;
    ctx.moveTo(x1-hl*Math.cos(ang2-hw),y1-hl*Math.sin(ang2-hw));ctx.lineTo(x1,y1);
    ctx.lineTo(x1-hl*Math.cos(ang2+hw),y1-hl*Math.sin(ang2+hw));ctx.stroke()}}

function smoothCard(ctx,cx,cy,w,h,p,L,o){o=o||{};if(p<=0)return;
  ctx.save();
  const s=Math.max(0.001,p),sw=w*s,sh=h*s;
  if(L.shadow){ctx.shadowColor=L.shadow.color;ctx.shadowBlur=L.shadow.blur;ctx.shadowOffsetY=L.shadow.y}
  ctx.fillStyle=o.fill||L.surface;
  if(o.glowBorder){ctx.shadowColor='rgba(34,211,238,0.55)';ctx.shadowBlur=26}
  rrect(ctx,cx-sw/2,cy-sh/2,sw,sh,L.radius);ctx.fill();
  ctx.shadowColor='transparent';
  if(o.border){ctx.strokeStyle=o.border;ctx.lineWidth=L.stroke.width;ctx.stroke()}
  ctx.restore()}

const smooth={pop:smoothCard};

/* ---------- escena genérica (título + tagline + diagrama + paleta + transición) ---------- */
const W=1920,H=1080,u=W/100,L=LOOK;
let BG=null;
function drawContent(ctx,t){
  if(BG)ctx.drawImage(BG,0,0);
  /* título */
  const pt=seg(t,0.10,1.0),size=u*11.4;
  const titleColor=L.titleGlow?L.ink:L.ink;
  if(pt>0){
    ctx.save();
    if(L.titleGlow){ctx.shadowColor=L.titleGlow;ctx.shadowBlur=34}
    if(L.enter.title==='write')T.writeOn(ctx,L.title,W/2,H*0.27,F('display',size),titleColor,E.out(pt),{align:'center',marker:u*0.7});
    else if(L.enter.title==='rise')T.rise(ctx,L.title,W/2,H*0.27,F('display',size),titleColor,pt);
    else T.fade(ctx,L.title,W/2,H*0.27,F('display',size),titleColor,pt);
    ctx.restore();
  }
  /* tagline */
  const pg=seg(t,0.95,1.55);
  if(pg>0){
    if(L.enter.text==='write')T.writeOn(ctx,L.tagline,W/2,H*0.27+u*5.4,F('body',u*3.0),L.muted,E.out(pg),{align:'center',marker:u*0.5});
    else T.rise(ctx,L.tagline,W/2,H*0.27+u*5.4,F('body',u*3.0),L.muted,pg);
  }
  /* diagrama propio del look */
  DIAGRAM(ctx,t);
  /* paleta */
  const keys=Object.keys(L.colors).filter(k=>k!=='ink');
  const n=keys.length,dW=u*3.1,gap=u*2.2,x0=W/2-( (n-1)*gap )/2,y0=H-u*7.5;
  keys.forEach((k,i)=>{
    const p=seg(t,3.45+i*0.06,3.75+i*0.06);if(p<=0)return;
    ctx.save();ctx.globalAlpha=E.out(p);
    ctx.fillStyle=L.colors[k];ctx.beginPath();ctx.arc(x0+i*gap,y0,dW/2*E.back(Math.min(1,p*1.2)),0,7);ctx.fill();
    if(k===L.accent&&p>0.6){ctx.strokeStyle=L.colors[k];ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(x0+i*gap,y0,dW/2+7,0,7);ctx.stroke()}
    ctx.restore()});
  /* crédito */
  const pc2=seg(t,3.9,4.25);
  if(pc2>0)T.fade(ctx,'look "'+L.name+'" · motor explainroo (MIT) · impulso.video-skills',W/2,H-u*3.2,F('body',u*1.7),L.muted,pc2);
}

/* transición de cierre del look -> bucle del GIF */
function endTransition(ctx,t){
  const q=E.io(seg(t,LOOK.dur-0.55,LOOK.dur));if(q<=0)return;
  ctx.save();
  switch(LOOK.transition){
    case 'brush':{ctx.fillStyle=LOOK.bg;ctx.beginPath();ctx.moveTo(0,0);
      const edge=W*q;
      for(let y=0;y<=H;y+=24){ctx.lineTo(edge+(vnoise(y*0.02+8)-0.5)*90,y)}
      ctx.lineTo(0,H);ctx.closePath();ctx.fill();break}
    case 'slide':{ctx.fillStyle=LOOK.bg;ctx.fillRect(0,0,W*q,H);break}
    case 'wipe':{ctx.fillStyle=LOOK.bg;ctx.fillRect(0,0,W*q,H);
      ctx.fillStyle=LOOK.colors.yellow;ctx.fillRect(W*q-10,0,14,H);break}
    case 'zoom':{ctx.globalAlpha=q;ctx.fillStyle=LOOK.bg;ctx.fillRect(0,0,W,H);break}
    case 'fade':{ctx.globalAlpha=q*0.96;ctx.fillStyle=LOOK.bg;ctx.fillRect(0,0,W,H);break}
  }
  ctx.restore();
}

function render(ctx,t){
  ctx.fillStyle=LOOK.bg;ctx.fillRect(0,0,W,H);
  const q=E.io(seg(t,LOOK.dur-0.55,LOOK.dur));
  ctx.save();
  if(LOOK.transition==='slide')ctx.translate(-W*q,0);
  if(LOOK.transition==='zoom'){const s=1+0.16*q;ctx.translate(W/2,H/2);ctx.scale(s,s);ctx.translate(-W/2,-H/2)}
  drawContent(ctx,t);
  ctx.restore();
  endTransition(ctx,t);
}

/* ---------- contrato del motor ---------- */
window.DUR=LOOK.dur;
window.ready=(async()=>{
  const specs=[['display',96],['body',48],['mono',32]];
  const fams=new Set();
  for(const[role]of specs){
    const f=role==='display'?LOOK.displayFont:role==='body'?LOOK.bodyFont:LOOK.monoFont;
    const key=f.family+'|'+f.weight;if(fams.has(key))continue;fams.add(key);
    await document.fonts.load(f.weight+' 96px "'+f.family+'"');
  }
  BG=makeBackground();
  const cv=document.getElementById('c');window.draw({t:0});
})();

window.draw=function(o){
  const cv=document.getElementById('c'),ctx=cv.getContext('2d');
  const t=Math.max(0,Math.min(LOOK.dur,o.t));
  render(ctx,t);
  return cv.toDataURL('image/jpeg',0.92);
};
</script>
</body>
</html>`;
}

let outDir, n = 0;
for (const look of LOOKS) {
  const diagram = DIAGRAMS[look.name];
  if (!diagram) throw new Error('falta diagrama para ' + look.name);
  const src = html(look, diagram);
  outDir = path.join(BASE, 'estilos', look.id, 'referencia');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'anim.html'), src, 'utf8');
  n++;
  console.log('escrito estilos/' + look.id + '/referencia/anim.html');
}
console.log('OK: ' + n + ' demos generadas');
