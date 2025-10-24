// ==========================
// 1) ÁREA DE INTERÉS
// ==========================
var AREA = ee.FeatureCollection("projects/ee-millanorduzdiana/assets/grilla_512x512_dissolve");
var table = ee.FeatureCollection("projects/ee-millanorduzdiana/assets/Areas_protegidas_declaradas_CAR");
var region = AREA.geometry();

Map.centerObject(AREA, 9);
Map.addLayer(AREA, {}, 'Areas_CAR_Buffer5km');

// ==========================
// 2) MÁSCARA DE NUBES/CIRROS (QA60) + ESCALA A REFLECTANCIA
// ==========================
function maskS2clouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask  = 1 << 10;  // nubes
  var cirrusBitMask = 1 << 11;  // cirros
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
               .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  // Divide por 10000 para llevar a reflectancia de superficie (0–1 aprox.)
  return image.updateMask(mask).divide(10000);
}

// ==========================
// 3) FUNCIÓN PARA HACER EL COMPUESTO POR PERIODO
// ==========================
//   - Selecciona B4,B3,B2,B8 (todas 10 m)
//   - Filtra nubes globales (<30%) + QA60 por píxel
//   - Reduce con percentil 35 para minimizar nubes y huecos
function compositePeriod(startDate, endDate, percentile) {
  var ic = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
    .filterDate(startDate, endDate)
    .filterBounds(region)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
    .map(maskS2clouds)
    .map(function(img){ return img.select(['B4','B3','B2','B8']); });

  print('Número de imágenes entre ' + startDate + ' y ' + endDate + ':', ic.size());

  // Reduce a percentil (los nombres de bandas quedan con sufijo _pXX)
  var comp = ic.reduce(ee.Reducer.percentile([percentile])).clip(region);

  return comp; // Bandas: B4_p35, B3_p35, B2_p35, B8_p35
}

// ==========================
// 4) GENERAR COMPUESTOS
// ==========================
var p = 35;

// Nota: Sentinel-2 inicia cobertura desde mediados de 2015.
// Usamos 2015-06-23 como inicio para evitar meses vacíos.
var comp_p1 = compositePeriod('2015-06-23', '2019-12-31', p);
var comp_p2 = compositePeriod('2023-01-01', '2025-12-31', p);

// ==========================
// 5) VISUALIZACIÓN EN MAPA (RGB)
// ==========================
var visRGB_p35 = {bands: ['B4_p35', 'B3_p35', 'B2_p35'], min: 0.02, max: 0.30};

Map.addLayer(comp_p1, visRGB_p35, 'Periodo 1 (2015–2017) RGB p35', false);
Map.addLayer(comp_p2, visRGB_p35, 'Periodo 2 (2023–2025) RGB p35', true);

// Estilo de borde (rojo, relleno transparente)
var outline = table.style({ color: 'FF0000', fillColor: '00000000', width: 2 });
Map.addLayer(outline, {}, 'Borde rojo, relleno transparente');

// ==========================
// 6) EXPORTS (RGB + NIR)
// ==========================
// Exporta las 4 bandas (B4_p35, B3_p35, B2_p35, B8_p35) en un solo archivo por periodo.
Export.image.toDrive({
  image: comp_p1.select(['B4_p35','B3_p35','B2_p35','B8_p35']),
  description: 'S2_p35_RGBNIR_Periodo1_2015_2017_AreasCAR',
  folder: 'EarthEngineImages',
  fileNamePrefix: 'S2_p35_RGBNIR_Periodo1_2015_2017_AreasCAR',
  region: region,
  scale: 10,
  maxPixels: 1e13
});

Export.image.toDrive({
  image: comp_p2.select(['B4_p35','B3_p35','B2_p35','B8_p35']),
  description: 'S2_p35_RGBNIR_Periodo2_2023_2025_AreasCAR',
  folder: 'EarthEngineImages',
  fileNamePrefix: 'S2_p35_RGBNIR_Periodo2_2023_2025_AreasCAR',
  region: region,
  scale: 10,
  maxPixels: 1e13
});
