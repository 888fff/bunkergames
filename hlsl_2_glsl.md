| HLSL                        | GLSL                  |
| --------------------------- | --------------------- |
| atan2(y,x)                  | atan 使用参数交换     |
| ddx                         | dFdx                  |
| ddx_coarse                  | dFdxCoarse            |
| ddx_fine                    | dFdxFine              |
| ddy                         | dFdy                  |
| ddy_coarse                  | dFdyCoarse            |
| ddy_fine                    | dFdyFine              |
| EvaluateAttributeAtCentroid | interpolateAtCentroid |
| EvaluateAttributeAtSample   | interpolateAtSample   |
| EvaluateAttributeSnapped    | interpolateAtOffset   |
| frac                        | fract                 |
| lerp                        | mix                   |
| mad                         | fma                   |
| saturate                    | clamp(x, 0.0, 1.0)    |

