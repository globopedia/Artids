// ============================================================
// RENGLÓN DE PARTIDO PARA EL CELULAR — Globopedia
// Arma la versión "de celular" del renglón de cada partido (el que se toca
// para desplegar la ficha), igual en todas las páginas:
//   1ª línea: resultado · escudo del rival · (dato extra) · camiseta
//   2ª línea: fecha - jornada/torneo - DT
// Cada página la agrega dentro de .acordeon-header junto a su renglón de
// siempre (.ah-desk). movil.css muestra una u otra según el ancho de la
// pantalla, así en la computadora no cambia nada.
// ============================================================
(function () {
  "use strict";

  function esc(t) {
    return (t == null ? "" : String(t))
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // "2° fecha del Torneo LPF 2022" -> "2° fecha"; "16vo de Copa Argentina 2014" -> "16vo"
  function rondaDeTorneo(torneo) {
    const t = (torneo || "").trim();
    let corte = t.search(/\sdel\s/i);
    if (corte === -1) corte = t.search(/\sde\s/i);
    return corte === -1 ? t : t.slice(0, corte).trim();
  }

  // p: fila del CSV de partidos. escudoUrl: escudo del rival (cada página
  // tiene su propia función getEscudo). opciones:
  //   soloRonda: true si la página ya agrupa por torneo (muestra solo "2° fecha")
  //   conDT: mostrar "DT ..." (por defecto sí)
  //   extra: HTML corto que va en la 1ª línea después del escudo
  window.filaPartidoMovil = function (p, escudoUrl, opciones) {
    const o = opciones || {};
    const torneo = o.soloRonda ? rondaDeTorneo(p.Torneo) : (p.Torneo || "").trim();
    const camiseta = (p.Camiseta || "").trim();
    const hayCamiseta = /^https?:\/\//i.test(camiseta);
    const conDT = o.conDT !== false && p.Técnico && p.Técnico.trim() && p.Técnico.trim() !== "-";
    return `<span class="ah-movil">
      <span class="resultado-header">${esc(p.Resultado1)}-${esc(p.Resultado2)}</span>
      ${escudoUrl ? `<img class="escudo-header" src="${esc(escudoUrl)}" alt="${esc(p.Club)}" title="${esc(p.Club)}" loading="lazy">` : ""}
      ${o.extra ? `<span class="ah-extra">${o.extra}</span>` : ""}
      ${hayCamiseta ? `<img class="foto-camiseta" src="${esc(camiseta)}" alt="Camiseta" loading="lazy" onerror="this.style.display='none'">` : ""}
      <span class="ronda-dt-stack">
        ${p.Fecha ? `<span class="rd-fecha">${esc(p.Fecha)}</span>` : ""}
        ${torneo ? `<span class="rd-ronda">${esc(torneo)}</span>` : ""}
        ${conDT ? `<span class="rd-dt">DT ${esc(p.Técnico)}</span>` : ""}
      </span>
    </span>`;
  };
})();
