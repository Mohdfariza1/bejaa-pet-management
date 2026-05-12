"""
Daily automation runner — sends all WhatsApp reminders.

Run manually:
    cd backend
    python automation/run_all.py

Schedule via cron (Linux/Mac) — runs every day at 9:00 AM:
    0 9 * * * cd /path/to/bejaa-pet-management/backend && python automation/run_all.py >> automation/automation.log 2>&1

Schedule via Windows Task Scheduler:
    Action: python C:\\path\\to\\backend\\automation\\run_all.py
    Start in: C:\\path\\to\\backend
    Trigger: Daily at 9:00 AM

Setup:
    1. Register at https://app.ultramsg.com → get Instance ID + Token
    2. Add to backend/.env:
       WA_INSTANCE=your_instance_id
       WA_TOKEN=your_token
    3. Without credentials → runs in DRY RUN mode (prints messages, no actual sends)
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from datetime import datetime
from automation.remind_checkin import run as remind_checkin
from automation.remind_checkout import run as remind_checkout
from automation.remind_vaccines import run as remind_vaccines


if __name__ == "__main__":
    print(f"=== Bejaa Pet Automation — {datetime.now().strftime('%Y-%m-%d %H:%M')} ===\n")
    remind_checkin()
    remind_checkout()
    remind_vaccines()
    print("=== All reminders processed ===")
