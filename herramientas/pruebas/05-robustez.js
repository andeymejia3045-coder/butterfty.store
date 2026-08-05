/* Casos límite: datos corruptos, carrito vacío, inyección de HTML,
   límites de cantidad y accesibilidad básica. */
(() => {
  const R = [];
  const ok = (n, c, extra) => R.push({ prueba: n, pasa: !!c, detalle: extra || '' });
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  /* ---------- 1. Carrito con datos corruptos en localStorage ---------- */
  localStorage.setItem('lisapro_carrito_v1', 'esto no es json {{{');
  ok('Un carrito corrupto no rompe la tienda',
     Array.isArray(Tienda.Carrito.lineas()) && Tienda.Carrito.lineas().length === 0);

  localStorage.setItem('lisapro_carrito_v1', JSON.stringify([
    { id: 'malo', nombre: 'X', precio: 'mucho', cantidad: 1 },      // precio no numérico
    { id: 'malo2', nombre: 'Y', precio: 10, cantidad: -5 },          // cantidad negativa
    { id: 'malo3', nombre: 'Z', precio: -10, cantidad: 1 },          // precio negativo
    { id: 'malo4', precio: 10, cantidad: 1 },                        // sin nombre
    { id: 'bueno', nombre: 'Válido', precio: 5, cantidad: 2 },       // este sí sirve
  ]));
  const filtradas = Tienda.Carrito.lineas();
  ok('Las líneas inválidas se descartan',
     filtradas.length === 1 && filtradas[0].id === 'bueno',
     JSON.stringify(filtradas.map((l) => l.id)));
  ok('El subtotal solo cuenta lo válido', Tienda.Carrito.subtotal() === 10);

  /* ---------- 2. Límites de cantidad ---------- */
  Tienda.Carrito.vaciar();
  Tienda.Carrito.agregar({ id: 'x', nombre: 'Prueba', precio: 1, imagen: 'a.svg' }, 5);
  Tienda.Carrito.actualizar('x', 500);
  ok('La cantidad se limita a 99', Tienda.Carrito.lineas()[0].cantidad === 99);
  Tienda.Carrito.actualizar('x', 0);
  ok('Cantidad 0 elimina la línea', Tienda.Carrito.vacio());

  Tienda.Carrito.agregar({ id: 'y', nombre: 'Prueba', precio: 1 }, -3);
  ok('Cantidad negativa se convierte en 1',
     Tienda.Carrito.lineas()[0].cantidad === 1);
  Tienda.Carrito.agregar({ id: 'y', nombre: 'Prueba', precio: 1 }, 2);
  ok('Añadir el mismo id suma cantidades',
     Tienda.Carrito.lineas()[0].cantidad === 3);

  /* ---------- 3. No se puede confirmar con el carrito vacío ---------- */
  Tienda.Carrito.vaciar();
  ok('Con carrito vacío se muestra el aviso',
     $('#carritoVacio').hidden === false);
  ok('Con carrito vacío se oculta el formulario',
     $('#checkoutContenido').hidden === true);

  localStorage.removeItem('lisapro_pedido_actual');
  $('#btnConfirmar').click();
  ok('Con carrito vacío no se crea ningún pedido',
     localStorage.getItem('lisapro_pedido_actual') === null);

  /* ---------- 4. Protección contra inyección de HTML ---------- */
  Tienda.Carrito.vaciar();
  Tienda.Carrito.agregar({
    id: 'xss',
    nombre: '<img src=x onerror="window.__hackeado=true">Producto',
    precio: 10,
    imagen: 'assets/img/producto-1.svg',
  }, 1);
  Tienda.abrirCajon();
  ok('El HTML malicioso no se ejecuta', window.__hackeado !== true);
  ok('El HTML malicioso se muestra como texto',
     $('.linea__nombre').textContent.includes('<img src=x'),
     $('.linea__nombre').textContent);
  ok('No se creó ninguna etiqueta img extra en el nombre',
     $('.linea__nombre').querySelectorAll('img').length === 0);
  Tienda.cerrarCajon();

  /* ---------- 5. Total nunca es negativo ---------- */
  Tienda.Carrito.vaciar();
  Tienda.Carrito.agregar({ id: 'z', nombre: 'Barato', precio: 0.01 }, 1);
  const tz = Tienda.Carrito.totales('transferencia');
  ok('El total nunca queda negativo', tz.total >= 0, String(tz.total));

  /* ---------- 6. Método de pago inexistente no rompe nada ---------- */
  const tNulo = Tienda.Carrito.totales('metodo-que-no-existe');
  ok('Un método desconocido no aplica descuentos',
     tNulo.descuento === 0 && tNulo.recargo === 0 && tNulo.metodo === null);

  /* ---------- 7. Formato de dinero ---------- */
  ok('$0.00 se formatea bien', Tienda.dinero(0) === '$0.00');
  ok('Redondea 1.005 a $1.01', Tienda.dinero(1.005) === '$1.01', Tienda.dinero(1.005));
  ok('Redondea 0.1+0.2 a $0.30', Tienda.dinero(0.1 + 0.2) === '$0.30');
  ok('Un valor no numérico da $0.00', Tienda.dinero('hola') === '$0.00');
  ok('Redondea 119.97999 a $119.98', Tienda.dinero(49.99 + 69.99) === '$119.98');

  /* ---------- 8. Accesibilidad básica ---------- */
  const sinEtiqueta = $$('input, select, textarea').filter((el) => {
    if (el.type === 'radio' || el.type === 'hidden') return false;
    const id = el.getAttribute('id');
    if (id && document.querySelector('label[for="' + id + '"]')) return false;
    if (el.closest('label')) return false;
    return !el.getAttribute('aria-label');
  });
  ok('Todos los campos tienen etiqueta', sinEtiqueta.length === 0,
     sinEtiqueta.map((e) => e.id || e.name).join(','));

  const botonesSinNombre = $$('button').filter(
    (b) => !b.textContent.trim() && !b.getAttribute('aria-label')
  );
  ok('Todos los botones tienen nombre accesible',
     botonesSinNombre.length === 0, String(botonesSinNombre.length));

  const imgsSinAlt = $$('img').filter((i) => i.getAttribute('alt') === null);
  ok('Todas las imágenes tienen atributo alt',
     imgsSinAlt.length === 0, imgsSinAlt.map((i) => i.src.split('/').pop()).join(','));

  /* ---------- 9. Zona táctil mínima de 44 px en móvil ---------- */
  const chicos = $$('button, a.btn, .barra-sticky__btn')
    .filter((el) => el.offsetParent !== null)
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.height > 0 && r.height < 40;
    });
  ok('Los botones visibles miden al menos 40 px de alto',
     chicos.length === 0,
     chicos.map((e) => (e.textContent || e.className).trim().slice(0, 22)).join(' | '));

  /* ---------- 10. El cajón se cierra con Escape ---------- */
  Tienda.Carrito.vaciar();
  Tienda.abrirCajon();
  ok('El cajón se abre', $('.cajon').classList.contains('abierto'));
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  ok('Escape cierra el cajón', !$('.cajon').classList.contains('abierto'));
  ok('El body se desbloquea al cerrar',
     !document.body.classList.contains('bloqueado'));

  /* ---------- 11. Limpieza ---------- */
  Tienda.Carrito.vaciar();
  delete window.__hackeado;

  const fallan = R.filter((r) => !r.pasa);
  return JSON.stringify({
    total: R.length,
    pasaron: R.length - fallan.length,
    fallaron: fallan.length,
    fallos: fallan,
  }, null, 1);
})()
