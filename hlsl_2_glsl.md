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

------

### SHADER TOY  卡通渲染相关

1、基于图像的边缘检测，RGB2HSV的区域颜色过滤

https://www.shadertoy.com/view/MlVGzm

2、Hexagonal Game Board

https://www.shadertoy.com/view/3ly3Wh

3、六边形tiling

https://www.shadertoy.com/view/3sSGWt

4、光追 铅笔

https://www.shadertoy.com/view/7sSSWV

