/**
 * Script de Empaquetamiento SCORM 1.2 (ADL SCORM / IEEE LOM-CO)
 * Genera el archivo prisma-lab-scorm12.zip a partir de dist/ incluyendo imsmanifest.xml y lom-metadata.xml en la raíz.
 */
import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');
const outputZip = resolve(process.cwd(), 'prisma-lab-scorm12.zip');

if (!existsSync(distDir)) {
  console.error('Error: El directorio dist/ no existe. Ejecuta primero "npm run build".');
  process.exit(1);
}

if (existsSync(outputZip)) {
  rmSync(outputZip, { force: true });
}

try {
  if (process.platform === 'win32') {
    // Compress-Archive (PowerShell 5.1) escribe las rutas con "\", que un LMS en Linux (Moodle)
    // interpreta como parte del nombre del archivo. Se arma el zip con .NET y separadores "/".
    const ps = [
      'Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem',
      `$src = '${distDir}'`,
      `$zip = [System.IO.Compression.ZipFile]::Open('${outputZip}', 'Create')`,
      'try {',
      '  Get-ChildItem -Path $src -Recurse -File | ForEach-Object {',
      "    $entry = $_.FullName.Substring($src.Length + 1).Replace('\\', '/')",
      '    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entry) | Out-Null',
      '  }',
      '} finally { $zip.Dispose() }',
    ].join('; ');
    execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
  } else {
    execSync(`cd "${distDir}" && zip -r "${outputZip}" .`, { stdio: 'inherit' });
  }
  console.log(`\n✓ Paquete SCORM 1.2 + IEEE LOM-CO generado exitosamente en: ${outputZip}`);
} catch (error) {
  console.error('Error al generar el archivo .zip SCORM:', error);
  process.exit(1);
}
