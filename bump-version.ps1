# bump-version.ps1 — Automatic version bumper for Network-Tools
# Usage: .\bump-version.ps1           (bumps build number)
#        .\bump-version.ps1 -Minor    (bumps minor version)
#        .\bump-version.ps1 -Major    (bumps major version)

param(
    [switch]$Minor,
    [switch]$Major
)

$versionFile = Join-Path $PSScriptRoot "version.json"
$v = Get-Content $versionFile -Raw | ConvertFrom-Json

$parts = $v.version -split '\.'
$maj = [int]$parts[0]
$min = [int]$parts[1]
$bld = [int]$v.build

if ($Major) {
    $maj++
    $min = 0
    $bld++
} elseif ($Minor) {
    $min++
    $bld++
} else {
    $bld++
}

$newVersion = "$maj.$min.$bld"
$today = Get-Date -Format "yyyy-MM-dd"

$json = @{
    version = $newVersion
    build   = $bld
    date    = $today
} | ConvertTo-Json

Set-Content -Path $versionFile -Value $json -Encoding UTF8

# Also update Service Worker cache name
$swFile = Join-Path $PSScriptRoot "sw.js"
$swContent = Get-Content $swFile -Raw
$swContent = $swContent -replace "const CACHE_NAME = 'network-tools-v\d+'", "const CACHE_NAME = 'network-tools-v$bld'"
Set-Content -Path $swFile -Value $swContent -Encoding UTF8

Write-Host "Version: $newVersion (Build $bld, $today)" -ForegroundColor Green
Write-Host "SW Cache: network-tools-v$bld" -ForegroundColor Cyan
