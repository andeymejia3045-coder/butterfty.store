/* Pruebas de la página de confirmación */
(() => {
  const R = [];
  const ok = (n, c, extra) => R.push({ prueba: n, pasa: !!c, detalle: extra || '' });
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const txt = document.body.textContent;

  const pedido = JSON.parse(localStorage.getItem(CONFIG.tienda.prefijoDatos + '_pedido_actual') || 'null');

  ok('Se muestra el bloque del pedido', $('#conPedido').hidden === false);
  ok('El bloque "sin pedido" está oculto', $('#sinPedido').hidden === true);
  ok('Saluda al cliente por su nombre',
     $('#nombreCliente').textContent === 'María José', $('#nombreCliente').textContent);
  ok('Muestra el número de pedido',
     !!pedido && $('#numeroPedido').textContent === pedido.numero);
  ok('Muestra el total 28.49', txt.includes('28.49'));

  /* Como el pedido fue por transferencia */
  ok('Muestra los datos bancarios', $$('#tarjetaPago .banco').length === CONFIG.pagos.transferencia.cuentas.length);
  ok('Muestra el número de cuenta real',
     $('#tarjetaPago').textContent.includes(CONFIG.pagos.transferencia.cuentas[0].numero));
  ok('Muestra el titular real',
     $('#tarjetaPago').textContent.includes(CONFIG.pagos.transferencia.cuentas[0].titular));
  ok('Pide poner el número de pedido en el detalle',
     $('#tarjetaPago').textContent.includes('escribe tu número de pedido'));
  ok('Avisa del plazo de 24 horas', $('#tarjetaPago').textContent.includes('24 horas'));
  ok('Hay botón para copiar cada cuenta', $$('#tarjetaPago .copiar').length === CONFIG.pagos.transferencia.cuentas.length);
  ok('Hay 4 pasos siguientes', $$('.paso-sig').length === 4);
  ok('El primer paso es hacer la transferencia',
     $('.paso-sig__titulo').textContent.includes('transferencia'));

  ok('Muestra el resumen del producto',
     $('#resumenLineas').textContent.includes(CONFIG.producto.nombre));
  ok('El desglose incluye el precio de lista',
     $('#resumenTotales').textContent.includes('50.00'));
  ok('El desglose incluye el descuento por transferencia',
     $('#resumenTotales').textContent.includes('1.50'));

  ok('Muestra la dirección de entrega',
     $('#datosEntrega').textContent.includes('Av. Francisco de Orellana 123'));
  ok('Muestra la cédula', $('#datosEntrega').textContent.includes('0926687856'));
  ok('Muestra la provincia', $('#datosEntrega').textContent.includes('Guayas'));
  ok('Muestra la entrega estimada',
     $('#datosEntrega').textContent.includes('24 a 48 horas'));

  const waHref = $('#btnWa').getAttribute('href');
  ok('El botón de WhatsApp apunta al 593960702682',
     waHref.indexOf('https://wa.me/593960702682?text=') === 0, waHref.slice(0, 45));
  ok('El botón de WhatsApp lleva el pedido completo',
     decodeURIComponent(waHref.split('?text=')[1]).includes(pedido.numero));
  ok('El botón pide enviar el comprobante',
     $('#btnWa').textContent.includes('COMPROBANTE'));
  ok('Hay botón para imprimir el comprobante', !!$('#btnImprimir'));
  ok('Hay enlace para volver a la tienda',
     !!Array.from($$('a')).find((a) => a.getAttribute('href') === 'index.html'));

  const fallan = R.filter((r) => !r.pasa);
  return JSON.stringify({
    total: R.length,
    pasaron: R.length - fallan.length,
    fallaron: fallan.length,
    fallos: fallan,
  }, null, 1);
})()
