
/**
 * Procesa un pedido para generar la información de impresión
 * @param {Object} pedido - Objeto con la información del pedido
 * @param {Array} impresoras - Lista de impresoras disponibles
 * @param {Object} datosSede - Datos de configuración de la sede
 * @param {boolean} isCliente - Si el pedido proviene de un cliente
 * @param {boolean} isUsuarioHolding - Si el usuario es del tipo holding
 * @returns {Array} - Array con información para impresión
 */
function relationRowToPrint(pedido, impresoras) {
  // Verificamos que tengamos datos válidos
  if (!pedido || !pedido.p_body || !pedido.p_body.tipoconsumo || !impresoras || !datosSede) {
    console.error("Datos insuficientes para procesar impresión");
    return [];
  }

  // Valores iniciales
  
  const xRptPrint = []; 
  const listOnlyPrinters = [];
  const datosSedeConfig = impresoras;// datosSede.datossede[0];
  
  // Valores de configuración de la sede
  const num_copias_all = datosSedeConfig.num_copias || 1;
  const var_size_font_tall_comanda = datosSedeConfig.var_size_font_tall_comanda || 12;
  const pie_pagina = datosSedeConfig.pie_pagina || '';
  const pie_pagina_comprobante = datosSedeConfig.pie_pagina_comprobante || '';
  const isPrintPedidoDeliveryCompleto = datosSedeConfig.isprint_all_delivery === '1';
  const idSede = datosSedeConfig.idsede;

  // Si es usuario holding, agregamos la información de sede
  const isHolding = isUsuarioHolding && pedido.p_header && pedido.p_header.is_holding === '1';
  const holdingInfo = isHolding ? pedido.p_header.holding : null;

  // Procesamos por cada impresora
  impresoras.forEach(impresora => {
    let isHayDatosPrintObj = false;
    let xArrayBodyPrint = [];
    
    // Procesamos tipos de consumo
    pedido.p_body.tipoconsumo.forEach((tpc, indexP) => {
      const isPedidoDelivery = tpc.descripcion && tpc.descripcion.toLowerCase() === 'delivery';
      xArrayBodyPrint[indexP] = { 
        'des': tpc.descripcion || tpc.titulo, 
        'id': tpc.idtipo_consumo, 
        'titulo': tpc.titulo, 
        'conDatos': false
      };
      
      // Filtrar secciones por impresora
      const seccionesParaImpresora = tpc.secciones.filter(s => 
        s.idimpresora === impresora.idimpresora || s.idimpresora_otro === impresora.idimpresora
      );

      // Si es delivery y está configurado para imprimir todo, incluimos todas las secciones
      if (isPedidoDelivery && isPrintPedidoDeliveryCompleto) {
        tpc.secciones.forEach(seccion => {
          seccion.items.forEach(item => {
            if (item.flag_add_tpc) return;
            
            procesarItem(item, seccion, indexP, xArrayBodyPrint);
            isHayDatosPrintObj = true;
          });
        });
      }
      
      // Procesamos los items de las secciones filtradas
      seccionesParaImpresora.forEach(seccion => {
        seccion.items.forEach(item => {
          if (item.flag_add_tpc) return;
          if (item.imprimir_comanda === 0 && !isCliente) return;
          
          procesarItem(item, seccion, indexP, xArrayBodyPrint);
          isHayDatosPrintObj = true;
        });
      });
    });
    
    // Si no hay datos para esta impresora, continuamos
    if (!isHayDatosPrintObj) return;
    
    // Configuramos la impresora
    const configImpresora = {
      ip_print: impresora.ip,
      var_margen_iz: impresora.var_margen_iz,
      var_size_font: impresora.var_size_font,
      local: 0,
      num_copias: impresora.num_copias || num_copias_all,
      var_size_font_tall_comanda: var_size_font_tall_comanda,
      copia_local: 0,
      img64: '',
      papel_size: impresora.papel_size,
      pie_pagina: pie_pagina,
      pie_pagina_comprobante: pie_pagina_comprobante
    };
    
    // Agregamos configuración de impresora
    const xImpresoraPrint = [configImpresora];
    listOnlyPrinters.push(configImpresora);
    
    // Armamos el objeto para enviar
    const objPrint = {
      idsede: idSede,
      arrBodyPrint: xArrayBodyPrint,
      arrPrinters: xImpresoraPrint
    };
    
    // Si es holding, agregamos datos adicionales
    if (isHolding && holdingInfo) {
      objPrint.holding = {
        idsede_holding: holdingInfo.idsede_holding,
        idsede: holdingInfo.idsede,
        nombre: holdingInfo.nombre,
        ciudad: holdingInfo.ciudad
      };
    }
    
    xRptPrint.push(objPrint);
  });
  
  // Agregamos la lista de impresoras
  xRptPrint.listPrinters = listOnlyPrinters;
  
  return xRptPrint;
}

/**
 * Procesa un item para ser formateado para impresión
 */
