export interface Article {
    id: string;
    title: string;
    description: string;
    content: string;
    urlToImage: string;
    publishedAt: string;
    source: string;
    author: string;
    url: string;
    region?: string;
    isAdminAlert?: boolean;
    isVerified?: boolean;
    verificationSource?: string;
}

export interface NewsState {
    articles: Article[];
    savedArticles: Article[];
    selectedArticle: Article | null;
    isLoading: boolean;
    error: string | null;
    setArticles: (articles: Article[]) => void;
    setSelectedArticle: (article: Article | null) => void;
    toggleSavedArticle: (article: Article) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
}
