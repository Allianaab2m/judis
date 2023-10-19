export const deleteFileTmp = async (fileName: string) => {
  try {
    await Deno.remove(`/tmp/${fileName}`)
  } catch {
    console.error(`/tmp/${fileName}: remove failed`)
  }
}

export const writeFileTmp = async (
  content: string
): Promise<{ fileId: string }> => {
  const fileId = Math.random().toString(36).slice(-8)

  await Deno.writeTextFile(`/tmp/${fileId}.c`, content)

  return {
    fileId,
  }
}
