param(
    [switch]$Build,
    [switch]$Validate,
    [switch]$DryRun,
    [switch]$Publish,
    [string]$From,
    [string]$To,
    [int]$Limit = 0,
    [string]$Collection = "",
    [string]$Category = ""
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$NodeScript = Join-Path $ScriptDir "wechat-book-batch.mjs"

function Invoke-Batch($Command, [switch]$UseDryRun) {
    $args = @($NodeScript, $Command)
    if ($Collection) { $args += @("--collection", $Collection) }
    if ($Category) { $args += @("--category", $Category) }
    if ($From) { $args += @("--from", $From) }
    if ($To) { $args += @("--to", $To) }
    if ($Limit -gt 0) { $args += @("--limit", [string]$Limit) }
    if ($UseDryRun) { $args += "--dry-run" }
    & node @args
    if ($LASTEXITCODE -ne 0) {
        throw "Batch command failed: $Command"
    }
}

if (-not $Build -and -not $Validate -and -not $DryRun -and -not $Publish) {
    $Build = $true
    $Validate = $true
}

if ($Build) {
    Invoke-Batch "build"
}

if ($Validate) {
    Invoke-Batch "validate"
}

if ($DryRun) {
    Invoke-Batch "publish" -UseDryRun
}

if ($Publish) {
    Invoke-Batch "publish"
}
