import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from '../types/news';

const STORAGE_KEYS = {
    ARTICLES: '@pintig_caraga_articles',
};

export const storageService = {
    saveArticles: async (articles: Article[]) => {
        try {
            const jsonValue = JSON.stringify(articles);
            await AsyncStorage.setItem(STORAGE_KEYS.ARTICLES, jsonValue);
        } catch (e) {
            console.error('Error saving articles', e);
        }
    },

    getArticles: async (): Promise<Article[]> => {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.ARTICLES);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Error getting articles', e);
            return [];
        }
    },
};
