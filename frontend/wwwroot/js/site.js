const c = (e) => new Promise((t) => setTimeout(t, e)), m = window.location.pathname.split("/")[1] ?? "en", l = m === "mk" ? ["изгради го", "расипи го", "направи го", "хакни го", "измисли го", "направи го", "истражи го", "дизајнирај го", "соработувај во", "откриј го", "прототипирај го", "искодирај го", "подобри го", "развиј го", "реши го", "испрограмирај го"] : ["build", "break", "make", "hack", "invent", "create", "explore", "design", "collaborate", "discover", "engineer", "prototype", "code", "tinker", "develop", "iterate", "solve", "craft", "program", "innovate"], u = (e) => new Promise((t, n) => {
  const o = new Image();
  o.src = e, o.onload = () => t(o), o.onerror = n;
});
let r = 0;
const p = () => {
  const e = document.getElementById("repetitive");
  e && (r = (r + 1) % l.length, e.innerHTML = l[r], r % 2 === 0 ? (e.classList.remove("text-primary"), e.classList.remove("border-primary"), e.classList.add("text-secondary-500"), e.classList.add("border-secondary-500")) : (e.classList.remove("text-secondary-500"), e.classList.remove("border-secondary-500"), e.classList.add("text-primary"), e.classList.add("border-primary")));
}, i = async (e, t, n = 0, o = "") => {
  await c(2e3);
  const a = Math.floor(Math.random() * e.length), s = `${CMS_URL}${e[a].url}`;
  try {
    t.innerHTML = `
      #wrapper:before {
        background-image: url("${o}");
        opacity: 0;
      }
    `, await u(s), await c(600), t.innerHTML = `
      #wrapper:before {
        background-image: url("${s}");
        opacity: 0.3;
      }
    `, i(e, t, n + 1, s);
  } catch (d) {
    console.error("error loading image", d);
  }
}, g = () => {
  const e = document.querySelector("head"), t = document.createElement("style");
  e == null || e.appendChild(t), fetch(`${CMS_API_URL}/galleries/1?populate=*`).then((n) => n.json()).then(({ data: n }) => {
    console.log(n.images), i(n.images, t);
  });
}, y = () => {
  setInterval(p, 300);
}, h = () => {
  g(), y();
}, f = () => {
  setInterval(() => {
    const e = document.getElementById("krc");
    if (!e)
      return;
    const t = Math.floor(Math.random() * 100), n = Math.floor(Math.random() * 100);
    e.style.left = t + "%", e.style.top = n + "%";
    const o = Math.floor(Math.random() * 360), a = 0.3 + Math.floor(Math.random() * 1);
    e.style.transform = "rotate(" + o + "deg) scale(" + a + ")";
  }, 100);
}, M = () => {
  const e = document.getElementById("menu");
  if (!e) {
    console.error("Menu element not found");
    return;
  }
  document.querySelectorAll(".menu-item").forEach((t) => {
    const n = t;
    n.onclick = () => {
      e.open = !1;
    };
  }), e.open = window.innerWidth > 768;
};
f();
h();
M();
