const cursorEl = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursorEl.style.opacity = '1';
  cursorEl.style.left    = e.clientX + 'px';
  cursorEl.style.top     = e.clientY + 'px';
});

const startScreen   = document.getElementById('start-screen');
const terminal      = document.getElementById('terminal');
const statusText    = document.getElementById('status-text');
const loaderCircle  = document.getElementById('loader-circle');
const enterHint     = document.getElementById('enter-hint');
const audioEl       = document.getElementById('bg-audio');
const audioStatusEl = document.getElementById('audio-status');
const volBtn        = document.getElementById('vol-btn');

const ready = { audio: false, discord: false };

function checkReady() {
  if (!ready.audio || !ready.discord) return;
  statusText.style.display   = 'none';
  loaderCircle.style.display = 'none';
  enterHint.style.display    = 'block';
  startScreen.onclick = onEnter;
}

audioEl.addEventListener('canplay', () => {
  ready.audio = true;
  checkReady();
}, { once: true });

setTimeout(() => {
  if (!ready.audio) { ready.audio = true; checkReady(); }
}, 2500);

window.addEventListener('lanyard:ready', () => {
  ready.discord = true;
  checkReady();
});

let audioCtx = null;
let isMuted  = false;

function onEnter() {
  startScreen.classList.add('hidden');
  terminal.classList.add('visible');

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source   = audioCtx.createMediaElementSource(audioEl);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize               = 256;
    analyser.smoothingTimeConstant = 0.8;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    window.visualizerAnalyser  = analyser;
    window.visualizerDataArray = dataArray;
  }

  audioEl.volume = 0.2;
  audioEl.play().catch(() => {});
  audioStatusEl.textContent = 'ON';
}

volBtn.addEventListener('click', () => {
  isMuted                   = !isMuted;
  audioEl.muted             = isMuted;
  volBtn.textContent        = isMuted ? '[ unmute ]' : '[ mute ]';
  audioStatusEl.textContent = isMuted ? 'MUTED' : 'ON';
});
