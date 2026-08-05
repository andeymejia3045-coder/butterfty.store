#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de imágenes SVG para la tienda LISAPRO.

¿Por qué existe este archivo?
-----------------------------
La tienda se entrega con ilustraciones SVG (vectoriales, pesan poquísimo y se
ven nítidas en cualquier pantalla) para que funcione al 100 % desde el primer
segundo, sin depender de fotos externas.

Cuando tengas tus fotos reales, simplemente reemplaza los archivos de
assets/img/ con el MISMO nombre (puedes usar .jpg o .webp y actualizar la
extensión en assets/js/config.js). No necesitas volver a correr este script.

Uso:
    python3 herramientas/generar-imagenes.py
"""

import os
import math

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(RAIZ, "assets", "img")

ROSA = "#FB2E71"
ROSA_CLARO = "#FF6B9D"
ROSA_PASTEL = "#FFE3EC"
ROSA_FONDO = "#FFF2F6"
NEGRO = "#101010"
GRIS = "#757575"


def escribir(nombre, contenido):
    ruta = os.path.join(IMG, nombre)
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(contenido.strip() + "\n")
    print(f"  ✓ {nombre}")


# ---------------------------------------------------------------------------
# UTILIDADES DE COLOR
# ---------------------------------------------------------------------------
def _hex_a_rgb(color):
    c = color.lstrip("#")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def _rgb_a_hex(rgb):
    return "#%02X%02X%02X" % tuple(max(0, min(255, int(round(v)))) for v in rgb)


def aclarar(color, factor):
    """Mezcla el color con blanco. factor 0 = igual, 1 = blanco."""
    r, g, b = _hex_a_rgb(color)
    return _rgb_a_hex((
        r + (255 - r) * factor,
        g + (255 - g) * factor,
        b + (255 - b) * factor,
    ))


def oscurecer(color, factor):
    """Mezcla el color con negro. factor 0 = igual, 1 = negro."""
    r, g, b = _hex_a_rgb(color)
    return _rgb_a_hex((r * (1 - factor), g * (1 - factor), b * (1 - factor)))


# ---------------------------------------------------------------------------
# PIEZA REUTILIZABLE: el cepillo secador visto de frente
# ---------------------------------------------------------------------------
def cepillo(x=0, y=0, escala=1.0, rot=0):
    """Devuelve un <g> con el dibujo del cepillo secador voluminizador."""
    transform = f"translate({x} {y}) scale({escala}) rotate({rot})"
    return f"""
  <g transform="{transform}">
    <!-- cable -->
    <path d="M60 470 C 20 500, 105 520, 70 552" fill="none" stroke="{NEGRO}"
          stroke-width="7" stroke-linecap="round"/>
    <rect x="48" y="548" width="30" height="20" rx="4" fill="{NEGRO}"/>

    <!-- mango -->
    <path d="M38 300 L82 300 L78 470 Q60 486 42 470 Z" fill="url(#gMango)"/>
    <!-- controles del mango -->
    <rect x="47" y="330" width="26" height="7" rx="3.5" fill="{ROSA}"/>
    <rect x="47" y="345" width="26" height="7" rx="3.5" fill="#3a3a3a"/>
    <rect x="47" y="360" width="26" height="7" rx="3.5" fill="#3a3a3a"/>
    <text x="60" y="392" font-family="Arial, sans-serif" font-size="9"
          fill="#8a8a8a" text-anchor="middle" letter-spacing="1">LISAPRO</text>

    <!-- collar rosado -->
    <path d="M32 262 L88 262 L84 306 L36 306 Z" fill="url(#gRosa)"/>
    <ellipse cx="60" cy="262" rx="28" ry="7" fill="{ROSA_CLARO}"/>

    <!-- barril -->
    <rect x="26" y="86" width="68" height="180" rx="34" fill="url(#gBarril)"/>
    <rect x="38" y="96" width="20" height="160" rx="10" fill="#2a2a2a" opacity="0.55"/>

    <!-- cerdas: filas laterales -->
    <g stroke="{NEGRO}" stroke-width="3.4" stroke-linecap="round">
      {"".join(f'<line x1="26" y1="{100 + i * 15}" x2="6" y2="{97 + i * 15}"/>' for i in range(11))}
      {"".join(f'<line x1="94" y1="{100 + i * 15}" x2="114" y2="{97 + i * 15}"/>' for i in range(11))}
    </g>
    <g stroke="{ROSA}" stroke-width="3" stroke-linecap="round">
      {"".join(f'<line x1="28" y1="{108 + i * 15}" x2="12" y2="{112 + i * 15}"/>' for i in range(10))}
      {"".join(f'<line x1="92" y1="{108 + i * 15}" x2="108" y2="{112 + i * 15}"/>' for i in range(10))}
    </g>
    <!-- puntas redondeadas de las cerdas -->
    <g fill="{ROSA_CLARO}">
      {"".join(f'<circle cx="6" cy="{97 + i * 15}" r="2.6"/>' for i in range(11))}
      {"".join(f'<circle cx="114" cy="{97 + i * 15}" r="2.6"/>' for i in range(11))}
    </g>

    <!-- cerdas frontales (textura) -->
    <g fill="{NEGRO}" opacity="0.85">
      {"".join(
        f'<circle cx="{44 + (j % 3) * 16}" cy="{100 + j // 3 * 18}" r="3.1"/>'
        for j in range(30)
      )}
    </g>

    <!-- tapa superior -->
    <ellipse cx="60" cy="88" rx="34" ry="11" fill="#1c1c1c"/>
    <ellipse cx="60" cy="86" rx="22" ry="7" fill="{ROSA}" opacity="0.9"/>
  </g>
