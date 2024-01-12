import type { RobustnessMode } from "@/api/robustness";

export interface RobustnessConfig {
    sys: string,
    sys2: string,
    env: string,
    prop: string,
    prop2: string,
    dev: string,
    mode: RobustnessMode,
    minimized: boolean,
    expand: boolean,
    withDisables: boolean
}
