# Tech News Reader

これは、最新のテクノロジー関連ニュースを取得して表示するシンプルなニュースリーダーアプリケーションです。
バックエンドはPython (Flask)、フロントエンドはHTML/JavaScriptで構築されており、Dockerを使用して簡単に実行できます。

## 特徴

- 最新の技術ニュースのタイトルをリストで表示
- タイトルをクリックすると、元のニュース記事を新しいタブで開く
- シンプルでクリーンなUI
- Dockerによる簡単な環境構築

## 前提条件

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

上記がローカルマシンにインストールされている必要があります。

## 起動方法

1.  このリポジトリをクローンまたはダウンロードします。
2.  ターミナルを開き、プロジェクトのルートディレクトリに移動します。
3.  以下のコマンドを実行して、Dockerコンテナをビルドし、バックグラウンドで起動します。

    ```bash
    docker-compose up --build -d
    ```

4.  コンテナの起動後、しばらく待ってから、Webブラウザで以下のURLにアクセスしてください。

    `http://localhost:5000`

## 使用方法

- ページにアクセスすると、最新のテクノロジーニュースのリストが自動的に表示されます。
- 興味のあるニュースのタイトルをクリックすると、新しいタブで元の記事ページが開きます。

## 実行時ログの確認

アプリケーションのログを確認したい場合は、以下のコマンドを実行します。

```bash
docker-compose logs -f
```

## 停止方法

アプリケーションを停止するには、以下のコマンドを実行します。

```bash
docker-compose down
```

## プロジェクト構造

```
.
├── Dockerfile              # Dockerイメージの定義
├── README.md               # このファイル
├── app.py                  # Flaskバックエンドアプリケーション
├── docker-compose.yml      # Docker Composeの設定
├── requirements.txt        # Pythonの依存ライブラリ
├── static                  # CSS/JSファイル
│   ├── css/style.css
│   └── js/script.js
└── templates               # HTMLテンプレート
    └── index.html
```