"""


DEFS = f"""
  <defs>
    <linearGradient id="gMango" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2c2c2c"/>
      <stop offset="45%" stop-color="#141414"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <linearGradient id="gBarril" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3a3a3a"/>
      <stop offset="40%" stop-color="#161616"/>
      <stop offset="100%" stop-color="#050505"/>
    </linearGradient>
    <linearGradient id="gRosa" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="{ROSA_CLARO}"/>
      <stop offset="55%" stop-color="{ROSA}"/>
      <stop offset="100%" stop-color="#C81355"/>
    </linearGradient>
    <linearGradient id="gCaja" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1d1d1d"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
  </defs>
"""


# ---------------------------------------------------------------------------
# 1. Producto principal: cepillo + caja
# ---------------------------------------------------------------------------
def producto_1():
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img"
     aria-label="Cepillo secador voluminizador tres en uno junto a su caja">
{DEFS}
  <rect width="800" height="800" fill="#ffffff"/>

  <!-- caja del producto -->
  <g transform="translate(470 150)">
    <rect x="0" y="0" width="200" height="470" rx="6" fill="url(#gCaja)"/>
    <rect x="200" y="0" width="34" height="470" rx="4" fill="#000" opacity="0.75"/>
    <path d="M0 0 L200 0 L234 0 L234 12 L0 12 Z" fill="#2a2a2a"/>
    <text x="100" y="52" font-family="Arial, sans-serif" font-size="26" font-weight="bold"
          fill="#ffffff" text-anchor="middle" letter-spacing="3">LISAPRO</text>
    <line x1="34" y1="66" x2="166" y2="66" stroke="{ROSA}" stroke-width="2"/>
    <text x="100" y="92" font-family="Arial, sans-serif" font-size="12"
          fill="#cccccc" text-anchor="middle" letter-spacing="1.5">ONE STEP HAIR</text>
    <text x="100" y="110" font-family="Arial, sans-serif" font-size="12"
          fill="#cccccc" text-anchor="middle" letter-spacing="1.5">DRYER &amp; STYLER</text>

    <!-- iconos en la caja -->
    <g transform="translate(56 140)">
      <circle cx="22" cy="22" r="21" fill="none" stroke="#ffffff" stroke-width="1.6"/>
      <path d="M12 30 Q22 8 32 30" fill="none" stroke="#fff" stroke-width="2.4"/>
      <circle cx="22" cy="88" r="21" fill="none" stroke="#ffffff" stroke-width="1.6"/>
      <path d="M11 88 h22 M22 77 v22" stroke="#fff" stroke-width="2.4"/>
      <circle cx="22" cy="154" r="21" fill="none" stroke="{ROSA}" stroke-width="1.6"/>
      <path d="M12 160 Q22 140 32 160 Q22 168 12 160" fill="none" stroke="{ROSA}" stroke-width="2.2"/>
    </g>

    <text x="100" y="382" font-family="Arial, sans-serif" font-size="15" font-weight="bold"
          fill="{ROSA}" text-anchor="middle" letter-spacing="2">HOT AIR BRUSH</text>
    <text x="100" y="410" font-family="Arial, sans-serif" font-size="10"
          fill="#999" text-anchor="middle" letter-spacing="1">STRAIGHTENING + DRYING</text>
    <rect x="60" y="428" width="80" height="22" rx="3" fill="#fff" opacity="0.15"/>
  </g>

  <!-- el cepillo -->
  {cepillo(x=140, y=110, escala=1.08)}
</svg>
"""


