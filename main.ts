import 'https://deno.land/std@0.204.0/dotenv/load.ts'
import { Client, GatewayIntentBits, Partials } from 'npm:discord.js'
import { compile, exec } from './src/compiler.ts'
import { writeFileTmp, deleteFileTmp } from './src/tmp.ts'
import { judge } from './src/judge.ts'
import { surroundCodeBlock, extractCodeBlock } from './src/utils.ts'

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.Reaction,
  ],
})

client.once('ready', (client) => {
  console.log(client.user.username, 'logged in')
})

client.on('messageCreate', async (m) => {
  if (m.author.bot) return

  if (!m.channel.isDMBased()) {
    return
  } else {
    if (m.content.startsWith('!ping')) {
      await m.reply('Pong!')
    } else if (m.content.startsWith('!exec')) {
      const [_command] = m.content.split(/\s+/, 2)
      const codeBlock = m.content
        .substring(_command.length + 1)
        .match(/([\s\S]*)[^```](```)/)
      if (codeBlock === null) {
        await m.reply('コードブロックからコードを取得できませんでした．')
        return
      }

      const [code, input] = extractCodeBlock(codeBlock[0])

      console.log(code)
      console.log(input)

      const { fileId } = await writeFileTmp(code)

      try {
        await compile(fileId)
      } catch (e) {
        if (e instanceof Error) {
          if (e.message === 'Compile timeout') {
            await m.reply('TLE\nコンパイルがタイムアウトしました．')
            return
          } else {
            await m.reply(
              `CE\nコンパイルエラーが発生しました．\n${surroundCodeBlock(
                e.message,
                'sh'
              )}`
            )
          }
          await deleteFileTmp(`${fileId}.c`)
          return
        }
      }

      const result = await exec(fileId, input)
      let out = result.out
      if (out === '') {
        out = 'No output'
      }
      await m.reply(surroundCodeBlock(out, 'sh'))
      return
    } else if (m.content.startsWith('!judge')) {
      const [_command, questionId] = m.content.split(/\s+/, 2)
      const code = m.content
        .substring(_command.length + questionId.length + 2)
        .match(/c([\s\S]*)[^```]/)
      if (code === null) {
        await m.reply('コードブロックからコードを取得できませんでした．')
        return
      }

      const codeContent = code[0].substring(1)

      const { fileId } = await writeFileTmp(codeContent)

      try {
        await Deno.readTextFile(`testcase/${questionId}.json`)
      } catch (e) {
        await m.reply(
          '問題IDが誤っている可能性があります．\nスタックトレース:\n' +
            surroundCodeBlock(e)
        )
        console.error(e)
        return
      }

      try {
        await compile(fileId)
      } catch (e) {
        if (e instanceof Error) {
          if (e.message === 'Compile timeout') {
            await m.reply('TLE\nコンパイルがタイムアウトしました．')
            return
          } else {
            await m.reply(
              `CE\nコンパイルエラーが発生しました．\n${surroundCodeBlock(
                e.message,
                'sh'
              )}`
            )
          }
          await deleteFileTmp(`${fileId}.c`)
          return
        }
      }

      const judgeResult = await judge(questionId, fileId)

      if (judgeResult.testCases.length === judgeResult.success.length) {
        await m.reply(
          `## 問題${questionId}\nPA!\nおめでとうございます！\n\n${judgeResult.testCases
            .map((v, i) => {
              return (
                '入力\n' +
                surroundCodeBlock(v.in) +
                '出力\n' +
                surroundCodeBlock(judgeResult.success[i].out)
              )
            })
            .join('\n')}`
        )

        // 正解したときにAllianaへ正解コードを送る部分
        if (client.user?.id === Deno.env.get('BOT_ID')) {
          const OWNER_ID = Deno.env.get('OWNER_ID')
          if (OWNER_ID) {
            const alliana = await client.users.fetch(OWNER_ID)
            const user = await m.author.fetch()
            console.log(user)
            await alliana.send(
              `${
                m.author.username
              }が問題${questionId}を正解したみたい．\nコード:\n${surroundCodeBlock(
                codeContent,
                'c'
              )}`
            )
          }
        }
      } else {
        await m.reply(
          `## 問題${questionId}\nWA...\nもう一度トライしてみよう！\n\n合ってたケース:\n${judgeResult.success
            .map((v) => {
              return (
                '入力\n' +
                surroundCodeBlock(judgeResult.testCases[v.id].in) +
                '出力\n' +
                surroundCodeBlock(v.out)
              )
            })
            .join('\n')}\n\n間違ってたケース:\n${judgeResult.fail
            .map((v) => {
              return (
                '入力\n' +
                surroundCodeBlock(judgeResult.testCases[v.id].in) +
                '予期された出力\n' +
                surroundCodeBlock(v.expected) +
                '実際の出力\n' +
                surroundCodeBlock(v.out)
              )
            })
            .join('\n')}
          `
        )
      }
      await deleteFileTmp(`${fileId}.c`)
      await deleteFileTmp(`${fileId}`)
      return
    }
  }
})

client.login(Deno.env.get('DISCORD_TOKEN'))

// const { fileId } = await writeFileTmp(`
// #include <stdio.h>
// #include <string.h> // 今回の問題では使います

// int main(void) {
//   char str[100];
//   int a, b;
//   scanf("%s", str);
//   scanf("%d", &a);
//   scanf("%d", &b);

//   if (strcmp(str, "add") == 0) {
//     printf("%d", a + b);
//   } else if (strcmp(str, "minus") == 0) {
//     printf("%d", a - b);
//   } else {
//     printf("error");
//   }

//   return 0;
// }
// `)

// try {
//   await compile(fileId)
// } catch (e) {
//   if (e instanceof Error) {
//     if (e.message === 'Compile timeout') {
//     }
//     console.error(e.message)
//     await deleteFileTmp(`${fileId}.c`)
//     Deno.exit(1)
//   }
// }
// console.log(await exec(fileId, 'add 2 5'))
