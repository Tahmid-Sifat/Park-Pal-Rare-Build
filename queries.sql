-- ParkPal PostgreSQL inspection helpers
-- Usage:
--   psql -U postgres -d parkpal -f queries.sql
-- Or open psql and paste sections as needed.
--
-- Tip: before running wide result sets, enable expanded display:
--   \x auto
--   \pset pager on
--
-- Note: Prisma uses camelCase column names (quoted identifiers).

-- ---------------------------------------------------------------------------
-- Session display settings (run these first inside psql)
-- ---------------------------------------------------------------------------
-- \x auto
-- \x
-- \x off
-- \pset pager on

-- ---------------------------------------------------------------------------
-- Overview: table sizes / row counts
-- ---------------------------------------------------------------------------
SELECT
  c.relname AS table_name,
  c.reltuples::bigint AS approx_rows
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN ('User', 'Case', 'AIAnalysis', 'Appeal', 'Evidence', 'Reminder')
ORDER BY c.relname;

-- ---------------------------------------------------------------------------
-- Users — important columns only
-- ---------------------------------------------------------------------------
SELECT
  id,
  email,
  name,
  "createdAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 20;

-- ---------------------------------------------------------------------------
-- Cases — important columns only (avoid SELECT *)
-- ---------------------------------------------------------------------------
SELECT
  id,
  status,
  "pcnNumber",
  "vehicleRegistration",
  issuer,
  "ticketType",
  location,
  "issueDate",
  "appealDeadline",
  "createdAt",
  "updatedAt"
FROM "Case"
ORDER BY "updatedAt" DESC
LIMIT 20;

-- Example style from docs (important columns):
-- SELECT id, status, "createdAt" FROM "Case";

-- ---------------------------------------------------------------------------
-- AIAnalysis — pretty-print JSONB
-- ---------------------------------------------------------------------------
SELECT
  id,
  "caseId",
  "confidenceScore",
  jsonb_pretty("analysisJson") AS analysis
FROM "AIAnalysis"
ORDER BY "createdAt" DESC
LIMIT 10;

-- ---------------------------------------------------------------------------
-- AIAnalysis — extract individual JSON properties
-- ---------------------------------------------------------------------------
SELECT
  id,
  "caseId",
  "analysisJson"->>'ticketType' AS ticket_type,
  "analysisJson"->>'confidence' AS confidence,
  "analysisJson"->>'nextStep' AS next_step,
  "analysisJson"->'grounds' AS grounds_json,
  "analysisJson"->'recommendedEvidence' AS recommended_evidence_json
FROM "AIAnalysis"
ORDER BY "createdAt" DESC
LIMIT 20;

-- Grounds as a readable text list
SELECT
  id,
  "caseId",
  "analysisJson"->>'ticketType' AS ticket_type,
  (
    SELECT string_agg(value, ', ')
    FROM jsonb_array_elements_text("analysisJson"->'grounds') AS value
  ) AS grounds
FROM "AIAnalysis"
ORDER BY "createdAt" DESC
LIMIT 20;

-- ---------------------------------------------------------------------------
-- Appeals — truncate long TEXT
-- ---------------------------------------------------------------------------
SELECT
  id,
  "caseId",
  submitted,
  "submittedAt",
  "createdAt",
  LEFT("appealText", 200) AS appeal_preview,
  CASE
    WHEN length("appealText") > 200 THEN '…'
    ELSE ''
  END AS truncated
FROM "Appeal"
ORDER BY "createdAt" DESC
LIMIT 20;

-- ---------------------------------------------------------------------------
-- Evidence — important columns + truncated description
-- ---------------------------------------------------------------------------
SELECT
  id,
  "caseId",
  "imageUrl",
  LEFT(COALESCE(description, ''), 120) AS description_preview,
  "uploadedAt"
FROM "Evidence"
ORDER BY "uploadedAt" DESC
LIMIT 20;

-- ---------------------------------------------------------------------------
-- Reminders
-- ---------------------------------------------------------------------------
SELECT
  id,
  "caseId",
  "reminderType",
  "reminderDate",
  completed
FROM "Reminder"
ORDER BY "reminderDate" ASC
LIMIT 50;

-- ---------------------------------------------------------------------------
-- Case + latest analysis (joined, readable)
-- ---------------------------------------------------------------------------
SELECT
  c.id AS case_id,
  c.status,
  c."pcnNumber",
  c."ticketType",
  a."confidenceScore",
  a."analysisJson"->>'ticketType' AS analysis_ticket_type,
  a."analysisJson"->>'nextStep' AS next_step,
  LEFT(COALESCE(ap."appealText", ''), 120) AS appeal_preview,
  c."updatedAt"
FROM "Case" c
LEFT JOIN LATERAL (
  SELECT *
  FROM "AIAnalysis" ai
  WHERE ai."caseId" = c.id
  ORDER BY ai."createdAt" DESC
  LIMIT 1
) a ON TRUE
LEFT JOIN LATERAL (
  SELECT *
  FROM "Appeal" ap0
  WHERE ap0."caseId" = c.id
  ORDER BY ap0."createdAt" DESC
  LIMIT 1
) ap ON TRUE
ORDER BY c."updatedAt" DESC
LIMIT 20;

-- ---------------------------------------------------------------------------
-- Confirm analysisJson is JSONB
-- ---------------------------------------------------------------------------
SELECT
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'analysisJson';