# ---------------------------------------------------------------------------
# 2. Medidas del producto
# ---------------------------------------------------------------------------
def producto_2():
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img"
     aria-label="Medidas del cepillo: 12.4 pulgadas de alto y barril de 2.8 pulgadas">
{DEFS}
  <rect width="800" height="800" fill="#ffffff"/>

  <text x="60" y="70" font-family="Arial, sans-serif" font-size="46" font-weight="bold"
        fill="{NEGRO}" letter-spacing="6">LISAPRO</text>

  <!-- medida superior: 3 inch -->
  <g stroke="{NEGRO}" stroke-width="2.5">
    <line x1="120" y1="150" x2="250" y2="150"/>
    <line x1="120" y1="142" x2="120" y2="158"/>
    <line x1="250" y1="142" x2="250" y2="158"/>
  </g>
  <text x="185" y="138" font-family="Arial, sans-serif" font-size="19" font-weight="bold"
        fill="{NEGRO}" text-anchor="middle">3 inch</text>

  {cepillo(x=125, y=170, escala=1.0)}

  <!-- medida lateral: 12.4 inch -->
  <g stroke="{NEGRO}" stroke-width="2.5">
    <line x1="300" y1="256" x2="300" y2="640"/>
    <line x1="292" y1="256" x2="308" y2="256"/>
    <line x1="292" y1="640" x2="308" y2="640"/>
  </g>
  <text x="326" y="448" font-family="Arial, sans-serif" font-size="19" font-weight="bold"
        fill="{NEGRO}" text-anchor="middle"
        transform="rotate(90 326 448)">12.4 inch</text>

  <!-- etiqueta -->
  <rect x="392" y="96" width="256" height="42" rx="21" fill="{ROSA_PASTEL}"/>
  <text x="520" y="124" font-family="Arial, sans-serif" font-size="18" font-weight="bold"
        fill="{NEGRO}" text-anchor="middle">Product size display</text>

  <!-- detalle del barril en círculo -->
  <circle cx="570" cy="430" r="168" fill="{ROSA_FONDO}"/>
  <g transform="translate(492 300) scale(1.35)">
    <rect x="0" y="0" width="116" height="190" rx="58" fill="url(#gBarril)"/>
    <g fill="{ROSA}">
      {"".join(f'<circle cx="{16 + (k % 5) * 21}" cy="{22 + k // 5 * 21}" r="4.4"/>' for k in range(40))}
    </g>
    <ellipse cx="58" cy="188" rx="30" ry="12" fill="#0a0a0a"/>
  </g>
  <g stroke="{NEGRO}" stroke-width="2.5">
    <line x1="492" y1="268" x2="648" y2="268"/>
    <line x1="492" y1="260" x2="492" y2="276"/>
    <line x1="648" y1="260" x2="648" y2="276"/>
  </g>
  <text x="570" y="252" font-family="Arial, sans-serif" font-size="19" font-weight="bold"
        fill="{NEGRO}" text-anchor="middle">2.8" BARREL</text>
</svg>
"""


# ---------------------------------------------------------------------------
# 3. Niveles de temperatura y velocidad
# ---------------------------------------------------------------------------
def producto_3():
    filas = [
        ("LOW Temperature", "High Speed", ROSA),
        ("Medium Temperature", "Low Speed", ROSA_CLARO),
        ("HIGH Temperature", "High Speed", "#C81355"),
    ]
    piezas = []
    for i, (t1, t2, color) in enumerate(filas):
        y = 250 + i * 152
        piezas.append(f"""
  <g transform="translate(430 {y})">
    <circle cx="46" cy="46" r="46" fill="url(#gBarril)"/>
    <path d="M0 46 a46 46 0 0 0 92 0 z" fill="{color}"/>
    <text x="46" y="30" font-family="Arial, sans-serif" font-size="8"
          fill="#bbb" text-anchor="middle">HI  HOT</text>
    <text x="46" y="43" font-family="Arial, sans-serif" font-size="8"
          fill="#bbb" text-anchor="middle">MID WARM</text>
    <text x="46" y="56" font-family="Arial, sans-serif" font-size="8"
          fill="#fff" text-anchor="middle">LOW COOL</text>
    <text x="120" y="40" font-family="Arial, sans-serif" font-size="19" font-weight="bold"
          fill="{NEGRO}">{t1}</text>
    <text x="120" y="66" font-family="Arial, sans-serif" font-size="19" font-weight="bold"
          fill="{NEGRO}">{t2}</text>
  </g>""")

    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img"
     aria-label="Niveles múltiples de temperatura y velocidad del cepillo">
{DEFS}
  <rect width="800" height="800" fill="#EDE7E1"/>

  <rect x="60" y="70" width="330" height="112" rx="4" fill="#C9B9AC" opacity="0.95"/>
  <text x="84" y="118" font-family="Arial, sans-serif" font-size="27" font-weight="bold"
        fill="#ffffff">MULTIPLE HEAT &amp;</text>
  <text x="84" y="154" font-family="Arial, sans-serif" font-size="27" font-weight="bold"
        fill="#ffffff">SPEED SECTIONS</text>

  <!-- mango grande a la izquierda -->
  <g transform="translate(120 210)">
    <path d="M40 0 L200 0 L182 470 Q120 500 58 470 Z" fill="url(#gMango)"/>
    <rect x="88" y="120" width="64" height="16" rx="8" fill="{ROSA}"/>
    <rect x="88" y="156" width="64" height="16" rx="8" fill="#3a3a3a"/>
    <rect x="88" y="192" width="64" height="16" rx="8" fill="#3a3a3a"/>
    <text x="120" y="262" font-family="Arial, sans-serif" font-size="17"
          fill="#8a8a8a" text-anchor="middle" letter-spacing="2">LISAPRO</text>
  </g>
{"".join(piezas)}
</svg>
"""


