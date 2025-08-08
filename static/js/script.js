document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM要素の取得 ---
    const newsContainer = document.getElementById('news-container');
    const loadingMessage = document.getElementById('loading-message');
    const noResultsMessage = document.getElementById('no-results-message');

    const searchForm = document.getElementById('search-form');
    const searchBox = document.getElementById('search-box');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const toggleIcon = darkModeToggle.querySelector('i');

    // --- 2. ダークモード機能 (変更なし) ---
    function updateThemeIcon(isDarkMode) {
        toggleIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }

    function toggleTheme() {
        const isDarkMode = body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeIcon(isDarkMode);
    }

    function applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
        if (isDarkMode) {
            body.classList.add('dark-mode');
        }
        updateThemeIcon(isDarkMode);
    }

    // --- 3. ニュースの取得と描画 (変更なし) ---
    function createNewsCard(article) {
        const card = document.createElement('a');
        card.className = 'news-card';
        card.href = article.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
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

    async function fetchAndDisplayNews() {
        try {
            const response = await fetch('/api/news');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API request failed with status ${response.status}`);
            }
            const articles = await response.json();
            loadingMessage.style.display = 'none';
            if (articles.error) {
                noResultsMessage.querySelector('p').textContent = articles.error;
                noResultsMessage.classList.remove('hidden');
                return;
            }
            if (articles.length === 0) {
                noResultsMessage.querySelector('p').textContent = 'No news available right now.';
                noResultsMessage.classList.remove('hidden');
                return;
            }
            articles.forEach(article => {
                newsContainer.appendChild(createNewsCard(article));
            });
        } catch (error) {
            console.error('Failed to fetch news:', error);
            loadingMessage.textContent = `Failed to load news: ${error.message}`;
        }
    }

    // --- 4. 新しい検索機能 ---

    /**
     * 検索キーワードに基づいてニュースカードをフィルタリングする
     * @param {string} searchTerm - フィルタリングに使用するキーワード
     */
    function filterNews(searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const cards = document.querySelectorAll('.news-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const titleElement = card.querySelector('.card-title');
            if (titleElement && titleElement.textContent) {
                const title = titleElement.textContent.toLowerCase();
                const isVisible = title.includes(lowerCaseSearchTerm);
                card.classList.toggle('hidden', !isVisible);
                if (isVisible) {
                    visibleCount++;
                }
            }
        });

        // 「結果なし」メッセージの表示制御
        if (visibleCount === 0 && searchTerm) {
            noResultsMessage.querySelector('p').textContent = `「${searchTerm}」に一致する記事はありません。`;
            noResultsMessage.classList.remove('hidden');
        } else {
            noResultsMessage.classList.add('hidden');
        }
    }

    /**
     * 検索フォームの送信イベントを処理する
     * @param {Event} event - フォームのsubmitイベント
     */
    function handleSearch(event) {
        event.preventDefault(); // ページの再読み込みを防止
        const searchTerm = searchBox.value.trim();
        filterNews(searchTerm);
        clearSearchBtn.classList.toggle('hidden', !searchTerm);
    }

    /**
     * 検索をクリアする
     */
    function clearSearch() {
        searchBox.value = '';
        filterNews('');
        clearSearchBtn.classList.add('hidden');
    }

    // --- 5. イベントリスナーの初期化 ---
    applySavedTheme();
    fetchAndDisplayNews();

    darkModeToggle.addEventListener('click', toggleTheme);
    searchForm.addEventListener('submit', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
});
