/* Pruebas de la landing: renderizado, galería, packs, carrito, cajón */
(() => {
  const R = [];
  const ok = (n, c, extra) => R.push({ prueba: n, pasa: !!c, detalle: extra || '' });
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  /* ---------- Limpieza para partir de cero ---------- */
  localStorage.removeItem(CONFIG.tienda.prefijoDatos + '_carrito_v1');
  localStorage.removeItem(CONFIG.tienda.prefijoDatos + '_pedido_actual');
  Tienda.Carrito.vaciar();

  /* Precios tomados de la configuración: si los cambias, las pruebas siguen
     valiendo sin tocar nada aquí. */
  const P1 = CONFIG.packs.find(p => p.id === 'pack-1').precio;
  const P2 = CONFIG.packs.find(p => p.id === 'pack-2').precio;
  const P3 = CONFIG.packs.find(p => p.id === 'pack-3').precio;
  const RED = (n) => Tienda.redondear(n);
  const DTO = CONFIG.pagos.transferencia.descuento;

  /* ---------- 1. Renderizado básico ---------- */
  ok('El título del producto coincide con la configuración',
     $('#tituloProducto').textContent === CONFIG.producto.nombre,
     $('#tituloProducto').textContent);
  ok('El título dice Cepillo, Secador y Aplanchador',
     /cepillo.*secador.*aplanchador/i.test(CONFIG.producto.nombre),
     CONFIG.producto.nombre);
  ok('Precio actual $29.99', $('#precioAhora').textContent.includes('29.99'));
  ok('Precio anterior $50.00', $('#precioAntes').textContent.includes('50.00'));
  ok('Descuento del 40 %', $('#insigniaAhorro').textContent === 'AHORRA UN 40%');
  ok('La galería tiene todas las imágenes configuradas',
     $$('.galeria__slide').length === CONFIG.producto.galeria.length,
     $$('.galeria__slide').length + ' de ' + CONFIG.producto.galeria.length);
  ok('Cada imagen externa tiene ilustración de respaldo',
     CONFIG.producto.galeria.filter(g => /^https?:/.test(g.src))
       .every(g => !!g.respaldo),
     'externas: ' + CONFIG.producto.galeria.filter(g => /^https?:/.test(g.src)).length);
  ok('3 packs disponibles', $$('.pack').length === 3);
  ok('Pack de 1 preseleccionado', $('input[value="pack-1"]').checked);
  ok('6 preguntas frecuentes', $$('#listaFaq .acordeon').length === 6);
  ok('Estadísticas presentes', $$('.stat').length === 3);
  ok('Datos estructurados válidos', (() => {
    try { JSON.parse($('#datosEstructurados').textContent); return true; } catch (e) { return false; }
  })());

  /* ---------- 2. Enlaces de WhatsApp con el número correcto ---------- */
  ok('El logo dice BUTTERFLY',
     $('.logo').textContent.replace(/\s/g, '') === 'BUTTERFLY', $('.logo').textContent);
  ok('El título de la pestaña dice Butterfly', document.title.includes('Butterfly'));
  ok('El pie muestra el correo de contacto real',
     $('#mailPie').textContent.includes('corpusenigma4@gmail.com'),
     $('#mailPie').textContent);
  ok('Ya no queda el nombre de la marca anterior en el texto visible',
     !document.body.textContent.includes('LISAPRO Ecuador'));

  /* ---------- Bloque de la asesora ---------- */
  ok('El bloque de la asesora aparece al inicio', !!$('.asesora'));
  ok('Está antes de la ficha del producto',
     !!$('.asesora') &&
     $('.asesora').compareDocumentPosition($('#tituloProducto')) & Node.DOCUMENT_POSITION_FOLLOWING);
  ok('Muestra el nombre de la asesora',
     $('.asesora').textContent.includes(CONFIG.asesora.nombre), CONFIG.asesora.nombre);
  ok('Pregunta si tiene dudas',
     $('.asesora__titulo').textContent.toLowerCase().includes('dudas'));
  ok('Tiene el ícono de WhatsApp', !!$('.asesora__btn svg'));
  ok('El botón lleva a tu WhatsApp',
     $('.asesora__btn').getAttribute('href')
       .indexOf('https://wa.me/' + CONFIG.whatsapp.numeroWa) === 0,
     $('.asesora__btn').getAttribute('href').slice(0, 40));
  ok('El mensaje ya viene escrito y nombra a la asesora',
     decodeURIComponent($('.asesora__btn').getAttribute('href').split('?text=')[1] || '')
       .includes(CONFIG.asesora.nombre));
  ok('Abre en una pestaña nueva sin perder la tienda',
     $('.asesora__btn').getAttribute('target') === '_blank' &&
     ($('.asesora__btn').getAttribute('rel') || '').includes('noopener'));
  ok('El punto de "en línea" está visible', !!$('.asesora__punto'));

  const waHref = $('#waFlotante').getAttribute('href');
  ok('WhatsApp apunta a 593960702682', waHref.indexOf('wa.me/593960702682') !== -1, waHref.slice(0, 60));

  /* ---------- 3. Acordeón de FAQ se abre ---------- */
  const btnFaq = $('#listaFaq .acordeon__boton');
  btnFaq.click();
  ok('El acordeón de FAQ se abre', btnFaq.getAttribute('aria-expanded') === 'true');
  btnFaq.click();
  ok('El acordeón de FAQ se cierra', btnFaq.getAttribute('aria-expanded') === 'false');

  /* ---------- 4. Galería: navegación ---------- */
  $('#galeriaNext').click();
  ok('La flecha siguiente cambia de imagen',
     $$('.galeria__punto')[1].classList.contains('activo'));
  $('#galeriaPrev').click();
  ok('La flecha anterior regresa',
     $$('.galeria__punto')[0].classList.contains('activo'));
  const minisGaleria = $$('.galeria__mini');
  const ultimaMini = minisGaleria[minisGaleria.length - 1];
  ultimaMini.click();
  ok('Las miniaturas saltan a su imagen',
     ultimaMini.classList.contains('activo'));

  /* ---------- 5. Elegir el pack de 2 y añadir al carrito ---------- */
  const radio2 = document.querySelector('input[value="pack-2"]');
  radio2.checked = true;
  radio2.dispatchEvent(new Event('change', { bubbles: true }));
  ok('El pack de 2 sigue disponible y se puede seleccionar',
     document.querySelector('[data-pack="pack-2"]').classList.contains('pack--activo'));

  $('#btnAgregar').click();
  const lineas1 = Tienda.Carrito.lineas();
  ok('El carrito tiene 1 línea', lineas1.length === 1, JSON.stringify(lineas1));
  ok('El precio de la línea es el del pack de 2', lineas1[0].precio === P2,
     'esperado ' + P2 + ', obtenido ' + lineas1[0].precio);
  ok('La variante dice Pack de 2 unidades', lineas1[0].variante === 'Pack de 2 unidades');
  ok('El subtotal coincide con el pack de 2', Tienda.Carrito.subtotal() === P2);

  // El botón principal ya no abre el cajón: lleva directo a los datos de
  // entrega. El cajón sigue disponible desde el ícono del carrito.
  ok('Comprar no abre el cajón, va directo al checkout',
     !$('.cajon').classList.contains('abierto'));
  document.querySelector('[data-abrir-cajon]').click();
  ok('El cajón se abre desde el ícono del carrito',
     $('.cajon').classList.contains('abierto'));
  ok('La barra fija muestra el nombre corto completo, sin cortarse',
     $('#stickyNombre').textContent === CONFIG.producto.nombreCorto &&
     $('#stickyNombre').scrollWidth <= $('#stickyNombre').clientWidth + 1,
     $('#stickyNombre').textContent + ' (' + $('#stickyNombre').scrollWidth +
     'px de ' + $('#stickyNombre').clientWidth + 'px)');

  ok('El contador del ícono muestra 1',
     $('[data-contador-carrito]').textContent === '1');
  ok('El cajón muestra el total del pack elegido',
     $('[data-cajon-pie]').textContent.includes(Tienda.dinero(P2)),
     Tienda.dinero(P2));
  ok('El cajón enlaza al checkout',
     !!$('[data-cajon-pie] a[href="checkout.html"]'));

  /* ---------- 6. Sumar y restar cantidad dentro del cajón ---------- */
  $('[data-mas]').click();
  ok('El botón + sube la cantidad a 2', Tienda.Carrito.lineas()[0].cantidad === 2);
  ok('El subtotal se duplica', Tienda.Carrito.subtotal() === RED(P2 * 2),
     'esperado ' + RED(P2 * 2));
  $('[data-menos]').click();
  ok('El botón − baja la cantidad a 1', Tienda.Carrito.lineas()[0].cantidad === 1);

  /* ---------- 7. Cerrar el cajón ---------- */
  $('.cajon [data-cerrar-cajon]').click();
  ok('El cajón se cierra', !$('.cajon').classList.contains('abierto'));

  /* ---------- 8. Cambiar de pack y añadir otra línea ---------- */
  const radio3 = document.querySelector('input[value="pack-3"]');
  radio3.checked = true;
  radio3.dispatchEvent(new Event('change', { bubbles: true }));
  ok('El pack de 3 queda marcado visualmente',
     document.querySelector('[data-pack="pack-3"]').classList.contains('pack--activo'));

  $('#btnAgregar').click();
  const lineas2 = Tienda.Carrito.lineas();
  ok('Ahora hay 2 líneas distintas', lineas2.length === 2, JSON.stringify(lineas2.map(l => l.precio)));
  ok('La segunda línea cuesta lo del pack de 3', lineas2[1].precio === P3);
  ok('El subtotal suma los dos packs', Tienda.Carrito.subtotal() === RED(P2 + P3),
     'esperado ' + RED(P2 + P3) + ', obtenido ' + Tienda.Carrito.subtotal());
  ok('El contador del ícono muestra 2', $('[data-contador-carrito]').textContent === '2');

  /* ---------- 9. Eliminar una línea ---------- */
  $('[data-quitar]').click();
  ok('Al eliminar queda 1 línea', Tienda.Carrito.lineas().length === 1);
  ok('El subtotal vuelve al pack de 3', Tienda.Carrito.subtotal() === P3);

  /* ---------- 10. Totales con cada método de pago ---------- */
  const tCE = Tienda.Carrito.totales('contraentrega');
  ok('Contra entrega: cobra el subtotal, sin recargo ni descuento',
     tCE.total === P3 && tCE.recargo === 0 && tCE.descuento === 0,
     JSON.stringify(tCE));

  const tTR = Tienda.Carrito.totales('transferencia');
  ok('Transferencia: aplica el 5 % sobre el subtotal',
     tTR.descuento === RED(P3 * DTO), 'esperado ' + RED(P3 * DTO) + ', obtenido ' + tTR.descuento);
  ok('Transferencia: el total es el subtotal menos el descuento',
     tTR.total === RED(P3 - RED(P3 * DTO)), 'total=' + tTR.total);
  ok('Envío gratis en ambos casos', tCE.envio === 0 && tTR.envio === 0);

  /* ---------- 11. Persistencia en localStorage ---------- */
  const guardado = JSON.parse(localStorage.getItem(CONFIG.tienda.prefijoDatos + '_carrito_v1'));
  ok('El carrito quedó guardado en localStorage',
     Array.isArray(guardado) && guardado.length === 1 && guardado[0].precio === P3);

  /* ---------- 12. Dejamos el carrito listo para el checkout ---------- */
  Tienda.Carrito.vaciar();
  Tienda.Carrito.agregar({
    id: 'cepillo-secador-3en1__pack-1',
    nombre: CONFIG.producto.nombre,
    variante: 'Unidad',
    precio: P1,
    precioAntes: CONFIG.producto.precioAntes,
    imagen: CONFIG.producto.imagenPrincipal,
    unidades: 1,
  }, 1);
  ok('Carrito preparado con una unidad al precio de lista de la tienda',
     Tienda.Carrito.subtotal() === P1);

  const fallan = R.filter((r) => !r.pasa);
  return JSON.stringify({
    total: R.length,
    pasaron: R.length - fallan.length,
    fallaron: fallan.length,
    fallos: fallan,
  }, null, 1);
})()
