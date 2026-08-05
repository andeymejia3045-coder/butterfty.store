/* =========================================================================
   CHECKOUT.JS — Formulario, validación y los dos métodos de pago
   ========================================================================= */

(function () {
  'use strict';

  const { ICO, dinero, esc, $, $$, enlaceWa, aviso, Carrito } = window.Tienda;

  let metodoElegido = 'contraentrega'; // el que menos fricción tiene, va por defecto

  /* =======================================================================
     1. VALIDADORES
     ======================================================================= */

  /**
   * Valida una cédula ecuatoriana con el algoritmo oficial del Registro Civil
   * (módulo 10 con coeficientes 2,1,2,1,2,1,2,1,2).
   */
  function cedulaValida(valor) {
    const c = String(valor).trim();
    if (!/^\d{10}$/.test(c)) return false;

    const provincia = parseInt(c.slice(0, 2), 10);
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;

    const tercer = parseInt(c[2], 10);
    if (tercer > 5) return false; // 6 y 7 no se emiten; 8 y 9 son otros tipos

    const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let p = parseInt(c[i], 10) * coef[i];
      if (p > 9) p -= 9;
      suma += p;
    }
    const verificador = (10 - (suma % 10)) % 10;
    return verificador === parseInt(c[9], 10);
  }

  /** RUC: 13 dígitos. Persona natural = cédula + 001. */
  function rucValido(valor) {
    const r = String(valor).trim();
    if (!/^\d{13}$/.test(r)) return false;
    const provincia = parseInt(r.slice(0, 2), 10);
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;
    const tercer = parseInt(r[2], 10);
    // Persona natural: validamos los primeros 10 como cédula
    if (tercer < 6) return cedulaValida(r.slice(0, 10)) && r.slice(10) === '001';
    // Sociedad privada (9) o pública (6): aceptamos si termina en 001 / 0001
    if (tercer === 9) return r.slice(10) === '001';
    if (tercer === 6) return true;
    return false;
  }

  function identificacionValida(valor) {
    const v = String(valor).replace(/\D/g, '');
    if (v.length === 10) return cedulaValida(v);
    if (v.length === 13) return rucValido(v);
    return false;
  }

  /** Celular ecuatoriano: 10 dígitos empezando en 09 */
  function celularValido(valor) {
    const t = String(valor).replace(/\D/g, '');
    return /^09\d{8}$/.test(t);
  }

  function emailValido(valor) {
    const v = String(valor).trim();
    if (!v) return true; // es opcional
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);
  }

  /* =======================================================================
     2. REGLAS DEL FORMULARIO
     ======================================================================= */
  const REGLAS = {
    nombre: {
      valida: (v) => v.trim().length >= 2 && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/.test(v.trim()),
      error: 'Escribe tu nombre (solo letras).',
    },
    apellido: {
      valida: (v) => v.trim().length >= 2 && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/.test(v.trim()),
      error: 'Escribe tus apellidos (solo letras).',
    },
    cedula: {
      valida: identificacionValida,
      error: 'Cédula o RUC no válido. Revisa los dígitos.',
    },
    telefono: {
      valida: celularValido,
      error: 'Debe ser un celular de 10 dígitos que empiece con 09.',
    },
    email: {
      valida: emailValido,
      error: 'Ese correo no parece válido.',
    },
    provincia: {
      valida: (v) => CONFIG.provincias.indexOf(v) !== -1,
      error: 'Selecciona tu provincia.',
    },
    ciudad: {
      valida: (v) => v.trim().length >= 3,
      error: 'Escribe tu ciudad.',
    },
    direccion: {
      valida: (v) => v.trim().length >= 10,
      error: 'Danos una dirección más completa para poder llegar.',
    },
  };

  function contenedorCampo(nombre) {
    return document.querySelector('[data-campo="' + nombre + '"]');
  }

  function marcarError(nombre, mensaje) {
    const cont = contenedorCampo(nombre);
    if (!cont) return;
    cont.classList.remove('campo--ok');
    cont.classList.add('campo--error');
    const span = $('.campo__error', cont);
    if (span) span.textContent = mensaje;
    const input = $('input, select, textarea', cont);
    if (input) input.setAttribute('aria-invalid', 'true');
  }

  function marcarOk(nombre) {
    const cont = contenedorCampo(nombre);
    if (!cont) return;
    cont.classList.remove('campo--error');
    const input = $('input, select, textarea', cont);
    if (input) {
      input.removeAttribute('aria-invalid');
      if (input.value.trim()) cont.classList.add('campo--ok');
      else cont.classList.remove('campo--ok');
    }
  }

  function validarCampo(nombre) {
    const regla = REGLAS[nombre];
    if (!regla) return true;
    const cont = contenedorCampo(nombre);
    if (!cont) return true;
    const input = $('input, select, textarea', cont);
    if (!input) return true;

    const ok = regla.valida(input.value);
    if (ok) marcarOk(nombre);
    else marcarError(nombre, regla.error);
    return ok;
  }

  function validarTodo() {
    let ok = true;
    let primerError = null;
    Object.keys(REGLAS).forEach((nombre) => {
      const bien = validarCampo(nombre);
      if (!bien && ok) {
        ok = false;
        primerError = nombre;
      }
    });

    // El método de pago siempre está preseleccionado, pero validamos por seguridad
    if (!CONFIG.pagos[metodoElegido]) {
      marcarError('pago', 'Elige cómo quieres pagar.');
      ok = false;
      if (!primerError) primerError = 'pago';
    } else {
      marcarOk('pago');
    }

    if (primerError) {
      const cont = contenedorCampo(primerError);
      if (cont) {
        cont.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = $('input, select, textarea', cont);
        if (input) setTimeout(() => input.focus({ preventScroll: true }), 320);
      }
    }
    return ok;
  }

  /* =======================================================================
     3. PROVINCIAS Y FORMATEO DE ENTRADAS
     ======================================================================= */
  function llenarProvincias() {
    const sel = document.getElementById('provincia');
    if (!sel) return;
    CONFIG.provincias.forEach((p) => {
      const o = document.createElement('option');
      o.value = p;
      o.textContent = p;
      sel.appendChild(o);
    });

    sel.addEventListener('change', () => {
      validarCampo('provincia');
      actualizarNotaEnvio();
    });
  }

  function actualizarNotaEnvio() {
    const nota = document.getElementById('notaEnvio');
    const sel = document.getElementById('provincia');
    if (!nota) return;
    const p = sel ? sel.value : '';
    if (!p) {
      nota.innerHTML =
        '<span class="ico" aria-hidden="true">' + ICO.camion + '</span> <strong>' +
        esc(CONFIG.envio.textoGratis) +
        '</strong>. Elige tu provincia para ver el tiempo de entrega.';
      return;
    }
    const rapida = CONFIG.provinciasRapidas.indexOf(p) !== -1;
    nota.innerHTML =
      '<span class="ico" aria-hidden="true">' + ICO.camion + '</span> Envío <strong>gratis</strong> a ' +
      esc(p) +
      ' · Entrega estimada en <strong>' +
      esc(rapida ? CONFIG.envio.tiempoCiudadesPrincipales : CONFIG.envio.tiempoResto) +
      '</strong>.';
  }

  function activarFormateo() {
    // Cédula y teléfono: solo números
    ['cedula', 'telefono'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const limpio = el.value.replace(/\D/g, '');
        if (el.value !== limpio) el.value = limpio;
      });
    });

    // Nombres: capitaliza al salir del campo
    ['nombre', 'apellido', 'ciudad'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('blur', () => {
        el.value = el.value
          .trim()
          .toLowerCase()
          .replace(/(^|\s|')([a-záéíóúüñ])/g, (m, a, b) => a + b.toUpperCase());
      });
    });

    // Validación al salir de cada campo
    Object.keys(REGLAS).forEach((nombre) => {
      const cont = contenedorCampo(nombre);
      if (!cont) return;
      const input = $('input, select, textarea', cont);
      if (!input) return;
      input.addEventListener('blur', () => validarCampo(nombre));
      // Al corregir, quitamos el error en vivo
      input.addEventListener('input', () => {
        if (cont.classList.contains('campo--error')) validarCampo(nombre);
      });
    });
  }

  /* =======================================================================
     4. OPCIONES DE PAGO
     ======================================================================= */
  function pintarOpcionesPago() {
    const cont = document.getElementById('opcionesPago');
    if (!cont) return;

    const orden = ['contraentrega', 'transferencia'];

    cont.innerHTML = orden
      .map((id) => {
        const m = CONFIG.pagos[id];
        const activo = id === metodoElegido;
        const esTransferencia = id === 'transferencia';

        const ventajas =
          '<ul class="ventajas">' +
          m.ventajas.map((v) => '<li>' + ICO.check + '<span>' + esc(v) + '</span></li>').join('') +
          '</ul>';

        let extra = '';

        if (esTransferencia) {
          extra =
            m.cuentas
              .map(
                (c) =>
                  '<div class="banco">' +
                  '<p class="banco__nombre"><span class="ico" aria-hidden="true">' +
                  ICO.banco +
                  '</span> ' +
                  esc(c.banco) +
                  '</p>' +
                  '<dl>' +
                  '<div class="banco__fila"><dt>Tipo</dt><dd>' + esc(c.tipo) + '</dd></div>' +
                  '<div class="banco__fila"><dt>Número</dt><dd>' + esc(c.numero) + '</dd></div>' +
                  '<div class="banco__fila"><dt>Titular</dt><dd>' + esc(c.titular) + '</dd></div>' +
                  '<div class="banco__fila"><dt>Identificación</dt><dd>' + esc(c.identificacion) + '</dd></div>' +
                  '<div class="banco__fila"><dt>Correo</dt><dd>' + esc(c.correo) + '</dd></div>' +
                  '</dl>' +
                  '<button type="button" class="copiar" data-copiar="' +
                  esc(c.numero) +
                  '">' +
                  ICO.copiar +
                  'Copiar número de cuenta</button>' +
                  '</div>'
              )
              .join('') +
            '<div class="aviso"><span class="ico ico--grande" aria-hidden="true">' + ICO.camara + '</span><span>' +
            'Después de confirmar el pedido te abrimos WhatsApp automáticamente. ' +
            '<strong>Envíanos la foto del comprobante</strong> y despachamos tu cepillo el mismo día. ' +
            'Tienes 24 horas para hacer la transferencia; si no, liberamos el stock.' +
            '</span></div>';
        } else {
          extra =
            '<div class="aviso"><span class="ico ico--grande" aria-hidden="true">' + ICO.manos + '</span><span>' +
            'El mensajero llega a tu dirección, revisas el producto y <strong>ahí pagas en efectivo</strong>. ' +
            'Ten listo el monto exacto para agilizar la entrega. Si no te gusta, no lo recibes y no pagas nada.' +
            '</span></div>';
        }

        return (
          '<label class="opcion-pago' +
          (activo ? ' opcion-pago--activa' : '') +
          '" data-metodo="' +
          id +
          '">' +
          '<input type="radio" name="metodoPago" value="' +
          id +
          '"' +
          (activo ? ' checked' : '') +
          '>' +
          '<span class="opcion-pago__cabecera">' +
          '<span class="opcion-pago__radio" aria-hidden="true"></span>' +
          '<span class="opcion-pago__icono" aria-hidden="true">' +
          (ICO[m.icono] || '') +
          '</span>' +
          '<span class="opcion-pago__info">' +
          '<span class="opcion-pago__nombre">' +
          esc(m.nombre) +
          '<span class="opcion-pago__insignia' +
          (m.descuento > 0 ? '' : ' opcion-pago__insignia--neutra') +
          '">' +
          esc(m.etiqueta) +
          '</span>' +
          '</span>' +
          '<span class="opcion-pago__resumen">' +
          esc(m.resumen) +
          '</span>' +
          '</span>' +
          '</span>' +
          '<span class="opcion-pago__detalle"><div><span class="opcion-pago__interior">' +
          ventajas +
          extra +
          '</span></div></span>' +
          '</label>'
        );
      })
      .join('');

    cont.addEventListener('change', (e) => {
      const input = e.target.closest('input[name="metodoPago"]');
      if (!input) return;
      metodoElegido = input.value;
      $$('.opcion-pago', cont).forEach((l) =>
        l.classList.toggle('opcion-pago--activa', l.getAttribute('data-metodo') === metodoElegido)
      );
      pintarTotales();
      marcarOk('pago');
    });
  }

  /* =======================================================================
     5. RESUMEN Y TOTALES
     ======================================================================= */
  function pintarResumen() {
    const cont = document.getElementById('resumenLineas');
    if (!cont) return;
    const lineas = Carrito.lineas();

    cont.innerHTML = lineas
      .map(
        (l) =>
          '<div class="resumen__linea">' +
          '<div class="resumen__foto"><img src="' +
          esc(l.imagen) +
          '" alt="" width="54" height="54" loading="lazy"></div>' +
          '<div>' +
          '<p class="resumen__nombre">' +
          esc(l.nombre) +
          '</p>' +
          '<p class="resumen__cant">' +
          (l.variante ? esc(l.variante) + ' · ' : '') +
          'Cantidad: ' +
          l.cantidad +
          '</p>' +
          '</div>' +
          '<span class="resumen__precio">' +
          dinero(l.precio * l.cantidad) +
          '</span>' +
          '</div>'
      )
      .join('');
  }

  function pintarTotales() {
    const cont = document.getElementById('resumenTotales');
    if (!cont) return;
    const t = Carrito.totales(metodoElegido);

    let html = '';

    // Desglose que cuadra: precio de lista − oferta = subtotal
    if (t.ahorroLista > 0) {
      const pct = Math.round((t.ahorroLista / t.precioLista) * 100);
      html +=
        '<div class="totales__fila"><span>Precio de lista</span>' +
        '<span style="text-decoration:line-through;color:var(--gris-500)">' +
        dinero(t.precioLista) +
        '</span></div>' +
        '<div class="totales__fila totales__fila--descuento"><span>Oferta de lanzamiento (' +
        pct +
        ' %)</span><span>−' +
        dinero(t.ahorroLista) +
        '</span></div>';
    }

    html +=
      '<div class="totales__fila"><span>Subtotal</span><strong>' +
      dinero(t.subtotal) +
      '</strong></div>';

    if (t.descuento > 0) {
      html +=
        '<div class="totales__fila totales__fila--descuento"><span>Descuento por transferencia (5 %)</span><span>−' +
        dinero(t.descuento) +
        '</span></div>';
    }

    if (t.recargo > 0) {
      html +=
        '<div class="totales__fila"><span>Recargo por contra entrega</span><span>+' +
        dinero(t.recargo) +
        '</span></div>';
    }

    html +=
      '<div class="totales__fila"><span>Envío</span><span class="totales__envio-gratis">' +
      (t.envio === 0 ? 'GRATIS' : dinero(t.envio)) +
      '</span></div>';

    html +=
      '<div class="totales__fila totales__fila--total"><span>Total a pagar</span><span>' +
      dinero(t.total) +
      '</span></div>';

    cont.innerHTML = html;

    // Texto bajo el botón según el método
    const nota = document.getElementById('notaBoton');
    if (nota) {
      nota.innerHTML =
        metodoElegido === 'transferencia'
          ? '<span class="ico" aria-hidden="true">' + ICO.banco +
            '</span> Te enviamos los datos bancarios por WhatsApp al confirmar'
          : '<span class="ico" aria-hidden="true">' + ICO.billete +
            '</span> No pagas nada ahora · Pagas ' + dinero(t.total) + ' al recibir';
    }

    // Texto del botón
    const btn = document.getElementById('btnConfirmar');
    if (btn) {
      btn.innerHTML =
        metodoElegido === 'transferencia'
          ? 'CONFIRMAR Y PAGAR ' + dinero(t.total)
          : 'CONFIRMAR PEDIDO · ' + dinero(t.total);
    }
  }

  /* =======================================================================
     6. NÚMERO DE PEDIDO
     ======================================================================= */
  function generarNumeroPedido() {
    const d = new Date();
    const ymd =
      String(d.getFullYear()).slice(2) +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
    const azar = Math.floor(Math.random() * 9000) + 1000;
    return 'LP-' + ymd + '-' + azar;
  }

  /* =======================================================================
     7. MENSAJE DE WHATSAPP
     ======================================================================= */
  function construirMensaje(pedido) {
    const L = [];
    L.push('*NUEVO PEDIDO ' + pedido.numero + '*');
    L.push('_Tienda ' + CONFIG.tienda.nombre + '_');
    L.push('');
    L.push('*PRODUCTOS*');
    pedido.lineas.forEach((l) => {
      L.push(
        '• ' +
          l.cantidad +
          ' x ' +
          l.nombre +
          (l.variante ? ' (' + l.variante + ')' : '') +
          ' — ' +
          dinero(l.precio * l.cantidad)
      );
    });
    L.push('');
    L.push('*TOTALES*');
    L.push('Subtotal: ' + dinero(pedido.totales.subtotal));
    if (pedido.totales.descuento > 0) {
      L.push('Descuento transferencia (5%): -' + dinero(pedido.totales.descuento));
    }
    if (pedido.totales.recargo > 0) {
      L.push('Recargo contra entrega: +' + dinero(pedido.totales.recargo));
    }
    L.push('Envío: ' + (pedido.totales.envio === 0 ? 'GRATIS' : dinero(pedido.totales.envio)));
    L.push('*TOTAL: ' + dinero(pedido.totales.total) + ' USD*');
    L.push('');
    L.push('*FORMA DE PAGO*');
    L.push(pedido.metodo.nombre);
    if (pedido.metodo.id === 'transferencia') {
      L.push('(Enviaré el comprobante por aquí)');
    } else {
      L.push('(Pago en efectivo al recibir)');
    }
    L.push('');
    L.push('*DATOS DE ENTREGA*');
    L.push('Nombre: ' + pedido.cliente.nombre + ' ' + pedido.cliente.apellido);
    L.push('Cédula/RUC: ' + pedido.cliente.cedula);
    L.push('Celular: ' + pedido.cliente.telefono);
    if (pedido.cliente.email) L.push('Correo: ' + pedido.cliente.email);
    L.push('Provincia: ' + pedido.cliente.provincia);
    L.push('Ciudad: ' + pedido.cliente.ciudad);
    L.push('Dirección: ' + pedido.cliente.direccion);
    if (pedido.cliente.referencia) L.push('Referencia: ' + pedido.cliente.referencia);
    if (pedido.cliente.notas) {
      L.push('');
      L.push('*NOTAS*');
      L.push(pedido.cliente.notas);
    }
    L.push('');
    L.push('Entrega estimada: ' + pedido.entrega);
    return L.join('\n');
  }

  /* =======================================================================
     8. ENVIAR EL PEDIDO
     ======================================================================= */
  function recoger(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function enviarPedido() {
    if (Carrito.vacio()) {
      aviso('Tu carrito está vacío', 'error');
      return;
    }

    if (!validarTodo()) {
      aviso('Revisa los campos marcados en rojo', 'error');
      return;
    }

    const metodo = CONFIG.pagos[metodoElegido];
    const provincia = recoger('provincia');
    const rapida = CONFIG.provinciasRapidas.indexOf(provincia) !== -1;

    const pedido = {
      numero: generarNumeroPedido(),
      fecha: new Date().toISOString(),
      lineas: Carrito.lineas(),
      totales: Carrito.totales(metodoElegido),
      metodo: { id: metodo.id, nombre: metodo.nombre },
      entrega: rapida ? CONFIG.envio.tiempoCiudadesPrincipales : CONFIG.envio.tiempoResto,
      cliente: {
        nombre: recoger('nombre'),
        apellido: recoger('apellido'),
        cedula: recoger('cedula'),
        telefono: recoger('telefono'),
        email: recoger('email'),
        provincia: provincia,
        ciudad: recoger('ciudad'),
        direccion: recoger('direccion'),
        referencia: recoger('referencia'),
        notas: recoger('notas'),
      },
    };

    pedido.mensajeWa = construirMensaje(pedido);

    // Guardamos el pedido para la página de gracias y el historial
    try {
      localStorage.setItem('lisapro_pedido_actual', JSON.stringify(pedido));
      const hist = JSON.parse(localStorage.getItem('lisapro_pedidos') || '[]');
      hist.unshift({
        numero: pedido.numero,
        fecha: pedido.fecha,
        total: pedido.totales.total,
        metodo: pedido.metodo.nombre,
      });
      localStorage.setItem('lisapro_pedidos', JSON.stringify(hist.slice(0, 20)));
    } catch (e) {
      /* si no hay almacenamiento seguimos igual: el mensaje va por WhatsApp */
    }

    const btn = document.getElementById('btnConfirmar');
    if (btn) {
      btn.setAttribute('aria-disabled', 'true');
      btn.innerHTML = 'ENVIANDO TU PEDIDO…';
    }

    // Abrimos WhatsApp con el pedido ya escrito.
    // Se ejecuta dentro del clic del usuario, así el navegador no lo bloquea.
    const url = enlaceWa(pedido.mensajeWa);
    window.open(url, '_blank', 'noopener');

    // Vaciamos el carrito y pasamos a la confirmación
    Carrito.vaciar();
    setTimeout(() => {
      window.location.href = 'gracias.html';
    }, 500);
  }

  /* =======================================================================
     9. CARRITO VACÍO
     ======================================================================= */
  function revisarCarrito() {
    const vacio = document.getElementById('carritoVacio');
    const contenido = document.getElementById('checkoutContenido');
    if (!vacio || !contenido) return;
    const estaVacio = Carrito.vacio();
    vacio.hidden = !estaVacio;
    contenido.hidden = estaVacio;
  }

  /* =======================================================================
     10. ARRANQUE
     ======================================================================= */
  function iniciar() {
    // Iconos y enlaces
    $$('[data-icono-carrito]').forEach((el) => (el.innerHTML = ICO.carrito));
    $$('[data-ico]').forEach((el) => {
      const n = el.getAttribute('data-ico');
      if (ICO[n]) el.innerHTML = ICO[n];
    });

    const wa = enlaceWa();
    ['waCabecera', 'waFlotante'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.href = wa;
        el.innerHTML = ICO.whatsapp;
      }
    });

    const anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();
    const num = document.getElementById('numeroPie');
    if (num) num.textContent = CONFIG.whatsapp.numeroBonito;

    llenarProvincias();
    actualizarNotaEnvio();
    activarFormateo();
    pintarOpcionesPago();
    pintarResumen();
    pintarTotales();
    revisarCarrito();

    const form = document.getElementById('formPedido');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        enviarPedido();
      });
    }

    const btn = document.getElementById('btnConfirmar');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        enviarPedido();
      });
    }

    // Si cambia el carrito desde el cajón, refrescamos el resumen
    document.addEventListener('carrito:cambio', () => {
      pintarResumen();
      pintarTotales();
      revisarCarrito();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
