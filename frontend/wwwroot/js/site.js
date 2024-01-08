const s = window.location.pathname.split("/")[1] ?? "en", r = s === "mk" ? ["изгради го", "расипи го", "направи го", "хакни го", "измисли го", "направи го", "истражи го", "дизајнирај го", "соработувај во", "откриј го", "прототипирај го", "искодирај го", "подобри го", "развиј го", "реши го", "испрограмирај го"] : ["build", "break", "make", "hack", "invent", "create", "explore", "design", "collaborate", "discover", "engineer", "prototype", "code", "tinker", "develop", "iterate", "solve", "craft", "program", "innovate"], c = () => {
  let e = 0;
  setInterval(function() {
    const t = document.getElementById("repetitive");
    t && (e = (e + 1) % r.length, t.innerHTML = r[e], e % 2 === 0 ? (t.classList.remove("text-primary"), t.classList.remove("border-primary"), t.classList.add("text-secondary-500"), t.classList.add("border-secondary-500")) : (t.classList.remove("text-secondary-500"), t.classList.remove("border-secondary-500"), t.classList.add("text-primary"), t.classList.add("border-primary")));
  }, 300);
}, d = () => {
  setInterval(() => {
    const e = document.getElementById("krc");
    if (!e)
      return;
    const t = Math.floor(Math.random() * 100), n = Math.floor(Math.random() * 100);
    e.style.left = t + "%", e.style.top = n + "%";
    const o = Math.floor(Math.random() * 360), a = 0.3 + Math.floor(Math.random() * 1);
    e.style.transform = "rotate(" + o + "deg) scale(" + a + ")";
  }, 100);
}, l = () => {
  const e = document.getElementById("menu");
  if (!e) {
    console.error("Menu element not found");
    return;
  }
  e.open = window.innerWidth > 768;
};
d();
c();
l();