# ---------------------------------------------------------------------------
# 4. Styling flexibility: cuatro estilos
# ---------------------------------------------------------------------------
def producto_4():
    estilos = [
        ("Hair Dryer", "#C9A98F", "#8C6A4F"),
        ("Curly Hair", "#7A5236", "#4A2F1C"),
        ("Straight Hair", "#E0C9A6", "#B79A72"),
        ("Smoothing volumizer", "#5A3A24", "#311D10"),
    ]
    celdas = []
    for i, (nombre, c1, c2) in enumerate(estilos):
        cx = 80 + (i % 2) * 340
        cy = 150 + (i // 2) * 320
        celdas.append(f"""
  <g transform="translate({cx} {cy})">
    <defs>
      <linearGradient id="pelo{i}" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stop-color="{c1}"/>
        <stop offset="100%" stop-color="{c2}"/>
      </linearGradient>
    </defs>
    <rect width="300" height="240" rx="4" fill="#2b2b2b"/>
    <rect width="300" height="240" rx="4" fill="url(#pelo{i})" opacity="0.92"/>
    <!-- silueta simple de rostro -->
    <ellipse cx="150" cy="118" rx="58" ry="72" fill="#F0D9C7" opacity="0.95"/>
    <path d="M92 96 Q150 24 208 96 L208 240 L92 240 Z" fill="url(#pelo{i})" opacity="0.55"/>
    <path d="M92 92 Q150 20 208 92 Q186 74 150 70 Q114 74 92 92 Z" fill="{c2}"/>
    <ellipse cx="130" cy="118" rx="6" ry="4" fill="#4a3a30"/>
    <ellipse cx="170" cy="118" rx="6" ry="4" fill="#4a3a30"/>
    <path d="M138 152 Q150 160 162 152" fill="none" stroke="#C97E7E" stroke-width="3"
          stroke-linecap="round"/>
    <text x="150" y="272" font-family="Arial, sans-serif" font-size="19" font-weight="bold"
          fill="{NEGRO}" text-anchor="middle">{nombre}</text>
  </g>""")

    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img"
     aria-label="Cuatro estilos posibles: secado, rizos, alisado y volumen">
  <rect width="800" height="800" fill="#ffffff"/>
  <rect x="8" y="8" width="784" height="784" rx="8" fill="none" stroke="#e8e8e8" stroke-width="2"/>
  <text x="400" y="82" font-family="Arial, sans-serif" font-size="46" font-weight="bold"
        fill="{NEGRO}" text-anchor="middle">STYLING FLEXIBILITY</text>
{"".join(celdas)}
</svg>
"""


# ---------------------------------------------------------------------------
# 5. Especificaciones: 1000 W, cerámica, etc.
# ---------------------------------------------------------------------------
def producto_5():
    specs = [
        ("Salon Blowout", "in up to Half the Time", 0),
        ("1000W", "Potencia profesional", 1),
        ("Ceramic", "Technology", 2),
        ("Soft Curls", "and Volume", 3),
    ]
    piezas = []
    for nombre, sub, i in specs:
        cx = 170 + (i % 2) * 210
        cy = 300 + (i // 2) * 210
        piezas.append(f"""
  <g transform="translate({cx} {cy})">
    <circle cx="0" cy="0" r="66" fill="none" stroke="{NEGRO}" stroke-width="2"/>
    <text x="0" y="-6" font-family="Arial, sans-serif" font-size="15" font-weight="bold"
          fill="{NEGRO}" text-anchor="middle">{nombre}</text>
    <text x="0" y="16" font-family="Arial, sans-serif" font-size="9"
          fill="{GRIS}" text-anchor="middle">{sub}</text>
  </g>""")

    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img"
     aria-label="Especificaciones: 1000 vatios, tecnología cerámica y ondas suaves">
{DEFS}
  <rect width="800" height="800" fill="#ffffff"/>
  <text x="120" y="150" font-family="Arial, sans-serif" font-size="62" font-weight="bold"
        fill="{NEGRO}" letter-spacing="8">LISAPRO</text>
{"".join(piezas)}
  {cepillo(x=560, y=190, escala=1.02)}
</svg>
"""


# ---------------------------------------------------------------------------
# Sellos e insignias
# ---------------------------------------------------------------------------
def insignia_top():
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 150" role="img"
     aria-label="Cinco años entre los más vendidos">
  <g fill="{ROSA}">
    <path d="M22 58 L38 34 L54 52 L70 22 L86 52 L102 34 L118 58 Z"/>
    <circle cx="22" cy="54" r="7"/><circle cx="70" cy="18" r="7"/><circle cx="118" cy="54" r="7"/>
    <rect x="22" y="64" width="96" height="9" rx="4"/>
  </g>
  <text x="70" y="108" font-family="Arial, sans-serif" font-size="30" font-weight="bold"
        fill="{NEGRO}" text-anchor="middle">5 Years</text>
  <text x="70" y="134" font-family="Georgia, serif" font-size="20" font-style="italic"
        fill="{NEGRO}" text-anchor="middle">Top Selling</text>
</svg>
"""


def sello_garantia():
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img"
     aria-label="Sello de garantía de 30 días">
  <circle cx="60" cy="60" r="56" fill="{ROSA_FONDO}" stroke="{ROSA}" stroke-width="2"
          stroke-dasharray="5 4"/>
  <circle cx="60" cy="60" r="44" fill="none" stroke="{ROSA}" stroke-width="1.5"/>
  <text x="60" y="52" font-family="Arial, sans-serif" font-size="27" font-weight="bold"
        fill="{ROSA}" text-anchor="middle">30</text>
  <text x="60" y="70" font-family="Arial, sans-serif" font-size="13" font-weight="bold"
        fill="{NEGRO}" text-anchor="middle">DÍAS</text>
  <text x="60" y="87" font-family="Arial, sans-serif" font-size="9"
        fill="{GRIS}" text-anchor="middle">GARANTÍA</text>
</svg>
"""


def sello_marca():
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img"
     aria-label="Sello 100 días de garantía">
  <circle cx="50" cy="50" r="48" fill="#F3EDE4"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="{NEGRO}" stroke-width="1"/>
  <text x="50" y="38" font-family="Georgia, serif" font-size="9"
        fill="{NEGRO}" text-anchor="middle" letter-spacing="1">100 DÍAS</text>
  <path d="M32 46 h36" stroke="{NEGRO}" stroke-width="0.8"/>
  <text x="50" y="60" font-family="Georgia, serif" font-size="13" font-weight="bold"
        fill="{NEGRO}" text-anchor="middle">GARANTÍA</text>
  <text x="50" y="72" font-family="Georgia, serif" font-size="7"
        fill="{GRIS}" text-anchor="middle">SATISFACCIÓN</text>
</svg>
"""


def favicon():
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="{NEGRO}"/>
  <rect x="24" y="10" width="16" height="30" rx="8" fill="{ROSA}"/>
  <rect x="27" y="38" width="10" height="17" rx="3" fill="#ffffff"/>
  <g stroke="{ROSA_CLARO}" stroke-width="2.4" stroke-linecap="round">
    <line x1="24" y1="16" x2="16" y2="15"/><line x1="24" y1="24" x2="16" y2="23"/>
    <line x1="24" y1="32" x2="16" y2="31"/>
    <line x1="40" y1="16" x2="48" y2="15"/><line x1="40" y1="24" x2="48" y2="23"/>
    <line x1="40" y1="32" x2="48" y2="31"/>
  </g>
</svg>
"""


# ---------------------------------------------------------------------------
# Fotos de reseñas y clientas: retratos ilustrados con variedad
# ---------------------------------------------------------------------------
PALETAS = [
    ("#F2D9C4", "#5A3A24", "#E8E2DC"),  # piel clara, pelo castaño oscuro
    ("#C9885E", "#241612", "#DCE6E4"),  # piel morena, pelo negro
    ("#F5E0CD", "#B98A4E", "#EFE7DA"),  # piel clara, pelo rubio
    ("#E8C29A", "#8C5A34", "#E4E9F0"),  # piel media, castaño claro
    ("#A96C43", "#1C1210", "#EDE4E8"),  # piel oscura, pelo negro
    ("#FAE3D2", "#D9A85F", "#E9EEE6"),  # piel muy clara, rubio dorado
    ("#D79A6E", "#3B2418", "#F0E6E9"),  # piel media-oscura
]

PEINADOS = ["liso", "ondas", "rizos", "volumen"]


BLUSAS = ["#E7E4EF", "#DCE6E9", "#EFE3E3", "#E3E9DF", "#E9E4DC", "#DFE2EC", "#EDE6E9"]


def retrato(indice, ancho=480, alto=600, con_producto=False):
    """Ilustración plana de una clienta luciendo su peinado.

    El orden de dibujo importa: pelo de fondo, cabeza, blusa y por último
    los mechones delanteros, para que el cabello caiga sobre los hombros
    como en una foto real.
    """
    piel, pelo, fondo = PALETAS[indice % len(PALETAS)]
    blusa = BLUSAS[indice % len(BLUSAS)]
    peinado = PEINADOS[indice % len(PEINADOS)]

    cx = ancho / 2
    cy = alto * 0.34          # centro del rostro
    rx = ancho * 0.155        # medio ancho del rostro
    ry = rx * 1.28            # medio alto del rostro
    hombros_y = alto * 0.645
    pelo_claro = aclarar(pelo, 0.22)

    # ---------------------------------------------------------------- pelo ---
    if peinado == "liso":
        largo = alto * 0.78
        pelo_fondo = (
            f'<path d="M{cx - rx * 1.30} {cy - ry * 0.10} '
            f'Q{cx - rx * 1.20} {cy - ry * 1.60} {cx} {cy - ry * 1.62} '
            f'Q{cx + rx * 1.20} {cy - ry * 1.60} {cx + rx * 1.30} {cy - ry * 0.10} '
            f'L{cx + rx * 1.16} {largo} L{cx - rx * 1.16} {largo} Z" fill="{pelo}"/>'
        )
        mechon_izq = (
            f'<path d="M{cx - rx * 1.24} {cy - ry * 0.1} L{cx - rx * 1.10} {largo} '
            f'L{cx - rx * 0.72} {largo} L{cx - rx * 0.86} {cy + ry * 0.2} Z" fill="{pelo}"/>'
        )
        mechon_der = (
            f'<path d="M{cx + rx * 1.24} {cy - ry * 0.1} L{cx + rx * 1.10} {largo} '
            f'L{cx + rx * 0.72} {largo} L{cx + rx * 0.86} {cy + ry * 0.2} Z" fill="{pelo}"/>'
        )
    elif peinado == "ondas":
        largo = alto * 0.80
        pelo_fondo = (
            f'<path d="M{cx - rx * 1.34} {cy} '
            f'Q{cx - rx * 1.24} {cy - ry * 1.62} {cx} {cy - ry * 1.64} '
            f'Q{cx + rx * 1.24} {cy - ry * 1.62} {cx + rx * 1.34} {cy} '
            f'Q{cx + rx * 1.58} {cy + ry * 1.5} {cx + rx * 1.18} {largo} '
            f'L{cx - rx * 1.18} {largo} '
            f'Q{cx - rx * 1.58} {cy + ry * 1.5} {cx - rx * 1.34} {cy} Z" fill="{pelo}"/>'
        )
        mechon_izq = (
            f'<path d="M{cx - rx * 1.30} {cy + ry * 0.1} '
            f'Q{cx - rx * 1.50} {cy + ry * 1.7} {cx - rx * 1.02} {largo} '
            f'L{cx - rx * 0.70} {largo} '
            f'Q{cx - rx * 1.02} {cy + ry * 1.5} {cx - rx * 0.90} {cy + ry * 0.3} Z" fill="{pelo}"/>'
        )
        mechon_der = (
            f'<path d="M{cx + rx * 1.30} {cy + ry * 0.1} '
            f'Q{cx + rx * 1.50} {cy + ry * 1.7} {cx + rx * 1.02} {largo} '
            f'L{cx + rx * 0.70} {largo} '
            f'Q{cx + rx * 1.02} {cy + ry * 1.5} {cx + rx * 0.90} {cy + ry * 0.3} Z" fill="{pelo}"/>'
        )
    elif peinado == "rizos":
        largo = alto * 0.72
        rizos = "".join(
            f'<circle cx="{cx + rx * 1.42 * math.cos(math.radians(a))}" '
            f'cy="{cy - ry * 0.30 + ry * 1.22 * math.sin(math.radians(a))}" '
            f'r="{rx * 0.30}" fill="{pelo}"/>'
            for a in range(155, 386, 21)
        )
        rizos += "".join(
            f'<circle cx="{cx + rx * 1.05 * math.cos(math.radians(a))}" '
            f'cy="{cy - ry * 0.55 + ry * 0.95 * math.sin(math.radians(a))}" '
            f'r="{rx * 0.24}" fill="{pelo_claro}"/>'
            for a in range(185, 361, 30)
        )
        pelo_fondo = (
            f'<ellipse cx="{cx}" cy="{cy - ry * 0.16}" rx="{rx * 1.42}" '
            f'ry="{ry * 1.24}" fill="{pelo}"/>{rizos}'
        )
        mechon_izq = mechon_der = ""
    else:  # volumen
        largo = alto * 0.76
        pelo_fondo = (
            f'<path d="M{cx - rx * 1.44} {cy + ry * 0.35} '
            f'Q{cx - rx * 1.36} {cy - ry * 1.85} {cx} {cy - ry * 1.80} '
            f'Q{cx + rx * 1.36} {cy - ry * 1.85} {cx + rx * 1.44} {cy + ry * 0.35} '
            f'L{cx + rx * 1.14} {largo} L{cx - rx * 1.14} {largo} Z" fill="{pelo}"/>'
        )
        mechon_izq = (
            f'<path d="M{cx - rx * 1.36} {cy + ry * 0.2} L{cx - rx * 1.06} {largo} '
            f'L{cx - rx * 0.74} {largo} L{cx - rx * 0.92} {cy + ry * 0.35} Z" fill="{pelo}"/>'
        )
        mechon_der = (
            f'<path d="M{cx + rx * 1.36} {cy + ry * 0.2} L{cx + rx * 1.06} {largo} '
            f'L{cx + rx * 0.74} {largo} L{cx + rx * 0.92} {cy + ry * 0.35} Z" fill="{pelo}"/>'
        )

    # ------------------------------------------------------------ producto ---
    producto = ""
    if con_producto:
        esc_p = ancho / 700
        producto = f"""
  <g transform="translate({ancho * 0.70} {alto * 0.46}) scale({esc_p}) rotate(20)">
    <rect x="0" y="0" width="66" height="160" rx="33" fill="#151515"/>
    <g fill="{ROSA}" opacity="0.9">
      {"".join(f'<circle cx="{14 + (k % 3) * 19}" cy="{20 + k // 3 * 24}" r="4"/>' for k in range(18))}
    </g>
    <rect x="15" y="158" width="36" height="120" rx="14" fill="#111111"/>
    <rect x="17" y="158" width="32" height="30" rx="10" fill="{ROSA}"/>
    <g stroke="{ROSA}" stroke-width="4.5" stroke-linecap="round">
      {"".join(f'<line x1="2" y1="{18 + i * 26}" x2="-16" y2="{15 + i * 26}"/>' for i in range(6))}
      {"".join(f'<line x1="64" y1="{18 + i * 26}" x2="82" y2="{15 + i * 26}"/>' for i in range(6))}
    </g>
  </g>"""

    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho} {alto}" role="img"
     aria-label="Clienta mostrando el resultado de su peinado">
  <defs>
    <linearGradient id="f{indice}" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="{fondo}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>

  <rect width="{ancho}" height="{alto}" fill="url(#f{indice})"/>
  <circle cx="{cx}" cy="{cy - ry * 0.1}" r="{rx * 2.05}" fill="#ffffff" opacity="0.45"/>

  <!-- cabello por detrás -->
  {pelo_fondo}

  <!-- cuello -->
  <path d="M{cx - rx * 0.26} {cy + ry * 0.62} L{cx - rx * 0.30} {hombros_y}
           L{cx + rx * 0.30} {hombros_y} L{cx + rx * 0.26} {cy + ry * 0.62} Z"
        fill="{oscurecer(piel, 0.10)}"/>

  <!-- rostro -->
  <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{piel}"/>
  <!-- orejas -->
  <ellipse cx="{cx - rx}" cy="{cy + ry * 0.06}" rx="{rx * 0.13}" ry="{rx * 0.2}" fill="{piel}"/>
  <ellipse cx="{cx + rx}" cy="{cy + ry * 0.06}" rx="{rx * 0.13}" ry="{rx * 0.2}" fill="{piel}"/>

  <!-- nacimiento del pelo -->
  <path d="M{cx - rx * 1.02} {cy - ry * 0.30} Q{cx - rx * 0.95} {cy - ry * 1.12}
           {cx} {cy - ry * 1.08} Q{cx + rx * 0.95} {cy - ry * 1.12}
           {cx + rx * 1.02} {cy - ry * 0.30}
           Q{cx + rx * 0.55} {cy - ry * 0.64} {cx} {cy - ry * 0.60}
           Q{cx - rx * 0.55} {cy - ry * 0.64} {cx - rx * 1.02} {cy - ry * 0.30} Z"
        fill="{pelo}"/>

  <!-- cejas -->
  <path d="M{cx - rx * 0.58} {cy - ry * 0.20} Q{cx - rx * 0.40} {cy - ry * 0.29}
           {cx - rx * 0.20} {cy - ry * 0.19}" fill="none" stroke="{pelo}"
        stroke-width="{rx * 0.06}" stroke-linecap="round"/>
  <path d="M{cx + rx * 0.20} {cy - ry * 0.19} Q{cx + rx * 0.40} {cy - ry * 0.29}
           {cx + rx * 0.58} {cy - ry * 0.20}" fill="none" stroke="{pelo}"
        stroke-width="{rx * 0.06}" stroke-linecap="round"/>

  <!-- ojos -->
  <ellipse cx="{cx - rx * 0.39}" cy="{cy + ry * 0.02}" rx="{rx * 0.115}"
           ry="{rx * 0.085}" fill="#3B2A22"/>
  <ellipse cx="{cx + rx * 0.39}" cy="{cy + ry * 0.02}" rx="{rx * 0.115}"
           ry="{rx * 0.085}" fill="#3B2A22"/>

  <!-- nariz y boca -->
  <path d="M{cx} {cy + ry * 0.20} L{cx + rx * 0.09} {cy + ry * 0.31}
           L{cx - rx * 0.02} {cy + ry * 0.32}" fill="none"
        stroke="{oscurecer(piel, 0.22)}" stroke-width="{rx * 0.045}"
        stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M{cx - rx * 0.19} {cy + ry * 0.50} Q{cx} {cy + ry * 0.62}
           {cx + rx * 0.19} {cy + ry * 0.50}" fill="none" stroke="#C4756F"
        stroke-width="{rx * 0.10}" stroke-linecap="round"/>
  <!-- rubor -->
  <ellipse cx="{cx - rx * 0.62}" cy="{cy + ry * 0.30}" rx="{rx * 0.19}"
           ry="{rx * 0.11}" fill="#E3928C" opacity="0.28"/>
  <ellipse cx="{cx + rx * 0.62}" cy="{cy + ry * 0.30}" rx="{rx * 0.19}"
           ry="{rx * 0.11}" fill="#E3928C" opacity="0.28"/>

  <!-- blusa: se dibuja sobre el pelo de fondo -->
  <path d="M{cx - ancho * 0.34} {alto} Q{cx - ancho * 0.30} {hombros_y - alto * 0.02}
           {cx - rx * 0.55} {hombros_y - alto * 0.03}
           Q{cx} {hombros_y + alto * 0.045} {cx + rx * 0.55} {hombros_y - alto * 0.03}
           Q{cx + ancho * 0.30} {hombros_y - alto * 0.02} {cx + ancho * 0.34} {alto} Z"
        fill="{blusa}"/>

  <!-- mechones delanteros, caen sobre los hombros -->
  {mechon_izq}
  {mechon_der}
{producto}
</svg>
"""


def caja_resena(indice):
    """Foto tipo 'unboxing': la caja del producto sobre una superficie."""
    fondos = ["#EDE7E1", "#E6EAF0", "#F0E6EA", "#E8EEE7"]
    fondo = fondos[indice % len(fondos)]
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 600" role="img"
     aria-label="Caja del cepillo LISAPRO recién recibida">
  <rect width="480" height="600" fill="{fondo}"/>
  <ellipse cx="240" cy="520" rx="180" ry="34" fill="#000" opacity="0.08"/>
  <g transform="translate(150 130)">
    <rect x="0" y="0" width="180" height="390" rx="5" fill="#141414"/>
    <rect x="180" y="8" width="26" height="382" rx="4" fill="#000" opacity="0.7"/>
    <text x="90" y="46" font-family="Arial, sans-serif" font-size="23" font-weight="bold"
          fill="#fff" text-anchor="middle" letter-spacing="2.5">LISAPRO</text>
    <line x1="30" y1="60" x2="150" y2="60" stroke="{ROSA}" stroke-width="1.6"/>
    <rect x="34" y="140" width="112" height="70" rx="4" fill="#242424"/>
    <circle cx="62" cy="175" r="17" fill="none" stroke="#fff" stroke-width="1.4"/>
    <circle cx="118" cy="175" r="17" fill="none" stroke="{ROSA}" stroke-width="1.4"/>
    <text x="90" y="320" font-family="Arial, sans-serif" font-size="13" font-weight="bold"
          fill="{ROSA}" text-anchor="middle" letter-spacing="1.6">HOT AIR BRUSH</text>
    <text x="90" y="344" font-family="Arial, sans-serif" font-size="8"
          fill="#999" text-anchor="middle">ONE STEP HAIR DRYER &amp; VOLUMIZER</text>
  </g>
</svg>
"""


