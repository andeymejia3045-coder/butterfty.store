/* Deja un carrito y un pedido de ejemplo en el navegador,
   para poder revisar visualmente el checkout y la confirmación. */
(() => {
  const pack = CONFIG.packs.find((p) => p.destacado) || CONFIG.packs[0];

  localStorage.setItem(CONFIG.tienda.prefijoDatos + '_carrito_v1', JSON.stringify([{
    id: CONFIG.producto.id + '__' + pack.id,
    nombre: CONFIG.producto.nombre,
    variante: 'Pack de ' + pack.cantidad + ' unidades',
    precio: pack.precio,
    precioAntes: CONFIG.producto.precioAntes * pack.cantidad,
    imagen: CONFIG.producto.imagenPrincipal,
    unidades: pack.cantidad,
    cantidad: 1,
  }]));

  const totales = {
    precioLista: 100,
    ahorroLista: 50.01,
    subtotal: 49.99,
    envio: 0,
    descuento: 2.5,
    recargo: 0,
    total: 47.49,
    unidades: 1,
  };

  localStorage.setItem(CONFIG.tienda.prefijoDatos + '_pedido_actual', JSON.stringify({
    numero: 'LP-260805-4821',
    fecha: new Date().toISOString(),
    lineas: JSON.parse(localStorage.getItem(CONFIG.tienda.prefijoDatos + '_carrito_v1')),
    totales: totales,
    metodo: { id: 'transferencia', nombre: 'Transferencia o depósito' },
    entrega: '24 a 48 horas',
    cliente: {
      nombre: 'María José',
      apellido: 'González Pérez',
      cedula: '0926687856',
      telefono: '0991234567',
      email: 'maria@correo.com',
      provincia: 'Guayas',
      ciudad: 'Guayaquil',
      direccion: 'Av. Francisco de Orellana 123 y Calle Segunda, Alborada etapa 5',
      referencia: 'Casa esquinera de reja blanca, frente a la farmacia',
      notas: 'Entregar en la tarde por favor',
    },
    mensajeWa: 'Pedido de ejemplo LP-260805-4821',
  }));

  return 'sembrado';
})()
