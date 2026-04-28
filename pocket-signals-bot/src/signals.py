import json
import asyncio
import websockets
import os
from dotenv import load_dotenv

load_dotenv()

async def execute_trade(asset, action, amount=1, timeframe=60):
    ssid = os.getenv("ADMIN_SSID")
    uri = "wss://api-eu.po.market/socket.io/?transport=websocket"
    try:
        async with websockets.connect(uri) as ws:
            # Авторизація
            await ws.send(f'42["auth", {{"session": "{ssid}"}}]')
            # Відкриття угоди
            trade_data = {
                "asset": asset,
                "amount": amount,
                "action": "call" if action == "up" else "put",
                "time": timeframe
            }
            await ws.send(f'42["openOrder", {json.dumps(trade_data)}]')
            print(f"🚀 API: Угода {action} на {asset} (${amount}) відкрита!")
            return True
    except Exception as e:
        print(f"❌ Помилка API: {e}")
        return False
