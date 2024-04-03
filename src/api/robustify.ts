import type { SpecJSON } from './commons'

export enum Algorithm {
  Pareto = 'Pareto',
  Fast = 'Fast'
}

interface PrioritizedEventsJSON {
  P0: string[]
  P1: string[]
  P2: string[]
  P3: string[]
}

interface PrioritizedBehJSON {
  P0: string[][]
  P1: string[][]
  P2: string[][]
  P3: string[][]
}

export interface RequestJSON {
  sysSpecs: SpecJSON[]
  envSpecs: SpecJSON[]
  propSpecs: SpecJSON[]
  options: {
    progress: string[]
    preferredBeh: PrioritizedBehJSON
    controllable: PrioritizedEventsJSON
    observable: PrioritizedEventsJSON
    algorithm: Algorithm
    maxIter: number
  }
  outputFormat: string
}

export interface RobustificationResult {
  model: string
  preferred: string[][]
  controllable: string[]
  observable: string[]
}

export interface RobustificationService {
  robustify(req: RequestJSON): Promise<RobustificationResult[]>
}

export const robustificationService: RobustificationService = {
  robustify: async function (req: RequestJSON): Promise<RobustificationResult[]> {
    const response = await fetch('http://localhost:8080/api/robustify/supervisory', {
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
    return (await response.json()) as RobustificationResult[]
  }
}
