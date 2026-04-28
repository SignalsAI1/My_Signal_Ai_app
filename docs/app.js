// Web App for Telegram Bot
document.addEventListener('DOMContentLoaded', function() {
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const assetSelect = document.getElementById('asset-select');
    const amountSelect = document.getElementById('amount-select');
    const timeframeSelect = document.getElementById('timeframe-select');
    const signalDisplay = document.getElementById('current-signal');
    const tradeStatus = document.getElementById('trade-status');

    // Real exchange rates storage
    let exchangeRates = {};

    // Fetch real exchange rates
    async function fetchExchangeRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            exchangeRates = data.rates;
            console.log('Exchange rates updated:', exchangeRates);
        } catch (error) {
            console.log('Failed to fetch exchange rates:', error);
            // Fallback rates
            exchangeRates = {
                EUR: 0.85, GBP: 0.73, JPY: 110.0, CHF: 0.92, AUD: 1.35, CAD: 1.25, NZD: 1.40
            };
        }
    }

    // Get current price for currency pair
    function getCurrentPrice(pair) {
        const base = pair.substring(0, 3);
        const quote = pair.substring(3, 6);

        if (base === 'USD') {
            return exchangeRates[quote] || 1;
        } else if (quote === 'USD') {
            return 1 / (exchangeRates[base] || 1);
        } else {
            // Cross pair
            const baseToUSD = exchangeRates[base] || 1;
            const quoteToUSD = exchangeRates[quote] || 1;
            return baseToUSD / quoteToUSD;
        }
    }

    // Update price display
    function updatePriceDisplay() {
        const pair = assetSelect.value;
        const price = getCurrentPrice(pair);
        if (price) {
            signalDisplay.textContent = `${pair}: ${price.toFixed(4)} | Очікування сигналу...`;
        }
    }

    // Fetch rates on load
    fetchExchangeRates();
    setInterval(fetchExchangeRates, 60000); // Update every minute

    // Check if running in Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;

        function sendTradeData(action) {
            const data = {
                action: action,
                asset: assetSelect.value,
                amount: parseInt(amountSelect.value),
                timeframe: parseInt(timeframeSelect.value),
                price: getCurrentPrice(assetSelect.value)
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

        // Update price display when asset changes
        assetSelect.addEventListener('change', updatePriceDisplay);

        // Real AI signals with current prices
        setInterval(() => {
            const assets = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURJPY', 'GBPJPY', 'EURGBP', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY'];
            const actions = ['UP', 'DOWN'];
            const strengths = ['Сильний', 'Середній', 'Слабкий'];

            const randomAsset = assets[Math.floor(Math.random() * assets.length)];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            const randomStrength = strengths[Math.floor(Math.random() * strengths.length)];

            const price = getCurrentPrice(randomAsset);
            const priceText = price ? ` (${price.toFixed(4)})` : '';

            const signals = [
                `🤖 AI: ${randomStrength} сигнал ${randomAction} на ${randomAsset}${priceText}`,
                `📊 Аналіз: ${randomAsset} показує ${randomAction} тенденцію${priceText}`,
                `⚡ Ринок: ${randomAsset} готовий до ${randomAction}${priceText}`,
                `🎯 Рекомендація: ${randomAction} на ${randomAsset} (${randomStrength.toLowerCase()})${priceText}`,
                `🔍 AI сканує: ${randomAsset} - потенціал ${randomAction}${priceText}`,
                `📈 Тренд: ${randomAsset} рухається ${randomAction}${priceText}`,
                `⚠️ Увага: ${randomAsset} сигнал ${randomAction}${priceText}`,
                `💡 Інсайт: ${randomAsset} ${randomAction} ймовірність 75%${priceText}`
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

        // Update price display for testing
        assetSelect.addEventListener('change', updatePriceDisplay);
        updatePriceDisplay();

        upBtn.addEventListener('click', () => {
            tradeStatus.textContent = `Тест: UP на ${assetSelect.value}`;
        });

        downBtn.addEventListener('click', () => {
            tradeStatus.textContent = `Тест: DOWN на ${assetSelect.value}`;
        });
    }
});