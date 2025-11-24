import { SelectStatement } from './ast';

export type LogicalPlanNodeType =
  | 'scan'
  | 'filter'
  | 'block'
  | 'project'
  | 'time_window'
  | 'route';

export interface LogicalPlanNodeBase {
  type: LogicalPlanNodeType;
}

export interface ScanNode extends LogicalPlanNodeBase {
  type: 'scan';
  table: string;
}

export interface TimeWindowNode extends LogicalPlanNodeBase {
  type: 'time_window';
  start: string;
  end: string;
}

export interface BlockNode extends LogicalPlanNodeBase {
  type: 'block';
  field: string;
}

export interface FilterNode extends LogicalPlanNodeBase {
  type: 'filter';
  expression: unknown; // direct from AST for now
}

export interface ProjectNode extends LogicalPlanNodeBase {
  type: 'project';
  columns: '*' | string[];
}

export interface RouteNode extends LogicalPlanNodeBase {
  type: 'route';
  backend: string;
  target: string;
}

export type LogicalPlanNode =
  | ScanNode
  | TimeWindowNode
  | BlockNode
  | FilterNode
  | ProjectNode
  | RouteNode;

export interface LogicalPlan {
  kind: 'logical_plan';
  timeLabel?: string | null;
  nodes: LogicalPlanNode[];
}

export function planQuery(stmt: SelectStatement): LogicalPlan {
  const nodes: LogicalPlanNode[] = [];

  // scan
  nodes.push({
    type: 'scan',
    table: stmt.table
  });

  // time window
  if (stmt.timeWindow) {
    nodes.push({
      type: 'time_window',
      start: stmt.timeWindow.start,
      end: stmt.timeWindow.end
    });
  }

  // block
  if (stmt.blockBy) {
    nodes.push({
      type: 'block',
      field: stmt.blockBy
    });
  }

  // where
  if (stmt.where) {
    nodes.push({
      type: 'filter',
      expression: stmt.where
    });
  }

  // projection
  if (stmt.columns === '*') {
    nodes.push({
      type: 'project',
      columns: '*'
    });
  } else {
    nodes.push({
      type: 'project',
      columns: stmt.columns.map((c) => c.alias ?? c.expression.name)
    });
  }

  // route
  if (stmt.route) {
    nodes.push({
      type: 'route',
      backend: stmt.route.backend,
      target: stmt.route.target
    });
  }

  return {
    kind: 'logical_plan',
    timeLabel: stmt.timeLabel,
    nodes
  };
}
