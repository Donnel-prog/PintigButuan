#!/usr/bin/env python3
"""
Pintig Butuan News Aggregator
=================================
Aggregates news from multiple sources for Butuan City:
  1. Bombo Radyo Butuan - https://butuan.bomboradyo.com/
  2. MindaNews Butuan - https://mindanews.com/tag/butuan-city-news/
  3. Mindanao Gold Star Daily - https://mindanaogoldstardaily.com/archives/category/butuan/
  4. Brigada News FM Butuan - https://www.brigadanews.ph/bnfm-butuan/
  5. Google News RSS (Butuan City Focus)
  6. NewsAPI.org (Optional)

Usage:
  python caraga_news_aggregator.py              # Run once
  python caraga_news_aggregator.py --schedule   # Run every hour
  python caraga_news_aggregator.py --output news.json  # Save to file

Requirements:
  pip install requests beautifulsoup4 feedparser schedule

Author: Pintig Butuan Development Team
"""

import json
import hashlib
import logging
import argparse
import time
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from urllib.parse import quote_plus

# Third-party imports with graceful fallback
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing required packages...")
    os.system("pip install requests beautifulsoup4 feedparser schedule")
    import requests
    from bs4 import BeautifulSoup

try:
    import feedparser
except ImportError:
    os.system("pip install feedparser")
    import feedparser

try:
    import schedule
except ImportError:
    os.system("pip install schedule")
    import schedule


# ─── Configuration ─────────────────────────────────────────────────────────────

# NewsAPI Key (Free tier: 100 requests/day)
NEWSAPI_KEY = os.environ.get("NEWSAPI_KEY", "")

# Butuan City Keywords
BUTUAN_QUERY = '"Butuan City" OR "Butuan City news" OR "Butuan Philippines"'

BUTUAN_KEYWORDS = [
    "butuan", "agusan del norte", "libertad", "bancasi",
    "ampayon", "langihan", "baan", "doongan", "tiniwisan",
    "golden ribbon", "bading", "downtown butuan",
    "balangay", "agusan river", "guingona park"
]

# Source RSS Feeds
FEEDS = {
    "Bombo Radyo Butuan": "https://butuan.bomboradyo.com/feed/",
    "MindaNews Butuan": "https://mindanews.com/tag/butuan-city-news/feed/",
    "Mindanaogoldstardaily": "https://mindanaogoldstardaily.com/archives/category/butuan/feed/",
    "Brigada News Butuan": "https://www.brigadanews.ph/bnfm-butuan/feed/",
    "Google News Butuan": 'https://news.google.com/rss/search?q=Butuan+City+Philippines&hl=en-PH&gl=PH&ceid=PH:en',
}

# Output settings
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "butuan_news.json")

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("PintigButuan")

# Request headers to avoid blocking
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}


# ─── Article Model ─────────────────────────────────────────────────────────────

class Article:
    """Represents a single news article."""

    def __init__(
        self,
        title: str,
        description: str = "",
        url: str = "",
        image_url: str = "",
        published_at: str = "",
        source: str = "",
        author: str = "",
        content: str = "",
        region: str = "",
    ):
        self.title = title.strip()
        self.description = self._clean_html(description)
        self.url = url.strip()
        self.image_url = image_url.strip() if image_url else ""
        self.published_at = published_at
        self.source = source.strip()
        self.author = author.strip() if author else ""
        self.content = self._clean_html(content)
        self.region = region or self._detect_district()
        self.id = self._generate_id()

    def _clean_html(self, html: str) -> str:
        if not html: return ""
        soup = BeautifulSoup(html, "html.parser")
        return soup.get_text(strip=True).replace("&nbsp;", " ").replace("\n", " ").strip()[:500]

    def _generate_id(self) -> str:
        """Generate a unique ID based on title + source."""
        raw = f"{self.title}{self.source}".lower()
        return hashlib.md5(raw.encode()).hexdigest()[:12]

    def _detect_district(self) -> str:
        """Auto-detect the district/barangay from the article text."""
        text = f"{self.title} {self.description}".lower()
        district_map = {
            "libertad": "Libertad",
            "bancasi": "Bancasi",
            "ampayon": "Ampayon",
            "langihan": "Langihan",
            "baan": "Baan",
            "doongan": "Doongan",
            "tiniwisan": "Tiniwisan",
            "golden ribbon": "Golden Ribbon",
            "bading": "Bading",
            "downtown": "Downtown",
            "agusan": "Agusan del Norte"
        }
        for keyword, district in district_map.items():
            if keyword in text:
                return district
        return "Butuan City"

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "url": self.url,
            "urlToImage": self.image_url,
            "publishedAt": self.published_at,
            "source": self.source,
            "author": self.author,
            "content": self.content,
            "region": self.region,
            "isAdminAlert": False,
        }

    def is_relevant(self) -> bool:
        """Check if the article is relevant based on Butuan keywords."""
        text = f"{self.title} {self.description}".lower()
        return any(kw in text for kw in BUTUAN_KEYWORDS)


