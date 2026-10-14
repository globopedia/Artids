// ============================================================
// PROTECCIÓN DE CONTENIDO — Globopedia
// Se incluye en las páginas de datos (Inicio, Futbolistas, Técnicos, Torneos,
// Rivales, Rankings y Árbitros). Evita copiar texto, guardar o arrastrar
// imágenes, el clic derecho y la impresión, SIN bloquear los links ni los
// buscadores (donde sí se puede escribir, seleccionar y pegar).
// Lo que tenga el atributo data-permitir-copia (y los botones "Copiar texto"
// del inicio) sigue funcionando.
// Aclaración: es una barrera para el "copiar y pegar" de todos los días;
// nada en una página web impide del todo una captura de pantalla.
// ============================================================
(function () {
  "use strict";

  // ¿El elemento es un lugar donde se escribe (buscador, campo, selector)?
  function esEditable(el) {
    if (!el || el.nodeType !== 1) el = el && el.parentElement;
    if (!el) return false;
    if (el.closest("[data-permitir-copia]")) return true;
    const campo = el.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']");
    return !!campo;
  }

  // --- Estilos: sin selección de texto, imágenes que no se arrastran ni se
  //     "mantienen apretadas" en el celular, y nada para imprimir.
  const estilo = document.createElement("style");
  estilo.textContent = `
    html, body { -webkit-user-select: none; -moz-user-select: none; user-select: none; -webkit-touch-callout: none; }
    input, textarea, select, [contenteditable], [data-permitir-copia], [data-permitir-copia] * {
      -webkit-user-select: text; -moz-user-select: text; user-select: text; -webkit-touch-callout: default;
    }
    img { -webkit-user-drag: none; user-drag: none; -webkit-touch-callout: none; }
    @media print {
      body > * { display: none !important; }
      body::after { content: "Contenido protegido — www.globopedia.ar"; display: block; font: 16px sans-serif; text-align: center; margin-top: 40px; }
    }`;
  (document.head || document.documentElement).appendChild(estilo);

  // --- Clic derecho (menú "Guardar imagen", "Copiar", etc.): bloqueado,
  //     salvo en los buscadores.
  document.addEventListener("contextmenu", e => { if (!esEditable(e.target)) e.preventDefault(); }, true);

  // --- Arrastrar imágenes o texto fuera de la página.
  document.addEventListener("dragstart", e => { if (!esEditable(e.target)) e.preventDefault(); }, true);

  // --- Empezar a seleccionar texto.
  document.addEventListener("selectstart", e => { if (!esEditable(e.target)) e.preventDefault(); }, true);

  // --- Copiar / cortar: solo se permite desde los campos editables (los
  //     botones "Copiar texto" del inicio usan su propio mecanismo y siguen andando).
  ["copy", "cut"].forEach(tipo => document.addEventListener(tipo, e => {
    if (esEditable(e.target) || esEditable(document.activeElement)) return;
    e.preventDefault();
  }, true));

  // --- Atajos de teclado: copiar, seleccionar todo, guardar, ver código, imprimir.
  document.addEventListener("keydown", e => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const k = (e.key || "").toLowerCase();
    if (["c", "x", "a"].includes(k) && esEditable(e.target)) return;
    if (["c", "x", "a", "s", "u", "p"].includes(k)) e.preventDefault();
  }, true);
})();

