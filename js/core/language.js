/**
 * Language Management class
 * Handles translations and language switching for the game UI
 */

import { settings } from '../config/settings.js';

export class LanguageManager {
    constructor() {
        this.currentLanguage = settings.language.default; // Default language from settings
        this.translations = null;
        this.isLoaded = false;
        this.loadTranslations();
    }

    async loadTranslations() {
        try {
            const response = await fetch('assets/lang/translations.json');
            this.translations = await response.json();
            this.isLoaded = true;
            console.log("Translations loaded successfully");
            
            // Apply translations to the UI
            this.applyTranslations();
            
            // Setup language switcher
            this.setupLanguageSwitcher();
            
            // Dispatch an event when translations are loaded
            document.dispatchEvent(new CustomEvent('translationsLoaded'));
        } catch (error) {
            console.error("Error loading translations:", error);
        }
    }

    setLanguage(language) {
        if (this.translations && this.translations[language]) {
            this.currentLanguage = language;
            console.log(`Language changed to ${language}`);
            
            // Apply translations when language changes
            this.applyTranslations();
            
            // Update active language button
            const buttons = document.querySelectorAll('#language-toggle button');
            buttons.forEach(button => {
                button.classList.toggle('active', button.getAttribute('data-lang') === language);
            });
            
            // Dispatch an event when language changes
            document.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: this.currentLanguage } 
            }));
            
            return true;
        }
        return false;
    }

    get(key) {
        if (!this.isLoaded) {
            return key; // Return the key if translations are not loaded yet
        }
        
        // Parse nested keys like "menu.title"
        const keys = key.split('.');
        let result = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (result && result[k]) {
                result = result[k];
            } else {
                console.warn(`Translation not found for key: ${key}`);
                return key;
            }
        }
        
        return result;
    }
    
    applyTranslations() {
        if (!this.isLoaded) return;
        
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.get(key);
        });
    }
    
    setupLanguageSwitcher() {
        const languageButtons = document.querySelectorAll('#language-toggle button');
        languageButtons.forEach(button => {
            button.addEventListener('click', () => {
                const language = button.getAttribute('data-lang');
                this.setLanguage(language);
            });
        });
    }
    
    // Mapping for class names based on language
    getClassNameTranslation(className, targetLanguage) {
        // Define mapping between languages
        const classMapping = {
            'en': {
                'Guerreiro': 'Warrior', 
                'Arqueiro': 'Archer', 
                'Mago': 'Mage'
            },
            'pt-br': {
                'Warrior': 'Guerreiro', 
                'Archer': 'Arqueiro', 
                'Mage': 'Mago'
            }
        };
        
        // If we have mapping for the target language
        if (classMapping[targetLanguage] && classMapping[targetLanguage][className]) {
            return classMapping[targetLanguage][className];
        }
        
        // If no mapping found, return original
        return className;
    }
}

// Export a singleton instance
export const languageManager = new LanguageManager();
