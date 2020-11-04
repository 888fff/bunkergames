# E4 Data Streaming Packets

### Streaming Data Format

```
<STREAM_TYPE>  <TIMESTAMP>  <DATA>

Example:
	E4_Gsr 123345627891.123 3.129
```

### Data Streams

- E4_Acc - 三轴的加速度
- E4_Bvp - 血容量脉冲
- E4_Gsr - 皮肤电反应
- E4_Temp - 皮肤温度
- E4_Ibi - 心搏间期
- E4_Hr - 心跳
- E4_Battery - 设备电池
- E4_Tag - Tag taken from the device (by pressing the button)

### Timestamp

样本的时间戳，以秒为单位，定义为从收到样本到参考日期(GMT 1970年1月1日)之间的时间间隔。该值小数部分表示微秒。

示例时间戳是根据E4流服务器接收到的第一个包计算的。在接收到第一个包时，系统时间戳被记录，并且第一个和任何其他包的样本时间戳被计算从参考时间戳和相应流的样本频率。

由于当BTLE连接建立时E4开始流，即使没有任何TCP客户端订阅流，E4流服务器也开始接收数据包。

### Data

##### Acceleration Data

x轴的加速度。x轴是定义的向量是由表盘中心指向USB插槽。

y轴的加速度。y轴是定义的向量是由表盘中心指向较短的腕带处。

z轴的加速度。z轴是定义的向量是由表盘中心指向设备的底部。

```
E4_Acc 123345627891.123 51 -2 -10
```

##### Blood Volume Pulse Data

BVP的采样值，这个数值来源于动脉血液的光吸收。原始信号被过滤以去除运动伪影（artifacts）

```
E4_Bvp 123345627891.123 31.128
```

##### Galvanic Skin Response Data

GSR采样的值。数值用导电度单位（micro Siemens） 表示

> 电导率是指单位长度、单位截面的某种物质的电导，为电阻率的倒数，单位为西门子/米 
> 1000 micromhos = 1000 microSiemens = 1 milliSiemen

```
E4_Gsr 123345627891.123 3.129
```

##### Temperature Data

温度采样的值，以摄氏度为单位。这个数值是由放置在手腕上的光学温度传感器得出的。

```
E4_Temperature 123345627891.123 35.82
```

##### Inter-beat Interval Data

IBI采样的值，该值是到上一次检测到的心跳的距离，以秒为单位。

```
E4_Ibi 123345627891.123 0.822
```

##### Heartbeat Data

检测到的心跳值，与节拍间隔数据一起返回。

```
E4_Hr 123345627891.123 142.2156
```

##### Battery Level Data

设备的电池电量。值:[0.0 - 1.0]

##### Tag Data

