import os
import asyncio
import json
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo
from dotenv import load_dotenv
from database import init_db, add_user, get_user_status
from signals import execute_trade
from parser import verify_user_id, sync_referrals

load_dotenv()
bot = Bot(token=os.getenv("BOT_TOKEN"))
dp = Dispatcher()

@dp.message(Command("sync"))
async def sync_command(message: types.Message):
    # Перевірка чи це адмін (можна додати перевірку user_id)
    await message.answer("🔄 Починаю синхронізацію рефералів...")
    await sync_referrals()
    await message.answer("✅ Синхронізація завершена!")
    user_status = get_user_status(message.from_user.id)
    if user_status and user_status[1]:  # is_active
        # Користувач верифікований
        web_app_url = "https://signalsai1.github.io/My_Signal_Ai_app/"
        kb = [[types.KeyboardButton(text="🚀 MY AI SIGNAL TERMINAL", web_app=WebAppInfo(url=web_app_url))]]
        await message.answer("💎 **ТЕРМІНАЛ ПІДКЛЮЧЕНО ДО API**\nВаш ID підтверджено! Відкрийте AI ТЕРМІНАЛ для торгівлі",
                             reply_markup=types.ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True))
    else:
        # Потрібна верифікація
        await message.answer("🚀 Бот онлайн! Введіть ваш ID Pocket Option для перевірки:")

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

@dp.message()
async def handle_messages(message: types.Message):
    user_status = get_user_status(message.from_user.id)

    if user_status and user_status[1]:  # Користувач вже верифікований
        await message.answer("Ви вже верифіковані! Використовуйте AI ТЕРМІНАЛ для торгівлі.")
        return

    if message.text.isdigit():
        pocket_id = message.text
        add_user(message.from_user.id, pocket_id)
        await message.answer(f"⏳ Перевіряю ID {pocket_id}...")

        # Перевіряємо ID
        is_valid = await verify_user_id(pocket_id)

        if is_valid:
            web_app_url = "https://signalsai1.github.io/My_Signal_Ai_app/"
            kb = [[types.KeyboardButton(text="🚀 MY AI SIGNAL TERMINAL", web_app=WebAppInfo(url=web_app_url))]]
            await message.answer("✅ ID підтверджено! Тепер ви можете торгувати.",
                                 reply_markup=types.ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True))
        else:
            await message.answer("❌ ID не знайдено в партнерській статистиці. Перевірте правильність ID та спробуйте ще раз.")
    else:
        await message.answer("Будь ласка, введіть ваш ID Pocket Option (тільки цифри).")

async def main():
    init_db()
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())