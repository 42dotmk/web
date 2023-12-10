export const runKrc = () => {
  setInterval(() => {
    const el = document.getElementById('krc');
    if (!el) return;

    const randX = Math.floor(Math.random() * 100);
    const randY = Math.floor(Math.random() * 100);
    el.style.left = randX + '%';
    el.style.top = randY + '%';
    const randAngle = Math.floor(Math.random() * 360);
    const randScale = 0.3 + Math.floor(Math.random() * 1);
    el.style.transform = 'rotate(' + randAngle + 'deg) scale(' + randScale + ')';
  }, 100);
};