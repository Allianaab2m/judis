export const compile = async (fileId: string) => {
  const command = new Deno.Command('clang', {
    args: ['-o', `/tmp/${fileId}`, `/tmp/${fileId}.c`, '-Werror'],
    signal: AbortSignal.timeout(2000),
  })

  const { code, stderr } = await command.output()

  if (code === 0) {
    return
  } else if (code === 143) {
    throw new Error('Compile timeout')
  } else {
    throw new CompileError(new TextDecoder().decode(stderr))
  }
}

export const exec = async (
  fileId: string,
  input = ''
): Promise<{ success: boolean; code?: number; out: string }> => {
  const command = new Deno.Command(`/tmp/${fileId}`, {
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'piped',
    signal: AbortSignal.timeout(2000),
  }).spawn()

  const writer = command.stdin.getWriter()
  await writer.write(new TextEncoder().encode(input))
  writer.releaseLock()
  await command.stdin.close()

  const { code, stdout, stderr } = await command.output()
  if (code === 0) {
    return {
      success: true,
      out: new TextDecoder().decode(stdout),
    }
  } else {
    return {
      success: false,
      code,
      out: new TextDecoder().decode(stderr),
    }
  }
}

class CompileError extends Error {
  static {
    this.prototype.name = 'CompileError'
  }
}
