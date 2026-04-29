// Web App for Telegram Bot - Mobile Optimized
document.addEventListener('DOMContentLoaded', function() {
    // Telegram WebApp initialization
    if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        
        // Debug logging
        console.log('Telegram WebApp detected:', webApp);
        
        // Initialize WebApp
        webApp.ready();
        webApp.expand();
        webApp.enableClosingConfirmation();
        
        // Set theme colors to match our design
        webApp.setHeaderColor('#1a1a2e');
        webApp.setBackgroundColor('#0a0a0a');
        
        // Enable Haptic Feedback
        if (webApp.HapticFeedback) {
            window.TelegramHaptic = webApp.HapticFeedback;
            console.log('Haptic feedback enabled');
        }
        
        // Get user info
        if (webApp.initDataUnsafe) {
            const initData = webApp.initDataUnsafe;
            console.log('Init data:', initData);
        }
        
                
        console.log('Telegram WebApp initialized successfully');
    } else {
        console.log('Telegram WebApp not detected, running in standalone mode');
    }
    // DOM Elements
    const registrationSection = document.querySelector('.registration-section');
    const idVerification = document.getElementById('id-verification');
    const signalDisplay = document.getElementById('signal-display');
    const userIdInput = document.getElementById('user-id-input');
    const verifyBtn = document.getElementById('verify-btn');
    const verificationStatus = document.getElementById('verification-status');
    const currentSignal = document.getElementById('current-signal');
    const aiNavBtn = document.getElementById('ai-nav-btn');
    const signalControls = document.getElementById('signal-controls');
    const tradeButtons = document.getElementById('trade-buttons');
    const countdownTimer = document.getElementById('countdown-timer');
    const aiProgress = document.getElementById('ai-progress');
    const getSignalBtn = document.getElementById('get-signal-btn');
    const autoTradeBtn = document.getElementById('auto-trade-btn');
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const profileBtn = document.getElementById('profile-btn');
    const historyBtn = document.getElementById('history-btn');
    const profileModal = document.getElementById('profile-modal');
    const historyModal = document.getElementById('history-modal');
    const profileClose = document.getElementById('profile-close');
    const historyClose = document.getElementById('history-close');
    const statusMessage = document.getElementById('status-message');
    const promoCodeInput = document.getElementById('promo-code');
    const copyPromoBtn = document.getElementById('copy-promo');

    // Progress elements
    const progressPercentage = document.getElementById('progress-percentage');
    const progressStatus = document.getElementById('progress-status');
    const progressRing = document.querySelector('.progress-ring-circle');

    // Timer elements
    const timerMinutes = document.getElementById('timer-minutes');
    const timerSeconds = document.getElementById('timer-seconds');

    // Real exchange rates storage
    const requiredElements = [
        registrationSection, idVerification, signalDisplay, userIdInput, verifyBtn,
        verificationStatus, currentSignal, aiNavBtn, signalControls, tradeButtons,
        countdownTimer, aiProgress, getSignalBtn, autoTradeBtn, upBtn, downBtn,
        profileBtn, historyBtn, profileModal, historyModal, profileClose, historyClose,
        statusMessage, progressPercentage, progressStatus, progressRing, timerMinutes,
        timerSeconds, promoCodeInput, copyPromoBtn
    ];

    if (requiredElements.some(el => !el)) {
        console.error('Missing required page elements. App initialization aborted.');
        return;
    }

    if (promoCodeInput && !promoCodeInput.value) {
        promoCodeInput.value = 'SIGNAL2026';
    }

    // Real exchange rates storage
    let exchangeRates = {};
    let countdownInterval;
    let analysisTimeout;
    let isVerified = false;

    // Initialize app
    initializeApp();
    
    // Mobile touch optimizations
    setupTouchOptimizations();
    
    // Performance optimizations
    setupPerformanceOptimizations();

    
    function initializeApp() {
        // Check if user is already verified (from localStorage or Telegram WebApp)
        const savedVerification = localStorage.getItem('pocketOptionVerified');
        if (savedVerification === 'true') {
            isVerified = true;
            // Show trading interface directly without MainButton
            registrationSection.style.display = 'none';
            idVerification.style.display = 'none';
            signalDisplay.style.display = 'block';
        } else {
            showRegistrationInterface();
        }

        // Initialize modal states
        profileModal.style.display = 'none';
        historyModal.style.display = 'none';
        profileBtn.classList.remove('active');
        historyBtn.classList.remove('active');
    }

    function showRegistrationInterface() {
        registrationSection.style.display = 'block';
        idVerification.style.display = 'none';
        signalDisplay.style.display = 'none';
        signalControls.style.display = 'none';
        aiProgress.style.display = 'none';
        tradeButtons.style.display = 'none';
        countdownTimer.style.display = 'none';
    }

    function showIdVerification() {
        registrationSection.style.display = 'none';
        idVerification.style.display = 'block';
        signalDisplay.style.display = 'none';
        signalControls.style.display = 'none';
        aiProgress.style.display = 'none';
        tradeButtons.style.display = 'none';
        countdownTimer.style.display = 'none';
    }

    function showTradingInterface() {
        registrationSection.style.display = 'none';
        idVerification.style.display = 'none';
        signalDisplay.style.display = 'block';
        // Other elements will be shown as needed
    }

    // Register button click handler
    document.querySelector('.register-btn').addEventListener('click', function() {
        // After registration, show ID verification
        setTimeout(() => {
            showIdVerification();
        }, 1000);
    });

    // Verify ID button handler
    verifyBtn.addEventListener('click', async function() {
        const userId = userIdInput.value.trim();

        if (!userId) {
            showVerificationStatus('Будь ласка, введіть ID', 'error');
            return;
        }

        if (!/^\d+$/.test(userId)) {
            showVerificationStatus('ID має містити тільки цифри', 'error');
            return;
        }

        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Перевірка...';
        showVerificationStatus('Перевіряємо ID...', 'loading');

        try {
            // Simulate ID verification (in real app, this would call your backend)
            const isValid = await verifyUserId(userId);

            if (isValid) {
                isVerified = true;
                localStorage.setItem('pocketOptionVerified', 'true');
                localStorage.setItem('pocketOptionUserId', userId);
                showVerificationStatus('✅ ID підтверджено! Доступ відкрито.', 'success');
                setTimeout(() => {
                    showTradingInterface();
                }, 2000);
            } else {
                showVerificationStatus('❌ ID не знайдено. Перевірте правильність.', 'error');
            }
        } catch (error) {
            showVerificationStatus('❌ Помилка перевірки. Спробуйте ще раз.', 'error');
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Перевірити ID';
        }
    });

    function showVerificationStatus(message, type) {
        verificationStatus.textContent = message;
        verificationStatus.className = 'verification-status';

        if (type === 'error') {
            verificationStatus.style.color = '#ff4444';
        } else if (type === 'success') {
            verificationStatus.style.color = '#00ff88';
        } else if (type === 'loading') {
            verificationStatus.style.color = '#00d4ff';
        }
    }

    // Mock ID verification function (replace with real API call)
    async function verifyUserId(userId) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For demo purposes, accept any ID that starts with '119'
        // In real app, this would verify against your partner stats
        return userId.startsWith('119') || userId.length >= 6;
    }

    // Fetch real exchange rates
    async function fetchExchangeRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            exchangeRates = data.rates;
            console.log('Exchange rates updated:', Object.keys(exchangeRates).length, 'currencies');

            // Add missing currencies with fallback rates
            const fallbackRates = {
                BTC: 45000, ETH: 2800, LTC: 80, XRP: 0.50, ADA: 0.35, DOT: 7.50,
                EUR: 0.85, GBP: 0.73, JPY: 110.0, CHF: 0.92, AUD: 1.35, CAD: 1.25,
                NZD: 1.40, SEK: 8.60, NOK: 8.40, DKK: 6.30, PLN: 3.80, CZK: 21.5,
                HUF: 290, TRY: 7.20, RUB: 75.0, CNY: 6.45, HKD: 7.80, SGD: 1.35,
                KRW: 1180, INR: 74.5, BRL: 5.20, MXN: 20.0, ZAR: 14.8, THB: 27.5,
                MYR: 4.15, IDR: 14300, PHP: 48.0, VND: 23100, EGP: 15.7, SAR: 3.75
            };

            // Merge fallback rates for missing currencies
            for (const [currency, rate] of Object.entries(fallbackRates)) {
                if (!exchangeRates[currency]) {
                    exchangeRates[currency] = rate;
                }
            }

        } catch (error) {
            console.log('Failed to fetch exchange rates:', error);
            // Comprehensive fallback rates
            exchangeRates = {
                EUR: 0.85, GBP: 0.73, JPY: 110.0, CHF: 0.92, AUD: 1.35, CAD: 1.25,
                NZD: 1.40, SEK: 8.60, NOK: 8.40, DKK: 6.30, PLN: 3.80, CZK: 21.5,
                HUF: 290, TRY: 7.20, RUB: 75.0, CNY: 6.45, HKD: 7.80, SGD: 1.35,
                KRW: 1180, INR: 74.5, BRL: 5.20, MXN: 20.0, ZAR: 14.8, THB: 27.5,
                BTC: 45000, ETH: 2800, LTC: 80, XRP: 0.50, ADA: 0.35, DOT: 7.50,
                BNB: 300, SOL: 100, MATIC: 0.80, AVAX: 35, LINK: 15, UNI: 6.50
            };
        }
    }

    // Get current price for currency pair
    function getCurrentPrice(pair) {
        const base = pair.substring(0, 3);
        const quote = pair.substring(3, 6);

        try {
            // Direct USD pairs
            if (base === 'USD') {
                return exchangeRates[quote] || getFallbackRate(quote);
            } else if (quote === 'USD') {
                const rate = exchangeRates[base] || getFallbackRate(base);
                return rate ? 1 / rate : null;
            } else {
                // Cross pair calculation
                const baseRate = exchangeRates[base] || getFallbackRate(base);
                const quoteRate = exchangeRates[quote] || getFallbackRate(quote);

                if (baseRate && quoteRate) {
                    return baseRate / quoteRate;
                } else {
                    // Try alternative calculation routes
                    return getAlternativeCrossRate(base, quote);
                }
            }
        } catch (error) {
            console.log('Error calculating price for', pair, error);
            return getFallbackRate(pair) || 1.0;
        }
    }

    // Get fallback rate for single currency
    function getFallbackRate(currency) {
        const fallbackRates = {
            EUR: 0.85, GBP: 0.73, JPY: 110.0, CHF: 0.92, AUD: 1.35, CAD: 1.25,
            NZD: 1.40, SEK: 8.60, NOK: 8.40, DKK: 6.30, PLN: 3.80, CZK: 21.5,
            HUF: 290, TRY: 7.20, RUB: 75.0, CNY: 6.45, HKD: 7.80, SGD: 1.35,
            KRW: 1180, INR: 74.5, BRL: 5.20, MXN: 20.0, ZAR: 14.8, THB: 27.5,
            BTC: 45000, ETH: 2800, LTC: 80, XRP: 0.50, ADA: 0.35, DOT: 7.50,
            BNB: 300, SOL: 100, MATIC: 0.80, AVAX: 35, LINK: 15, UNI: 6.50,
            // Crypto cross pairs
            EURUSD: 0.85, GBPUSD: 0.73, USDJPY: 110.0, USDCHF: 0.92, AUDUSD: 1.35,
            USDCAD: 1.25, NZDUSD: 1.40, EURJPY: 93.5, GBPJPY: 80.3, EURGBP: 1.164,
            AUDJPY: 148.5, CADJPY: 137.5, CHFJPY: 119.9, NZDJPY: 154.0
        };
        return fallbackRates[currency] || fallbackRates[currency.toUpperCase()] || null;
    }

    // Alternative cross rate calculation
    function getAlternativeCrossRate(base, quote) {
        // Try EUR as intermediate currency
        const baseToEUR = getFallbackRate(base + 'EUR') || (getFallbackRate('EUR' + base) ? 1 / getFallbackRate('EUR' + base) : null);
        const EURToQuote = getFallbackRate('EUR' + quote) || (getFallbackRate(quote + 'EUR') ? 1 / getFallbackRate(quote + 'EUR') : null);

        if (baseToEUR && EURToQuote) {
            return baseToEUR * EURToQuote;
        }

        // Try USD as intermediate currency
        const baseToUSD = getFallbackRate(base + 'USD') || (getFallbackRate('USD' + base) ? 1 / getFallbackRate('USD' + base) : null);
        const USDToQuote = getFallbackRate('USD' + quote) || (getFallbackRate(quote + 'USD') ? 1 / getFallbackRate(quote + 'USD') : null);

        if (baseToUSD && USDToQuote) {
            return baseToUSD * USDToQuote;
        }

        // Last resort: simple ratio based on USD rates
        const baseUSD = getFallbackRate(base) || 1;
        const quoteUSD = getFallbackRate(quote) || 1;
        return baseUSD / quoteUSD;
    }

    // Show status message
    function showStatusMessage(message, duration = 3000) {
        statusMessage.textContent = message;
        statusMessage.style.display = 'block';
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, duration);
    }

    // AI Navigation Button Click Handler
    aiNavBtn.addEventListener('click', function() {
        if (!isVerified) {
            showIdVerification();
            return;
        }

        signalControls.style.display = 'grid';
        aiProgress.style.display = 'none';
        tradeButtons.style.display = 'none';
        countdownTimer.style.display = 'none';
        currentSignal.textContent = 'Оберіть параметри сигналу...';
    });

    // Get Signal Button Handler
    getSignalBtn.addEventListener('click', function() {
        startAnalysisProcess();
    });

    // Auto Trade Button Handler
    autoTradeBtn.addEventListener('click', function() {
        startAnalysisProcess(true);
    });

    // Start Analysis Process
    function startAnalysisProcess(isAutoTrade = false) {
        signalControls.style.display = 'none';
        aiProgress.style.display = 'flex';
        tradeButtons.style.display = 'none';
        countdownTimer.style.display = 'none';

        const asset = document.getElementById('asset-select').value;
        const timeframe = parseInt(document.getElementById('timeframe-select').value);
        const amount = parseInt(document.getElementById('amount-select').value);

        const analysisSteps = [
            { text: 'Аналіз ринку...', percentage: 20 },
            { text: 'Перевірка тренду...', percentage: 40 },
            { text: 'Аналіз точки входу...', percentage: 60 },
            { text: 'Розрахунок ймовірності...', percentage: 80 },
            { text: 'Генерація сигналу...', percentage: 100 }
        ];

        let currentStep = 0;

        function nextStep() {
            if (currentStep < analysisSteps.length) {
                const step = analysisSteps[currentStep];
                progressStatus.textContent = step.text;
                progressPercentage.textContent = step.percentage + '%';

                // Update progress ring
                const circumference = 283; // 2 * π * 45
                const offset = circumference - (step.percentage / 100) * circumference;
                progressRing.style.strokeDashoffset = offset;

                currentStep++;

                if (currentStep < analysisSteps.length) {
                    setTimeout(nextStep, 1500);
                } else {
                    // Analysis complete, show signal
                    setTimeout(() => {
                        showSignal(asset, timeframe, amount, isAutoTrade);
                    }, 1000);
                }
            }
        }

        nextStep();
    }

    // Show Signal
    function showSignal(asset, timeframe, amount, isAutoTrade) {
        aiProgress.style.display = 'none';

        // Generate random signal
        const directions = ['UP', 'DOWN'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const price = getCurrentPrice(asset);

        currentSignal.textContent = `🤖 AI СИГНАЛ: ${asset} ${direction} | Ціна: ${price ? price.toFixed(4) : 'N/A'}`;

        if (isAutoTrade) {
            // Auto execute trade
            executeTrade(direction.toLowerCase());
            showStatusMessage(`🚀 Автоторгівля: ${direction} ${asset} $${amount}`);
        } else {
            // Show manual trade buttons
            tradeButtons.style.display = 'flex';
            startCountdown(timeframe);
        }
    }

    // Start Countdown Timer
    function startCountdown(timeframe) {
        countdownTimer.style.display = 'flex';
        let remaining = timeframe;

        function updateTimer() {
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;

            timerMinutes.textContent = minutes.toString().padStart(2, '0');
            timerSeconds.textContent = seconds.toString().padStart(2, '0');

            // Update progress circle
            const circumference = 283;
            const progress = (remaining / timeframe) * circumference;
            document.querySelector('.timer-progress').style.strokeDashoffset = circumference - progress;

            remaining--;

            if (remaining < 0) {
                clearInterval(countdownInterval);
                countdownTimer.style.display = 'none';
                tradeButtons.style.display = 'none';
                currentSignal.textContent = '⏰ Час експірації минув!';
                showStatusMessage('⏰ Час експірації минув!');
            }
        }

        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    }

    // Trade Button Handlers
    upBtn.addEventListener('click', function() {
        executeTrade('up');
    });

    downBtn.addEventListener('click', function() {
        executeTrade('down');
    });

    // Execute Trade
    function executeTrade(action) {
        const asset = document.getElementById('asset-select').value;
        const amount = parseInt(document.getElementById('amount-select').value);
        const timeframe = parseInt(document.getElementById('timeframe-select').value);

        if (window.Telegram && window.Telegram.WebApp) {
            const data = {
                action: action,
                asset: asset,
                amount: amount,
                timeframe: timeframe,
                price: getCurrentPrice(asset)
            };
            window.Telegram.WebApp.sendData(JSON.stringify(data));
            showStatusMessage(`📤 Надіслано: ${action.toUpperCase()} ${asset}`);
            clearInterval(countdownInterval);
            countdownTimer.style.display = 'none';
            tradeButtons.style.display = 'none';
        } else {
            showStatusMessage(`Тест: ${action.toUpperCase()} на ${asset}`);
        }
    }

    // Profile Modal Handlers
    profileBtn.addEventListener('click', function() {
        console.log('Profile button clicked');
        if (profileModal.style.display === 'block') {
            profileModal.style.display = 'none';
            profileBtn.classList.remove('active');
        } else {
            profileModal.style.display = 'block';
            profileBtn.classList.add('active');
            loadProfileData();
            // Close other modals
            historyModal.style.display = 'none';
            historyBtn.classList.remove('active');
        }
    });

    profileClose.addEventListener('click', function() {
        profileModal.style.display = 'none';
        profileBtn.classList.remove('active');
    });

    // History Modal Handlers
    historyBtn.addEventListener('click', function() {
        console.log('History button clicked');
        if (historyModal.style.display === 'block') {
            historyModal.style.display = 'none';
            historyBtn.classList.remove('active');
        } else {
            historyModal.style.display = 'block';
            historyBtn.classList.add('active');
            loadHistoryData();
            // Close other modals
            profileModal.style.display = 'none';
            profileBtn.classList.remove('active');
        }
    });

    historyClose.addEventListener('click', function() {
        historyModal.style.display = 'none';
        historyBtn.classList.remove('active');
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === profileModal) {
            profileModal.style.display = 'none';
            profileBtn.classList.remove('active');
        }
        if (event.target === historyModal) {
            historyModal.style.display = 'none';
            historyBtn.classList.remove('active');
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            profileModal.style.display = 'none';
            historyModal.style.display = 'none';
            profileBtn.classList.remove('active');
            historyBtn.classList.remove('active');
        }
    });

    // Copy Promo Code Handler
    if (copyPromoBtn && promoCodeInput) {
        copyPromoBtn.addEventListener('click', async function() {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(promoCodeInput.value);
                } else {
                    promoCodeInput.select();
                    document.execCommand('copy');
                }

                const originalText = this.textContent;
                this.textContent = 'Скопійовано!';
                this.style.background = 'linear-gradient(135deg, #00ff88, #00d4ff)';

                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = 'linear-gradient(135deg, #00d4ff, #00ff88)';
                }, 2000);
            } catch (error) {
                console.error('Copy failed', error);
                showStatusMessage('Не вдалося скопіювати промокод', 3000);
            }
        });
    }


    // Language Change Handler
    document.getElementById('language-select').addEventListener('change', function() {
        const selectedLanguage = this.value;
        localStorage.setItem('selectedLanguage', selectedLanguage);

        // Update UI language immediately
        updateLanguage(selectedLanguage);

        // Show feedback
        const languageName = this.options[this.selectedIndex].text;
        showStatusMessage(`🌍 Мову змінено на: ${languageName}`, 'success');

        // Haptic feedback
        if (window.TelegramHaptic) {
            window.TelegramHaptic.notificationOccurred('success');
        }
    });

    // Update language function
    function updateLanguage(lang) {
        const translations = {
            uk: {
                title: '🤖 My AI Signal',
                online: 'Online',
                register: 'Зареєструватися',
                signals: 'Сигнали',
                profile: 'Профіль',
                history: 'Історія',
                getSignal: 'Отримати сигнал',
                autoTrade: 'Авто торгівля',
                up: 'UP',
                down: 'DOWN'
            },
            en: {
                title: '🤖 My AI Signal',
                online: 'Online',
                register: 'Register',
                signals: 'Signals',
                profile: 'Profile',
                history: 'History',
                getSignal: 'Get Signal',
                autoTrade: 'Auto Trade',
                up: 'UP',
                down: 'DOWN'
            },
            ru: {
                title: '🤖 My AI Signal',
                online: 'Онлайн',
                register: 'Зарегистрироваться',
                signals: 'Сигналы',
                profile: 'Профиль',
                history: 'История',
                getSignal: 'Получить сигнал',
                autoTrade: 'Авто-торговля',
                up: 'ВВЕРХ',
                down: 'ВНИЗ'
            }
        };

        const t = translations[lang] || translations.uk;

        // Update title
        const titleElement = document.querySelector('.title');
        if (titleElement) {
            titleElement.innerHTML = `<span class="robot-emoji">🤖</span> ${t.title.split(' ')[1]}`;
        }

        // Update online status
        const onlineElement = document.querySelector('.status-indicator span');
        if (onlineElement) {
            onlineElement.textContent = t.online;
        }

        // Update register button
        const registerBtn = document.querySelector('.register-btn .btn-text');
        if (registerBtn) {
            registerBtn.textContent = t.register;
        }

        // Update navigation
        const navTexts = document.querySelectorAll('.nav-text');
        if (navTexts.length >= 3) {
            navTexts[0].textContent = t.profile;
            navTexts[1].textContent = t.signals;
            navTexts[2].textContent = t.history;
        }

        // Update action buttons
        const getSignalBtn = document.getElementById('get-signal-btn');
        const autoTradeBtn = document.getElementById('auto-trade-btn');
        if (getSignalBtn) {
            const signalText = getSignalBtn.querySelector('.btn-text');
            if (signalText) signalText.textContent = t.getSignal;
        }
        if (autoTradeBtn) {
            const tradeText = autoTradeBtn.querySelector('.btn-text');
            if (tradeText) tradeText.textContent = t.autoTrade;
        }

        // Update trade buttons
        const upBtn = document.getElementById('up-btn');
        const downBtn = document.getElementById('down-btn');
        if (upBtn) {
            const upText = upBtn.querySelector('.trade-text');
            if (upText) upText.textContent = t.up;
        }
        if (downBtn) {
            const downText = downBtn.querySelector('.trade-text');
            if (downText) downText.textContent = t.down;
        }

        // Update modals
        const profileTitle = document.querySelector('#profile-modal h3');
        const historyTitle = document.querySelector('#history-modal h3');
        if (profileTitle) profileTitle.textContent = `👤 ${t.profile}`;
        if (historyTitle) historyTitle.textContent = `📊 ${t.history}`;
    }

    // Timezone Change Handler
    document.getElementById('timezone-select').addEventListener('change', function() {
        const selectedTimezone = this.value;
        localStorage.setItem('selectedTimezone', selectedTimezone);

        // Update timezone display immediately
        updateTimezoneDisplay(selectedTimezone);

        // Show feedback
        const timezoneName = this.options[this.selectedIndex].text;
        showStatusMessage(`🌍 Часовий пояс змінено на: ${timezoneName}`, 'success');

        // Haptic feedback
        if (window.TelegramHaptic) {
            window.TelegramHaptic.notificationOccurred('success');
        }
    });

    // Update timezone function
    function updateTimezoneDisplay(timezone) {
        // Update current time display based on timezone
        const now = new Date();
        
        // Parse timezone offset (handle decimal hours like UTC+5:30)
        let timezoneOffset = 0;
        if (timezone.includes(':')) {
            const [sign, time] = timezone.split('UTC')[1].split(':');
            const [hours, minutes] = time.split(':');
            timezoneOffset = parseFloat(hours) + (parseFloat(minutes || 0) / 60);
            if (sign === '-') timezoneOffset = -timezoneOffset;
        } else {
            const sign = timezone.includes('-') ? -1 : 1;
            timezoneOffset = sign * parseFloat(timezone.replace('UTC', '').replace('+', '').replace('-', ''));
        }
        
        // Calculate target time
        const localOffset = now.getTimezoneOffset() / 60; // Convert to hours
        const targetTime = new Date(now.getTime() + (timezoneOffset - localOffset) * 3600000);
        
        // Format time
        const timeString = targetTime.toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Update time display if element exists
        const timeDisplay = document.getElementById('current-time');
        if (timeDisplay) {
            timeDisplay.textContent = timeString;
        }
    }

    // Auto-update time every second
    setInterval(() => {
        const savedTimezone = localStorage.getItem('selectedTimezone') || 'UTC+2';
        updateTimezoneDisplay(savedTimezone);
    }, 1000);

    // Load Profile Data
    function loadProfileData() {
        // Get user data from localStorage or Telegram WebApp
        const userId = localStorage.getItem('pocketOptionUserId') || 'Не авторизовано';
        const promoCode = `AI${userId.slice(-4)}2024`; // Generate promo code based on user ID

        // Mock statistics - in real app, this would come from API
        const signalsPositive = Math.floor(Math.random() * 50) + 20;
        const signalsNegative = Math.floor(Math.random() * 15) + 5;
        const signalsMissed = Math.floor(Math.random() * 10) + 2;

        // Update profile elements
        document.getElementById('user-id').textContent = userId;
        document.getElementById('promo-code').value = promoCode;
        document.getElementById('signals-positive').textContent = signalsPositive;
        document.getElementById('signals-negative').textContent = signalsNegative;
        document.getElementById('signals-missed').textContent = signalsMissed;

        // Load saved preferences
        const savedLanguage = localStorage.getItem('selectedLanguage') || 'uk';
        const savedTimezone = localStorage.getItem('selectedTimezone') || 'UTC+2';

        document.getElementById('language-select').value = savedLanguage;
        document.getElementById('timezone-select').value = savedTimezone;
    }

    // Load History Data
    function loadHistoryData() {
        // Mock history data
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        const mockHistory = [
            { time: '2024-01-15 14:30', signal: 'EUR/USD UP 1.0850 → 1.0870', profit: '+2.0 USD', success: true },
            { time: '2024-01-15 14:25', signal: 'GBP/USD DOWN 1.2750 → 1.2730', profit: '+2.0 USD', success: true },
            { time: '2024-01-15 14:20', signal: 'USD/JPY UP 145.50 → 145.80', profit: '-1.0 USD', success: false },
            { time: '2024-01-15 14:15', signal: 'AUD/USD UP 0.6750 → 0.6770', profit: '+1.5 USD', success: true },
            { time: '2024-01-15 14:10', signal: 'USD/CAD DOWN 1.3450 → 1.3430', profit: '+1.8 USD', success: true }
        ];

        mockHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-time">${item.time}</div>
                <div class="history-signal">${item.signal} ${item.success ? '✅' : '❌'}</div>
                <div class="history-profit" style="color: ${item.success ? '#00ff88' : '#ff4444'}">${item.profit}</div>
            `;
            historyList.appendChild(historyItem);
        });
    }

    // Real AI signals with current prices
    setInterval(() => {
        const assets = [
            'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
            'EURJPY', 'GBPJPY', 'EURGBP', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY',
            'EURCHF', 'GBPCHF', 'AUDCHF', 'CADCHF', 'NZDCHF', 'EURAUD', 'GBPAUD',
            'AUDCAD', 'NZDCAD', 'EURNZD', 'GBPNZD', 'AUDNZD', 'USDNOK', 'USDSEK',
            'USDMXN', 'USDZAR', 'USDTRY', 'USDRUB', 'USDPLN', 'USDCZK', 'USDHUF'
        ];
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

        if (signalControls.style.display === 'none' && aiProgress.style.display === 'none' && tradeButtons.style.display === 'none') {
            currentSignal.textContent = signals[Math.floor(Math.random() * signals.length)];
        }
    }, 5000);

    // Initialize
    fetchExchangeRates();
    setInterval(fetchExchangeRates, 60000); // Update every minute

    // Language selector handler
    document.getElementById('language-select').addEventListener('change', function() {
        showStatusMessage(`Мова змінена на: ${this.options[this.selectedIndex].text}`);
    });

    // Timezone selector handler
    document.getElementById('timezone-select').addEventListener('change', function() {
        showStatusMessage(`Часовий пояс змінено на: ${this.value}`);
    });

    // Touch optimization functions
    function setupTouchOptimizations() {
        // Add haptic feedback for buttons
        const buttons = document.querySelectorAll('button, .btn, .nav-btn, .action-btn, .trade-btn');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
            });
        });

        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Better scroll behavior
        document.addEventListener('touchmove', function(e) {
            if (e.target.closest('.modal-content')) {
                e.stopPropagation();
            }
        }, { passive: true });

        // Handle orientation changes
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                window.scrollTo(0, 0);
                adjustLayoutForOrientation();
            }, 100);
        });
    }

    // Performance optimization functions
    function setupPerformanceOptimizations() {
        // Debounce resize events
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                adjustLayoutForViewport();
            }, 250);
        });

        // Optimize animations for low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
            document.body.classList.add('low-performance');
        }

        // Preload critical resources
        preloadCriticalResources();
    }

    function adjustLayoutForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const mainContent = document.querySelector('.main-content');
        
        if (isLandscape) {
            mainContent.style.maxHeight = '80vh';
            mainContent.style.overflowY = 'auto';
        } else {
            mainContent.style.maxHeight = '';
            mainContent.style.overflowY = '';
        }
    }

    function adjustLayoutForViewport() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Adjust font sizes for very small screens
        if (width <= 360) {
            document.body.classList.add('small-screen');
        } else {
            document.body.classList.remove('small-screen');
        }
        
        // Adjust for very tall screens
        if (height >= 812) {
            document.body.classList.add('tall-screen');
        } else {
            document.body.classList.remove('tall-screen');
        }
    }

    function preloadCriticalResources() {
        // Preload fonts if needed
        if ('fonts' in document) {
            document.fonts.load('16px Segoe UI');
        }
        
        // Preload critical images
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
            }
        });
    }

    // Initialize viewport adjustments
    adjustLayoutForViewport();
    adjustLayoutForOrientation();

    // Call setup functions
    setupTouchOptimizations();
    setupPerformanceOptimizations();
});