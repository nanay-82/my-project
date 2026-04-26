#!/usr/bin/env python3
"""タスク管理CLI - JSONファイルでデータを保存"""

import json
import sys
import os
from datetime import datetime

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tasks.json")

STATUS_PENDING = "未着手"
STATUS_DONE = "完了"

RESET = "\033[0m"
BOLD = "\033[1m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
GRAY = "\033[90m"


def load_tasks():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_tasks(tasks):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)


def next_id(tasks):
    return max((t["id"] for t in tasks), default=0) + 1


def cmd_add(args):
    if not args:
        print(f"{RED}エラー: タスク名を指定してください。{RESET}")
        print("  使い方: tasks add <タスク名>")
        return
    title = " ".join(args)
    tasks = load_tasks()
    task = {
        "id": next_id(tasks),
        "title": title,
        "status": STATUS_PENDING,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }
    tasks.append(task)
    save_tasks(tasks)
    print(f"{GREEN}✓ タスクを追加しました:{RESET} [{task['id']}] {title}")


def cmd_done(args):
    if not args:
        print(f"{RED}エラー: タスクIDを指定してください。{RESET}")
        print("  使い方: tasks done <ID>")
        return
    try:
        task_id = int(args[0])
    except ValueError:
        print(f"{RED}エラー: IDは数字で指定してください。{RESET}")
        return
    tasks = load_tasks()
    for task in tasks:
        if task["id"] == task_id:
            if task["status"] == STATUS_DONE:
                print(f"{YELLOW}既に完了済みです:{RESET} [{task_id}] {task['title']}")
            else:
                task["status"] = STATUS_DONE
                task["done_at"] = datetime.now().strftime("%Y-%m-%d %H:%M")
                save_tasks(tasks)
                print(f"{GREEN}✓ 完了にしました:{RESET} [{task_id}] {task['title']}")
            return
    print(f"{RED}エラー: ID {task_id} のタスクが見つかりません。{RESET}")


def cmd_undone(args):
    if not args:
        print(f"{RED}エラー: タスクIDを指定してください。{RESET}")
        print("  使い方: tasks undone <ID>")
        return
    try:
        task_id = int(args[0])
    except ValueError:
        print(f"{RED}エラー: IDは数字で指定してください。{RESET}")
        return
    tasks = load_tasks()
    for task in tasks:
        if task["id"] == task_id:
            task["status"] = STATUS_PENDING
            task.pop("done_at", None)
            save_tasks(tasks)
            print(f"{YELLOW}↩ 未着手に戻しました:{RESET} [{task_id}] {task['title']}")
            return
    print(f"{RED}エラー: ID {task_id} のタスクが見つかりません。{RESET}")


def cmd_delete(args):
    if not args:
        print(f"{RED}エラー: タスクIDを指定してください。{RESET}")
        print("  使い方: tasks delete <ID>")
        return
    try:
        task_id = int(args[0])
    except ValueError:
        print(f"{RED}エラー: IDは数字で指定してください。{RESET}")
        return
    tasks = load_tasks()
    new_tasks = [t for t in tasks if t["id"] != task_id]
    if len(new_tasks) == len(tasks):
        print(f"{RED}エラー: ID {task_id} のタスクが見つかりません。{RESET}")
        return
    save_tasks(new_tasks)
    print(f"{RED}✗ タスクを削除しました:{RESET} ID {task_id}")


def cmd_list(args):
    show_all = "--all" in args or "-a" in args
    tasks = load_tasks()

    if not tasks:
        print(f"{GRAY}タスクはまだありません。{RESET}")
        print("  タスクを追加: tasks add <タスク名>")
        return

    pending = [t for t in tasks if t["status"] == STATUS_PENDING]
    done = [t for t in tasks if t["status"] == STATUS_DONE]

    print(f"\n{BOLD}{'─' * 50}{RESET}")
    print(f"{BOLD}{CYAN}  タスク一覧{RESET}")
    print(f"{BOLD}{'─' * 50}{RESET}")

    if pending:
        print(f"\n{YELLOW}{BOLD}■ 未着手 ({len(pending)}件){RESET}")
        for t in pending:
            print(f"  {BOLD}[{t['id']}]{RESET} {t['title']}")
            print(f"       {GRAY}作成: {t['created_at']}{RESET}")

    if show_all and done:
        print(f"\n{GREEN}{BOLD}■ 完了 ({len(done)}件){RESET}")
        for t in done:
            done_at = t.get("done_at", "")
            print(f"  {GRAY}[{t['id']}] {t['title']}{RESET}")
            if done_at:
                print(f"       {GRAY}完了: {done_at}{RESET}")

    if not show_all and done:
        print(f"\n{GRAY}  完了済み: {len(done)}件 (表示するには --all を付けてください){RESET}")

    print(f"{BOLD}{'─' * 50}{RESET}\n")


def cmd_help():
    print(f"""
{BOLD}{CYAN}タスク管理ツール{RESET}

{BOLD}使い方:{RESET}
  {GREEN}tasks add <タスク名>{RESET}      タスクを追加する
  {GREEN}tasks list{RESET}               未着手のタスクを表示
  {GREEN}tasks list --all{RESET}         全タスクを表示（完了済み含む）
  {GREEN}tasks done <ID>{RESET}          タスクを完了にする
  {GREEN}tasks undone <ID>{RESET}        タスクを未着手に戻す
  {GREEN}tasks delete <ID>{RESET}        タスクを削除する
  {GREEN}tasks help{RESET}               このヘルプを表示

{BOLD}例:{RESET}
  python tasks.py add 報告書を書く
  python tasks.py list
  python tasks.py done 1
  python tasks.py delete 2
""")


COMMANDS = {
    "add": cmd_add,
    "list": cmd_list,
    "ls": cmd_list,
    "done": cmd_done,
    "undone": cmd_undone,
    "delete": cmd_delete,
    "del": cmd_delete,
    "rm": cmd_delete,
    "help": lambda _: cmd_help(),
}


def main():
    args = sys.argv[1:]
    if not args:
        cmd_list([])
        return

    command = args[0].lower()
    rest = args[1:]

    if command in COMMANDS:
        COMMANDS[command](rest)
    else:
        print(f"{RED}不明なコマンド: {command}{RESET}")
        cmd_help()


if __name__ == "__main__":
    main()
