import { LogicalPlan, LogicalPlanNode } from '../planner';

export interface CompiledQuery {
  sql: string;
  target: string;
  backend: 'BIGQUERY';
}

export class BigQueryBackend {
  compile(plan: LogicalPlan): CompiledQuery {
    let table = '';
    let whereClauses: string[] = [];
    let selectColumns = '*';
    let target = '';

    for (const node of plan.nodes) {
      switch (node.type) {
        case 'scan':
          table = (node as any).table;
          break;
        case 'time_window': {
          const n = node as any;
          whereClauses.push(
            `timestamp BETWEEN '${n.start}' AND '${n.end}'`
          );
          break;
        }
        case 'block': {
          // can be translated into GROUP BY or CLUSTER BY later
          break;
        }
        case 'filter':
          // naive translation for demo
          whereClauses.push('-- FILTER EXPRESSION (see AST)');
          break;
        case 'project': {
          const n = node as any;
          if (n.columns !== '*') {
            selectColumns = (n.columns as string[]).join(', ');
          }
          break;
        }
        case 'route': {
          const n = node as any;
          target = n.target;
          break;
        }
      }
    }

    const whereSQL =
      whereClauses.length > 0 ? `\nWHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `SELECT ${selectColumns}
FROM \`${table}\`${whereSQL};`;

    return {
      sql,
      target,
      backend: 'BIGQUERY'
    };
  }
}
