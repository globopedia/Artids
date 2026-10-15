// ============================================================
// AJUSTE DE ALTO — para las páginas que se muestran dentro de Blogger
// (iframe). Le avisa a la página de Blogger cuánto mide el contenido,
// así el recuadro crece o se achica y no queda cortado ni con espacio
// en blanco. Se usa en Técnicos, Torneos y Árbitros (Futbolistas,
// Rivales, Rankings e Inicio ya tienen su propio aviso).
// ============================================================
(function () {
  "use strict";
  let ultima = null, timer = null;

  function medir() {
    // Dónde termina el contenido (no el alto de la ventana del iframe, que
    // nunca achicaría). Incluye los desplegables de búsqueda abiertos.
    let fondo = 0;
    const cuerpo = document.body;
    if (!cuerpo) return 0;
    for (const el of cuerpo.children) {
      if (el.tagName === "SCRIPT" || el.tagName === "STYLE") continue;
      const r = el.getBoundingClientRect();
      if (r.height || r.width) fondo = Math.max(fondo, r.bottom);
    }
    document.querySelectorAll("ul[id^='autocomplete'], .autocomplete-list, [id*='autocomplete']").forEach(el => {
      if (el.children.length) fondo = Math.max(fondo, el.getBoundingClientRect().bottom);
    });
    const margen = parseFloat(getComputedStyle(cuerpo).marginBottom) || 0;
    return Math.ceil(fondo + window.scrollY + margen + 4);
  }

  function enviar() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const altura = medir();
      if (!altura || (ultima !== null && Math.abs(altura - ultima) <= 3)) return;
      ultima = altura;
      window.parent.postMessage({ type: "ajustarAltura", altura }, "*");
    }, 150);
  }

  window.enviarAlturaGlobopedia = enviar;
  window.addEventListener("load", enviar);
  window.addEventListener("resize", enviar);
  document.addEventListener("DOMContentLoaded", () => {
    enviar();
    if (window.ResizeObserver) new ResizeObserver(enviar).observe(document.body);
    new MutationObserver(enviar).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "open"] });
  });
  // Las imágenes que terminan de cargar también cambian el alto.
  document.addEventListener("load", e => { if (e.target && e.target.tagName === "IMG") enviar(); }, true);
  document.addEventListener("click", () => setTimeout(enviar, 350), true);
})();
