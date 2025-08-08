// DOMが完全に読み込まれたら処理を開始
document.addEventListener('DOMContentLoaded', () => {
    const newsList = document.getElementById('news-list');

    // バックエンドAPIからニュースデータを非同期で取得
    async function fetchNews() {
        try {
            const response = await fetch('/api/news');
            if (!response.ok) {
                // HTTPステータスが200番台でない場合はエラーを投げる
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const newsData = await response.json();

            // ローディングメッセージをクリア
            newsList.innerHTML = '';

            if (newsData.length === 0) {
                newsList.innerHTML = '<p>No news available at the moment.</p>';
                return;
            }

            // 取得したデータからリストを生成
            newsData.forEach(newsItem => {
                const listItem = document.createElement('li');
                const link = document.createElement('a');

                link.href = newsItem.url;
                link.textContent = newsItem.title;
                link.target = '_blank'; // 新しいタブで開く
                link.rel = 'noopener noreferrer'; // セキュリティ対策

                listItem.appendChild(link);
                newsList.appendChild(listItem);
            });

        } catch (error) {
            console.error('Failed to fetch news:', error);
            // エラーメッセージを表示
            newsList.innerHTML = '<p>Failed to load news. Please try again later.</p>';
        }
    }

    // ニュース取得関数を実行
    fetchNews();
});
