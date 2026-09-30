<#
.SYNOPSIS
  Verify that this repo ships a usable standalone install of xingchen-vox-collage.

.DESCRIPTION
  Copies the repo's xingchen-vox-collage/ into a fresh temp directory (simulating a
  standalone install with NO sibling skills present), then runs and summarizes:
    (a) SKILL.md relative markdown link existence check;
    (b) python -m pytest <copy>/tests/ -q;
    (c) init_vox_branch.py against a fresh temp project;
    (d) if examples/minimal-8s exists in the repo: strict validation, locked-input
        identity check, and build_scene_evidence.py --plan-only (SKIP otherwise);
    (e) hardcoded private-path / secret pattern scan over all repo text files.

  Prints a PASS / FAIL / SKIP summary; exit code 1 if any step FAILs.
  Windows PowerShell 5.1 compatible.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$skillRepoDir = Join-Path $repoRoot 'xingchen-vox-collage'

$results = New-Object System.Collections.Generic.List[object]

function Add-Result([string]$Step, [string]$Status, [string]$Detail) {
    $results.Add([pscustomobject]@{ Step = $Step; Status = $Status; Detail = $Detail })
    $color = switch ($Status) { 'PASS' { 'Green' } 'FAIL' { 'Red' } default { 'Yellow' } }
    Write-Host "[$Status] $Step - $Detail" -ForegroundColor $color
}

if (-not (Test-Path $skillRepoDir)) {
    Add-Result 'setup' 'FAIL' "repo skill dir not found: $skillRepoDir"
    exit 1
}

