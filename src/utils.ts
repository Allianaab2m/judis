export const surroundCodeBlock = (content: string, lang = 'txt'): string => {
  return `\`\`\`${lang}\n${content}\n\`\`\``
}

export const extractCodeBlock = (content: string) => {
  const contentLines = content.split('\n')
  let codeBlockSegmentCount = 0
  let codeBlockCount = 0

  const contents: string[][] = []

  contentLines.forEach((l) => {
    if (l === '') return
    if (l.startsWith('```')) {
      // 奇数回登場しているならCodeBlockStart
      codeBlockSegmentCount++
      if (codeBlockSegmentCount % 2 == 1) {
        contents.push([])
        codeBlockCount++
      }
      return
    } else {
      contents[codeBlockCount - 1].push(l)
    }
  })
  return contents.map((c) => c.join('\n'))
}
