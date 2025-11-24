import { tokenize } from '../src/tokenizer';
import { parse } from '../src/parser';

describe('parser', () => {
  it('parses select with time and route', () => {
    const sql = `
      @t[123;lane=demo;seq=1]
      SELECT user_id, COUNT
      FROM event_stream
      TIME BETWEEN '2025-10-01T00:00:00Z' AND '2025-10-02T00:00:00Z'
      WHERE event_type = 'click'
      ROUTE BIGQUERY 'analytics.user_events';
    `;

    const tokens = tokenize(sql);
    const ast = parse(tokens);

    expect(ast.type).toBe('select');
    expect(ast.timeLabel).toContain('@t[');
    expect(ast.table).toBe('event_stream');
    expect(ast.timeWindow?.start).toBe('2025-10-01T00:00:00Z');
    expect(ast.route?.backend).toBe('BIGQUERY');
  });
});
