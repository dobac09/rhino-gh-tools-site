import './style.css';

const canvas = document.querySelector('#scene');
const control = document.querySelector('#motion-toggle');
import('./scene.js').then(({ initScene }) => {
  const scene = initScene(canvas);
  if (!scene) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function syncControl() { control.hidden = reducedMotion.matches || !scene.available; }
  syncControl();
  reducedMotion.addEventListener('change', syncControl);
  canvas.addEventListener('webglcontextlost', () => { control.hidden = true; });
  canvas.addEventListener('sceneavailable', syncControl);
  control.addEventListener('click', () => {
    const paused = scene.togglePause();
    control.setAttribute('aria-pressed', String(paused));
    control.innerHTML = paused ? 'Resume motion' : 'Pause motion';
  });
  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) { scene.dispose(); reducedMotion.removeEventListener('change', syncControl); }
  });
}).catch(() => {
  // The HTML and CSS composition remain fully usable if the scene cannot load.
});
