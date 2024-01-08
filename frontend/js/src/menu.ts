export const initMenu = () => {
  const el = document.getElementById('menu') as HTMLDetailsElement;
  if (!el) {
    console.error('Menu element not found');
    return;
  }

  el.open = window.innerWidth > 768;
};
