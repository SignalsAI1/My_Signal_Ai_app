// Telegram Mini App
// Optimized for Telegram WebApp SDK with mobile-first design

// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp;

class TelegramMiniApp {
  constructor() {
    this.isTelegram = !!tg;
    this.user = null;
    this.initData = null;
    this.isReady = false;
    
    this.init();
  }

  init() {
    if (this.isTelegram) {
      this.setupTelegramApp();
    } else {
      this.setupWebApp();
    }
  }

  setupTelegramApp() {
    console.log('Initializing Telegram Mini App...');
    
    // Expand the WebApp
    tg.expand();
    tg.ready();
    
    // Get user data
    this.user = tg.initDataUnsafe?.user;
    this.initData = tg.initData;
    
    // Set theme colors
    this.setThemeColors();
    
    // Setup back button
    tg.BackButton.isVisible = false;
    tg.BackButton.onClick(() => {
      window.history.back();
    });
    
    // Setup main button
    tg.MainButton.isVisible = false;
    tg.MainButton.text = 'Get Signal';
    tg.MainButton.color = '#00ff88';
    tg.MainButton.textColor = '#000000';
    
    // Enable haptic feedback
    this.enableHapticFeedback();
    
    console.log('Telegram Mini App initialized');
    console.log('User:', this.user);
    
    this.isReady = true;
    this.onReady();
  }

  setupWebApp() {
    console.log('Initializing Web App (non-Telegram)...');
    
    // Simulate user data for web version
    this.user = {
      id: 'web_user_' + Math.random().toString(36).substr(2, 9),
      first_name: 'Web',
      last_name: 'User',
      username: 'webuser'
    };
    
    this.isReady = true;
    this.onReady();
  }

  setThemeColors() {
    if (!tg) return;
    
    const colorScheme = tg.colorScheme;
    const themeParams = tg.themeParams;
    
    // Apply Telegram theme to app
    document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '#1a1a2e');
    document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color || '#999999');
    document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color || '#00ff88');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color || '#000000');
    
    // Set status bar color
    tg.setHeaderColor(themeParams.bg_color || '#1a1a2e');
  }

  enableHapticFeedback() {
    if (!tg) return;
    
    // Add haptic feedback to buttons
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        tg.HapticFeedback.impactOccurred('light');
      }
    });
  }

  onReady() {
    // This method will be called when the app is ready
    // Override in your app implementation
    console.log('App is ready!');
  }

  // Utility methods
  showMainButton(text, callback) {
    if (tg) {
      tg.MainButton.text = text;
      tg.MainButton.onClick(callback);
      tg.MainButton.isVisible = true;
    }
  }

  hideMainButton() {
    if (tg) {
      tg.MainButton.isVisible = false;
    }
  }

  showAlert(message, callback) {
    if (tg) {
      tg.showAlert(message, callback);
    } else {
      alert(message);
      if (callback) callback();
    }
  }

  showConfirm(message, callback) {
    if (tg) {
      tg.showConfirm(message, callback);
    } else {
      const result = confirm(message);
      if (callback) callback(result);
    }
  }

  openLink(url) {
    if (tg) {
      tg.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  openTelegramLink(url) {
    if (tg) {
      tg.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  closeApp() {
    if (tg) {
      tg.close();
    } else {
      window.close();
    }
  }

  // Get user info
  getUser() {
    return this.user;
  }

  // Get init data
  getInitData() {
    return this.initData;
  }

  // Check if running in Telegram
  isTelegramApp() {
    return this.isTelegram;
  }

  // Get device info
  getDeviceInfo() {
    if (tg) {
      return {
        platform: tg.platform,
        version: tg.version,
        colorScheme: tg.colorScheme,
        themeParams: tg.themeParams,
        isExpanded: tg.isExpanded,
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight
      };
    }
    
    return {
      platform: 'web',
      version: '1.0.0',
      colorScheme: 'dark',
      themeParams: {},
      isExpanded: true,
      viewportHeight: window.innerHeight,
      viewportStableHeight: window.innerHeight
    };
  }
}

// Export for use in other modules
window.TelegramMiniApp = TelegramMiniApp;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.telegramApp = new TelegramMiniApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TelegramMiniApp;
}
