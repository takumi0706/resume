---
company: メモアカ
title: バックエンドエンジニア
employment: インターン
start: "2025-02"
end: null
remote: true
stack: [TypeScript, Node.js, Express, AWS Lambda, DynamoDB]
summary: 脳トレアプリ「カオナマエ」のAPIサーバー開発
---

顔と名前を覚える脳トレアプリ「[カオナマエ](https://prtimes.jp/main/html/rd/p/000000002.000142440.html)」の API サーバーを開発しています。Express と TypeScript の REST API を AWS Lambda 上で動かし、データストアに DynamoDB、画像に S3 を使っています。データアクセス層はリポジトリパターンで分離しています。

- ゲーム内通貨の加減算と残高取得の API
- プッシュ通知の基盤を一式実装。デバイストークンの登録から、トピックの登録・解除、配信、購読状態の同期まで
- 同期処理のバッチ化
- ライフ回復と広告視聴回数の管理
- ローカル開発環境の整備
