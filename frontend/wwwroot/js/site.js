const s = window.location.pathname.split("/")[1] ?? "en", r = s === "mk" ? ["изгради го", "расипи го", "направи го", "хакни го", "измисли го", "направи го", "истражи го", "дизајнирај го", "соработувај во", "откриј го", "прототипирај го", "искодирај го", "подобри го", "развиј го", "реши го", "испрограмирај го"] : ["build", "break", "make", "hack", "invent", "create", "explore", "design", "collaborate", "discover", "engineer", "prototype", "code", "tinker", "develop", "iterate", "solve", "craft", "program", "innovate"], c = () => {
  let t = 0;
  setInterval(function() {
    const e = document.getElementById("repetitive");
    e && (t = (t + 1) % r.length, e.innerHTML = r[t], t % 2 === 0 ? (e.classList.remove("text-primary"), e.classList.remove("border-primary"), e.classList.add("text-secondary-500"), e.classList.add("border-secondary-500")) : (e.classList.remove("text-secondary-500"), e.classList.remove("border-secondary-500"), e.classList.add("text-primary"), e.classList.add("border-primary")));
  }, 300);
}, l = () => {
  setInterval(() => {
    const t = document.getElementById("krc");
    if (!t)
      return;
    const e = Math.floor(Math.random() * 100), a = Math.floor(Math.random() * 100);
    t.style.left = e + "%", t.style.top = a + "%";
    const o = Math.floor(Math.random() * 360), n = 0.3 + Math.floor(Math.random() * 1);
    t.style.transform = "rotate(" + o + "deg) scale(" + n + ")";
  }, 100);
};
l();
c();
