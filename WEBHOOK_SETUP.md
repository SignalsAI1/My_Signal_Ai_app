# 🚀 Налаштування Webhook Сервера для Telegram Бота

## 📋 Кроки для Запуску:

### 1. Створіть Webhook Сервер
**Варіант А: Replit (рекомендовано - безкоштовно)**
1. Перейдіть на [replit.com](https://replit.com)
2. Створіть новий Python проект
3. Скопіюйте код з `telegram_webhook.py`
4. Натисніть "Run" для запуску сервера
5. Скопіюйте URL вашого сервера (наприклад: `https://your-project-name.repl.co`)

**Варіант Б: Glitch (безкоштовно)**
1. Перейдіть на [glitch.com](https://glitch.com)
2. Створіть новий проект
3. Завантажте `telegram_webhook.py`
4. Запустіть проект
5. Скопіюйте URL проекту

### 2. Налаштуйте Telegram Bot Webhook
1. Замініть `YOUR_WEBHOOK_URL` на ваш реальний URL
2. Виконайте команду в браузері:
```
https://api.telegram.org/bot8213960139:AAF8BEVaX1zXorAwCkSnj47XHrC41GvLAvY/setWebhook?url=https://your-project-name.repl.co/webhook
```

### 3. Оновіть Фронтенд
В файлі `index.html` замініть:
```javascript
const webhookUrl = 'https://your-webhook-server-url.repl.co/send_notification';
```
на ваш реальний URL сервера.

### 4. Активуйте Бота
1. Знайдіть @AI_1Bot_ID_bot в Telegram
2. Надішліть йому будь-яке повідомлення
3. Бот відповість вітальним повідомленням
4. Тепер бот готовий до роботи!

## 🚀 Як Це Працює:

**Користувач на сайті:**
1. Вводить Pocket ID
2. Система відправляє запит на webhook сервер
3. Webhook сервер відправляє повідомлення в Telegram

**Ви в Telegram:**
1. Отримуєте повідомлення: "🔔 Новий запит на верифікацію"
2. Бачите ID користувача та команди
3. Відправляєте `/approve_USER123` для затвердження
4. Користувач автоматично отримує доступ

## 📱 Команди Бота:
```
/approve_USER123    - затвердити користувача
/reject_USER123     - відхилити користувача
/list               - показати списки
/help               - допомога
```

## 🔧 Перевірка Роботи:
1. Запустіть webhook сервер
2. Налаштуйте webhook
3. Відкрийте сайт і введіть тестовий ID
4. Перевірте Telegram - має прийти сповіщення
5. Відправте команду `/approve_TEST123`

## 🌐 URL для Налаштування:
- **Telegram Webhook:** `https://api.telegram.org/bot8213960139:AAF8BEVaX1zXorAwCkSnj47XHrC41GvLAvY/setWebhook?url=YOUR_URL`
- **Сервер:** `https://your-project-name.repl.co`
- **Фронтенд:** `https://signalsai1.github.io/My_Signal_Ai_app/`

## ⚡ Переваги:
- ✅ Повна автоматизація
- ✅ Сповіщення в реальному часі
- ✅ Підтвердження через Telegram
- ✅ Безкоштовний сервер на Replit
- ✅ Fallback до localStorage
