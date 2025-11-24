@t[1730406000123456792;lane=demo;seq=4]
SELECT *
FROM events
WHERE event_type = 'purchase'
ROUTE BIGQUERY 'analytics.purchases';

@t[1730406000123456793;lane=demo;seq=5]
SELECT *
FROM events
WHERE event_type = 'purchase'
ROUTE CLOUDSQL 'app.purchases_archive';
