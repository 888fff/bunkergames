# Unity下开发FreeD协议插件

### 云台和PC的链接关系

```mermaid
graph LR;
    云台传感器 --串口--> 杰讯VR_Works
    全伺服镜头 --串口--> 杰讯VR_Works
    杰讯VR_Works --串口--> MOXA
    MOXA --网口--> PC网卡A
    英特网 --网口--> PC网卡B
    subgraph PC网卡
    PC网卡A -- IP配置192.168.127.200 --> 内网MOXA后台配置
    PC网卡B -- IP配置自动获得 --> 外网通讯
    end

    
```

### MOXA后台配置项

##### 串口：

![image-20230306174320612](K:\bunkergames\work_doc\assets\image-20230306174320612.png)

##### 网口：

其中，注意packing length

![image-20230306174353686](K:\bunkergames\work_doc\assets\image-20230306174353686.png)

### FreeD协议的包结构

```xml
<D1>         消息类型
<CA>         摄像机ID
<PH><PM><PL> 摄像机Pan方向的角度
<TH><TM><TL> 摄像机Tilt方向的角度
<RH><RM><RL> 摄像机Roll方向的角度
<XH><XM><XL> 摄像机x轴方向位置
<YH><YM><YL> 摄像机y轴方向位置
<HH><HM><HL> 摄像机z轴方向位置(高度信息)
<ZH><ZM><ZL> 摄像机推拉
<FH><FM><FL> 摄像机聚焦
<SH><SL>     空余/用户自定义
<CK>         总和校验码
```

现在用UDP进行数据通信

```mermaid
graph LR;
subgraph THREAD_1
UDPClient --> ReceiveFreeD
end
subgraph THREAD_2
FilterFreeD
end
subgraph DLL库
FreeDRecv --> UDPClient
FreeDRecv --> FilterFreeD
THREAD_1
THREAD_2
end
FreeDRecv --> 引擎API接口
subgraph Unity
引擎API接口
end

```

