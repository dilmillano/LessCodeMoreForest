# 🌲 Less Code More Forest

## Segmentación automática de parches de bosque y extracción de métricas espaciales para monitoreo continuo libre

**Por** David Valbuena - Gaviria y [Diana Millan - Orduz](https://github.com/dilmillano) - Investigadores independientes

---

## 🛰️ Contexto de la investigación

El monitoreo de la cobertura boscosa es una herramienta clave para comprender los cambios ambientales, planificar la restauración y orientar la gestión territorial. En Colombia, la alta variabilidad de ecosistemas y la expansión de las actividades humanas exigen métodos automatizados, reproducibles y accesibles que permitan analizar la dinámica del bosque a diferentes escalas espaciales.

Este repositorio documenta una metodología basada en inteligencia artificial para la segmentación automática de parches de bosque a partir de imágenes satelitales y ortofotos de alta resolución, complementada con el cálculo de métricas espaciales que caracterizan la estructura y el contexto del paisaje (área núcleo, forma e índice de contexto paisajístico).
    
El flujo metodológico combina herramientas de QGIS y Google Colab (Python) en tres etapas principales:

**Preprocesamiento (QGIS)** – construcción de etiquetas de entrenamiento y depuración geométrica de polígonos de bosque.

**Modelado (Colab)** – entrenamiento e inferencia del modelo Satlas SwinB + FPN, preentrenado para segmentación semántica sobre imágenes de alta resolución; aplicado aquí a mosaicos de Sentinel-2 (10 m) y ortofotos (< 2.5 m) correspondientes a un gradiente altitudinal entre 200 y 3500 m s.n.m. en Cundinamarca.

**Postprocesamiento (Colab)** – cálculo de métricas espaciales de los parches identificados para evaluar su estructura y cambios temporales en la cobertura forestal.

Los resultados muestran un IoU entre 0.66 y 0.73, muestra una coincidencia espacial cercana al 70 % con el bosque real. Un F1-score (Dice) de 79% evidencia un buen equilibrio entre precisión y sensibilidad. Y una zona de rendimiento estable entre umbrales de 0.3 y 0.7. Esta metodología reduce significativamente los tiempos de procesamiento frente a enfoques manuales y es escalable y adaptable a distintos ecosistemas del país.

Además, el enfoque se construyó utilizando software libre y herramientas abiertas, lo que facilita su replicación en contextos técnicos, institucionales o comunitarios con recursos limitados.

---

## 📋 Estructura del proyecto

### 🔧 PREPROCESAMIENTO

Esta etapa se desarrolla principalmente en **QGIS** para la construcción de etiquetas de entrenamiento y depuración geométrica de polígonos de bosque.

**Archivos principales:**
- `data/descargar_imagenes_sentinel.js` - Script de Google Earth Engine para descarga de imágenes Sentinel-2
- `1_guardar_labels.ipynb` - Procesamiento de etiquetas y generación de tiles para entrenamiento

**Proceso:**
1. **Descarga de imágenes**: Ejecutar el script `data/descargar_imagenes_sentinel.js` en Google Earth Engine para obtener imágenes Sentinel-2 compuestas y libres de nubes
2. **Etiquetado manual en QGIS**: Creación de polígonos de bosque mediante interpretación visual de imágenes satelitales
3. **Generación de tiles**: El notebook `1_guardar_labels.ipynb` procesa las etiquetas vectoriales y genera tiles de entrenamiento con sus respectivas máscaras
4. **Validación geométrica**: Depuración de polígonos y corrección de errores topológicos
5. **Exportación**: Conversión a formatos compatibles con el modelo de deep learning

### 🤖 MODELADO

Esta etapa se desarrolla en **Google Colab** utilizando el modelo Satlas SwinB + FPN para segmentación semántica.

**Archivos principales:**
- `2_entrenamiento_satlas_2016.ipynb` - Entrenamiento del modelo con datos de 2016
- `3_inferencia_satlas_2016.ipynb` - Aplicación del modelo entrenado para inferencia

**Características técnicas:**
- **Modelo base**: Satlas SwinB + FPN preentrenado para segmentación semántica
- **Resolución**: Adaptado para imágenes Sentinel-2 (10m) y ortofotos (<2.5m)
- **Cobertura**: Gradiente altitudinal 200-3500 m s.n.m. en Cundinamarca
- **Optimización**: Uso de GPU (Tesla T4) con AMP (Automatic Mixed Precision)
- **Procesamiento**: Inferencia por tiles con stride de 512x512 píxeles

**Resultados obtenidos:**
- IoU entre 0.66 y 0.73 (coincidencia espacial ~70%)
- F1-score (Dice) de 79%
- Zona de rendimiento estable entre umbrales de 0.3 y 0.7
- Tiempo de procesamiento: ~10 minutos para 2223 tiles (GPU Tesla T4)

### 📊 POSTPROCESAMIENTO

Esta etapa calcula métricas espaciales de los parches identificados para evaluar su estructura y cambios temporales.

**Métricas implementadas:**
- **Área núcleo**: Zona interior del parche sin influencia de borde
- **Índice de forma**: Relación perímetro-área para caracterizar la geometría
- **Índice de contexto paisajístico**: Relación del parche con su entorno

**Aplicaciones:**
- Monitoreo de cambios en cobertura forestal
- Análisis de fragmentación del paisaje
- Evaluación de conectividad ecológica
- Planificación de restauración

---

## 📊 Datos

### Imágenes
Imágenes satelitales y raster limpios de Cundinamarca Sentinel-2: [Descargar imágenes](https://drive.google.com/drive/folders/14QhNHqLA7MlWq83VWmBovv_wzM7ezhCy?usp=sharing)

### Labels
Etiquetas de entrenamiento en formato GeoJSON: [Descargar labels](https://drive.google.com/drive/folders/1WVv6DqZmXmookblPRJU8RvjyvPVXuU92?usp=sharing)

---

## 🚀 Instalación y uso

### Requisitos del sistema

**Para QGIS (Preprocesamiento):**
- QGIS 3.x
- ArcPy (opcional, para automatización)

**Para Google Colab (Modelado y Postprocesamiento):**
- Cuenta de Google con acceso a Colab
- Google Drive para almacenamiento de datos
- GPU recomendada (Tesla T4 o superior)

### Dependencias Python

```bash
pip install torch torchvision --extra-index-url https://download.pytorch.org/whl/cu121
pip install satlaspretrain-models
pip install rasterio tifffile pillow opencv-python
pip install tqdm numpy
```

### Uso básico

1. **Preprocesamiento**: Ejecutar `1_guardar_labels.ipynb` en Colab para procesar etiquetas
2. **Entrenamiento**: Ejecutar `2_entrenamiento_satlas_2016.ipynb` para entrenar el modelo
3. **Inferencia**: Ejecutar `3_inferencia_satlas_2016.ipynb` para aplicar el modelo
4. **Postprocesamiento**: Ejecutar el notebook de métricas espaciales (próximamente)

---

## 📈 Resultados y validación

### Métricas de rendimiento
- **IoU (Intersection over Union)**: 0.66-0.73 (coincidencia espacial ~70%)
- **F1-Score (Dice)**: 79%
- **Zona de rendimiento estable**: Entre umbrales de 0.3 y 0.7
- **Tiempo de procesamiento**: Reducción significativa vs. métodos manuales

### Casos de estudio
- **Área de estudio**: Cundinamarca, Colombia
- **Gradiente altitudinal**: 200-3500 m s.n.m.
- **Tipos de cobertura**: Bosques andinos, subandinos y tropicales
- **Resolución temporal**: Análisis multitemporal (2016-2023)

---

## 🤝 Contribuciones

Este proyecto está abierto a contribuciones de la comunidad científica y técnica. Las áreas de mejora incluyen:

- Optimización de algoritmos de postprocesamiento
- Adaptación a otros sensores satelitales
- Integración con plataformas de monitoreo forestal
- Desarrollo de interfaces de usuario amigables

---

## 📄 Licencia

Este proyecto se desarrolla bajo principios de ciencia abierta y software libre, facilitando su replicación y adaptación en diferentes contextos institucionales y comunitarios.

---

## 📞 Contacto

- **David Valbuena - Gaviria**: dlvalbuenag@udistrital.edu.co
- **Diana Millan - Orduz**: millanorduzdiana@gmail.com

---

## 📚 Referencias

- Satlas: Modelos preentrenados para análisis de imágenes satelitales
- SwinB + FPN: Arquitectura de red neuronal para segmentación semántica
- Sentinel-2: Misión satelital de la Agencia Espacial Europea
- QGIS: Sistema de Información Geográfica de código abierto

---

*Última actualización: Enero 2025*
