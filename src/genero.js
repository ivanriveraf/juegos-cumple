/**
 * Motor de texto con género — juegos-cumple
 *
 * Resuelve tokens de género y variables en todos los textos del juego,
 * para que la MISMA plantilla funcione con Sofía, Pedro o Alex.
 *
 * SINTAXIS
 * --------
 *   {nombre}          -> variable del config
 *   {edad} {mascota} {lugar} {colegio} ...
 *   [o|a|e]           -> género del cumpleañero  (m | f | n)
 *   [m:o|a|e]         -> género de la mascota    (m | f | n)
 *
 * EJEMPLOS
 *   "¡Bienvenid[o|a|e], {nombre}!"        -> "¡Bienvenida, Sofía!"  / "¡Bienvenido, Pedro!"
 *   "Eres [un|una|une] campe[ón|ona|one]" -> "Eres una campeona"    / "Eres un campeón"
 *   "{mascota} está perdid[m:o|a|e]"      -> "Luna está perdida"    / "Rocky está perdido"
 *   "Ayuda a encontrar[m:lo|la|le]"       -> "Ayuda a encontrarla"
 *
 * REGLA DE ORO: escribe SIEMPRE las 3 variantes (m|f|n).
 * Usa lint() para detectar tokens incompletos antes de entregar un pedido.
 */

const ORDEN = { m: 0, f: 1, n: 2 };

/** Variables que el juego rellena mientras se juega, no el config del cliente. */
const RUNTIME = ['puntos', 'nivel', 'tiempo', 'cliente', 'sabor', 'jugador', 'ganador'];

/** Resuelve un string con tokens usando el config del cliente. */
function t(str, cfg) {
  if (typeof str !== 'string') return str;

  const gNino = ORDEN[cfg.genero] ?? 2;
  const gMasc = ORDEN[cfg.mascota?.genero] ?? 2;

  return str
    // [m:o|a|e]  -> género de la mascota
    .replace(/\[m:([^\]]*)\]/g, (_, ops) => pick(ops, gMasc))
    // [o|a|e]    -> género del cumpleañero
    .replace(/\[([^\]]*)\]/g, (_, ops) => pick(ops, gNino))
    // {variable}
    .replace(/\{(\w+)\}/g, (m, k) => {
      const v = variables(cfg)[k];
      return v === undefined ? m : v;
    });
}

function pick(ops, idx) {
  const partes = ops.split('|');
  // Si faltan variantes, cae a la última disponible (nunca revienta en producción).
  return partes[idx] ?? partes[partes.length - 1] ?? '';
}

/** Aplana el config a las variables disponibles en los textos. */
function variables(cfg) {
  return {
    nombre: cfg.nombre,
    apodo: cfg.apodo || cfg.nombre,
    edad: cfg.edad,
    lugar: cfg.lugar,
    colegio: cfg.colegio,
    ciudad: cfg.ciudad,
    mascota: cfg.mascota?.nombre || '',
    tipoMascota: cfg.mascota?.tipo || '',
    coleccionable: cfg.coleccionable?.plural || '',
    amigo1: cfg.amigos?.[0] || '',
    amigo2: cfg.amigos?.[1] || '',
    amigo3: cfg.amigos?.[2] || '',
    deQuien: cfg.mensajeFinal?.firma || '',
  };
}

/**
 * Revisa un objeto de textos y devuelve los problemas encontrados.
 * Corre esto ANTES de exportar el juego de cada cliente.
 */
function lint(textos, cfg) {
  const problemas = [];
  const vars = [...Object.keys(variables(cfg)), ...RUNTIME];

  const revisar = (valor, ruta) => {
    if (typeof valor === 'object' && valor !== null) {
      for (const [k, v] of Object.entries(valor)) revisar(v, `${ruta}.${k}`);
      return;
    }
    if (typeof valor !== 'string') return;

    // Tokens de género con menos de 3 variantes
    for (const match of valor.matchAll(/\[(?:m:)?([^\]]*)\]/g)) {
      const n = match[1].split('|').length;
      if (n < 3) {
        problemas.push({
          tipo: 'genero-incompleto',
          ruta,
          detalle: `"${match[0]}" tiene ${n} variante(s), faltan para m|f|n`,
        });
      }
    }
    // Variables que no existen
    for (const match of valor.matchAll(/\{(\w+)\}/g)) {
      if (!vars.includes(match[1])) {
        problemas.push({
          tipo: 'variable-desconocida',
          ruta,
          detalle: `{${match[1]}} no existe en el config`,
        });
      }
    }
    // Variables que quedaron vacías con este cliente en particular
    let resuelto = t(valor, cfg);
    RUNTIME.forEach((r) => { resuelto = resuelto.split('{' + r + '}').join('X'); });
    if (/\{\w+\}/.test(resuelto)) {
      problemas.push({ tipo: 'sin-resolver', ruta, detalle: resuelto });
    }
    if (/\s{2,}|\s+[.,!?]/.test(resuelto)) {
      problemas.push({
        tipo: 'espacio-raro',
        ruta,
        detalle: `"${resuelto}" — probablemente una variable vacía`,
      });
    }
  };

  revisar(textos, 'textos');
  return problemas;
}

/** Aplica t() recursivamente a un árbol de textos. Úsalo al arrancar el juego. */
function resolverTodo(textos, cfg) {
  if (typeof textos === 'string') return t(textos, cfg);
  if (Array.isArray(textos)) return textos.map((x) => resolverTodo(x, cfg));
  if (typeof textos === 'object' && textos !== null) {
    const out = {};
    for (const [k, v] of Object.entries(textos)) out[k] = resolverTodo(v, cfg);
    return out;
  }
  return textos;
}

if (typeof module !== 'undefined') module.exports = { t, lint, resolverTodo, variables, RUNTIME };
