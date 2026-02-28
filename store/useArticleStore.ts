import { create } from 'zustand';
import { NewsState } from '../types/news';

export const useArticleStore = create<NewsState>((set, get) => ({
    articles: [],
    savedArticles: [],
    selectedArticle: null,
    isLoading: false,
    error: null,

    setArticles: (articles) => set({ articles }),
    setSelectedArticle: (article) => set({ selectedArticle: article }),
    toggleSavedArticle: (article) => {
        const { savedArticles } = get();
        const exists = savedArticles.find(a => a.id === article.id);
        if (exists) {
            set({ savedArticles: savedArticles.filter(a => a.id !== article.id) });
        } else {
            set({ savedArticles: [...savedArticles, article] });
        }
    },
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}));
