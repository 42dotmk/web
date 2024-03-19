import { wait } from "./utils";

declare const CMS_URL: string;
declare const CMS_API_URL: string;

const lang = window.location.pathname.split('/')[1] ?? 'en';

const items = lang === "mk"
  ? ['изгради го', 'расипи го', 'направи го', 'хакни го', 'измисли го', 'направи го', 'истражи го', 'дизајнирај го', 'соработувај во', 'откриј го', 'прототипирај го', 'искодирај го', 'подобри го', 'развиј го', 'реши го', 'испрограмирај го']
  : ['build', 'break', 'make', 'hack', 'invent', 'create', 'explore', 'design', 'collaborate', 'discover', 'engineer', 'prototype', 'code', 'tinker', 'develop', 'iterate', 'solve', 'craft', 'program', 'innovate'];

const loadImage = (url: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

type GalleryEntry = {
  url: string;
}

let textI = 0;
const setRandomText = () => {
  const text = document.getElementById('repetitive');
  if (!text) { return; }

  textI = (textI + 1) % items.length;
  text.innerHTML = items[textI];
  if (textI % 2 === 0) {
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
}

const loadRandomImage = async (images: GalleryEntry[], el: HTMLElement, iter = 0, lastUrl = '') => {
  await wait(2000);

  const randomIndex = Math.floor(Math.random() * images.length);
  const url = `${CMS_URL}${images[randomIndex].url}`;

  try {
    el.innerHTML = `
      #wrapper:before {
        background-image: url("${lastUrl}");
        opacity: 0;
      }
    `;

    await loadImage(url);

    await wait(600);

    el.innerHTML = `
      #wrapper:before {
        background-image: url("${url}");
        opacity: 0.3;
      }
    `;

    loadRandomImage(images, el, iter+1, url);
  } catch (err) {
    console.error('error loading image', err);
  }
};

const runImageRandomizer = () => {
  const head = document.querySelector('head');
  const style = document.createElement('style');
  head?.appendChild(style);

  fetch(`${CMS_API_URL}/galleries/1?populate=*`)
    .then(x => x.json())
    .then(({ data }) => {
      console.log(data.images);
      loadRandomImage(data.images, style);
    });
}


const runTextRandomizer = () => {
  setInterval(setRandomText, 300);
};

export const runHero = () => {
  runImageRandomizer();
  runTextRandomizer();
}