import logging
import requests
from flask import Flask, jsonify, render_template

# --- アプリケーション設定 ---
app = Flask(__name__)

# --- ロギング設定 ---
# フォーマットとレベルを設定し、コンソールにログを出力
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(levelname)s %(message)s',
                    handlers=[logging.StreamHandler()])

# --- Hacker News API 設定 ---
HN_API_BASE_URL = "https://hacker-news.firebaseio.com/v0"
TOP_STORIES_URL = f"{HN_API_BASE_URL}/topstories.json"
ITEM_URL = f"{HN_API_BASE_URL}/item/"

# --- ルーティング ---

@app.route('/')
def index():
    """フロントエンドのメインページを返す"""
    app.logger.info("Serving index.html")
    return render_template('index.html')

@app.route('/api/news')
def get_news():
    """Hacker Newsのトップ記事を取得してJSONで返す"""
    app.logger.info("Request received for /api/news")
    try:
        # 1. トップ記事のIDリストを取得
        response = requests.get(TOP_STORIES_URL, timeout=10)
        response.raise_for_status()  # HTTPエラーがあれば例外を発生
        story_ids = response.json()
        app.logger.info(f"Successfully fetched {len(story_ids)} story IDs.")

        # 2. 上位20件の記事詳細を取得
        news_list = []
        limit = 20
        for story_id in story_ids[:limit]:
            try:
                item_response = requests.get(f"{ITEM_URL}{story_id}.json", timeout=5)
                item_response.raise_for_status()
                story_data = item_response.json()
                # タイトルとURLを持つ記事のみをリストに追加
                if story_data and 'title' in story_data and 'url' in story_data:
                    news_list.append({
                        'title': story_data['title'],
                        'url': story_data['url']
                    })
            except requests.RequestException as e:
                app.logger.error(f"Failed to fetch item {story_id}: {e}")
                # 一つの記事取得に失敗しても処理を続行
                continue

        app.logger.info(f"Successfully fetched details for {len(news_list)} stories.")
        return jsonify(news_list)

    except requests.RequestException as e:
        app.logger.error(f"Failed to fetch top stories from Hacker News API: {e}")
        # API全体へのアクセスに失敗した場合はエラーを返す
        return jsonify({"error": "Failed to retrieve news from Hacker News API"}), 500
    except Exception as e:
        app.logger.error(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected server error occurred"}), 500

# --- アプリケーション実行 ---
if __name__ == '__main__':
    # host='0.0.0.0' を指定して、Dockerコンテナの外部からアクセス可能にする
    app.run(host='0.0.0.0', port=5000, debug=True)
