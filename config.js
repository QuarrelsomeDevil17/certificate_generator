// Configuration file for Certificate Generator
// Replace YOUR_OPENROUTER_API_KEY_HERE with your actual OpenRouter API key

const CONFIG = {
    // Your OpenRouter API key (starts with sk-or-v1-)
    OPENROUTER_API_KEY: 'sk-or-v1-4c43944fb9e8357eded98e0f8b2f598a49d6440b93dbeed5de0fe1948cb8fb0eYOUR_OPENROUTER_API_KEY_HERE',
    
    // AI Model to use (DeepSeek R1)
    AI_MODEL: 'deepseek/deepseek-r1',
    
    // API Settings
    MAX_TOKENS: 500,
    TEMPERATURE: 0.7
};

// Make config available globally
window.CERTIFICATE_CONFIG = CONFIG;
