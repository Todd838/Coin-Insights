from fastapi import FastAPI, WebSocket
from collections import defaultdict, deque
import time

app = FastAPI()

WINDOW_SEC = 5 * 60  # 5 minutes rolling window
prices = defaultdict(lambda: deque())  # symbol -> deque[(ts, price)]
last_alert_time = defaultdict(float)

# Track volatility state and duration
coin_state = defaultdict(str)  # symbol -> "UP", "DOWN", "STAGNANT", "NEUTRAL"
state_start_time = defaultdict(float)  # symbol -> timestamp when state started

def add_price(symbol: str, ts_ms: int, price: float):
    ts = ts_ms / 1000.0
    dq = prices[symbol]
    dq.append((ts, price))
    cutoff = ts - WINDOW_SEC
    while dq and dq[0][0] < cutoff:
        dq.popleft()

def volatility_range_pct(symbol: str):
    dq = prices[symbol]
    if len(dq) < 10:
        return None
    vals = [p for _, p in dq]
    mn, mx = min(vals), max(vals)
    avg = sum(vals) / len(vals)
    if avg == 0:
        return None
    return (mx - mn) / avg * 100.0

def is_stagnant(symbol: str):
    """Check if price has barely moved (< 0.05% range) over window"""
    dq = prices[symbol]
    if len(dq) < 20:  # Need more data points for stagnant detection
        return False
    vals = [p for _, p in dq]
    mn, mx = min(vals), max(vals)
    avg = sum(vals) / len(vals)
    if avg == 0:
        return False
    range_pct = (mx - mn) / avg * 100.0
    return range_pct < 0.05

def update_state(symbol: str, new_state: str, now: float):
    """Update coin state and track duration"""
    old_state = coin_state.get(symbol)

    if old_state != new_state:
        # State changed
        coin_state[symbol] = new_state
        state_start_time[symbol] = now
        return 0  # Just started, duration is 0
    else:
        # State continues, calculate duration
        start_time = state_start_time.get(symbol, now)
        duration = now - start_time
        return duration

def format_duration(seconds: float):
    """Format duration as human readable string"""
    if seconds < 60:
        return f"{int(seconds)}s"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        secs = int(seconds % 60)
        return f"{minutes}m {secs}s"
    else:
        hours = int(seconds / 3600)
        minutes = int((seconds % 3600) / 60)
        return f"{hours}h {minutes}m"

@app.get("/health")
def health():
    return {"ok": True}

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    print("✅ Node gateway connected to Python analytics")
    await ws.send_json({"type": "status", "ok": True, "msg": "Python signal engine connected"})

    while True:
        msg = await ws.receive_json()
        if msg.get("type") != "ticks":
            continue

        print(f"📊 Received {len(msg['ticks'])} ticks from Node gateway")
        alerts = []
        now = time.time()

        for tick in msg["ticks"]:
            symbol = tick["symbol"]
            price = float(tick["price"])
            ts_ms = int(tick["ts"])

            add_price(symbol, ts_ms, price)
            vol5m = volatility_range_pct(symbol)
            if vol5m is None:
                continue

            # cooldown so we don't spam alerts constantly
            if now - last_alert_time[symbol] < 10:
                continue

            # Determine state and track duration
            alert = None

            # High volatility alerts (expected to go up)
            if vol5m >= 0.8:
                duration = update_state(symbol, "UP", now)
                alert = {
                    "symbol": symbol,
                    "level": "EXPLOSIVE",
                    "vol5m": round(vol5m, 3),
                    "duration": int(duration),
                    "durationText": format_duration(duration)
                }
                last_alert_time[symbol] = now
                print(f"🔥 EXPLOSIVE: {symbol} - {vol5m:.2f}% volatility (UP for {format_duration(duration)})")

            elif vol5m >= 0.3:
                duration = update_state(symbol, "UP", now)
                alert = {
                    "symbol": symbol,
                    "level": "HOT",
                    "vol5m": round(vol5m, 3),
                    "duration": int(duration),
                    "durationText": format_duration(duration)
                }
                last_alert_time[symbol] = now
                print(f"⚡ HOT: {symbol} - {vol5m:.2f}% volatility (UP for {format_duration(duration)})")

            # Low volatility alerts (going down/stable)
            elif vol5m < 0.1 and vol5m > 0:
                duration = update_state(symbol, "DOWN", now)
                alert = {
                    "symbol": symbol,
                    "level": "LOW",
                    "vol5m": round(vol5m, 3),
                    "duration": int(duration),
                    "durationText": format_duration(duration)
                }
                last_alert_time[symbol] = now
                print(f"📉 LOW: {symbol} - {vol5m:.2f}% volatility (DOWN for {format_duration(duration)})")

            # Stagnant detection
            elif is_stagnant(symbol):
                duration = update_state(symbol, "STAGNANT", now)
                alert = {
                    "symbol": symbol,
                    "level": "STAGNANT",
                    "vol5m": round(vol5m, 3),
                    "duration": int(duration),
                    "durationText": format_duration(duration)
                }
                last_alert_time[symbol] = now
                print(f"💤 STAGNANT: {symbol} - price hasn't moved (for {format_duration(duration)})")
            else:
                # Neutral state - volatility between 0.1 and 0.3
                update_state(symbol, "NEUTRAL", now)

            if alert:
                alerts.append(alert)

        if alerts:
            print(f"📤 Sending {len(alerts)} alerts to frontend")
            await ws.send_json({"type": "alerts", "alerts": alerts})
