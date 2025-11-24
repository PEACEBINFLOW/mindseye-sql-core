```ts
export type BackendType = 'BIGQUERY' | 'CLOUDSQL' | 'FIRESTORE' | 'GCS';

export interface TimeWindow {
  start: string;
  end: string;
}

export interface WhereExpression {
  type: 'comparison' | 'function';
  operator?: '=';
  left?: Identifier | Literal;
  right?: Identifier | Literal;
  funcName?: string;
  args?: (Identifier | Literal)[];
}

export interface Identifier {
  kind: 'identifier';
  name: string;
}

export interface StringLiteral {
  kind: 'string';
  value: string;
}

export interface NumberLiteral {
  kind: 'number';
  value: number;
}

export type Literal = StringLiteral | NumberLiteral;

export interface SelectItem {
  expression: Identifier;
  alias?: string;
}

export interface SelectStatement {
  type: 'select';
  timeLabel?: string | null;
  columns: SelectItem[] | '*';
  table: string;
  timeWindow?: TimeWindow;
  blockBy?: string;
  where?: WhereExpression;
  route?: {
    backend: BackendType;
    target: string;
  };
}
