// Простий Telegram Bot для сповіщень про верифікацію
// Цей код можна запустити на Glitch, Replit, або Vercel Serverless Functions

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const BOT_TOKEN = '8213960139:AAF8BEVaX1zXorAwCkSnj47XHrC41GvLAvY';
const ADMIN_CHAT_ID = 'YOUR_ADMIN_CHAT_ID'; // Замініть на ваш chat ID

// Endpoint для отримання повідомлень від сайту
app.post('/notify', async (req, res) => {
    try {
        const { userId, timestamp, action } = req.body;
        
        let message = '';
        
        if (action === 'verification_request') {
            message = `🔔 *Новий запит на верифікацію*\n\n`;
            message += `👤 ID: \`${userId}\`\n`;
            message += `⏰ Час: ${new Date(timestamp).toLocaleString('uk-UA')}\n\n`;
            message += `📋 *Дії:*\n`;
            message += `✅ Затвердити: /approve_${userId}\n`;
            message += `❌ Відхилити: /reject_${userId}\n`;
            message += `📊 Список: /list`;
        }
        
        // Відправити повідомлення адміну
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: ADMIN_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Помилка:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint для отримання списку затверджених ID
app.get('/approved', (req, res) => {
    // Для початку повернемо базовий список
    // В реальному додатку тут буде база даних
    const approvedIds = ['ADMIN123', 'TEST456', 'DEMO789'];
    res.json({ success: true, approvedIds });
});

// Endpoint для додавання затвердженого ID
app.post('/approve', (req, res) => {
    const { userId } = req.body;
    console.log(`Затверджено ID: ${userId}`);
    res.json({ success: true });
});

// Health check
app.get('/', (req, res) => {
    res.send('🤖 Telegram Bot Verification API працює!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на порті ${PORT}`);
    console.log(`🤖 Bot Token: ${BOT_TOKEN}`);
    console.log(`📝 Endpoint: /notify`);
});

// Для Vercel Serverless Functions
module.exports = app;
