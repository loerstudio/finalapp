declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_DEEPSEEK_API_KEY: string;
      EXPO_PUBLIC_API_URL: string;
    }
  }
}

export {};