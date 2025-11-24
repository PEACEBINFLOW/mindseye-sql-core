@t[1730406000123456790;lane=demo;seq=2]
SELECT user_id, COUNT(*) events_1d
FROM session_stream
TIME BETWEEN '2025-10-01T00:00:00Z' AND '2025-10-02T00:00:00Z'
BLOCK BY user_id
WHERE pattern('session_spike', duration_ms)
ROUTE CLOUDSQL 'sessions.analytics_daily';
