# Judis

A Discord Bot that judges C code submitted to DM to see if the output follows the test case.

## !!! CAUTION !!!

This Bot, by its nature of accepting and executing code input from the user, **always carries the risk of arbitrary code execution**.

I (Alliana) will not be held responsible for any damage or disadvantage that may occur as a result of the Bot's operation.

Also, it is highly recommended to limit the users of this code to trusted persons only.

## Installation

It is assumed that `clang` and `deno` are installed.

```sh
git clone https://github.com/Allianaab2m/judis
```

Prepare the `.env` file.

```txt:.env
DISCORD_TOKEN=[YOUR BOT TOKEN].
BOT_ID=[YOUR BOT USER ID].
OWNER_ID=[YOUR USER ID].
```

```sh
deno task start
```

Test cases should be prepared in ``1.json`` or similar format under ``testcase/``.

The following is an example of a test case.

```json:1.json
[
  {
    "in": "3 5",
    "out": "Odd"
  },.
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
