/**
 * Pintig Butuan — News Service
 * ==============================
 * Multi-source news aggregation focused on Butuan City.
 *
 * Sources:
 *  1. Bombo Radyo Butuan — https://butuan.bomboradyo.com/
 *  2. MindaNews Butuan — https://mindanews.com/tag/butuan-city-news/
 *  3. Mindanao Gold Star Daily — https://mindanaogoldstardaily.com/archives/category/butuan
 *  4. Brigada News FM Butuan — https://www.brigadanews.ph/bnfm-butuan/
 *  5. Google News RSS (Butuan City) — Free, no API key
 *  6. Mock data fallback — for offline/development
 */

import axios from 'axios';
import { Article } from '../types/news';
import { storageService } from './storageService';

// ─── Configuration ────────────────────────────────────────────────────────────

// RSS-to-JSON converter (free, 10K requests/day)
const RSS2JSON = 'https://api.rss2json.com/v1/api.json';

// Butuan City News Source RSS Feeds
const NEWS_FEEDS = {
    BOMBO_BUTUAN: 'https://butuan.bomboradyo.com/feed/',
    MINDANEWS_BUTUAN: 'https://mindanews.com/tag/butuan-city-news/feed/',
    GOLDSTAR_BUTUAN: 'https://mindanaogoldstardaily.com/archives/category/butuan/feed/',
    BRIGADA_BUTUAN: 'https://www.brigadanews.ph/bnfm-butuan/feed/',
    GOOGLE_BUTUAN: 'https://news.google.com/rss/search?q=Butuan+City+Philippines&hl=en-PH&gl=PH&ceid=PH:en',
    GOOGLE_BUTUAN2: 'https://news.google.com/rss/search?q="Butuan+City"&hl=en-PH&gl=PH&ceid=PH:en',
    RMN_NEWS: 'https://rmn.ph/rmn-news-nationwide/feed/',
};

// Fallback images (Butuan/Philippines themed)
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(title: string, source: string): string {
    const raw = `${title}${source}`.toLowerCase();
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

function detectDistrict(title: string): string {
    const text = title.toLowerCase();
    const map: Record<string, string> = {
        'bancasi': 'Bancasi',
        'ampayon': 'Ampayon',
        'libertad': 'Libertad',
        'langihan': 'Langihan',
        'baan': 'Baan',
        'doongan': 'Doongan',
        'tiniwisan': 'Tiniwisan',
        'golden ribbon': 'Golden Ribbon',
        'bading': 'Bading',
        'downtown': 'Downtown',
    };
    for (const [kw, district] of Object.entries(map)) {
        if (text.includes(kw)) return district;
    }
    return 'Butuan City';
}

function cleanHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&#8230;/g, '...').trim() || '';
}

function cleanTitle(title: string): string {
    // Remove " - Source Name" suffix from Google News
    return title.replace(/\s*[-–—]\s*[^-–—]{3,}$/, '').trim();
}

function getFallbackImage(idx: number): string {
    return FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
}

// ─── RSS Fetcher ──────────────────────────────────────────────────────────────

async function fetchRSSFeed(feedUrl: string, sourceName: string): Promise<Article[]> {
    try {
        const response = await axios.get(RSS2JSON, {
            params: { rss_url: feedUrl },
            timeout: 12000,
        });

        if (response.data.status !== 'ok') {
            console.warn(`[${sourceName}] RSS error:`, response.data.message);
            return [];
        }

        return (response.data.items || []).map((item: any, i: number): Article => {
            const title = cleanTitle(item.title || '');
            const desc = cleanHtml(item.description || '').substring(0, 300);

            // Try to extract image
            let image = item.thumbnail || item.enclosure?.link || '';
            if (!image && item.content) {
                const match = item.content.match(/<img[^>]+src="([^"]+)"/);
                if (match) image = match[1];
            }
            if (!image) image = getFallbackImage(i);

            return {
                id: generateId(title, sourceName),
                title,
                description: desc,
                content: cleanHtml(item.content || desc),
                urlToImage: image,
                publishedAt: item.pubDate || new Date().toISOString(),
                source: sourceName,
                author: item.author || `${sourceName}`,
                url: item.link || '',
                region: detectDistrict(title),
                isAdminAlert: false,
                isVerified: true, // Trusted local news source
                verificationSource: `Verified local news via ${sourceName}`,
            };
        });
    } catch (err: any) {
        console.warn(`[${sourceName}] Fetch failed:`, err?.message);
        return [];
    }
}

// ─── Deduplication ────────────────────────────────────────────────────────────

function deduplicate(articles: Article[]): Article[] {
    const seenTitles = new Set<string>();
    return articles.filter(a => {
        if (!a.title || a.title === '[Removed]') return false;
        const fingerprint = a.title.toLowerCase().trim().substring(0, 60);
        if (seenTitles.has(fingerprint)) return false;
        seenTitles.add(fingerprint);
        return true;
    });
}

// ─── Main News Service ────────────────────────────────────────────────────────

