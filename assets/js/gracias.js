/* =========================================================================
   GRACIAS.JS — Página de confirmación del pedido
   ========================================================================= */

(function () {
  'use strict';

  const { ICO, dinero, esc, $, $$, enlaceWa } = window.Tienda;

  function leerPedido() {
    try {
      const raw = localStorage.getItem(CONFIG.tienda.prefijoDatos + '_pedido_actual');
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!p || !p.numero || !Array.isArray(p.lineas)) return null;
      return p;
    } catch (e) {
      return null;
    }
  }

  function fila(dt, dd) {
    return (
      '<div class="banco__fila" style="font-size:var(--t-sm);padding-block:6px">' +
      '<dt>' + esc(dt) + '</dt><dd>' + esc(dd) + '</dd></div>'
    );
  }

  function pintar(p) {
    const set = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    const esTransferencia = p.metodo.id === 'transferencia';

    set('iconoOk', ICO.check);
    set('nombreCliente', esc(p.cliente.nombre));
    set('numeroPedido', esc(p.numero));
    set('numeroPedido2', esc(p.numero));

    set(
      'mensajePrincipal',
      esTransferencia
        ? 'Tu pedido quedó reservado. Solo falta que hagas la transferencia y nos envíes el comprobante por WhatsApp para despacharlo hoy mismo.'
        : 'Tu pedido quedó registrado. Te escribiremos por WhatsApp para confirmar la dirección y coordinar la entrega. <strong>No pagas nada hasta que lo recibas.</strong>'
    );

    /* ------------------- Tarjeta según método de pago ------------------- */
    const tarjeta = document.getElementById('tarjetaPago');
    if (tarjeta) {
      if (esTransferencia) {
        const cuentas = CONFIG.pagos.transferencia.cuentas
          .map(
            (c) =>
              '<div class="banco">' +
              '<p class="banco__nombre"><span class="ico" aria-hidden="true">' + ICO.banco +
              '</span> ' + esc(c.banco) + '</p>' +
              '<dl>' +
              fila('Tipo', c.tipo) +
              fila('Número', c.numero) +
              fila('Titular', c.titular) +
              (c.identificacion ? fila('Identificación', c.identificacion) : '') +
              fila('Correo', c.correo) +
              '</dl>' +
              '<button type="button" class="copiar" data-copiar="' + esc(c.numero) + '">' +
              ICO.copiar +
              'Copiar número de cuenta</button>' +
              '</div>'
          )
          .join('');

        tarjeta.innerHTML =
          '<h2 class="tarjeta__titulo"><span class="ico" aria-hidden="true">' + ICO.banco +
          '</span> Datos para tu transferencia</h2>' +
          '<p class="tarjeta__nota">Transfiere exactamente <strong>' +
          dinero(p.totales.total) +
          '</strong> a cualquiera de estas cuentas.</p>' +
          cuentas +
          '<div class="aviso"><span class="ico ico--grande" aria-hidden="true">' + ICO.alerta + '</span><span>' +
          'Importante: en el detalle de la transferencia escribe tu número de pedido <strong>' +
          esc(p.numero) +
          '</strong>. Luego envíanos la foto del comprobante por WhatsApp. ' +
          'Tienes <strong>24 horas</strong> para completar el pago, después liberamos el stock.' +
          '</span></div>';
      } else {
        tarjeta.innerHTML =
          '<h2 class="tarjeta__titulo"><span class="ico" aria-hidden="true">' + ICO.billete +
          '</span> Pago contra entrega</h2>' +
          '<p class="tarjeta__nota">Prepara el efectivo para cuando llegue el mensajero.</p>' +
          '<div class="banco"><dl>' +
          fila('Monto a pagar al recibir', dinero(p.totales.total) + ' USD') +
          fila('Entrega estimada', p.entrega) +
          fila('Dirección', p.cliente.direccion) +
          '</dl></div>' +
          '<div class="aviso"><span class="ico ico--grande" aria-hidden="true">' + ICO.idea + '</span><span>' +
          'Ten listo el monto exacto (<strong>' +
          dinero(p.totales.total) +
          '</strong>) para agilizar la entrega. Puedes revisar el producto antes de pagar; ' +
          'si algo no te gusta, no lo recibes y no pagas nada.' +
          '</span></div>';
      }
    }

    /* ------------------------ Pasos siguientes ------------------------ */
    const pasos = esTransferencia
      ? [
          ['Haz la transferencia', 'Transfiere ' + dinero(p.totales.total) + ' a una de las cuentas de arriba.'],
          ['Envíanos el comprobante', 'Toca el botón verde y adjunta la foto en WhatsApp.'],
          ['Verificamos el pago', 'En pocos minutos te confirmamos por WhatsApp.'],
          ['Recibe tu cepillo', 'Sale con prioridad el mismo día. Entrega en ' + p.entrega + '.'],
        ]
      : [
          ['Te escribimos por WhatsApp', 'Confirmamos tu dirección y el horario que te queda mejor.'],
          ['Preparamos tu pedido', 'Lo empacamos y lo entregamos a la transportadora.'],
          ['Recibes y revisas', 'El mensajero llega en ' + p.entrega + '. Abre y revisa el producto.'],
          ['Pagas en efectivo', 'Recién ahí entregas los ' + dinero(p.totales.total) + '.'],
        ];

    set(
      'pasosSiguientes',
      pasos
        .map(
          (paso, i) =>
            '<div class="paso-sig">' +
            '<span class="paso-sig__num">' + (i + 1) + '</span>' +
            '<div><p class="paso-sig__titulo">' + esc(paso[0]) + '</p>' +
            '<p class="paso-sig__texto">' + esc(paso[1]) + '</p></div>' +
            '</div>'
        )
        .join('')
    );

    /* ---------------------------- Resumen ---------------------------- */
    set(
      'resumenLineas',
      p.lineas
        .map(
          (l) =>
            '<div class="resumen__linea">' +
            '<div class="resumen__foto"><img src="' + esc(l.imagen) + '" alt="" width="54" height="54"></div>' +
            '<div><p class="resumen__nombre">' + esc(l.nombre) + '</p>' +
            '<p class="resumen__cant">' +
            (l.variante ? esc(l.variante) + ' · ' : '') +
            'Cantidad: ' + l.cantidad + '</p></div>' +
            '<span class="resumen__precio">' + dinero(l.precio * l.cantidad) + '</span>' +
            '</div>'
        )
        .join('')
    );

    let tot = '';
    if (p.totales.ahorroLista > 0 && p.totales.precioLista) {
      tot +=
        '<div class="totales__fila"><span>Precio de lista</span>' +
        '<span style="text-decoration:line-through;color:var(--gris-500)">' +
        dinero(p.totales.precioLista) +
        '</span></div>' +
        '<div class="totales__fila totales__fila--descuento"><span>Oferta de lanzamiento</span><span>−' +
        dinero(p.totales.ahorroLista) +
        '</span></div>';
    }
    tot +=
      '<div class="totales__fila"><span>Subtotal</span><strong>' +
      dinero(p.totales.subtotal) +
      '</strong></div>';
    if (p.totales.descuento > 0) {
      tot +=
        '<div class="totales__fila totales__fila--descuento"><span>Descuento por transferencia (5 %)</span><span>−' +
        dinero(p.totales.descuento) +
        '</span></div>';
    }
    if (p.totales.recargo > 0) {
      tot +=
        '<div class="totales__fila"><span>Recargo contra entrega</span><span>+' +
        dinero(p.totales.recargo) +
        '</span></div>';
    }
    tot +=
      '<div class="totales__fila"><span>Envío</span><span class="totales__envio-gratis">' +
      (p.totales.envio === 0 ? 'GRATIS' : dinero(p.totales.envio)) +
      '</span></div>';
    tot +=
      '<div class="totales__fila"><span>Forma de pago</span><span>' +
      esc(p.metodo.nombre) +
      '</span></div>';
    tot +=
      '<div class="totales__fila totales__fila--total"><span>Total</span><span>' +
      dinero(p.totales.total) +
      '</span></div>';
    set('resumenTotales', tot);

    /* ------------------------- Datos de entrega ------------------------- */
    const c = p.cliente;
    let entrega =
      fila('Nombre', c.nombre + ' ' + c.apellido) +
      fila('Cédula / RUC', c.cedula) +
      fila('Celular', '0' + c.telefono.replace(/^0/, '')) +
      (c.email ? fila('Correo', c.email) : '') +
      fila('Provincia', c.provincia) +
      fila('Ciudad', c.ciudad) +
      fila('Dirección', c.direccion) +
      (c.referencia ? fila('Referencia', c.referencia) : '') +
      (c.notas ? fila('Notas', c.notas) : '') +
      fila('Entrega estimada', p.entrega);
    set('datosEntrega', entrega);

    /* --------------------------- Botón WhatsApp --------------------------- */
    const btnWa = document.getElementById('btnWa');
    if (btnWa) {
      const mensajeCompleto = p.mensajeWa || 'Hola, mi pedido es ' + p.numero;
      // El href visible solo lleva el número de pedido. Así la medición
      // automática de clics salientes nunca recibe datos personales.
      btnWa.href = enlaceWa('Hola, mi pedido es ' + p.numero);
      btnWa.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(enlaceWa(mensajeCompleto), '_blank', 'noopener');
      });
      const ico = document.getElementById('icoWa');
      if (ico) ico.innerHTML = ICO.whatsapp;
    }
    if (esTransferencia && btnWa) {
      btnWa.innerHTML = ICO.whatsapp + ' ENVIAR MI COMPROBANTE POR WHATSAPP';
    }
  }

  function iniciar() {
    // Iconos declarados en el HTML con data-ico
    $$('[data-ico]').forEach((el) => {
      const n = el.getAttribute('data-ico');
      if (ICO[n]) el.innerHTML = ICO[n];
    });

    // Cabecera y pie
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

    const pedido = leerPedido();
    const con = document.getElementById('conPedido');
    const sin = document.getElementById('sinPedido');

    if (!pedido) {
      if (sin) sin.hidden = false;
      if (con) con.hidden = true;
      return;
    }

    if (sin) sin.hidden = true;
    if (con) con.hidden = false;
    pintar(pedido);

    if (window.Analytics) {
      window.Analytics.once('purchase_' + pedido.numero, () => {
        window.Analytics.track('purchase', {
          transaction_id: pedido.numero,
          currency: 'USD',
          value: pedido.totales.total,
          shipping: pedido.totales.envio,
          payment_type: pedido.metodo.id,
          items: window.Analytics.itemsLineas(pedido.lineas),
        });
      });
    }

    const imprimir = document.getElementById('btnImprimir');
    if (imprimir) imprimir.addEventListener('click', () => window.print());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
