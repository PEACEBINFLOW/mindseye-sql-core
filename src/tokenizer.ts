export type TokenType =
  | 'IDENTIFIER'
  | 'KEYWORD'
  | 'STRING'
  | 'NUMBER'
  | 'SYMBOL'
  | 'TIME_LABEL'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

const KEYWORDS = new Set([
  'SELECT',
  'FROM',
  'WHERE',
  'TIME',
  'BETWEEN',
  'AND',
  'BLOCK',
  'BY',
  'ROUTE',
  'BIGQUERY',
  'CLOUDSQL',
  'FIRESTORE',
  'GCS'
]);

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const push = (type: TokenType, value: string, position: number) => {
    tokens.push({ type, value, position });
  };

  while (i < input.length) {
    const ch = input[i];

    // whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // time label @t[ ... ]
    if (ch === '@' && input.slice(i, i + 2) === '@t') {
      const start = i;
      const end = input.indexOf(']', i);
      if (end === -1) {
        throw new Error(`Unterminated time label at position ${i}`);
      }
      const value = input.slice(start, end + 1);
      push('TIME_LABEL', value, start);
      i = end + 1;
      continue;
    }

    // string
    if (ch === '\'') {
      const start = i;
      i++;
      let str = '';
      while (i < input.length && input[i] !== '\'') {
        str += input[i];
        i++;
      }
      if (input[i] !== '\'') {
        throw new Error(`Unterminated string literal at position ${start}`);
      }
      i++; // skip closing quote
      push('STRING', str, start);
      continue;
    }

    // number
    if (/[0-9]/.test(ch)) {
      const start = i;
      let num = '';
      while (i < input.length && /[0-9.]/.test(input[i])) {
        num += input[i];
        i++;
      }
      push('NUMBER', num, start);
      continue;
    }

    // identifier / keyword
    if (/[A-Za-z_]/.test(ch)) {
      const start = i;
      let id = '';
      while (i < input.length && /[A-Za-z0-9_]/.test(input[i])) {
        id += input[i];
        i++;
      }
      const upper = id.toUpperCase();
      if (KEYWORDS.has(upper)) {
        push('KEYWORD', upper, start);
      } else {
        push('IDENTIFIER', id, start);
      }
      continue;
    }

    // symbols
    if (['*', ',', '(', ')', '=', ';', '.'].includes(ch)) {
      push('SYMBOL', ch, i);
      i++;
      continue;
    }

    throw new Error(`Unexpected character '${ch}' at position ${i}`);
  }

  push('EOF', '', input.length);
  return tokens;
}
