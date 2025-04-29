declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FAL_KEY: string;
      OPENAI_API_KEY: string;
      NODE_ENV: 'development' | 'production';
    }
  }
}

export {}; 