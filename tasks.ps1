# タスク管理CLI - JSONファイルでデータを保存

$DataFile = Join-Path $PSScriptRoot "tasks.json"

$STATUS_PENDING = "未着手"
$STATUS_DONE    = "完了"

function Load-Tasks {
    if (-not (Test-Path $DataFile)) { return @() }
    $raw = Get-Content $DataFile -Raw -Encoding UTF8
    return @($raw | ConvertFrom-Json)
}

function Save-Tasks($tasks) {
    ConvertTo-Json -InputObject @($tasks) -Depth 5 | Out-File $DataFile -Encoding utf8
}

function Next-Id($tasks) {
    if ($tasks.Count -eq 0) { return 1 }
    return ($tasks | ForEach-Object { $_.id } | Measure-Object -Maximum).Maximum + 1
}

function Cmd-Add($cmdArgs) {
    if ($cmdArgs.Count -eq 0) {
        Write-Host "エラー: タスク名を指定してください。" -ForegroundColor Red
        Write-Host "  使い方: .\tasks.ps1 add タスク名"
        return
    }
    $title = $cmdArgs -join " "
    $tasks = Load-Tasks
    $task = [pscustomobject]@{
        id         = Next-Id $tasks
        title      = $title
        status     = $STATUS_PENDING
        created_at = (Get-Date -Format "yyyy-MM-dd HH:mm")
    }
    $tasks += $task
    Save-Tasks $tasks
    Write-Host "✓ タスクを追加しました: " -ForegroundColor Green -NoNewline
    Write-Host "[$($task.id)] $title"
}

function Cmd-Done($cmdArgs) {
    if ($cmdArgs.Count -eq 0) {
        Write-Host "エラー: タスクIDを指定してください。" -ForegroundColor Red
        Write-Host "  使い方: .\tasks.ps1 done ID番号"
        return
    }
    $id = [int]$cmdArgs[0]
    $tasks = Load-Tasks
    $task = $tasks | Where-Object { $_.id -eq $id }
    if (-not $task) {
        Write-Host "エラー: ID $id のタスクが見つかりません。" -ForegroundColor Red
        return
    }
    if ($task.status -eq $STATUS_DONE) {
        Write-Host "既に完了済みです: [$id] $($task.title)" -ForegroundColor Yellow
        return
    }
    $task.status = $STATUS_DONE
    $task | Add-Member -NotePropertyName done_at -NotePropertyValue (Get-Date -Format "yyyy-MM-dd HH:mm") -Force
    Save-Tasks $tasks
    Write-Host "✓ 完了にしました: " -ForegroundColor Green -NoNewline
    Write-Host "[$id] $($task.title)"
}

function Cmd-Undone($cmdArgs) {
    if ($cmdArgs.Count -eq 0) {
        Write-Host "エラー: タスクIDを指定してください。" -ForegroundColor Red
        Write-Host "  使い方: .\tasks.ps1 undone ID番号"
        return
    }
    $id = [int]$cmdArgs[0]
    $tasks = Load-Tasks
    $task = $tasks | Where-Object { $_.id -eq $id }
    if (-not $task) {
        Write-Host "エラー: ID $id のタスクが見つかりません。" -ForegroundColor Red
        return
    }
    $task.status = $STATUS_PENDING
    Save-Tasks $tasks
    Write-Host "↩ 未着手に戻しました: " -ForegroundColor Yellow -NoNewline
    Write-Host "[$id] $($task.title)"
}

function Cmd-Delete($cmdArgs) {
    if ($cmdArgs.Count -eq 0) {
        Write-Host "エラー: タスクIDを指定してください。" -ForegroundColor Red
        Write-Host "  使い方: .\tasks.ps1 delete ID番号"
        return
    }
    $id = [int]$cmdArgs[0]
    $tasks = Load-Tasks
    $newTasks = @($tasks | Where-Object { $_.id -ne $id })
    if ($newTasks.Count -eq $tasks.Count) {
        Write-Host "エラー: ID $id のタスクが見つかりません。" -ForegroundColor Red
        return
    }
    Save-Tasks $newTasks
    Write-Host "✗ タスクを削除しました: ID $id" -ForegroundColor Red
}

