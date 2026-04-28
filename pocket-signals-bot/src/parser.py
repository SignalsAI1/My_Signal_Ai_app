import asyncio
import os
from playwright.async_api import async_playwright
from database import update_status, get_all_users

async def verify_user_id(pocket_id):
    """Перевіряє чи існує ID в партнерській статистиці"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto("https://pocketoption.com")
            await page.fill('input[name="email"]', os.getenv("PARTNER_LOGIN"))
            await page.fill('input[name="password"]', os.getenv("PARTNER_PASSWORD"))
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(5000)

            # Переходимо до статистики
            await page.goto(os.getenv("PARTNER_STATS_URL"))
            await page.wait_for_timeout(3000)

            # Шукаємо ID в таблиці рефералів
            content = await page.content()
            if pocket_id in content:
                print(f"✅ ID {pocket_id} знайдено в статистиці")
                update_status(pocket_id, 1)
                return True
            else:
                print(f"❌ ID {pocket_id} не знайдено")
                update_status(pocket_id, 0)
                return False

        except Exception as e:
            print(f"❌ Помилка перевірки ID {pocket_id}: {e}")
            return False
        finally:
            await browser.close()

async def sync_referrals():
    """Синхронізує статус всіх користувачів"""
    users = get_all_users()
    print(f"🔄 Перевірка {len(users)} користувачів...")

    for user_id, pocket_id in users:
        if pocket_id:
            await verify_user_id(pocket_id)
            await asyncio.sleep(1)  # Затримка між запитами

    print("✅ Синхронізація завершена")
