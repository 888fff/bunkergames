# Fluid Simulation for Computer Graphics

## 流体等式

$$
\frac{\partial \vec u}{\partial t } + \vec u \cdot \nabla\vec u + \frac 1\rho\nabla p = \vec g + \nu\nabla\cdot\nabla\vec u\\
\nabla\cdot\vec u = 0
$$

其中，$\vec u$代表一个3D的速度$(u,v,w)$，就好像用$\vec x$代表一个3D中的位置一样$(x,y,z)$.

$\rho$代表流体的密度，例如立方米的水和空气的密度就是$1000kg/m^3 : 1.3kg/m^3$大约是$700:1$。

$p$代表**压力**，是单位区域上流体施加的力。

$\vec g$就是我们熟知的重力$(0,-9.81,0)$，在这个系统中，我们以XZ为横平面，Y为垂直方向。而且这个力也被称作body force。因为它作用于液体整体。

$\nu$为运动学黏度（kinematic viscosity），可以理解为它是液体抵抗变形的程度。

## 动量等式

**上述的第一个等式，是三合一的向量等式，被称作动量等式(momentum equation)。**

**上述的第二个等式，是叫做不可压缩条件(incompressibility condition)**

把模拟的流体想成是一个粒子系统，其中每一个粒子都有一个质量m，一个体积V，一个速度$\vec u$，整体看这个系统在同一时间向前，我们需要知道，每一个粒子的：$\vec F = m\vec a$。
$$
\vec a \equiv \frac{D\vec u}{Dt}
$$
其中大写D的导数标记被称作**材质导数（material derivative）**，所以牛顿法则就变成：
$$
m \frac{D\vec u}{Dt} = \vec F
$$
最简单的就是$m\vec g$这个力，其次我们还要考虑粒子间的相互作用力。注意，此处我们关心的是净力(net force)，虽然上方的压力区域在压着下方的压力区域，但是，净力为0，压力没有产生加速度。我们会关心一侧的压力大于另一边，从而使其不平衡(imbalance)。我们有一个针对每个粒子的位置可以测量到的不平衡的力，即负的压力梯度 $-\nabla p$。我们要积分整个液体体积V内所有的压力，此时我们要认为液体是不可压缩的。

另一个流体的力是由粘稠度产生的，我们先直觉的的理解到力尝试让我们的粒子以周围粒子的平均速度移动，换句话说，就是尝试要使其和周围的速度差最小化。我们在某些领域用测量一个量与平均值的距离的微分算子是拉普拉斯算子 $\nabla\cdot\nabla$，这会给我们提供一个黏着力，我们在积分整个体积的时候，我们会用到动态黏着度因子(dynamic viscosity coefficient)，我们会用$\mu$来表示（之前的运动学的粘稠度会被加速度取代），把他们放在一起，就有了液体中一滴水的流动：
$$
m\frac{D\vec u}{Dt} = m\vec g-V\nabla p + V\mu\nabla\cdot\nabla\vec u
$$

[^Laplacian]: 拉普拉斯算子被理解为是梯度的散度，它有时会写成$\nabla^2$或者$\Delta$，但在文中强烈建议写成$\nabla\cdot\nabla$

对于粒子来说，一滴水中的粒子数趋近于无穷，它的体积会趋近于0。我们称之为**连续介质模型(continuum model)**，由于这个限制，我们等式除以V，得到：($m/V=\rho\text{ 液体的密度}$)
$$
\rho\frac{D\vec u}{Dt} = \rho\vec g - \nabla p + \mu\nabla\cdot\nabla\vec u
$$
我们除以$\rho$，整理等式有：
$$
\frac{D\vec u}{Dt}+\frac1\rho\nabla p  = \vec g + \frac{\mu}{\rho}\nabla\cdot\nabla\vec u
$$
我们再用运动学的粘稠度 $\nu = \mu / \rho$得到：
$$
\frac{D\vec u}{Dt}+\frac1\rho\nabla p  = \vec g + \nu\nabla\cdot\nabla\vec u
$$
其中材质微分$D/Dt$对计算机图形学来说非常重要，还会解决一些数值方程。但是我们要理解这个材质微分是什么，就要从拉格朗日和欧拉不同的视角理解入手了。



## 拉格朗日和欧拉的视角

当我们去考虑一个连续介质（如流体和变形实体），我们可以从拉格朗日和欧拉两个视角上用方法来跟踪运动。

