#!/usr/bin/env python3
"""
🚀 Швидкий запуск Telegram Bot для My Ai Signal
Просто запустіть цей файл: python quick_setup.py
"""

import requests
import json
from flask import Flask, request, jsonify
import threading
import time
import webbrowser
from urllib.parse import urlparse

app = Flask(__name__)

# Налаштування
BOT_TOKEN = "8213960139:AAF8BEVaX1zXorAwCkSnj47XHrC41GvLAvY"
ADMIN_CHAT_ID = None
approved_ids = []  # Починаємо з порожнього списку
pending_requests = []

@app.route('/')
def home():
    return """
    🤖 My Ai Signal Bot працює!
    <br><br>
    📋 Команди:
    <br>/approve_ID - затвердити
    <br>/reject_ID - відхилити  
    <br>/list - списки
    <br>/help - допомога
    """

@app.route('/send_notification', methods=['POST'])
def send_notification():
    try:
        data = request.json
        user_id = data.get('userId')
        timestamp = data.get('timestamp')
        
        if not user_id:
            return jsonify({'success': False})
        
        if user_id not in pending_requests:
            pending_requests.append(user_id)
        
        message = f"🔔 *Новий запит на верифікацію*\n\n"
        message += f"👤 ID: `{user_id}`\n"
        message += f"⏰ Час: {timestamp}\n\n"
        message += f"📋 *Команди:*\n"
        message += f"✅ /approve_{user_id}\n"
        message += f"❌ /reject_{user_id}\n"
        message += f"📊 /list"
        
        if ADMIN_CHAT_ID:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            payload = {'chat_id': ADMIN_CHAT_ID, 'text': message, 'parse_mode': 'Markdown'}
            response = requests.post(url, json=payload)
            return jsonify({'success': response.status_code == 200})
        
        return jsonify({'success': False})
    except:
        return jsonify({'success': False})

@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.json
        message = data.get('message', {})
        
        global ADMIN_CHAT_ID
        if ADMIN_CHAT_ID is None:
            ADMIN_CHAT_ID = message.get('chat', {}).get('id')
            print(f"✅ Admin Chat ID: {ADMIN_CHAT_ID}")
            
            welcome_msg = "🤖 *My Ai Signal Bot активовано!*\n\n"
            welcome_msg += "📋 *Команди:*\n"
            welcome_msg += "/approve_ID - затвердити користувача\n"
            welcome_msg += "/reject_ID - відхилити користувача\n"
            welcome_msg += "/list - показати списки\n"
            welcome_msg += "/help - допомога"
            
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            payload = {'chat_id': ADMIN_CHAT_ID, 'text': welcome_msg, 'parse_mode': 'Markdown'}
            requests.post(url, json=payload)
            return jsonify({'success': True})
        
        text = message.get('text', '')
        chat_id = message.get('chat', {}).get('id')
        
        if text.startswith('/approve_'):
            user_id = text.split('_', 1)[1]
            if user_id not in approved_ids:
                approved_ids.append(user_id)
            if user_id in pending_requests:
                pending_requests.remove(user_id)
            reply = f"✅ Користувача `{user_id}` затверджено!"
            
        elif text.startswith('/reject_'):
            user_id = text.split('_', 1)[1]
            if user_id in pending_requests:
                pending_requests.remove(user_id)
            reply = f"❌ Користувача `{user_id}` відхилено!"
            
        elif text == '/list':
            pending_str = '\n'.join(pending_requests) if pending_requests else 'Немає'
            approved_str = '\n'.join(approved_ids) if approved_ids else 'Немає'
            reply = f"📋 *Статус:*\n\n⏳ *Очікуючі:*\n{pending_str}\n\n✅ *Затверджені:*\n{approved_str}"
            
        elif text == '/help':
            reply = "🤖 *Допомога:*\n\n📋 *Команди:*\n/approve_ID - затвердити\n/reject_ID - відхилити\n/list - списки\n/help - допомога"
        else:
            reply = "Невідома команда. /help"
        
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = {'chat_id': chat_id, 'text': reply, 'parse_mode': 'Markdown'}
        requests.post(url, json=payload)
        
        return jsonify({'success': True})
    except:
        return jsonify({'success': False})

def setup_webhook(server_url):
    """Налаштувати webhook для Telegram бота"""
    webhook_url = f"{server_url}/webhook"
    telegram_url = f"https://api.telegram.org/bot{BOT_TOKEN}/setWebhook?url={webhook_url}"
    
    try:
        response = requests.get(telegram_url)
        if response.status_code == 200:
            print(f"✅ Webhook налаштовано: {webhook_url}")
            return True
        else:
            print(f"❌ Помилка webhook: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Помилка налаштування webhook: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Запускаємо My Ai Signal Telegram Bot...")
    print(f"🤖 Bot Token: {BOT_TOKEN}")
    print("📡 Сервер запускається на порту 5000...")
    print("\n📋 Інструкція:")
    print("1. Сервер запущено на http://localhost:5000")
    print("2. Налаштуйте webhook для локального тестування")
    print("3. Або використайте ngrok для externall доступу")
    print("4. Знайдіть @AI_1Bot_ID_bot в Telegram")
    print("5. Надішліть повідомлення для активації")
    
    # Спробувати налаштувати webhook для localhost
    setup_webhook("http://localhost:5000")
    
    print("\n🌐 Для externall доступу використайте ngrok:")
    print("1. Встановіть ngrok: pip install pyngrok")
    print("2. Запустіть: ngrok http 5000")
    print("3. Скопіюйте URL і налаштуйте webhook")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
