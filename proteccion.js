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
