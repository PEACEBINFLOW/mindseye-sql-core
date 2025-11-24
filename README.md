# MindsEye SQL Core (`@mindseye/sql-core`)

Hybrid **SQL + LAW-T** engine for the MindsEye stack.

- Time-native SQL grammar (time windows, time labels, event streams)
- LAW-T inspired `@t[...]` annotations on queries and clauses
- Event-centric & pattern-aware operators
- Network-conscious routing (`ROUTE`, `route()` function)
- Backend targets: BigQuery, Cloud SQL, Firestore, GCS

> This repo is Part 4 of the MindsEye x Google & Kaggle challenge:  
> **“Building MindsEye SQL and wiring it into the cloud.”**

---

## ✨ Core Ideas

### 1. Time-Native SQL

```sql
@t[1730406000123456789;lane=law-sql;seq=1]
SELECT
  user_id,
  COUNT(*) AS events_7d
FROM event_stream
TIME BETWEEN '2025-10-01T00:00:00Z' AND '2025-10-08T00:00:00Z'
BLOCK BY user_id
WHERE pattern('spike', value)
ROUTE BIGQUERY 'analytics.user_events_7d';
