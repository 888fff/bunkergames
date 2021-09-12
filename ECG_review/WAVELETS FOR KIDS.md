# WAVELETS FOR KIDS 

## A Tutorial Introduction

准确地说，小波是纯数学的主题，但在仅仅作为一种理论存在的几年时间里，小波在许多领域显示出巨大的潜力和适用性。

关于小波有很多优秀的专著和文章，本教程并不打算与它们中的任何一篇进行竞争。相反，它的目的是作为一个非常初级的阅读，提供了有趣的例子，为统计界。我们也提供了参考资料进一步阅读以及一些数学DIY程序。

#### 1 What are wavelets?

小波是满足特定要求的函数。小波的名字来自于这样的要求:它们应该积分到零，在x轴上下摆动。小波的微小内涵意味着函数必须很好地定位。其他要求是技术性的，主要是为了保证小波正逆变换的快速简便计算

小波有很多种。人们可以在光滑小波、紧支持小波、具有简单数学表达式的小波、带有简单相关滤波器的小波等之间进行选择。最简单的是Haar小波，我们将在下一节中作为介绍性示例进行讨论。图1给出了一些小波(来自Daubechies小波族)的例子。就像傅里叶分析中的正弦和余弦一样，小波被用作表示其他函数的基函数。小波(有时称为母小波)$\psi(x)$是固定的，一种是母小波的平移和扩张$\{\psi(\frac{x-b}{a}),(a,b)\in R^+\times R\}$。在定义小波基时，可以方便地取 $a$ 和 $b$ 的特殊值：$a = 2^{-j}$和 $b = k\cdot2^{-j}$ ，其中k和j均为整数。对a和b的选择称为临界抽样，它会给出一个稀疏基。此外，这种选择自然地将信号处理中的多分辨率分析与小波世界联系起来。

<img src="img/WAVELETS FOR KIDS/image-20210517153028160.png" alt="image-20210517153028160" style="zoom:67%;" />

小波初学者经常会问，为什么不用传统的傅里叶方法呢?傅里叶分析与小波之间有一些重要的差异。傅里叶基函数在频率上是局部的，但在时间上不是。傅里叶变换中频率的小变化会在时域中产生变化。小波在频率/尺度(通过膨胀)和时间(通过平移)上都是局部的。在许多情况下，这种本地化是一种优势。

其次，许多类函数可以用小波以一种更紧凑的方式表示。例如，具有不连续和具有尖锐峰值的函数通常使用比正弦-余弦基函数少得多的小波基函数来实现类似的近似。这种稀疏编码使小波成为数据压缩的优秀工具。例如，联邦调查局已经标准化了小波在数字指纹图像压缩中的使用。压缩比在20:1的数量级，原始图像和解压后的图像之间的差异只有专家才能知道。小波还有很多其他的应用，其中一些非常令人愉快。Coifman和他的耶鲁团队使用小波来清除嘈杂的录音，包括勃拉姆斯在钢琴上演奏他的第一支匈牙利舞的旧录音。

这已经暗示了统计学家如何从小波中获益。大而有噪声的数据集可以通过离散小波变换(对应于离散傅里叶变换)轻松快速地进行变换。用小波系数对数据进行编码。此外，在大多数情况下，傅里叶变换的“快速”可以被小波变换的“更快”所取代。众所周知，快速傅里叶变换的计算复杂度为$O(n\cdot{log_2(n)})$。对于快速小波变换，计算复杂度为$O(n)$。

许多数据操作现在都可以通过处理相应的小波系数来完成。例如，可以通过对小波系数进行阈值化，然后将阈值码返回到“时域”来进行数据平滑。第3节给出了阈值的定义和不同的阈值方法。

```mermaid
graph LR
start(RAWDATA) --> m1(W. DECOMP) --> m2(THRESHOLD) --> m3(W. COMP) --> m4(PROCESSED DATA)

```

#### 2 How do the wavelets work?

##### 2.1 The Haar wavelet

为了解释小波的工作原理，我们先从一个例子开始。我们选择了最简单和最古老的小波(我们想说：所有小波之母!)，Haar小波，$\psi(x)$: 它是一个阶跃函数，在$[0,\frac{1}{2})$上取值为1,在$[\frac{1}{2},1)$上取值为-1。
$$
\psi(x)=\begin{cases}
1\quad &0\leq x<\frac{1}{2}\\
-1\quad &\frac{1}{2}\leq x<1\\
0 \quad &others
\end{cases}
$$
Haar小波的图如图3所示。

<img src="img/WAVELETS FOR KIDS/image-20210518005808264.png" style="zoom: 67%;" />

Haar小波已有80多年的历史，并在各种数学领域中得到了应用。众所周知，任何连续函数都可以用哈尔函数(Haar function)一致地逼近。(布朗运动甚至可以用Haar小波来定义)，函数$\psi$的膨胀和平移，
$$
\psi_{jk}(x) = const\cdot\psi(2^jx-k)，
$$
在$L^2(R)$(所有平方可积函数的空间)中定义一个正交基。这意味着$L^2(R)$中的任何元素都可以表示为这些基函数的线性组合(可能是无限个)。

$\psi_{jk}$的正交性很容易检验。很明显有：
$$
\int\psi_{jk}\cdot\psi_{j^{'}k{'}} = 0,
$$
当$j = j^{'}$和$ k= k^{'}$不同时满足时候。

