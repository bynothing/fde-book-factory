param(
    [Parameter(Position = 0)]
    [ValidateSet("preflight", "validate", "status", "new-manuscript", "list")]
    [string]$Action = "status",

    [string]$Chapter,

    [switch]$Strict
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BookRoot = Resolve-Path (Join-Path $ScriptDir "..")
$ChaptersDir = Join-Path $BookRoot "chapters"
$ManuscriptDir = Join-Path $BookRoot "manuscript"

$RequiredFiles = @(
    "README.md",
    "ORIGINAL_BRIEF.md",
    "WRITING_CONTEXT.md",
    "WRITING_RULES.md",
    "WRITING_STATE.md",
    "MATERIAL_INDEX.md",
    "CHAPTER_WORKFLOW.md"
)

function Write-Ok($Message) {
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn($Message) {
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Fail($Message) {
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Get-Text($Path) {
    return Get-Content -LiteralPath $Path -Raw -Encoding UTF8
}

function Test-RequiredStructure {
    $errors = New-Object System.Collections.Generic.List[string]
    $warnings = New-Object System.Collections.Generic.List[string]

    foreach ($file in $RequiredFiles) {
        $path = Join-Path $BookRoot $file
        if (-not (Test-Path -LiteralPath $path)) {
            $errors.Add("Missing required file: $file")
        }
    }

    $outline = Get-ChildItem -LiteralPath $BookRoot -Filter "00_*.md" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $outline) {
        $errors.Add("Missing top-level outline file: 00_*.md")
    }

    foreach ($dir in @($ChaptersDir, $ManuscriptDir)) {
        if (-not (Test-Path -LiteralPath $dir)) {
            $errors.Add("Missing required directory: $dir")
        }
    }

    if (Test-Path -LiteralPath $ChaptersDir) {
        $chapterFiles = Get-ChildItem -LiteralPath $ChaptersDir -Filter "*.md" | Where-Object { $_.Name -ne "README.md" }
        foreach ($file in $chapterFiles) {
            $text = Get-Text $file.FullName

            if ($text -match "##\s*\u6b63\u6587\u8349\u7a3f\u533a") {
                $errors.Add("Chapter draft contains manuscript draft area: $($file.Name)")
            }

            if ($text -match "(?m)^#\s*\u7b2c[\u4e00-\u9fa50-9]+\u7ae0") {
                $errors.Add("Chapter draft appears to contain formal manuscript title: $($file.Name)")
            }

            if ($text -notmatch "##\s*\u5bf9\u5e94\u6b63\u6587\u6587\u4ef6") {
                $warnings.Add("Chapter draft is missing manuscript path section: $($file.Name)")
            }
        }
    }

    if (Test-Path -LiteralPath $ManuscriptDir) {
        $manuscriptFiles = Get-ChildItem -LiteralPath $ManuscriptDir -Filter "*.md" | Where-Object { $_.Name -ne "README.md" }
        $forbidden = @(
            "##\s*\u7ae0\u8282\u5b9a\u4f4d",
            "##\s*\u6838\u5fc3\u95ee\u9898",
            "##\s*\u6838\u5fc3\u89c2\u70b9",
            "##\s*\u5c0f\u8282\u7ed3\u6784",
            "##\s*\u53ef\u7528\u7d20\u6750",
            "##\s*\u4e8b\u5b9e\u5e95\u7a3f",
            "##\s*\u5f85\u786e\u8ba4\u95ee\u9898",
            "##\s*\u5bf9\u5e94\u6b63\u6587\u6587\u4ef6",
            "##\s*\u6b63\u6587\u5904\u7406\u72b6\u6001",
            "\u6b63\u6587\u8349\u7a3f\u533a",
            "\u5f85\u4f5c\u8005\u786e\u8ba4",
            "\u5f85\u786e\u8ba4\u4e8b\u5b9e",
            "\u4e0d\u53ef\u5199\u6216\u9700\u8131\u654f\u5185\u5bb9"
        )

        foreach ($file in $manuscriptFiles) {
            $text = Get-Text $file.FullName
            foreach ($pattern in $forbidden) {
                if ($text -match $pattern) {
                    $errors.Add("Manuscript contains workflow/draft marker: $($file.Name) / $pattern")
                }
            }
        }
    }

    return [PSCustomObject]@{
        Errors = $errors
        Warnings = $warnings
    }
}

function Invoke-Validate {
    $result = Test-RequiredStructure

    if ($result.Errors.Count -eq 0) {
        Write-Ok "Structure and clean-manuscript validation passed."
    } else {
        foreach ($errorItem in $result.Errors) {
            Write-Fail $errorItem
        }
    }

    foreach ($warningItem in $result.Warnings) {
        Write-Warn $warningItem
    }

    if ($result.Errors.Count -gt 0) {
        exit 1
    }

    if ($Strict -and $result.Warnings.Count -gt 0) {
        exit 2
    }
}

function Show-Status {
    Invoke-Validate

    Write-Host ""
    Write-Host "Book workspace:" -ForegroundColor Cyan
    Write-Host "  $BookRoot"

    Write-Host ""
    Write-Host "Read before writing:" -ForegroundColor Cyan
    foreach ($file in $RequiredFiles) {
        Write-Host "  - $file"
    }
    Write-Host "  - 00_*.md"

    Write-Host ""
    Write-Host "Manuscript files:" -ForegroundColor Cyan
    if (Test-Path -LiteralPath $ManuscriptDir) {
        Get-ChildItem -LiteralPath $ManuscriptDir -Filter "*.md" |
            Where-Object { $_.Name -ne "README.md" } |
            Sort-Object Name |
            ForEach-Object { Write-Host "  - $($_.Name)" }
    }

    Write-Host ""
    Write-Host "Current stage:" -ForegroundColor Cyan
    $statePath = Join-Path $BookRoot "WRITING_STATE.md"
    if (Test-Path -LiteralPath $statePath) {
        $state = Get-Text $statePath
        $stage = [regex]::Match($state, "(?s)## \u5f53\u524d\u9636\u6bb5\s+(.*?)(\r?\n##|\z)")
        if ($stage.Success) {
            Write-Host $stage.Groups[1].Value.Trim()
        }
    }
}

function Show-Preflight {
    Invoke-Validate

    Write-Host ""
    Write-Host "Preflight checklist:" -ForegroundColor Cyan
    Write-Host "  1. Read ORIGINAL_BRIEF.md."
    Write-Host "  2. Read WRITING_CONTEXT.md, WRITING_RULES.md, WRITING_STATE.md."
    Write-Host "  3. Prepare chapter outline/facts in chapters/."
    Write-Host "  4. Write clean manuscript only in manuscript/."
    Write-Host "  5. Run validate after writing."
}

function New-ManuscriptFile {
    if ([string]::IsNullOrWhiteSpace($Chapter)) {
        Write-Fail "Missing -Chapter. Example: -Chapter CH02"
        exit 1
    }

    if (-not (Test-Path -LiteralPath $ChaptersDir)) {
        Write-Fail "Missing chapters directory: $ChaptersDir"
        exit 1
    }

    if (-not (Test-Path -LiteralPath $ManuscriptDir)) {
        New-Item -ItemType Directory -Path $ManuscriptDir | Out-Null
    }

    $chapterFile = Get-ChildItem -LiteralPath $ChaptersDir -Filter "$Chapter*.md" | Select-Object -First 1
    if ($null -eq $chapterFile) {
        Write-Fail "Cannot find chapter draft: $Chapter"
        exit 1
    }

    $target = Join-Path $ManuscriptDir $chapterFile.Name
    if (Test-Path -LiteralPath $target) {
        Write-Warn "Manuscript already exists: $target"
        return
    }

    $chapterText = Get-Text $chapterFile.FullName
    $firstHeading = [regex]::Match($chapterText, "(?m)^#\s*(.+)$")
    $headingText = if ($firstHeading.Success) { $firstHeading.Groups[1].Value.Trim() } else { $Chapter }

    $content = "# $headingText`r`n`r`n"
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($target, $content, $utf8NoBom)

    Write-Ok "Created clean manuscript file: $target"
    Write-Warn "Update the chapter draft with its manuscript path section."
}

function Show-List {
    Write-Host "Chapter drafts:" -ForegroundColor Cyan
    Get-ChildItem -LiteralPath $ChaptersDir -Filter "*.md" |
        Where-Object { $_.Name -ne "README.md" } |
        Sort-Object Name |
        ForEach-Object { Write-Host "  - $($_.Name)" }

    Write-Host ""
    Write-Host "Clean manuscripts:" -ForegroundColor Cyan
    Get-ChildItem -LiteralPath $ManuscriptDir -Filter "*.md" |
        Where-Object { $_.Name -ne "README.md" } |
        Sort-Object Name |
        ForEach-Object { Write-Host "  - $($_.Name)" }
}

switch ($Action) {
    "preflight" { Show-Preflight }
    "validate" { Invoke-Validate }
    "status" { Show-Status }
    "new-manuscript" { New-ManuscriptFile }
    "list" { Show-List }
}