拉格朗日的方法是会把连续介质当成一个粒子系统，每个粒子拥有速度$\vec u$和位置$\vec x$，实体几乎也可以用此方法模拟，那些离散的粒子集合通常会连接成一个网格。

欧拉方法是会观察空间中一些固定的点，然后会去测量液体的量，例如：密度，速度，温度等等。即当液体流过这些点时贡献出的那一点点变化。

在数值上，拉格朗日和粒子系统比较一致，无论是否可以用网格(mesh)连接这些粒子；欧拉则与流体穿过空间中固定网格(grid)的数值一致。

看上去欧拉的方法是不必要且复杂的，为什么不直接使用拉格朗日的粒子系统呢？有一些方案例如涡流和SPH会这么做，但是，这些也是依赖于流体中力的欧拉微分等式，我们坚持使用欧拉方法的2个原因：

- 更容易的去分析空间中的微分：例如压力梯度和粘稠度
- 在数值上，相比一大群移动的粒子，更容易去近似得到固定的欧拉网格的值。

而连接两个方法的关键就是这个材质导数。先从拉格朗日的描述中：粒子有位置和速度，我们考虑到一个一般量$q$(可以是密度，速递，温度或是其他什么)，每个粒子都有$q$值。有函数 $q(t,\vec x)$会告诉我们在t时刻，粒子在$\vec x$位置上时$q$的值。当这个函数在空间中时，这就是一个欧拉变量，不再是粒子的。那么$q$的变化速度，对于粒子在位置$\vec x(t)$是多快？我们可以用一个全微分：
$$
\begin{array}{1}
\frac d{dt}q(t,\vec x(t)) &=& \frac{\partial q}{\partial t} + \nabla q\cdot\frac{d\vec x}{dt}\\
&=&\frac{\partial q}{\partial t} + \nabla q\cdot\vec u \\
&\equiv& \frac{Dq}{Dt}
\end{array}
$$
这就是材质导数。

让我们回顾一下这个材质导数的两个部分。第一个是$\partial q/\partial t$ 表示q 在空间固定点的变化快慢，第二个部分是$\nabla q\cdot\vec u$ 是修正由于流体流过时的偏差而导致的变化的改变。（例如：温度的改变是因为热空气被冷空气取代，而不是因为分子的温度变化了）

我们把这个材质导数写全，则它的所有的偏微分为：
$$
\frac{Dq}{Dt} = \frac{\partial q}{\partial t}+u\frac{\partial q}{\partial x}+v\frac{\partial q}{\partial y} +w\frac{\partial q}{\partial z}
$$
在2D中观察，我们可以消除掉 w- 和 z- 的部分。

我们一直讨论的无论是指分子还说粒子的量，他们移动时的速度场$\vec u$ ，被称作**水平对流(advection)**，这个对流等式就是用到了一个材质导数，它最简单的情况就是设置为0。
$$
\begin{array}{r}
\frac {Dq}{Dt} = 0&,&\\
i.e.,\frac{\partial q}{\partial t} + \vec u\cdot\nabla q = 0&.&
\end{array}
$$

#### 一个案例

我们用T来表示温度代替q，在某一时刻，温度可以表示为：$T(x) = 10x$ 。这就是，在原点的时候是冰点，而随着我们向右侧走，温度在上升，例如：x = 10的时候温度为100。我们会说，有一个风速为c的稳定风在吹，换句话说，就是流体的速度在任何地方的速度都为c有$\vec u = c$

我们假设每一个温度的粒子是不变的，他们仅仅是移动。所以有材质导数，在拉格朗日视角下，有：
$$
\frac{DT}{Dt} = 0
$$
我们展开这个式子有：
$$
\frac{\partial T}{\partial t} + \nabla T\cdot\vec u = 0\\
\frac{\partial T}{\partial t} + 10\cdot c = 0\\
\Rightarrow \frac{\partial T}{\partial t} = -10c
$$

#### Advecting Vector Quantities

一个困惑是，材质导数如果应用在一个向量上，意味着什么。例如：RGB颜色，向量域速度$\vec u$本身。简单的回答就是分别对待其中每一个分量。首先有颜色向量 $\vec C = (R,G,B):$
$$
\frac{D\vec C}{Dt}=\begin{bmatrix} {DR/Dt}\\{DG/Dt\\{DB/Dt}}\end{bmatrix} = \begin{bmatrix} {\partial R/\partial t+\vec u\cdot\nabla R}\\{\partial G/\partial t+\vec u\cdot\nabla G}\\{\partial B/\partial t+\vec u\cdot\nabla B}\end{bmatrix} = \frac{\partial\vec C}{\partial t}+\vec u\cdot\nabla\vec C
$$

