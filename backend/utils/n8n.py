"""
n8n Webhook Integration
Sends user profile data to n8n webhook for LLM processing.
"""

import os
import json
import httpx
import asyncio
from datetime import datetime


def _serialize(obj):
    """Convert datetime objects to ISO strings for JSON serialization."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")


async def send_to_n8n(user_data: dict, profile_data: dict):
    """
    POST user + profile data to the n8n webhook URL.

    This runs as a fire-and-forget background task so it does NOT block
    the profile-save response.  If the webhook is unreachable or returns
    an error, it is logged but never surfaces to the user.

    Args:
        user_data:   {"id": int, "full_name": str, "email": str}
        profile_data: dict with all 25+ profile fields
    """
    webhook_url = os.getenv("N8N_WEBHOOK_URL")

    if not webhook_url:
        print("⚠️  N8N_WEBHOOK_URL not set — skipping webhook call")
        return

    payload = {
        "user": user_data,
        "profile": profile_data,
    }

    try:
        serialized = json.dumps(payload, default=_serialize)
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                webhook_url,
                content=serialized,
                headers={"Content-Type": "application/json"},
            )

        if response.status_code in (200, 201):
            print(f"✅ n8n webhook triggered successfully (status {response.status_code})")
        else:
            print(
                f"⚠️  n8n webhook returned status {response.status_code}: "
                f"{response.text[:200]}"
            )

    except httpx.TimeoutException:
        print("⚠️  n8n webhook timed out — the workflow may still process later")
    except httpx.RequestError as exc:
        print(f"❌ n8n webhook request failed: {exc}")
    except Exception as exc:
        print(f"❌ Unexpected error sending to n8n: {exc}")


def trigger_n8n_background(user_data: dict, profile_data: dict):
    """
    Fire-and-forget helper.  Schedules send_to_n8n on the running event
    loop so the caller (profile router) doesn't await it.
    """
    loop = asyncio.get_event_loop()
    loop.create_task(send_to_n8n(user_data, profile_data))
