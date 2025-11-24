import {
  BackendType,
  Identifier,
  Literal,
  NumberLiteral,
  SelectItem,
  SelectStatement,
  StringLiteral,
  TimeWindow,
  WhereExpression
} from './ast';
import { Token, TokenType } from './tokenizer';

export class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  static parse(tokens: Token[]): SelectStatement {
    const parser = new Parser(tokens);
    return parser.parseQuery();
  }

  private current(): Token {
    return this.tokens[this.pos];
  }

  private consume(type?: TokenType, value?: string): Token {
    const token = this.current();
    if (type && token.type !== type) {
      throw new Error(`Expected token type ${type} but got ${token.type}`);
    }
    if (value && token.value.toUpperCase() !== value.toUpperCase()) {
      throw new Error(`Expected token value ${value} but got ${token.value}`);
    }
    this.pos++;
    return token;
  }

  private match(type: TokenType, value?: string): boolean {
    const token = this.current();
    if (token.type !== type) return false;
    if (value && token.value.toUpperCase() !== value.toUpperCase()) {
      return false;
    }
    return true;
  }

  parseQuery(): SelectStatement {
    let timeLabel: string | null = null;

    if (this.match('TIME_LABEL')) {
      timeLabel = this.consume('TIME_LABEL').value;
    }

    const selectStmt = this.parseSelectStmt();
    selectStmt.timeLabel = timeLabel;

    // optional semicolon
    if (this.match('SYMBOL', ';')) {
      this.consume('SYMBOL', ';');
    }

    return selectStmt;
  }

  private parseSelectStmt(): SelectStatement {
    this.consume('KEYWORD', 'SELECT');
    const columns = this.parseSelectList();

    this.consume('KEYWORD', 'FROM');
    const tableToken = this.consume('IDENTIFIER');
    const table = tableToken.value;

    const timeWindow = this.parseTimeClauseOpt();
    const blockBy = this.parseBlockClauseOpt();
    const where = this.parseWhereClauseOpt();
    const route = this.parseRouteClauseOpt();

    return {
      type: 'select',
      columns,
      table,
      timeWindow: timeWindow || undefined,
      blockBy: blockBy || undefined,
      where: where || undefined,
      route: route || undefined
    };
  }

  private parseSelectList(): SelectItem[] | '*' {
    if (this.match('SYMBOL', '*')) {
      this.consume('SYMBOL', '*');
      return '*';
    }

    const items: SelectItem[] = [];
    items.push(this.parseSelectItem());

    while (this.match('SYMBOL', ',')) {
      this.consume('SYMBOL', ',');
      items.push(this.parseSelectItem());
    }

    return items;
  }

  private parseSelectItem(): SelectItem {
    const idToken = this.consume('IDENTIFIER');
    const expr: Identifier = { kind: 'identifier', name: idToken.value };

    let alias: string | undefined;
    if (this.match('IDENTIFIER')) {
      alias = this.consume('IDENTIFIER').value;
    }

    return { expression: expr, alias };
  }

  private parseTimeClauseOpt(): TimeWindow | null {
    if (!this.match('KEYWORD', 'TIME')) return null;
    this.consume('KEYWORD', 'TIME');
    this.consume('KEYWORD', 'BETWEEN');
    const start = this.consume('STRING').value;
    this.consume('KEYWORD', 'AND');
    const end = this.consume('STRING').value;
    return { start, end };
  }

  private parseBlockClauseOpt(): string | null {
    if (!this.match('KEYWORD', 'BLOCK')) return null;
    this.consume('KEYWORD', 'BLOCK');
    this.consume('KEYWORD', 'BY');
    const id = this.consume('IDENTIFIER').value;
    return id;
  }

  private parseWhereClauseOpt(): WhereExpression | undefined {
    if (!this.match('KEYWORD', 'WHERE')) return undefined;
    this.consume('KEYWORD', 'WHERE');
    return this.parseExpr();
  }

  private parseExpr(): WhereExpression {
    // simple: function call or comparison
    if (this.match('IDENTIFIER')) {
      const idToken = this.consume('IDENTIFIER');
      // function call?
      if (this.match('SYMBOL', '(')) {
        const funcName = idToken.value;
        this.consume('SYMBOL', '(');
        const args: (Identifier | Literal)[] = [];
        if (!this.match('SYMBOL', ')')) {
          args.push(this.parseTerm());
          while (this.match('SYMBOL', ',')) {
            this.consume('SYMBOL', ',');
            args.push(this.parseTerm());
          }
        }
        this.consume('SYMBOL', ')');
        return {
          type: 'function',
          funcName,
          args
        };
      }

      // comparison?
      const left: Identifier = { kind: 'identifier', name: idToken.value };
      if (this.match('SYMBOL', '=')) {
        this.consume('SYMBOL', '=');
        const right = this.parseTerm();
        return {
          type: 'comparison',
          operator: '=',
          left,
          right
        };
      }

      // bare identifier as function-ish? treat as function with no args
      return {
        type: 'function',
        funcName: idToken.value,
        args: []
      };
    }

    // fallback: literal
    const term = this.parseTerm();
    return {
      type: 'function',
      funcName: 'literal',
      args: [term]
    };
  }

  private parseTerm(): Identifier | Literal {
    if (this.match('IDENTIFIER')) {
      const token = this.consume('IDENTIFIER');
      return { kind: 'identifier', name: token.value };
    }
    if (this.match('STRING')) {
      const token = this.consume('STRING');
      const lit: StringLiteral = { kind: 'string', value: token.value };
      return lit;
    }
    if (this.match('NUMBER')) {
      const token = this.consume('NUMBER');
      const lit: NumberLiteral = {
        kind: 'number',
        value: Number(token.value)
      };
      return lit;
    }
    throw new Error(`Unexpected token in term: ${this.current().type} ${this.current().value}`);
  }

  private parseRouteClauseOpt():
    | {
        backend: BackendType;
        target: string;
      }
    | undefined {
    if (!this.match('KEYWORD', 'ROUTE')) return undefined;
    this.consume('KEYWORD', 'ROUTE');

    const backendToken = this.consume('KEYWORD');
    const backend = backendToken.value.toUpperCase() as BackendType;

    const target = this.consume('STRING').value;

    return { backend, target };
  }
}

export function parse(tokens: Token[]): SelectStatement {
  return Parser.parse(tokens);
}
