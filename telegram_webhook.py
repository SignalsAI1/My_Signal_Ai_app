#!/usr/bin/env python3
import requests
import json
from flask import Flask, request, jsonify
from threading import Thread
import time

app = Flask(__name__)

# Налаштування бота
BOT_TOKEN = "8213960139:AAF8BEVaX1zXorAwCkSnj47XHrC41GvLAvY"
ADMIN_CHAT_ID = None  # Буде встановлено при першому повідомленні

# Локальне сховище - починаємо з порожніх списків
approved_ids = []
pending_requests = []

@app.route('/')
def home():
    return "🤖 Telegram Bot для My Ai Signal працює!"

@app.route('/send_notification', methods=['POST'])
def send_notification():
    """Отримати запит від сайту і відправити в Telegram"""
    try:
        data = request.json
        user_id = data.get('userId')
        timestamp = data.get('timestamp')
        
        if not user_id:
            return jsonify({'success': False, 'error': 'No userId provided'})
        
        # Додати до списку очікуючих
        if user_id not in pending_requests:
            pending_requests.append(user_id)
        
        # Створити повідомлення для адміна
        message = f"🔔 *Новий запит на верифікацію*\n\n"
        message += f"👤 ID: `{user_id}`\n"
        message += f"⏰ Час: {timestamp}\n\n"
        message += f"📋 *Команди:*\n"
        message += f"✅ Затвердити: /approve_{user_id}\n"
        message += f"❌ Відхилити: /reject_{user_id}\n"
        message += f"📊 Список: /list"
        
        # Відправити повідомлення адміну
        if ADMIN_CHAT_ID:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            payload = {
                'chat_id': ADMIN_CHAT_ID,
                'text': message,
                'parse_mode': 'Markdown'
            }
            
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'error': 'Failed to send message'})
        else:
            return jsonify({'success': False, 'error': 'Admin chat ID not set'})
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/webhook', methods=['POST'])
def webhook():
    """Обробка повідомлень від Telegram"""
    try:
        data = request.json
        message = data.get('message', {})
        
        global ADMIN_CHAT_ID
        if ADMIN_CHAT_ID is None:
            ADMIN_CHAT_ID = message.get('chat', {}).get('id')
            print(f"✅ Admin Chat ID встановлено: {ADMIN_CHAT_ID}")
            
            # Відправити вітальне повідомлення
            welcome_msg = "🤖 *My Ai Signal Bot активовано!*\n\n"
            welcome_msg += "📋 *Доступні команди:*\n"
            welcome_msg += "/approve_ID - затвердити користувача\n"
            welcome_msg += "/reject_ID - відхилити користувача\n"
            welcome_msg += "/list - показати списки\n"
            welcome_msg += "/help - допомога"
            
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            payload = {
                'chat_id': ADMIN_CHAT_ID,
                'text': welcome_msg,
                'parse_mode': 'Markdown'
            }
            requests.post(url, json=payload)
            return jsonify({'success': True})
        
        # Обробка команд
        text = message.get('text', '')
        chat_id = message.get('chat', {}).get('id')
        
        if text.startswith('/approve_'):
            user_id = text.split('_', 1)[1]
            if user_id not in approved_ids:
                approved_ids.append(user_id)
            if user_id in pending_requests:
                pending_requests.remove(user_id)
            
            reply = f"✅ Користувача `{user_id}` успішно затверджено!"
            
        elif text.startswith('/reject_'):
            user_id = text.split('_', 1)[1]
            if user_id in pending_requests:
                pending_requests.remove(user_id)
            
            reply = f"❌ Користувача `{user_id}` відхилено!"
            
        elif text == '/list':
            pending_str = '\n'.join(pending_requests) if pending_requests else 'Немає'
            approved_str = '\n'.join(approved_ids) if approved_ids else 'Немає'
            reply = f"📋 *Статус верифікації:*\n\n"
            reply += f"⏳ *Очікуючі:*\n{pending_str}\n\n"
            reply += f"✅ *Затверджені:*\n{approved_str}"
            
        elif text == '/help':
            reply = "🤖 *Допомога My Ai Signal Bot:*\n\n"
            reply += "📋 *Команди:*\n"
            reply += "/approve_ID - затвердити ID користувача\n"
            reply += "/reject_ID - відхилити ID користувача\n"
            reply += "/list - показати всі списки\n"
            reply += "/help - ця довідка"
            
        else:
            reply = "Невідома команда. Використайте /help"
        
        # Відправити відповідь
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = {
            'chat_id': chat_id,
            'text': reply,
            'parse_mode': 'Markdown'
        }
        requests.post(url, json=payload)
        
        return jsonify({'success': True})
        
    except Exception as e:
        print(f"Помилка webhook: {e}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/check_status/<user_id>', methods=['GET'])
def check_status(user_id):
    """Перевірити статус користувача"""
    if user_id in approved_ids:
        return jsonify({'approved': True, 'status': 'approved'})
    elif user_id in pending_requests:
        return jsonify({'approved': False, 'status': 'pending'})
    else:
        return jsonify({'approved': False, 'status': 'not_found'})

if __name__ == '__main__':
    print("🚀 Запускаємо Telegram Bot для My Ai Signal...")
    print(f"🤖 Bot Token: {BOT_TOKEN}")
    print("📡 Сервер готовий до роботи!")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
