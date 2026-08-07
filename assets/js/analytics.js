/* =========================================================================
   ANALYTICS.JS — Google Analytics 4, Meta Pixel y eventos comerciales
   -------------------------------------------------------------------------
   - En producción carga GA4 y Meta Pixel con sus IDs configurados.
   - En localhost no envía tráfico, pero deja las colas disponibles para pruebas.
   - Nunca recibe ni envía nombres, teléfonos, cédulas, correos o direcciones.
   ========================================================================= */

(function () {
  'use strict';

  const MEDICION_ID = 'G-1HBW75GE8N';
  const META_PIXEL_ID = '1371399734434750';
  const MONEDA = 'USD';
  const esLocal = /^(localhost|127(?:\.\d+){3}|0\.0\.0\.0)$/i.test(location.hostname);
  const esProduccion = location.protocol === 'https:' && !esLocal;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  if (!window.__butterflyGa4Inicializado) {
    window.__butterflyGa4Inicializado = true;
    window.gtag('js', new Date());

    if (esProduccion) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEDICION_ID);
      document.head.appendChild(script);
      window.gtag('config', MEDICION_ID, {
        send_page_view: true,
        transport_type: 'beacon',
      });
    }
  }

  /* Meta Pixel: misma cola oficial que entrega Meta, sin datos personales. */
  if (!window.__butterflyMetaPixelInicializado) {
    window.__butterflyMetaPixelInicializado = true;

    if (!window.fbq) {
      const fbq = (window.fbq = function () {
        if (fbq.callMethod) {
          fbq.callMethod.apply(fbq, arguments);
        } else {
          fbq.queue.push(arguments);
        }
      });
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
    }

    if (esProduccion) {
      const scriptMeta = document.createElement('script');
      scriptMeta.async = true;
      scriptMeta.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(scriptMeta);
    }

    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function redondear(valor) {
    return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
  }

  const EVENTOS_META = {
    view_item: ['track', 'ViewContent'],
    select_item: ['trackCustom', 'SelectPack'],
    add_to_cart: ['track', 'AddToCart'],
    view_cart: ['trackCustom', 'ViewCart'],
    begin_checkout: ['track', 'InitiateCheckout'],
    payment_method_selected: ['trackCustom', 'PaymentMethodSelected'],
    add_payment_info: ['track', 'AddPaymentInfo'],
    order_submitted: ['trackCustom', 'OrderSubmitted'],
    order_whatsapp_open: ['trackCustom', 'OrderWhatsAppOpen'],
    whatsapp_click: ['track', 'Contact'],
    purchase: ['track', 'Purchase'],
  };

  function parametrosMeta(parametros) {
    const p = parametros || {};
    const items = Array.isArray(p.items) ? p.items : [];
    const seguros = {};

    if (p.currency) seguros.currency = String(p.currency);
    if (typeof p.value === 'number' && isFinite(p.value)) seguros.value = redondear(p.value);

    if (items.length) {
      seguros.content_ids = items.map((item) => String(item.item_id));
      seguros.contents = items.map((item) => ({
        id: String(item.item_id),
        quantity: Math.max(1, Number(item.quantity) || 1),
        item_price: redondear(item.price),
      }));
      seguros.content_type = 'product';
      seguros.content_name = String(items[0].item_name || CONFIG.producto.nombre);
    }

    // Solo parámetros comerciales controlados; jamás datos del formulario.
    ['placement', 'page_type', 'checkout_source', 'cta_source', 'payment_type',
      'transaction_id', 'shipping_tier'].forEach((clave) => {
      if (p[clave] !== undefined && p[clave] !== null) seguros[clave] = String(p[clave]);
    });

    return seguros;
  }

  function trackMeta(nombre, parametros) {
    const evento = EVENTOS_META[nombre];
    if (!evento || !window.fbq) return;
    window.fbq(evento[0], evento[1], parametrosMeta(parametros));
  }

  function track(nombre, parametros) {
    if (!nombre || typeof nombre !== 'string') return;
    const datos = parametros || {};
    window.gtag('event', nombre, Object.assign({ transport_type: 'beacon' }, datos));
    trackMeta(nombre, datos);
  }

  function idPackDesdeLinea(linea) {
    const partes = String(linea && linea.id ? linea.id : '').split('__');
    return partes.length > 1 ? partes[partes.length - 1] : 'unidad';
  }

  function itemPack(pack, cantidad) {
    if (!pack) return null;
    return {
      item_id: CONFIG.producto.sku,
      item_name: CONFIG.producto.nombre,
      item_brand: 'Revlon',
      item_category: 'Cepillos secadores',
      item_variant: pack.id,
      price: redondear(pack.precio),
      quantity: Math.max(1, Number(cantidad) || 1),
      units_per_pack: Math.max(1, Number(pack.cantidad) || 1),
    };
  }

  function itemLinea(linea) {
    if (!linea) return null;
    return {
      item_id: CONFIG.producto.sku,
      item_name: CONFIG.producto.nombre,
      item_brand: 'Revlon',
      item_category: 'Cepillos secadores',
      item_variant: idPackDesdeLinea(linea),
      price: redondear(linea.precio),
      quantity: Math.max(1, Number(linea.cantidad) || 1),
      units_per_pack: Math.max(1, Number(linea.unidades) || 1),
    };
  }

  function itemsLineas(lineas) {
    return (Array.isArray(lineas) ? lineas : []).map(itemLinea).filter(Boolean);
  }

  function valorLineas(lineas) {
    return redondear(
      (Array.isArray(lineas) ? lineas : []).reduce(
        (total, linea) => total + Number(linea.precio || 0) * Number(linea.cantidad || 1),
        0
      )
    );
  }

  function parametrosCarrito(lineas, extra) {
    return Object.assign(
      {
        currency: MONEDA,
        value: valorLineas(lineas),
        items: itemsLineas(lineas),
      },
      extra || {}
    );
  }

  function once(clave, callback) {
    const llave = CONFIG.tienda.prefijoDatos + '_analytics_' + String(clave);
    try {
      if (localStorage.getItem(llave)) return false;
      callback();
      localStorage.setItem(llave, '1');
      return true;
    } catch (e) {
      callback();
      return true;
    }
  }

  function pageType() {
    const pagina = location.pathname.split('/').pop() || 'index.html';
    if (pagina === 'checkout.html') return 'checkout';
    if (pagina === 'gracias.html') return 'confirmation';
    return 'product';
  }

  function ubicacionWhatsApp(enlace) {
    if (enlace.id === 'waCabecera') return 'header';
    if (enlace.id === 'waFlotante') return 'floating';
    if (enlace.id === 'waPie') return 'footer';
    if (enlace.id === 'btnWa') return 'order_confirmation';
    if (enlace.classList.contains('asesora__btn')) return 'advisor';
    return 'other';
  }

  document.addEventListener('click', (evento) => {
    const enlaceWa = evento.target.closest('a[href*="wa.me/"]');
    if (enlaceWa) {
      track('whatsapp_click', {
        placement: ubicacionWhatsApp(enlaceWa),
        page_type: pageType(),
      });
    }

    const checkout = evento.target.closest('a[href="checkout.html"]');
    if (checkout && window.Tienda && !window.Tienda.Carrito.vacio()) {
      const lineas = window.Tienda.Carrito.lineas();
      track('begin_checkout', parametrosCarrito(lineas, { checkout_source: 'cart_drawer' }));
    }
  });

  window.Analytics = {
    measurementId: MEDICION_ID,
    metaPixelId: META_PIXEL_ID,
    enabled: esProduccion,
    track,
    once,
    itemPack,
    itemLinea,
    itemsLineas,
    valorLineas,
    parametrosCarrito,
    pageType,
  };
})();
