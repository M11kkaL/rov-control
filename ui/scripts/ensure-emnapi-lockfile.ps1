# Regenerates package-lock.json entries for Linux CI optional deps (@emnapi).
# Run from repo root on Windows before pushing when package.json changes:
#   powershell -File ui/scripts/ensure-emnapi-lockfile.ps1
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot\..
try {
  npm install --package-lock-only --cpu=wasm32 --os=linux --include=optional
  Write-Host 'package-lock.json updated with Linux optional dependencies.'
} finally {
  Pop-Location
}
