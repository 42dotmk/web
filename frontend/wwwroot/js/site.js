const c = (e) => new Promise((t) => setTimeout(t, e)), m = window.location.pathname.split("/")[1] ?? "en", l = m === "mk" ? ["изгради го", "расипи го", "направи го", "хакни го", "измисли го", "направи го", "истражи го", "дизајнирај го", "соработувај во", "откриј го", "прототипирај го", "искодирај го", "подобри го", "развиј го", "реши го", "испрограмирај го"] : ["build", "break", "make", "hack", "invent", "create", "explore", "design", "collaborate", "discover", "engineer", "prototype", "code", "tinker", "develop", "iterate", "solve", "craft", "program", "innovate"], u = (e) => new Promise((t, o) => {
  const r = new Image();
  r.src = e, r.onload = () => t(r), r.onerror = o;
});
let n = 0;
const g = () => {
  const e = document.getElementById("repetitive");
  e && (n = (n + 1) % l.length, e.innerHTML = l[n], n % 2 === 0 ? (e.classList.remove("text-primary"), e.classList.remove("border-primary"), e.classList.add("text-secondary-500"), e.classList.add("border-secondary-500")) : (e.classList.remove("text-secondary-500"), e.classList.remove("border-secondary-500"), e.classList.add("text-primary"), e.classList.add("border-primary")));
}, d = async (e, t, o = 0, r = "") => {
  await c(2e3);
  const a = Math.floor(Math.random() * e.length), s = `${CMS_URL}${e[a].url}`;
  try {
    t.innerHTML = `
      #wrapper:before {
        background-image: url("${r}");
        opacity: 0;
      }
    `, await u(s), await c(600), t.innerHTML = `
      #wrapper:before {
        background-image: url("${s}");
        opacity: 0.3;
      }
    `, g(), d(e, t, o + 1, s);
  } catch (i) {
    console.error("error loading image", i);
  }
}, p = () => {
  const e = document.querySelector("head"), t = document.createElement("style");
  e == null || e.appendChild(t), fetch(`${CMS_API_URL}/galleries/1?populate=*`).then((o) => o.json()).then(({ data: o }) => {
    console.log(o.images), d(o.images, t);
  });
}, y = () => {
  p();
}, h = () => {
  setInterval(() => {
    const e = document.getElementById("krc");
    if (!e)
      return;
    const t = Math.floor(Math.random() * 100), o = Math.floor(Math.random() * 100);
    e.style.left = t + "%", e.style.top = o + "%";
    const r = Math.floor(Math.random() * 360), a = 0.3 + Math.floor(Math.random() * 1);
    e.style.transform = "rotate(" + r + "deg) scale(" + a + ")";
  }, 100);
}, M = () => {
  const e = document.getElementById("menu");
  if (!e) {
    console.error("Menu element not found");
    return;
  }
  e.open = window.innerWidth > 768;
};
h();
y();
M();
