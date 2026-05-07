const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');

window.visualizerAnalyser  = null;
window.visualizerDataArray = null;

const CHARS    = 'セソ';
const FONT_SZ  = 14;
let   columns  = 0;

function freqColor(v) {
  const r = Math.round(80  + v * 80);
  const g = Math.round(40  + v * 60);
  const b = Math.round(180 + v * 75);
  return [r, g, b];
}

const bgImg = new Image();
bgImg.src   = 'background.png';

const bgCanvas2 = document.createElement('canvas');
bgCanvas2.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;';
document.body.insertBefore(bgCanvas2, canvas);
const bgCtx = bgCanvas2.getContext('2d');

function resizeBg() {
  bgCanvas2.width  = window.innerWidth;
  bgCanvas2.height = window.innerHeight;
  if (bgImg.complete) drawBg();
}
function drawBg() {
  bgCtx.clearRect(0, 0, bgCanvas2.width, bgCanvas2.height);
  bgCtx.drawImage(bgImg, 0, 0, bgCanvas2.width, bgCanvas2.height);
  bgCtx.fillStyle = 'rgba(0,0,0,0.22)';
  bgCtx.fillRect(0, 0, bgCanvas2.width, bgCanvas2.height);
}
bgImg.onload = drawBg;
window.addEventListener('resize', resizeBg);
resizeBg();

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  columns       = Math.floor(canvas.width / FONT_SZ);
}
window.addEventListener('resize', resize);
resize();

let idlePhase = 0;

const off    = document.createElement('canvas');
off.width    = canvas.width;
off.height   = canvas.height;
const offCtx = off.getContext('2d');

window.addEventListener('resize', () => {
  off.width  = canvas.width;
  off.height = canvas.height;
});

function drawCanvas() {
  requestAnimationFrame(drawCanvas);

  offCtx.globalCompositeOperation = 'destination-out';
  offCtx.fillStyle = 'rgba(0,0,0,0.15)';
  offCtx.fillRect(0, 0, off.width, off.height);
  offCtx.globalCompositeOperation = 'source-over';

  offCtx.font = FONT_SZ + 'px JetBrains Mono, monospace';

  const analyser  = window.visualizerAnalyser;
  const dataArray = window.visualizerDataArray;

  if (analyser && dataArray) {
    analyser.getByteFrequencyData(dataArray);
    for (let i = 0; i < columns; i++) {
      const idx = (i / columns * dataArray.length) | 0;
      const v   = dataArray[idx] / 255;
      if (v < 0.04) continue;
      const char  = CHARS[(Math.random() * CHARS.length) | 0];
      const x     = i * FONT_SZ;
      const y     = off.height - v * off.height;
      const alpha = 0.3 + v * 0.7;
      const [r, g, b] = freqColor(v);
      offCtx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      offCtx.fillText(char, x, y);
    }
  } else {
    idlePhase += 0.010;
    for (let i = 0; i < columns; i++) {
      const v = (Math.sin(i * 0.16 + idlePhase) + 1) / 2 * 0.20;
      if (v < 0.03) continue;
      const char  = CHARS[(Math.random() * CHARS.length) | 0];
      const x     = i * FONT_SZ;
      const y     = off.height - v * off.height * 0.55;
      const alpha = 0.05 + v * 0.35;
      offCtx.fillStyle = `rgba(120,80,220,${alpha})`;
      offCtx.fillText(char, x, y);
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(off, 0, 0);
}
drawCanvas();

const vizBar  = document.getElementById('vizBar');
const BAR_N   = 32;
const barEls  = [];

for (let i = 0; i < BAR_N; i++) {
  const el = document.createElement('div');
  el.className = 'bar-col';
  const t = i / (BAR_N - 1);
  const r = Math.round(80  + t * 80);
  const g = Math.round(40  + t * 60);
  const b = Math.round(180 + t * 75);
  el.style.background = `rgb(${r},${g},${b})`;
  el.style.boxShadow  = `0 0 4px rgba(${r},${g},${b},0.5)`;
  vizBar.appendChild(el);
  barEls.push(el);
}

function updateBars() {
  requestAnimationFrame(updateBars);
  const analyser  = window.visualizerAnalyser;
  const dataArray = window.visualizerDataArray;

  if (analyser && dataArray) {
    const freq = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freq);
    for (let i = 0; i < BAR_N; i++) {
      const idx = (i / BAR_N * freq.length) | 0;
      barEls[i].style.height = (2 + (freq[idx] / 255) * 26) + 'px';
    }
  } else {
    const t = Date.now() / 500;
    for (let i = 0; i < BAR_N; i++) {
      barEls[i].style.height = (2 + Math.max(0, Math.sin(i * 0.38 + t) * 4)) + 'px';
    }
  }
}
updateBars();
