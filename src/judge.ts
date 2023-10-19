import { exec } from './compiler.ts'

type TestCase = {
  in: string
  out: string
}

interface CaseResult {
  id: number
  expected: string
  out: string
}

interface JudgeResult {
  testCases: TestCase[]
  success: Array<CaseResult>
  fail: Array<CaseResult>
}

export const judge = async (
  questionId: string,
  execFileId: string
): Promise<JudgeResult> => {
  const testCaseFile = await Deno.readTextFile(`testcase/${questionId}.json`)
  const testCases = JSON.parse(testCaseFile) as TestCase[]

  const execResults = await Promise.allSettled(
    testCases.map((testCase) => exec(execFileId, testCase.in))
  )

  const failCase: Array<CaseResult> = []
  const successCase: Array<CaseResult> = []

  execResults.map((r, i) => {
    if (r.status === 'rejected') {
      failCase.push({
        id: i,
        out: r.reason,
        expected: testCases[i].out,
      })
    } else {
      if (r.value.success === true && r.value.out === testCases[i].out) {
        successCase.push({
          id: i,
          out: r.value.out,
          expected: testCases[i].out,
        })
      } else {
        failCase.push({
          id: i,
          out: r.value.out,
          expected: testCases[i].out,
        })
        return []
      }
    }
  })

  console.log({
    testCases,
    successCase,
    failCase,
  })

  return {
    testCases,
    success: successCase,
    fail: failCase,
  }
}
