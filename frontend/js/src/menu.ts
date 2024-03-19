export const initMenu = () => {
  const el = document.getElementById('menu') as HTMLDetailsElement;
  if (!el) {
    console.error('Menu element not found');
    return;
  }

  document.querySelectorAll(".menu-item").forEach((e) => {
    const element = e as HTMLElement;
    element.onclick = () => {
      el.open = false;
    };
  });

  el.open = window.innerWidth > 768;
};
