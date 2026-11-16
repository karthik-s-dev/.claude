# Flatten the categorized skills into a Claude Code skills folder (<target>/<skill-name>/SKILL.md).
# Usage:  powershell -File tools/install-skills.ps1 -Target "D:\path\to\repo\.claude\skills" [-Only slug1,slug2] [-WhatIf]
param(
  [Parameter(Mandatory = $true)][string]$Target,
  [string[]]$Only,
  [switch]$WhatIf
)
$root = Split-Path -Parent $PSScriptRoot
$skills = Get-ChildItem -Path (Join-Path $root "categories") -Recurse -Filter SKILL.md
$count = 0
foreach ($f in $skills) {
  $slug = Split-Path -Leaf (Split-Path -Parent $f.FullName)
  if ($Only -and ($Only -notcontains $slug)) { continue }
  $dest = Join-Path $Target $slug
  if ($WhatIf) { Write-Host "would copy $slug -> $dest"; $count++; continue }
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
  Copy-Item -Force $f.FullName (Join-Path $dest "SKILL.md")
  $count++
}
Write-Host "$count skill(s) processed"
