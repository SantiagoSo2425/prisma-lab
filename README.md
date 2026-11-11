# PRISMA-Lab: Objeto Virtual de Aprendizaje (OVA) y Simulador Algorítmico para PRISMA 2020

**PRISMA-Lab** es una aplicación web interactiva, modular y desacoplada diseñada bajo los marcos metodológicos **Design Science Research (DSR)** y **ADDIE** para la enseñanza operativa, simulación matemática y auditoría transparente de revisiones sistemáticas conforme a la declaración internacional **PRISMA 2020** (Page et al., 2021) y **SEGRESS** (Kitchenham et al., 2023).

## Arquitectura y Módulos Pedagógicos

1. **Evaluación Diagnóstica (Pre-Test) y Sumativa (Post-Test):** Banco de 10 preguntas iniciales y 10 preguntas homólogas finales basado en el ensayo controlado de Krnic Martinic et al. (2022, *JMIR*) con cálculo automático de ganancia normalizada de Hake ($g$).
2. **Módulo 1 — Fundamentos, Deslinde Epistemológico y Protocolos:**
   - Separación conceptual y numérica de las 3 entidades ontológicas: **Registro (*Record*)**, **Informe (*Report*)** y **Estudio (*Study*)**.
   - Matriz comparativa entre Guías de Reporte (**PRISMA 2020**) e Instrumentos de Calidad Metodológica (**AMSTAR 2** / **ROBIS**), más taller práctico de arbitraje sobre un manuscrito simulado.
   - Validador de protocolo **PICO** e identificadores prospectivos **PROSPERO** (`CRD420...`) y **OSF**, forzando la declaración de enmiendas (Ítem 24c).
3. **Módulo 2 — Búsqueda Reproducible (PRISMA-S), Tamizaje con IA y Simulador Matemático de Flujo:**
   - Analizador léxico/sintáctico de cadenas booleanas (`AND`, `OR`, `NOT`, balance de paréntesis y calificadores MeSH/Emtree) alineado con el Ítem 7.
   - Declaración de herramientas de automatización e IA (`ASReview`, `Rayyan`, clasificadores y rol humano; Ítems 8 y 9).
   - **Motor Algebraico Reactivo de Conciliación:** Verifica en tiempo real las ecuaciones canónicas de balance de PRISMA 2020 y la restricción ontológica $\text{Estudios\_Incluidos} \le \text{Informes\_Incluidos}$.
4. **Módulo 3 — Riesgo de Sesgo, Síntesis Alternativa (SWiM) y Certeza GRADE:**
   - Mapeo interactivo de dominios para **RoB 2**, **ROBINS-I** y **QUADAS-2**.
   - Guía estructurada de los **9 ítems del protocolo SWiM** (*Synthesis Without Meta-analysis*, Campbell et al., 2020).
   - Constructor de tablas *Summary of Findings* (SoF) bajo el marco **GRADE** (Alta, Moderada, Baja, Muy Baja).
5. **Módulo 4 — Auditoría de 42 Sub-ítems, Ítem 13 y Ciencia Abierta:**
   - Lista de chequeo interactiva de los **42 sub-ítems operativos** (con filtro dedicado a los 6 sub-ítems **13a–13f**).
   - Exportador de diagrama interactivo en formato HTML autónomo con hipervínculos de Ciencia Abierta (Ítem 27) y *tooltips* dinámicos (estilo paquete R `PRISMA2020` de Haddaway et al., 2022).
6. **Interoperabilidad LMS, Calidad LORI y Usabilidad SUS:**
   - Empaquetamiento **SCORM 1.2** (`LMSInitialize`, `LMSSetValue`, `LMSCommit`, `LMSFinish`). La nota que recibe el LMS es el porcentaje de aciertos del **post-test** (aprueba con 75, igual que `adlcp:masteryscore`).
   - Metadatos **IEEE LOM 1484.12.1 / perfil LOM-CO** (autoría, ciclo de vida, técnica, uso educativo, derechos, anotación y clasificación) generados en `dist/lom-metadata.xml` y `dist/imsmanifest.xml`.
   - Instrumentos **LORI** (9 criterios) y **SUS** para que docentes y usuarios evalúen la calidad del objeto (no cuentan para la nota del estudiante).

## Metadatos, créditos y licencia (completar antes de publicar)

Todos los datos de autoría, institución, licencia, prerrequisitos y metadatos LOM-CO viven en un solo archivo: [`src/data/ova.config.json`](src/data/ova.config.json). Si cambias autoría o licencia, actualiza también [`LICENSE`](LICENSE). La interfaz (Guía OVA → «Créditos y licencia» y portada) y el script `scripts/build-manifest.mjs` lo leen de ahí. Si quedan campos sin completar, `npm run build:scorm` muestra un aviso con la lista.

## Comandos de Ejecución y Construcción

```bash
# Instalar dependencias
npm install

# Ejecutar suite de pruebas unitarias (Vitest)
npm test

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción y empaquetar en .zip SCORM 1.2
npm run build:scorm
```
