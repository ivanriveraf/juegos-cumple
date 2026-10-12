# 🎂 juegos-cumple

> ⚠️ **Prototipo.** Este repositorio muestra el motor en desarrollo con fines de portafolio. El producto final y los recursos gráficos licenciados no forman parte de este repositorio.

Es un **motor de personalización de videojuegos de cumpleaños para niños**. Con una sola base de código se atiende a todos los clientes: por cada pedido solo cambia un archivo **JSON** con los datos del cumpleañero (nombre, edad, mascota, amigos, colores y personaje), y el motor genera **6 minijuegos personalizados** que se entregan por link y código QR.

## Lo interesante del proyecto

### Motor de género gramatical en español
En español, el género cambia gran parte del texto: *bienvenid**o*** / *bienvenid**a***, *perdid**o*** / *perdid**a***. El motor resuelve esto con *tokens*, y también considera el género de la mascota:

```js
'¡Bienvenid[o|a|e], {nombre}!'          // -> ¡Bienvenida, Sofía!
'{mascota} está perdid[m:o|a|e]'        // -> Luna está perdida
```

| Token | Qué hace |
|---|---|
| `[a\|b\|c]` | Género del cumpleañero: masculino, femenino o neutro |
| `[m:a\|b\|c]` | Género de la mascota |
| `{variable}` | Valor tomado del config (`{nombre}`, `{edad}`, `{lugar}`…) |

Un *linter* marca como error cualquier token que no tenga sus 3 variantes, para que ningún texto funcione solo con la mitad de los clientes.

### Personaje modular y recoloreo de sprites
El personaje se arma con opciones de piel, pelo, peinado, ropa y accesorios, que **no están agrupadas por género**. `sprites.js` recolorea los sprites en tiempo real según el config de cada cliente.

### Flujo de trabajo pensado para producción
- Meta: entregar un pedido en **45 a 90 minutos**.
- `build.sh` incrusta los módulos en páginas HTML autónomas, listas para publicar.
- `test.js` verifica el motor de punta a punta (`node test.js`).

## Estructura

```
src/
  genero.js      motor de texto: resuelve género y variables
  textos.js      textos de los 6 juegos
  personaje.js   personaje modular (SVG)
  sprites.js     recoloreo de sprites por cliente
config/          plantilla y ejemplos de pedidos (JSON)
demo.html        banco de pruebas (requiere servidor local)
build.sh         genera las versiones standalone
test.js          tests del motor
```

## Cómo probarlo

```bash
node test.js                  # corre los tests del motor
sh build.sh                   # genera las páginas standalone
```

Después abre `demo-standalone.html` en el navegador.

> Los sprites de terceros no se incluyen en el repositorio. Sin ellos, las vistas previas usan el personaje en SVG.

## Tecnologías

JavaScript (ES6+) · HTML5 · CSS3 · SVG · Node.js (tests) · Shell

## Créditos

Desarrollo: **Iván Rivera** ([GitHub](https://github.com/ivanriveraf) · [LinkedIn](https://linkedin.com/in/ivan-patricio-rivera-fuentealba))

## Licencia

© 2026 Iván Rivera. Todos los derechos reservados. Ver [LICENSE](LICENSE).
