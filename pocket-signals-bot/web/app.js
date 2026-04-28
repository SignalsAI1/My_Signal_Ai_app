// Web App for Telegram Bot
document.addEventListener('DOMContentLoaded', function() {
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const assetSelect = document.getElementById('asset-select');
    const signalDisplay = document.getElementById('current-signal');

    // Check if running in Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;

        upBtn.addEventListener('click', function() {
            const data = {
                action: 'up',
                asset: assetSelect.value
            };
            webApp.sendData(JSON.stringify(data));
            signalDisplay.textContent = `📈 Сигнал UP на ${assetSelect.value}`;
        });

        downBtn.addEventListener('click', function() {
            const data = {
                action: 'down',
                asset: assetSelect.value
            };
            webApp.sendData(JSON.stringify(data));
            signalDisplay.textContent = `📉 Сигнал DOWN на ${assetSelect.value}`;
        });

        // Simulate AI signals
        setInterval(() => {
            const signals = ['Очікування сигналу...', '📈 Можливий UP', '📉 Можливий DOWN', '🤔 Аналіз...'];
            signalDisplay.textContent = signals[Math.floor(Math.random() * signals.length)];
        }, 3000);

    } else {
        // Fallback for testing outside Telegram
        signalDisplay.textContent = '⚠️ Відкрито не в Telegram';
        upBtn.addEventListener('click', () => alert('UP clicked'));
        downBtn.addEventListener('click', () => alert('DOWN clicked'));
    }
});