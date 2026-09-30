<#
.SYNOPSIS
  Check that this repo's xingchen-vox-collage/ is byte-identical to the upstream export.

.DESCRIPTION
  Compares, against the upstream source of truth recorded in UPSTREAM_MANIFEST.json:
    - upstream commit and tree (must match the manifest exactly);
    - the file list of skills/xingchen-vox-collage (excluding __pycache__ / *.pyc);
    - per-file SHA-256 of every core file.

  Any difference in a core file is an incident: reported in red, exit code 1.
  Full match prints PASS, exit code 0.

  If -UpstreamClone is omitted, the upstream repository is shallow-cloned
  (--depth 1 --branch <tag from manifest>) into a temporary directory.

  Windows PowerShell 5.1 compatible.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$UpstreamClone
)

$ErrorActionPreference = 'Stop'

function Fail([string]$Message) {
    Write-Host "[FAIL] $Message" -ForegroundColor Red
    exit 1
}

function Info([string]$Message) {
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $repoRoot 'UPSTREAM_MANIFEST.json'
$skillRepoDir = Join-Path $repoRoot 'xingchen-vox-collage'
if (-not (Test-Path $skillRepoDir)) { Fail "repo skill dir not found: $skillRepoDir" }

$manifest = Get-Content -Raw $manifestPath | ConvertFrom-Json
Info "manifest pins tag $($manifest.upstream_tag) commit $($manifest.upstream_commit)"

# --- Acquire upstream clone --------------------------------------------------
$tempClone = $null
if ($UpstreamClone) {
    $upstreamRoot = (Resolve-Path $UpstreamClone).Path
}
else {
    $tempClone = Join-Path ([IO.Path]::GetTempPath()) ("xsf-upstream-" + [Guid]::NewGuid().ToString('N'))
    Info "cloning $($manifest.upstream_repository) tag $($manifest.upstream_tag) -> $tempClone"
    & git clone --depth 1 --branch $manifest.upstream_tag $manifest.upstream_repository $tempClone 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Fail "git clone of upstream tag $($manifest.upstream_tag) failed" }
    $upstreamRoot = $tempClone
}

try {
    # --- Commit / tree check ---------------------------------------------------
    $commit = (& git -C $upstreamRoot rev-parse HEAD 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) { Fail "git rev-parse HEAD failed in ${upstreamRoot}: $commit" }
    $tree = (& git -C $upstreamRoot rev-parse 'HEAD^{tree}' 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) { Fail "git rev-parse HEAD^{tree} failed in ${upstreamRoot}: $tree" }

    if ($commit -ne $manifest.upstream_commit) {
        Fail "upstream commit drift: manifest=$($manifest.upstream_commit) actual=$commit"
    }
    if ($tree -ne $manifest.upstream_tree) {
        Fail "upstream tree drift: manifest=$($manifest.upstream_tree) actual=$tree"
    }
    Info "commit/tree match manifest"

    # --- File list + per-file SHA-256 ------------------------------------------
    $upstreamSkill = Join-Path $upstreamRoot ($manifest.exported_skill_path -replace '/', '\')
    if (-not (Test-Path $upstreamSkill)) { Fail "upstream skill dir not found: $upstreamSkill" }

    function Get-FileHashTable([string]$BaseDir) {
        $table = @{}
        Get-ChildItem -Path $BaseDir -Recurse -File | Where-Object {
            $_.FullName -notmatch '__pycache__' -and $_.Extension -ne '.pyc'
        } | ForEach-Object {
            $rel = $_.FullName.Substring($BaseDir.Length + 1).Replace('\', '/')
            $table[$rel] = (Get-FileHash -Algorithm SHA256 $_.FullName).Hash.ToLowerInvariant()
        }
        return $table
    }

    $up = Get-FileHashTable $upstreamSkill
    $repo = Get-FileHashTable $skillRepoDir
    $drift = @()
    foreach ($k in $up.Keys) {
        if (-not $repo.ContainsKey($k)) { $drift += "missing in repo: $k" }
        elseif ($repo[$k] -ne $up[$k]) { $drift += "hash mismatch: $k" }
    }
    foreach ($k in $repo.Keys) {
        if (-not $up.ContainsKey($k)) { $drift += "extra in repo: $k" }
    }
    if ($drift.Count -gt 0) {
        Fail ("CORE FILE DRIFT detected ($($drift.Count) differences):`n  " + ($drift -join "`n  ") +
              "`nCore skill files must be a byte-identical export of upstream. Re-export via scripts/build-release.ps1.")
    }

    Write-Host "[PASS] zero drift: $($up.Count) core files byte-identical to upstream $($manifest.upstream_tag) ($commit)" -ForegroundColor Green
    exit 0
}
finally {
    if ($tempClone -and (Test-Path $tempClone)) {
        Remove-Item -Recurse -Force $tempClone -ErrorAction SilentlyContinue
    }
}
