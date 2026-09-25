param(
  [string]$ApiBase = "http://localhost:5000",
  [string]$SourceUrl = "https://books.google.com/books/content?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  [int]$Iterations = 100,
  [switch]$SkipDirect
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[Console]::InputEncoding = $utf8NoBom
[Console]::OutputEncoding = $utf8NoBom
$OutputEncoding = $utf8NoBom

if ($Iterations -lt 5) {
  throw "Iterations must be 5 or greater."
}

function Parse-Seconds([string]$value) {
  return [double]::Parse($value, [System.Globalization.CultureInfo]::InvariantCulture)
}

function Get-Stats([string]$name, [double[]]$samplesSec) {
  $sorted = $samplesSec | Sort-Object
  $count = $sorted.Count
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

function Measure-DirectNoProxy(
  [string]$src,
  [int]$count
) {
  $samples = [System.Collections.Generic.List[double]]::new()

  1..$count | ForEach-Object {
    $raw = curl.exe -s -L -o NUL -w "%{time_total}" --url $src
    $samples.Add((Parse-Seconds $raw))
  }

  return $samples.ToArray()
}

function Measure-ProxyCacheHit(
  [string]$apiBase,
  [string]$src,
  [int]$count
) {
  $thumbEndpoint = $apiBase.TrimEnd("/") + "/api/thumb"
  $encodedSrc = [System.Uri]::EscapeDataString($src)
  $url = $thumbEndpoint + "?src=" + $encodedSrc

  # Warm-up once so that subsequent requests are measured as cache hit.
  curl.exe -s -o NUL -w "%{time_total}" --url $url > $null

  $samples = [System.Collections.Generic.List[double]]::new()

  1..$count | ForEach-Object {
    $raw = curl.exe -s -o NUL -w "%{time_total}" --url $url
    $samples.Add((Parse-Seconds $raw))
  }

  return $samples.ToArray()
}

function Measure-ProxyCacheMiss(
  [string]$apiBase,
  [string]$src,
  [int]$count
) {
  $thumbEndpoint = $apiBase.TrimEnd("/") + "/api/thumb"
  $samples = [System.Collections.Generic.List[double]]::new()

  1..$count | ForEach-Object {
    $cacheBustedSrc = $src + "#miss-" + $_ + "-" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $encodedSrc = [System.Uri]::EscapeDataString($cacheBustedSrc)
    $url = $thumbEndpoint + "?src=" + $encodedSrc
    $raw = curl.exe -s -o NUL -w "%{time_total}" --url $url
    $samples.Add((Parse-Seconds $raw))
  }

  return $samples.ToArray()
}

$healthUrl = $ApiBase.TrimEnd("/") + "/healthz"
$healthCode = curl.exe -s -o NUL -w "%{http_code}" --url $healthUrl
if ($healthCode -ne "200") {
  throw "백엔드 health check 실패. 먼저 API 서버를 실행하세요: npm run start"
}

Write-Host ""
if (-not $SkipDirect) {
  Write-Host "[1/3] 프록시 미적용(원본 직접) 측정 중..." -ForegroundColor Cyan
  $noProxySamples = Measure-DirectNoProxy -src $SourceUrl -count $Iterations
}

Write-Host "[2/3] 프록시 + 스토리지 캐시 미적용(강제 miss) 측정 중..." -ForegroundColor Cyan
$proxyMissSamples = Measure-ProxyCacheMiss -apiBase $ApiBase -src $SourceUrl -count $Iterations

Write-Host "[3/3] 프록시 + 스토리지 캐시 적용(hit) 측정 중..." -ForegroundColor Cyan
$proxyCacheSamples = Measure-ProxyCacheHit -apiBase $ApiBase -src $SourceUrl -count $Iterations

$proxyMiss = Get-Stats -name "캐시 미적용(PROXY_CACHE_MISS)" -samplesSec $proxyMissSamples
$proxyCache = Get-Stats -name "캐시 적용(PROXY_AND_STORAGE_CACHE_HIT)" -samplesSec $proxyCacheSamples

$cacheImprovement = (($proxyMiss.avg_ms - $proxyCache.avg_ms) / $proxyMiss.avg_ms) * 100
$cacheImprovementRounded = [Math]::Round($cacheImprovement, 1)

Write-Host ""
if (-not $SkipDirect) {
  $noProxy = Get-Stats -name "프록시 미적용(NO_PROXY_NO_CACHE)" -samplesSec $noProxySamples
  $noProxy | Format-List
}
$proxyMiss | Format-List
$proxyCache | Format-List

Write-Host ""
Write-Host ("결과: 캐시 미적용 평균 {0}ms -> 캐시 적용 평균 {1}ms ({2}% 개선)" -f $proxyMiss.avg_ms, $proxyCache.avg_ms, $cacheImprovementRounded) -ForegroundColor Green

if (-not $SkipDirect) {
  Write-Host ("참고: 프록시 미적용(원본 직접) 평균 {0}ms" -f $noProxy.avg_ms) -ForegroundColor DarkGray
}
