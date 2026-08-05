/* Flujo completo de PAGO CONTRA ENTREGA, con un pack de 3 unidades
   y una provincia de entrega lenta, ejecutado desde la landing. */
(() => {
  const R = [];
  const ok = (n, c, extra) => R.push({ prueba: n, pasa: !!c, detalle: extra || '' });

  localStorage.removeItem(CONFIG.tienda.prefijoDatos + '_pedido_actual');
  Tienda.Carrito.vaciar();

  /* --- Elegimos el pack de 3 y lo añadimos --- */
  const radio = document.querySelector('input[value="pack-3"]');
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));
  document.getElementById('btnAgregar').click();

  ok('Pack de 3 en el carrito por $69.99',
     Tienda.Carrito.subtotal() === 69.99, String(Tienda.Carrito.subtotal()));

  /* --- Simulamos el checkout usando el mismo motor de totales --- */
  const t = Tienda.Carrito.totales('contraentrega');
  ok('Contra entrega: precio de lista $150.00', t.precioLista === 150, String(t.precioLista));
  ok('Contra entrega: ahorro $80.01', t.ahorroLista === 80.01, String(t.ahorroLista));
  ok('Contra entrega: el desglose cuadra',
     Tienda.redondear(t.precioLista - t.ahorroLista) === t.subtotal,
     t.precioLista + ' - ' + t.ahorroLista + ' = ' + t.subtotal);
  ok('Contra entrega: sin recargo', t.recargo === 0);
  ok('Contra entrega: sin descuento adicional', t.descuento === 0);
  ok('Contra entrega: envío gratis', t.envio === 0);
  ok('Contra entrega: total = subtotal', t.total === 69.99, String(t.total));

  /* --- Comparamos con transferencia sobre el mismo carrito --- */
  const tt = Tienda.Carrito.totales('transferencia');
  ok('Transferencia sobre $69.99: descuento $3.50', tt.descuento === 3.5, String(tt.descuento));
  ok('Transferencia sobre $69.99: total $66.49', tt.total === 66.49, String(tt.total));
  ok('Transferencia siempre sale más barata que contra entrega', tt.total < t.total);

  /* --- Guardamos el carrito para que el checkout lo recoja --- */
  ok('El carrito persiste para el checkout',
     JSON.parse(localStorage.getItem(CONFIG.tienda.prefijoDatos + '_carrito_v1')).length === 1);

  /* --- Verificamos que el pack de 1 no dé precio de pack --- */
  Tienda.Carrito.vaciar();
  const radio1 = document.querySelector('input[value="pack-1"]');
  radio1.checked = true;
  radio1.dispatchEvent(new Event('change', { bubbles: true }));
  document.getElementById('btnAgregar').click();
  ok('Pack de 1 cuesta $29.99', Tienda.Carrito.subtotal() === 29.99);
  ok('Pack de 1 dice "Unidad"',
     Tienda.Carrito.lineas()[0].variante === 'Unidad');

  const t1 = Tienda.Carrito.totales('contraentrega');
  ok('1 unidad contra entrega: total $29.99', t1.total === 29.99);
  const t1t = Tienda.Carrito.totales('transferencia');
  ok('1 unidad transferencia: total $28.49', t1t.total === 28.49, String(t1t.total));

  /* --- El ahorro por unidad de cada pack es coherente --- */
  const unitarios = CONFIG.packs.map((p) => Tienda.redondear(p.precio / p.cantidad));
  ok('El precio por unidad baja al comprar más packs',
     unitarios[0] > unitarios[1] && unitarios[1] > unitarios[2],
     JSON.stringify(unitarios));

  const fallan = R.filter((r) => !r.pasa);
  return JSON.stringify({
    total: R.length,
    pasaron: R.length - fallan.length,
    fallaron: fallan.length,
    fallos: fallan,
  }, null, 1);
})()