export const newsService = {
    /**
     * Fetch REAL news from Butuan City sources.
     * All free, no API keys needed.
     */
    fetchNews: async (): Promise<Article[]> => {
        console.log('💙 Fetching Butuan City news...');

        try {
            const results = await Promise.allSettled([
                fetchRSSFeed(NEWS_FEEDS.BOMBO_BUTUAN, 'Bombo Radyo Butuan'),
                fetchRSSFeed(NEWS_FEEDS.MINDANEWS_BUTUAN, 'MindaNews'),
                fetchRSSFeed(NEWS_FEEDS.GOLDSTAR_BUTUAN, 'Gold Star Daily'),
                fetchRSSFeed(NEWS_FEEDS.BRIGADA_BUTUAN, 'Brigada News'),
                fetchRSSFeed(NEWS_FEEDS.GOOGLE_BUTUAN, 'Google News'),
                fetchRSSFeed(NEWS_FEEDS.GOOGLE_BUTUAN2, 'Google News'),
                fetchRSSFeed(NEWS_FEEDS.RMN_NEWS, 'RMN News'),
            ]);

            const allArticles: Article[] = results
                .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
                .flatMap(r => r.value);

            console.log(`📊 Raw: ${allArticles.length} articles`);

            const unique = deduplicate(allArticles);

            // Sort newest first
            unique.sort((a, b) =>
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );

            console.log(`✅ Final: ${unique.length} unique articles`);

            // Log source breakdown
            const sources: Record<string, number> = {};
            unique.forEach(a => { sources[a.source] = (sources[a.source] || 0) + 1; });
            console.log('📈 Sources:', JSON.stringify(sources));

            // Cache
            await storageService.saveArticles(unique);
            return unique;
        } catch (error) {
            console.error('❌ News fetch failed:', error);
            const cached = await storageService.getArticles();
            return cached.length > 0 ? cached : newsService.fetchMockNews();
        }
    },

    /**
     * Mock data for offline mode — Butuan City focused.
     */
    fetchMockNews: async (): Promise<Article[]> => {
        await new Promise(r => setTimeout(r, 600));

        const articles: Article[] = [
            {
                id: 'mock-1',
                title: 'Butuan City Launches P500M Smart City Digital Transformation',
                description: 'Mayor confirms massive investment in digital infrastructure for the city, including smart traffic systems, public WiFi, and e-governance platforms for Butuanons.',
                content: 'The Butuan City government has officially launched its Smart City Initiative with a P500 million budget. The project includes smart traffic management along major thoroughfares, city-wide public WiFi, and digital government services. "Butuan will become a model city for digital governance in Mindanao," the mayor said.',
                urlToImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
                publishedAt: new Date().toISOString(),
                source: 'Bombo Radyo Butuan',
                author: 'Bombo Radyo News',
                url: 'https://butuan.bomboradyo.com/',
                region: 'Downtown',
                isAdminAlert: false,
            },
            {
                id: 'mock-2',
                title: 'Bancasi Airport Expansion Project Reaches 60% Completion',
                description: 'DPWH announces significant progress on the Bancasi Airport runway extension and new terminal building, expected to accommodate larger aircraft by Q3.',
                content: 'The Department of Public Works and Highways (DPWH) reported that the Bancasi Airport expansion project in Butuan City has reached 60% completion. The project includes runway extension, a modern passenger terminal, and improved navigation systems.',
                urlToImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
                publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
                source: 'MindaNews',
                author: 'MindaNews Reporter',
                url: 'https://mindanews.com/tag/butuan-city-news/',
                region: 'Bancasi',
                isAdminAlert: false,
            },
            {
                id: 'mock-3',
                title: 'Agusan River Flood Warning: CDRRMO Activates Response Teams',
                description: 'Heavy rains prompt CDRRMO to deploy disaster response teams along the Agusan River basin. Evacuation centers prepared in low-lying barangays.',
                content: 'The Butuan City CDRRMO has activated all response teams following heavy rainfall. Residents in flood-prone barangays along the Agusan River basin are advised to prepare for possible evacuation. Emergency hotlines are now operational 24/7.',
                urlToImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
                publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
                source: 'Brigada News',
                author: 'CDRRMO Update',
                url: 'https://www.brigadanews.ph/bnfm-butuan/',
                region: 'Butuan City',
                isAdminAlert: true,
            },
            {
                id: 'mock-4',
                title: 'Balangay Festival 2026: Butuan Celebrates Maritime Heritage',
                description: 'Annual festival honors the city\'s pre-colonial maritime legacy. Week-long events include boat races, cultural shows, and historical exhibits at the National Museum.',
                content: 'Butuan City celebrates the Balangay Festival 2026, commemorating the discovery of balangay boats — the oldest watercraft found in Southeast Asia. Events include the Regatta sa Agusan, street dancing, and exhibits at the Balangay Shrine Museum.',
                urlToImage: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80',
                publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
                source: 'Gold Star Daily',
                author: 'Gold Star Reporter',
                url: 'https://mindanaogoldstardaily.com/archives/category/butuan',
                region: 'Downtown',
                isAdminAlert: false,
            },
            {
                id: 'mock-5',
                title: 'Local Farmers Market in Libertad Sees Record Weekend Sales',
                description: 'Butuan\'s Saturday farmer\'s market draws thousands of shoppers with fresh produce from Agusan plantations and artisanal products from local entrepreneurs.',
                content: 'The weekend farmers market at Libertad saw record attendance and sales this Saturday. Over 200 vendor stalls offered fresh vegetables, fruits, and local delicacies. The market initiative supports local agricultural communities.',
                urlToImage: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80',
                publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
                source: 'Bombo Radyo Butuan',
                author: 'Bombo Radyo',
                url: 'https://butuan.bomboradyo.com/',
                region: 'Libertad',
                isAdminAlert: false,
            },
            {
                id: 'mock-6',
                title: 'CSU Butuan Ranks Among Top Universities in National Research Output',
                description: 'Caraga State University in Ampayon demonstrates research excellence in environmental science and sustainable mining studies, earning national recognition.',
                content: 'Caraga State University (CSU) in Butuan City has been recognized for its outstanding research contributions, particularly in environmental science and sustainable mining. The university ranked among the top institutions nationally for published research.',
                urlToImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
                publishedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
                source: 'MindaNews',
                author: 'MindaNews',
                url: 'https://mindanews.com/tag/butuan-city-news/',
                region: 'Ampayon',
                isAdminAlert: false,
            },
        ];

        await storageService.saveArticles(articles);
        return articles;
    },
};
