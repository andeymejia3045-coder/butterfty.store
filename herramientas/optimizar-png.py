#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Optimizador de PNG en Python puro, sin instalar nada.

¿Para qué sirve?
----------------
Las fotos que salen del celular o que descargas de un proveedor suelen pesar
más de un mega. En Ecuador buena parte de las clientas entran con datos
móviles, y cada mega de más son segundos de espera y ventas perdidas.

Este script hace dos cosas sin perder calidad visual:

  1. Si la imagen usa 256 colores o menos (típico de infografías y logos),
     la convierte a paleta indexada. Eso suele bajar el peso entre 60 y 80 %.
  2. Reduce el tamaño en píxeles si la imagen es más grande de lo necesario,
     promediando bloques de píxeles (no se ve pixelada).

Uso:
    python3 herramientas/optimizar-png.py archivo.png
    python3 herramientas/optimizar-png.py archivo.png --ancho 1000
    python3 herramientas/optimizar-png.py archivo.png --salida nueva.png
"""

import argparse
import os
import struct
import sys
import zlib


# ---------------------------------------------------------------------------
# LECTURA DE PNG
# ---------------------------------------------------------------------------
FIRMA = b"\x89PNG\r\n\x1a\n"

CANALES = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}


def leer_trozos(datos):
    """Recorre los bloques (chunks) del PNG y los devuelve en orden."""
    if datos[:8] != FIRMA:
        raise ValueError("El archivo no es un PNG válido")
    pos = 8
    trozos = []
    while pos < len(datos):
        (largo,) = struct.unpack(">I", datos[pos:pos + 4])
        tipo = datos[pos + 4:pos + 8]
        contenido = datos[pos + 8:pos + 8 + largo]
        trozos.append((tipo, contenido))
        pos += 12 + largo
        if tipo == b"IEND":
            break
    return trozos


def deshacer_filtros(cruda, ancho, alto, bytes_por_pixel):
    """
    Quita el filtro que PNG aplica a cada línea.
    Cada scanline empieza con un byte que dice qué filtro se usó (0 a 4).
    """
    ancho_linea = ancho * bytes_por_pixel
    salida = bytearray(ancho_linea * alto)
    previa = bytearray(ancho_linea)
    pos = 0

    for fila in range(alto):
        filtro = cruda[pos]
        pos += 1
        linea = bytearray(cruda[pos:pos + ancho_linea])
        pos += ancho_linea

        if filtro == 0:
            pass
        elif filtro == 1:  # Sub
            for i in range(bytes_por_pixel, ancho_linea):
                linea[i] = (linea[i] + linea[i - bytes_por_pixel]) & 0xFF
        elif filtro == 2:  # Up
            for i in range(ancho_linea):
                linea[i] = (linea[i] + previa[i]) & 0xFF
        elif filtro == 3:  # Average
            for i in range(ancho_linea):
                izq = linea[i - bytes_por_pixel] if i >= bytes_por_pixel else 0
                linea[i] = (linea[i] + ((izq + previa[i]) >> 1)) & 0xFF
        elif filtro == 4:  # Paeth
            for i in range(ancho_linea):
                a = linea[i - bytes_por_pixel] if i >= bytes_por_pixel else 0
                b = previa[i]
                c = previa[i - bytes_por_pixel] if i >= bytes_por_pixel else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                linea[i] = (linea[i] + pred) & 0xFF
        else:
            raise ValueError(f"Filtro PNG desconocido: {filtro}")

        salida[fila * ancho_linea:(fila + 1) * ancho_linea] = linea
        previa = linea

    return salida


def cargar(ruta):
    """Devuelve (ancho, alto, pixeles RGB) de un PNG."""
    datos = open(ruta, "rb").read()
    trozos = leer_trozos(datos)

    cabecera = dict(trozos).get(b"IHDR")
    if cabecera is None:
        raise ValueError("PNG sin cabecera IHDR")
    ancho, alto, profundidad, tipo_color, _, _, entrelazado = struct.unpack(
        ">IIBBBBB", cabecera
    )

    if profundidad != 8:
        raise ValueError(f"Solo se admiten 8 bits por canal (este tiene {profundidad})")
    if entrelazado:
        raise ValueError("No se admiten PNG entrelazados")
    if tipo_color not in CANALES:
        raise ValueError(f"Tipo de color no admitido: {tipo_color}")

    comprimido = b"".join(c for t, c in trozos if t == b"IDAT")
    cruda = zlib.decompress(comprimido)
    canales = CANALES[tipo_color]
    plano = deshacer_filtros(cruda, ancho, alto, canales)

    # Paleta, si la imagen es indexada
    paleta = dict(trozos).get(b"PLTE")

    # Normalizamos todo a RGB
    rgb = bytearray(ancho * alto * 3)
    if tipo_color == 2:  # RGB
        rgb[:] = plano
    elif tipo_color == 6:  # RGBA: aplanamos sobre blanco
        for i in range(ancho * alto):
            r, g, b, a = plano[i * 4:i * 4 + 4]
            if a == 255:
                rgb[i * 3:i * 3 + 3] = bytes((r, g, b))
            else:
                f = a / 255.0
                rgb[i * 3:i * 3 + 3] = bytes((
                    int(r * f + 255 * (1 - f)),
                    int(g * f + 255 * (1 - f)),
                    int(b * f + 255 * (1 - f)),
                ))
    elif tipo_color == 0:  # gris
        for i in range(ancho * alto):
            v = plano[i]
            rgb[i * 3:i * 3 + 3] = bytes((v, v, v))
    elif tipo_color == 4:  # gris + alfa
        for i in range(ancho * alto):
            v, a = plano[i * 2], plano[i * 2 + 1]
            f = a / 255.0
            c = int(v * f + 255 * (1 - f))
            rgb[i * 3:i * 3 + 3] = bytes((c, c, c))
    elif tipo_color == 3:  # indexada
        if paleta is None:
            raise ValueError("PNG indexado sin paleta")
        for i in range(ancho * alto):
            idx = plano[i] * 3
            rgb[i * 3:i * 3 + 3] = paleta[idx:idx + 3]

    return ancho, alto, rgb


# ---------------------------------------------------------------------------
# REDIMENSIONADO (promedio de bloques, sin pixelar)
# ---------------------------------------------------------------------------
def redimensionar(ancho, alto, rgb, ancho_nuevo):
    if ancho_nuevo >= ancho:
        return ancho, alto, rgb

    alto_nuevo = max(1, round(alto * ancho_nuevo / ancho))
    salida = bytearray(ancho_nuevo * alto_nuevo * 3)
    escala_x = ancho / ancho_nuevo
    escala_y = alto / alto_nuevo

    for y in range(alto_nuevo):
        y0, y1 = int(y * escala_y), max(int(y * escala_y) + 1, int((y + 1) * escala_y))
        y1 = min(y1, alto)
        for x in range(ancho_nuevo):
            x0, x1 = int(x * escala_x), max(int(x * escala_x) + 1, int((x + 1) * escala_x))
            x1 = min(x1, ancho)
            sr = sg = sb = n = 0
            for yy in range(y0, y1):
                base = (yy * ancho + x0) * 3
                for _ in range(x1 - x0):
                    sr += rgb[base]
                    sg += rgb[base + 1]
                    sb += rgb[base + 2]
                    base += 3
                    n += 1
            d = (y * ancho_nuevo + x) * 3
            salida[d] = sr // n
            salida[d + 1] = sg // n
            salida[d + 2] = sb // n

    return ancho_nuevo, alto_nuevo, salida


# ---------------------------------------------------------------------------
# ESCRITURA DE PNG
# ---------------------------------------------------------------------------
def trozo(tipo, contenido):
    cuerpo = tipo + contenido
    return (
        struct.pack(">I", len(contenido))
        + cuerpo
        + struct.pack(">I", zlib.crc32(cuerpo) & 0xFFFFFFFF)
    )


def filtrar_y_comprimir(lineas, bytes_por_pixel, ancho_linea):
    """
    Prueba los filtros Ninguno, Sub, Up y Paeth en cada línea y se queda con
    el que deja los bytes más parecidos entre sí, que es el que mejor comprime.
    """
    resultado = bytearray()
    previa = bytearray(ancho_linea)

    for linea in lineas:
        candidatos = []

        # 0: sin filtro
        candidatos.append((0, bytes(linea)))

        # 1: Sub
        sub = bytearray(ancho_linea)
        for i in range(ancho_linea):
            izq = linea[i - bytes_por_pixel] if i >= bytes_por_pixel else 0
            sub[i] = (linea[i] - izq) & 0xFF
        candidatos.append((1, bytes(sub)))

        # 2: Up
        up = bytearray(ancho_linea)
        for i in range(ancho_linea):
            up[i] = (linea[i] - previa[i]) & 0xFF
        candidatos.append((2, bytes(up)))

        # 4: Paeth
        paeth = bytearray(ancho_linea)
        for i in range(ancho_linea):
            a = linea[i - bytes_por_pixel] if i >= bytes_por_pixel else 0
            b = previa[i]
            c = previa[i - bytes_por_pixel] if i >= bytes_por_pixel else 0
            p = a + b - c
            pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
            pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
            paeth[i] = (linea[i] - pred) & 0xFF
        candidatos.append((4, bytes(paeth)))

        # Elegimos por menor suma de distancias al cero (heurística estándar)
        def coste(par):
            return sum(v if v < 128 else 256 - v for v in par[1])

        mejor = min(candidatos, key=coste)
        resultado.append(mejor[0])
        resultado.extend(mejor[1])
        previa = linea

    return zlib.compress(bytes(resultado), 9)


def guardar_rgb(ruta, ancho, alto, rgb):
    lineas = [rgb[y * ancho * 3:(y + 1) * ancho * 3] for y in range(alto)]
    idat = filtrar_y_comprimir(lineas, 3, ancho * 3)
    ihdr = struct.pack(">IIBBBBB", ancho, alto, 8, 2, 0, 0, 0)
    with open(ruta, "wb") as f:
        f.write(FIRMA + trozo(b"IHDR", ihdr) + trozo(b"IDAT", idat) + trozo(b"IEND", b""))


def guardar_paleta(ruta, ancho, alto, rgb, colores):
    indice = {c: i for i, c in enumerate(colores)}
    lineas = []
    for y in range(alto):
        linea = bytearray(ancho)
        base = y * ancho * 3
        for x in range(ancho):
            p = base + x * 3
            linea[x] = indice[(rgb[p], rgb[p + 1], rgb[p + 2])]
        lineas.append(linea)

    idat = filtrar_y_comprimir(lineas, 1, ancho)
    ihdr = struct.pack(">IIBBBBB", ancho, alto, 8, 3, 0, 0, 0)
    plte = b"".join(bytes(c) for c in colores)
    with open(ruta, "wb") as f:
        f.write(
            FIRMA
            + trozo(b"IHDR", ihdr)
            + trozo(b"PLTE", plte)
            + trozo(b"IDAT", idat)
            + trozo(b"IEND", b"")
        )


# ---------------------------------------------------------------------------
# PRINCIPAL
# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Optimiza un PNG sin perder calidad")
    ap.add_argument("archivo")
    ap.add_argument("--ancho", type=int, default=0,
                    help="Ancho máximo en píxeles (0 = no redimensionar)")
    ap.add_argument("--salida", default="", help="Ruta de salida (por defecto, sobrescribe)")
    args = ap.parse_args()

    origen = args.archivo
    destino = args.salida or origen
    peso_antes = os.path.getsize(origen)

    print(f"Optimizando {origen} ({peso_antes / 1024:.0f} KB)")

    ancho, alto, rgb = cargar(origen)
    print(f"  tamaño original: {ancho} x {alto} px")

    if args.ancho and args.ancho < ancho:
        ancho, alto, rgb = redimensionar(ancho, alto, rgb, args.ancho)
        print(f"  redimensionado a: {ancho} x {alto} px")

    # ¿Cabe en una paleta de 256 colores?
    colores = []
    vistos = set()
    demasiados = False
    for i in range(0, len(rgb), 3):
        c = (rgb[i], rgb[i + 1], rgb[i + 2])
        if c not in vistos:
            vistos.add(c)
            colores.append(c)
            if len(colores) > 256:
                demasiados = True
                break

    if demasiados:
        print(f"  colores: más de 256, se guarda como color verdadero")
        guardar_rgb(destino, ancho, alto, rgb)
    else:
        print(f"  colores: {len(colores)}, se guarda con paleta indexada")
        guardar_paleta(destino, ancho, alto, rgb, colores)

    peso_despues = os.path.getsize(destino)
    ahorro = 100 * (1 - peso_despues / peso_antes)
    print(f"  resultado: {peso_despues / 1024:.0f} KB  ({ahorro:+.0f} %)")

    if peso_despues >= peso_antes and not args.salida:
        print("  ⚠ no se logró reducir; conviene dejar el archivo original")


if __name__ == "__main__":
    sys.exit(main())
