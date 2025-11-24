import { tokenize } from '../src/tokenizer';
import { parse } from '../src/parser';
import { planQuery } from '../src/planner';

describe('planner', () => {
  it('builds logical plan from ast', () => {
    const sql = `
      SELECT user_id
      FROM event_stream
      TIME BETWEEN '2025-10-01T00:00:00Z' AND '2025-10-02T00:00:00Z'
      WHERE event_type = 'click'
      ROUTE BIGQUERY 'analytics.user_events';
    `;

    const ast = parse(tokenize(sql));
    const plan = planQuery(ast);

    expect(plan.nodes.find((n) => n.type === 'scan')).toBeDefined();
    expect(plan.nodes.find((n) => n.type === 'time_window')).toBeDefined();
    expect(plan.nodes.find((n) => n.type === 'filter')).toBeDefined();
    expect(plan.nodes.find((n) => n.type === 'project')).toBeDefined();
    expect(plan.nodes.find((n) => n.type === 'route')).toBeDefined();
  });
});
