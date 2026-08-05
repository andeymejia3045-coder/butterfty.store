#!/usr/bin/env bash
# =============================================================================
#  Batería de pruebas end-to-end de la tienda LISAPRO
#  -----------------------------------------------------------------------------
#  Levanta un servidor local, abre un navegador real (headless) y recorre el
#  flujo completo: landing -> carrito -> checkout -> WhatsApp -> confirmación.
#
#  Uso:  bash herramientas/probar.sh
# =============================================================================
set -uo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUERTO=4173
BASE="http://127.0.0.1:${PUERTO}"
S="--session pruebas"
SALIDA="${RAIZ}/herramientas/.resultados"
CAPTURAS="/projects/sandbox/.kiro/artifacts/screenshots"

mkdir -p "$SALIDA" "$CAPTURAS"

# ---------------------------------------------------------------- servidor ----
cd "$RAIZ"
setsid python3 -m http.server "$PUERTO" --bind 0.0.0.0 > "$SALIDA/servidor.log" 2>&1 < /dev/null &
disown
sleep 2

if ! curl -sf -o /dev/null "$BASE/index.html"; then
  echo "✗ No se pudo levantar el servidor en $BASE"
  exit 1
fi
echo "✓ Servidor local activo en $BASE"
echo ""

TOTAL=0
PASARON=0
FALLARON=0

# Ejecuta un archivo de pruebas y reporta el resultado
correr() {
  local etiqueta="$1"
  local archivo="$2"
  local destino="$SALIDA/$(basename "$archivo" .js).json"

  agent-browser $S eval --stdin < "$archivo" > "$destino" 2>&1

  local resumen
  resumen=$(python3 - "$destino" <<'PY'
import json, sys
ruta = sys.argv[1]
try:
    with open(ruta, encoding='utf-8') as f:
        bruto = f.read().strip()
    datos = json.loads(json.loads(bruto)) if bruto.startswith('"') else json.loads(bruto)
except Exception as e:
    print("ERROR|0|0|1|No se pudo leer el resultado: %s" % e)
    sys.exit(0)
fallos = "; ".join("%s (%s)" % (f["prueba"], f["detalle"]) for f in datos.get("fallos", []))
print("OK|%d|%d|%d|%s" % (datos["total"], datos["pasaron"], datos["fallaron"], fallos))
PY
)

  IFS='|' read -r estado t p f detalle <<< "$resumen"
  TOTAL=$((TOTAL + t))
  PASARON=$((PASARON + p))
  FALLARON=$((FALLARON + f))

  if [ "$f" = "0" ] && [ "$estado" = "OK" ]; then
    printf "  ✓ %-34s %s/%s pruebas\n" "$etiqueta" "$p" "$t"
  else
    printf "  ✗ %-34s %s/%s pruebas\n" "$etiqueta" "$p" "$t"
    echo "      → $detalle"
  fi
}

echo "── FLUJO PRINCIPAL ─────────────────────────────────────────────"

agent-browser $S open "$BASE/index.html"        > /dev/null 2>&1
agent-browser $S wait --load networkidle        > /dev/null 2>&1
correr "Landing y carrito" "$RAIZ/herramientas/pruebas/01-landing.js"

agent-browser $S open "$BASE/checkout.html"     > /dev/null 2>&1
agent-browser $S wait --load networkidle        > /dev/null 2>&1
correr "Checkout, pagos y WhatsApp" "$RAIZ/herramientas/pruebas/02-checkout.js"

agent-browser $S open "$BASE/gracias.html"      > /dev/null 2>&1
agent-browser $S wait --load networkidle        > /dev/null 2>&1
correr "Confirmación del pedido" "$RAIZ/herramientas/pruebas/03-gracias.js"

echo ""
echo "── PEDIDO CONTRA ENTREGA ───────────────────────────────────────"
agent-browser $S open "$BASE/index.html"        > /dev/null 2>&1
agent-browser $S wait --load networkidle        > /dev/null 2>&1
correr "Flujo de pago contra entrega" "$RAIZ/herramientas/pruebas/04-contraentrega.js"

echo ""
echo "── ROBUSTEZ ────────────────────────────────────────────────────"
agent-browser $S open "$BASE/checkout.html"     > /dev/null 2>&1
agent-browser $S wait --load networkidle        > /dev/null 2>&1
correr "Casos límite y errores" "$RAIZ/herramientas/pruebas/05-robustez.js"

# --------------------------------------------------------------- capturas ----
echo ""
echo "── CAPTURAS RESPONSIVE ─────────────────────────────────────────"
MARCA=$(date +%Y%m%d-%H%M%S)

