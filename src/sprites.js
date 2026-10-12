/**
 * Recoloreado de sprites — juegos-cumple
 *
 * Los sprites de pzUH son de color plano: unos 7 colores cubren el 90% de cada
 * imagen. Eso permite cambiar piel, pelo y ropa por codigo, asi que NO hace
 * falta un set de sprites por cliente: se envia un solo set y el juego lo
 * recolorea al arrancar, leyendo el `personaje` del config.
 *
 * Ventaja para el negocio: cero trabajo por pedido, y la entrega pesa lo mismo
 * para todos los clientes.
 *
 * ATENCION: las paletas son POR PACK. El mismo #ff6666 es el gorro en FlatBoy
 * y el pelo en CuteGirl. No se pueden compartir.
 *
 * Licencias: ver LICENCIAS.md antes de usar cualquiera de estos packs.
 */

// --------------------------------------------------------------- utilidades
const aRGB = (h) => {
  const n = typeof h === 'string' ? parseInt(h.replace('#', ''), 16) : h;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const luz = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

/**
 * Paletas medidas sobre el frame "Run (1).png" de cada pack.
 * - `base`   color principal de la ranura; marca la luminancia de referencia
 * - `tonos`  todos los colores de esa ranura, incluidas sombras y brillos
 * Los colores NO listados aqui quedan intactos: ojos, contornos y zapatos.
 */
const PALETAS = {
  FlatBoy: {
    piel: { base: '#fece90', tonos: ['#fece90', '#feb660', '#fec178'] },
    pelo: { base: '#756861', tonos: ['#756861'] },
    ropa: { base: '#69d2e7', tonos: ['#69d2e7', '#33c2df'] },
    gorro: { base: '#ff6666', tonos: ['#ff6666'] },
  },
  CuteGirlFiles: {
    piel: { base: '#fece90', tonos: ['#fece90', '#feb660'] },
    pelo: { base: '#ff6666', tonos: ['#ff6666', '#ff4747'] },
    ropa: { base: '#669999', tonos: ['#669999', '#58847e'] },
  },
  perro: {
    pelaje: { base: '#eea03e', tonos: ['#eea03e', '#eb8f1f', '#ffb413'] },
  },
  gato: {
    pelaje: { base: '#838383', tonos: ['#838383', '#666666', '#999999', '#333333', '#cccccc'] },
  },
};

/** Nunca se tocan: los ojos y los contornos son la identidad del dibujo. */
const PROTEGIDOS = ['#00ccff', '#000000', '#ffffff'];

/** Que campo del config manda sobre que ranura. */
const DESDE_CONFIG = {
  piel: (p) => p.piel,
  pelo: (p) => p.pelo,
  ropa: (p) => p.ropaColor,
  gorro: (p) => p.accesorioColor,
  pelaje: (p) => p.pelajeColor,
};

// ------------------------------------------------------------------- reglas
/**
 * Convierte (paleta del pack + personaje del cliente) en reglas aplicables.
 * Las ranuras sin color en el config se omiten y quedan como el original.
 */
function construirReglas(nombrePack, personaje) {
  const paleta = PALETAS[nombrePack];
  if (!paleta) throw new Error('No hay paleta definida para el pack "' + nombrePack + '"');

  const reglas = [];
  for (const [ranura, def] of Object.entries(paleta)) {
    const destino = DESDE_CONFIG[ranura] && DESDE_CONFIG[ranura](personaje || {});
    if (!destino) continue;
    const lBase = luz(...aRGB(def.base)) || 1;
    for (const tono of def.tonos) {
      reglas.push({ origen: aRGB(tono), destino: aRGB(destino), lBase, ranura });
    }
  }
  return reglas;
}

// ------------------------------------------------------------------ pixeles
/**
 * Aplica las reglas sobre RGBA crudo. Funciona igual con un Buffer de Node,
 * un Uint8ClampedArray de canvas o un array normal — por eso es la parte que
 * se puede testear sin navegador.
 *
 * La luminancia del pixel respecto al color base de su ranura se conserva, asi
 * que las sombras siguen siendo sombras despues del cambio.
 *
 * `tol` = 28 esta elegido a proposito: alcanza para los bordes suavizados pero
 * no llega al #00ccff de los ojos ni al #33c2df de la sombra de la ropa.
 */
function aplicarPixeles(datos, reglas, tol = 28) {
  if (!reglas.length) return datos;
  const protegidos = PROTEGIDOS.map(aRGB);
  const tol2 = tol * tol;

  for (let i = 0; i < datos.length; i += 4) {
    if (datos[i + 3] < 8) continue;
    const r = datos[i], g = datos[i + 1], b = datos[i + 2];

    let saltar = false;
    for (const p of protegidos) {
      if (r === p[0] && g === p[1] && b === p[2]) { saltar = true; break; }
    }
    if (saltar) continue;

    let mejor = null, mejorD = Infinity;
    for (const regla of reglas) {
      const o = regla.origen;
      const d = (r - o[0]) ** 2 + (g - o[1]) ** 2 + (b - o[2]) ** 2;
      if (d < tol2 && d < mejorD) { mejorD = d; mejor = regla; }
    }
    if (!mejor) continue;

    const ratio = luz(r, g, b) / mejor.lBase;
    datos[i]     = Math.max(0, Math.min(255, Math.round(mejor.destino[0] * ratio)));
    datos[i + 1] = Math.max(0, Math.min(255, Math.round(mejor.destino[1] * ratio)));
    datos[i + 2] = Math.max(0, Math.min(255, Math.round(mejor.destino[2] * ratio)));
  }
  return datos;
}

// ------------------------------------------------------------- navegador
/** Recolorea una imagen ya cargada y devuelve un canvas listo para dibujar. */
function recolorearImagen(img, reglas, tol) {
  const lienzo = document.createElement('canvas');
  lienzo.width = img.naturalWidth || img.width;
  lienzo.height = img.naturalHeight || img.height;
  const ctx = lienzo.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const datos = ctx.getImageData(0, 0, lienzo.width, lienzo.height);
  aplicarPixeles(datos.data, reglas, tol);
  ctx.putImageData(datos, 0, 0);
  return lienzo;
}

function cargarImagen(url) {
  return new Promise((ok, mal) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => mal(new Error('No se pudo cargar ' + url));
    img.src = url;
  });
}

