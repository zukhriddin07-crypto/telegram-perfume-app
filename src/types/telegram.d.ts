interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  isExpanded: boolean;
  isFullscreen: boolean;
  isActive: boolean;
  platform: string;
  version: string;
  colorScheme: 'light' | 'dark';
  isVerticalSwipesEnabled: boolean;

  // UI Controls
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setBottomBarColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  enableVerticalSwipes: () => void;
  disableVerticalSwipes: () => void;
  requestFullscreen: () => void;
  exitFullscreen: () => void;
  addToHomeScreen: () => void;
  checkHomeScreenStatus: (callback: (status: string) => void) => void;
  isVersionAtLeast: (version: string) => boolean;

  // Dialogs
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  showPopup: (params: { title?: string; message: string; buttons?: { type: string; text?: string; id?: string }[] }, callback?: (button_id: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;

  // Data
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;

  // QR Code
  showScanQrPopup: (params: { text?: string }, callback?: (text: string) => boolean) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback: (text: string | null) => void) => void;

  // Contact & Permissions
  requestContact: (callback: (sent: boolean) => void) => void;
  requestWriteAccess: (callback: (granted: boolean) => void) => void;

  // Story Sharing
  shareToStory: (media_url: string, params?: any) => void;
  shareMessage: (msg_id: string, callback?: () => void) => void;

  // Download
  downloadFile: (params: { url: string; file_name: string }, callback?: (accepted: boolean) => void) => void;

  // Buttons
  MainButton: BottomButton;
  SecondaryButton: BottomButton;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  SettingsButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };

  // Feedback
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };

  // Storage
  CloudStorage: {
    setItem: (key: string, value: string, callback?: (error: any, success: boolean) => void) => void;
    getItem: (key: string, callback: (error: any, value: string) => void) => void;
    getItems: (keys: string[], callback: (error: any, values: Record<string, string>) => void) => void;
    removeItem: (key: string, callback?: (error: any, success: boolean) => void) => void;
    removeItems: (keys: string[], callback?: (error: any, success: boolean) => void) => void;
    getKeys: (callback: (error: any, keys: string[]) => void) => void;
  };

  // Biometric
  BiometricManager: {
    isInited: boolean;
    isBiometricAvailable: boolean;
    biometricType: string;
    isAccessRequested: boolean;
    isAccessGranted: boolean;
    isBiometricTokenSaved: boolean;
    deviceId: string;
    init: (callback?: () => void) => void;
    requestAccess: (params: any, callback?: (granted: boolean) => void) => void;
    authenticate: (params: any, callback?: (success: boolean, token?: string) => void) => void;
    updateBiometricToken: (token: string, callback?: (updated: boolean) => void) => void;
    openSettings: () => void;
  };

  // Theme
  themeParams: Record<string, string>;
  
  // Safe Area
  safeAreaInset: { top: number; bottom: number; left: number; right: number };
  contentSafeAreaInset: { top: number; bottom: number; left: number; right: number };

  // Init Data
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: WebAppUser;
    receiver?: WebAppUser;
    chat?: any;
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
  };

  // Events
  onEvent: (eventType: string, callback: (...args: any[]) => void) => void;
  offEvent: (eventType: string, callback: (...args: any[]) => void) => void;
}

interface WebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

interface BottomButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  setText: (text: string) => void;
  setParams: (params: any) => void;
  showProgress: (leaveActive?: boolean) => void;
  hideProgress: () => void;
  enable: () => void;
  disable: () => void;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
