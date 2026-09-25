param(
  [string]$ApiBase = "http://localhost:5000",
  [string]$MeasurePath = "/healthz",
  [string]$WarmPath = "/healthz",
  [int]$Cycles = 3,
  [int]$IdleWindowMinutes = 16,
  [int]$WarmPingIntervalSeconds = 240,
  [int]$RequestTimeoutSeconds = 60
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($Cycles -lt 1) {
  throw "Cycles must be 1 or greater."
}
if ($IdleWindowMinutes -lt 1) {
  throw "IdleWindowMinutes must be 1 or greater."
}
if ($WarmPingIntervalSeconds -lt 10) {
  throw "WarmPingIntervalSeconds must be 10 or greater."
}

function To-AbsoluteUrl([string]$base, [string]$path) {
  if ($path.StartsWith("http://") -or $path.StartsWith("https://")) {
    return $path
  }
  return $base.TrimEnd("/") + "/" + $path.TrimStart("/")
}

function Parse-Seconds([string]$value) {
  return [double]::Parse($value, [System.Globalization.CultureInfo]::InvariantCulture)
}

function Invoke-TimedRequest(
  [string]$url,
  [int]$timeoutSeconds
) {
  $raw = curl.exe -s -o NUL --max-time $timeoutSeconds -w "%{time_total}|%{http_code}" --url $url
  $parts = $raw -split "\|"
  if ($parts.Count -ne 2) {
    throw "Unexpected curl output: $raw"
  }

  $sec = Parse-Seconds $parts[0]
  $status = [int]$parts[1]

  return [PSCustomObject]@{
    status = $status
    sec = $sec
    ms = [Math]::Round($sec * 1000, 2)
  }
}

function Get-Stats([string]$name, [double[]]$samplesSec) {
  $sorted = @($samplesSec | Sort-Object)
  $count = @($samplesSec).Count
  $avg = ($samplesSec | Measure-Object -Average).Average
  $min = ($samplesSec | Measure-Object -Minimum).Minimum
  $max = ($samplesSec | Measure-Object -Maximum).Maximum
  $p95Index = [Math]::Floor(($count - 1) * 0.95)
  $p95 = $sorted[$p95Index]

  return [PSCustomObject]@{
    case = $name
    count = $count
    avg_ms = [Math]::Round($avg * 1000, 2)
    min_ms = [Math]::Round($min * 1000, 2)
    p95_ms = [Math]::Round($p95 * 1000, 2)
    max_ms = [Math]::Round($max * 1000, 2)
  }
}

$measureUrl = To-AbsoluteUrl -base $ApiBase -path $MeasurePath
$warmUrl = To-AbsoluteUrl -base $ApiBase -path $WarmPath

# Pre-check
$precheck = Invoke-TimedRequest -url $warmUrl -timeoutSeconds $RequestTimeoutSeconds
if ($precheck.status -lt 200 -or $precheck.status -ge 400) {
  throw "Warm endpoint pre-check failed: HTTP $($precheck.status) ($warmUrl)"
}

$coldSamples = [System.Collections.Generic.List[double]]::new()
$warmSamples = [System.Collections.Generic.List[double]]::new()

Write-Host ""
Write-Host "측정 시작: Cycles=$Cycles, IdleWindow=${IdleWindowMinutes}m, WarmPing=${WarmPingIntervalSeconds}s" -ForegroundColor Cyan
Write-Host "Measure URL: $measureUrl"
Write-Host "Warm URL   : $warmUrl"

1..$Cycles | ForEach-Object {
  $cycle = $_
  Write-Host ""
  Write-Host "=== Cycle $cycle/$Cycles ===" -ForegroundColor Yellow

  # A) Cold: idle period -> first request latency
  Write-Host "[A] 콜드 측정: ${IdleWindowMinutes}분 유휴 후 첫 요청..." -ForegroundColor Cyan
  Start-Sleep -Seconds ($IdleWindowMinutes * 60)

  $cold = Invoke-TimedRequest -url $measureUrl -timeoutSeconds $RequestTimeoutSeconds
  $coldSamples.Add($cold.sec)
  Write-Host ("    콜드 첫 응답: {0}ms (HTTP {1})" -f $cold.ms, $cold.status)

  # B) Warm: ping while waiting -> first request latency
  Write-Host "[B] 웜 측정: 동일 시간 동안 health check ping 유지..." -ForegroundColor Cyan
  $warmWindowSeconds = $IdleWindowMinutes * 60
  $startedAt = Get-Date
  $elapsed = 0

  while ($elapsed -lt $warmWindowSeconds) {
    $ping = Invoke-TimedRequest -url $warmUrl -timeoutSeconds $RequestTimeoutSeconds
    if ($ping.status -lt 200 -or $ping.status -ge 400) {
      Write-Host ("    경고: warm ping HTTP {0}" -f $ping.status) -ForegroundColor DarkYellow
    }

    $remaining = $warmWindowSeconds - $elapsed
    $sleepSec = [Math]::Min($WarmPingIntervalSeconds, $remaining)
    if ($sleepSec -gt 0) {
      Start-Sleep -Seconds $sleepSec
    }
    $elapsed = [int]((Get-Date) - $startedAt).TotalSeconds
  }

  $warm = Invoke-TimedRequest -url $measureUrl -timeoutSeconds $RequestTimeoutSeconds
  $warmSamples.Add($warm.sec)
  Write-Host ("    웜 첫 응답: {0}ms (HTTP {1})" -f $warm.ms, $warm.status)
}

$coldStat = Get-Stats -name "COLD_AFTER_IDLE" -samplesSec $coldSamples.ToArray()
$warmStat = Get-Stats -name "WARM_WITH_HEALTHCHECK" -samplesSec $warmSamples.ToArray()
$improvement = (($coldStat.avg_ms - $warmStat.avg_ms) / $coldStat.avg_ms) * 100
$improvementRounded = [Math]::Round($improvement, 1)

Write-Host ""
$coldStat | Format-List
$warmStat | Format-List

Write-Host ""
Write-Host ("결과: 콜드 평균 {0}ms -> 웜 평균 {1}ms ({2}% 개선)" -f $coldStat.avg_ms, $warmStat.avg_ms, $improvementRounded) -ForegroundColor Green
Write-Host "주의: 외부 모니터(UptimeRobot 등)가 이미 핑을 보내면 콜드 지연이 작게 측정될 수 있습니다." -ForegroundColor DarkGray
