import type { SpecJSON } from './commons'

export interface WeakeningService {
  generateExamplesFromTrace(req: ExampleGenRequestJSON): Promise<string[][]>

  generateExamplesFromProgress(req: ExampleGenRequestJSON): Promise<string[][]>

  weakenSafetyInvariant(req: WeakeningRequestJSON): Promise<string[]>
}

export interface ExampleGenRequestJSON {
  sysSpecs: SpecJSON[]
  envSpecs: SpecJSON[]
  progress?: string
  trace?: string[]
  inputs?: string[]
  fluents: string[]
  numOfAdditionalExamples: number
}

export interface WeakeningRequestJSON {
  invariant: string
  fluents: string[]
  positiveExamples: string[][]
  negativeExamples: string[][]
}

export const weakeningService: WeakeningService = {
  generateExamplesFromTrace: async function (req: ExampleGenRequestJSON): Promise<string[][]> {
    const response = await fetch('http://localhost:8080/api/weakening/examplesFromTrace', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    })
    if (!response.ok) {
      const content = await response.text()
      throw new Error(content)
    }
    return (await response.json()) as string[][]
  },

  generateExamplesFromProgress: async function (req: ExampleGenRequestJSON): Promise<string[][]> {
    const response = await fetch('http://localhost:8080/api/weakening/examplesFromProgress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    })
    if (!response.ok) {
      const content = await response.text()
      throw new Error(content)
    }
    return (await response.json()) as string[][]
  },

  weakenSafetyInvariant: async function (req: WeakeningRequestJSON): Promise<string[]> {
    const response = await fetch('http://localhost:8080/api/weakening/weakenSafetyInvariant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    })
    if (!response.ok) {
      const content = await response.text()
      throw new Error(content)
    }
    return (await response.json()) as string[]
  }
}
