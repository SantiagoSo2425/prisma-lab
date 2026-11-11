/**
 * Validador de Sintaxis Booleana y Reproducibilidad PRISMA-S (Ítem 7 de PRISMA 2020)
 * Evalúa ecuaciones de búsqueda bibliográfica para PubMed/MEDLINE, Scopus, IEEE Xplore y Web of Science.
 */

export interface BooleanValidationResult {
  isValid: boolean;
  score: number; // 0 a 100
  operatorCounts: {
    AND: number;
    OR: number;
    NOT: number;
  };
  hasBalancedParentheses: boolean;
  hasBalancedQuotes: boolean;
  hasFieldTagsOrDescriptors: boolean;
  detectedDescriptors: string[];
  errors: string[];
  warnings: string[];
}

export function validateBooleanQuery(query: string): BooleanValidationResult {
  const trimmed = query.trim();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!trimmed) {
    return {
      isValid: false,
      score: 0,
      operatorCounts: { AND: 0, OR: 0, NOT: 0 },
      hasBalancedParentheses: true,
      hasBalancedQuotes: true,
      hasFieldTagsOrDescriptors: false,
      detectedDescriptors: [],
      errors: ['La ecuación de búsqueda está vacía. El Ítem 7 de PRISMA 2020 exige la estrategia completa tal como fue ejecutada.'],
      warnings: [],
    };
  }

  // 1. Verificar balance de paréntesis
  let depth = 0;
  let balancedParens = true;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '(') depth++;
    if (trimmed[i] === ')') {
      depth--;
      if (depth < 0) {
        balancedParens = false;
        break;
      }
    }
  }
  if (depth !== 0) balancedParens = false;
  if (!balancedParens) {
    errors.push('Paréntesis desbalanceados: verifica que cada bloque lógico "(" tenga su correspondiente cierre ")".');
  }

  // 2. Verificar balance de comillas dobles
  const quoteMatches = trimmed.match(/"/g);
  const balancedQuotes = !quoteMatches || quoteMatches.length % 2 === 0;
  if (!balancedQuotes) {
    errors.push('Comillas dobles (") desbalanceadas en frases exactas.');
  }

  // 3. Conteo de operadores booleanos canónicos en MAYÚSCULAS
  const andMatches = trimmed.match(/\bAND\b/g) || [];
  const orMatches = trimmed.match(/\bOR\b/g) || [];
  const notMatches = trimmed.match(/\bNOT\b/g) || [];

  const operatorCounts = {
    AND: andMatches.length,
    OR: orMatches.length,
    NOT: notMatches.length,
  };

  if (operatorCounts.AND + operatorCounts.OR === 0) {
    errors.push('No se detectaron operadores booleanos explícitos en mayúsculas (AND, OR).');
  }

  // Detectar operadores en minúsculas (mala práctica en motores como PubMed/Scopus)
  if (/\b(and|or|not)\b/.test(trimmed)) {
    warnings.push('Se detectaron operadores booleanos en minúsculas (and/or/not). En bases de datos indizadas deben escribirse en MAYÚSCULAS (AND, OR, NOT) para evitar que se interpreten como palabras vacías (stopwords).');
  }

  // Detectar operadores adyacentes o al inicio/final
  if (/^\s*(AND|OR|NOT)\b/i.test(trimmed) || /\b(AND|OR|NOT)\s*$/i.test(trimmed)) {
    errors.push('La ecuación no puede comenzar ni terminar con un operador booleano suelto (AND/OR/NOT).');
  }
  if (/\b(AND|OR|NOT)\s+(AND|OR)\b/i.test(trimmed)) {
    errors.push('Se detectaron dos operadores booleanos consecutivos sin término intermedio.');
  }

  // 4. Detectar descriptores controlados (MeSH, Emtree) o etiquetas de campo (PRISMA-S)
  const descriptorPatterns = [
    /\[Mesh(?::NoExp)?\]/gi,
    /\[MeSH Terms\]/gi,
    /\[tiab\]/gi,
    /\[Title\/Abstract\]/gi,
    /\[tw\]/gi,
    /\/exp/gi,
    /TITLE-ABS-KEY/gi,
    /TS=/gi,
    /ALL=/gi,
    /INDEXTERMS/gi,
  ];

  const detectedDescriptors: string[] = [];
  descriptorPatterns.forEach((regex) => {
    const matches = trimmed.match(regex);
    if (matches) {
      matches.forEach((m) => {
        if (!detectedDescriptors.includes(m)) {
          detectedDescriptors.push(m);
        }
      });
    }
  });

  const hasFieldTagsOrDescriptors = detectedDescriptors.length > 0;
  if (!hasFieldTagsOrDescriptors) {
    warnings.push(
      'No se detectaron calificadores de campo ni descriptores controlados (ej. [MeSH], [tiab], TITLE-ABS-KEY, /exp, TS=). PRISMA-S recomienda especificar qué campos fueron interrogados.'
    );
  }

  // Advertencia sobre combinación de AND y OR sin paréntesis
  if (operatorCounts.AND > 0 && operatorCounts.OR > 0 && !trimmed.includes('(')) {
    errors.push(
      'Ambigüedad de precedencia booleana: Combinaste AND y OR sin paréntesis de agrupación. Agrupa los sinónimos con paréntesis: (A OR B) AND (C OR D).'
    );
  }

  // Calcular puntaje de calidad PRISMA-S
  let score = 100;
  score -= errors.length * 35;
  score -= warnings.length * 15;
  if (operatorCounts.AND > 0 && operatorCounts.OR > 0) score += 5;
  if (hasFieldTagsOrDescriptors) score += 5;
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: errors.length === 0,
    score,
    operatorCounts,
    hasBalancedParentheses: balancedParens,
    hasBalancedQuotes: balancedQuotes,
    hasFieldTagsOrDescriptors,
    detectedDescriptors,
    errors,
    warnings,
  };
}
