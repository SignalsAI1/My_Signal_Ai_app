# 🤖 Налаштування Telegram Бота для Верифікації

## 📋 Кроки для Налаштування:

### 1. Створіть Telegram Бота
1. Знайдіть @BotFather в Telegram
2. Надішліть команду `/newbot`
3. Дайте боту ім'я (наприклад: "My Ai Signal Verifier")
4. Отримайте токен бота (у вас вже є: `8213960139:AAF8BEVaX1zXorAwCkSnj47XHrC41GvLAvY`)

### 2. Отримайте Ваш Chat ID
1. Знайдіть @userinfobot в Telegram
2. Надішліть йому будь-яке повідомлення
3. Отримайте ваш Chat ID

### 3. Налаштуйте Webhook
**Варіант А: Використання Glitch (безкоштовно)**
1. Перейдіть на [glitch.com](https://glitch.com)
2. Імпортуйте проект `simple_bot.js`
3. Замініть `YOUR_ADMIN_CHAT_ID` на ваш Chat ID
4. Запустіть проект та скопіюйте URL
5. Налаштуйте webhook: `https://api.telegram.org/bot{TOKEN}/setWebhook?url={YOUR_GLITCH_URL}/webhook`

**Варіант Б: Використання Vercel Serverless**
1. Створіть акаунт на [vercel.com](https://vercel.com)
2. Створіть новий проект
3. Завантажте `simple_bot.js`
4. Отримайте URL проекту
5. Налаштуйте webhook

**Варіант С: Використання webhook.site (для тестування)**
1. Перейдіть на [webhook.site](https://webhook.site)
2. Скопіюйте унікальний URL
3. Замініть URL в `index.html` на ваш

### 4. Оновіть Код
В файлі `index.html` замініть:
```javascript
const webhookUrl = 'https://webhook.site/your-unique-id';
```
на ваш реальний webhook URL.

### 5. Тестування
1. Відкрийте сайт
2. Введіть тестовий ID
3. Перевірте, чи прийшло сповіщення в Telegram
4. Використовуйте адмін панель для затвердження

## 📱 Команди Бота:
- `/approve_ID` - затвердити користувача
- `/reject_ID` - відхилити користувача
- `/list` - показати списки
- `/help` - допомога

## 🔧 Альтернативний Підхід:
Якщо webhook не працює, система буде продовжувати працювати через localStorage і адмін панель.

## 🌐 Поточна Система:
- ✅ Користувач вводить ID
- ✅ ID додається до localStorage
- ✅ Адмін панель для затвердження
- ⏳ Telegram сповіщення (потребує налаштування)
