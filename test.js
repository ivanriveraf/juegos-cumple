/**
 * test.js — verificacion del motor de personalizacion.
 *   node test.js
 * Sale con codigo 1 si algo falla, para poder usarlo en un hook o en CI.
 */
const fs = require('fs');
const path = require('path');
const { t, lint } = require('./src/genero.js');
const { TEXTOS } = require('./src/textos.js');
const { dibujar, alAzar, OPCIONES } = require('./src/personaje.js');

let fallos = 0;
const ok = (cond, msg, extra) => {
  if (cond) { console.log('  OK    ' + msg); }
  else { fallos++; console.log('  FALLA ' + msg + (extra ? '\n        -> ' + extra : '')); }
};

// ---------------------------------------------------------------- 1. lint
console.log('\n[1] lint() sobre los 3 configs de ejemplo');
const dir = path.join(__dirname, 'config');
for (const f of fs.readdirSync(dir).filter((x) => x.startsWith('ejemplo-'))) {
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const problemas = lint(TEXTOS, cfg);
  ok(problemas.length === 0,
     `${f} (${cfg.nombre}, genero "${cfg.genero}") — ${problemas.length} problema(s)`,
     problemas.map((p) => `[${p.tipo}] ${p.ruta}: ${p.detalle}`).join('\n        -> '));
}

// ------------------------------------------------------ 2. genero del nino
console.log('\n[2] El genero del cumpleanero reescribe el texto');
const base = { nombre:'X', mascota:{nombre:'M', genero:'m'} };
const casos = [
  ['¡Bienvenid[o|a|e], {nombre}!', 'm', '¡Bienvenido, X!'],
  ['¡Bienvenid[o|a|e], {nombre}!', 'f', '¡Bienvenida, X!'],
  ['¡Bienvenid[o|a|e], {nombre}!', 'n', '¡Bienvenide, X!'],
  ['Eres [un|una|une] campe[ón|ona|one]', 'm', 'Eres un campeón'],
  ['Eres [un|una|une] campe[ón|ona|one]', 'f', 'Eres una campeona'],
  ['Eres [un|una|une] campe[ón|ona|one]', 'n', 'Eres une campeone'],
];
for (const [plantilla, g, esperado] of casos) {
  const got = t(plantilla, { ...base, genero: g });
  ok(got === esperado, `[${g}] "${got}"`, `esperaba "${esperado}"`);
}

// --------------------------------------------------- 3. genero de mascota
console.log('\n[3] La mascota tiene su propio canal, independiente del nino');
const mascotas = [
  ['f', 'm', '{mascota} está perdid[m:o|a|e]', 'M está perdido'],
  ['f', 'f', '{mascota} está perdid[m:o|a|e]', 'M está perdida'],
  ['m', 'n', 'Ayuda a encontrar[m:lo|la|le]', 'Ayuda a encontrarle'],
  ['m', 'f', 'Sol[o|a|e] {nombre} puede encontrar[m:lo|la|le]', 'Solo X puede encontrarla'],
  ['f', 'm', 'Sol[o|a|e] {nombre} puede encontrar[m:lo|la|le]', 'Sola X puede encontrarlo'],
];
for (const [gNino, gMasc, plantilla, esperado] of mascotas) {
  const got = t(plantilla, { nombre:'X', genero:gNino, mascota:{nombre:'M', genero:gMasc} });
  ok(got === esperado, `nino=${gNino} mascota=${gMasc} -> "${got}"`, `esperaba "${esperado}"`);
}

// -------------------------------------------------- 4. la trampa del "m:"
console.log('\n[4] Un token que empieza con "m" NO se confunde con el canal mascota');
const trampa = t('Hay [mucho|mucha|muche] que hacer',
                 { nombre:'X', genero:'f', mascota:{nombre:'M', genero:'m'} });
ok(trampa === 'Hay mucha que hacer', `"${trampa}" (usa el genero del nino, no el de la mascota)`);

// ----------------------------------------------- 5. lint detecta lo malo
console.log('\n[5] lint() detecta errores de verdad');
const cfgOk = JSON.parse(fs.readFileSync(path.join(dir, 'ejemplo-sofia.json'), 'utf8'));
const malos = {
  dosVariantes: { a: 'Est[o|a] falla' },
  varFantasma:  { a: 'Hola {noExiste}' },
};
const p1 = lint(malos.dosVariantes, cfgOk);
ok(p1.some((p) => p.tipo === 'genero-incompleto'), 'marca token con 2 variantes en vez de 3');
const p2 = lint(malos.varFantasma, cfgOk);
ok(p2.some((p) => p.tipo === 'variable-desconocida'), 'marca variable que no existe en el config');

// --------------------------------------------- 6. titulos sin genero
console.log('\n[6] Ningun titulo de juego depende del genero');
for (const [juego, bloque] of Object.entries(TEXTOS)) {
  if (!bloque.titulo) continue;
  const m = t(bloque.titulo, { ...cfgOk, genero:'m' });
  const f = t(bloque.titulo, { ...cfgOk, genero:'f' });
  const n = t(bloque.titulo, { ...cfgOk, genero:'n' });
  ok(m === f && f === n, `${juego}: "${m}"`, `varia segun genero: m="${m}" f="${f}" n="${n}"`);
}

