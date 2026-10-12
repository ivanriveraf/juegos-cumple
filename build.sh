#!/bin/sh
# build.sh — incrusta los modulos de src/ en las paginas.
#   demo.html      -> demo-standalone.html      (HTML completo, doble clic)
#                  -> artifact.html             (fragmento, para publicar)
#   catalogo.html  -> catalogo-standalone.html  (HTML completo, doble clic)
#                  -> catalogo-artifact.html    (fragmento, para publicar)
set -e

incrustar() {
  awk '/<script src="src\// {
         match($0, /src\/[a-zA-Z]+\.js/); f = substr($0, RSTART, RLENGTH)
         print "<script>"
         while ((getline l < f) > 0) print l
         close(f)
         print "</script>"
         next
       }
       { print }' "$1"
}

# --- probador -------------------------------------------------------------
incrustar demo.html > demo-standalone.html

incrustar demo.html \
  | awk '/<!--ARTIFACT-INICIO-->/{on=1; next} /<!--ARTIFACT-FIN-->/{on=0} on' \
  | grep -v '^</head>$' | grep -v '^<body>$' | grep -v '^<!--ARTIFACT-CUERPO-->$' \
  > artifact.html

# --- catalogo -------------------------------------------------------------
# catalogo.html ya es un fragmento (empieza en <title>), asi que la version
# local hay que envolverla en el esqueleto HTML que el Artifact pone solo.
incrustar catalogo.html > catalogo-artifact.html

{
  printf '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
  printf '<style>body{margin:0}img{max-width:100%%}[hidden]{display:none!important}</style>\n'
  # El fragmento trae <title>/<link>/<style> (van en head) y luego el cuerpo.
  # El corte esta justo antes de <div class="hoja">.
  awk '/^<div class="hoja">$/ && !hecho { print "</head>"; print "<body>"; hecho = 1 }
       { print }' catalogo-artifact.html
  printf '</body>\n</html>\n'
} > catalogo-standalone.html

for f in demo-standalone.html artifact.html catalogo-standalone.html catalogo-artifact.html; do
  printf '  %-26s %6d bytes\n' "$f" "$(wc -c < "$f")"
done
