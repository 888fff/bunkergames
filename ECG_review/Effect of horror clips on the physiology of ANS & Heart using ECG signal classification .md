## Effect of horror clips on the physiology of ANS & Heart using ECG signal classification 

2014 International Conference on Control, Instrumentation, Communication and Computational Technologies (ICCICCT）

#### 摘要

本研究报道了恐怖电影剪辑对志愿者自主神经系统(ANS)和心脏传导通路生理的影响。这些志愿者的年龄为21-23岁，属于多民族文化。恐怖短片被用来调节志愿者的情绪状态。利用心率变异性(HRV)特征对ANS的生理学进行无创研究。利用心电特征和小波处理的心电信号监测传导通路的生理变化。HRV特征提示副交感神经在刺激后占优势。使用非线性分类器时，发现时域特征有显著差异。基于神经网络的自动分类建议>的分类效率为80%

#### INTRODUCTION

一个简单的非侵入性研究方法通过分析获得的心率变异性(HRV)特性的心电图(ECG)信号。心电信号是指由心血管肌肉产生的电位，可以用表面电极记录。它提供心脏生理活动的信息。心脏的窦房结受窦房结支配，窦房结通过控制心脏跳动来帮助调节心脏活动。由于这种控制机制，有一种节奏与节奏的变化。这种节拍间变化的现象被认为是HRV。

本研究试图研究观看恐怖电影对ANS和心脏传导通路的影响。采用t检验、CART、BT (Booster Tree)和RF (Random Forest)来找出重要的特征，然后使用自动神经网络(ANN)进行概率分类。采用STATISTICA 7软件进行分类研究。

#### METHODS 

本研究采用自行研制的心电信号采集系统记录20例21 ~ 23岁健康青年男性的心电信号。为保持记录的均匀性，在晚上9点-11点，晚餐后半小时，记录5分钟的心电信号。记录信号的HRV特征使用Biomedical Workbench-2012(美国国家仪器公司)软件的试用版本来确定。利用LABVIEW程序计算心电信号的统计特征(5秒持续时间)和d7+d8小波系数(db06)(5秒持续时间)。

<img src="img/Effect of horror clips on the physiology of ANS & Heart using ECG signal classification /image-20210508161348615.png" alt="image-20210508161348615" style="zoom:67%;" />

在STATISTICA软件中对HRV特征和时域心电信号的统计特征进行分类，采用线性(t检验)和非线性(CART和boosting树(BT)分类)统计分析，确定重要特征[1]。从线性和非线性统计分析中获得的重要特征被输入人工神经网络，并使用不同的MLP和RBF模型确定分类效率。

<img src="img/Effect of horror clips on the physiology of ANS & Heart using ECG signal classification /image-20210508161423100.png" alt="image-20210508161423100" style="zoom:67%;" />

#### RESULTS AND DISCUSSIONS 

这项研究是在20名健康的志愿者中进行的。志愿者的年龄、体重、身高汇总已列于表1。所有的志愿者都是来自印度鲁尔克拉国立理工学院的学生，来自印度不同的民族。志愿者被建议以放松的姿势坐在垫子上。这段视频是在一台笔记本电脑上播放的，并保持两英尺的距离。笔记本电脑的声音端口连接到扬声器。在记录刺激的心电图信号时，房间的灯都被关掉了。志愿者在播放恐怖电影5分钟前和5分钟后分别记录心电图信号。

###### Classification based on HRV features: 

HRV特征通过生物医学启动试剂盒(美国国家仪器)记录的心电信号计算。这些特征随后被列在统计表中。使用t检验(独立，按组)对特征进行线性分类。在35个特征中，9个特征的差异具有统计学意义。

从线性和非线性分类器中获得的重要特征以不同的组合作为输入，用于基于神经网络的分类。在模式识别过程中，一般首选RBF算法

######  Time domain classification of the ECG signals ：

时域统计特征从心电信号计算(5秒)。特征t检验显示，特征间无显著性差异。CART分析显示，算术平均值(AM)、总和(SUM)和能量密度(ED)是分类过程中重要的预测因子。Shannon熵(SE)是重要的预测因子。均方根(RMS)、总和(SUM)和对数能量(LE)是随机森林的重要预测因子。重要的预测因素已列在表6中。这些特征被用在不同的组合中作为神经网络分类的输入。结果表明，以SUM和RMS作为输入特征时，RBF算法的效率为90.00 %(表7)。另一方面，当使用SUM和ED作为输入特征时，MLP算法的效率为82.50%(表8)。

时域分析结果表明，在播放恐怖电影时，心脏的心电图特征有明显的变化。当使用线性分类器时，变化不是很明显。但当使用非线性分类器时，变化是可以预测的。

#### CONCLUSION 

本研究旨在了解恐怖电影片段对ANS和心脏电传导通路的影响。结果表明，志愿者在看完电影剪辑后，心率有所下降。心率的下降并不明显。HRV特征分析表明，刺激后副交感神经系统占优势。时域特征分析表明，在传导通路生理上发生了变化。线性分类器(t检验)没有检测到这些变化，但使用非线性分类器可以检测到。基于神经网络的HRV分类和时域特征的分类效率为> 80%，这是诊断心电信号[11]的推荐灵敏度