function Cmd-List($cmdArgs) {
    $showAll = $cmdArgs -contains "--all" -or $cmdArgs -contains "-a"
    $tasks = Load-Tasks

    if ($tasks.Count -eq 0) {
        Write-Host "タスクはまだありません。" -ForegroundColor DarkGray
        Write-Host "  タスクを追加: .\tasks.ps1 add タスク名"
        return
    }

    $pending = @($tasks | Where-Object { $_.status -eq $STATUS_PENDING })
    $done    = @($tasks | Where-Object { $_.status -eq $STATUS_DONE })

    Write-Host ""
    Write-Host ("─" * 50) -ForegroundColor DarkGray
    Write-Host "  タスク一覧" -ForegroundColor Cyan
    Write-Host ("─" * 50) -ForegroundColor DarkGray

    if ($pending.Count -gt 0) {
        Write-Host ""
        Write-Host "■ 未着手 ($($pending.Count)件)" -ForegroundColor Yellow
        foreach ($t in $pending) {
            Write-Host "  [$($t.id)] " -ForegroundColor White -NoNewline
            Write-Host $t.title
            Write-Host "       作成: $($t.created_at)" -ForegroundColor DarkGray
        }
    }

    if ($showAll -and $done.Count -gt 0) {
        Write-Host ""
        Write-Host "■ 完了 ($($done.Count)件)" -ForegroundColor Green
        foreach ($t in $done) {
            Write-Host "  [$($t.id)] $($t.title)" -ForegroundColor DarkGray
            if ($t.done_at) {
                Write-Host "       完了: $($t.done_at)" -ForegroundColor DarkGray
            }
        }
    }

    if (-not $showAll -and $done.Count -gt 0) {
        Write-Host ""
        Write-Host "  完了済み: $($done.Count)件 (全表示: .\tasks.ps1 list --all)" -ForegroundColor DarkGray
    }

    Write-Host ("─" * 50) -ForegroundColor DarkGray
    Write-Host ""
}

function Cmd-Help {
    Write-Host ""
    Write-Host "タスク管理ツール" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "使い方:" -ForegroundColor White
    Write-Host "  .\tasks.ps1 add タスク名   " -ForegroundColor Green -NoNewline; Write-Host "タスクを追加する"
    Write-Host "  .\tasks.ps1 list           " -ForegroundColor Green -NoNewline; Write-Host "未着手のタスクを表示"
    Write-Host "  .\tasks.ps1 list --all     " -ForegroundColor Green -NoNewline; Write-Host "全タスクを表示（完了済み含む）"
    Write-Host "  .\tasks.ps1 done ID        " -ForegroundColor Green -NoNewline; Write-Host "タスクを完了にする"
    Write-Host "  .\tasks.ps1 undone ID      " -ForegroundColor Green -NoNewline; Write-Host "タスクを未着手に戻す"
    Write-Host "  .\tasks.ps1 delete ID      " -ForegroundColor Green -NoNewline; Write-Host "タスクを削除する"
    Write-Host "  .\tasks.ps1 help           " -ForegroundColor Green -NoNewline; Write-Host "このヘルプを表示"
    Write-Host ""
    Write-Host "例:" -ForegroundColor White
    Write-Host "  .\tasks.ps1 add 報告書を書く"
    Write-Host "  .\tasks.ps1 list"
    Write-Host "  .\tasks.ps1 done 1"
    Write-Host "  .\tasks.ps1 delete 2"
    Write-Host ""
}

# --- エントリーポイント ---
$cmd  = if ($args.Count -gt 0) { $args[0].ToLower() } else { "list" }
$rest = if ($args.Count -gt 1) { $args[1..($args.Count - 1)] } else { @() }

switch ($cmd) {
    "add"    { Cmd-Add    $rest }
    "list"   { Cmd-List   $rest }
    "ls"     { Cmd-List   $rest }
    "done"   { Cmd-Done   $rest }
    "undone" { Cmd-Undone $rest }
    "delete" { Cmd-Delete $rest }
    "del"    { Cmd-Delete $rest }
    "rm"     { Cmd-Delete $rest }
    "help"   { Cmd-Help }
    default  {
        Write-Host "不明なコマンド: $cmd" -ForegroundColor Red
        Cmd-Help
    }
}