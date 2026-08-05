/* =========================================================================
   CONTENIDO EDITORIAL
   -------------------------------------------------------------------------
   Reseñas, preguntas frecuentes y textos largos.
   Edita libremente: la página se regenera sola.
   ========================================================================= */

const CONTENIDO = {
  /* -----------------------------------------------------------------------
     RESEÑAS
     estrellas: 1 a 5   |   foto: archivo en assets/img/   |   texto: opcional
     ----------------------------------------------------------------------- */
  resenas: [
    {
      autora: 'Lucía',
      estrellas: 5,
      foto: 'assets/img/resena-1.svg',
      texto: 'Llegó rapidísimo y funciona igual que en los videos. Totalmente recomendado.',
    },
    {
      autora: 'Sofía',
      estrellas: 5,
      foto: 'assets/img/resena-4.svg',
      texto:
        'Increíble cómo ahorra tiempo. Ya no necesito el secador y la plancha, con esto es suficiente para dejarlo liso y con volumen.',
    },
    {
      autora: 'Elena',
      estrellas: 4,
      foto: 'assets/img/resena-8.svg',
      texto:
        'Me encanta el volumen que da. Tenía miedo por el daño para el pelo pero se siente mucho más saludable y brillante desde que cambié mi rutina.',
    },
    {
      autora: 'Valeria',
      estrellas: 5,
      foto: 'assets/img/resena-3.svg',
      texto:
        'Tenía mis dudas siendo de pelo rizado, pero me ha sorprendido gratamente. Me ayuda a alisar sin maltratar y el resultado dura todo el día.',
    },
    {
      autora: 'Marta',
      estrellas: 5,
      foto: 'assets/img/resena-2.svg',
      texto:
        'Es súper cómodo de manejar. Se siente como si alguien más me estuviera peinando, el acabado es muy suave y sin nada de frizz.',
    },
    {
      autora: 'Claudia',
      estrellas: 4,
      foto: 'assets/img/resena-12.svg',
      texto:
        'El resultado es muy natural. Me gusta mucho cómo queda el volumen en las raíces sin que se vea artificial. Muy contenta.',
    },
    {
      autora: 'Paula',
      estrellas: 5,
      foto: 'assets/img/resena-5.svg',
      texto:
        'Al principio dudé si se quemaría mi pelo, pero al tener control de temperatura estoy tranquila. Lo uso cada mañana y mi cabello sigue viéndose brillante y muy sano. Es la mejor inversión que he hecho para mis mañanas apresuradas.',
    },
    {
      autora: 'Laura',
      estrellas: 5,
      foto: 'assets/img/resena-6.svg',
      texto:
        'Ya no pierdo la mitad de mi mañana secando y luego pasando la plancha. Este cepillo lo hace todo en un paso y me deja el pelo genial.',
    },
    {
      autora: 'Isabel',
      estrellas: 5,
      foto: 'assets/img/resena-9.svg',
      texto: 'El empaque venía perfecto y el producto es tal cual la descripción. Pagué al recibirlo, todo súper confiable.',
    },
    {
      autora: 'Andrea',
      estrellas: 5,
      foto: 'assets/img/resena-7.svg',
      texto:
        'Se lo regalé a mi hermana y terminó comprándose otro para mi mamá. En casa ya somos tres usándolo.',
    },
    {
      autora: 'Gabriela',
      estrellas: 4,
      foto: 'assets/img/resena-10.svg',
      texto:
        'Mi pelo es muy fino y temía que se me quemara. Con la temperatura baja queda perfecto y con muchísimo cuerpo.',
    },
    {
      autora: 'Daniela',
      estrellas: 5,
      foto: 'assets/img/resena-11.svg',
      texto:
        'Diez minutos y salgo peinada de casa. Antes me tomaba media hora. Vale cada centavo.',
    },
  ],

  /* -----------------------------------------------------------------------
     PREGUNTAS FRECUENTES
     ----------------------------------------------------------------------- */
  faq: [
    {
      p: '¿Es adecuado para mi tipo de cabello?',
      r:
        'Sí. Funciona en cabello liso, ondulado, rizado, fino o grueso. Tiene tres niveles de temperatura y velocidad para que elijas el que mejor se adapta a tu pelo: temperatura baja para cabello fino o teñido, media para uso diario y alta para cabello grueso o muy rizado.',
    },
    {
      p: '¿Cómo lograr el peinado perfecto rápidamente?',
      r:
        '<ul>' +
        '<li>Seca tu cabello con la toalla hasta que quede húmedo, no empapado.</li>' +
        '<li>Divídelo en cuatro secciones y sujétalas con pinzas.</li>' +
        '<li>Empieza por las secciones de abajo, desliza el cepillo desde la raíz hacia las puntas.</li>' +
        '<li>Para volumen, gira el cepillo hacia dentro al llegar a la raíz y sostén dos segundos.</li>' +
        '<li>Termina con aire frío para fijar el peinado y darle brillo.</li>' +
        '</ul>',
    },
    {
      p: '¿Cómo gestionan los envíos y devoluciones?',
      r:
        'El envío es <strong>gratis a todo el Ecuador</strong>. En Guayaquil, Quito, Cuenca, Manta, Machala y Ambato entregamos en 24 a 48 horas; al resto del país entre 2 y 4 días laborables. Si el producto no te convence, tienes 30 días para devolverlo y recuperar tu dinero completo. Solo escríbenos por WhatsApp y coordinamos el retiro.',
    },
    {
      p: '¿Es seguro para no quemar mi cabello?',
      r:
        'Sí. El cepillo tiene revestimiento cerámico que distribuye el calor de forma uniforme y evita los puntos calientes que dañan la fibra. Además su diseño anti quemaduras protege tu cuero cabelludo y tus manos, así que puedes peinar desde la raíz con tranquilidad. Al hacer todo en un solo paso, tu cabello recibe menos calor total que usando secador y plancha por separado.',
    },
    {
      p: '¿Qué pasa si tengo dudas o algún problema?',
      r:
        'Escríbenos por WhatsApp al <strong>' +
        CONFIG.whatsapp.numeroBonito +
        '</strong> y una persona real te responde. Atendemos de lunes a sábado de 9:00 a 19:00. Te acompañamos antes, durante y después de tu compra.',
    },
    {
      p: '¿Cómo pago? ¿Es seguro?',
      r:
        '<ul>' +
        '<li><strong>Pago contra entrega:</strong> no adelantas nada. Pagas en efectivo al mensajero cuando el producto llega a tu puerta y ya lo revisaste.</li>' +
        '<li><strong>Transferencia o depósito:</strong> te damos un 5 % de descuento inmediato y tu pedido sale con prioridad. Nos envías el comprobante por WhatsApp y listo.</li>' +
        '</ul>' +
        'No pedimos datos de tarjeta en ningún momento.',
    },
  ],

  /* -----------------------------------------------------------------------
     DETALLES DEL PRODUCTO (acordeones de la ficha)
     ----------------------------------------------------------------------- */
  detalles: [
    {
      titulo: 'Detalles del producto',
      icono: 'hoja',
      contenido:
        '<ul>' +
        '<li><strong>Función 3 en 1:</strong> seca, alisa y da volumen en una sola pasada.</li>' +
        '<li><strong>Potencia:</strong> 1000 W de aire caliente profesional.</li>' +
        '<li><strong>Tecnología:</strong> revestimiento cerámico con iones que reduce el frizz.</li>' +
        '<li><strong>Controles:</strong> 3 niveles de temperatura y 2 de velocidad, más aire frío.</li>' +
        '<li><strong>Medidas:</strong> 31,5 cm de largo, barril de 7 cm de diámetro.</li>' +
        '<li><strong>Cerdas:</strong> mixtas de nylon y jabalí con puntas redondeadas anti tirones.</li>' +
        '<li><strong>Cable:</strong> 2 metros giratorio 360°.</li>' +
        '<li><strong>Voltaje:</strong> 110 V, ideal para Ecuador.</li>' +
        '<li><strong>Incluye:</strong> cepillo, manual en español y caja de regalo.</li>' +
        '</ul>',
    },
    {
      titulo: 'Información de envío',
      icono: 'camion',
      contenido:
        '<ul>' +
        '<li><strong>Envío gratis</strong> a todo el Ecuador, sin monto mínimo.</li>' +
        '<li>Guayaquil, Quito, Cuenca, Manta, Machala y Ambato: <strong>24 a 48 horas</strong>.</li>' +
        '<li>Resto del país: <strong>2 a 4 días laborables</strong>.</li>' +
        '<li>Te avisamos por WhatsApp cuando tu pedido sale a ruta.</li>' +
        '<li>Puedes pagar al mensajero en efectivo cuando lo recibas.</li>' +
        '</ul>',
    },
    {
      titulo: 'Información de reembolso',
      icono: 'caja',
      contenido:
        '<p>Tienes <strong>30 días</strong> desde que recibes el producto para devolverlo si no cumple tus expectativas. Debe estar completo y con su caja. Nosotros coordinamos el retiro sin costo y te devolvemos el 100 % de lo que pagaste.</p>' +
        '<p>Si el producto llega con algún defecto de fábrica, lo cambiamos de inmediato por uno nuevo.</p>',
    },
  ],
};

if (typeof window !== 'undefined') window.CONTENIDO = CONTENIDO;
