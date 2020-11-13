# Contentfulのサンプル
コンテントフルをJSから取得して使う

## setup

```
$ npm install
```

## Contrentfulの設定
`src/js/modules/Contentful.js`を編集する

```js
const client = contentful.createClient({
    space: ["space IDを入力"],
    accessToken: ["Access Tokenを入力"]
});
```

## dev serverの起動

```shell script
$ npm run start
```

http://localhost:8080/
で立ち上がります。

## deploy

```shell script
$ npm run build
```

上記コマンドを実行すると`dist`ディレクトリができるのでその中身をアップロードする