$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ("vox-standalone-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempRoot | Out-Null

try {
    # --- Standalone copy (no sibling skills) -----------------------------------
    $standalone = Join-Path $tempRoot 'xingchen-vox-collage'
    Copy-Item -Recurse $skillRepoDir $standalone
    Write-Host "[INFO] standalone copy at $standalone" -ForegroundColor Cyan

    # --- (a) SKILL.md relative link existence ------------------------------------
    try {
        $skillMd = Join-Path $standalone 'SKILL.md'
        $content = Get-Content -Raw $skillMd
        $broken = @()
        foreach ($m in [regex]::Matches($content, '\[[^\]]*\]\(([^)]+)\)')) {
            $target = $m.Groups[1].Value.Trim()
            if ($target -match '^(https?:|mailto:|#)') { continue }
            $pathPart = ($target -split '#')[0]
            if ([string]::IsNullOrWhiteSpace($pathPart)) { continue }
            $resolved = Join-Path $standalone ($pathPart -replace '/', '\')
            if (-not (Test-Path $resolved)) { $broken += $target }
        }
        if ($broken.Count -gt 0) {
            Add-Result 'skill-md-links' 'FAIL' ("broken relative links: " + ($broken -join ', '))
        }
        else {
            Add-Result 'skill-md-links' 'PASS' 'all relative markdown links resolve'
        }
    }
    catch { Add-Result 'skill-md-links' 'FAIL' $_.Exception.Message }

    # --- (b) pytest --------------------------------------------------------------
    try {
        $testsDir = Join-Path $standalone 'tests'
        $out = (& python -m pytest $testsDir -q 2>&1 | Out-String)
        if ($LASTEXITCODE -eq 0) {
            Add-Result 'pytest' 'PASS' (($out.Trim() -split "`n")[-1]).Trim()
        }
        else {
            Add-Result 'pytest' 'FAIL' (($out.Trim() -split "`n")[-1]).Trim()
        }
    }
    catch { Add-Result 'pytest' 'FAIL' $_.Exception.Message }

    # --- (c) init_vox_branch.py ---------------------------------------------------
    try {
        $projDir = Join-Path $tempRoot 'demo-project'
        $out = (& python (Join-Path $standalone 'scripts\init_vox_branch.py') $projDir --slug verify-demo 2>&1 | Out-String)
        if ($LASTEXITCODE -eq 0 -and (Test-Path (Join-Path $projDir 'visual\vox\scene-spec.json'))) {
            Add-Result 'init-vox-branch' 'PASS' 'fresh project initialized (visual/vox contract created)'
        }
        else {
            Add-Result 'init-vox-branch' 'FAIL' $out.Trim()
        }
    }
    catch { Add-Result 'init-vox-branch' 'FAIL' $_.Exception.Message }

    # --- (d) examples/minimal-8s strict validation --------------------------------
    $exampleDir = Join-Path $repoRoot 'examples\minimal-8s'
    if (Test-Path $exampleDir) {
        try {
            $out = (& python (Join-Path $standalone 'scripts\validate_vox_branch.py') $exampleDir 2>&1 | Out-String)
            if ($LASTEXITCODE -eq 0) {
                Add-Result 'example-validate-strict' 'PASS' (($out.Trim() -split "`n")[-1]).Trim()
            }
            else {
                Add-Result 'example-validate-strict' 'FAIL' (($out.Trim() -split "`n")[-1]).Trim()
            }
        }
        catch { Add-Result 'example-validate-strict' 'FAIL' $_.Exception.Message }

        try {
            $out = (& python (Join-Path $standalone 'scripts\lock_vox_inputs.py') $exampleDir --check 2>&1 | Out-String)
            if ($LASTEXITCODE -eq 0 -and $out -match '"status": "locked"') {
                Add-Result 'example-input-lock' 'PASS' 'source master, audio, and timeline identities are locked'
            }
            else {
                Add-Result 'example-input-lock' 'FAIL' (($out.Trim() -split "`n")[-1]).Trim()
            }
        }
        catch { Add-Result 'example-input-lock' 'FAIL' $_.Exception.Message }

        try {
            # build_scene_evidence.py requires the evidence dir to live inside the project root.
            $evidenceOut = Join-Path $exampleDir 'visual\vox\tmp-evidence-verify'
            if (Test-Path $evidenceOut) { Remove-Item $evidenceOut -Recurse -Force }
            $out = (& python (Join-Path $standalone 'scripts\build_scene_evidence.py') $exampleDir $evidenceOut --plan-only 2>&1 | Out-String)
            if (Test-Path $evidenceOut) { Remove-Item $evidenceOut -Recurse -Force }
            if ($LASTEXITCODE -eq 0) {
                $sceneCount = ([regex]::Matches($out, '"scene_id"')).Count
                Add-Result 'example-evidence-plan' 'PASS' "plan-only OK, $sceneCount scene(s) in extraction plan"
            }
            else {
                Add-Result 'example-evidence-plan' 'FAIL' (($out.Trim() -split "`n")[-1]).Trim()
            }
        }
        catch { Add-Result 'example-evidence-plan' 'FAIL' $_.Exception.Message }
    }
    else {
        Add-Result 'example-validate-strict' 'SKIP' 'examples/minimal-8s not present yet (filled by a later task)'
        Add-Result 'example-input-lock' 'SKIP' 'examples/minimal-8s not present yet (filled by a later task)'
        Add-Result 'example-evidence-plan' 'SKIP' 'examples/minimal-8s not present yet (filled by a later task)'
    }

    # --- (e) private path / secret pattern scan -----------------------------------
    # Patterns are concatenated at runtime so this script does not flag itself.
    try {
        $patterns = @(
            'C:\\Users\\',
            ('\bgh' + 'p_[A-Za-z0-9]'),
            ('\bgh' + 'o_[A-Za-z0-9]'),
            ('\bs' + 'k-[A-Za-z0-9]'),
            ('\bAK' + 'IA[A-Z0-9]')
        )
        $textExts = @('.md', '.txt', '.json', '.ps1', '.py', '.yaml', '.yml', '.ts', '.tsx', '.toml', '.cfg', '.gitkeep')
        $hits = @()
        Get-ChildItem -Path $repoRoot -Recurse -File | Where-Object {
            $textExts -contains $_.Extension -and $_.FullName -notmatch '\\releases\\' -and $_.FullName -notmatch '\.pytest_cache'
        } | ForEach-Object {
            $file = $_
            $text = Get-Content -Raw $file.FullName -ErrorAction SilentlyContinue
            if ($null -eq $text) { return }
            foreach ($p in $patterns) {
                if ([regex]::IsMatch($text, $p)) {
                    $hits += $file.FullName.Substring($repoRoot.Length + 1) + " matches /$p/"
                }
            }
        }
        if ($hits.Count -gt 0) {
            Add-Result 'secret-scan' 'FAIL' ("private path / secret patterns found:`n  " + ($hits -join "`n  "))
        }
        else {
            Add-Result 'secret-scan' 'PASS' 'no hardcoded private paths or secret patterns in repo text files'
        }
    }
    catch { Add-Result 'secret-scan' 'FAIL' $_.Exception.Message }
}
finally {
    Remove-Item -Recurse -Force $tempRoot -ErrorAction SilentlyContinue
}

# --- Summary -------------------------------------------------------------------
Write-Host ''
Write-Host '===== verify-standalone summary =====' -ForegroundColor Cyan
foreach ($r in $results) {
    Write-Host ("{0,-6} {1,-26} {2}" -f $r.Status, $r.Step, $r.Detail)
}
$failed = @($results | Where-Object { $_.Status -eq 'FAIL' })
if ($failed.Count -gt 0) {
    Write-Host "[FAIL] $($failed.Count) step(s) failed" -ForegroundColor Red
    exit 1
}
Write-Host "[PASS] verify-standalone completed" -ForegroundColor Green
exit 0
