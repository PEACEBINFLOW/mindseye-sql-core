# MindsEye SQL Examples

---

## 1. Simple Time Window

```sql
@t[1730406000123456789;lane=sql-demo;seq=1]
SELECT user_id, COUNT(*) AS events_7d
FROM event_stream
TIME BETWEEN '2025-10-01T00:00:00Z' AND '2025-10-08T00:00:00Z'
WHERE event_type = 'click'
ROUTE BIGQUERY 'analytics.user_events_7
