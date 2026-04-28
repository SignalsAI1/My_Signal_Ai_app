import os
import asyncio
import json
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo
from dotenv import load_dotenv
from database import init_db, add_user
from signals import execute_trade

load_dotenv()
bot = Bot(token=os.getenv("BOT_TOKEN"))
dp = Dispatcher()

@dp.message(Command("start"))
async def start(message: types.Message):
    # ЗАМІНИ ЦЕ ПОСИЛАННЯ ПІСЛЯ АКТИВАЦІЇ GITHUB PAGES
    web_app_url = "https://signalsai1.github.io/My_Signal_Ai_app/"
    kb = [[types.KeyboardButton(text="🚀 MY AI SIGNAL TERMINAL", web_app=WebAppInfo(url=web_app_url))]]
    await message.answer("💎 **ТЕРМІНАЛ ПІДКЛЮЧЕНО ДО API**\nВведіть ID для перевірки або відкрийте AI ТЕРМІНАЛ", 
                         reply_markup=types.ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True))

@dp.message(lambda m: m.web_app_data)
async def web_app_data_handler(message: types.Message):
    data = json.loads(message.web_app_data.data)
    if data.get("action") and data.get("asset"):
        amount = data.get("amount", 1)
        timeframe = data.get("timeframe", 60)
        success = await execute_trade(data['asset'], data['action'], amount, timeframe)
        if success:
            await message.answer(f"✅ Автоторгівля: Угода {data['action'].upper()} на {data['asset']} (${amount}) відкрита!")
        else:
            await message.answer("❌ Помилка виконання угоди")

async def main():
    init_db()
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())