// ============================================================
// MARCA DE AGUA "Globopedia" en las fotos
// No toca los archivos originales: cada foto se "pinta" con la marca en el
// navegador del visitante y se muestra esa versión. Así, una captura de
// pantalla (o la imagen guardada desde la página) sale con la marca.
// Se marcan: fotos de futbolistas, partidos, árbitros, museo y estadios del
// repo Artids, y las fotos alojadas en Blogger o Drive (técnicos y jugadores
// que todavía están ahí). No se marcan escudos, banderas, íconos, camisetas
// ni logos de torneos, ni las imágenes chicas, ni lo que tenga data-sin-marca.
// ============================================================
(function () {
  "use strict";
  const PUENTE = "https://artids.vercel.app/api/img?u=";
  const PROPIAS = /\/Artids\/(Utbolists|Artido|Rbits|Museo|Estadios)\//i;
  const GENERICAS = /\/Artids\/Utbolists\/UtbolistsH\/CAH0\d|\/Rbits\/pito\./i;
  const REMOTAS = /^https:\/\/(blogger\.googleusercontent\.com|lh\d\.googleusercontent\.com|drive\.google\.com|drive\.usercontent\.google\.com|\d\.bp\.blogspot\.com)\//i;
  const MAX_LADO = 1600;
  const cache = new Map();     // dirección original -> Promise<dirección marcada | null>
  const marcadas = new Set();  // direcciones "blob:" que generamos nosotros

  function tipoDeFoto(url) {
    if (!url || url.startsWith("blob:") || url.startsWith("data:")) return null;
    if (GENERICAS.test(url)) return null;
    let u; try { u = new URL(url, location.href); } catch (e) { return null; }
    if (u.origin === location.origin && PROPIAS.test(decodeURIComponent(u.pathname))) return "propia";
    if (REMOTAS.test(u.href)) return "remota";
    return null;
  }

  function dibujarMarca(ctx, w, h) {
    const m = Math.min(w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-0.33);
    let tam = m * 0.2;
    const fuente = t => `800 ${t}px Poppins, "Arial Black", Arial, sans-serif`;
    ctx.font = fuente(tam);
    const ancho = ctx.measureText("Globopedia").width || 1;
    tam = tam * (m * 0.8) / ancho;
    ctx.font = fuente(tam);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(1, tam * 0.07);
    ctx.strokeStyle = "rgba(0,0,0,0.30)";
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.strokeText("Globopedia", 0, 0);
    ctx.fillText("Globopedia", 0, 0);
    ctx.restore();
  }

  function cargar(url, tipo) {
    return new Promise((ok, mal) => {
      const im = new Image();
      if (tipo === "remota") { im.crossOrigin = "anonymous"; im.src = PUENTE + encodeURIComponent(url); }
      else im.src = url;
      im.onload = () => ok(im);
      im.onerror = mal;
    });
  }

  function versionMarcada(url, tipo) {
    if (cache.has(url)) return cache.get(url);
    const p = cargar(url, tipo).then(im => new Promise(ok => {
      let w = im.naturalWidth, h = im.naturalHeight;
      if (!w || !h || (w < 120 && h < 120)) return ok(null);
      const k = Math.min(1, MAX_LADO / Math.max(w, h));
      w = Math.round(w * k); h = Math.round(h * k);
      const lienzo = document.createElement("canvas");
      lienzo.width = w; lienzo.height = h;
      const ctx = lienzo.getContext("2d");
      ctx.drawImage(im, 0, 0, w, h);
      dibujarMarca(ctx, w, h);
      const png = /\.png(\?|$)/i.test(url);
      lienzo.toBlob(b => {
        if (!b) return ok(null);
        const blob = URL.createObjectURL(b);
        marcadas.add(blob);
        ok(blob);
      }, png ? "image/png" : "image/jpeg", 0.9);
    })).catch(() => null);
    cache.set(url, p);
    return p;
  }

  function marcar(img) {
    if (!img || img.tagName !== "IMG" || img.closest("[data-sin-marca]")) return;
    const url = img.currentSrc || img.src;
    if (marcadas.has(url)) return;
    const tipo = tipoDeFoto(url);
    if (!tipo) return;
    versionMarcada(url, tipo).then(blob => {
      // Solo si la imagen sigue mostrando la misma foto (pudo cambiar mientras tanto).
      if (blob && (img.currentSrc || img.src) === url) {
        img.removeAttribute("srcset");
        img.src = blob;
      }
    });
  }

  // Cada vez que una imagen termina de cargar (el evento "load" no sube, por
  // eso se escucha en la fase de captura).
  document.addEventListener("load", e => { if (e.target && e.target.tagName === "IMG") marcar(e.target); }, true);
  // Las que ya estaban cargadas antes de este punto.
  const repasar = () => document.querySelectorAll("img").forEach(i => { if (i.complete && i.naturalWidth) marcar(i); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", repasar); else repasar();
})();
