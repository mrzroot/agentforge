export interface CompressedCode {
  originalCode: string;
  skeletonCode: string;
  language: string;
  linesRemoved: number;
  originalLines: number;
  skeletonLines: number;
}

/**
 * Multi-Language AST Skeletonizer
 * Extracts structural declarations (classes, interfaces, types, functions, method signatures,
 * docstrings, exports, schema fields) while compressing routine bodies down to concise placeholders.
 */
export function extractSkeleton(code: string, filename: string): CompressedCode {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const lines = code.split('\n');
  const originalLines = lines.length;

  let skeleton = '';
  let language = 'text';

  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      language = ext.startsWith('ts') ? 'typescript' : 'javascript';
      skeleton = skeletonizeJsTs(code);
      break;

    case 'py':
      language = 'python';
      skeleton = skeletonizePython(code);
      break;

    case 'go':
      language = 'go';
      skeleton = skeletonizeGo(code);
      break;

    case 'rs':
      language = 'rust';
      skeleton = skeletonizeRust(code);
      break;

    case 'php':
      language = 'php';
      skeleton = skeletonizePhp(code);
      break;

    case 'json':
      language = 'json';
      skeleton = skeletonizeJson(code);
      break;

    default:
      // For general code files, perform smart comment/structure preservation
      language = ext || 'text';
      skeleton = skeletonizeGeneric(code);
      break;
  }

  const skeletonLines = skeleton.split('\n').length;
  const linesRemoved = Math.max(0, originalLines - skeletonLines);

  return {
    originalCode: code,
    skeletonCode: skeleton,
    language,
    linesRemoved,
    originalLines,
    skeletonLines
  };
}

/**
 * JS/TS Skeletonizer
 * Preserves imports, interfaces, type aliases, class structures, method signatures, exported constants,
 * but compresses function and method bodies.
 */
function skeletonizeJsTs(code: string): string {
  const lines = code.split('\n');
  const output: string[] = [];
  let inBlockComment = false;
  let braceDepth = 0;
  let skippingFunctionBody = false;
  let skipBraceLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Preserve block comments / JSDocs
    if (trimmed.startsWith('/*') || inBlockComment) {
      output.push(line);
      if (trimmed.includes('*/')) inBlockComment = false;
      else inBlockComment = true;
      continue;
    }

    // Preserve imports, exports of types/interfaces, simple definitions
    if (
      trimmed.startsWith('import ') ||
      trimmed.startsWith('export type ') ||
      trimmed.startsWith('type ') ||
      trimmed.startsWith('export interface ') ||
      trimmed.startsWith('interface ') ||
      trimmed.startsWith('//')
    ) {
      output.push(line);
      continue;
    }

    // Function, method, or class detection
    const isFunctionHeader = 
      /^(export\s+)?(async\s+)?function\s+[\w$]+\s*\(/.test(trimmed) ||
      /^(export\s+)?(const|let|var)\s+[\w$]+\s*=\s*(async\s+)?\(.*?\)\s*(=>|\{)/.test(trimmed) ||
      /^(public|private|protected|static|async|\s)*\s*[\w$]+\s*\(.*?\)(\s*:\s*[^{]+)?\s*\{?$/.test(trimmed) ||
      /^(export\s+)?(default\s+)?class\s+[\w$]+/.test(trimmed);

    // Track braces
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;

    if (!skippingFunctionBody && isFunctionHeader) {
      if (openBraces > 0 && openBraces > closeBraces) {
        // Function opening line
        const header = line.split('{')[0].trimEnd();
        output.push(`${header} { /* ... */ }`);
        skippingFunctionBody = true;
        skipBraceLevel = braceDepth;
        braceDepth += (openBraces - closeBraces);
        continue;
      } else {
        output.push(line);
      }
    } else if (skippingFunctionBody) {
      braceDepth += (openBraces - closeBraces);
      if (braceDepth <= skipBraceLevel) {
        skippingFunctionBody = false;
      }
      continue;
    } else {
      // General statements
      if (trimmed.length > 0) {
        output.push(line);
      }
    }

    braceDepth += (openBraces - closeBraces);
  }

  return output.join('\n');
}

/**
 * Python Skeletonizer
 * Preserves imports, class definitions, function signatures, docstrings, and decorators.
 */
function skeletonizePython(code: string): string {
  const lines = code.split('\n');
  const output: string[] = [];
  let inDocstring = false;
  let docstringDelimiter = '';
  let skippingBody = false;
  let currentIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Preserve empty lines & comments
    if (trimmed.startsWith('#') || trimmed.length === 0) {
      if (!skippingBody) output.push(line);
      continue;
    }

    // Docstring handling
    if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
      output.push(line);
      const delim = trimmed.substring(0, 3);
      if (trimmed.length > 3 && trimmed.endsWith(delim)) {
        // One-line docstring
        inDocstring = false;
      } else {
        inDocstring = true;
        docstringDelimiter = delim;
      }
      continue;
    }

    if (inDocstring) {
      output.push(line);
      if (trimmed.includes(docstringDelimiter)) {
        inDocstring = false;
      }
      continue;
    }

    // Calculate indentation
    const indent = line.search(/\S/);

    // Decorators, classes, function headers
    if (trimmed.startsWith('@') || trimmed.startsWith('class ') || trimmed.startsWith('def ') || trimmed.startsWith('async def ')) {
      skippingBody = false;
      output.push(line);

      if (trimmed.endsWith(':')) {
        // Peek next line for docstring
        if (i + 1 < lines.length) {
          const nextTrimmed = lines[i + 1].trim();
          if (nextTrimmed.startsWith('"""') || nextTrimmed.startsWith("'''")) {
            // let docstring through
            continue;
          }
        }
        // Add ellipsis placeholder
        const pad = ' '.repeat(indent + 4);
        output.push(`${pad}...`);
        skippingBody = true;
        currentIndent = indent;
      }
      continue;
    }

    // Imports and module constants
    if (trimmed.startsWith('import ') || trimmed.startsWith('from ') || /^[A-Z_0-9]+\s*[:=]/.test(trimmed)) {
      skippingBody = false;
      output.push(line);
      continue;
    }

    if (skippingBody) {
      if (indent <= currentIndent && trimmed.length > 0) {
        skippingBody = false;
        output.push(line);
      }
    } else {
      output.push(line);
    }
  }

  return output.join('\n');
}

/**
 * Go Skeletonizer
 * Preserves package, imports, types, structs, interfaces, and function headers.
 */
function skeletonizeGo(code: string): string {
  const lines = code.split('\n');
  const output: string[] = [];
  let inFunc = false;
  let braceCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('package ') || trimmed.startsWith('import ') || trimmed.startsWith('type ') || trimmed.startsWith('//')) {
      output.push(line);
      continue;
    }

    if (trimmed.startsWith('func ') || /func\s*\([^)]*\)\s*\w+/.test(trimmed)) {
      if (trimmed.includes('{')) {
        const header = line.split('{')[0].trimEnd();
        output.push(`${header} { /* ... */ }`);
        inFunc = true;
        braceCount = 1;
        continue;
      }
    }

    if (inFunc) {
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;
      if (braceCount <= 0) {
        inFunc = false;
      }
      continue;
    }

    if (trimmed.length > 0) {
      output.push(line);
    }
  }

  return output.join('\n');
}

