@t[1730406000123456791;lane=demo;seq=3]
SELECT user_id, value
FROM metric_stream
TIME BETWEEN '2025-10-01T00:00:00Z' AND '2025-10-08T00:00:00Z'
WHERE pattern('spike', value)
ROUTE BIGQUERY 'analytics.metric_spikes';
