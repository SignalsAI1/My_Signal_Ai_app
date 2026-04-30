// Telegram Mini App Integration
class TelegramMiniApp {
  constructor() {
    this.webApp = window.Telegram?.WebApp;
    this.init();
  }

  init() {
    if (!this.webApp) {
      console.warn('Telegram WebApp SDK not found');
      return;
    }

    // Initialize WebApp
    this.webApp.ready();
    this.webApp.expand();

    // Set theme colors
    this.webApp.setHeaderColor('#000000');
    this.webApp.setBackgroundColor('#000000');

    // Enable closing confirmation
    this.webApp.enableClosingConfirmation();

    // Set main button
    this.setupMainButton();

    // Handle viewport changes
    this.webApp.onViewportChanged(() => {
      this.adjustLayout();
    });

    console.log('Telegram Mini App initialized');
  }

  setupMainButton() {
    this.webApp.MainButton.setText('Get Trading Signal');
    this.webApp.MainButton.color = '#00ffff';
    this.webApp.MainButton.textColor = '#000000';
    
    this.webApp.MainButton.onClick(() => {
      this.handleMainButtonClick();
    });
  }

  handleMainButtonClick() {
    // Show main button
    this.webApp.MainButton.show();
    
    // Send data to main app
    this.webApp.sendData(JSON.stringify({
      action: 'get_signal',
      timestamp: Date.now()
    }));
  }

  adjustLayout() {
    const height = this.webApp.viewportHeight;
    const stableHeight = this.webApp.viewportStableHeight;
    
    // Adjust app layout for mobile
    if (height < stableHeight) {
      document.body.classList.add('keyboard-open');
    } else {
      document.body.classList.remove('keyboard-open');
    }
  }

  // Show/hide main button
  showMainButton(text = 'Get Trading Signal') {
    this.webApp.MainButton.setText(text);
    this.webApp.MainButton.show();
  }

  hideMainButton() {
    this.webApp.MainButton.hide();
  }

  // Haptic feedback
  hapticImpact(style = 'light') {
    if (this.webApp.HapticFeedback) {
      this.webApp.HapticFeedback.impactOccurred(style);
    }
  }

  hapticNotification(type = 'success') {
    if (this.webApp.HapticFeedback) {
      this.webApp.HapticFeedback.notificationOccurred(type);
    }
  }

  // Show popup
  showPopup(title, message, buttons = []) {
    if (this.webApp.showPopup) {
      this.webApp.showPopup({
        title,
        message,
        buttons: buttons.length ? buttons : [
          { id: 'ok', type: 'default', text: 'OK' }
        ]
      }, (buttonId) => {
        console.log('Popup button clicked:', buttonId);
      });
    }
  }

  // Show alert
  showAlert(message) {
    if (this.webApp.showAlert) {
      this.webApp.showAlert(message);
    }
  }

  // Get user data
  getUser() {
    return this.webApp.initDataUnsafe?.user || null;
  }

  // Get init data
  getInitData() {
    return this.webApp.initData || '';
  }

  // Check if app is in Telegram
  isInTelegram() {
    return !!this.webApp;
  }

  // Close app
  close() {
    this.webApp.close();
  }

  // Share with friends
  shareText(text) {
    if (this.webApp.shareText) {
      this.webApp.shareText(text);
    }
  }

  // Open link in Telegram
  openLink(url) {
    if (this.webApp.openLink) {
      this.webApp.openLink(url);
    }
  }

  // Open Telegram link
  openTelegramLink(url) {
    if (this.webApp.openTelegramLink) {
      this.webApp.openTelegramLink(url);
    }
  }

  // Read text from clipboard
  readTextFromClipboard() {
    return new Promise((resolve, reject) => {
      if (this.webApp.readTextFromClipboard) {
        this.webApp.readTextFromClipboard((text) => {
          resolve(text);
        });
      } else {
        reject('Clipboard API not available');
      }
    });
  }

  // Write text to clipboard
  writeTextToClipboard(text) {
    return new Promise((resolve, reject) => {
      if (this.webApp.writeTextToClipboard) {
        this.webApp.writeTextToClipboard(text, (success) => {
          if (success) {
            resolve();
          } else {
            reject('Failed to write to clipboard');
          }
        });
      } else {
        reject('Clipboard API not available');
      }
    });
  }

  // Setup back button
  setupBackButton(callback) {
    if (this.webApp.BackButton) {
      this.webApp.BackButton.onClick(callback);
      this.webApp.BackButton.show();
    }
  }

  // Hide back button
  hideBackButton() {
    if (this.webApp.BackButton) {
      this.webApp.BackButton.hide();
    }
  }

  // Setup settings button
  setupSettingsButton(callback) {
    if (this.webApp.SettingsButton) {
      this.webApp.SettingsButton.onClick(callback);
      this.webApp.SettingsButton.show();
    }
  }

  // Hide settings button
  hideSettingsButton() {
    if (this.webApp.SettingsButton) {
      this.webApp.SettingsButton.hide();
    }
  }

  // Get color scheme
  getColorScheme() {
    return this.webApp.colorScheme || 'dark';
  }

  // Get theme params
  getThemeParams() {
    return this.webApp.themeParams || {};
  }

  // Check if app is expanded
  isExpanded() {
    return this.webApp.isExpanded();
  }

  // Expand app
  expand() {
    this.webApp.expand();
  }
}

// Export for use in React components
window.TelegramMiniApp = TelegramMiniApp;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.telegramApp = new TelegramMiniApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TelegramMiniApp;
}
