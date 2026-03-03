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
    Fire-and-forget — logs result but doesn't return it.
    """
    webhook_url = os.getenv("N8N_WEBHOOK_URL")

    if not webhook_url:
        print("⚠️  N8N_WEBHOOK_URL not set — skipping webhook call")
        return

    payload = {"user": user_data, "profile": profile_data}

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
            print(f"⚠️  n8n webhook returned status {response.status_code}: {response.text[:200]}")

    except httpx.TimeoutException:
        print("⚠️  n8n webhook timed out")
    except httpx.RequestError as exc:
        print(f"❌ n8n webhook request failed: {exc}")
    except Exception as exc:
        print(f"❌ Unexpected error sending to n8n: {exc}")


def trigger_n8n_background(user_data: dict, profile_data: dict):
    """Fire-and-forget helper."""
    loop = asyncio.get_event_loop()
    loop.create_task(send_to_n8n(user_data, profile_data))


async def generate_quiz(user_data: dict, profile_data: dict) -> dict:
    """
    POST user + profile data to n8n and WAIT for the quiz response.
    Unlike fire-and-forget, this returns the parsed quiz JSON.

    Returns:
        dict with quiz_title, total_questions, questions[] or error
    """
    webhook_url = os.getenv("N8N_WEBHOOK_URL")

    if not webhook_url:
        return {"error": "N8N_WEBHOOK_URL not configured"}

    payload = {"user": user_data, "profile": profile_data}

    try:
        serialized = json.dumps(payload, default=_serialize)
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                webhook_url,
                content=serialized,
                headers={"Content-Type": "application/json"},
            )

        if response.status_code not in (200, 201):
            print(f"❌ n8n returned status {response.status_code}: {response.text[:500]}")
            return {"error": f"n8n returned status {response.status_code}", "detail": response.text[:500]}

        raw_text = response.text
        print(f"📥 Raw n8n response (first 500 chars): {raw_text[:500]}")
        n8n_data = response.json()

        if isinstance(n8n_data, list) and len(n8n_data) > 0:
            print(f"📦 n8n returned a list with {len(n8n_data)} element(s), unwrapping first item")
            n8n_data = n8n_data[0]

        print(f"🔑 Top-level keys: {list(n8n_data.keys()) if isinstance(n8n_data, dict) else type(n8n_data).__name__}")

        if isinstance(n8n_data, dict) and "choices" in n8n_data:
            print("🎯 Detected raw Groq response with 'choices' key")
            content = n8n_data["choices"][0]["message"]["content"]
            quiz = json.loads(content) if isinstance(content, str) else content
            print(f"✅ Parsed quiz from choices → {len(quiz.get('questions', []))} questions")
            return quiz

        if isinstance(n8n_data, dict) and "body" in n8n_data:
            body = n8n_data["body"]
            if isinstance(body, str):
                body = json.loads(body)
            if isinstance(body, dict) and "choices" in body:
                print("🎯 Detected Groq response inside 'body' key")
                content = body["choices"][0]["message"]["content"]
                quiz = json.loads(content) if isinstance(content, str) else content
                print(f"✅ Parsed quiz from body.choices → {len(quiz.get('questions', []))} questions")
                return quiz

        if isinstance(n8n_data, dict) and "questions" in n8n_data:
            print(f"✅ Response already contains 'questions' key → {len(n8n_data['questions'])} questions")
            return n8n_data

        if isinstance(n8n_data, dict) and "output" in n8n_data:
            output = n8n_data["output"]
            print(f"🔍 Found 'output' key, type: {type(output).__name__}")
            if isinstance(output, str):
                quiz = json.loads(output)
            else:
                quiz = output
            if isinstance(quiz, dict) and "questions" in quiz:
                print(f"✅ Parsed quiz from 'output' → {len(quiz['questions'])} questions")
                return quiz

        def _find_questions(obj, depth=0):
            if depth > 5:
                return None
            if isinstance(obj, dict):
                if "questions" in obj and isinstance(obj["questions"], list):
                    return obj
                for v in obj.values():
                    result = _find_questions(v, depth + 1)
                    if result:
                        return result
            if isinstance(obj, list):
                for item in obj:
                    result = _find_questions(item, depth + 1)
                    if result:
                        return result
            if isinstance(obj, str):
                try:
                    parsed = json.loads(obj)
                    return _find_questions(parsed, depth + 1)
                except (json.JSONDecodeError, TypeError):
                    pass
            return None

        found = _find_questions(n8n_data)
        if found:
            print(f"✅ Found quiz via deep search → {len(found['questions'])} questions")
            return found

        print(f"⚠️  Could not extract quiz questions. Returning raw data: {str(n8n_data)[:300]}")
        return n8n_data

    except httpx.TimeoutException:
        return {"error": "Quiz generation timed out. The LLM might be slow — try again."}
    except httpx.RequestError as exc:
        return {"error": f"Failed to reach n8n: {exc}"}
    except json.JSONDecodeError as exc:
        print(f"❌ JSON decode error: {exc}. Raw text: {response.text[:300]}")
        return {"error": f"Failed to parse quiz response: {exc}"}
    except Exception as exc:
        import traceback
        traceback.print_exc()
        return {"error": f"Unexpected error: {exc}"}


async def generate_plan(user_data: dict, profile_data: dict, quiz_score: dict = None) -> dict:
    """
    POST user + profile + quiz data to n8n and WAIT for the 7-day plan response.
    """
    webhook_url = os.getenv("N8N_PLAN_WEBHOOK_URL")

    if not webhook_url:
        return {"error": "N8N_PLAN_WEBHOOK_URL not configured"}

    payload = {"user": user_data, "profile": profile_data, "quiz": quiz_score or {}}

    try:
        serialized = json.dumps(payload, default=_serialize)
        print(f"🚀 generated_plan calling URL: {webhook_url}")
        async with httpx.AsyncClient(timeout=80.0) as client:
            response = await client.post(
                webhook_url,
                content=serialized,
                headers={"Content-Type": "application/json"},
            )

        print(f"📥 n8n plan RAW status: {response.status_code}")
        raw_text = response.text
        print(f"📥 n8n plan RAW response (first 500 chars): {raw_text[:500]}")

        if response.status_code not in (200, 201):
            print(f"❌ n8n plan returned status {response.status_code}: {raw_text[:500]}")
            return {"error": f"n8n returned status {response.status_code}", "detail": raw_text[:500]}
        n8n_data = response.json()
        if isinstance(n8n_data, list) and len(n8n_data) > 0: n8n_data = n8n_data[0]

        if isinstance(n8n_data, dict) and "choices" in n8n_data:
            content = n8n_data["choices"][0]["message"]["content"]
            n8n_data = json.loads(content) if isinstance(content, str) else content

        elif isinstance(n8n_data, dict) and "body" in n8n_data:
            body = n8n_data["body"]
            if isinstance(body, str): body = json.loads(body)
            if isinstance(body, dict) and "choices" in body:
                content = body["choices"][0]["message"]["content"]
                n8n_data = json.loads(content) if isinstance(content, str) else content

        data_to_parse = n8n_data
        if isinstance(n8n_data, dict) and "output" in n8n_data:
            out = n8n_data["output"]
            data_to_parse = json.loads(out) if isinstance(out, str) else out

        if isinstance(data_to_parse, dict):

            if "days" in data_to_parse and isinstance(data_to_parse["days"], list):
                return data_to_parse
                
            if "7DayPlan" in data_to_parse:
                days_dict = data_to_parse["7DayPlan"]
                normalized_days = []
                for day_key, day_data in days_dict.items():
                    if isinstance(day_data, dict):
                        
                        def get_fuzzy_val(keywords, default_val, source_dict=day_data):
                            for k, v in source_dict.items():
                                kl = k.lower()
                                if any(kw in kl for kw in keywords):
                                    return v
                            return default_val

                        goal_val = get_fuzzy_val(["goal", "obj", "focus", "aim", "target"], "")
                        tasks_val = get_fuzzy_val(["task", "act", "todo", "step", "plan"], [])
                        res_val = get_fuzzy_val(["res", "link", "mat", "read", "tool", "ref"], [])

                        normalized_days.append({
                            "day_number": str(day_key).replace("Day", "").strip(),
                            "title": get_fuzzy_val(["title", "topic", "subject", "theme"], f"Plan for {day_key}"),
                            "goal": goal_val if isinstance(goal_val, str) else str(goal_val),
                            "tasks": [tasks_val] if isinstance(tasks_val, str) else (tasks_val if isinstance(tasks_val, list) else []),
                            "resources": [res_val] if isinstance(res_val, str) else (res_val if isinstance(res_val, list) else [])
                        })
                return {"days": normalized_days}
            
            def _find_days_array(obj, depth=0):
                if depth > 5: return None
                if isinstance(obj, dict):
                    has_day_keys = any("day" in k.lower() for k in obj.keys())
                    if has_day_keys and all(isinstance(v, dict) for k, v in obj.items() if "day" in k.lower()):
                        return list(obj.values())
                    
                    for v in obj.values():
                        res = _find_days_array(v, depth + 1)
                        if res: return res
                elif isinstance(obj, list):
                    if len(obj) > 0 and isinstance(obj[0], dict):
                        keys = str(obj[0].keys()).lower()
                        if "task" in keys or "act" in keys or "title" in keys or "day" in keys:
                            return obj
                    for item in obj:
                        res = _find_days_array(item, depth + 1)
                        if res: return res
                return None
            
            found_array = _find_days_array(data_to_parse)
            if found_array:
                normalized_days = []
                for i, day_data in enumerate(found_array):
                    if isinstance(day_data, dict):
                        def get_fuzzy_val(keywords, default_val, source_dict=day_data):
                            for k, v in source_dict.items():
                                if any(kw in k.lower() for kw in keywords): return v
                            return default_val
                        
                        goal_val = get_fuzzy_val(["goal", "obj", "focus", "aim", "target"], "")
                        tasks_val = get_fuzzy_val(["task", "act", "todo", "step", "plan"], [])
                        res_val = get_fuzzy_val(["res", "link", "mat", "read", "tool", "ref"], [])
                        day_num = get_fuzzy_val(["day"], str(i+1))
                        
                        normalized_days.append({
                            "day_number": str(day_num).replace("Day", "").strip(),
                            "title": get_fuzzy_val(["title", "topic", "subject", "theme"], f"Plan for Day {day_num}"),
                            "goal": goal_val if isinstance(goal_val, str) else str(goal_val),
                            "tasks": [tasks_val] if isinstance(tasks_val, str) else (tasks_val if isinstance(tasks_val, list) else []),
                            "resources": [res_val] if isinstance(res_val, str) else (res_val if isinstance(res_val, list) else [])
                        })
                return {"days": normalized_days}

    except httpx.TimeoutException:
        return {"error": "Plan generation timed out. The LLM might be slow — try again."}
    except httpx.RequestError as exc:
        return {"error": f"Failed to reach n8n: {exc}"}
    except Exception as exc:
        return {"error": f"Unexpected error: {exc}"}


async def generate_interview(user_data: dict, profile_data: dict) -> dict:
    """
    POST user + profile to n8n and WAIT for the interview questions response.
    """
    webhook_url = os.getenv("N8N_INTERVIEW_WEBHOOK_URL")

    if not webhook_url:
        return {"error": "N8N_INTERVIEW_WEBHOOK_URL not configured"}

    payload = {"user": user_data, "profile": profile_data}

    try:
        serialized = json.dumps(payload, default=_serialize)
        async with httpx.AsyncClient(timeout=80.0) as client:
            response = await client.post(
                webhook_url,
                content=serialized,
                headers={"Content-Type": "application/json"},
            )

        if response.status_code not in (200, 201):
            print(f"❌ n8n interview returned status {response.status_code}: {response.text[:500]}")
            return {"error": f"n8n returned status {response.status_code}", "detail": response.text[:500]}

        n8n_data = response.json()
        if isinstance(n8n_data, list) and len(n8n_data) > 0: n8n_data = n8n_data[0]

        if isinstance(n8n_data, dict) and "choices" in n8n_data:
            content = n8n_data["choices"][0]["message"]["content"]
            return json.loads(content) if isinstance(content, str) else content

        if isinstance(n8n_data, dict) and "body" in n8n_data:
            body = n8n_data["body"]
            if isinstance(body, str): body = json.loads(body)
            if isinstance(body, dict) and "choices" in body:
                content = body["choices"][0]["message"]["content"]
                return json.loads(content) if isinstance(content, str) else content

        if isinstance(n8n_data, dict) and "questions" in n8n_data: return n8n_data
        if isinstance(n8n_data, dict) and "output" in n8n_data:
            out = n8n_data["output"]
            val = json.loads(out) if isinstance(out, str) else out
            if isinstance(val, dict) and "questions" in val: return val

        return n8n_data

    except httpx.TimeoutException:
        return {"error": "Interview generation timed out. The LLM might be slow — try again."}
    except httpx.RequestError as exc:
        return {"error": f"Failed to reach n8n: {exc}"}
    except Exception as exc:
        return {"error": f"Unexpected error: {exc}"}
