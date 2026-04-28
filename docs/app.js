// Web App for Telegram Bot
document.addEventListener('DOMContentLoaded', function() {
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const assetSelect = document.getElementById('asset-select');
    const amountSelect = document.getElementById('amount-select');
    const timeframeSelect = document.getElementById('timeframe-select');
    const signalDisplay = document.getElementById('current-signal');
    const tradeStatus = document.getElementById('trade-status');

    // Check if running in Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;

        function sendTradeData(action) {
            const data = {
                action: action,
                asset: assetSelect.value,
                amount: parseInt(amountSelect.value),
                timeframe: parseInt(timeframeSelect.value)
            };
            webApp.sendData(JSON.stringify(data));
            tradeStatus.textContent = `📤 Надіслано: ${action.toUpperCase()} ${assetSelect.value}`;
            signalDisplay.textContent = `🚀 Виконується ${action.toUpperCase()}`;
        }

        upBtn.addEventListener('click', function() {
            sendTradeData('up');
        });

        downBtn.addEventListener('click', function() {
            sendTradeData('down');
        });

        // Реалістичні AI сигнали
        setInterval(() => {
            const assets = ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD'];
            const actions = ['UP', 'DOWN'];
            const strengths = ['Сильний', 'Середній', 'Слабкий'];

            const randomAsset = assets[Math.floor(Math.random() * assets.length)];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            const randomStrength = strengths[Math.floor(Math.random() * strengths.length)];

            const signals = [
                `🤖 AI: ${randomStrength} сигнал ${randomAction} на ${randomAsset}`,
                `📊 Аналіз: ${randomAsset} показує ${randomAction} тенденцію`,
                `⚡ Ринок: ${randomAsset} готовий до ${randomAction}`,
                `🎯 Рекомендація: ${randomAction} на ${randomAsset} (${randomStrength.toLowerCase()})`,
                `🔍 AI сканує: ${randomAsset} - потенціал ${randomAction}`,
                `📈 Тренд: ${randomAsset} рухається ${randomAction}`,
                `⚠️ Увага: ${randomAsset} сигнал ${randomAction}`,
                `💡 Інсайт: ${randomAsset} ${randomAction} ймовірність 75%`
            ];

            signalDisplay.textContent = signals[Math.floor(Math.random() * signals.length)];
        }, 4000);

        // Clear status after 3 seconds
        setInterval(() => {
            tradeStatus.textContent = '';
        }, 3000);

    } else {
        // Fallback for testing outside Telegram
        signalDisplay.textContent = '⚠️ Відкрито не в Telegram';
        tradeStatus.textContent = 'Тестовий режим';

        upBtn.addEventListener('click', () => {
            tradeStatus.textContent = `Тест: UP на ${assetSelect.value}`;
        });

        downBtn.addEventListener('click', () => {
            tradeStatus.textContent = `Тест: DOWN на ${assetSelect.value}`;
        });
    }
});