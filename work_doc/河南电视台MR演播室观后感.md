# 河南电视台MR演播室交流学习之感

温伟航写于2023年4月14日山西台

在2023年4月10日，与技术制作中心的同事，同行出发来到河南电视台。在4月11日对其投入生产不久的MR演播室进行学习参观，并河南电视台技术同事进行交流。以下，我从三个方面对这次MR的交流学习进行总结：

## 硬件

显示屏由水平放置在地面的四块大屏和垂直于地面的三块弧形屏组成，且每块屏均为4k屏，共计7块。其中垂直的三块弧形屏高度均为6米左右，弧形屏的圆心角约为120°，半径为12米左右。水平防止的4块屏，以田字格放置，弧形屏垂直放置在其上，如图所示：

<img src="K:\bunkergames\work_doc\assets\image-20230414091528717.png" alt="image-20230414091528717" style="zoom:67%;" />

[^图1]: 黑色田字框为地面的4块屏幕，蓝色为垂直的3块弧形屏

屏幕的像素点间距为2.5mm，且水平放置在地面的屏幕上面附有一层漫反射亚克力板。需要注意的是，地面的屏幕是消耗品，录制节目后，会有不同程度的损坏，需要更换。也因为是亚克力的缘故，会导致与观察角度相关的微小色差。与此同时，镜头远景表现良好，但是推到近景，背后的屏幕会产生摩尔纹。而且，主持人没有定位导致地面没有影子，会显得有些假。

摄像机定位用到MO-SYS系统，整个600平米演播室天花板进行了贴红外反光片，然后通过此设备获取摄像机的Position和Rotation。弊端是，摇臂摄像机的MO-SYS设备会被自己摇臂遮挡，从而失去反馈而导致无法获得摄像机数据。且，每个型号的摄像机数据需要单独进行标定。

<img src="K:\bunkergames\work_doc\assets\image-20230414100154530.png" alt="image-20230414100154530" style="zoom:67%;" />

此7块屏幕分别用7台渲染机器进行“同步”渲染，每个渲染机器配置有RTX6000显卡，差不多整套系统软硬件共计3000W左右。

## 软件

此XR软件，由两大块软件组成，渲染由UE4去做，UE4内有7D（供应商七维简称为7D）开发的插件和配置后的项目场景。分屏渲染的同步器是由7D开发。这里，经本人调研，其并非是真正意义上的同步。

最终，分屏渲染的场景输出到各自的屏幕，然后再由一个摇臂摄像机拍摄捕捉后，将视频送入合成用的UE，然后进行大场景的合成，最终输出合成后视频。

![image-20230414100214908](K:\bunkergames\work_doc\assets\image-20230414100214908.png)

![image-20230414100225700](K:\bunkergames\work_doc\assets\image-20230414100225700.png)



制作团队有十几人，场景制作十人左右，设备控制两人，剩下的用于设备维护。

## 人才

人才的引进，相对比较难，薪资待遇是重要的一部分，另外一方面是发展的目标和晋升途径。人才流失率比较高。

人才的培养，对台内的老员工进行跨专业的转型培养。之前的舞台美术转为了虚幻场景美术。