# ─── Fetchers ──────────────────────────────────────────────────────────────────

def fetch_rss_feeds() -> List[Article]:
    """Fetch news from configured RSS feeds."""
    all_articles = []
    for source, url in FEEDS.items():
        logger.info(f"📡 Fetching {source} RSS...")
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:20]:
                image = ""
                if hasattr(entry, "media_content"):
                    image = entry.media_content[0].get("url", "")
                elif hasattr(entry, "content"):
                    desc_soup = BeautifulSoup(entry.content[0].value, "html.parser")
                    img = desc_soup.find("img")
                    if img: image = img.get("src", "")
                
                if not image and "enclosures" in entry:
                    for enc in entry.enclosures:
                        if enc.type.startswith("image/"):
                            image = enc.href
                            break

                all_articles.append(Article(
                    title=entry.get("title", ""),
                    description=entry.get("summary", ""),
                    url=entry.get("link", ""),
                    image_url=image,
                    published_at=entry.get("published", datetime.now().isoformat()),
                    source=source,
                    author=entry.get("author", source),
                ))
        except Exception as e:
            logger.error(f"  ❌ {source} RSS error: {e}")
    return all_articles


def fetch_newsapi() -> List[Article]:
    """Fetch from NewsAPI if key is provided."""
    if not NEWSAPI_KEY: return []
    logger.info("🌐 Fetching from NewsAPI.org...")
    articles = []
    try:
        params = {
            "q": BUTUAN_QUERY,
            "apiKey": NEWSAPI_KEY,
            "language": "en",
            "sortBy": "publishedAt",
            "pageSize": 30,
            "from": (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d"),
        }
        response = requests.get("https://newsapi.org/v2/everything", params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ok":
            for item in data.get("articles", []):
                articles.append(Article(
                    title=item.get("title", ""),
                    description=item.get("description", ""),
                    url=item.get("url", ""),
                    image_url=item.get("urlToImage", ""),
                    published_at=item.get("publishedAt", ""),
                    source=item.get("source", {}).get("name", "NewsAPI"),
                    author=item.get("author", ""),
                ))
    except Exception as e:
        logger.error(f"  ❌ NewsAPI error: {e}")
    return articles


# ─── Aggregation & Deduplication ───────────────────────────────────────────────

def deduplicate_articles(articles: List[Article]) -> List[Article]:
    seen_ids = set()
    seen_titles = set()
    unique = []
    for article in articles:
        if not article.title or "[Removed]" in article.title: continue
        normalized = article.title.lower().strip()[:50]
        if article.id not in seen_ids and normalized not in seen_titles:
            seen_ids.add(article.id)
            seen_titles.add(normalized)
            unique.append(article)
    return unique


def aggregate_all() -> List[Dict]:
    logger.info("=" * 60)
    logger.info("💙 PINTIG BUTUAN NEWS AGGREGATOR")
    logger.info(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 60)

    all_raw = []
    all_raw.extend(fetch_rss_feeds())
    all_raw.extend(fetch_newsapi())

    relevant = [a for a in all_raw if a.is_relevant()]
    unique = deduplicate_articles(relevant)
    
    # Sort newest first
    def get_date(a):
        try: return datetime.fromisoformat(a.published_at.replace("Z", "+00:00"))
        except: return datetime.min
    sorted_unique = sorted(unique, key=get_date, reverse=True)

    logger.info(f"\n📊 Total collected: {len(all_raw)}")
    logger.info(f"🎯 Local relevance: {len(relevant)}")
    logger.info(f"✅ Final unique: {len(sorted_unique)}")
    
    return [a.to_dict() for a in sorted_unique]


def save_to_json(articles: List[Dict], filepath: str):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    output = {
        "metadata": {
            "region": "Butuan City",
            "generated_at": datetime.now().isoformat(),
            "total_articles": len(articles),
        },
        "articles": articles,
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    logger.info(f"💾 Saved to: {filepath}")


# ─── Main ──────────────────────────────────────────────────────────────────────

def scheduled_job():
    try:
        articles = aggregate_all()
        save_to_json(articles, OUTPUT_FILE)
    except Exception as e:
        logger.error(f"Scheduled job failed: {e}")

def main():
    parser = argparse.ArgumentParser(description="Pintig Butuan News Aggregator")
    parser.add_argument("--output", "-o", type=str, default=OUTPUT_FILE)
    parser.add_argument("--schedule", "-s", action="store_true")
    args = parser.parse_args()

    if args.schedule:
        logger.info("⏰ Starting hourly scheduler...")
        scheduled_job()
        schedule.every(1).hours.do(scheduled_job)
        while True:
            schedule.run_pending()
            time.sleep(60)
    else:
        articles = aggregate_all()
        save_to_json(articles, args.output)

if __name__ == "__main__":
    main()
