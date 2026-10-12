/**
 * Personaje modular ("muneca de papel") - juegos-cumple
 *
 * Cubre el "se parece a mi hijo/hija" en el 90% de los casos SIN dibujar nada
 * nuevo por pedido. El dibujo a mano desde foto queda para el plan Premium.
 *
 * IMPORTANTE: las opciones NO estan agrupadas por genero. No existe un "set de
 * nina" y un "set de nino" - el papa o la mama elige libremente pelo, ropa y
 * accesorio. Un nino puede llevar pelo largo y una nina pantalon.
 *
 * Estos SVG son el punto de partida. Cuando tengas sprites reales (Kenney.nl,
 * CC0), reemplaza dibujar() por tu atlas y manten EXACTAMENTE las mismas claves
 * de opciones: asi los configs de clientes viejos siguen funcionando.
 */

const OPCIONES = {
  piel:      ['#F8D9C0', '#F0C29B', '#D9A273', '#B87A4E', '#8D5524', '#5C3A21'],
  pelo:      ['#2B2118', '#5A3A22', '#8B5E34', '#C9903F', '#E8C25A', '#B33A2E', '#8A8A8A', '#E85DA1'],
  peinado:   ['corto', 'largo', 'rizado', 'tomado', 'trenzas', 'rapado'],
  ropa:      ['polera', 'vestido', 'poleron'],
  accesorio: ['ninguno', 'lentes', 'gorro', 'cintillo', 'pecas'],
};

const DEFECTO = {
  piel: '#F0C29B', pelo: '#5A3A22', peinado: 'corto',
  ropa: 'polera', ropaColor: '#4A90D9', pantalonColor: '#3A4A63',
  accesorio: 'ninguno', accesorioColor: '#E85DA1',
};

// ---------------------------------------------------------------- peinados
const PEINADOS = {
  rapado: (c) => ({
    atras: '',
    frente: '<path d="M52 78 Q100 26 148 78 Q148 58 100 54 Q52 58 52 78Z" fill="' + c + '"/>',
  }),
  corto: (c) => ({
    atras: '',
    frente: '<path d="M48 92 Q46 32 100 32 Q154 32 152 92 Q150 60 128 56 Q110 74 74 62 Q54 66 48 92Z" fill="' + c + '"/>',
  }),
  largo: (c) => ({
    atras: '<path d="M42 92 Q40 26 100 26 Q160 26 158 92 L158 208 Q140 214 138 190 L138 110 Q120 88 100 88 Q80 88 62 110 L62 190 Q60 214 42 208Z" fill="' + c + '"/>',
    frente: '<path d="M48 88 Q46 34 100 34 Q154 34 152 88 Q146 58 124 54 Q108 72 72 60 Q54 62 48 88Z" fill="' + c + '"/>',
  }),
  rizado: (c) => {
    const bolitas = [[62, 62, 20], [86, 44, 22], [114, 44, 22], [138, 62, 20], [52, 86, 16], [148, 86, 16]]
      .map((b) => '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="' + c + '"/>')
      .join('');
    return {
      atras: bolitas,
      frente: bolitas + '<path d="M52 88 Q50 46 100 46 Q150 46 148 88 Q140 64 100 64 Q60 64 52 88Z" fill="' + c + '"/>',
    };
  },
  tomado: (c) => ({
    atras: '<circle cx="100" cy="26" r="22" fill="' + c + '"/>',
    frente: '<path d="M50 88 Q48 32 100 32 Q152 32 150 88 Q144 58 100 58 Q56 58 50 88Z" fill="' + c + '"/>',
  }),
  trenzas: (c) => ({
    atras:
      '<path d="M46 86 Q44 30 100 30 Q156 30 154 86 L154 100 Q140 96 138 84 L62 84 Q60 96 46 100Z" fill="' + c + '"/>' +
      '<circle cx="46" cy="120" r="13" fill="' + c + '"/><circle cx="46" cy="146" r="12" fill="' + c + '"/><circle cx="46" cy="170" r="10" fill="' + c + '"/>' +
      '<circle cx="154" cy="120" r="13" fill="' + c + '"/><circle cx="154" cy="146" r="12" fill="' + c + '"/><circle cx="154" cy="170" r="10" fill="' + c + '"/>',
    frente: '<path d="M50 88 Q48 34 100 34 Q152 34 150 88 Q142 60 100 60 Q58 60 50 88Z" fill="' + c + '"/>',
  }),
};

// ------------------------------------------------------------------- ropa
const ROPA = {
  polera: (c, p) =>
    '<rect x="80" y="196" width="17" height="46" rx="6" fill="' + p + '"/>' +
    '<rect x="103" y="196" width="17" height="46" rx="6" fill="' + p + '"/>' +
    '<rect x="62" y="138" width="76" height="66" rx="18" fill="' + c + '"/>',
  poleron: (c, p) =>
    '<rect x="80" y="196" width="17" height="46" rx="6" fill="' + p + '"/>' +
    '<rect x="103" y="196" width="17" height="46" rx="6" fill="' + p + '"/>' +
    '<rect x="58" y="136" width="84" height="74" rx="22" fill="' + c + '"/>' +
    '<path d="M100 138 L100 168" stroke="rgba(0,0,0,.18)" stroke-width="4" stroke-linecap="round"/>',
  vestido: (c, p) =>
    '<rect x="84" y="196" width="14" height="46" rx="6" fill="' + p + '"/>' +
    '<rect x="103" y="196" width="14" height="46" rx="6" fill="' + p + '"/>' +
    '<path d="M64 140 Q100 130 136 140 L152 206 Q100 220 48 206Z" fill="' + c + '"/>',
};

