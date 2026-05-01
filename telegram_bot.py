#!/usr/bin/env python3
import requests
import json
from flask import Flask, request, jsonify
from datetime import datetime
import threading
import time

app = Flask(__name__)

# Токен вашого бота
BOT_TOKEN = "8213960139:AAF8BEVaX1zXorAwCkSnj47XHrC41GvLAvY"
CHAT_ID = None  # Буде встановлено при першому повідомленні

# Локальне сховище для верифікації
approved_ids = ["ADMIN123", "TEST456", "DEMO789"]
pending_requests = []

@app.route('/verifyRequest', methods=['POST'])
def verify_request():
    """Обробка запиту на верифікацію з фронтенду"""
    data = request.json
    user_id = data.get('userId')
    timestamp = data.get('timestamp')
    
    if user_id:
        # Додати до списку очікуючих
        if user_id not in pending_requests:
            pending_requests.append(user_id)
        
        # Відправити повідомлення адміну в Telegram
        message = f"🔔 Новий запит на верифікацію:\n\n👤 ID: {user_id}\n⏰ Час: {timestamp}\n\nКоманди:\n/approve {user_id} - затвердити\n/reject {user_id} - відхилити"
        
        try:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            payload = {
                'chat_id': CHAT_ID,
                'text': message,
                'parse_mode': 'HTML'
            }
            requests.post(url, json=payload)
        except Exception as e:
            print(f"Помилка відправки в Telegram: {e}")
        
        return jsonify({'success': True})
    
    return jsonify({'success': False})

@app.route('/getApprovedIds', methods=['GET'])
def get_approved_ids():
    """Повертає список затверджених ID"""
    return jsonify({
        'success': True,
        'approvedIds': approved_ids
    })

@app.route('/webhook', methods=['POST'])
def webhook():
    """Обробка повідомлень від Telegram"""
    data = request.json
    message = data.get('message', {})
    text = message.get('text', '')
    chat_id = message.get('chat', {}).get('id')
    
    global CHAT_ID
    if CHAT_ID is None:
        CHAT_ID = chat_id
        print(f"Chat ID встановлено: {CHAT_ID}")
    
    # Обробка команд
    if text.startswith('/approve '):
        user_id = text.split(' ', 1)[1]
        if user_id not in approved_ids:
            approved_ids.append(user_id)
            if user_id in pending_requests:
                pending_requests.remove(user_id)
        
        reply = f"✅ ID {user_id} успішно затверджено!"
        
    elif text.startswith('/reject '):
        user_id = text.split(' ', 1)[1]
        if user_id in pending_requests:
            pending_requests.remove(user_id)
        
        reply = f"❌ ID {user_id} відхилено!"
        
    elif text == '/list':
        pending_str = '\n'.join(pending_requests) if pending_requests else 'Немає очікуючих'
        approved_str = '\n'.join(approved_ids) if approved_ids else 'Немає затверджених'
        reply = f"📋 Статус верифікації:\n\n⏳ Очікуючі:\n{pending_str}\n\n✅ Затверджені:\n{approved_str}"
        
    elif text == '/help':
        reply = "🤖 Доступні команди:\n\n/approve ID - затвердити ID\n/reject ID - відхилити ID\n/list - показати списки\n/help - допомога"
        
    else:
        reply = "Невідома команда. Використайте /help"
    
    # Відправити відповідь
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = {
            'chat_id': chat_id,
            'text': reply,
            'parse_mode': 'HTML'
        }
        requests.post(url, json=payload)
    except Exception as e:
        print(f"Помилка відправки відповіді: {e}")
    
    return jsonify({'success': True})

if __name__ == '__main__':
    # Налаштування webhook
    webhook_url = "https://api.telegram.org/bot{}/setWebhook".format(BOT_TOKEN)
    webhook_data = {
        'url': 'https://your-domain.com/webhook'  # Замініть на ваш домен
    }
    
    print("🤖 Telegram бот для верифікації запущено!")
    print("📋 Команди для адміна:")
    print("   /approve ID - затвердити ID")
    print("   /reject ID - відхилити ID") 
    print("   /list - показати списки")
    print("   /help - допомога")
    print(f"🔗 Токен бота: {BOT_TOKEN}")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
