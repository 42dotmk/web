const lang = window.location.pathname.split('/')[0] ?? 'en';

const items = lang === "mk"
  ? ['изгради го', 'расипи го', 'направи го', 'хакни го', 'измисли го', 'направи го', 'истражи го', 'дизајнирај го', 'соработувај во', 'откриј го', 'прототипирај го', 'искодирај го', 'подобри го', 'развиј го', 'реши го', 'испрограмирај го']
  : ['build', 'break', 'make', 'hack', 'invent', 'create', 'explore', 'design', 'collaborate', 'discover', 'engineer', 'prototype', 'code', 'tinker', 'develop', 'iterate', 'solve', 'craft', 'program', 'innovate'];

export const runHero = () => {
  let i = 0;
  setInterval(function () {
    const text = document.getElementById('repetitive');
    if (!text) { return; }

    i = (i + 1) % items.length;
    text.innerHTML = items[i];
    if (i % 2 === 0) {
      text.classList.remove('text-primary');
      text.classList.remove('border-primary');
      text.classList.add('text-secondary-500');
      text.classList.add('border-secondary-500');
    } else {
      text.classList.remove('text-secondary-500');
      text.classList.remove('border-secondary-500');
      text.classList.add('text-primary');
      text.classList.add('border-primary');
    }
  }, 300);
}