/* =========================================================================
   CONFIGURACIÓN CENTRAL DE LA TIENDA
   -------------------------------------------------------------------------
   Todo lo que necesitas cambiar del negocio está en este archivo.
   No hace falta tocar nada más para: precios, WhatsApp, banco, envíos.
   ========================================================================= */

const CONFIG = {
  /* ---------------------------------------------------------------------
     NEGOCIO
     --------------------------------------------------------------------- */
  tienda: {
    nombre: 'Butterfly',
    eslogan: 'Tu salón de belleza en casa',
    // Se usa en el pie de página y en los mensajes de WhatsApp
    email: 'corpusenigma4@gmail.com',
    ciudad: 'Ecuador',
    moneda: 'USD',
    simbolo: '$',
    // Tu dominio, sin la barra final. Si cambia, actualízalo también en la
    // etiqueta <link rel="canonical"> de index.html
    dominio: 'https://butterfly.store',
    // Prefijo con el que se guardan los datos en el navegador de la clienta
    prefijoDatos: 'butterfly',
  },

  /* ---------------------------------------------------------------------
     WHATSAPP  (aquí está conectado tu número)
     ---------------------------------------------------------------------
     numeroLocal  -> como lo marca la gente en Ecuador
     numeroWa     -> formato internacional SIN + ni 0 inicial, para wa.me
                     Ecuador = 593, y se quita el 0 del 09...
                     0960702682  ->  593 96 070 2682  ->  593960702682
     --------------------------------------------------------------------- */
  whatsapp: {
    numeroLocal: '0960702682',
    numeroWa: '593960702682',
    numeroBonito: '+593 96 070 2682',
    // Mensaje del botón flotante (consultas, no pedidos)
    saludo:
      '¡Hola! 👋 Vi la página del Cepillo, Secador y Aplanchador 3 en 1 y quiero más información.',
  },

  /* ---------------------------------------------------------------------
     PRODUCTO
     --------------------------------------------------------------------- */
  producto: {
    id: 'cepillo-secador-3en1',
    nombre: 'Cepillo, Secador y Aplanchador 3 en 1',
    // Versión corta para la barra fija de abajo, donde no cabe el nombre completo
    nombreCorto: 'Cepillo 3 en 1',
    subtitulo:
      'Logra un acabado de salón en minutos con <strong>menos daño</strong> para tu cabello.',
    sku: 'LSP-3EN1-001',
    marca: 'LISAPRO',
    precio: 29.99,
    precioAntes: 50.0,
    rating: 4.9,
    numResenas: 1084,
    stock: 6, // se muestra como "Solo quedan X en stock"
    /* ---------------------------------------------------------------------
       IMÁGENES DEL PRODUCTO
       ---------------------------------------------------------------------
       Apuntan a archivos .jpg. Mientras no subas una foto, la tienda muestra
       automáticamente la ilustración .svg con el mismo nombre, así que nunca
       se ve una imagen rota.

       Para poner tus fotos reales: súbelas a assets/img/ con estos nombres
       exactos (producto-1.jpg, producto-2.jpg, ...) y aparecen solas.
       --------------------------------------------------------------------- */
    imagenPrincipal: 'assets/img/producto-1.jpg',
    galeria: [
      { src: 'assets/img/producto-1.jpg', alt: 'Cepillo, secador y aplanchador 3 en 1 con su caja' },
      { src: 'assets/img/producto-2.jpg', alt: 'Medidas del cepillo: 31,5 cm de largo y barril de 7 cm' },
      { src: 'assets/img/producto-3.jpg', alt: 'Niveles de temperatura y velocidad del cepillo' },
      { src: 'assets/img/producto-4.jpg', alt: 'Cuatro estilos posibles: secado, rizos, alisado y volumen' },
      { src: 'assets/img/producto-5.jpg', alt: 'Especificaciones técnicas: 1000 W, cerámica y ondas suaves' },
    ],
    // "icono" usa los nombres del catálogo de iconos en assets/js/tienda.js
    bullets: [
      { icono: 'chispa', texto: 'Consigue una melena <strong>brillante</strong> y suave sin frizz.' },
      { icono: 'reloj', texto: 'Simplifica tu rutina matutina con un <strong>peinado rápido</strong>.' },
      { icono: 'corazon', texto: 'Disfruta un <strong>volumen</strong> natural desde la raíz fácilmente.' },
    ],
  },

  /* ---------------------------------------------------------------------
     PACKS / OFERTAS POR CANTIDAD
     --------------------------------------------------------------------- */
  packs: [
    {
      id: 'pack-1',
      cantidad: 1,
      titulo: '1 Cepillo',
      descripcion: 'Para ti',
      precio: 29.99,
      etiqueta: '',
    },
    {
      id: 'pack-2',
      cantidad: 2,
      titulo: '2 Cepillos',
      descripcion: 'Uno para ti y uno para regalar',
      precio: 49.99,
      etiqueta: 'MÁS VENDIDO',
      destacado: true,
    },
    {
      id: 'pack-3',
      cantidad: 3,
      titulo: '3 Cepillos',
      descripcion: 'El mejor precio por unidad',
      precio: 69.99,
      etiqueta: 'MÁXIMO AHORRO',
    },
  ],

  /* ---------------------------------------------------------------------
     ENVÍOS Y PAGOS
     ---------------------------------------------------------------------
     Solo 2 métodos, tal como pediste:
       1) Pago contra entrega  -> sin recargo, pagas al recibir
       2) Transferencia        -> 5 % de descuento inmediato
     --------------------------------------------------------------------- */
  envio: {
    costo: 0, // 0 = envío gratis a todo el país
    textoGratis: 'Envío GRATIS a todo el Ecuador',
    tiempoCiudadesPrincipales: '24 a 48 horas',
    tiempoResto: '2 a 4 días laborables',
  },

  pagos: {
    contraentrega: {
      id: 'contraentrega',
      nombre: 'Pago contra entrega',
      resumen: 'Pagas en efectivo cuando recibes el producto en tu casa.',
      icono: 'billete',
      recargo: 0, // sin recargo
      descuento: 0,
      etiqueta: 'SIN ADELANTOS',
      ventajas: [
        'No pagas nada hoy, cero riesgo.',
        'Revisas el producto antes de pagar.',
        'Disponible en todo el Ecuador.',
      ],
    },
    transferencia: {
      id: 'transferencia',
      nombre: 'Transferencia o depósito',
      resumen: 'Transfieres y nos envías el comprobante por WhatsApp.',
      icono: 'banco',
      recargo: 0,
      descuento: 0.05, // 5 % de descuento por pagar por adelantado
      etiqueta: '5% DE DESCUENTO',
      ventajas: [
        'Ahorras un 5 % al instante.',
        'Tu pedido sale con prioridad el mismo día.',
        'Te confirmamos por WhatsApp en minutos.',
      ],
      // Cuentas donde recibes las transferencias.
      // Puedes agregar más copiando el bloque { ... } y separándolo con coma.
      // El campo "identificacion" es opcional: si lo dejas vacío no se muestra.
      cuentas: [
        {
          banco: 'Banco Pichincha',
          tipo: 'Cuenta de Ahorros',
          numero: '2213135141',
          titular: 'Andrey Cabascango',
          identificacion: '',
          correo: 'corpusenigma4@gmail.com',
        },
      ],
    },
  },

  /* ---------------------------------------------------------------------
     COBERTURA: PROVINCIAS DEL ECUADOR
     --------------------------------------------------------------------- */
  provincias: [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
    'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
    'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza',
    'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas',
    'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe',
  ],

  /* Provincias con entrega en 24-48 h */
  provinciasRapidas: ['Guayas', 'Pichincha', 'Azuay', 'Manabí', 'El Oro', 'Tungurahua'],

  /* ---------------------------------------------------------------------
     OFERTA CON CUENTA REGRESIVA
     --------------------------------------------------------------------- */
  oferta: {
    activa: true,
    // Minutos que dura la oferta para cada visitante nuevo
    duracionMinutos: 20,
    texto: 'La oferta del 40 % termina en',
  },

  /* ---------------------------------------------------------------------
     ESTADÍSTICAS (la sección de porcentajes)
     --------------------------------------------------------------------- */
  estadisticas: {
    baseClientes: 339,
    meses: 3,
    items: [
      { valor: 96, texto: 'Sintieron una paz increíble al <strong>olvidar</strong> el daño por tanto calor.' },
      { valor: 94, texto: 'Lograron un secado de salón en diez minutos <strong>simplificando</strong> toda su rutina.' },
      { valor: 98, texto: 'Recomendaron este cambio porque <strong>ahorrarán dinero</strong> sin perder el estilo diario.' },
    ],
  },

  /* ---------------------------------------------------------------------
     GARANTÍA
     --------------------------------------------------------------------- */
  garantia: {
    dias: 30,
    titulo: 'Garantía de devolución de dinero',
    texto:
      'Pruébalo por 30 días. Si no te encanta el resultado, te devolvemos cada centavo. Así de simple.',
  },
};

/* Congelamos la configuración para evitar cambios accidentales en runtime */
Object.freeze(CONFIG);

/* Disponible globalmente y también como módulo si algún día se usa un bundler */
if (typeof window !== 'undefined') window.CONFIG = CONFIG;
