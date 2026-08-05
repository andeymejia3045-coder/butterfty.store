/* Pruebas del checkout: validaciones, métodos de pago, totales y pedido */
(() => {
  const R = [];
  const ok = (n, c, extra) => R.push({ prueba: n, pasa: !!c, detalle: extra || '' });
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const escribir = (id, valor) => {
    const el = document.getElementById(id);
    el.value = valor;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
    return el;
  };
  const tieneError = (campo) =>
    document.querySelector('[data-campo="' + campo + '"]').classList.contains('campo--error');

  /* ---------- 1. El carrito llegó desde la landing ---------- */
  ok('El checkout ve el carrito', Tienda.Carrito.lineas().length === 1);
  ok('El resumen muestra el producto',
     $('#resumenLineas').textContent.includes('Cepillo Secador'));
  ok('El resumen muestra $29.99', $('#resumenTotales').textContent.includes('29.99'));
  ok('El bloque de carrito vacío está oculto', $('#carritoVacio').hidden === true);

  /* ---------- 2. Provincias cargadas ---------- */
  ok('24 provincias en el selector',
     $('#provincia').options.length === 25, // 24 + placeholder
     'opciones=' + $('#provincia').options.length);

  /* ---------- 3. Métodos de pago: solo los dos pedidos ---------- */
  ok('Exactamente 2 métodos de pago', $$('.opcion-pago').length === 2);
  ok('Contra entrega existe', !!$('[data-metodo="contraentrega"]'));
  ok('Transferencia existe', !!$('[data-metodo="transferencia"]'));
  ok('Contra entrega viene preseleccionado',
     $('input[value="contraentrega"]').checked);
  ok('No hay opción de tarjeta de crédito',
     !document.body.textContent.toLowerCase().includes('tarjeta de crédito') ||
     document.body.textContent.includes('No pedimos datos de tarjeta'));

  /* ---------- 4. VALIDACIÓN: cédula ecuatoriana ---------- */
  // Cédulas válidas reales (dígito verificador correcto)
  escribir('cedula', '0926687856');
  ok('Cédula válida 0926687856 aceptada', !tieneError('cedula'));
  escribir('cedula', '1710034065');
  ok('Cédula válida 1710034065 aceptada', !tieneError('cedula'));
  // Inválidas
  escribir('cedula', '0926687857');
  ok('Cédula con verificador errado rechazada', tieneError('cedula'));
  escribir('cedula', '9999999999');
  ok('Provincia 99 inexistente rechazada', tieneError('cedula'));
  escribir('cedula', '123');
  ok('Cédula demasiado corta rechazada', tieneError('cedula'));
  // RUC
  escribir('cedula', '0926687856001');
  ok('RUC de persona natural aceptado', !tieneError('cedula'));

  /* ---------- 5. VALIDACIÓN: celular ---------- */
  escribir('telefono', '0991234567');
  ok('Celular 0991234567 aceptado', !tieneError('telefono'));
  escribir('telefono', '0960702682');
  ok('Celular 0960702682 aceptado', !tieneError('telefono'));
  escribir('telefono', '0891234567');
  ok('Celular que no empieza en 09 rechazado', tieneError('telefono'));
  escribir('telefono', '099123456');
  ok('Celular de 9 dígitos rechazado', tieneError('telefono'));
  escribir('telefono', 'abcdefghij');
  ok('Las letras se filtran del celular',
     document.getElementById('telefono').value === '');

  /* ---------- 6. VALIDACIÓN: otros campos ---------- */
  escribir('nombre', 'A');
  ok('Nombre de 1 letra rechazado', tieneError('nombre'));
  escribir('nombre', 'María José');
  ok('Nombre con tilde y espacio aceptado', !tieneError('nombre'));
  ok('El nombre se capitaliza',
     document.getElementById('nombre').value === 'María José',
     document.getElementById('nombre').value);

  escribir('email', 'noesuncorreo');
  ok('Correo mal escrito rechazado', tieneError('email'));
  escribir('email', '');
  ok('Correo vacío aceptado (es opcional)', !tieneError('email'));

  escribir('direccion', 'Corta');
  ok('Dirección demasiado corta rechazada', tieneError('direccion'));

  /* ---------- 7. Enviar con formulario incompleto NO debe crear pedido ---------- */
  localStorage.removeItem(CONFIG.tienda.prefijoDatos + '_pedido_actual');
  let abierto = null;
  const openOriginal = window.open;
  window.open = (u) => { abierto = u; return null; };

  $('#btnConfirmar').click();
  ok('Con datos incompletos no se crea el pedido',
     localStorage.getItem(CONFIG.tienda.prefijoDatos + '_pedido_actual') === null);
  ok('Con datos incompletos no se abre WhatsApp', abierto === null);

  /* ---------- 8. Llenar el formulario correctamente ---------- */
  escribir('nombre', 'María José');
  escribir('apellido', 'González Pérez');
  escribir('cedula', '0926687856');
  escribir('telefono', '0991234567');
  escribir('email', 'maria@correo.com');
  const sel = document.getElementById('provincia');
  sel.value = 'Guayas';
  sel.dispatchEvent(new Event('change', { bubbles: true }));
  escribir('ciudad', 'Guayaquil');
  escribir('direccion', 'Av. Francisco de Orellana 123 y Calle Segunda, Alborada etapa 5');
  escribir('referencia', 'Casa esquinera de reja blanca');
  escribir('notas', 'Entregar en la tarde por favor');

  ok('Ningún campo queda en error',
     $$('.campo--error').length === 0,
     'en error: ' + $$('.campo--error').map(c => c.dataset.campo).join(','));
  ok('La nota de envío detecta Guayas como zona rápida',
     $('#notaEnvio').textContent.includes('24 a 48 horas'),
     $('#notaEnvio').textContent);

  /* ---------- 9. Totales con CONTRA ENTREGA ---------- */
  const rCE = document.querySelector('input[value="contraentrega"]');
  rCE.checked = true;
  rCE.dispatchEvent(new Event('change', { bubbles: true }));
  const txtCE = $('#resumenTotales').textContent;
  ok('Contra entrega: total $29.99', txtCE.includes('29.99'), txtCE.replace(/\s+/g, ' '));
  ok('Contra entrega: sin descuento del 5 %', !txtCE.includes('5 %'));
  ok('Contra entrega: envío GRATIS', txtCE.includes('GRATIS'));
  ok('Contra entrega: el botón muestra el total',
     $('#btnConfirmar').textContent.includes('29.99'), $('#btnConfirmar').textContent);
  ok('Contra entrega: la nota dice que no paga ahora',
     $('#notaBoton').textContent.includes('No pagas nada ahora'));
  ok('Contra entrega: se ve el aviso de pago al mensajero',
     $('[data-metodo="contraentrega"]').textContent.includes('ahí pagas en efectivo'));

  /* ---------- 10. Totales con TRANSFERENCIA ---------- */
  const rTR = document.querySelector('input[value="transferencia"]');
  rTR.checked = true;
  rTR.dispatchEvent(new Event('change', { bubbles: true }));
  const txtTR = $('#resumenTotales').textContent;
  ok('Transferencia: aparece el descuento del 5 %',
     txtTR.includes('5 %') && txtTR.includes('1.50'), txtTR.replace(/\s+/g, ' '));
  ok('Transferencia: total $28.49', txtTR.includes('28.49'));
  ok('Transferencia: el botón muestra 28.49',
     $('#btnConfirmar').textContent.includes('28.49'));
  ok('Transferencia: se muestran todas las cuentas bancarias',
     $$('[data-metodo="transferencia"] .banco').length === CONFIG.pagos.transferencia.cuentas.length &&
     CONFIG.pagos.transferencia.cuentas.length >= 1,
     'cuentas mostradas: ' + $$('[data-metodo="transferencia"] .banco').length);
  ok('Transferencia: cada cuenta tiene su botón de copiar',
     $$('[data-metodo="transferencia"] .copiar').length === CONFIG.pagos.transferencia.cuentas.length);
  ok('Transferencia: muestra el número de cuenta configurado',
     $('[data-metodo="transferencia"]').textContent
       .includes(CONFIG.pagos.transferencia.cuentas[0].numero),
     CONFIG.pagos.transferencia.cuentas[0].numero);
  ok('Transferencia: muestra el titular configurado',
     $('[data-metodo="transferencia"]').textContent
       .includes(CONFIG.pagos.transferencia.cuentas[0].titular));
  ok('Transferencia: pide el comprobante',
     $('[data-metodo="transferencia"]').textContent.includes('comprobante'));
  ok('Transferencia: la opción queda marcada visualmente',
     $('[data-metodo="transferencia"]').classList.contains('opcion-pago--activa'));

  /* ---------- 11. Confirmar el pedido (con transferencia) ---------- */
  $('#btnConfirmar').click();
  const pedido = JSON.parse(localStorage.getItem(CONFIG.tienda.prefijoDatos + '_pedido_actual') || 'null');

  ok('Se creó el pedido', !!pedido);
  ok('El número de pedido tiene formato LP-AAMMDD-XXXX',
     !!pedido && /^LP-\d{6}-\d{4}$/.test(pedido.numero), pedido && pedido.numero);
  ok('El pedido guarda el método transferencia',
     !!pedido && pedido.metodo.id === 'transferencia');
  ok('El pedido guarda el total 28.49',
     !!pedido && pedido.totales.total === 28.49, pedido && pedido.totales.total);
  ok('El pedido guarda el descuento 1.50',
     !!pedido && pedido.totales.descuento === 1.5, pedido && pedido.totales.descuento);
  ok('El pedido guarda los datos del cliente',
     !!pedido && pedido.cliente.nombre === 'María José' &&
     pedido.cliente.cedula === '0926687856' &&
     pedido.cliente.provincia === 'Guayas');
  ok('El pedido guarda la entrega estimada',
     !!pedido && pedido.entrega === '24 a 48 horas');

  /* ---------- 12. El enlace de WhatsApp ---------- */
  ok('Se abrió WhatsApp', typeof abierto === 'string', String(abierto).slice(0, 50));
  ok('WhatsApp usa el número 593960702682',
     typeof abierto === 'string' && abierto.indexOf('https://wa.me/593960702682?text=') === 0);

  const msg = typeof abierto === 'string'
    ? decodeURIComponent(abierto.split('?text=')[1] || '')
    : '';
  ok('El mensaje incluye el número de pedido',
     !!pedido && msg.includes(pedido.numero));
  ok('El mensaje incluye el producto', msg.includes('Cepillo Secador Voluminizador'));
  ok('El mensaje incluye el total', msg.includes('TOTAL: $28.49 USD'));
  ok('El mensaje incluye el método de pago', msg.includes('Transferencia o depósito'));
  ok('El mensaje incluye la dirección',
     msg.includes('Av. Francisco de Orellana 123'));
  ok('El mensaje incluye la cédula', msg.includes('0926687856'));
  ok('El mensaje incluye el celular', msg.includes('0991234567'));
  ok('El mensaje incluye las notas', msg.includes('Entregar en la tarde'));
  ok('El mensaje menciona el envío gratis', msg.includes('Envío: GRATIS'));

  /* ---------- 13. El carrito se vació tras el pedido ---------- */
  ok('El carrito quedó vacío después de confirmar', Tienda.Carrito.vacio());

  /* ---------- 14. Historial de pedidos ---------- */
  const hist = JSON.parse(localStorage.getItem(CONFIG.tienda.prefijoDatos + '_pedidos') || '[]');
  ok('El pedido se guardó en el historial',
     hist.length >= 1 && hist[0].numero === pedido.numero);

  window.open = openOriginal;

  const fallan = R.filter((r) => !r.pasa);
  return JSON.stringify({
    total: R.length,
    pasaron: R.length - fallan.length,
    fallaron: fallan.length,
    fallos: fallan,
    mensajeWa: msg,
  }, null, 1);
})()
