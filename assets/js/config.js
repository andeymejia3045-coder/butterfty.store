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
    dominio: 'https://butterflyec.netlify.app/',
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
      '¡Hola! 👋 Vi la página del Cepillo, Secador y Aplanchador 3 en 1 PRO y quiero más información.',
  },

  /* ---------------------------------------------------------------------
     ASESORA
     ---------------------------------------------------------------------
     La persona que atiende por WhatsApp. Aparece en un bloque arriba de la
     página y también en el checkout, para resolver dudas antes de comprar.
     --------------------------------------------------------------------- */
  asesora: {
    nombre: 'Karla',
    cargo: 'Asesora de belleza',
    horario: 'Lunes a sábado · 9:00 a 19:00',
    // Con qué mensaje arranca la conversación
    mensaje:
      '¡Hola Karla! 😊 Tengo una duda sobre el Cepillo, Secador y Aplanchador 3 en 1 PRO.',
  },

  /* ---------------------------------------------------------------------
     PRODUCTO
     --------------------------------------------------------------------- */
  producto: {
    id: 'cepillo-secador-3en1',
    nombre: 'Cepillo, Secador y Aplanchador 3 en 1 PRO',
    // Versión corta para la barra fija de abajo, donde no cabe el nombre completo
    nombreCorto: 'Cepillo 3 en 1 PRO',
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
       Cada imagen se puede poner de DOS maneras:

       1) Un archivo dentro del proyecto:
            { src: 'assets/img/producto-1.png', alt: '...' }

       2) Un LINK de internet, sin subir nada al proyecto:
            { src: 'https://i.ibb.co/abc123/foto.jpg',
              respaldo: 'assets/img/producto-1.png',
              alt: '...' }

       El campo "respaldo" es la ilustración que se muestra si ese link algún
       día deja de funcionar. Así la tienda nunca queda con un hueco.
       --------------------------------------------------------------------- */
    imagenPrincipal: 'assets/img/promocion-revlon-pestanas.png',
    imagenPrincipalRespaldo: 'assets/img/producto-1.png',
    galeria: [
      /* ── Fotos que están guardadas en el proyecto ──
         Estas son las más seguras: nunca dependen de otro servidor. */
      { src: 'assets/img/promocion-revlon-pestanas.png',
        respaldo: 'assets/img/producto-1.png',
        alt: 'Promoción Revlon One-Step Volumizer Titanium con sérum de pestañas gratis' },
      /* ── Fotos nuevas del producto ──
         Si Mercado Libre bloquea un enlace, aparece la foto local de respaldo. */
      { src: 'https://http2.mlstatic.com/D_NQ_NP_2X_781832-MLM95825423143_102025-F.webp',
        respaldo: 'assets/img/producto-1.png',
        alt: 'Cepillo secador Revlon One-Step Volumizer Titanium' },
      { src: 'https://http2.mlstatic.com/D_NQ_NP_2X_631848-MLM90930668241_082025-F.webp',
        respaldo: 'assets/img/producto-2.png',
        alt: 'Vista del cepillo Revlon One-Step Volumizer Titanium' },
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
      destacado: true,
    },
    {
      id: 'pack-2',
      cantidad: 2,
      titulo: '2 Cepillos',
      descripcion: 'Uno para ti y uno para regalar',
      precio: 44.99,
      // Beneficio concreto en lugar de "más vendido": convierte mejor porque
      // la clienta entiende de una lo que gana
      etiqueta: 'EL 2° A MITAD DE PRECIO',
    },
    {
      id: 'pack-3',
      cantidad: 3,
      titulo: '3 Cepillos',
      descripcion: 'El mejor precio por unidad',
      precio: 54.99,
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
