# MindsEye SQL Types (v0.1)

MindsEye SQL extends standard SQL types with **time-native** and **pattern-aware** primitives.

---

## Core Scalar Types

- `INT`
- `FLOAT`
- `STRING`
- `BOOL`
- `TIMESTAMP`

These map directly to standard backend types (BigQuery, CloudSQL, etc.).

---

## Time-Native Types

### `LAW_T`

Represents a **Time-Labeled Binary**:

- logical + physical time
- lane / seq
- content hash / proof

In SQL form, this is typically referenced indirectly via the `@t[...]` annotation, but the planner may materialize it as:

```text
STRUCT<epoch INT64, lane STRING, seq INT64, rand STRING, proof STRING>
