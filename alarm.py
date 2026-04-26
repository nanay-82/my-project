import time
from datetime import datetime
import winsound

def set_alarm():
    alarm_time = input("アラームを設定する時刻を入力してください (HH:MM形式): ")

    try:
        alarm_hour, alarm_minute = map(int, alarm_time.split(':'))
        if not (0 <= alarm_hour < 24 and 0 <= alarm_minute < 60):
            print("無効な時刻です")
            return
    except ValueError:
        print("HH:MM形式で入力してください")
        return

    print(f"✓ アラームを {alarm_time} に設定しました")

    while True:
        now = datetime.now()
        current_time = f"{now.hour:02d}:{now.minute:02d}"

        if current_time == alarm_time:
            print("\n🔔 アラーム！アラーム！")
            for _ in range(5):
                winsound.Beep(1000, 500)
                time.sleep(0.5)
            break

        time.sleep(1)

if __name__ == "__main__":
    set_alarm()
