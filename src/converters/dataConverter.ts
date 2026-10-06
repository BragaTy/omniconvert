import * as XLSX from 'xlsx';
import * as yaml from 'js-yaml';
import { ConversionOptions } from '../types';

export async function convertData(
  file: File,
  targetFormat: string,
  options: ConversionOptions
): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const inputExt = (file.name.split('.').pop() || '').toLowerCase();
  const target = targetFormat.toLowerCase();

  // First, parse input file into a normalized JavaScript data structure
  let normalizedData: any = null;

  if (inputExt === 'xlsx' || inputExt === 'xls') {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    normalizedData = XLSX.utils.sheet_to_json(sheet);
  } else if (inputExt === 'csv' || inputExt === 'tsv') {
    const text = await file.text();
    const delimiter = inputExt === 'tsv' ? '\t' : (options.csvDelimiter || ',');
    normalizedData = parseCsvToObjects(text, delimiter);
  } else if (inputExt === 'json') {
    const text = await file.text();
    try {
      normalizedData = JSON.parse(text);
    } catch {
      throw new Error('Arquivo JSON inválido ou mal formatado.');
    }
  } else if (inputExt === 'yaml' || inputExt === 'yml') {
    const text = await file.text();
    try {
      normalizedData = yaml.load(text);
    } catch {
      throw new Error('Arquivo YAML inválido ou mal formatado.');
    }
  } else if (inputExt === 'xml') {
    const text = await file.text();
    normalizedData = parseXmlToJson(text);
  } else {
    // Fallback: try reading as plain text or JSON
    const text = await file.text();
    try {
      normalizedData = JSON.parse(text);
    } catch {
      normalizedData = [{ content: text }];
    }
  }

  // Now, serialize normalizedData into the requested targetFormat
  switch (target) {
    case 'json': {
      const indent = options.jsonIndent ?? 2;
      const jsonStr = JSON.stringify(normalizedData, null, indent);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      return { blob, filename: `${baseName}.json` };
    }

    case 'xlsx': {
      const wb = XLSX.utils.book_new();
      const rows = Array.isArray(normalizedData) ? normalizedData : [normalizedData];
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');
      const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbOut], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      return { blob, filename: `${baseName}.xlsx` };
    }

    case 'csv': {
      const delimiter = options.csvDelimiter || ',';
      const csvStr = objectsToCsv(normalizedData, delimiter);
      const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8' });
      return { blob, filename: `${baseName}.csv` };
    }

    case 'tsv': {
      const tsvStr = objectsToCsv(normalizedData, '\t');
      const blob = new Blob(['\uFEFF' + tsvStr], { type: 'text/tab-separated-values;charset=utf-8' });
      return { blob, filename: `${baseName}.tsv` };
    }

    case 'yaml':
    case 'yml': {
      const yamlStr = yaml.dump(normalizedData, { indent: options.yamlIndent ?? 2 });
      const blob = new Blob([yamlStr], { type: 'application/x-yaml;charset=utf-8' });
      return { blob, filename: `${baseName}.yaml` };
    }

    case 'xml': {
      const xmlStr = jsonToXml(normalizedData);
      const blob = new Blob([xmlStr], { type: 'application/xml;charset=utf-8' });
      return { blob, filename: `${baseName}.xml` };
    }

    case 'html': {
      const htmlTable = objectsToHtmlTable(normalizedData, baseName);
      const blob = new Blob([htmlTable], { type: 'text/html;charset=utf-8' });
      return { blob, filename: `${baseName}.html` };
    }

    case 'txt': {
      let txtContent = '';
      if (typeof normalizedData === 'string') {
        txtContent = normalizedData;
      } else {
        txtContent = JSON.stringify(normalizedData, null, 2);
      }
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      return { blob, filename: `${baseName}.txt` };
    }

    default:
      throw new Error(`Formato de destino não suportado para dados: ${targetFormat}`);
  }
}

// Helper: Parse CSV text to list of objects
function parseCsvToObjects(csvText: string, delimiter: string = ','): any[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = splitCsvLine(lines[0], delimiter);
  const result: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i], delimiter);
    const obj: Record<string, any> = {};
    headers.forEach((header, idx) => {
      obj[header.trim()] = values[idx] !== undefined ? values[idx] : '';
    });
    result.push(obj);
  }

  return result;
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const pattern = new RegExp(
    '(\\' + delimiter + '|\\r?\\n|\\r|^)' +
    '(?:"([^"]*(?:""[^"]*)*)"|([^"\\' + delimiter + '\\r\\n]*))',
    'gi'
  );
  const result: string[] = [];
  let match: RegExpExecArray | null = null;
  while ((match = pattern.exec(line)) !== null) {
    if (match.index === pattern.lastIndex) {
      pattern.lastIndex++;
    }
    const matchedValue = match[2] ? match[2].replace(/""/g, '"') : match[3];
    result.push(matchedValue ?? '');
  }
  return result;
}

// Helper: Convert array of objects or object to CSV
function objectsToCsv(data: any, delimiter: string = ','): string {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0] || {});
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [headers.map(escapeCsv).join(delimiter)];
  for (const row of rows) {
    const rowValues = headers.map(h => escapeCsv(row[h]));
    csvRows.push(rowValues.join(delimiter));
  }
  return csvRows.join('\r\n');
}

// Helper: Convert XML string to JSON
function parseXmlToJson(xmlText: string): any {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const parseNode = (node: Node): any => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue?.trim() || '';
    }
    const obj: any = {};
    if (node.childNodes && node.childNodes.length > 0) {
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.ELEMENT_NODE) {
          const childName = child.nodeName;
          const childValue = parseNode(child);
          if (obj[childName]) {
            if (!Array.isArray(obj[childName])) {
              obj[childName] = [obj[childName]];
            }
            obj[childName].push(childValue);
          } else {
            obj[childName] = childValue;
          }
        }
      }
    }
    return obj;
  };
  return parseNode(xmlDoc.documentElement);
}

// Helper: Convert JSON object to XML string
function jsonToXml(obj: any, rootName: string = 'root'): string {
  const buildXml = (data: any, name: string): string => {
    if (data === null || data === undefined) return `<${name}/>`;
    if (typeof data !== 'object') {
      const escaped = String(data)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<${name}>${escaped}</${name}>`;
    }
    if (Array.isArray(data)) {
      return data.map(item => buildXml(item, 'item')).join('\n');
    }
    let inner = '';
    for (const key of Object.keys(data)) {
      const validTag = key.replace(/[^a-zA-Z0-9_-]/g, '_');
      inner += buildXml(data[key], validTag) + '\n';
    }
    return `<${name}>\n${inner}</${name}>`;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n${buildXml(obj, rootName)}`;
}

// Helper: Convert objects to styled HTML Table
function objectsToHtmlTable(data: any, title: string): string {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) return `<!DOCTYPE html><html><body><p>Nenhum dado encontrado.</p></body></html>`;

  const headers = Object.keys(rows[0] || {});
  const thead = headers.map(h => `<th style="padding: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600;">${h}</th>`).join('');
  const tbody = rows.map(r => {
    const cells = headers.map(h => `<td style="padding: 10px; border: 1px solid #e2e8f0;">${r[h] ?? ''}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; background: #f8fafc; color: #1e293b; }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <table>
    <thead><tr>${thead}</tr></thead>
    <tbody>${tbody}</tbody>
  </table>
</body>
</html>`;
}
