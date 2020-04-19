<head>
    <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
    <script type="text/x-mathjax-config">
        MathJax.Hub.Config({
            tex2jax: {
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
            inlineMath: [['$','$']]
            }
        });
    </script>
</head>
# Shader 学习记录 4

***`written by wenweihang`***

- ###### 噪声

接触噪声，还得从一行代码说起

```glsl
fract(sin(dot(u.xy, vec2(12.9898,78.233))) * 43758.5453123);
```

之前很费解这个代码的含义，但是当看到图像（我们以x轴为自变量，y为代码返回值），就恍然大悟

```glsl
fract(sin(x * 12.9898) * 43758.5453123);
```

<img src="img/shader_learning_4/image-20200418233620329.png" alt="image-20200418233620329" style="zoom:50%;" />

这行代码将sin函数的x，y 轴缩放后，取了其小数部分，分析它的行为：$y∈(0,1)$ ，周期为  $2\pi/12.9898$ , 且映射关系还有唯一性，那我们利用这个式子就可以得到很多伪随机点。当然这些点比较离散.如果我们需要将点连续一些，可以用一个floor函数

```glsl
fract(sin(floor(8*x) * 12.9898) * 43234.5453123)
```

<img src="img/shader_learning_4/image-20200419004329113.png" alt="image-20200419004329113" style="zoom:50%;" />