/**
 * Carga una secuencia numerada de pzUH y la devuelve recoloreada.
 * Los archivos vienen como "Run (1).png", "Run (2).png"...
 *
 *   const correr = await cargarAnimacion('assets/FlatBoy/png', 'Run', 15, reglas);
 */
async function cargarAnimacion(carpeta, animacion, cuadros, reglas, tol) {
  const urls = [];
  for (let i = 1; i <= cuadros; i++) {
    urls.push(carpeta + '/' + animacion + ' (' + i + ').png');
  }
  const imgs = await Promise.all(urls.map(cargarImagen));
  return imgs.map((img) => recolorearImagen(img, reglas, tol));
}

/** Cuadros por animacion de cada pack, contados sobre los archivos reales. */
const CUADROS = {
  FlatBoy:       { Idle: 15, Run: 15, Walk: 15, Jump: 15, Dead: 15 },
  CuteGirlFiles: { Idle: 16, Run: 20, Walk: 20, Jump: 30, Dead: 30 },
  perro:         { Idle: 10, Run: 8, Walk: 10, Jump: 8, Dead: 10, Fall: 8, Hurt: 10, Slide: 10 },
  gato:          { Idle: 10, Run: 8, Walk: 10, Jump: 8, Dead: 10, Fall: 8, Hurt: 10, Slide: 10 },
};

if (typeof module !== 'undefined') {
  module.exports = {
    PALETAS, PROTEGIDOS, CUADROS,
    construirReglas, aplicarPixeles, recolorearImagen, cargarAnimacion,
  };
}
