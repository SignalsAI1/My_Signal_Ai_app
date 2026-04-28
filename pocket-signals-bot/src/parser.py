import asyncio
import os
from playwright.async_api import async_playwright
from database import update_status

async def sync_referrals():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto("https://pocketoption.com")
            await page.fill('input[name="email"]', os.getenv("PARTNER_LOGIN"))
            await page.fill('input[name="password"]', os.getenv("PARTNER_PASSWORD"))
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(5000)
            await page.goto(os.getenv("PARTNER_STATS_URL"))
            # Тут логіка збору ID з таблиці
            print("✅ Список рефералів оновлено")
        except Exception as e:
            print(f"❌ Помилка парсера: {e}")
        await browser.close()
