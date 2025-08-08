// --- 1. DOM要素の取得 ---
const newsContainer = document.getElementById('news-container');
const loadingMessage = document.getElementById('loading-message');
const searchBox = document.getElementById('search-box');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;
const toggleIcon = darkModeToggle.querySelector('i');

// --- 2. ダークモード機能 ---

/**
 * 現在のテーマに応じてアイコン（月/太陽）を更新する
 * @param {boolean} isDarkMode - ダークモードが有効かどうかのフラグ
 */
function updateThemeIcon(isDarkMode) {
    if (isDarkMode) {
        toggleIcon.classList.remove('fa-moon'); // 月アイコンを削除
        toggleIcon.classList.add('fa-sun');   // 太陽アイコンを追加
    } else {
        toggleIcon.classList.remove('fa-sun');    // 太陽アイコンを削除
        toggleIcon.classList.add('fa-moon');  // 月アイコンを追加
    }
}

/**
 * ページのテーマ（ライト/ダーク）を切り替える
 */
function toggleTheme() {
    // body要素に 'dark-mode' クラスを付け外しし、その結果（クラスが存在するかどうか）を取得
    const isDarkMode = body.classList.toggle('dark-mode');
    // 現在のテーマ設定をlocalStorageに保存する
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcon(isDarkMode);
}

/**
 * ページ読み込み時にlocalStorageに保存されたテーマを適用する
 */
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    // OSのテーマ設定を優先しつつ、保存された設定を適用
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;

    if (isDarkMode) {
        body.classList.add('dark-mode');
    }
    updateThemeIcon(isDarkMode);
}

// --- 3. ニュースの取得と描画 ---

/**
 * ニュースデータを元にHTMLカード要素を作成する
 * @param {object} article - 個々のニュース記事データ
 * @returns {HTMLElement} - 作成されたカードのHTML要素
 */
function createNewsCard(article) {
    const card = document.createElement('a');
    card.className = 'news-card';
    card.href = article.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    // 画像URLがない場合の代替画像のURL
    const placeholderImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const imageUrl = article.image_url ? article.image_url : placeholderImage;

    card.innerHTML = `
        <img src="${imageUrl}" alt="" class="card-image" onerror="this.src='${placeholderImage}'; this.onerror=null;">
        <div class="card-content">
            <span class="card-source">${article.source || 'Unknown Source'}</span>
            <h3 class="card-title">${article.title}</h3>
            <p class="card-summary">${article.summary || 'No summary available.'}</p>
        </div>
    `;
    return card;
}

/**
 * APIからニュースを取得し、ページに描画する
 */
async function fetchAndDisplayNews() {
    try {
        const response = await fetch('/api/news');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }
        const articles = await response.json();

        loadingMessage.style.display = 'none'; // ローディングメッセージを非表示

        if (articles.error) {
            newsContainer.innerHTML = `<p id="loading-message">${articles.error}</p>`;
            return;
        }

        if (articles.length === 0) {
            newsContainer.innerHTML = '<p id="loading-message">No news available right now.</p>';
            return;
        }

        articles.forEach(article => {
            const card = createNewsCard(article);
            newsContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Failed to fetch news:', error);
        loadingMessage.textContent = `Failed to load news: ${error.message}`;
    }
}

// --- 4. 検索フィルタリング機能 ---

/**
 * 検索キーワードに基づいてニュースカードをフィルタリングする（堅牢版）
 */
function filterNews() {
    try {
        // searchBoxがnullでないことを確認してからvalueを取得
        const searchTerm = searchBox ? searchBox.value.toLowerCase() : '';
        const cards = document.querySelectorAll('.news-card');

        if (cards.length === 0) {
            return; // カードがなければ何もしない
        }

        cards.forEach(card => {
            const titleElement = card.querySelector('.card-title');

            // titleElementが存在し、かつtextContentを持つことを確認
            if (titleElement && typeof titleElement.textContent === 'string') {
                const title = titleElement.textContent.toLowerCase();
                if (title.includes(searchTerm)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            } else {
                // 予期せぬカード構造の場合、安全のため表示しておく
                card.classList.remove('hidden');
            }
        });
    } catch (error) {
        console.error("An error occurred during filtering:", error);
        // エラーが発生した場合でも、ユーザー操作を妨げないようにする
    }
}

// --- 5. イベントリスナーの初期化 ---

// DOMが完全に読み込まれたら処理を開始
document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme(); // 保存されたテーマを適用
    fetchAndDisplayNews(); // ニュースを取得・表示

    // ダークモードトグルボタンにクリックイベントを追加
    darkModeToggle.addEventListener('click', toggleTheme);

    // 検索ボックスに入力イベントを追加
    searchBox.addEventListener('input', filterNews);
});
