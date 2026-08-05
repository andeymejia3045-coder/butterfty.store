/* =========================================================================
   TIENDA.JS — Núcleo compartido por todas las páginas
   -------------------------------------------------------------------------
   Contiene:
     · Utilidades (formato de dinero, escape de HTML, avisos flotantes)
     · Motor del carrito con persistencia en localStorage
     · Cajón (drawer) del carrito
     · Contador del ícono del carrito
     · Iconos SVG reutilizables
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     0. ICONOS SVG
     ======================================================================= */
  const ICO = {
    carrito:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2.5 3h2.2l2.6 12.3h11.2l2-8.3H6.2"/></svg>',
    carritoRelleno:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.7"/><circle cx="18" cy="20" r="1.7"/><path d="M2.5 3h2.2l2.6 12.3h11.2l2-8.3H6.2"/></svg>',
    cerrar:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chevron:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    izq:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    der:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    estrella:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2l2.95 6.06 6.65.95-4.8 4.7 1.13 6.63L12 17.4l-5.93 3.14L7.2 13.9 2.4 9.2l6.65-.95z"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    checkCirculo:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.7 7.7l-5.6 5.6a1 1 0 01-1.4 0L7.3 13a1 1 0 111.4-1.4l1.7 1.7 4.9-4.9a1 1 0 111.4 1.3z"/></svg>',
    escudo:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.6l7.5 3v6.1c0 4.6-3.1 8.3-7.5 9.7-4.4-1.4-7.5-5.1-7.5-9.7V5.6z"/></svg>',
    camion:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h11v10H2zM13 9h4.5l3 3v4H13"/><circle cx="6" cy="18.5" r="1.7"/><circle cx="17" cy="18.5" r="1.7"/></svg>',
    corazon:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5l-1.5-1.35C5.6 14.75 2.5 12 2.5 8.6A4.6 4.6 0 017.1 4c1.9 0 3.4 1.05 4.9 2.85C13.5 5.05 15 4 16.9 4a4.6 4.6 0 014.6 4.6c0 3.4-3.1 6.15-8 10.55z"/></svg>',
    reloj:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3.2 2"/></svg>',
    chispa:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>',
    copiar:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M6.5 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1.5"/></svg>',
    whatsapp:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.9-.95 1.08-.17.18-.35.2-.65.05-.3-.15-1.13-.42-2.15-1.33-.8-.71-1.33-1.58-1.5-1.88-.15-.3-.02-.47.13-.62.15-.15.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.03 1-1.03 2.45s1.05 2.85 1.2 3.05c.15.2 2.06 3.28 5.02 4.45 2.95 1.18 2.95.78 3.48.73.53-.05 1.72-.7 1.96-1.38.25-.68.25-1.26.17-1.38-.07-.13-.27-.2-.57-.35z"/><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.8 9.8 0 004.68 1.2c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2zm0 17.98a8.1 8.1 0 01-4.13-1.13l-.3-.18-3.07.8.82-3-.19-.31a8.13 8.13 0 01-1.25-4.32c0-4.49 3.65-8.14 8.14-8.14s8.13 3.65 8.13 8.14-3.65 8.14-8.15 8.14z"/></svg>',
    caja:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',

    /* --- Iconos que sustituyen a los emojis: se ven igual en todos los
           dispositivos, incluso en Android viejos o Windows sin fuente emoji --- */
    usuario:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0115 0"/></svg>',
    pin:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.5s7-6.2 7-11.2a7 7 0 10-14 0c0 5 7 11.2 7 11.2z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    billete:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.8"/><path d="M6 12h.01M18 12h.01"/></svg>',
    banco:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 4l9 5.5"/><path d="M5 10.5V19M9.5 10.5V19M14.5 10.5V19M19 10.5V19"/><path d="M3 19.5h18"/></svg>',
    tarjeta:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><path d="M6 15h4"/></svg>',
    nota:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5h9l5 5V20a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 014 20V5a1.5 1.5 0 011-1.5z"/><path d="M14 3.5V9h5M8 13h8M8 17h5"/></svg>',
    recibo:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2.5h12v19l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>',
    info:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8h.01"/></svg>',
    alerta:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l9.5 16.5H2.5z"/><path d="M12 9.5v4.5M12 17.2h.01"/></svg>',
    idea:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 00-3.8 11.8V18h7.6v-3.7A6.5 6.5 0 0012 2.5z"/></svg>',
    camara:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5A2 2 0 015 6.5h2l1.3-2h7.4L17 6.5h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><circle cx="12" cy="13" r="3.4"/></svg>',
    manos:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7.5l3-2.5 6 5-4.5 5.5"/><path d="M12 7.5L9 5 3 10l4.5 5.5"/><path d="M7.5 15.5l3 3h3l3-3"/></svg>',
    hoja:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20c0-8 5-14 16-15 1 11-5 16-13 15.5"/><path d="M4 20c3-4.5 6.5-7 11-9"/></svg>',
    mapa:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3.5L3 6v14.5l6-2.5 6 2.5 6-2.5V3.5L15 6z"/><path d="M9 3.5V18M15 6v14.5"/></svg>',
    candado:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.2"/><path d="M8 10.5V7.8a4 4 0 018 0v2.7"/></svg>',
    telefono:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>',
    sobre:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="M3 6.5l9 6.5 9-6.5"/></svg>',
  };

  /* =======================================================================
     1. UTILIDADES
     ======================================================================= */

  /**
   * Redondea a 2 decimales de forma segura.
   * Math.round(x * 100) / 100 falla en casos como 1.005; sumamos un épsilon
   * relativo para que el redondeo del dinero sea siempre el esperado.
   */
  function redondear(n) {
    const v = Number(n);
    if (!isFinite(v)) return 0;
    return Math.round((v + Number.EPSILON * Math.abs(v)) * 100) / 100;
  }

  /** Formatea un número como precio en dólares: 29.99 -> "$29.99" */
  function dinero(n) {
    return CONFIG.tienda.simbolo + redondear(n).toFixed(2);
  }

  /** Escapa HTML para nunca inyectar contenido del usuario sin filtrar */
  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[c]);
  }

  /** Atajo de querySelector */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /** Enlace de WhatsApp listo para usar */
  function enlaceWa(mensaje) {
    return (
      'https://wa.me/' +
      CONFIG.whatsapp.numeroWa +
      '?text=' +
      encodeURIComponent(mensaje || CONFIG.whatsapp.saludo)
    );
  }

  /* ---------------------- Avisos flotantes (toast) ---------------------- */
  let contenedorTostadas = null;

  function aviso(mensaje, tipo) {
    if (!contenedorTostadas) {
      contenedorTostadas = document.createElement('div');
      contenedorTostadas.className = 'tostadas';
      contenedorTostadas.setAttribute('role', 'status');
      contenedorTostadas.setAttribute('aria-live', 'polite');
      document.body.appendChild(contenedorTostadas);
    }
    const t = document.createElement('div');
    t.className = 'tostada' + (tipo ? ' tostada--' + tipo : '');
    const icono = tipo === 'error' ? ICO.cerrar : ICO.check;
    t.innerHTML = icono + '<span>' + esc(mensaje) + '</span>';
    contenedorTostadas.appendChild(t);

    setTimeout(() => {
      t.classList.add('saliendo');
      setTimeout(() => t.remove(), 260);
    }, 2600);
  }

  /* =======================================================================
     2. MOTOR DEL CARRITO
     ======================================================================= */
  const CLAVE = CONFIG.tienda.prefijoDatos + '_carrito_v1';

  function leer() {
    try {
      const raw = localStorage.getItem(CLAVE);
      const datos = raw ? JSON.parse(raw) : [];
      return Array.isArray(datos) ? datos.filter(esLineaValida) : [];
    } catch (e) {
      // Si localStorage está bloqueado (modo privado en iOS) seguimos en memoria
      return memoria;
    }
  }

  function esLineaValida(l) {
    return (
      l &&
      typeof l.id === 'string' &&
      typeof l.nombre === 'string' &&
      typeof l.precio === 'number' &&
      isFinite(l.precio) &&
      l.precio >= 0 &&
      Number.isInteger(l.cantidad) &&
      l.cantidad > 0
    );
  }

  let memoria = [];

  function guardar(lineas) {
    memoria = lineas;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lineas));
    } catch (e) {
      /* silencioso: quedamos con la copia en memoria */
    }
    notificar();
  }

  function notificar() {
    document.dispatchEvent(new CustomEvent('carrito:cambio', { detail: resumen() }));
  }

  const Carrito = {
    /** Todas las líneas del carrito */
    lineas() {
      return leer();
    },

    /** Cantidad total de unidades */
    unidades() {
      return leer().reduce((s, l) => s + l.cantidad, 0);
    },

    /**
     * Suma antes de descuentos.
     * Redondeamos a 2 decimales porque los flotantes de JavaScript arrastran
     * errores: 49.99 + 69.99 daría 119.97999999999999 sin este redondeo.
     */
    subtotal() {
      const suma = leer().reduce((s, l) => s + l.precio * l.cantidad, 0);
      return redondear(suma);
    },

    /** Ahorro frente al precio de lista */
    ahorro() {
      const suma = leer().reduce((s, l) => {
        const antes = (l.precioAntes || l.precio) * l.cantidad;
        return s + Math.max(0, antes - l.precio * l.cantidad);
      }, 0);
      return redondear(suma);
    },

    vacio() {
      return leer().length === 0;
    },

    /**
     * Agrega un artículo. Si ya existe la misma línea (mismo id) suma cantidad.
     * @param {Object} art  {id, nombre, variante, precio, precioAntes, imagen, unidades}
     * @param {number} cant cuántas veces agregar
     */
    agregar(art, cant) {
      const n = Math.max(1, parseInt(cant, 10) || 1);
      const lineas = leer();
      const existente = lineas.find((l) => l.id === art.id);

      if (existente) {
        existente.cantidad = Math.min(99, existente.cantidad + n);
      } else {
        lineas.push({
          id: String(art.id),
          nombre: String(art.nombre),
          variante: art.variante ? String(art.variante) : '',
          precio: Number(art.precio),
          precioAntes: art.precioAntes ? Number(art.precioAntes) : Number(art.precio),
          imagen: art.imagen || CONFIG.producto.imagenPrincipal,
          unidades: Number(art.unidades) || 1,
          cantidad: Math.min(99, n),
        });
      }
      guardar(lineas);
      return true;
    },

    /** Cambia la cantidad de una línea. 0 o menos = eliminar */
    actualizar(id, cantidad) {
      const c = parseInt(cantidad, 10);
      let lineas = leer();
      if (!isFinite(c) || c <= 0) {
        lineas = lineas.filter((l) => l.id !== id);
      } else {
        const l = lineas.find((x) => x.id === id);
        if (l) l.cantidad = Math.min(99, c);
      }
      guardar(lineas);
    },

    quitar(id) {
      guardar(leer().filter((l) => l.id !== id));
    },

    vaciar() {
      guardar([]);
    },

    /** Costo de envío según configuración */
    envio() {
      return Number(CONFIG.envio.costo) || 0;
    },

    /**
     * Calcula los totales aplicando el método de pago elegido.
     * @param {string} metodoId 'contraentrega' | 'transferencia' | null
     */
    totales(metodoId) {
      const sub = this.subtotal();
      const envio = this.envio();
      let descuento = 0;
      let recargo = 0;
      let metodo = null;

      if (metodoId && CONFIG.pagos[metodoId]) {
        metodo = CONFIG.pagos[metodoId];
        descuento = redondear(sub * (metodo.descuento || 0));
        recargo = redondear(metodo.recargo);
      }

      const total = Math.max(0, redondear(sub - descuento + envio + recargo));
      const ahorroLista = this.ahorro();
      return {
        // Precio sin la oferta, para que la resta del desglose cuadre
        precioLista: redondear(sub + ahorroLista),
        ahorroLista: ahorroLista,
        subtotal: redondear(sub),
        envio: redondear(envio),
        descuento: descuento,
        recargo: recargo,
        total: total,
        unidades: this.unidades(),
        metodo: metodo,
      };
    },
  };

  function resumen() {
    return {
      unidades: Carrito.unidades(),
      subtotal: Carrito.subtotal(),
      lineas: Carrito.lineas(),
    };
  }

  /* =======================================================================
     3. CONTADOR DEL ÍCONO DEL CARRITO
     ======================================================================= */
  function pintarContadores() {
    const n = Carrito.unidades();
    $$('[data-contador-carrito]').forEach((el) => {
      el.textContent = n > 99 ? '99+' : String(n);
      el.classList.toggle('visible', n > 0);
      if (n > 0) {
        el.classList.remove('late');
        // reinicia la animación
        void el.offsetWidth;
        el.classList.add('late');
      }
    });
  }

  /* =======================================================================
     4. CAJÓN DEL CARRITO
     ======================================================================= */
  let cajon = null;
  let velo = null;
  let ultimoFoco = null;

  function construirCajon() {
    if (cajon) return;

    velo = document.createElement('div');
    velo.className = 'velo';
    velo.setAttribute('data-cerrar-cajon', '');

    cajon = document.createElement('aside');
    cajon.className = 'cajon';
    cajon.setAttribute('role', 'dialog');
    cajon.setAttribute('aria-modal', 'true');
    cajon.setAttribute('aria-label', 'Tu carrito de compras');
    cajon.setAttribute('aria-hidden', 'true');
    cajon.innerHTML =
      '<div class="cajon__cabecera">' +
      '<h2 class="cajon__titulo">Tu carrito <span data-cajon-cant></span></h2>' +
      '<button class="icono-btn" data-cerrar-cajon aria-label="Cerrar carrito">' +
      ICO.cerrar +
      '</button>' +
      '</div>' +
      '<div class="cajon__cuerpo" data-cajon-cuerpo></div>' +
      '<div class="cajon__pie" data-cajon-pie></div>';

    document.body.appendChild(velo);
    document.body.appendChild(cajon);

    // Cierre por clic en velo o botón
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cerrar-cajon]')) {
        e.preventDefault();
        cerrarCajon();
      }
      if (e.target.closest('[data-abrir-cajon]')) {
        e.preventDefault();
        abrirCajon();
      }
    });

    // Cierre con Escape + trampa de foco
    document.addEventListener('keydown', (e) => {
      if (!cajon.classList.contains('abierto')) return;
      if (e.key === 'Escape') {
        cerrarCajon();
        return;
      }
      if (e.key === 'Tab') {
        const focos = $$(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          cajon
        ).filter((el) => el.offsetParent !== null);
        if (!focos.length) return;
        const primero = focos[0];
        const ultimo = focos[focos.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    });

    // Controles de cantidad dentro del cajón
    cajon.addEventListener('click', (e) => {
      const mas = e.target.closest('[data-mas]');
      const menos = e.target.closest('[data-menos]');
      const quitar = e.target.closest('[data-quitar]');
      if (mas) {
        const id = mas.getAttribute('data-mas');
        const l = Carrito.lineas().find((x) => x.id === id);
        if (l) Carrito.actualizar(id, l.cantidad + 1);
      } else if (menos) {
        const id = menos.getAttribute('data-menos');
        const l = Carrito.lineas().find((x) => x.id === id);
        if (l) Carrito.actualizar(id, l.cantidad - 1);
      } else if (quitar) {
        // No mostramos aviso: la línea desaparece a la vista y un aviso
        // flotante taparía la cabecera del cajón.
        Carrito.quitar(quitar.getAttribute('data-quitar'));
      }
    });
  }

  function pintarCajon() {
    if (!cajon) return;
    const cuerpo = $('[data-cajon-cuerpo]', cajon);
    const pie = $('[data-cajon-pie]', cajon);
    const cant = $('[data-cajon-cant]', cajon);
    const lineas = Carrito.lineas();
    const t = Carrito.totales(null);

    cant.textContent = t.unidades ? '(' + t.unidades + ')' : '';

    if (!lineas.length) {
      cuerpo.innerHTML =
        '<div class="cajon__vacio">' +
        ICO.carrito +
        '<p><strong>Tu carrito está vacío</strong></p>' +
        '<p style="font-size:var(--t-sm);margin-top:8px">Añade el cepillo y aprovecha el 40 % de descuento.</p>' +
        '</div>';
      pie.innerHTML =
        '<button class="btn btn--fantasma btn--bloque" data-cerrar-cajon>Seguir viendo</button>';
      return;
    }

    cuerpo.innerHTML = lineas
      .map(
        (l) =>
          '<div class="linea">' +
          '<div class="linea__foto"><img src="' +
          esc(l.imagen) +
          '" alt="' +
          esc(l.nombre) +
          '" loading="lazy" width="72" height="72"></div>' +
          '<div class="linea__info">' +
          '<p class="linea__nombre">' +
          esc(l.nombre) +
          '</p>' +
          (l.variante ? '<p class="linea__variante">' + esc(l.variante) + '</p>' : '') +
          '<div class="linea__fila">' +
          '<div class="contador">' +
          '<button data-menos="' +
          esc(l.id) +
          '" aria-label="Quitar una unidad">−</button>' +
          '<span class="contador__valor">' +
          l.cantidad +
          '</span>' +
          '<button data-mas="' +
          esc(l.id) +
          '" aria-label="Añadir una unidad">+</button>' +
          '</div>' +
          '<span class="linea__precio">' +
          dinero(l.precio * l.cantidad) +
          '</span>' +
          '</div>' +
          '<button class="linea__quitar" data-quitar="' +
          esc(l.id) +
          '">Eliminar</button>' +
          '</div>' +
          '</div>'
      )
      .join('');

    pie.innerHTML =
      '<div class="totales">' +
      (t.ahorroLista > 0
        ? '<div class="totales__fila"><span>Precio de lista</span><span style="text-decoration:line-through;color:var(--gris-500)">' +
          dinero(t.precioLista) +
          '</span></div>' +
          '<div class="totales__fila totales__fila--descuento"><span>Ahorras</span><span>−' +
          dinero(t.ahorroLista) +
          '</span></div>'
        : '') +
      '<div class="totales__fila"><span>Subtotal (' +
      t.unidades +
      (t.unidades === 1 ? ' artículo)' : ' artículos)') +
      '</span><strong>' +
      dinero(t.subtotal) +
      '</strong></div>' +
      '<div class="totales__fila"><span>Envío</span><span class="totales__envio-gratis">' +
      (t.envio === 0 ? 'GRATIS' : dinero(t.envio)) +
      '</span></div>' +
      '<div class="totales__fila totales__fila--total"><span>Total</span><span>' +
      dinero(t.total) +
      '</span></div>' +
      '</div>' +
      '<a class="btn btn--cta btn--bloque" href="checkout.html">Finalizar compra</a>' +
      '<p style="text-align:center;font-size:var(--t-xs);color:var(--gris-500);margin-top:10px">' +
      '<span class="ico ico--neutro" aria-hidden="true">' + ICO.candado +
      '</span> Pago contra entrega o transferencia · Envío gratis</p>';
  }

  function abrirCajon() {
    construirCajon();
    pintarCajon();
    ultimoFoco = document.activeElement;
    velo.classList.add('abierto');
    cajon.classList.add('abierto');
    cajon.setAttribute('aria-hidden', 'false');
    document.body.classList.add('bloqueado');
    setTimeout(() => {
      const b = $('[data-cerrar-cajon]', cajon);
      if (b) b.focus();
    }, 60);
  }

  function cerrarCajon() {
    if (!cajon) return;
    velo.classList.remove('abierto');
    cajon.classList.remove('abierto');
    cajon.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('bloqueado');
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  /* =======================================================================
     4.b RESPALDO DE IMÁGENES
     -----------------------------------------------------------------------
     Si una foto real todavía no está subida, mostramos la ilustración con el
     mismo nombre pero terminación .svg. Así puedes ir subiendo tus fotos de
     a una y nunca aparece el recuadro roto de imagen faltante.

     Usamos la fase de captura porque el evento "error" de las imágenes no
     sube por el árbol como los demás eventos.
     ======================================================================= */
  /* Orden en que se buscan las imágenes. Si subes la foto como .jpg o como
     .png da igual: se prueba una y luego la otra, y si no hay ninguna se
     muestra la ilustración .svg, que siempre existe. */
  const CADENA_FORMATOS = ['.jpg', '.png', '.svg'];
  const EXTENSIONES_FOTO = /\.(jpe?g|png|webp|avif|svg)$/i;

  /**
   * Cuando una imagen no carga, buscamos una alternativa.
   *
   * Ojo: usamos DOS atributos distintos a propósito.
   *   data-respaldo        -> la dirección de la imagen alternativa
   *   data-respaldo-usado  -> la marca de que ya lo intentamos
   * Si guardáramos las dos cosas en el mismo atributo, la marca borraría la
   * dirección y el respaldo dejaría de funcionar.
   */
  function usarRespaldo(img) {
    if (!img || img.tagName !== 'IMG') return;
    if (img.dataset.respaldoUsado === '1') return; // ya se intentó una vez

    /* Caso 1: la foto viene de un link de internet y ese link falló.
       Pasamos directo a la ilustración local indicada en data-respaldo. */
    const alterno = img.getAttribute('data-respaldo');
    if (alterno) {
      img.dataset.respaldoUsado = '1';
      img.src = alterno;
      return;
    }

    /* Caso 2: archivo del proyecto. Probamos .jpg, .png y la ilustración. */
    const actual = img.getAttribute('src') || '';

    // Un link de internet sin respaldo declarado: no inventamos direcciones
    if (/^https?:\/\//i.test(actual)) return;

    const coincide = actual.match(EXTENSIONES_FOTO);
    if (!coincide) return;

    const extActual = coincide[0].toLowerCase().replace('.jpeg', '.jpg');
    const posicion = CADENA_FORMATOS.indexOf(extActual);

    // Si ya llegamos a la ilustración, no hay nada más que intentar
    if (posicion === -1 || posicion === CADENA_FORMATOS.length - 1) return;

    img.src = actual.replace(EXTENSIONES_FOTO, CADENA_FORMATOS[posicion + 1]);
  }

  /** Revisa las imágenes que ya fallaron antes de que empezáramos a escuchar */
  function barrerImagenesFallidas() {
    $$('img').forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
        usarRespaldo(img);
      }
    });
  }

  function activarRespaldoImagenes() {
    // Para las imágenes que se crean después: escuchamos el evento
    document.addEventListener('error', (e) => usarRespaldo(e.target), true);

    // Para las que ya estaban en el HTML: su evento de error pudo dispararse
    // antes de que este script se ejecutara, así que las revisamos a mano
    barrerImagenesFallidas();
    window.addEventListener('load', barrerImagenesFallidas);
  }

  /* =======================================================================
     5. ANIMACIÓN AL HACER SCROLL
     ======================================================================= */
  function activarRevelado() {
    const items = $$('.revelar');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.08 }
    );
    items.forEach((el) => obs.observe(el));
  }

  /* =======================================================================
     6. BOTÓN DE COPIAR AL PORTAPAPELES
     ======================================================================= */
  function activarCopiar() {
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-copiar]');
      if (!btn) return;
      e.preventDefault();
      const texto = btn.getAttribute('data-copiar');
      let ok = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(texto);
          ok = true;
        } else {
          // Alternativa para navegadores viejos o http://
          const ta = document.createElement('textarea');
          ta.value = texto;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          ok = document.execCommand('copy');
          ta.remove();
        }
      } catch (err) {
        ok = false;
      }
      aviso(ok ? '¡Copiado: ' + texto + '!' : 'No se pudo copiar, cópialo a mano', ok ? 'ok' : 'error');
    });
  }

  /* =======================================================================
     7. ACORDEONES (accesibles)
     ======================================================================= */
  function activarAcordeones() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.acordeon__boton');
      if (!btn) return;
      const abierto = btn.getAttribute('aria-expanded') === 'true';
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!abierto));
      if (panel) panel.setAttribute('data-abierto', String(!abierto));
    });
  }

  /* =======================================================================
     8. ARRANQUE
     ======================================================================= */
  function iniciar() {
    activarRespaldoImagenes();
    construirCajon();
    pintarContadores();
    activarRevelado();
    activarCopiar();
    activarAcordeones();

    document.addEventListener('carrito:cambio', () => {
      pintarContadores();
      pintarCajon();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  /* =======================================================================
     9. API PÚBLICA
     ======================================================================= */
  window.Tienda = {
    ICO,
    dinero,
    redondear,
    esc,
    $,
    $$,
    enlaceWa,
    aviso,
    Carrito,
    abrirCajon,
    cerrarCajon,
    pintarContadores,
    activarRevelado,
  };
})();
