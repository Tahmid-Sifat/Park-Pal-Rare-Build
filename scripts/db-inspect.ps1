# Runs ParkPal inspection queries against the local parkpal database.
# Usage: npm run db:inspect
# Optional: $env:PGPASSWORD='...'; npm run db:inspect

$ErrorActionPreference = "Stop"
$psql = @(
  "C:\Program Files\PostgreSQL\18\bin\psql.exe",
  "C:\Program Files\PostgreSQL\16\bin\psql.exe",
  "psql"
) | Where-Object { $_ -eq "psql" -or (Test-Path $_) } | Select-Object -First 1

if (-not $psql) {
  Write-Error "psql not found. Install PostgreSQL client tools or add psql to PATH."
}

$root = Split-Path -Parent $PSScriptRoot
$queryFile = Join-Path $root "queries.sql"
$user = if ($env:PGUSER) { $env:PGUSER } else { "postgres" }
$db = if ($env:PGDATABASE) { $env:PGDATABASE } else { "parkpal" }
$hostName = if ($env:PGHOST) { $env:PGHOST } else { "localhost" }
$port = if ($env:PGPORT) { $env:PGPORT } else { "5432" }

Write-Host "Connecting to $db @ ${hostName}:$port as $user"
Write-Host "Loading $queryFile"
Write-Host "Tip: for interactive browsing use: psql -U $user -d $db  then  \x auto"
Write-Host ""

& $psql -U $user -h $hostName -p $port -d $db -v ON_ERROR_STOP=1 -P pager=on -c "\x auto" -f $queryFile
