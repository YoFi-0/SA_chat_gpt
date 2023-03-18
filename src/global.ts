declare global {
    namespace NodeJS {
        interface ProcessEnv {
            OPEN_AI_API_KEY:string
            SERVER_PORT:string
            SESSION_SECRIT:string
            IS_PRODUCTION:string
            JWT_RF_KEY:string
            JWT_ACCESS_KEY:string
        }
    }
}

export {};