// ------------------------------------------------------------- accesorios
const ACCESORIOS = {
  ninguno: () => '',
  lentes: () =>
    '<g fill="none" stroke="#3A3A3A" stroke-width="4">' +
    '<circle cx="80" cy="88" r="17"/><circle cx="120" cy="88" r="17"/>' +
    '<path d="M97 88 L103 88"/><path d="M63 84 L50 80"/><path d="M137 84 L150 80"/></g>',
  gorro: (c) =>
    '<path d="M46 76 Q100 18 154 76Z" fill="' + c + '"/>' +
    '<rect x="40" y="70" width="120" height="16" rx="8" fill="' + c + '"/>' +
    '<circle cx="100" cy="22" r="10" fill="#FFFFFF" opacity=".85"/>',
  cintillo: (c) =>
    '<path d="M54 70 Q100 40 146 70" stroke="' + c + '" stroke-width="9" fill="none" stroke-linecap="round"/>' +
    '<circle cx="140" cy="54" r="9" fill="' + c + '"/><circle cx="152" cy="60" r="7" fill="' + c + '"/>',
  pecas: () =>
    '<g fill="rgba(0,0,0,.22)">' +
    '<circle cx="70" cy="100" r="2.5"/><circle cx="78" cy="104" r="2.5"/><circle cx="68" cy="108" r="2.5"/>' +
    '<circle cx="130" cy="100" r="2.5"/><circle cx="122" cy="104" r="2.5"/><circle cx="132" cy="108" r="2.5"/></g>',
};

/** Devuelve el SVG completo del personaje. */
function dibujar(personaje) {
  const p = Object.assign({}, DEFECTO, personaje || {});
  const pelo = (PEINADOS[p.peinado] || PEINADOS.corto)(p.pelo);
  const ropa = (ROPA[p.ropa] || ROPA.polera)(p.ropaColor, p.pantalonColor);
  const acc = (ACCESORIOS[p.accesorio] || ACCESORIOS.ninguno)(p.accesorioColor);

  return '<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Personaje">' +
    pelo.atras +
    '<rect x="76" y="236" width="26" height="13" rx="6" fill="#33373F"/>' +
    '<rect x="98" y="236" width="26" height="13" rx="6" fill="#33373F"/>' +
    ropa +
    '<rect x="46" y="146" width="17" height="52" rx="8" fill="' + p.ropaColor + '"/>' +
    '<rect x="137" y="146" width="17" height="52" rx="8" fill="' + p.ropaColor + '"/>' +
    '<circle cx="54" cy="200" r="10" fill="' + p.piel + '"/>' +
    '<circle cx="146" cy="200" r="10" fill="' + p.piel + '"/>' +
    '<rect x="92" y="122" width="16" height="22" fill="' + p.piel + '"/>' +
    '<circle cx="52" cy="92" r="9" fill="' + p.piel + '"/>' +
    '<circle cx="148" cy="92" r="9" fill="' + p.piel + '"/>' +
    '<circle cx="100" cy="88" r="50" fill="' + p.piel + '"/>' +
    pelo.frente +
    '<ellipse cx="82" cy="88" rx="6" ry="7.5" fill="#2B2B2B"/>' +
    '<ellipse cx="118" cy="88" rx="6" ry="7.5" fill="#2B2B2B"/>' +
    '<circle cx="84" cy="85" r="2.2" fill="#FFF"/>' +
    '<circle cx="120" cy="85" r="2.2" fill="#FFF"/>' +
    '<circle cx="70" cy="104" r="7" fill="rgba(232,93,124,.28)"/>' +
    '<circle cx="130" cy="104" r="7" fill="rgba(232,93,124,.28)"/>' +
    '<path d="M86 106 Q100 120 114 106" stroke="#2B2B2B" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    acc +
    '</svg>';
}

/** Personaje al azar - util para poblar la demo y los afiches. */
function alAzar() {
  const r = (a) => a[Math.floor(Math.random() * a.length)];
  return {
    piel: r(OPCIONES.piel),
    pelo: r(OPCIONES.pelo),
    peinado: r(OPCIONES.peinado),
    ropa: r(OPCIONES.ropa),
    ropaColor: r(['#4A90D9', '#E85DA1', '#3FB98B', '#F2A03D', '#8B6BD9', '#E5544B']),
    pantalonColor: r(['#3A4A63', '#5B4636', '#2F6B52', '#6B3550']),
    accesorio: r(OPCIONES.accesorio),
    accesorioColor: r(['#E85DA1', '#4A90D9', '#F2A03D', '#3FB98B']),
  };
}

if (typeof module !== 'undefined') module.exports = { dibujar, alAzar, OPCIONES, DEFECTO };