capturar() {
  local ancho="$1" alto="$2" pagina="$3" etiqueta="$4" completa="$5"
  agent-browser $S set viewport "$ancho" "$alto" > /dev/null 2>&1
  agent-browser $S open "$BASE/$pagina" > /dev/null 2>&1
  agent-browser $S wait --load networkidle > /dev/null 2>&1
  agent-browser $S eval "window.scrollTo(0,0); document.querySelectorAll('.revelar').forEach(e=>e.classList.add('visible')); 1" > /dev/null 2>&1
  sleep 0.6
  if [ "$completa" = "full" ]; then
    agent-browser $S screenshot --full "$CAPTURAS/${MARCA}-${etiqueta}.png" > /dev/null 2>&1
  else
    agent-browser $S screenshot "$CAPTURAS/${MARCA}-${etiqueta}.png" > /dev/null 2>&1
  fi
  if [ -f "$CAPTURAS/${MARCA}-${etiqueta}.png" ]; then
    printf "  ✓ %-32s %sx%s\n" "$etiqueta" "$ancho" "$alto"
  else
    printf "  ✗ %-32s falló\n" "$etiqueta"
  fi
}

# Dejamos un carrito y un pedido de ejemplo para que las capturas
# del checkout y la confirmación muestren contenido real
agent-browser $S open "$BASE/index.html" > /dev/null 2>&1
agent-browser $S wait --load networkidle > /dev/null 2>&1
agent-browser $S eval --stdin < "$RAIZ/herramientas/pruebas/sembrar.js" > /dev/null 2>&1

# En el checkout dejamos elegida la transferencia para ver los datos bancarios
rellenar_checkout() {
  agent-browser $S eval --stdin > /dev/null 2>&1 <<'JS'
(() => {
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return;
    e.value = v; e.dispatchEvent(new Event('input', {bubbles:true}));
    e.dispatchEvent(new Event('change', {bubbles:true})); };
  set('nombre','María José'); set('apellido','González Pérez');
  set('cedula','0926687856'); set('telefono','0991234567');
  set('email','maria@correo.com'); set('provincia','Guayas');
  set('ciudad','Guayaquil');
  set('direccion','Av. Francisco de Orellana 123 y Calle Segunda, Alborada etapa 5');
  set('referencia','Casa esquinera de reja blanca, frente a la farmacia');
  const r = document.querySelector('input[value="transferencia"]');
  r.checked = true; r.dispatchEvent(new Event('change', {bubbles:true}));
  return 1;
})()
JS
}

capturar 390  844  index.html    "movil-inicio"        parcial
capturar 390  844  index.html    "movil-completo"      full
capturar 768  1024 index.html    "tablet-inicio"       parcial
capturar 1440 900  index.html    "escritorio-inicio"   parcial

# Checkout móvil, con el formulario lleno y transferencia elegida
agent-browser $S set viewport 390 844 > /dev/null 2>&1
agent-browser $S open "$BASE/checkout.html" > /dev/null 2>&1
agent-browser $S wait --load networkidle > /dev/null 2>&1
rellenar_checkout
sleep 0.6
agent-browser $S screenshot --full "$CAPTURAS/${MARCA}-movil-checkout.png" > /dev/null 2>&1
[ -f "$CAPTURAS/${MARCA}-movil-checkout.png" ] && printf "  ✓ %-32s %s\n" "movil-checkout" "390x844"

agent-browser $S set viewport 1440 900 > /dev/null 2>&1
agent-browser $S open "$BASE/checkout.html" > /dev/null 2>&1
agent-browser $S wait --load networkidle > /dev/null 2>&1
rellenar_checkout
sleep 0.6
agent-browser $S screenshot "$CAPTURAS/${MARCA}-escritorio-checkout.png" > /dev/null 2>&1
[ -f "$CAPTURAS/${MARCA}-escritorio-checkout.png" ] && printf "  ✓ %-32s %s\n" "escritorio-checkout" "1440x900"

capturar 390  844  gracias.html  "movil-gracias"       full

# Captura del cajón del carrito abierto
agent-browser $S set viewport 390 844 > /dev/null 2>&1
agent-browser $S open "$BASE/index.html" > /dev/null 2>&1
agent-browser $S wait --load networkidle > /dev/null 2>&1
agent-browser $S eval "document.getElementById('btnAgregar').click(); 1" > /dev/null 2>&1
sleep 0.8
agent-browser $S screenshot "$CAPTURAS/${MARCA}-movil-carrito.png" > /dev/null 2>&1
[ -f "$CAPTURAS/${MARCA}-movil-carrito.png" ] && printf "  ✓ %-32s %s\n" "movil-carrito" "390x844"

# ---------------------------------------------------------------- resumen ----
echo ""
echo "════════════════════════════════════════════════════════════════"
if [ "$FALLARON" = "0" ]; then
  echo "  RESULTADO: $PASARON/$TOTAL pruebas pasaron. Todo funciona ✓"
else
  echo "  RESULTADO: $PASARON/$TOTAL pruebas pasaron, $FALLARON fallaron ✗"
fi
echo "════════════════════════════════════════════════════════════════"

pkill -f "http.server $PUERTO" 2>/dev/null
exit 0