def og_imagen():
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img"
     aria-label="Cepillo Secador Voluminizador Tres En Uno de LISAPRO">
{DEFS}
  <rect width="1200" height="630" fill="{ROSA_FONDO}"/>
  <circle cx="1010" cy="320" r="270" fill="{ROSA_PASTEL}"/>
  <text x="80" y="150" font-family="Arial, sans-serif" font-size="34" font-weight="bold"
        fill="{ROSA}" letter-spacing="7">BUTTERFLY</text>
  <text x="80" y="248" font-family="Arial, sans-serif" font-size="60" font-weight="bold"
        fill="{NEGRO}">Cepillo Secador</text>
  <text x="80" y="320" font-family="Arial, sans-serif" font-size="60" font-weight="bold"
        fill="{NEGRO}">Voluminizador 3 en 1</text>
  <text x="80" y="386" font-family="Arial, sans-serif" font-size="27"
        fill="{GRIS}">Seca, alisa y da volumen en un solo paso.</text>
  <rect x="80" y="430" width="300" height="66" rx="33" fill="{ROSA}" stroke="{NEGRO}" stroke-width="3"/>
  <text x="230" y="472" font-family="Arial, sans-serif" font-size="24" font-weight="bold"
        fill="#ffffff" text-anchor="middle">$29.99 USD</text>
  <text x="416" y="472" font-family="Arial, sans-serif" font-size="22"
        fill="{GRIS}" text-decoration="line-through">$50.00</text>
  <text x="80" y="558" font-family="Arial, sans-serif" font-size="21" font-weight="bold"
        fill="{NEGRO}">Envío GRATIS · Pago contra entrega · Garantía 30 días</text>
  {cepillo(x=930, y=60, escala=0.92)}
