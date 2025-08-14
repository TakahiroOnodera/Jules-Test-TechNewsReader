import logging
import os
import requests
from flask import Flask, jsonify, render_template

# --- アプリケーション設定 ---
app = Flask(__name__)

# --- ロギング設定 ---
logging.basicConfig(level=logging.INFO, # INFOレベル以上のログを記録
                    format='%(asctime)s %(levelname)s %(message)s',
                    handlers=[logging.StreamHandler()])

# --- NewsAPI 設定 ---
NEWS_API_KEY = os.environ.get('NEWS_API_KEY')
NEWS_API_URL = "https://newsapi.org/v2/top-headlines"

# --- ルーティング ---

@app.route('/')
def index():
    """フロントエンドのメインページを返す"""
    app.logger.info("Serving index.html")
    return render_template('index.html')

@app.route('/api/news')
def get_news():
    """NewsAPIから技術ニュースを取得してJSONで返す"""
    app.logger.info("Request received for /api/news")

    # APIキーが設定されているか確認
    if not NEWS_API_KEY:
        app.logger.error("NEWS_API_KEY is not set.")
        return jsonify({"error": "API key is not configured on the server."}), 500

    # NewsAPIへのリクエストパラメータ
    params = {
        'apiKey': NEWS_API_KEY,
        'category': 'technology',
        'country': 'us', # 米国のニュースを取得
        'pageSize': 30 # 取得する記事数
    }

    try:
        # NewsAPIへリクエストを送信
        response = requests.get(NEWS_API_URL, params=params, timeout=10)
        response.raise_for_status()  # HTTPエラーがあれば例外を発生
        data = response.json()

        # 必要な情報（タイトル、発行元、要約、URL、画像URL）を抽出
        articles = []
        for article in data.get('articles', []):
            # 記事に必要な情報が揃っているか確認
            if all(k in article for k in ['title', 'url', 'description', 'urlToImage']) and article.get('source'):
                articles.append({
                    'title': article['title'],
                    'source': article['source']['name'],
                    'summary': article['description'],
                    'url': article['url'],
                    'image_url': article['urlToImage']
                })

        app.logger.info(f"Successfully fetched and processed {len(articles)} articles.")
        return jsonify(articles)

    except requests.RequestException as e:
        app.logger.error(f"Failed to fetch news from NewsAPI: {e}")
        return jsonify({"error": "Failed to retrieve news from the provider."}), 502 # 502 Bad Gateway
    except Exception as e:
        app.logger.error(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected server error occurred."}), 500

# --- アプリケーション実行 ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
