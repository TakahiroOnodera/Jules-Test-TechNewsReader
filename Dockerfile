# --- ベースイメージ ---
# 公式のPython 3.9スリム版イメージを使用
FROM python:3.9-slim

# --- 環境変数 ---
# Pythonが.pycファイルを生成しないように設定
ENV PYTHONDONTWRITEBYTECODE 1
# Pythonの出力をバッファリングせず、ログが直接表示されるように設定
ENV PYTHONUNBUFFERED 1

# --- 作業ディレクトリ ---
# コンテナ内の作業ディレクトリを作成・設定
WORKDIR /app

# --- 依存関係のインストール ---
# まずrequirements.txtをコピーして、依存関係をインストール
# これにより、コードの変更時に毎回依存関係を再インストールする必要がなくなる
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- アプリケーションコードのコピー ---
# アプリケーションのソースコードをコンテナにコピー
COPY . .

# --- ポートの公開 ---
# Flaskアプリケーションがリッスンするポートを公開
EXPOSE 5000

# --- 実行コマンド ---
# コンテナ起動時にFlaskアプリケーションを実行
CMD ["python", "app.py"]