## 不可压缩性

压缩流动的模拟是非常复杂且代价昂贵的（如：音爆和爆炸气浪）

> 从艺术表现，感知程度，经济成本的角度去看，上面的这些情况的表现力的酷炫比要真实模拟他们更有意义。

我们在一个时刻去取流体中的一块来观察。我们称作这个体积为 $\Omega$ ,同时它的边界表面为 $\partial\Omega$。我们可以通过对流体在边界上速度的法向分量积分来测量流体体积的变化速度
$$
\frac d{dt}volume(\Omega) = \iint_{\partial\Omega}\vec u\cdot\hat n
$$


如果表面是切线运动的，则并不会影响体积。如果运动方向是向外或向内，相应的体积就会增加或减少。对于一个不可压缩的液体，体积是保持恒定的，也就是变化率为0。
$$
\iint_{\partial\Omega}\vec u\cdot\hat n = 0
$$
我们可以利用散度定理将它变为体积积分。如果你对一个函数的导数积分，你会得到原始函数在积分限处的值。在这个案例中有：
$$
\iiint_\Omega\nabla\cdot\vec u = \iint_{\partial\Omega}\vec u\cdot\hat n = 0
$$
这里有个神奇的地方，这个等式在取流体中任意区域的时候都是成立的。唯一的连续函数是0本身，这个函数与积分区域无关且积分到0(integrates to zero)。这个被积函数应该处处为0。
$$
\nabla\cdot\vec u = 0
$$
这个就是不可压缩的条件。满足不可压缩条件的向量域被称作无散度场，原因显然易见。模拟不可压缩流体的一个棘手的部分是确保速度场保持无发散。这就是压强的作用。考虑压强的方法是，这正是保持速度不发散所需要的力。

压强会在动量方程中体现，我们想把它和速度的散度联系起来。因此，我们取动量方程两边的散度：
$$
\nabla\cdot\frac{\partial\vec u}{\partial t}+\nabla\cdot(\vec u \cdot \nabla\vec u) + \nabla\cdot\frac 1\rho\nabla p = \nabla\cdot(\vec g + \nu\nabla\cdot\nabla\vec u)
$$
我们可以更换第一部分的微分顺序：
$$
\frac {\partial}{\partial t}\nabla\cdot\vec u
$$
如果要保持不可压缩条件，它最好为0，我们则可以梳理等式得到：
$$
 \nabla\cdot\frac 1\rho\nabla p = \nabla(-\vec u\cdot\nabla\vec u + \vec g + \nu\nabla\cdot\nabla\vec u)
$$
这和我们的数值模拟没有太大关系，但值得一看，因为我们会经历几乎完全相同的步骤，当我们离散时，从观察体积变化到压强方程的速度。

## Dropping Viscosity

## 边界条件

我们关注两个边界条件，实体墙和自由表面。

最简单的术语解释边界时的速度：流体最好不要流入实体内也从远离实体，因此速度的法向分量必须为零：
$$
\vec u\cdot \hat n = 0
$$
当实体也在移动的时候，情况就变得复杂了。通常我们需要速度的法向分量匹配实体速度的法向分量，这样，他们的相对速度为0：
$$
\vec u\cdot \hat n = 0 = \vec u_{solid}\cdot \hat n
$$
等式中 $\hat n$ 就是固体边界的法线，这个常被称作不粘的(no-stick)条件。我们只限制了速度的法向分量，允许流体沿切线方向自由滑动。需要记住的重要一点：流体的切向速度可能与固体的切向速度完全没有关系。粘性和无粘性条件只在固体周围的极薄的边界层中可见。

另一个我们感兴趣的边界条件是在自由曲面上。这是我们停止模拟流体的地方。自由曲面是 $p = 0$ 的曲面，我们不以任何特定的方式控制速度

# Overview of Numerical Simulation

我们要用计算机离散它们来数值模拟流体，我们无法涉及到这个领域的每个细节，而是将重点放在一些行之有效的图形处理方法上。

## splitting

 

