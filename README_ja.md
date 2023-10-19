# Judis

[English](./README.md)

DMに提出されたC言語のコードをテストケースに沿った出力がされているかジャッジするDiscord Bot

## !!! CAUTION !!!

このBotはユーザーからのコードの入力を受け付け，実行するという性質上，**任意のコードを実行される危険性が常に伴います**．

このコードを実行し，Botを運用した場合，以上の危険性を承知の上で実行したものとみなし，運用に伴い発生した損害や不利益に関しては私(Alliana)は一切の責任を負いません．

また，信頼できる人にのみ利用できるように利用者を制限することを強くお勧めします．

## インストール

`clang`, `deno`がインストールされていることが前提です．

```sh
git clone https://github.com/Allianaab2m/judis
```

`.env`ファイルを用意してください．

```txt:.env
DISCORD_TOKEN=[YOUR BOT TOKEN]
BOT_ID=[YOUR BOT USER ID]
OWNER_ID=[YOUR USER ID]
```

```sh
deno task start
```

テストケースは`testcase/`配下に`1.json`などの形式で用意してください．
以下はテストケースの一例です．

```json:1.json
[
  {
    "in": "3 5",
    "out": "Odd"
  },
  {
    "in": "6 10",
    "out": "Even"
  },
  {
    "in": "0 10",
    "out": "Even"
  }
]

```

## 使用法

`!judge [問題番号]`の後に改行し，コードブロックでC言語を指定してください．