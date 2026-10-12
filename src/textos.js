/**
 * Textos de los 5 juegos — juegos-cumple
 *
 * REGLA DE TÍTULOS: el título es siempre  <Nombre> + verbo  ó  sustantivo de
 * lugar/objeto + de <Nombre>.  NUNCA un adjetivo ni un rol de persona.
 *   ✅ "¡Corre, Pedro!"            (verbo)
 *   ✅ "La pastelería de Sofía"    (lugar)
 *   ❌ "Sofía la Valiente"         (adjetivo -> se rompe con Pedro)
 *   ❌ "El pastelero Pedro"        (rol -> se rompe con Sofía)
 * Así los títulos nunca necesitan tokens de género y se ven bien en el afiche.
 */

const TEXTOS = {

  // ---------- Comunes a todos los juegos ----------
  comun: {
    bienvenida:   '¡Bienvenid[o|a|e], {nombre}!',
    subtitulo:    'Hoy cumples {edad} años',
    jugar:        'JUGAR',
    reintentar:   'Otra vez',
    listo:        '¿Estás list[o|a|e]?',
    ganaste:      '¡Lo lograste, {nombre}!',
    perdiste:     '¡Casi! Inténtalo de nuevo.',
    nuevoRecord:  '¡Nuevo récord! Eres [un|una|une] crack.',
    cargando:     'Preparando la sorpresa...',
    creditos:     'Hecho con cariño para {nombre}',
    despedida:    '¡Feliz cumpleaños, {nombre}! Te quieren mucho, {deQuien}.',
  },

  // ---------- 1. Runner ----------
  runner: {
    titulo:      '¡Corre, {nombre}!',
    instruccion: 'Toca la pantalla para saltar y junta tod[os|os|es] l[os|os|es] {coleccionable}',
    intro:       '{nombre} va corriendo por {lugar} y encontró un montón de {coleccionable}. ¡A juntarl[os|os|es]!',
    obstaculo:   '¡Cuidado! No te tropieces.',
    meta:        '¡Llegaste a la meta! Juntaste {puntos} {coleccionable}.',
    animo:       '¡Sigue así, {nombre}! Nadie corre como tú.',
  },

  // ---------- 2. Trivia ----------
  trivia: {
    titulo:      '¿Cuánto sabes de {nombre}?',
    instruccion: 'Un juego para tod[os|os|es] l[os|os|es] invitad[os|os|es] de la fiesta',
    intro:       'Hoy {nombre} cumple {edad}. ¿Quién [lo|la|le] conoce mejor? ¡A demostrarlo!',
    correcta:    '¡Correcto! Conoces bien a {nombre}.',
    incorrecta:  '¡Uy, no! {nombre} dice que no.',
    turno:       'Turno de {jugador}',
    ganador:     '¡{ganador} es quien mejor conoce a {nombre}!',
    // Estas 8 las llenas con los papás en el formulario del pedido:
    preguntas: [
      '¿Cuál es el color favorito de {nombre}?',
      '¿Qué come {nombre} cuando puede elegir?',
      '¿Cómo se llama [su|su|su] mascota?',
      '¿A qué juega {nombre} todo el día?',
      '¿Qué es lo que más [le|le|le] da risa a {nombre}?',
      '¿Cuál es el superpoder que {nombre} querría tener?',
      '¿Qué canción se sabe de memoria?',
      '¿Con quién se ríe más {nombre}?',
    ],
  },

  // ---------- 3. Aventura (premium) ----------
  aventura: {
    titulo:      '{nombre} y el regalo perdido',
    instruccion: 'Toca los objetos para buscar pistas',
    intro:       '¡Alguien escondió el regalo de {nombre}! Hay que buscarlo por {ciudad} antes de que llegue la torta.',
    pista1:      'Miraste por todos lados en tu pieza... ¡pero encontraste una pista!',
    pista2:      'En {colegio} nadie vio nada. Pero {amigo1} te dio una idea.',
    pista3:      '{amigo2} y {amigo3} te están esperando en {lugar}.',
    encontrado:  '¡Ahí está! Estabas tan cerca todo este tiempo, {nombre}.',
    final:       'Todos gritaron: ¡Feliz cumpleaños, {nombre}! Y tú quedaste contentísim[o|a|e].',
  },

  // ---------- 4. Plataformas ----------
  plataformas: {
    titulo:      '{nombre} rescata a {mascota}',
    instruccion: 'Salta, esquiva y llega hasta {mascota}',
    intro:       '¡{mascota} se perdió en {lugar}! Sol[o|a|e] {nombre} puede encontrar[m:lo|la|le].',
    nivel:       'Nivel {nivel}',
    amigoLibre:  '¡Rescataste a {amigo1}! Ahora te acompaña.',
    casi:        '{mascota} está cerca, ¡sigue subiendo!',
    final:       '¡{mascota} está a salvo! Y está feliz de verte, {nombre}.',
  },

  // ---------- 5. Pastelería ----------
  pasteleria: {
    titulo:      'La pastelería de {nombre}',
    instruccion: 'Arma las tortas antes de que se acabe el tiempo',
    intro:       'Hoy {nombre} atiende la pastelería más rica de {ciudad}. ¡Llegaron un montón de pedidos!',
    pedido:      '{cliente} quiere una torta de {sabor}',
    servido:     '¡Perfecta! El cliente quedó feliz.',
    equivocado:  'Mmm, esa no era. ¡Pero sigue!',
    final:       'Vendiste {puntos} tortas. ¡{nombre} es [el|la|le] mejor de {ciudad}!',
  },

  // ---------- Extra: Memorice ----------
  memorice: {
    titulo:      'El memorice de {nombre}',
    instruccion: 'Encuentra las parejas de fotos',
    intro:       'Fotos de {nombre} y de tod[os|os|es] l[os|os|es] que [lo|la|le] quieren.',
    pareja:      '¡Pareja encontrada!',
    final:       'Terminaste en {tiempo} segundos. ¡Qué buena memoria, {nombre}!',
  },
};

if (typeof module !== 'undefined') module.exports = { TEXTOS };
