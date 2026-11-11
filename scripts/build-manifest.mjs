/**
 * Genera dist/imsmanifest.xml (SCORM 1.2) y dist/lom-metadata.xml (IEEE LOM 1484.12.1 / perfil LOM-CO)
 * a partir de src/data/ova.config.json, que es la fuente única de metadatos del OVA.
 *
 * - Lista en el manifiesto TODOS los archivos de dist/ (requisito del empaquetado IMS CP / SCORM).
 * - Calcula technical.size (bytes) del paquete.
 * - Copia LICENSE a dist/LICENSE.txt.
 * - Advierte si quedan campos [POR COMPLETAR] en la configuración.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { resolve, relative, join, sep } from 'node:path';

const root = process.cwd();
const distDir = resolve(root, 'dist');
const cfg = JSON.parse(readFileSync(resolve(root, 'src/data/ova.config.json'), 'utf8'));

if (!existsSync(distDir)) {
  console.error('Error: dist/ no existe. Ejecuta primero "vite build".');
  process.exit(1);
}

// Archivos que este script regenera: se eliminan para no duplicarlos en la lista.
for (const f of ['imsmanifest.xml', 'lom-metadata.xml']) rmSync(join(distDir, f), { force: true });
if (existsSync(resolve(root, 'LICENSE'))) copyFileSync(resolve(root, 'LICENSE'), join(distDir, 'LICENSE.txt'));

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const str = (s, indent) => `${indent}<string language="${cfg.language}">${esc(s)}</string>`;
const vocab = (tag, value, indent) =>
  `${indent}<${tag}>\n${indent}  <source>LOMv1.0</source>\n${indent}  <value>${esc(value)}</value>\n${indent}</${tag}>`;

const vcard = (p) =>
  [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${p.name}`,
    `N:${p.name}`,
    p.email ? `EMAIL;TYPE=INTERNET:${p.email}` : null,
    `ORG:${cfg.institution.name}`,
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

// Se escribe primero el LOM para incluirlo en el cálculo de tamaño y en la lista de archivos.
function buildLom(sizeBytes) {
  const contribs = cfg.authors
    .map(
      (p) => `    <contribute>
${vocab('role', p.role, '      ')}
      <entity><![CDATA[${vcard(p)}]]></entity>
      <date><dateTime>${cfg.creationDate}</dateTime></date>
    </contribute>`
    )
    .join('\n');

  const lrt = cfg.educational.learningResourceType.map((v) => vocab('learningResourceType', v, '    ')).join('\n');
  const keywords = cfg.keywords.map((k) => `    <keyword>\n${str(k, '      ')}\n    </keyword>`).join('\n');
  const taxa = cfg.classification.taxonPath
    .map((t) => `        <taxon>\n          <id>${esc(t.id)}</id>\n          <entry>\n${str(t.entry, '            ')}\n          </entry>\n        </taxon>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generado por scripts/build-manifest.mjs desde src/data/ova.config.json. No editar a mano. -->
<lom xmlns="http://ltsc.ieee.org/xsd/LOM">
  <general>
    <identifier>
      <catalog>${esc(cfg.identifier.catalog)}</catalog>
      <entry>${esc(cfg.identifier.entry)}</entry>
    </identifier>
    <title>
${str(cfg.title, '      ')}
    </title>
    <language>${cfg.language}</language>
    <description>
${str(cfg.description, '      ')}
    </description>
${keywords}
    <coverage>
${str(cfg.coverage, '      ')}
    </coverage>
${vocab('structure', 'hierarchical', '    ')}
${vocab('aggregationLevel', '2', '    ')}
  </general>
  <lifeCycle>
    <version>
${str(`${cfg.version} (${cfg.statusLabel})`, '      ')}
    </version>
${vocab('status', cfg.status, '    ')}
${contribs}
  </lifeCycle>
  <metaMetadata>
    <identifier>
      <catalog>${esc(cfg.identifier.catalog)}</catalog>
      <entry>${esc(cfg.identifier.entry)}:metadata</entry>
    </identifier>
    <contribute>
${vocab('role', 'creator', '      ')}
      <entity><![CDATA[${vcard(cfg.authors[0])}]]></entity>
      <date><dateTime>${cfg.creationDate}</dateTime></date>
    </contribute>
    <metadataSchema>LOMv1.0</metadataSchema>
    <metadataSchema>LOM-CO</metadataSchema>
    <language>${cfg.language}</language>
  </metaMetadata>
  <technical>
    <format>text/html</format>
    <format>text/javascript</format>
    <format>text/css</format>
    <size>${sizeBytes}</size>
    <requirement>
      <orComposite>
${vocab('type', 'browser', '        ')}
${vocab('name', 'any', '        ')}
      </orComposite>
    </requirement>
    <installationRemarks>
${str('No requiere instalación. Como paquete SCORM 1.2: cargar el .zip en el LMS (Moodle, Canvas, Blackboard) como actividad SCORM. Fuera de un LMS: abrir index.html servido desde cualquier servidor web estático; el progreso se guarda en el navegador.', '      ')}
    </installationRemarks>
    <otherPlatformRequirements>
${str(`Navegador con HTML5 y ECMAScript 2020. ${cfg.accessibility}`, '      ')}
    </otherPlatformRequirements>
  </technical>
  <educational>
${vocab('interactivityType', cfg.educational.interactivityType, '    ')}
${lrt}
${vocab('interactivityLevel', cfg.educational.interactivityLevel, '    ')}
${vocab('semanticDensity', cfg.educational.semanticDensity, '    ')}
${vocab('intendedEndUserRole', cfg.educational.intendedEndUserRole, '    ')}
${vocab('context', cfg.educational.context, '    ')}
    <typicalAgeRange>
${str(cfg.educational.typicalAgeRange, '      ')}
    </typicalAgeRange>
${vocab('difficulty', cfg.educational.difficulty, '    ')}
    <typicalLearningTime>
      <duration>${cfg.educational.typicalLearningTime}</duration>
    </typicalLearningTime>
    <description>
${str(`${cfg.educational.audience} ${cfg.educational.description} Prerrequisitos: ${cfg.prerequisites.join(' ')}`, '      ')}
    </description>
    <language>${cfg.language}</language>
  </educational>
  <rights>
${vocab('cost', cfg.license.cost, '    ')}
${vocab('copyrightAndOtherRestrictions', 'yes', '    ')}
    <description>
${str(`${cfg.license.name} — ${cfg.license.url}. Titular de los derechos patrimoniales: ${cfg.license.holder}. Ley 23 de 1982 y Decisión Andina 351 de 1993.`, '      ')}
    </description>
  </rights>
  <annotation>
    <entity><![CDATA[BEGIN:VCARD\nVERSION:3.0\nFN:${cfg.annotation.entity}\nEND:VCARD]]></entity>
    <date><dateTime>${cfg.annotation.date}</dateTime></date>
    <description>
${str(cfg.annotation.description, '      ')}
    </description>
  </annotation>
  <classification>
${vocab('purpose', 'discipline', '    ')}
    <taxonPath>
      <source>
${str(cfg.classification.source, '        ')}
      </source>
${taxa}
    </taxonPath>
  </classification>
</lom>
`;
}

// Tamaño aproximado: archivos actuales + LOM (se itera una vez para estabilizar el número).
const baseSize = walk(distDir).reduce((acc, f) => acc + statSync(f).size, 0);
let lomXml = buildLom(baseSize);
lomXml = buildLom(baseSize + Buffer.byteLength(lomXml));
writeFileSync(join(distDir, 'lom-metadata.xml'), lomXml, 'utf8');

const files = walk(distDir)
  .map((f) => relative(distDir, f).split(sep).join('/'))
  .sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)));

const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generado por scripts/build-manifest.mjs desde src/data/ova.config.json. No editar a mano. -->
<manifest identifier="${esc(cfg.identifier.entry.replace(/[^A-Za-z0-9._-]/g, '_'))}" version="${esc(cfg.version)}"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                              http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
    <adlcp:location>lom-metadata.xml</adlcp:location>
  </metadata>
  <organizations default="ORG-PRISMA-LAB">
    <organization identifier="ORG-PRISMA-LAB">
      <title>${esc(cfg.title)}</title>
      <item identifier="ITEM-PRISMA-LAB-SCO" identifierref="RES-PRISMA-LAB-SCO" isvisible="true">
        <title>${esc(cfg.shortTitle)}: diagnóstico, módulos 1–4 y evaluación final</title>
        <adlcp:masteryscore>${cfg.masteryScore}</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-PRISMA-LAB-SCO" type="webcontent" adlcp:scormtype="sco" href="index.html">
${files.map((f) => `      <file href="${esc(f)}" />`).join('\n')}
    </resource>
  </resources>
</manifest>
`;
writeFileSync(join(distDir, 'imsmanifest.xml'), manifest, 'utf8');

console.log(`✓ imsmanifest.xml (${files.length} archivos) y lom-metadata.xml generados en dist/ (paquete ≈ ${baseSize} bytes)`);

const { _instrucciones, ...cfgFields } = cfg;
const pending = JSON.stringify(cfgFields).match(/\[[^\]"]*\]/g);
if (pending) {
  console.warn(`\n⚠ Quedan ${new Set(pending).size} campos por completar en src/data/ova.config.json:`);
  for (const p of new Set(pending)) console.warn(`   ${p}`);
}
