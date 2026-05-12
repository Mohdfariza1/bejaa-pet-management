import os
import re
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

WA_INSTANCE = os.getenv("WA_INSTANCE", "")
WA_TOKEN = os.getenv("WA_TOKEN", "")
DRY_RUN = not WA_INSTANCE or not WA_TOKEN


def _normalize(phone: str) -> str:
    phone = re.sub(r"[\s\-\(\)\+]", "", phone)
    if phone.startswith("0"):
        phone = "60" + phone[1:]
    return phone


def send_whatsapp(phone: str, message: str) -> bool:
    normalized = _normalize(phone)
    if DRY_RUN:
        print(f"[DRY RUN] → {normalized}\n  {message}\n")
        return True
    try:
        resp = requests.post(
            f"https://api.ultramsg.com/{WA_INSTANCE}/messages/chat",
            data={"token": WA_TOKEN, "to": normalized, "body": message},
            timeout=10,
        )
        resp.raise_for_status()
        print(f"[WA] ✓ Sent to {normalized}")
        return True
    except Exception as e:
        print(f"[WA] ✗ Failed to {normalized}: {e}")
        return False