</svg>
"""


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    os.makedirs(IMG, exist_ok=True)
    print("Generando imágenes en assets/img/ ...")

    escribir("producto-1.svg", producto_1())
    # La ranura 2 ya tiene foto real (infografía de temperatura), así que su
    # ilustración de respaldo lleva ese mismo tema, y la de medidas pasa a la 3
    escribir("producto-2.svg", producto_3())
    escribir("producto-3.svg", producto_2())
    escribir("producto-4.svg", producto_4())
    escribir("producto-5.svg", producto_5())

    escribir("insignia-top.svg", insignia_top())
    escribir("sello-garantia.svg", sello_garantia())
    escribir("sello-marca.svg", sello_marca())
    escribir("favicon.svg", favicon())
    escribir("og-imagen.svg", og_imagen())

    # 12 fotos de reseñas: alternamos retratos y cajas
    for i in range(1, 13):
        if i % 4 == 0:
            escribir(f"resena-{i}.svg", caja_resena(i))
        else:
            escribir(f"resena-{i}.svg", retrato(i, 480, 600, con_producto=(i % 3 == 0)))

    # 7 clientas felices para el carrusel
    for i in range(1, 8):
        escribir(f"clienta-{i}.svg", retrato(i + 2, 360, 480, con_producto=(i % 4 == 0)))

    print("\n¡Listo! Reemplaza estos archivos por tus fotos reales cuando quieras.")


if __name__ == "__main__":
    main()
