# Generates global Claude Code subagents (one per skill category + an orchestrator) into ~/.claude/agents.
# Agents never embed skill text: they read the live SKILL.md files at run time, so skill edits apply immediately.
# Re-run (or let the SessionStart hook run it) when skills/categories are added or removed.
# Usage: powershell -NoProfile -File tools/sync-agents.ps1 [-AgentsDir <path>]
param([string]$AgentsDir = (Join-Path $env:USERPROFILE ".claude\agents"))

$root = Split-Path -Parent $PSScriptRoot
$catRoot = Join-Path $root "categories"
New-Item -ItemType Directory -Force -Path $AgentsDir | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding($false)

$titles = @{
  "01"="Microservice Architecture & Foundations"; "02"="API Development & Design"; "03"="Request Context & Idempotency"
  "04"="Error & Exception Management"; "05"="Configuration & Environment Management"; "06"="Observability & Health Management"
  "07"="Database & Caching Management"; "08"="Messaging & Event-Driven Architecture"; "09"="Cloud Storage & External Integrations"
  "10"="Security & Identity Management"; "11"="Resilience & Reliability"; "12"="LLM & AI Integration"
  "13"="Testing & Quality Engineering"; "14"="Code Review & Engineering Governance"; "15"="Documentation & DevOps"
}

$wanted = @()
$roster = @()
foreach ($dir in Get-ChildItem $catRoot -Directory | Sort-Object Name) {
  $num = $dir.Name.Substring(0,2)
  $title = if ($titles[$num]) { $titles[$num] } else { $dir.Name }
  $agent = "org-" + $dir.Name
  $slugs = @(Get-ChildItem $dir.FullName -Directory | Where-Object { Test-Path (Join-Path $_.FullName "SKILL.md") } | ForEach-Object { $_.Name })
  $wanted += $agent
  $roster += "- ``$agent`` - $title ($($slugs.Count) skills)"
  $path = $dir.FullName
  $desc = "Organization standards expert for $title. Use proactively when designing, implementing, or reviewing code involving: $($slugs -join ', '). Applies the organization's SKILL.md standards for this category."
  $body = @"
---
name: $agent
description: $desc
---

You are the organization's **$title** specialist (category $num).

## Source of truth (read live, never from memory)
Skill folder: ``$path``
Each subfolder holds one ``SKILL.md``. Standards in these files change over time, so you MUST read them fresh on every task.

## Workflow
1. List the skill folder (Glob ``$($path -replace '\\','/')/*/SKILL.md``). Skills present now may differ from earlier runs.
2. Pick the skills relevant to the task (by folder name and each file's ``description`` frontmatter). Read them fully. Also read skills named in their "Related skills" if the task touches them.
3. Check the target repository's own code/conventions (the repo you were invoked from) against the skills.
4. Apply or review according to the skills. Respect markers: **MANDATORY** must be followed; **DECIDED** supersedes older notes; **UNRESOLVED/GENERIC** means follow the target service's existing pattern and flag the gap.
5. Report concisely: skills used (by name), findings or changes made, deviations from standard, and open questions. Cite the skill name for each rule applied.

If no skill applies, say so rather than inventing a standard. If a rule conflicts with the repo, flag it; do not silently pick one.
"@
  [IO.File]::WriteAllText((Join-Path $AgentsDir "$agent.md"), $body, $utf8)
}

$orch = @"
---
name: org-orchestrator
description: Entry point for the organization's engineering-standards workflow. Use proactively for any non-trivial feature, API, service, bug fix, or review in any repo - it routes the task to the relevant category specialists (org-01-* ... org-15-*) and consolidates their guidance.
---

You are the **organization standards orchestrator**. You do not hold standards yourself; the category specialists read the live skill files.

## Specialists
$($roster -join "`n")

Skills root: ``$($catRoot -replace '\\','/')`` (``<category>/<skill>/SKILL.md``).

## Workflow
1. Understand the task and which parts of the current repo it touches.
2. Select the categories involved (usually 1-4; do not invoke all). Cross-cutting hints: new endpoint -> 02, 03, 04, 10; data access -> 07, 11; events -> 08, 03; config/env -> 05; logs/metrics -> 06; tests -> 13; PR review -> 14; docs/CI -> 15.
3. Invoke the chosen ``org-*`` agents (in parallel when independent) with the concrete task, repo path, and the files involved. Ask each to return applicable rules, required changes, and conflicts.
4. Reconcile overlaps (the more specific category wins; MANDATORY beats advisory). Surface conflicts to the user.
5. Return one consolidated answer: plan or changes, standards applied (by skill name), and open questions. If asked to implement, implement after consolidation.
"@
[IO.File]::WriteAllText((Join-Path $AgentsDir "org-orchestrator.md"), $orch, $utf8)
$wanted += "org-orchestrator"

# Remove stale org-* agents whose category no longer exists
Get-ChildItem $AgentsDir -Filter "org-*.md" | Where-Object { $wanted -notcontains $_.BaseName } | Remove-Item -Force
Write-Host "synced $($wanted.Count) agents -> $AgentsDir"
