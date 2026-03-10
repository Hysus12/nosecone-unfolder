param(
  [string]$Version = "0.1.0"
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

Write-Host "[1/5] Build web app"
npm run build | Out-Host

Write-Host "[2/5] Generate offline-dist"
npm run offline-dist | Out-Host

$releaseDir = Join-Path $root "release\windows"
if (Test-Path $releaseDir) {
  Remove-Item -Recurse -Force $releaseDir
}
New-Item -ItemType Directory -Force $releaseDir | Out-Null

Write-Host "[3/5] Create portable zip"
$zipPath = Join-Path $releaseDir "OpenRocketNoseconeUnfolder-offline-dist-$Version.zip"
Compress-Archive -Path (Join-Path $root "offline-dist\*") -DestinationPath $zipPath -Force

$issPath = Join-Path $root "installer\windows\OpenRocketNoseconeOffline.iss"
$isccCandidates = @(
  "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
  "${env:ProgramFiles}\Inno Setup 6\ISCC.exe"
)

$iscc = $null
foreach ($candidate in $isccCandidates) {
  if (Test-Path $candidate) {
    $iscc = $candidate
    break
  }
}

if (-not $iscc) {
  $cmd = Get-Command ISCC.exe -ErrorAction SilentlyContinue
  if ($cmd) {
    $iscc = $cmd.Source
  }
}

if ($iscc) {
  Write-Host "[4/5] Build setup.exe via Inno Setup"
  & $iscc "/DSourceDir=$root\offline-dist" "/DOutputDir=$releaseDir" "/DAppVersion=$Version" $issPath | Out-Host
  Write-Host "[5/5] Done"
  Write-Host "Output: $releaseDir"
} else {
  Write-Host "[4/5] Inno Setup not found. Skipping setup.exe build."
  Write-Host "Install Inno Setup 6 and rerun this script to build setup.exe."
  Write-Host "[5/5] Done (zip only)"
  Write-Host "Output: $releaseDir"
}