function procesarItem(item, seccion, indexP, arrayBodyPrint) {
  arrayBodyPrint[indexP].conDatos = true;
  arrayBodyPrint[indexP][item.iditem] = { ...item };
  arrayBodyPrint[indexP][item.iditem].des_seccion = seccion.des;
  arrayBodyPrint[indexP][item.iditem].sec_orden = seccion.sec_orden;
  arrayBodyPrint[indexP][item.iditem].cantidad = item.cantidad_seleccionada 
    ? item.cantidad_seleccionada.toString().padStart(2, '0') 
    : (item.cantidad || '01');
  arrayBodyPrint[indexP][item.iditem].precio_print = parseFloat(
    item.precio_print || item.precio || 0
  ).toFixed(2);
  
  // Si no tiene subitems_view, inicializamos como null
  if (!item.subitems_view) {
    arrayBodyPrint[indexP][item.iditem].subitems_view = null;
  }
}

/**
 * Ejemplo de uso:
 * Nota: En un entorno real, estos datos vendrían de las fuentes correspondientes
 */
function ejemploUso() {
  // Parsear el JSON del pedido
  const pedidoJson = '{"p_body":{"tipoconsumo":[{"titulo":"LOCAL","secciones":[{"items":[{"des":"CALDO DE GALLINA","img":"","iditem":999,"precio":10,"procede":1,"cantidad":"01","detalles":"Caldo de gallina extra virgen. acompañado con arroz y platanos fritos.","subitems":null,"idseccion":92,"isalmacen":0,"isporcion":"32","idcategoria":14,"idcarta_lista":"16131292999","count_subitems":0,"precio_default":10,"precio_unitario":10,"imprimir_comanda":1,"is_recomendacion":"0","subitem_cant_select":0,"subitem_required_select":0,"selected":true,"itemtiposconsumo":[],"subitems_selected":[],"subitems_view":null,"is_search_subitems":true,"cantidad_seleccionada":1,"precio_total":10,"precio_print":"10.00","precio_total_calc":null,"des_seccion":"SOPAS","sec_orden":8}],"des":"SOPAS","idimpresora":38,"idimpresora_otro":0,"idseccion":92,"sec_orden":8,"ver_stock_cero":0,"idsede":13,"idorg":16,"count_items":1}],"descripcion":"CONSUMIR EN EL LOCAL","idtipo_consumo":31}]}, "idpedido":25087,"p_header":{"m":"22","m_respaldo":"22","r":"","nom_us":"SISTEMA","delivery":0,"reservar":0,"solo_llevar":0,"idcategoria":"1","correlativo_dia":"","num_pedido":"","isCliente":0,"idregistro_pago":0,"arrDatosDelivery":{},"arrDatosReserva":{},"systemOS":"Windows","idregistra_scan_qr":0,"is_print_subtotales":1,"isprint_copy_short":0,"isprint_all_short":0,"appv":"v.2z","is_holding":"1","holding":{"idsede_holding":6,"idsede":13,"nombre":"CALANDRIA","ciudad":"MOYOBAMBA","estado":"0","idorg":16},"paymentMozo":{"methods":[{"id":1,"name":"Efectivo","icon":"http://192.168.1.65/restobar/images/_tp_01.png","amount":22,"amount_real":18,"isActive":true,"isDisabled":false}],"isPaymentSuccess":true,"idusuario":103},"idcliente":0,"idsede":13,"idorg":16},"p_sede":{"idsede":13,"idorg":16,"holding":{"idsede_holding":6,"idsede":13,"nombre":"CALANDRIA","ciudad":"MOYOBAMBA","estado":"0","idorg":16}},"p_subtotales":[{"id":0,"descripcion":"SUB TOTAL","esImpuesto":0,"visible":true,"quitar":false,"tachado":false,"visible_cpe":true,"importe":"18.00"},{"id":0,"esImpuesto":0,"descripcion":"TOTAL","visible":true,"quitar":false,"tachado":false,"visible_cpe":true,"importe":"18.00"}]}';
  const pedido = JSON.parse(pedidoJson);

  // Datos de impresoras (ejemplo)
  const impresoras = [
    {
      idimpresora: 38,
      descripcion: "Cocina",
      ip: "192.168.1.100",
      var_margen_iz: 10,
      var_size_font: 12,
      num_copias: 1,
      papel_size: 80
    }
  ];

  // Datos de sede (ejemplo)
  const datosSede = {
    datossede: [{
      num_copias: 1,
      var_size_font_tall_comanda: 14,
      pie_pagina: "Gracias por su visita",
      pie_pagina_comprobante: "Comprobante Electrónico",
      isprint_all_delivery: "1",
      idsede: 13
    }]
  };

  // Llamada a la función
  const resultado = relationRowToPrint(pedido, impresoras, datosSede, false, true);
  console.log(JSON.stringify(resultado, null, 2));
  
  return resultado;
}

// Exportamos las funciones para uso en otros archivos
module.exports = {
  relationRowToPrint,
  ejemploUso
};
