export enum RobustnessMode {
  Robustness,
  Intolerable,
  CompareSys,
  CompareProp,
  WA
}

export type EquivClass = RepWithExplain[]

export interface RepWithExplain {
  rep: { word: string; deadlock: boolean }
  explanation?: string
}

export interface SpecJSON {
  type: string
  content: string
}

export interface RequestJSON {
  sysSpecs: SpecJSON[]
  sys2Specs?: SpecJSON[]
  envSpecs: SpecJSON[]
  propSpecs: SpecJSON[]
  prop2Specs?: SpecJSON[]
  devSpecs?: SpecJSON[]
  options: {
    expand: boolean
    minimized: boolean
    disables: boolean
  }
}

export interface RobustnessService {
  computeRobustness(req: RequestJSON): Promise<EquivClass[]>

  computeIntolerable(req: RequestJSON): Promise<EquivClass[]>

  compareRobustnessOfTwoSystems(req: RequestJSON): Promise<EquivClass[]>

  compareRobustnessOfTwoProps(req: RequestJSON): Promise<EquivClass[]>

  computeWA(req: RequestJSON): Promise<string>
}

export const robustnessService: RobustnessService = {
  computeRobustness: async function (req: RequestJSON): Promise<EquivClass[]> {
    const response = await fetch('http://localhost:8080/api/robustness/compute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return (await response.json()) as EquivClass[]
  },

  computeIntolerable: async function (req: RequestJSON): Promise<EquivClass[]> {
    const response = await fetch('http://localhost:8080/api/robustness/intolerable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return (await response.json()) as EquivClass[]
  },

  compareRobustnessOfTwoSystems: async function (req: RequestJSON): Promise<EquivClass[]> {
    if (!req.sys2Specs) throw new Error('sys2Specs is not defined')

    const response = await fetch('http://localhost:8080/api/robustness/compareSys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return (await response.json()) as EquivClass[]
  },

  compareRobustnessOfTwoProps: async function (req: RequestJSON): Promise<EquivClass[]> {
    if (!req.prop2Specs) throw new Error('prop2Specs is not defined')

    const response = await fetch('http://localhost:8080/api/robustness/compareProp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return (await response.json()) as EquivClass[]
  },

  computeWA: async function (req: RequestJSON): Promise<string> {
    const response = await fetch('http://localhost:8080/api/robustness/wa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.text()
  }
}
