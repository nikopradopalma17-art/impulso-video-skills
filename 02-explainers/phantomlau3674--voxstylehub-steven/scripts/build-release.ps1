<#
.SYNOPSIS
  Export xingchen-vox-collage from the upstream clone into this repo and build the release ZIP.

.DESCRIPTION
  Steps:
    1. Resolve upstream commit/tree from -UpstreamClone (git rev-parse).
    2. Mirror skills/xingchen-vox-collage into this repo's xingchen-vox-collage/
       via robocopy /MIR (excluding __pycache__ and *.pyc).
    3. Per-file SHA-256 comparison between upstream source and repo copy.
    4. Refresh UPSTREAM_MANIFEST.json (commit / tree / export_timestamp),
       with standalone_package_sha256 reset to "PENDING-BUILD".
    5. Stage and compress releases/xingchen-vox-collage-v<Version>.zip.
    6. Write the final ZIP's SHA-256 back into the repo manifest.

  Chicken-and-egg convention for standalone_package_sha256:
    The ZIP contains a copy of UPSTREAM_MANIFEST.json. If the manifest inside
    the ZIP recorded the final ZIP hash, the hash would change every time the
    field is refreshed — an unsolvable cycle. The agreed convention is:
      - the manifest copy INSIDE the ZIP keeps standalone_package_sha256 =
        "PENDING-BUILD" (the value at pack time);
      - the manifest in the REPO root records the SHA-256 of the final ZIP.
    So the build packs once, hashes, updates the repo manifest, and does NOT
    repack. Verifiers compare the repo manifest value against a locally
    computed hash of the published ZIP file.

  Windows PowerShell 5.1 compatible. Exit code 0 on success, 1 on failure.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$UpstreamClone,

    [Parameter(Mandatory = $false)]
    [string]$Version = "0.1.0"
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
$skillRepoDir = Join-Path $repoRoot 'xingchen-vox-collage'
$manifestPath = Join-Path $repoRoot 'UPSTREAM_MANIFEST.json'
$releasesDir = Join-Path $repoRoot 'releases'

# --- 1. Resolve upstream commit / tree -------------------------------------
$upstreamRoot = (Resolve-Path $UpstreamClone).Path
$upstreamSkill = Join-Path $upstreamRoot 'skills\xingchen-vox-collage'
if (-not (Test-Path $upstreamSkill)) { Fail "upstream skill dir not found: $upstreamSkill" }

$commit = (& git -C $upstreamRoot rev-parse HEAD 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0) { Fail "git rev-parse HEAD failed in ${upstreamRoot}: $commit" }
$tree = (& git -C $upstreamRoot rev-parse 'HEAD^{tree}' 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0) { Fail "git rev-parse HEAD^{tree} failed in ${upstreamRoot}: $tree" }
Info "upstream commit: $commit"
Info "upstream tree:   $tree"

# --- 2. Mirror with robocopy /MIR -------------------------------------------
Info "mirroring $upstreamSkill -> $skillRepoDir"
& robocopy $upstreamSkill $skillRepoDir /MIR /XD '__pycache__' /XF '*.pyc' /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) { Fail "robocopy failed with exit code $LASTEXITCODE" }
$global:LASTEXITCODE = 0  # robocopy success codes (0-7) must not leak as process exit code

# --- 3. Per-file SHA-256 comparison -----------------------------------------
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
if ($drift.Count -gt 0) { Fail ("export drift after mirror:`n  " + ($drift -join "`n  ")) }
Info "SHA-256 comparison clean: $($up.Count) files identical"

# --- 4. Refresh manifest (hash field reset to PENDING-BUILD) ----------------
$manifest = Get-Content -Raw $manifestPath | ConvertFrom-Json
$timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
$ordered = [ordered]@{
    upstream_repository       = $manifest.upstream_repository
    upstream_tag              = $manifest.upstream_tag
    upstream_commit           = $commit
    upstream_tree             = $tree
    exported_skill_path       = $manifest.exported_skill_path
    export_timestamp          = $timestamp
    standalone_package_sha256 = 'PENDING-BUILD'
    standalone_version        = $Version
}
[IO.File]::WriteAllText($manifestPath, (($ordered | ConvertTo-Json) + "`n"), (New-Object System.Text.UTF8Encoding($false)))
Info "manifest refreshed (timestamp $timestamp, version $Version)"

# --- 5. Stage and compress the release ZIP -----------------------------------
if (-not (Test-Path $releasesDir)) { New-Item -ItemType Directory -Path $releasesDir | Out-Null }
$zipName = "xingchen-vox-collage-v$Version.zip"
$zipPath = Join-Path $releasesDir $zipName
$staging = Join-Path ([IO.Path]::GetTempPath()) ("vox-release-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $staging | Out-Null
try {
    Copy-Item -Recurse $skillRepoDir (Join-Path $staging 'xingchen-vox-collage')
    foreach ($f in @('README.md', 'README.en.md', 'LICENSE', 'CHANGELOG.md', 'UPSTREAM.md', 'UPSTREAM_MANIFEST.json')) {
        Copy-Item (Join-Path $repoRoot $f) (Join-Path $staging $f)
    }
    # Release-layer additions so the ZIP can re-run the full acceptance suite standalone.
    foreach ($d in @('examples', 'scripts')) {
        $src = Join-Path $repoRoot $d
        if (Test-Path $src) { Copy-Item -Recurse $src (Join-Path $staging $d) }
    }
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $zipPath -CompressionLevel Optimal
}
finally {
    Remove-Item -Recurse -Force $staging -ErrorAction SilentlyContinue
}
Info "release zip written: $zipPath"

# --- 6. Write final ZIP hash back into the repo manifest (no repack) ---------
$zipHash = (Get-FileHash -Algorithm SHA256 $zipPath).Hash.ToLowerInvariant()
$ordered.standalone_package_sha256 = $zipHash
[IO.File]::WriteAllText($manifestPath, (($ordered | ConvertTo-Json) + "`n"), (New-Object System.Text.UTF8Encoding($false)))
Info "standalone_package_sha256 = $zipHash (repo manifest only; zip-internal copy keeps PENDING-BUILD)"

Write-Host "[PASS] build-release completed: $zipName" -ForegroundColor Green
exit 0
