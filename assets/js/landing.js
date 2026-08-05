/* =========================================================================
   LANDING.JS — Todo lo que da vida a la página de inicio
   ========================================================================= */

(function () {
  'use strict';

  const { ICO, dinero, esc, $, $$, enlaceWa, aviso, Carrito } = window.Tienda;
  const P = CONFIG.producto;

  /* =======================================================================
     1. ICONOS Y ENLACES BÁSICOS
     ======================================================================= */
  function pintarIconos() {
    $$('[data-icono-carrito]').forEach((el) => (el.innerHTML = ICO.carrito));
    $$('[data-icono-carrito-btn]').forEach((el) => (el.innerHTML = ICO.carritoRelleno));
    $$('[data-icono-carrito-sticky]').forEach((el) => (el.innerHTML = ICO.carritoRelleno));

    const wa = enlaceWa();
    ['waCabecera', 'waFlotante'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.href = wa;
        el.innerHTML = ICO.whatsapp;
      }
    });

    const waPie = document.getElementById('waPie');
    if (waPie) {
      waPie.href = wa;
      waPie.innerHTML =
        '<span class="ico" aria-hidden="true">' + ICO.telefono + '</span> WhatsApp ' +
        esc(CONFIG.whatsapp.numeroBonito);
    }

    const mailPie = document.getElementById('mailPie');
    if (mailPie) {
      mailPie.href = 'mailto:' + CONFIG.tienda.email;
      mailPie.innerHTML =
        '<span class="ico" aria-hidden="true">' + ICO.sobre + '</span> ' + esc(CONFIG.tienda.email);
    }

    const ciudadPie = document.getElementById('ciudadPie');
    if (ciudadPie) {
      ciudadPie.innerHTML =
        '<span class="ico" aria-hidden="true">' + ICO.pin + '</span> ' + esc(CONFIG.tienda.ciudad);
    }

    const anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();

    // Iconos de la sección de beneficios
    $$('[data-icono]').forEach((el) => {
      const nombre = el.getAttribute('data-icono');
      if (ICO[nombre]) el.innerHTML = ICO[nombre];
    });
  }

  /* =======================================================================
     2. ESTRELLAS
     ======================================================================= */
  function estrellasHTML(nota) {
    let html = '';
    const llenas = Math.round(nota);
    for (let i = 1; i <= 5; i++) {
      html += '<span' + (i > llenas ? ' class="estrella-vacia"' : '') + '>' + ICO.estrella + '</span>';
    }
    return html;
  }

  /* =======================================================================
     3. GALERÍA
     ======================================================================= */
  let indiceActual = 0;

  function construirGaleria() {
    const pista = document.getElementById('galeriaPista');
    const puntos = document.getElementById('galeriaPuntos');
    const minis = document.getElementById('galeriaMinis');
    if (!pista) return;

    pista.innerHTML = P.galeria
      .map(
        (img, i) =>
          '<div class="galeria__slide"><img src="' +
          esc(img.src) +
          '" alt="' +
          esc(img.alt) +
          '" width="800" height="800"' +
          (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') +
          '></div>'
      )
      .join('');

    puntos.innerHTML = P.galeria
      .map(
        (img, i) =>
          '<button class="galeria__punto' +
          (i === 0 ? ' activo' : '') +
          '" role="tab" data-ir="' +
          i +
          '" aria-label="Ver imagen ' +
          (i + 1) +
          ' de ' +
          P.galeria.length +
          '" aria-selected="' +
          (i === 0) +
          '"></button>'
      )
      .join('');

    minis.innerHTML = P.galeria
      .map(
        (img, i) =>
          '<button class="galeria__mini' +
          (i === 0 ? ' activo' : '') +
          '" data-ir="' +
          i +
          '" aria-label="Ver imagen ' +
          (i + 1) +
          '"><img src="' +
          esc(img.src) +
          '" alt="" width="68" height="68" loading="lazy"></button>'
      )
      .join('');

    const prev = document.getElementById('galeriaPrev');
    const next = document.getElementById('galeriaNext');
    prev.innerHTML = ICO.izq;
    next.innerHTML = ICO.der;

    function irA(i) {
      const total = P.galeria.length;
      indiceActual = ((i % total) + total) % total;
      const slide = pista.children[indiceActual];
      if (slide) {
        pista.scrollTo({ left: slide.offsetLeft - pista.offsetLeft, behavior: 'smooth' });
      }
      marcarActivo();
    }

    function marcarActivo() {
      $$('.galeria__punto', puntos).forEach((b, i) => {
        b.classList.toggle('activo', i === indiceActual);
        b.setAttribute('aria-selected', String(i === indiceActual));
      });
      $$('.galeria__mini', minis).forEach((b, i) => b.classList.toggle('activo', i === indiceActual));
    }

    prev.addEventListener('click', () => irA(indiceActual - 1));
    next.addEventListener('click', () => irA(indiceActual + 1));

    [puntos, minis].forEach((cont) =>
      cont.addEventListener('click', (e) => {
        const b = e.target.closest('[data-ir]');
        if (b) irA(parseInt(b.getAttribute('data-ir'), 10));
      })
    );

    // Navegación con teclado
    pista.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        irA(indiceActual - 1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        irA(indiceActual + 1);
      }
    });

    // Sincroniza los puntos cuando el usuario desliza con el dedo
    let temporizador;
    pista.addEventListener(
      'scroll',
      () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => {
          const ancho = pista.clientWidth || 1;
          const nuevo = Math.round(pista.scrollLeft / ancho);
          if (nuevo !== indiceActual && nuevo >= 0 && nuevo < P.galeria.length) {
            indiceActual = nuevo;
            marcarActivo();
          }
        }, 90);
      },
      { passive: true }
    );
  }

  /* =======================================================================
     4. INFORMACIÓN DEL PRODUCTO
     ======================================================================= */
  function pintarProducto() {
    const set = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    set('tituloProducto', esc(P.nombre));
    set('estrellasProducto', estrellasHTML(P.rating));
    set(
      'textoValoracion',
      'Calificado con <strong>' +
        P.rating.toFixed(1) +
        '/5</strong> por ' +
        P.numResenas.toLocaleString('es-EC') +
        ' personas'
    );
    set('resumenProducto', P.subtitulo);
    set('precioAntes', dinero(P.precioAntes) + ' USD');
    set('precioAhora', dinero(P.precio) + ' USD');

    const pct = Math.round((1 - P.precio / P.precioAntes) * 100);
    set('insigniaAhorro', 'AHORRA UN ' + pct + '%');

    set(
      'bulletsProducto',
      P.bullets
        .map(
          (b) =>
            '<li><span class="ico" aria-hidden="true">' +
            (ICO[b.icono] || '') +
            '</span><span>' +
            b.texto +
            '</span></li>'
        )
        .join('')
    );

    set('textoEscasez', 'Solo quedan ' + P.stock + ' en stock...');
    set('garantiaTitulo', esc(CONFIG.garantia.titulo));
    set('garantiaTexto', esc(CONFIG.garantia.texto));

    // Barra fija de abajo: usamos el nombre corto para que no se corte
    set('stickyNombre', esc(P.nombreCorto || P.nombre));
    set('stickyPrecio', dinero(P.precio) + ' · Envío gratis');

    // Nota de estadísticas
    set(
      'notaStats',
      '*Basado en resultados reportados por ' +
        CONFIG.estadisticas.baseClientes +
        ' clientes que usaron ' +
        esc(P.nombre) +
        ' consistentemente durante un período de ' +
        CONFIG.estadisticas.meses +
        ' meses.'
    );

    // Resumen global de valoraciones
    set('notaGlobal', P.rating.toFixed(1));
    set('estrellasGlobal', estrellasHTML(P.rating));
    set('metaGlobal', 'Basado en ' + P.numResenas.toLocaleString('es-EC') + ' opiniones verificadas');
  }

  /* =======================================================================
     5. ACORDEONES DE DETALLES
     ======================================================================= */
  function pintarDetalles() {
    const cont = document.getElementById('detallesProducto');
    if (!cont) return;
    cont.innerHTML = CONTENIDO.detalles
      .map(
        (d, i) =>
          '<div class="acordeon">' +
          '<button class="acordeon__boton" aria-expanded="false" aria-controls="det' +
          i +
          '">' +
          '<span><span class="ico" aria-hidden="true">' +
          (ICO[d.icono] || '') +
          '</span> ' +
          esc(d.titulo) +
          '</span>' +
          ICO.chevron +
          '</button>' +
          '<div class="acordeon__panel" id="det' +
          i +
          '" data-abierto="false">' +
          '<div class="acordeon__interior">' +
          d.contenido +
          '</div></div></div>'
      )
      .join('');
  }

  /* =======================================================================
     6. PREGUNTAS FRECUENTES
     ======================================================================= */
  function pintarFaq() {
    const cont = document.getElementById('listaFaq');
    if (!cont) return;
    cont.innerHTML = CONTENIDO.faq
      .map(
        (f, i) =>
          '<div class="acordeon" style="background:#fff;border-radius:10px;margin-bottom:10px;border:1px solid var(--gris-200);padding:0 var(--sp-4)">' +
          '<button class="acordeon__boton" aria-expanded="false" aria-controls="faq' +
          i +
          '"><span>' +
          esc(f.p) +
          '</span>' +
          ICO.chevron +
          '</button>' +
          '<div class="acordeon__panel" id="faq' +
          i +
          '" data-abierto="false">' +
          '<div class="acordeon__interior">' +
          f.r +
          '</div></div></div>'
      )
      .join('');
  }

  /* =======================================================================
     7. PACKS
     ======================================================================= */
  let packElegido = CONFIG.packs.find((p) => p.destacado) || CONFIG.packs[0];

  function pintarPacks() {
    const cont = document.getElementById('packs');
    if (!cont) return;

    cont.insertAdjacentHTML(
      'beforeend',
      CONFIG.packs
        .map((p) => {
          const unidad = p.precio / p.cantidad;
          const antes = P.precioAntes * p.cantidad;
          const activo = p.id === packElegido.id;
          return (
            '<label class="pack' +
            (activo ? ' pack--activo' : '') +
            (p.destacado ? ' pack--destacado' : '') +
            '" data-pack="' +
            p.id +
            '">' +
            (p.etiqueta ? '<span class="pack__etiqueta">' + esc(p.etiqueta) + '</span>' : '') +
            '<input type="radio" name="pack" value="' +
            p.id +
            '"' +
            (activo ? ' checked' : '') +
            '>' +
            '<span class="pack__radio" aria-hidden="true"></span>' +
            '<span class="pack__info">' +
            '<span class="pack__titulo">' +
            esc(p.titulo) +
            '</span>' +
            '<span class="pack__desc">' +
            esc(p.descripcion) +
            '</span>' +
            '</span>' +
            '<span class="pack__precios">' +
            '<span class="pack__precio">' +
            dinero(p.precio) +
            '</span><br>' +
            '<span class="pack__unidad">' +
            dinero(unidad) +
            ' c/u · antes ' +
            dinero(antes) +
            '</span>' +
            '</span>' +
            '</label>'
          );
        })
        .join('')
    );

    cont.addEventListener('change', (e) => {
      const input = e.target.closest('input[name="pack"]');
      if (!input) return;
      packElegido = CONFIG.packs.find((p) => p.id === input.value) || CONFIG.packs[0];
      $$('.pack', cont).forEach((l) =>
        l.classList.toggle('pack--activo', l.getAttribute('data-pack') === packElegido.id)
      );
      actualizarStickyConPack();
    });
  }

  function actualizarStickyConPack() {
    const el = document.getElementById('stickyPrecio');
    if (el) {
      // Texto corto para que la barra no crezca de alto en pantallas pequeñas
      el.textContent =
        dinero(packElegido.precio) +
        (packElegido.cantidad > 1 ? ' · ' + packElegido.cantidad + ' uds' : '') +
        ' · Envío gratis';
    }
  }

  /* =======================================================================
     8. AÑADIR AL CARRITO
     ======================================================================= */
  function agregarAlCarrito(abrirDespues) {
    const p = packElegido;
    Carrito.agregar({
      id: P.id + '__' + p.id,
      nombre: P.nombre,
      variante: p.cantidad > 1 ? 'Pack de ' + p.cantidad + ' unidades' : 'Unidad',
      precio: p.precio,
      precioAntes: P.precioAntes * p.cantidad,
      imagen: P.imagenPrincipal,
      unidades: p.cantidad,
    });
    if (abrirDespues !== false) {
      // El cajón que se abre ya es la confirmación visual; un aviso encima
      // taparía el producto recién añadido.
      window.Tienda.abrirCajon();
    } else {
      aviso('¡Añadido al carrito!', 'ok');
    }
  }

  function activarBotones() {
    const btn = document.getElementById('btnAgregar');
    if (btn) btn.addEventListener('click', () => agregarAlCarrito(true));

    const sticky = document.getElementById('stickyBtn');
    if (sticky) sticky.addEventListener('click', () => agregarAlCarrito(true));

    // Botones "COMPRAR AHORA": añaden y van directo al checkout
    $$('[data-comprar-ahora]').forEach((b) =>
      b.addEventListener('click', () => {
        agregarAlCarrito(false);
        setTimeout(() => {
          window.location.href = 'checkout.html';
        }, 320);
      })
    );
  }

  /* =======================================================================
     9. BARRA STICKY: aparece al bajar
     ======================================================================= */
  function activarSticky() {
    const barra = document.getElementById('barraSticky');
    const btnPrincipal = document.getElementById('btnAgregar');
    if (!barra || !btnPrincipal) return;

    if (!('IntersectionObserver' in window)) {
      barra.classList.add('visible');
      return;
    }

    // Mostramos la barra cuando el botón principal sale de la pantalla
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          barra.classList.toggle('visible', !e.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    obs.observe(btnPrincipal);
  }

  /* =======================================================================
     10. CUENTA REGRESIVA
     ======================================================================= */
  function activarRegresiva() {
    if (!CONFIG.oferta.activa) return;
    const caja = document.getElementById('regresiva');
    const elMin = document.getElementById('regMin');
    const elSeg = document.getElementById('regSeg');
    const elTexto = document.getElementById('regresivaTexto');
    if (!caja) return;

    const CLAVE = CONFIG.tienda.prefijoDatos + '_oferta_fin';
    let fin;
    try {
      fin = parseInt(localStorage.getItem(CLAVE), 10);
    } catch (e) {
      fin = NaN;
    }
    const ahora = Date.now();
    if (!fin || !isFinite(fin) || fin < ahora) {
      fin = ahora + CONFIG.oferta.duracionMinutos * 60 * 1000;
      try {
        localStorage.setItem(CLAVE, String(fin));
      } catch (e) {}
    }

    caja.hidden = false;
    elTexto.innerHTML =
      '<span class="ico" style="color:#fff" aria-hidden="true">' + ICO.reloj + '</span> ' +
      esc(CONFIG.oferta.texto);

    function tic() {
      const resta = Math.max(0, fin - Date.now());
      const min = Math.floor(resta / 60000);
      const seg = Math.floor((resta % 60000) / 1000);
      elMin.textContent = String(min).padStart(2, '0');
      elSeg.textContent = String(seg).padStart(2, '0');
      if (resta <= 0) {
        elTexto.innerHTML =
          '<span class="ico" style="color:#fff" aria-hidden="true">' + ICO.reloj +
          '</span> ¡Última oportunidad! Precio aún disponible';
        clearInterval(intervalo);
      }
    }
    tic();
    const intervalo = setInterval(tic, 1000);
  }

  /* =======================================================================
     11. RESEÑAS
     ======================================================================= */
  const VISIBLES_INICIAL = 6;
  let mostrandoTodas = false;

  function pintarResenas() {
    const muro = document.getElementById('muroResenas');
    const btn = document.getElementById('btnMasResenas');
    if (!muro) return;

    const lista = mostrandoTodas
      ? CONTENIDO.resenas
      : CONTENIDO.resenas.slice(0, VISIBLES_INICIAL);

    muro.innerHTML = lista
      .map(
        (r) =>
          '<article class="resena">' +
          (r.foto
            ? '<img class="resena__foto" src="' +
              esc(r.foto) +
              '" alt="Resultado compartido por ' +
              esc(r.autora) +
              '" width="480" height="600" loading="lazy">'
            : '') +
          '<div class="resena__cuerpo">' +
          '<p class="resena__autora">' +
          '<span class="resena__verificada" aria-label="Compra verificada">' +
          ICO.checkCirculo +
          '</span>' +
          esc(r.autora) +
          '</p>' +
          '<span class="estrellas" aria-label="' +
          r.estrellas +
          ' de 5 estrellas">' +
          estrellasHTML(r.estrellas) +
          '</span>' +
          (r.texto ? '<p class="resena__texto">' + esc(r.texto) + '</p>' : '') +
          '</div></article>'
      )
      .join('');

    if (btn) {
      const quedan = CONTENIDO.resenas.length - VISIBLES_INICIAL;
      if (quedan <= 0) {
        btn.hidden = true;
      } else {
        btn.textContent = mostrandoTodas ? 'Ver menos reseñas' : 'Ver las ' + quedan + ' reseñas restantes';
      }
    }
  }

  function activarMasResenas() {
    const btn = document.getElementById('btnMasResenas');
    if (!btn) return;
    btn.addEventListener('click', () => {
      mostrandoTodas = !mostrandoTodas;
      pintarResenas();
      if (!mostrandoTodas) {
        document.getElementById('tituloResenas').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* =======================================================================
     12. CARRUSEL DE CLIENTAS FELICES
     ======================================================================= */
  function pintarFelices() {
    const pista = document.getElementById('pistaFelices');
    if (!pista) return;
    const fotos = [];
    for (let i = 1; i <= 7; i++) fotos.push('assets/img/clienta-' + i + '.svg');

    // Duplicamos la lista para que el desplazamiento sea infinito y sin saltos
    const html = fotos
      .concat(fotos)
      .map(
        (f) =>
          '<div class="felices__item"><img src="' +
          esc(f) +
          '" alt="" width="360" height="480" loading="lazy"></div>'
      )
      .join('');
    pista.innerHTML = html;
  }

  /* =======================================================================
     13. ESTADÍSTICAS ANIMADAS
     ======================================================================= */
  function pintarStats() {
    const cont = document.getElementById('listaStats');
    if (!cont) return;

    cont.innerHTML = CONFIG.estadisticas.items
      .map(
        (s, i) =>
          '<div class="stat" data-valor="' +
          s.valor +
          '">' +
          '<div class="stat__anillo">' +
          '<svg viewBox="0 0 62 62" aria-hidden="true">' +
          '<circle class="stat__pista" cx="31" cy="31" r="28"/>' +
          '<circle class="stat__progreso" cx="31" cy="31" r="28"/>' +
          '</svg>' +
          '<span class="stat__numero">0%</span>' +
          '</div>' +
          '<p class="stat__texto">' +
          s.texto +
          '</p>' +
          '</div>'
      )
      .join('');

    const stats = $$('.stat', cont);
    const CIRC = 2 * Math.PI * 28; // ≈ 175.9

    function animar(stat) {
      const objetivo = parseInt(stat.getAttribute('data-valor'), 10) || 0;
      const aro = $('.stat__progreso', stat);
      const num = $('.stat__numero', stat);
      aro.style.strokeDasharray = CIRC;
      aro.style.strokeDashoffset = CIRC - (CIRC * objetivo) / 100;

      const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducido) {
        num.textContent = objetivo + '%';
        return;
      }

      const duracion = 1400;
      const inicio = performance.now();
      function paso(t) {
        const p = Math.min(1, (t - inicio) / duracion);
        // suavizado easeOutCubic
        const e = 1 - Math.pow(1 - p, 3);
        num.textContent = Math.round(objetivo * e) + '%';
        if (p < 1) requestAnimationFrame(paso);
      }
      requestAnimationFrame(paso);
    }

    if (!('IntersectionObserver' in window)) {
      stats.forEach(animar);
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            animar(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    stats.forEach((s) => obs.observe(s));
  }

  /* =======================================================================
     14. DATOS ESTRUCTURADOS PARA GOOGLE
     ======================================================================= */
  function pintarSchema() {
    const el = document.getElementById('datosEstructurados');
    if (!el) return;
    const base = location.href.replace(/[^/]*$/, '');
    const datos = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: P.nombre,
          sku: P.sku,
          brand: { '@type': 'Brand', name: P.marca },
          image: [base + P.imagenPrincipal],
          description:
            'Cepillo, secador y aplanchador 3 en 1. Seca, alisa y da volumen en un solo paso con tecnología cerámica y 1000 W de potencia.',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: P.rating,
            reviewCount: P.numResenas,
            bestRating: 5,
          },
          offers: {
            '@type': 'Offer',
            url: base,
            priceCurrency: 'USD',
            price: P.precio.toFixed(2),
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
          review: CONTENIDO.resenas.slice(0, 5).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.autora },
            reviewRating: { '@type': 'Rating', ratingValue: r.estrellas, bestRating: 5 },
            reviewBody: r.texto || '',
          })),
        },
        {
          '@type': 'FAQPage',
          mainEntity: CONTENIDO.faq.map((f) => ({
            '@type': 'Question',
            name: f.p,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.r.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
            },
          })),
        },
      ],
    };
    el.textContent = JSON.stringify(datos);
  }

  /* =======================================================================
     15. ARRANQUE
     ======================================================================= */
  function iniciar() {
    pintarIconos();
    construirGaleria();
    pintarProducto();
    pintarDetalles();
    pintarFaq();
    pintarPacks();
    actualizarStickyConPack();
    pintarResenas();
    activarMasResenas();
    pintarFelices();
    pintarStats();
    activarBotones();
    activarSticky();
    activarRegresiva();
    pintarSchema();
    window.Tienda.activarRevelado();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
