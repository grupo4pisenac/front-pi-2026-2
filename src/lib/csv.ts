export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

function escape(cell: string | number): string {
  const s = String(cell);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV com `;` e BOM — abre corretamente no Excel em pt-BR. */
export function toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
  const head = columns.map((c) => escape(c.header)).join(';');
  const body = rows.map((r) => columns.map((c) => escape(c.value(r))).join(';'));
  return '﻿' + [head, ...body].join('\n');
}

export function downloadFile(content: string, filename: string, mime = 'text/csv;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
