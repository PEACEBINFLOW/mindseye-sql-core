import { tokenize } from '../src/tokenizer';
import { parse } from '../src/parser';
import { planQuery } from '../src/planner';
import { BigQueryBackend } from '../src/backends/bigquery';
import { CloudSQLBackend } from '../src/backends/cloudsql';
import { FirestoreBackend } from '../src/backends/firestore';
import { GCSBackend } from '../src/backends/gcs';

const baseSql = `
  SELECT user_id
  FROM event_stream
  TIME BETWEEN '2025-10-01T00:00:00Z' AND '2025-10-02T00:00:00Z'
  WHERE event_type = 'click'
  ROUTE BIGQUERY 'analytics.user_events';
`;

describe('backends', () => {
  it('compiles BigQuery query', () => {
    const ast = parse(tokenize(baseSql));
    const plan = planQuery(ast);
    const backend = new BigQueryBackend();
    const compiled = backend.compile(plan);

    expect(compiled.backend).toBe('BIGQUERY');
    expect(compiled.sql).toContain('SELECT');
    expect(compiled.sql).toContain('FROM `event_stream`');
  });

  it('compiles CloudSQL query', () => {
    const sql = baseSql.replace('BIGQUERY', 'CLOUDSQL').replace(
      '\'analytics.user_events\'',
      '\'app.user_events\''
    );
    const ast = parse(tokenize(sql));
    const plan = planQuery(ast);
    const backend = new CloudSQLBackend();
    const compiled = backend.compile(plan);

    expect(compiled.backend).toBe('CLOUDSQL');
    expect(compiled.sql).toContain('FROM event_stream');
  });

  it('compiles Firestore description', () => {
    const sql = baseSql.replace('BIGQUERY', 'FIRESTORE');
    const ast = parse(tokenize(sql));
    const plan = planQuery(ast);
    const backend = new FirestoreBackend();
    const compiled = backend.compile(plan);

    expect(compiled.backend).toBe('FIRESTORE');
    expect(compiled.description).toContain('Firestore query');
  });

  it('compiles GCS export', () => {
    const sql = baseSql.replace('BIGQUERY', 'GCS');
    const ast = parse(tokenize(sql));
    const plan = planQuery(ast);
    const backend = new GCSBackend();
    const compiled = backend.compile(plan);

    expect(compiled.backend).toBe('GCS');
    expect(compiled.bucket).toBe('analytics.user_events');
  });
});
