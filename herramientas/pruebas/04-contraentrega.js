/* Flujo completo de PAGO CONTRA ENTREGA, con un pack de 3 unidades
   y una provincia de entrega lenta, ejecutado desde la landing. */
(() => {
  const R = [];
  const ok = (n, c, extra) => R.push({ prueba: n, pasa: !!c, detalle: extra || '' });

  localStorage.removeItem(CONFIG.tienda.prefijoDatos + '_pedido_actual');
  Tienda.Carrito.vaciar();

  const RED = (n) => Tienda.redondear(n);
  const P1 = CONFIG.packs.find(p => p.id === 'pack-1').precio;
  const P3 = CONFIG.packs.find(p => p.id === 'pack-3').precio;
  const ANTES = CONFIG.producto.precioAntes;
  const DTO = CONFIG.pagos.transferencia.descuento;

  /* --- Elegimos el pack de 3 y lo añadimos --- */
  const radio = document.querySelector('input[value="pack-3"]');
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));
  document.getElementById('btnAgregar').click();

  ok('El pack de 3 entra al carrito con su precio',
     Tienda.Carrito.subtotal() === P3, String(Tienda.Carrito.subtotal()));

  /* --- Simulamos el checkout usando el mismo motor de totales --- */
  const t = Tienda.Carrito.totales('contraentrega');
  ok('Contra entrega: el precio de lista son 3 unidades sin oferta',
     t.precioLista === RED(ANTES * 3), String(t.precioLista));
  ok('Contra entrega: el ahorro es la diferencia con el precio de lista',
     t.ahorroLista === RED(ANTES * 3 - P3), String(t.ahorroLista));
  ok('Contra entrega: el desglose cuadra',
     Tienda.redondear(t.precioLista - t.ahorroLista) === t.subtotal,
     t.precioLista + ' - ' + t.ahorroLista + ' = ' + t.subtotal);
  ok('Contra entrega: sin recargo', t.recargo === 0);
  ok('Contra entrega: sin descuento adicional', t.descuento === 0);
  ok('Contra entrega: envío gratis', t.envio === 0);
  ok('Contra entrega: total = subtotal', t.total === P3, String(t.total));

  /* --- Comparamos con transferencia sobre el mismo carrito --- */
  const tt = Tienda.Carrito.totales('transferencia');
  ok('Transferencia sobre el pack de 3: descuento del 5 %',
     tt.descuento === RED(P3 * DTO), String(tt.descuento));
  ok('Transferencia sobre el pack de 3: total con descuento',
     tt.total === RED(P3 - RED(P3 * DTO)), String(tt.total));
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
  ok('El pack de 1 cuesta el precio unitario', Tienda.Carrito.subtotal() === P1);
  ok('Pack de 1 dice "Unidad"',
     Tienda.Carrito.lineas()[0].variante === 'Unidad');

  const t1 = Tienda.Carrito.totales('contraentrega');
  ok('1 unidad contra entrega: paga el precio completo', t1.total === P1);
  const t1t = Tienda.Carrito.totales('transferencia');
  ok('1 unidad transferencia: paga con el 5 % menos',
     t1t.total === RED(P1 - RED(P1 * DTO)), String(t1t.total));

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