/**
 * Rust Skeletonizer
 * Preserves use, struct, enum, trait, impl signatures, and pub fn signatures.
 */
function skeletonizeRust(code: string): string {
  const lines = code.split('\n');
  const output: string[] = [];
  let inFunc = false;
  let braceCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (
      trimmed.startsWith('use ') ||
      trimmed.startsWith('pub struct ') ||
      trimmed.startsWith('struct ') ||
      trimmed.startsWith('pub enum ') ||
      trimmed.startsWith('enum ') ||
      trimmed.startsWith('pub trait ') ||
      trimmed.startsWith('trait ') ||
      trimmed.startsWith('impl ') ||
      trimmed.startsWith('#[') ||
      trimmed.startsWith('//')
    ) {
      output.push(line);
      continue;
    }

    if (trimmed.startsWith('pub fn ') || trimmed.startsWith('fn ') || trimmed.startsWith('pub async fn ') || trimmed.startsWith('async fn ')) {
      if (trimmed.includes('{')) {
        const header = line.split('{')[0].trimEnd();
        output.push(`${header} { /* ... */ }`);
        inFunc = true;
        braceCount = 1;
        continue;
      }
    }

    if (inFunc) {
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;
      if (braceCount <= 0) {
        inFunc = false;
      }
      continue;
    }

    if (trimmed.length > 0) {
      output.push(line);
    }
  }

  return output.join('\n');
}

/**
 * PHP Skeletonizer
 */
function skeletonizePhp(code: string): string {
  return skeletonizeJsTs(code);
}

/**
 * JSON Skeletonizer (extracts top-level schema/keys without huge array payloads)
 */
function skeletonizeJson(code: string): string {
  try {
    const obj = JSON.parse(code);
    if (Array.isArray(obj)) {
      return JSON.stringify(obj.slice(0, 2), null, 2) + '\n// ... [Array truncated for context]';
    }
    return JSON.stringify(obj, null, 2);
  } catch {
    return code;
  }
}

/**
 * Generic Fallback Skeletonizer
 */
function skeletonizeGeneric(code: string): string {
  const lines = code.split('\n');
  if (lines.length <= 40) return code;
  return lines.slice(0, 30).join('\n') + `\n\n/* ... [${lines.length - 30} lines compressed for LLM context] ... */\n`;
}
