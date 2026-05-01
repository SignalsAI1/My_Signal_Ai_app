# 🚀 Швидкий Запуск Telegram Bot - Крок за Кроком

## 📋 Що Потрібно Зробити:

### 1. Запустіть Локальний Сервер
```bash
# Встановіть залежності
pip install flask requests

# Запустіть сервер
python quick_setup.py
```

### 2. Налаштуйте Webhook (для локального тестування)
Сервер автоматично спробує налаштувати webhook для localhost.

### 3. Для Externall Доступу (рекомендовано)
```bash
# Встановіть ngrok
pip install pyngrok

# Запустіть ngrok в новому терміналі
ngrok http 5000
```

Скопіюйте URL з ngrok (наприклад: `https://abc123.ngrok.io`) і налаштуйте webhook:
```
https://api.telegram.org/bot8213960139:AAF8BEVaX1zXorAwCkSnj47XHrC41GvLAvY/setWebhook?url=https://abc123.ngrok.io/webhook
```

### 4. Активуйте Бота
1. Знайдіть @AI_1Bot_ID_bot в Telegram
2. Надішліть будь-яке повідомлення
3. Бот відповість вітальним повідомленням

### 5. Оновіть Фронтенд (якщо використовуєте ngrok)
Замініть в `index.html`:
```javascript
const webhookUrl = 'http://localhost:5000/send_notification';
```
на:
```javascript
const webhookUrl = 'https://abc123.ngrok.io/send_notification';
```

## 🧪 Тестування:

1. **Запустіть сервер:** `python quick_setup.py`
2. **Відкрийте сайт:** `https://signalsai1.github.io/My_Signal_Ai_app/`
3. **Введіть тестовий ID:** "TEST123"
4. **Перевірте Telegram:** має прийти сповіщення
5. **Відправте команду:** `/approve_TEST123`

## 📱 Команди Бота:
```
/approve_USER123    - затвердити користувача
/reject_USER123     - відхилити користувача
/list               - показати списки
/help               - допомога
```

## ⚡ Як Це Працює:
1. Користувач вводить ID на сайті
2. Сайт відправляє запит на ваш сервер
3. Сервер відправляє повідомлення в Telegram
4. Ви підтверджуєте через команду в Telegram
5. Користувач автоматично отримує доступ

## 🔧 Важливо:
- Сервер повинен працювати постійно для отримання запитів
- Використовуйте ngrok для externall доступу
- Bot Token: `8213960139:AAF8BEVaX1zXorAwCkSnj47XHrC41GvLAvY`
- Бот: @AI_1Bot_ID_bot

## 🌐 URL:
- **Сайт:** `https://signalsai1.github.io/My_Signal_Ai_app/`
- **Локальний сервер:** `http://localhost:5000`
- **Ngrok URL:** `https://abc123.ngrok.io` (ваш URL)

**Готово! Тепер у вас є повноцінна Telegram bot система!** 🎉
