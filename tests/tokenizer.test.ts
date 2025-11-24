import { tokenize } from '../src/tokenizer';

describe('tokenize', () => {
  it('tokenizes a basic select with time and route', () => {
    const sql = `
      @t[123;lane=demo;seq=1]
      SELECT user_id
      FROM event_stream
      TIME BETWEEN '2025-10-01T00:00:00Z' AND '2025-10-02T00:00:00Z'
      WHERE event_type = 'click'
      ROUTE BIGQUERY 'analytics.user_events';
    `;

    const tokens = tokenize(sql);
    expect(tokens.some((t) => t.type === 'TIME_LABEL')).toBe(true);
    expect(tokens.some((t) => t.value === 'SELECT')).toBe(true);
    expect(tokens.some((t) => t.value === 'TIME')).toBe(true);
    expect(tokens.some((t) => t.value === 'BIGQUERY')).toBe(true);
  });
});