如果$j\not=j^{'}$，那么非零值的小波$\psi_{j^{'}k{'}}$被包含在小波$\psi_{jk}$为常数的集合中，这会让上面的积分等于0。

如果$j=j^{'}$但是$k\not=k^{'}$，那么至少乘积中的$\psi_{jk}\cdot\psi_{j^{'}k{'}}$的其中一个因子为0，因此函数$\psi_{jk}$是正交的。

这个常数使得正交基的标准化正交为$2^{\frac{j}{2}}$,事实上：
$$
1=(const)^2\int\psi^2(2^jx-k)dx = (const)^2\cdot2^{-j}\int\psi^2(t)dt = (const)^2\cdot2^{-j}
$$
函数$\psi_{10}\psi_{11}\psi_{20}\psi_{21}\psi_{22}\psi_{23}$在图4中描述，集合$\{\psi_{jk},j\in{Z},k\in{Z}\}$，在$L^2$上定义为一个标准正交基。或者，我们认为正交基的格式为$\{\phi_{j_0k},\psi_{jk},j\geq{j_0},k\in{Z}\}$，其中$\phi_{00}$被称作scaling function，它与小波基$\psi_{jk}$相关联。集合$\{\phi_{j_0k},k\in Z\}$跨越相同的子空间为$\{\psi_{jk},j<j_0,k\in Z\}$,接下来我们会使这个声明更正式和定义$\phi_{jk}$，对于haar小波基scaling function的而言是非常简单的：
$$
\phi_{jk}(x) = 1(0\leq x<1)
$$
统计学家可能对由数据集生成的函数的小波表示感兴趣。

<img src="img/WAVELETS FOR KIDS/image-20210519202109379.png" alt="image-20210519202109379" style="zoom:67%;" />

让 $\bar{y} = (y_0,y_1,...,y_{2^n-1})$ 作为长度为$2^n$的数据向量，数据向量可以与分段常数函数 $f$ 在$[0,1)$区间由$\bar y$生成相关联，如下有：
$$
f(x) = \sum^{2^n-1}_{k=0}y_k\cdot1(k2^{-n}\leq x<(k+1)2^{-n})
$$
这个数据函数$f$显然在$L^2[0,1)$空间，同时，f的小波的分解形式为：
$$
f(x) = c_{00}\phi(x) + \sum^{n-1}_{j=0}\sum^{2^j-1}_{k = 0}d_{jk}\psi_{jk}(x)
$$
关于j的和是有限的，因为f是一个阶跃函数，其中任何都可以用分辨率$(n-1)-st$等级来精确的描述。对于对于每一层，关于k的和也是有限的因为f的定义域是有限的。特别是，缩放函数$\phi_{00}$不需要转换。

我们固定数据向量$\bar y$，明确地找到小波分解(2)，让$\bar y=(1,0,-3,2,1,0,1)$，相应的函数$f$在图5显示，下面的矩阵方程给出了 $\bar y$ 和小波系数之间的联系，注意在相应的分辨率$(j= 0,1\ and \ 2)$上使用Haar小波的常数$2^j (1,\sqrt{2}\ and\ 2)$ 

<img src="img/WAVELETS FOR KIDS/image-20210519215137300.png" alt="image-20210519215137300" style="zoom:67%;" />

<img src="img/WAVELETS FOR KIDS/image-20210519215155207.png" style="zoom:67%;" />

结果为：

![image-20210519215300129](img/WAVELETS FOR KIDS/image-20210519215300129.png)

因此有：
$$
f = \frac{1}{2}\phi- \frac{1}{2}\psi_{00}+\frac{1}{2\sqrt{2}}\psi_{10}-\frac{1}{2\sqrt{2}}\psi_{11}+\frac{1}{4}\psi_{20} - \frac{5}{4}\psi_{21}+\frac{1}{4}\psi_{22} - \frac{1}{4}\psi_{23}
$$
结果很容易检查，例如：当$x\in [0,\frac{1}{8})$
$$
f = \frac{1}{2} - \frac{1}{2}\cdot1 +\frac{1}{2\sqrt{2}}\cdot\sqrt{2} + \frac{1}{4}\cdot2 = 1
$$
读者可能已经准备好了下面的问题：我们将如何处理长度更大的向量$\bar y$，显然，解矩阵方程是不可能的。

#### 2.2 Mallat's multiresolution analysis, filters, and direct and inverse wavelet transformation

Haar小波的一个明显缺点是它不是连续的，因此选择Haar基来表示光滑的函数，例如，是不自然和经济的。

##### 2.2.1 Mallat's MRA

作为一个更一般的框架，我们解释Mallat的多分辨率分析(MRA)。这个MRA是一种构造描述不同小波基的工具。

我们从所有平方可积函数的空间$L^2$开始，MRA是闭合子空间$\{V_j\}_{j\in Z}$的递增序列，近似于$L^2(R)$:

一起都开始于一个对缩放函数 $\phi$ 的聪明的选择，除了基于特征函数$\phi$范围$[0,1)$之间的Haar小波外，这个缩放函数的选择也要满足一些连续性，平滑性和尾部要求。但是，更重要的是，族$\{\phi(x-k),k\in Z\}$ 形式是一个单位正交化是基于引用空间$V_0$。下面的关系描述了分析。

**MRA 1**           $...\subset V_{-1} \subset V_0 \subset V_1 \subset ...$

空间集$V_j$是一个被嵌套的，空间$L^2(R)$ 是一个所有$V_j$并集的闭包。换句话说，$\bigcup_{j\in Z}V_j$在$L^2(R)$中是密集的。所有$V_j$的交集是空的。

**MRA 2** 		$f(x)\in V_j \Leftrightarrow f(2x)\in V_{j+1},j\in Z$

空间$V_j$ 和$V_{j+1}$ 是相似的，如果空间$V_j$ 被 $\phi_{j,k}(x)，k\in Z$ 横跨了，然后空间$V_{j+1}$被 $\phi_{j+1,k}(x)，k\in Z$ 横跨了。则空间$V_{j+1}$ 可以由函数$\phi_{j+1,k}(x) = \sqrt{2}\phi_{j,k}(2x)$来产生。

我们现在解释小波是如何进入图像的，因为$V_0\sub V_1$，在$V_0$中的任何函数都可以写成基于$V_1$中基函数$\sqrt{2}\phi(2x-k)$的线性组合。特别有：
$$
\phi(x) = \sum_kh(k)\sqrt{2}\phi(2x-k)
$$
系数 $h(k)$ 被定义为$<\phi(x),\sqrt2\phi(2x-k)>$。现在考虑正交补集$W_j$（即：$V_{j+1} = V_j \bigoplus W_j$），定义：
$$
\psi(x) = \sqrt{2}\sum_k(-1)^kh(-k+1)\phi(2x-k)
$$
可以证明$\{\sqrt2\psi(2x-k),k\in Z\}$是对于$W_1$的单位正交基。

再次，相同的MRA的属性给出的$\{2^{j/2}\psi(2^jx-k),k\in Z\}$ 是 $W_j$的基函数，因为 $\cup_{j\in Z}V_j = \cup_{j\in Z}W_j$ 在 $L_2(R)$ 中是稠密的，所以整个族 $\{\psi_{j,k}(x) = 2^{j/2}\psi(2^jx-k),k\in Z,k \in Z \}$ 是 $L^2(R)$ 的一组基。

对于给出的函数 $f\in L^2(R)$ 可以找到 N，使得 $f_N\in V_N$ 接近 $f$ 到预先分配好的精度。如果 $g_i\in W_i$ 同时 $f_i\in V_i$ 则：
$$
f_N = f_{N-1}+g_{N-1} = \sum^M_{i=1}g_{N-M}+f_{N-M}
$$
等式(6)为 $f$ 的小波分解。例如，如果使用Haar小波对应的MRA，则数据函数(2.1)在$V_n$中。注意$f \equiv f_n$ 且$f_0 =0$

##### 2.2.2 The language of signal processing

我们在信号处理理论的语言中重复多分辨率分析的故事。Mallat的多分辨率分析与信号处理中所谓的“金字塔”算法有关。此外，**正交镜像滤波器**也隐藏在Mallat的MRA中。

我们回忆一下之前的章节
$$
\phi(x) = \sum_{k\in Z}h(k)\sqrt{2}\phi(2x-k)
$$
又有
$$
\psi(x) = \sum_{k\in Z}g(k)\sqrt{2}\phi(2x-k)
$$
这个 $l^2$ 序列 $\{h(k),k\in Z\}$ 和 $\{g(k),k\in Z\}$ 是一个正交镜像滤波器（QMF）。$h$ 和 $g$ 的联系是:
$$
g(n) = (-1)^nh(1-n)
$$
这个序列 $h(k)$ 被认为是低通或者是低频带过滤器而 $g(k)$ 被认为是高通或者是高频带过滤器。$h(x),g(x)$的下列性质可以用傅里叶变换和正交性证明：$\sum h(k) = \sqrt2,\sum g(k) = 0$





































-------------------

$$
CWT_x^\psi(\tau,s) = \Psi_x^\psi(\tau,s) = \frac{1}{\sqrt{|s|}} \int x(t) \psi^* \left( \frac{t - \tau}{s} \right) dt
$$

如果我们使用一个无限长的窗口，我们得到FT，它给出完美的频率分辨率，但没有时间信息。此外，为了获得平稳性，我们必须有一个足够短的窗口，其中信号是平稳的。窗越窄，时间分辨率越好，平稳性假设越好，但频率分辨率越差

-------

## The Wavelet Theory: A Mathematical Approach

#### Basis Vectors

A **basis** of a vector space **V** is a set of linearly independent vectors, such that any vector **v** in **V** can be written as a linear combination of these basis vectors. There may be more than one basis for a vector space. However, all of them have the same number of vectors, and this number is known as the **dimension** of the vector space. For example in two-dimensional space, the basis will have two vectors.
$$
v = \sum\limits_{k} \nu^k b_k \tag{3.2}
$$
shows how any vector **v** can be written as a linear combination of the basis vectors $\boldsymbol {b_k}$ and the corresponding coefficients $\boldsymbol {\nu^k}$.

This concept, given in terms of vectors, can easily be generalized to functions, by replacing the basis vectors $\boldsymbol {b_k}$ with basis functions $\boldsymbol {\phi_k(t)}$, and the vector **v** with a function **f(t)**. Equation 3.2 then becomes
$$
f(t) = \sum\limits_{k} \mu_k \phi_k (t) \tag{3.2_a}
$$
The complex exponential (sines and cosines) functions are the basis functions for the FT. Furthermore, they are orthogonal functions, which provide some desirable properties for reconstruction.

Let f(t) and g(t) be two functions in $L^2 [a,b]$. ($L^2 [a,b]$ denotes the set of square integrable functions in the interval [a,b]). The inner product of two functions is defined by Equation 3.3:

$$
< f(t), g(t) > = \int_a^b f(t) \cdot g^*(t) dt \tag{3.3}
$$
According to the above definition of the inner product, the CWT can be thought of as the inner product of the test signal with the basis functions $\psi_{\tau ,s}(t)$:
$$
CWT_x^\psi(\tau, s) = \Psi_x^\psi(\tau, s) = \int x(t) \cdot \psi^*_{\tau, s}(t) dt \tag{3.4}
$$
where，
$$
\psi_{\tau, s} = \frac{1}{\sqrt{s}} \psi \left( \frac{t - \tau}{s} \right) \tag{3.5}
$$
This definition of the CWT shows that the wavelet analysis ==is a measure of similarity between the basis functions (wavelets) and the signal itself. Here the similarity is in the sense of similar frequency content==. The calculated CWT coefficients refer to the closeness of the signal to the wavelet **at the current scale** .

This further clarifies the previous discussion on the correlation of the signal with the wavelet at a certain scale. If the signal has a major component of the frequency corresponding to the current scale, then the wavelet (the basis function) at the current scale will be **similar** or **close** to the signal at the particular location where this frequency component occurs. Therefore, the CWT coefficient computed at this point in the time-scale plane will be a relatively large number.

## Inner Products, Orthogonality, and Orthonormality

Two vectors **v** , **w** are said to be **orthogonal** if their inner product equals zero
$$
< v, w > = \sum\limits_{n} v_n w^*_n = 0 \tag{3.6}
$$
Similarly, two functions f and g are said to be orthogonal to each other if their inner product is zero:
$$
< f(t), g(t) > = \int_a^b f(t) \cdot g^*(t) \cdot dt = 0 \tag{3.7}
$$
A set of vectors ${\boldsymbol{v_1, v_2, ....,v_n}} $is said to be **orthonormal** , if they are pairwise orthogonal to each other, and all have length "1". This can be expressed as:
$$
< v_m, v_n > = \delta_{mn} \tag{3.8}
$$
Similarly, a set of functions ${\phi_k(t)}, k=1,2,3,...,$ is said to be orthonormal if
$$
\int_a^b \phi_k(t) \cdot \phi^*_l(t) \cdot dt = 0 \quad k \neq l (\text{ orthogonality cond.}) \tag{3.9}
$$
and
$$
\int_a^b \{ | \phi_k(t) | \}^2 dx = 1 \tag{3.10}
$$
or equivalently
$$
\int_a^b \phi_k(t) \cdot \phi_l^*(t) \cdot dt = \delta_{kl} \tag{3.11}
$$
where, $\delta_{kl} $ is the **Kronecker delta** function, defined as:
$$
\delta_{kl} = \left\{ \begin{array}{ll} 1, & k = l \\ 0, & k \neq l\\ \end{array} \right. \tag{3.12}
$$
As stated above, there may be more than one set of basis functions (or vectors). Among them, the orthonormal basis functions (or vectors) are of particular importance because of the nice properties they provide in finding these analysis coefficients. The orthonormal bases allow computation of these coefficients in a very simple and straightforward way using the orthonormality property.

For orthonormal bases, the coefficients, $\mu_k$, can be calculated as
$$
\mu_k = < f, \phi_k > = \int f(t) \cdot \phi_k^*(t) \cdot dt \tag{3.13}
$$
and the function f(t) can then be reconstructed by Equation 3.2_a by substituting the $\mu_k$ coefficients. This yields
$$
f(t) = \sum\limits_{k} \mu_k \phi_k(t) = \sum\nolimits_{k} < f, \phi_k > \phi_k(t) \tag{3.14}
$$
Orthonormal bases may not be available for every type of application where a generalized version, **biorthogonal** bases can be used. The term "biorthogonal" refers to two different bases which are orthogonal to each other, but each do not form an orthogonal set.

In some applications, however, biorthogonal bases also may not be available in which case frames can be used. Frames constitute an important part of wavelet theory, and interested readers are referred to Kaiser's book mentioned earlier.

Following the same order as in chapter 2 for the STFT, some examples of continuous wavelet transform are presented next. The figures given in the examples were generated by a program written to compute the CWT.

Before we close this section, I would like to include two mother wavelets commonly used in wavelet analysis. The Mexican Hat wavelet is defined as the second derivative of the Gaussian function:
$$
w(t) = \frac{1}{\sqrt{2\pi} \cdot \sigma} e^{\frac{-t^2}{2 \sigma^2}}
\tag{3.15}
$$
which is
$$
\psi(t) = \frac{1}{\sqrt{2 \pi} \cdot \sigma^3} \left( e^{\frac{-t^2}{2 \sigma^2}} \cdot \left( \frac{t^2}{\sigma^2} - 1 \right) \right)\tag{3.16}
$$
The Morlet wavelet is defined as
$$
w(t) = e^{i a t} \cdot e^{-\frac{t^2}{2\sigma}}\tag{3.16_a}
$$
where **a** is a modulation parameter, and **sigma** is the scaling parameter that affects the width of the window.

## The Wavelet Synthesis

The continuous wavelet transform is a reversible transform, provided that Equation 3.18 is satisfied. Fortunately, this is a **very non-restrictive requirement**. The continuous wavelet transform is reversible if Equation 3.18 is satisfied, even though the basis functions are in general may not be orthonormal. The reconstruction is possible by using the following reconstruction formula:
$$
x(t) = \frac{1}{C_\psi^2} \int_s \int_\tau \left[ \Psi^\psi_x(\tau, s) \frac{1}{s^2} \psi \left( \frac{t - \tau}{s} \right) \right] d\tau \cdot ds \tag{3.17}
$$
where $C_\psi$ is a constant that depends on the wavelet used. The success of the reconstruction depends on this constant called, **the admissibility constant** , to satisfy the following **admissibility condition** :
$$
C_\psi = \left\{ 2 \pi \int_{-\infty}^{\infty} \frac{|\hat{\psi}(\xi)|^2}{|\zeta|} d\xi \right\} ^{\frac{1}{2}} < \infty \tag{3.18}
$$
where $\hat{\psi}(\xi)$ is the FT of $\psi(t)$. Equation 3.18 implies that $\hat{\psi}(0) = 0,$ which is
$$
\int \psi(t) \cdot dt = 0 \tag{3.19}
$$
As stated above, Equation 3.19 is not a very restrictive requirement since many wavelet functions can be found whose integral is zero. For Equation 3.19 to be satisfied, the wavelet must be oscillatory.

## Discretization of the Continuous Wavelet Transform: The Wavelet Series

In today's world, computers are used to do most computations (well,...ok... almost all computations). It is apparent that neither the FT, nor the STFT, nor the CWT can be practically computed by using analytical equations, integrals, etc. It is therefore necessary to discretize the transforms. As in the FT and STFT, the most intuitive way of doing this is simply sampling the time-frequency (scale) plane. Again intuitively, sampling the plane with a uniform sampling rate sounds like the most natural choice. However, in the case of WT, the scale change can be used to reduce the sampling rate.

At higher scales (lower frequencies), the sampling rate can be decreased, according to Nyquist's rule. In other words, if the time-scale plane needs to be sampled with a sampling rate of $\boldsymbol{N_1}$ at scale $\boldsymbol{s_1}$, the same plane can be sampled with a sampling rate of $\boldsymbol{N_2}$, at scale $\boldsymbol{s_2}$, where, $\boldsymbol{s_1 < s_2}$ (corresponding to frequencies $\boldsymbol{f_1 > f_2}$ ) and $\boldsymbol{N_2 < N_1}$. The actual relationship between $\boldsymbol{N_1}$ and $\boldsymbol{N_2}$ is
$$
N_2 = \frac{s_1}{s_2} N_1 \tag{3.20}
$$
or
$$
N_2 = \frac{f_2}{f_1} N_1 \tag{3.21}
$$
In other words, at lower frequencies the sampling rate can be decreased which will save a considerable amount of computation time.

It should be noted at this time, however, that the discretization can be done in any way without any restriction as far as the analysis of the signal is concerned. If synthesis is not required, even the Nyquist criteria does not need to be satisfied==. The restrictions on the discretization and the sampling rate become important if, and only if, the signal reconstruction is desired==. Nyquist's sampling rate is the minimum sampling rate that allows the original **continuous time** signal to be reconstructed from its **discrete** samples. The basis vectors that are mentioned earlier are of particular importance for this reason.

As mentioned earlier, the wavelet $\boldsymbol{\psi(\tau,s)}$ satisfying Equation 3.18, allows reconstruction of the signal by Equation 3.17. However, this is true for the continuous transform. The question is: can we still reconstruct the signal if we discretize the time and scale parameters? The answer is "yes", under certain conditions (as they always say in commercials: certain restrictions apply !!!).

The scale parameter s is discretized first on a logarithmic grid. The time parameter is then discretized **with respect to the scale parameter** , i.e., a different sampling rate is used for every scale. In other words, the sampling is done on the **dyadic** sampling grid shown in Figure 3.17 :

think of the area covered by the axes as the entire time-scale plane. The CWT assigns a value to the continuum of points on this plane. Therefore, there are an infinite number of CWT coefficients. First consider the discretization of the scale axis. Among that infinite number of points, only a finite number are taken, using a logarithmic rule. The base of the logarithm depends on the user. The most common value is 2 because of its convenience. If 2 is chosen, only the scales 2, 4, 8, 16, 32, 64,...etc. are computed. If the value was 3, the scales 3, 9, 27, 81, 243,...etc. would have been computed. The time axis is then discretized according to the discretization of the scale axis. Since the discrete scale changes by factors of 2 , the sampling rate is reduced for the time axis by a factor of **2** at every scale.

Note that at the lowest scale (s = 2), only 32 points of the time axis are sampled (for the particular case given in Figure 3.17). At the next scale value, s = 4, the sampling rate of time axis is reduced by a factor of 2 since the scale is increased by a factor of 2, and therefore, only 16 samples are taken. At the next step, s = 8 and 8 samples are taken in time, and so on.

Although it is called the time-scale plane, it is more accurate to call it the **translation-scale** plane, because "time" in the transform domain actually corresponds to the shifting of the wavelet in time. For the wavelet series, the actual time is still continuous.

Similar to the relationship between continuous Fourier transform, Fourier series and the discrete Fourier transform, there is a continuous wavelet transform, a semi-discrete wavelet transform (also known as wavelet series) and a discrete wavelet transform.

Expressing the above discretization procedure in mathematical terms, the scale discretization is $\boldsymbol{s = s_0^j}$, and translation discretization is $\boldsymbol{\tau = k \cdot s_0^j \cdot \tau_0}$ where $\boldsymbol{s_0>1}$ and $\boldsymbol{\tau_0>0}$. Note, how the translation discretization is dependent on scale discretization with $\boldsymbol{s_0}$.

The continuous wavelet function
$$
\psi_{\tau, s} = \frac{1}{\sqrt{s}} \psi \left( \frac{t - \tau}{s} \right)
\tag{3.22}
$$

$$
\psi_{j, k}(t) = s_0^{\frac{-j}{2}} \psi \left( s_0^{-j} - k \tau_0 \right) \tag{3.23}
$$

by inserting $\boldsymbol{s = s_0^{\, j}}$, and $\boldsymbol{\tau = k \cdot s_0^{\, j} \cdot \tau_0}$.

If $\boldsymbol{ \left\{ \psi_{(j, \, k)} \right\} }$ constitutes an orthonormal basis, the wavelet series transform becomes
$$
\Psi^{\psi_{j,k}}_x = \int x(t) \, \psi^*_{j,k}(t) \, dt \tag{3.24}
$$
or
$$
x(t) = c_\psi \sum\limits_{j} \sum\limits_{k} \Psi^{\psi_{j,k}}_x \, \psi_{j,k} (t) \tag{3.25}
$$
A wavelet series requires that $\boldsymbol{ {\psi_{(j, \, k)}} }$ are either orthonormal, biorthogonal, or frame. If $\boldsymbol{ {\psi_{(j,k)}} }$ are not orthonormal, Equation 3.24 becomes
$$
\Psi^{\psi_{j,k}}_x = \int x(t) \, \hat{\psi^*_{(j,k)}(t)} \, dt \tag{3.26}
$$
where $\boldsymbol{\hat{\psi_{j, \, k}^*(t)}}$, is either the **dual biorthogonal basis** or **dual frame** (Note that * denotes the conjugate).

If $\boldsymbol{ \{ \psi_{(j, \, k)} \} }$ are orthonormal or biorthogonal, the transform will be non-redundant, where as if they form a frame, the transform will be redundant. On the other hand, it is much easier to find frames than it is to find orthonormal or biorthogonal bases.

The following analogy may clear this concept. Consider the whole process as looking at a particular object. The human eyes first determine the coarse view which depends on the distance of the eyes to the object. This corresponds to adjusting the scale parameter $\boldsymbol{s_0^{-j}}$. When looking at a very close object, with great detail, **j** is negative and large (low scale, high frequency, analyses the detail in the signal). Moving the head (or eyes) very slowly and with very small increments (of angle, of distance, depending on the object that is being viewed), corresponds to small values of $\boldsymbol{\tau = k \cdot s_0^{\, j} \cdot \tau_0}$. Note that when **j** is negative and large, it corresponds to small changes in time, $\boldsymbol{\tau}$, (high sampling rate) and large changes in $\boldsymbol{s_0^{\, j}}$ (low scale, high frequencies, where the sampling rate is high). The scale parameter can be thought of as magnification too.

How low can the sampling rate be and still allow reconstruction of the signal? This is the main question to be answered to optimize the procedure. The most convenient value (in terms of programming) is found to be "2" for $s_0$ and "1" for $\tau$. Obviously, when the sampling rate is forced to be as low as possible, the number of available orthonormal wavelets is also reduced.

The continuous wavelet transform examples that were given in this chapter were actually the wavelet series of the given signals. The parameters were chosen depending on the signal. Since the reconstruction was not needed, the sampling rates were sometimes far below the critical value where $s_0$ varied from 2 to 10, and $\tau_0$ varied from 2 to 8, for different examples.

This concludes Part III of this tutorial. I hope you now have a basic understanding of what the wavelet transform is all about. There is one thing left to be discussed however. Even though the discretized wavelet transform can be computed on a computer, this computation may take anywhere from a couple seconds to couple hours depending on your signal size and the resolution you want. An amazingly fast algorithm is actually available to compute the wavelet transform of a signal. The discrete wavelet transform (DWT) is introduced in the final chapter of this tutorial, in Part IV.

Let's meet at the grand finale, shall we?

## Multiresolution Analysis: The Discrete Wavelet Transform

The main idea is the same as it is in the CWT. A time-scale representation of a digital signal is obtained using digital filtering techniques. Recall that the CWT is a correlation between a wavelet at different scales and the signal with the scale (or the frequency) being used as a measure of similarity. The continuous wavelet transform was computed by changing the scale of the analysis window, shifting the window in time, multiplying by the signal, and integrating over all times. In the discrete case, filters of different cutoff frequencies are used to analyze the signal at different scales. The signal is passed through a series of high pass filters to analyze the high frequencies, and it is passed through a series of low pass filters to analyze the low frequencies.

The resolution of the signal, which is a measure of the amount of detail information in the signal, is changed by the filtering operations, and the scale is changed by upsampling and downsampling (subsampling) operations. Subsampling a signal corresponds to reducing the sampling rate, or removing some of the samples of the signal. For example, subsampling by two refers to dropping every other sample of the signal. Subsampling by a factor n reduces the number of samples in the signal n times.

Upsampling a signal corresponds to increasing the sampling rate of a signal by adding new samples to the signal. For example, upsampling by two refers to adding a new sample, usually a zero or an interpolated value, between every two samples of the signal. Upsampling a signal by a factor of n increases the number of samples in the signal by a factor of n.

Although it is not the only possible choice, DWT coefficients are usually sampled from the CWT on a dyadic grid, i.e., $s_0 = 2$ and $t_0 = 1$, yielding $s = 2^{\, j}$ and $t = k \cdot 2^{\, j}$, as described in Part 3. Since the signal is a discrete time function, the terms function and sequence will be used interchangeably in the following discussion. This sequence will be denoted by $x[n]$, where n is an integer.

The procedure starts with passing this signal (sequence) through a half band digital lowpass filter with impulse response $h[n]$. Filtering a signal corresponds to the mathematical operation of convolution of the signal with the impulse response of the filter. The convolution operation in discrete time is defined as follows:
$$
x[n] * h[n] = \sum\limits_{k = -\infty}^\infty x[k] \cdot h[n - k] \tag{4.1}
$$
A half band lowpass filter removes all frequencies that are above half of the highest frequency in the signal. For example, if a signal has a maximum of 1000 Hz component, then half band lowpass filtering removes all the frequencies above 500 Hz.

The unit of frequency is of particular importance at this time. In discrete signals, frequency is expressed in terms of radians. Accordingly, the sampling frequency of the signal is equal to 2p radians in terms of radial frequency. Therefore, the highest frequency component that exists in a signal will be p radians, if the signal is sampled at Nyquist's rate (which is twice the maximum frequency that exists in the signal); that is, the Nyquist's rate corresponds to p rad/s in the discrete frequency domain. Therefore using Hz is not appropriate for discrete signals. However, Hz is used whenever it is needed to clarify a discussion, since it is very common to think of frequency in terms of Hz. It should always be remembered that the unit of frequency for discrete time signals is radians.

After passing the signal through a half band lowpass filter, half of the samples can be eliminated according to the Nyquist's rule, since the signal now has a highest frequency of $\frac{p}{2}  $ radians instead of p radians. Simply discarding every other sample will **subsample** the signal by two, and the signal will then have half the number of points. The scale of the signal is now doubled. Note that the lowpass filtering removes the high frequency information, but leaves the scale unchanged. Only the subsampling process changes the scale. Resolution, on the other hand, is related to the amount of information in the signal, and therefore, it is affected by the filtering operations. Half band lowpass filtering removes half of the frequencies, which can be interpreted as losing half of the information. Therefore, the resolution is halved after the filtering operation. Note, however, the subsampling operation after filtering does not affect the resolution, since removing half of the spectral components from the signal makes half the number of samples redundant anyway. Half the samples can be discarded without any loss of information. In summary, the lowpass filtering halves the resolution, but leaves the scale unchanged. The signal is then subsampled by 2 since half of the number of samples are redundant. This doubles the scale.

This procedure can mathematically be expressed as
$$
y[n] = \sum\limits_{k = -\infty}^\infty h[k] \cdot x[2n - k] \tag{4.2}
$$
Having said that, we now look how the DWT is actually computed: The DWT analyzes the signal at different frequency bands with different resolutions by decomposing the signal into a coarse approximation and detail information. DWT employs two sets of functions, called scaling functions and wavelet functions, which are associated with low pass and highpass filters, respectively. The decomposition of the signal into different frequency bands is simply obtained by successive highpass and lowpass filtering of the time domain signal. The original signal $x[n]$ is first passed through a halfband highpass filter $g[n]$ and a lowpass filter $h[n]$. After the filtering, half of the samples can be eliminated according to the Nyquist's rule, since the signal now has a highest frequency of $\frac{p}{2} $ radians instead of p . The signal can therefore be subsampled by 2, simply by discarding every other sample. This constitutes one level of decomposition and can mathematically be expressed as follows:
$$
y_{high}[k] = \sum\limits_{n} x[n] \cdot g[2k - n]\\

y_{low}[k] = \sum\limits_{n} x[n] \cdot h[2k - n] \tag{4.3}
$$
where $y_{high}[k]$ and $y_{low}[k]$ are the outputs of the highpass and lowpass filters, respectively, after subsampling by 2.

This decomposition halves the time resolution since only half the number of samples now characterizes the entire signal. However, this operation doubles the frequency resolution, since the frequency band of the signal now spans only half the previous frequency band, effectively reducing the uncertainty in the frequency by half. The above procedure, which is also known as the subband coding, can be repeated for further decomposition. At every level, the filtering and subsampling will result in half the number of samples (and hence half the time resolution) and half the frequency band spanned (and hence double the frequency resolution). Figure 4.1 illustrates this procedure, where $x[n]$ is the original signal to be decomposed, and $h[n]$ and $g[n]$ are lowpass and highpass filters, respectively. The bandwidth of the signal at every level is marked on the figure as "f".

<img src="img/WAVELETS FOR KIDS/image-20210618104316150.png" alt="image-20210618104316150" style="zoom:67%;" />

As an example, suppose that the original signal x[n] has 512 sample points, spanning a frequency band of zero to p rad/s. At the first decomposition level, the signal is passed through the highpass and lowpass filters, followed by subsampling by 2. The output of the highpass filter has 256 points (hence half the time resolution), but it only spans the frequencies $\frac{p}{2}$ to p rad/s (hence double the frequency resolution). These 256 samples constitute the first level of DWT coefficients. The output of the lowpass filter also has 256 samples, but it spans the other half of the frequency band, frequencies from 0 to $\frac{p}{2}$ rad/s. This signal is then passed through the same lowpass and highpass filters for further decomposition. The output of the second lowpass filter followed by subsampling has 128 samples spanning a frequency band of 0 to $\frac{p}{4}$ rad/s, and the output of the second highpass filter followed by subsampling has 128 samples spanning a frequency band of $\frac{p}{4}$ to $\frac{p}{2}$ rad/s. The second highpass filtered signal constitutes the second level of DWT coefficients. This signal has half the time resolution, but twice the frequency resolution of the first level signal. In other words, time resolution has decreased by a factor of 4, and frequency resolution has increased by a factor of 4 compared to the original signal. The lowpass filter output is then filtered once again for further decomposition. This process continues until two samples are left. For this specific example there would be 8 levels of decomposition, each having half the number of samples of the previous level. The DWT of the original signal is then obtained by concatenating all coefficients starting from the last level of decomposition (remaining two samples, in this case). The DWT will then have the same number of coefficients as the original signal.

The frequencies that are most prominent in the original signal will appear as high amplitudes in that region of the DWT signal that includes those particular frequencies. The difference of this transform from the Fourier transform is that the time localization of these frequencies will not be lost. However, the time localization will have a resolution that depends on which level they appear. If the main information of the signal lies in the high frequencies, as happens most often, the time localization of these frequencies will be more precise, since they are characterized by more number of samples. If the main information lies only at very low frequencies, the time localization will not be very precise, since few samples are used to express signal at these frequencies. This procedure in effect offers a good time resolution at high frequencies, and good frequency resolution at low frequencies. Most practical signals encountered are of this type.

The frequency bands that are not very prominent in the original signal will have very low amplitudes, and that part of the DWT signal can be discarded without any major loss of information, allowing data reduction. Figure 4.2 illustrates an example of how DWT signals look like and how data reduction is provided. Figure 4.2_a shows a typical 512-sample signal that is normalized to unit amplitude. The horizontal axis is the number of samples, whereas the vertical axis is the normalized amplitude. Figure 4.2_b shows the 8 level DWT of the signal in Figure 4.2_a. The last 256 samples in this signal correspond to the highest frequency band in the signal, the previous 128 samples correspond to the second highest frequency band and so on. It should be noted that only the first 64 samples, which correspond to lower frequencies of the analysis, carry relevant information and the rest of this signal has virtually no information. Therefore, all but the first 64 samples can be discarded without any loss of information. This is how DWT provides a very effective data reduction scheme.

<img src="img/WAVELETS FOR KIDS/image-20210618105000297.png" alt="image-20210618105000297" style="zoom: 80%;" />



We will revisit this example, since it provides important insight to how DWT should be interpreted. Before that, however, we need to conclude our mathematical analysis of the DWT.

One important property of the discrete wavelet transform is the relationship between the impulse responses of the highpass and lowpass filters. The highpass and lowpass filters are not independent of each other, and they are related by
$$
g[L - 1 - n] = (-1)^n \cdot h[n]\tag{4.4}
$$
where $g[n]$ is the highpass, $h[n]$ is the lowpass filter, and $L$ is the filter length (in number of points). Note that the two filters are odd index alternated reversed versions of each other. Lowpass to highpass conversion is provided by the $(-1)^n$ term. Filters satisfying this condition are commonly used in signal processing, and they are known as the Quadrature Mirror Filters (QMF). The two filtering and subsampling operations can be expressed by
$$
y_{high}[k] = \sum\limits_{n} x[n] \cdot g[-n + 2k]\\

y_{low}[k] = \sum\limits_{n} x[n] \cdot h[-n + 2k]\tag{4.5}
$$
The reconstruction in this case is very easy since halfband filters form orthonormal bases. The above procedure is followed in reverse order for the reconstruction. The signals at every level are upsampled by two, passed through the synthesis filters g[n], and h[n] (highpass and lowpass, respectively), and then added. The interesting point here is that the analysis and synthesis filters are identical to each other, except for a time reversal. Therefore, the reconstruction formula becomes (for each layer)
$$
x[n] = \sum\limits_{k = -\infty}^\infty \left( \, y_{high}[k] \cdot g[-n + 2k] \, \right) + \left( \, y_{low}[k] \cdot h[-n + 2k] \, \right)\tag{4.6}
$$
However, if the filters are not ideal halfband, then perfect reconstruction cannot be achieved. Although it is not possible to realize ideal filters, under certain conditions it is possible to find filters that provide perfect reconstruction. The most famous ones are the ones developed by Ingrid Daubechies, and they are known as Daubechies' wavelets.

Note that due to successive subsampling by 2, the signal length must be a power of 2, or at least a multiple of power of 2, in order this scheme to be efficient. The length of the signal determines the number of levels that the signal can be decomposed to. For example, if the signal length is 1024, ten levels of decomposition are possible.

Interpreting the DWT coefficients can sometimes be rather difficult because the way DWT coefficients are presented is rather peculiar. To make a real long story real short, DWT coefficients of each level are concatenated, starting with the last level. An example is in order to make this concept clear:

Suppose we have a 256-sample long signal sampled at 10 MHZ and we wish to obtain its DWT coefficients. Since the signal is sampled at 10 MHz, the highest frequency component that exists in the signal is 5 MHz. At the first level, the signal is passed through the lowpass filter h[n], and the highpass filter g[n], the outputs of which are subsampled by two. The highpass filter output is the first level DWT coefficients. There are 128 of them, and they represent the signal in the [2.5 5] MHz range. These 128 samples are the last 128 samples plotted. The lowpass filter output, which also has 128 samples, but spanning the frequency band of [0 2.5] MHz, are further decomposed by passing them through the same h[n] and g[n]. The output of the second highpass filter is the level 2 DWT coefficients and these 64 samples precede the 128 level 1 coefficients in the plot. The output of the second lowpass filter is further decomposed, once again by passing it through the filters h[n] and g[n]. The output of the third highpass filter is the level 3 DWT coefficiets. These 32 samples precede the level 2 DWT coefficients in the plot.

The procedure continues until only 1 DWT coefficient can be computed at level 9. This one coefficient is the first to be plotted in the DWT plot. This is followed by 2 level 8 coefficients, 4 level 7 coefficients, 8 level 6 coefficients, 16 level 5 coefficients, 32 level 4 coefficients, 64 level 3 coefficients, 128 level 2 coefficients and finally 256 level 1 coefficients. Note that less and less number of samples is used at lower frequencies, therefore, the time resolution decreases as frequency decreases, but since the frequency interval also decreases at low frequencies, the frequency resolution increases. Obviously, the first few coefficients would not carry a whole lot of information, simply due to greatly reduced time resolution. To illustrate this richly bizarre DWT representation let us take a look at a real world signal. Our original signal is a 256-sample long ultrasonic signal, which was sampled at 25 MHz. This signal was originally generated by using a 2.25 MHz transducer, therefore the main spectral component of the signal is at 2.25 MHz. The last 128 samples correspond to [6.25 12.5] MHz range. As seen from the plot, no information is available here, hence these samples can be discarded without any loss of information. The preceding 64 samples represent the signal in the [3.12 6.25] MHz range, which also does not carry any significant information. The little glitches probably correspond to the high frequency noise in the signal. The preceding 32 samples represent the signal in the [1.5 3.1] MHz range. As you can see, the majority of the signal's energy is focused in these 32 samples, as we expected to see. The previous 16 samples correspond to [0.75 1.5] MHz and the peaks that are seen at this level probably represent the lower frequency envelope of the signal. The previous samples probably do not carry any other significant information. It is safe to say that we can get by with the 3rd and 4th level coefficients, that is we can represent this 256 sample long signal with 16+32=48 samples, a significant data reduction which would make your computer quite happy.

One area that has benefited the most from this particular property of the wavelet transforms is image processing. As you may well know, images, particularly high-resolution images, claim a lot of disk space. As a matter of fact, if this tutorial is taking a long time to download, that is mostly because of the images. DWT can be used to reduce the image size without losing much of the resolution. Here is how:

For a given image, you can compute the DWT of, say each row, and discard all values in the DWT that are less then a certain threshold. We then save only those DWT coefficients that are above the threshold for each row, and when we need to reconstruct the original image, we simply pad each row with as many zeros as the number of discarded coefficients, and use the inverse DWT to reconstruct each row of the original image. We can also analyze the image at different frequency bands, and reconstruct the original image by using only the coefficients that are of a particular band. I will try to put sample images hopefully soon, to illustrate this point.

Another issue that is receiving more and more attention is carrying out the decomposition (subband coding) not only on the lowpass side but on both sides. In other words, zooming into both low and high frequency bands of the signal separately. This can be visualized as having both sides of the tree structure of Figure 4.1. What result is what is known as the wavelet packages. We will not discuss wavelet packages in this here, since it is beyond the scope of this tutorial. Anyone who is interested in wavelet packages, or more information on DWT can find this information in any of the numerous texts available in the market.

And this concludes our mini series of wavelet tutorial. If I could be of any assistance to anyone struggling to understand the wavelets, I would consider the time and the effort that went into this tutorial well spent. I would like to remind that this tutorial is neither a complete nor a through coverage of the wavelet transforms. It is merely an overview of the concept of wavelets and it was intended to serve as a first reference for those who find the available texts on wavelets rather complicated. There might be many structural and/or technical mistakes, and I would appreciate if you could point those out to me. Your feedback is of utmost importance for the success of this tutorial.

Thank you very much for your interest in The Wavelet Tutorial .































































