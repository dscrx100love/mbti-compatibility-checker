# MBTI相性診断サイト

MBTIタイプ別の相性診断と具体的なアドバイスを提供するWebアプリケーションです。

## 特徴

- 16のMBTIタイプすべての組み合わせ（256パターン）に対応
- 各組み合わせに対する相性スコア（5段階評価）
- 双方向の具体的なアクションアドバイス
- 擬人化されたキャラクター表現
- レスポンシブデザイン対応

## ファイル構成

```
mbti-compatibility/
├── index.html          # メインページ
├── styles/            # CSSファイル
│   ├── main.css
│   ├── base.css
│   ├── components.css
│   ├── diagnosis.css
│   ├── results.css
│   ├── messages.css
│   ├── animations.css
│   ├── responsive.css
│   └── variables.css
├── scripts/           # JavaScriptファイル
│   ├── main.js
│   ├── data.js      # MBTIデータと相性情報
│   └── utils.js
└── images/           # 画像ファイル
    ├── bg/
    └── icons/
```

## 使用方法

1. `index.html`をWebブラウザで開く
2. 自分と相手のMBTIタイプを選択
3. 「診断する」ボタンをクリック
4. 相性結果と具体的なアドバイスを確認

## データ構造

- **mbtiTypes**: 各MBTIタイプの基本情報（名前、絵文字、特徴など）
- **compatibilityData**: 相性情報（スコア、タイトル、良い点、注意点）
- **advice**: 双方向の具体的なアクション（各3つずつ）

## 開発情報

- 純粋なHTML/CSS/JavaScriptで実装
- 外部ライブラリ不使用
- モバイルファースト設計

## ライセンス

このプロジェクトは個人利用を目的としています。

## 作成者

rikukunifusa