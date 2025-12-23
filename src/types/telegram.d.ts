export {};

declare global {
  interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    close: () => void;
    headerColor: string;
    openTelegramLink: (url: string) => void;
    initDataUnsafe: {
      query_id?: string;
      user?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
      };
      start_param?: string;
      auth_date?: string;
      hash?: string;
    };
    MainButton: {
      text: string;
      show: () => void;
      hide: () => void;
      onClick: (callback: () => void) => void;
      setText: (text: string) => void;
      showProgress: (leaveActive: boolean) => void;
      hideProgress: () => void;
    };
    HapticFeedback: {
      notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
      impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    };
    showPopup: (
      params: { title?: string; message: string; buttons?: { type: string; text: string }[] },
      callback?: (id: string) => void
    ) => void;
  }

  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}