// ------------------------------------------------------- 7. personaje
console.log('\n[7] El personaje modular dibuja todas las combinaciones');
let combinaciones = 0;
for (const peinado of OPCIONES.peinado) {
  for (const ropa of OPCIONES.ropa) {
    for (const accesorio of OPCIONES.accesorio) {
      const svg = dibujar({ peinado, ropa, accesorio });
      combinaciones++;
      if (!svg.startsWith('<svg') || !svg.endsWith('</svg>') || svg.includes('undefined')) {
        fallos++;
        console.log(`  FALLA ${peinado}/${ropa}/${accesorio} produjo SVG invalido`);
        break;
      }
    }
  }
}
ok(true, `${combinaciones} combinaciones de peinado x ropa x accesorio, todas validas`);
const azar = alAzar();
ok(dibujar(azar).startsWith('<svg'), 'alAzar() produce un personaje dibujable');
ok(dibujar({}).startsWith('<svg'), 'dibujar({}) cae a los valores por defecto sin reventar');

// --------------------------------------------------- 8. recoloreo de sprites
console.log('\n[8] Recoloreo de sprites (src/sprites.js)');
const spr = require('./src/sprites.js');

// Un "sprite" sintetico: un pixel por cada color conocido de FlatBoy.
const COLORES_FLATBOY = [
  ['#756861','pelo'], ['#fece90','piel'], ['#feb660','piel sombra'], ['#fec178','piel brillo'],
  ['#69d2e7','ropa'], ['#33c2df','ropa sombra'], ['#ff6666','gorro'],
  ['#00ccff','OJOS'], ['#000000','CONTORNO'], ['#ffffff','ZAPATOS'],
];
const aN = (h) => parseInt(h.slice(1), 16);
const px = new Uint8ClampedArray(COLORES_FLATBOY.length * 4);
COLORES_FLATBOY.forEach(([h], i) => {
  const n = aN(h);
  px[i*4] = (n>>16)&255; px[i*4+1] = (n>>8)&255; px[i*4+2] = n&255; px[i*4+3] = 255;
});

const personajeSofia = JSON.parse(
  fs.readFileSync(path.join(dir, 'ejemplo-sofia.json'), 'utf8')).personaje;
const reglas = spr.construirReglas('FlatBoy', personajeSofia);
ok(reglas.length === 7, `construirReglas produce ${reglas.length} reglas (7 tonos mapeados)`);

const antes = Array.from(px);
spr.aplicarPixeles(px, reglas);
const leer = (i) => '#' + [px[i*4],px[i*4+1],px[i*4+2]]
  .map((v) => v.toString(16).padStart(2,'0')).join('');

// Los protegidos NO pueden haber cambiado
[7,8,9].forEach((i) => {
  const igual = [0,1,2].every((k) => px[i*4+k] === antes[i*4+k]);
  ok(igual, `${COLORES_FLATBOY[i][1]} intacto (${COLORES_FLATBOY[i][0]})`,
     `cambio a ${leer(i)}`);
});

// Los mapeados SI tienen que haber cambiado
[0,1,2,3,4,5,6].forEach((i) => {
  const cambio = [0,1,2].some((k) => px[i*4+k] !== antes[i*4+k]);
  ok(cambio, `${COLORES_FLATBOY[i][1]}: ${COLORES_FLATBOY[i][0]} -> ${leer(i)}`);
});

// El sombreado se conserva: la sombra de la piel sigue siendo mas oscura
const brillo = (i) => 0.299*px[i*4] + 0.587*px[i*4+1] + 0.114*px[i*4+2];
ok(brillo(2) < brillo(1), 'la sombra de la piel sigue mas oscura que la piel');
ok(brillo(5) < brillo(4), 'la sombra de la ropa sigue mas oscura que la ropa');

// El mismo #ff6666 tiene que ir a ranuras distintas segun el pack
const rFB = spr.construirReglas('FlatBoy', { accesorioColor:'#111111', piel:'#222222' });
const rCG = spr.construirReglas('CuteGirlFiles', { pelo:'#111111', piel:'#222222' });
const buscar = (rr, hex) => rr.find((x) =>
  '#' + x.origen.map((v) => v.toString(16).padStart(2,'0')).join('') === hex);
ok(buscar(rFB,'#ff6666').ranura === 'gorro',  '#ff6666 es "gorro" en FlatBoy');
ok(buscar(rCG,'#ff6666').ranura === 'pelo',   '#ff6666 es "pelo" en CuteGirl');

// Sin color en el config, la ranura no se toca
const parcial = spr.construirReglas('FlatBoy', { piel: '#B87A4E' });
ok(parcial.length === 3, `config con solo piel -> ${parcial.length} reglas (los 3 tonos de piel)`);

// ---------------------------------------------------------------- final
console.log('\n' + '='.repeat(58));
console.log(fallos === 0 ? 'TODO OK — el motor se comporta como dice el README.'
                         : `${fallos} FALLA(S) — revisar arriba.`);
process.exit(fallos === 0 ? 0 : 1);
