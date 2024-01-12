import type { Algorithm } from "@/api/robustify"

export interface RobustifyConfig {
    sys: string,
    env: string,
    prop: string,
    progress: string,
    preferredBeh: {
        P1: string,
        P2: string,
        P3: string
    },
    controllable: {
        P0: string,
        P1: string,
        P2: string,
        P3: string
    },
    observable: {
        P0: string,
        P1: string,
        P2: string,
        P3: string
    },
    algorithm: Algorithm,
    maxIter: number
}
