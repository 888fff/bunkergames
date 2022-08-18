# NDI相关翻译

### PERFORMANCE AND IMPLEMENTATION 性能和实现

##### GENERAL RECOMMENDATIONS

- 在整个系统中，如果可能的话，使用YCbCr颜色，因为它提供了更高的性能和更好的质量。
- 如果您的系统有多个网卡，并且您正在使用多个发送端和接收端，那么将所有可用端口连接到网络是值得的。带宽将分布在多个网络适配器上。

- 尽可能使用最新版本的SDK。自然，该领域大量NDI用户的经验提供了许多次要的边界用例，我们努力工作以尽可能快地解决所有这些问题。

- 此外，我们对NDI和IP视频的未来有雄心勃勃的计划，我们正在不断地为每个新版本奠定基础，以便在相关增强功能供公众使用时，这些都已经到位。

- SDK的设计充分利用了最新的CPU指令，特别是Intel平台上的AVX2(256位指令)和ARM平台上的NEON指令。通常，NDI速度限制更多地与系统内存带宽有关，而不是CPU处理性能，因为代码的设计目的是让CPU上的所有执行管道都处于繁忙状态。

- NDI在解码和编码一个或多个流时利用了多个CPU核，为了获得更高的分辨率，将使用多个核来解码单个流

##### SENDING VIDEO

- 使用UYVY或UYVA颜色，如果可能，因为这避免内部颜色转换。如果你不能生成这些颜色格式，你会使用CPU来执行转换，最好让SDK执行转换。

- 在大多数情况下，这样做会带来性能上的好处，尤其是在使用异步帧提交时。如果你发送给NDI的数据在GPU上，并且你可以让GPU在下载到系统内存之前执行颜色转换，你可能会发现这有最好的性能
- 发送BGRA或BGRX视频将招致性能惩罚。这是由于这些格式所需的内存带宽增加，以及转换为YCbCr颜色空间进行压缩造成的。也就是说，在NDI SDK的第4版中，性能得到了显著提高。

- 使用异步帧提交几乎总是能获得显著的性能优势。

##### RECEIVING VIDEO

- 使用NDIlib_recv_color_format_fastest接收将产生最佳性能。

- 建议使用NDIlib_recv_capture_v3对音频和视频进行单独的线程查询。

  > 注意，NDIlib_recv_capture_v3是多线程安全的，允许多个线程同时等待数据。
  >
  > 在NDIlib_recv_capture_v3上使用合理的超时比不使用超时轮询更有效

- 在现代版本的NDI中，有一些内部的试探法试图猜测硬件加速是否会带来更好的性能。也就是说，如果您认为硬件加速对您的应用程序有益，那么显式地启用硬件加速是可能的。这可以通过如下方式向接收方发送XML元数据消息来启用：<ndi_video_codec type="hardware"/>

- 请记住，某些机器上的解码资源是为处理单个视频流而设计的。因此，虽然硬件辅助可能会使少数流受益，但随着流数量的增加，它实际上可能会损害性能。

- 现代版本的NDI几乎肯定已经默认在大多数情况下使用硬件加速，这将是有益的，所以这些设置不太可能做出显著的改进。在较早的版本中，由于担心硬件编解码器驱动程序的稳定性，我们不太可能默认启用这些功能，但我们相信这种谨慎已经没有必要了。

##### RELIABLE UDP WITH MULTI-STREAM CONGESTION CONTROL  可靠的UDP多流拥塞控制

​	在NDI版本5中，默认的通信机制是一个可靠的UDP协议，它代表了最先进的通信协议，它是通过构建我们在现实世界中看到的所有经验来实现的，我们在大量不同的安装中使用NDI。通过使用UDP，它不依赖任何直接往返，拥塞控制或流量控制问题，通常与TCP相关。最重要的是，我们观察到，在现实世界的网络中，当您接近许多不同视频通道的总带宽时，网络带宽的管理成为最常见的问题。

​	我们可靠的UDP解决了这个问题，通过移动源之间的所有流到一个单一的连接，其中拥塞控制被应用在一次聚集到所有流，这代表了几乎所有安装的一个巨大的改进。这些流彼此之间完全没有阻塞，因此即使在高丢包的情况下，也不可能有特定的丢包影响到连接的任何其他部分。

​	UDP包发送的最大问题之一是需要将许多小包发送到网络上，这会导致非常大的操作系统内核开销。我们的实现通过支持一次完全异步地发送多个包来解决这个问题，并支持在接收端合并包，从而允许内核和网卡驱动程序**offload**大量碎片的处理。

[^offload]: https://cloud.tencent.com/developer/article/1806504)

​	该协议还通过拥有目前最好的拥塞控制系统来支持高网络延迟。这允许多个包同时飞行，并非常准确地跟踪哪些包已经收到，并将数量调整为当前测量的往返时间。

​	在支持此功能的Windows上，接收端伸缩用于实现优化的网络接收，确保当收到网卡中断时，它们总是被直接传递给具有可用执行上下文的线程(然后直接传递到NDI处理链)。

​	为了获得绝对最好的性能，UDP支持UDP分段卸载(USO)，它允许网络接口卡卸载大于网络媒体的最大传输单元(MTU)的UDP数据报分段，这可以显著减少CPU占用。

​	在Linux上，为了获得最好的性能，我们需要利用UDP发送的通用分段卸载(GSO)，这可能也被称为UDP_SEGMENT，它在Linux内核4.18中可用。没有这个，UDP发送可以看到显著增加的CPU开销。

##### MULTICAST 组播（多播）

NDI支持基于组播的视频源，使用组播UDP协议，通过转发纠错来纠正丢包。

重要的是要意识到，在配置不正确的网络上使用组播非常类似于对整个网络的“拒绝服务（denial of service）”攻击；因此，缺省情况下，组播发送功能是关闭的。

我们测试过的每个路由器都将组播流量视为默认的广播流量。因为网络上的大多数组播流量都是低带宽的，所以这几乎没有什么影响，而且通常允许网络路由器更有效地运行，因为不需要包过滤。

这意味着，每一个接收到的多播数据包都会被发送到网络上的每个目的地，而不管那里是否需要它。因为NDI需要高带宽组播，即使在大型网络中源数量有限，向所有网络源发送这么多数据的负担也会削弱整个网络的性能。

为了避免这个严重的问题，必须确保网络上的每个路由器都启用了适当的组播过滤。这个选项通常被称为“IGMP snooping”。详细介绍请登录https://en.wikipedia.org/wiki/IGMP_snooping。如果您无法找到启用此选项的方法，我们建议您谨慎地使用组播。

###### DEBUGGING WITH MULTICAST

另一个重要的警告是，像NDI这样的软件应用程序会订阅多播组，当它不再需要这个组时，就会取消订阅。

与操作系统中的大多数操作不同，取消订阅步骤不会由操作系统自动执行;一旦你订阅了一个组，你的计算机将继续接收数据，直到路由器发送一个IGMP查询来验证它是否仍然需要。在典型网络中，这种情况大约每5分钟发生一次。

结果是，如果您启动一个NDI多播流并在没有正确关闭NDI连接的情况下杀死您的应用程序，您的计算机将继续接收来自网络的数据，直到超时结束。

### PORT NUMBERS

每个NDI连接将需要一个更多的端口号。当前版本尝试将这些端口设置在可预测的端口范围内，尽管如果其他应用程序占用了该范围的一些端口，那么可能需要使用更高的数字。下表描述了使用的端口号、类型和用途。

建议您使用NDI当前版本的默认连接类型，因为这些代表了我们测试和观察到的最佳建议，可以在该领域获得最佳性能。早期版本的NDI可能使用临时范围内的端口，尽管现代版本的NDI不再使用这些端口来确保端口号更可预测和更容易配置

|   端口号    | 类型    | 使用                                                         | NDI版本 |
| :---------: | ------- | ------------------------------------------------------------ | :-----: |
|    5353     | UDP     | 这是用于mDNS通信的标准端口，总是用于在网络上多播发送当前源。 |    5    |
| 5960 and up | UDP     | 当使用可靠的UDP连接时，它将使用5960范围内的一小部分端口。这些端口号与TCP连接共享。由于这种模式使用的是连接共享，所需要的端口数量非常有限，每个NDI进程运行只需要一个端口，而不是每个NDI连接需要一个端口。 |    5    |
|    5960     | TCP     | 这是一个TCP端口，用于远程源查询此机器并发现在其上运行的所有源。例如，当在访问管理器中通过IP地址添加一台机器时，就可以使用这种方法，以便仅从一个IP地址就可以自动发现该机器上当前运行的所有源。 |    5    |
| 5961 and up | TCP     |                                                              |    4    |
| 6960 and up | TCP/UDP |                                                              |    4    |
| 7960 and up | TCP/UDP |                                                              |    4    |

### CONFIGURATION FILES

NDI®配置设置存储在JSON文件中。这些文件的位置因平台而异，将在本手册的下一节中进行描述。

请注意，当使用高级SDK 和 NDI SDK时，所有设置都是每个实例，因此完全独立的设置可以用于每个finder, sender和receiver;这是令人难以置信的强大，允许您指定每个发送方或接收方使用哪个网卡，使用的格式，什么机器名称，等等……

请特别注意值的类型，因为它们必须匹配这里列出的内容(例如，true而不是" true ")。另外请注意，所有这些参数都有默认值，这是对大多数机器推荐的最佳配置，我们只建议您在安装时有非常特殊的需要时更改这些值。

### PLATFORM CONSIDERATIONS

当然，所有平台都略有不同，不同平台之间配置文件的位置和设置可能略有不同。在所有平台上，如果在初始化SDK之前设置了一个环境变量NDI_CONFIG_DIR，那么当使用库时，我们将从这个文件夹加载ndi-config.v1.json

##### WINDOWS

完全支持Windows平台，并在NDI®的所有路径中提供高性能。与所有操作系统一样，x64版本提供了最好的性能。支持所有现代CPU特性集。请注意，NDI的下一个主要版本将不支持32位windows平台。

我们发现，在某些计算机系统上，如果你安装了“WireShark”来监控网络流量，它安装的一个名为“NPCap Loopback Driver”的虚拟设备驱动程序会干扰NDI，有可能导致NDI无法通信。对于网络来说，这也是一个潜在的性能问题，因为它被设计为拦截网络流量。该驱动程序不是必需的，在现代版本的Wireshark中也不使用。如果您发现您的系统上安装了它，我们建议您进入您的网络设置，使用适配器上的上下文菜单禁用它。

Windows的NDI Tools包包括“Access Manager”，一个用于配置上面列出的大多数设置的用户界面。这些设置也存储在C:\ProgramData\NDI\ndi-config.v1.json中。

##### WINDOWS UWP

- 不幸的是，通用Windows平台对NDI施加了重要的限制，这可能会对NDI产生负面影响，您需要注意这一点。下面列出了这些

  UWP平台不允许接收来自Localhost的网络流量。这意味着UWP NDI接收器将无法接收本地机器上的任何源。

  https://docs.microsoft.com/en-us/windows/iot-core/develop-your-app/loopback

- 当前的Windows 10 UWP mDNS发现库有一个bug，在源不再可用后，不能正确地从网络中删除广告；这个源最终会在其他查找器上“超时”；然而，这可能需要一两分钟。

- 由于沙箱，UWP应用程序无法加载外部dll。这使得NDI|HX不太可能正确工作。

- 当您创建一个新的UWP项目时，您必须确保您拥有清单中指定的用于NDI操作的所有正确功能。具体来说，在写这篇文章的时候你需要：

  - 互联网(客户端和服务器)
  - 互联网(客户端)
  - 专用网络(客户端和服务器)

##### MACOS

······

##### ANDROID

因为Android处理发现的方式与其他NDI平台不同，所以需要做一些额外的工作。NDI库需要使用来自Android的“NsdManager”，不幸的是，第三方库没有办法自己做到这一点。只要一个NDI sender、finder或receiver被实例化，NsdManager的一个实例就需要存在，以确保Android的Network Service Discovery Manager运行并可用于NDI。

这通常是通过添加以下代码到您的长时间运行的活动的开始:

```java
private NsdManager m_nsdManager;
```

在创建NDI发送方、查找方或接收方之前，实例化NsdManager:

```java
m_nsdManager = (NsdManager)getSystemService(Context.NSD_SERVICE);
```

您还需要确保您的应用程序已经配置为具有该功能运行所需的**正确权限**。

##### IOS

······

##### LINUX

完全支持Linux版本，并在NDI的所有路径下提供高性能。Linux上的NDI库依赖于两个第三方库：

> libavahi-common.so.3 
>
> libavahi-client.so.3

这些库的使用取决于将要安装和运行的avahi-daemon服务

配置设置保存在 $HOME/.ndi/ndi-config.v1.json.

请仔细注意Linux下“性能和实现”部分的“可靠的UDP”的注释。

### NDI-SEND

调用NDIlib_send_create将创建发送方的一个实例。这将返回一个NDIlib_send_instance_t类型的实例(如果失败则返回NULL)，表示发送实例。

通过填写一个名为NDIlib_send_create_t的结构来指定应用于发送方的创建参数集。现在可以使用NULL参数调用NDIlib_send_create，在这种情况下，它将对所有值使用默认参数；使用当前可执行文件名称选择源名称，确保有一个计数确保发送方名称是唯一的(例如“My Application”，“My Application 2”等)。

| Supported Parameters            |                                                              |
| ------------------------------- | ------------------------------------------------------------ |
| p_ndi_name (const char*)        | 这是要创建的NDI源的名称。它是一个以null结尾的UTF-8字符串。这将是网络上NDI源的名称。例如，如果您的网络机器名为“My Machine”，并且您指定此参数为“My Video”，网络上的NDI源将是“MyMachine (My Video)” |
| p_groups (const char*)          | 这个参数表示这个NDI发送者应该将自己放入的组。组是NDI源的集合。任何源都可以是任意数量组的一部分，组用逗号分隔。例如，“cameras,studio  1,10am show”将在三个组中放置一个源命名。<br/>在查找端，您可以指定要查找哪些组，也可以在多个组中查找。如果组为NULL，则使用系统默认组。 |
| clock_video, clock_audio (bool) | 它们指定音频和视频是否“时钟”本身。当它们被计时时，添加的视频帧将被限速，以匹配它们提交的当前帧率。音频也是如此。<br/>一般来说，如果你在一个线程中提交视频和音频，你应该只记录其中的一个(视频可能是更好的选择)。如果你提交的是单独线程的音频和视频，那么同时对它们进行计时会很有用<br/>一个简单的工作原理是，当你提交一个帧时，它会记录下下一个帧需要的时间。如果你在这个时间点之前提交一个帧，调用将会等到那个时间点。这确保了，如果你坐在一个紧密的循环中并以尽可能快的速度渲染帧，它们将以你希望的帧速率计时。<br/>注意，将时钟视频和音频提交与异步帧提交相结合(见下文)允许你编写非常简单的循环来渲染和提交NDI帧。 |

由于许多应用程序提供了交错的16-bpp音频，NDI库包含了一些实用函数，用于将PCM 16-bpp格式转换为浮点格式。

另外，还有一个实用函数(NDIlib_util_send_send_audio_interleaved_16s)用于发送签名的16位音频。(请参考示例项目和头文件Processing.NDI.utilities.h，它列出了可用的函数。)通常，我们建议使用浮点音频，因为电平固定（clamping）是不可能的，音频级别是很好的定义，而不需要考虑动态余量（headroom）。

元数据以非常类似的方式提交。(我们不提供代码示例，因为这很容易理解，可以参考音频和视频示例。)

为了接收从连接的接收端发送的元数据(例如，可以用来选择页面，更改设置等)，我们建议您使用接收设备的工作方式。

基本过程包括调用带有超时值的NDIlib_send_capture。这可以用于查询在超时为零的情况下元数据消息是否可用，或者有效地等待线程上的消息。基本过程概述如下:

```c++
// Wait for 1 second to see if there is a metadata message available
NDIlib_metadata_frame_t metadata;
if (NDIlib_send_capture(pSend, &metadata, 1000) == NDIlib_frame_type_metadata)
{
 // Do something with the metadata here
 // ...
 // Free the metadata message
 NDIlib_recv_free_metadata(pSend, &meta_data);
}

```

在本文档的NDI-Recv部分中指定的连接元数据是一个重要的元数据类别，当与您建立新连接时，您将自动接收它。这允许NDI接收方向发送方提供上游详细信息，并包括接收方可能提供的功能提示。

示例包括接收方首选的分辨率和帧率，其产品名称等。发送方必须意识到，它可能同时向多个接收方发送视频数据，因此将从每个接收方接收连接元数据。

确定您是否在程序和/或预览设备(如视频混合器)上的输出(即“计数”信息)非常类似于如何处理元数据信息。你可以“查询”它，或者你可以有效地“等待”和得到Tally通知的变化。下面的示例将等待一秒钟并对计数通知作出反应：

```c++
// Wait for 1 second to see if there is a tally change notification.
NDIlib_tally_t tally_data;
if (NDIlib_send_get_tally(pSend, &tally_data)
{
 // The tally state changed and you can now
 // read the new state from tally_data.
}

```

连接元数据是你可以向发送者“注册”的数据;每次与发送方建立新连接时，它都会自动发送。发送方在内部维护任何连接元数据消息的副本，并自动发送它们。

这对于允许发送方在任何设备可能想要连接到它的时候提供下游信息(例如，让它知道产品名称或首选的视频格式可能是什么)是有用的。发送方和接收方都不需要提供此功能，并且可以随意忽略任何连接数据字符串。

标准连接元数据字符串将在本文档的后面一节中定义。为了添加元数据元素，可以调用NDIlib_send_add_connection_metadata。要清除所有已注册的元素，可以调用NDIlib_send_clear_connection_metadata。下面提供了一个示例，用于注册发送者的姓名和详细信息，以便与您连接的其他来源获得有关您的信息。

```c++
// Provide a metadata registration that allows people to know what we are.
NDIlib_metadata_frame_t NDI_product_type;
NDI_product_type.p_data = "<ndi_product long_name=\"NDILib Send Example.\" "
 " short_name=\"NDILib Send\" "
 " manufacturer=\"CoolCo, inc.\" "
 " model_name=\"PBX-15M\" "
 " version=\"1.000.000\" "
 " serial=\"ABCDEFG\" "
 " session_name=\"My Midday Show\" />";
NDIlib_send_add_connection_metadata(pSend, &NDI_product_type);

```

由于NDI假设所有发送者都必须有一个惟一的名称，并且还对NDI名称应用了某些过滤，以确保它们符合网络名称空间，因此有时您创建的源的名称可能会稍加修改。为了帮助您获取任何发送者的确切名称(确保您使用相同的名称)，有一个接收此名称的函数。

```c++
const NDIlib_source_t* NDIlib_send_get_source_name(NDIlib_send_instance_t p_instance);
```

返回值的生命周期是直到发送方实例被销毁。

##### ASYNCHRONOUS SENDING 异步的

使用NDI调用NDIlib_send_send_video_v2_async可以异步发送视频帧。该函数将立即返回，并将与调用异步执行所有所需的操作(包括颜色转换、任何压缩和网络传输)。

因为NDI在可用时充分利用了异步操作系统的行为，这通常会提高性能(与创建自己的线程和异步提交帧呈现相比)。

通过NDIlib_video_frame_v2_t指针传递给API的内存将继续使用，直到发出同步API调用。同步调用是以下任何一种

- 对NDIlib_send_send_video_v2_async的另一个调用。

- 调用NDIlib_send_send_video_v2_async(pSend, NULL)将等待任何异步调度帧完成，然后返回。显然你也可以提交下一帧，这样它就会在异步提交当前帧之前等待前一帧完成。

- 对NDIlib_send_send_video_v2的另一个调用。

- 调用NDIlib_send_destroy

将此与时钟视频输出结合使用，可以产生非常高效的渲染循环，其中不需要使用单独的线程来计时或提交帧。比如下面介绍的就是一个高效的实时处理系统，只要渲染总是能跟上实时的

```c++
while(!done()) 
{
 	render_frame();
	NDIlib_send_send_video_v2_async(pSend, &frame_data);
}
NDIlib_send_send_video_v2_async(pSend, NULL); // Sync here
```

> 涉及异步发送的用户错误是最常见的SDK“bug report”。这是非常重要的理解对NDIlib_send_send_video_v2_async的调用开始处理，然后发送视频帧与调用应用程序异步。如果您调用这个函数，然后释放指针，您的应用程序将最可能会在NDI线程中崩溃——因为SDK仍然使用传递给调用的视频帧。

如果在调用此函数后立即重用缓冲区，则视频流可能会出现撕裂或其他故障，因为您正在写入缓冲区，而SDK仍在压缩它先前持有的数据。一种可能的解决方案是在交替调用NDIlib_send_send_video_v2_async时在两个缓冲区之间“乒乓”，然后在应用程序结束时释放这些缓冲区之前用空帧指针调用相同的函数。当以这种方式工作时，您通常会呈现、压缩和发送到网络，每个进程与其他进程是异步的。

注意:如果你正在使用高级SDK，你可以为异步帧发送分配一个完成处理程序，更明确地允许你用异步发送跟踪缓冲区所有权。

##### TIMECODE SYNTHESIS

在发送视频、音频或元数据帧时，可以为所有发送的数据指定自己的时间码。您还可以指定ndilib_send_timecode_syntheses(定义为INT64_MAX)的值，以使SDK为您生成时间码。当您指定此值时，时间码将被合成为自Unix Epoch(1/1/1970 00:00)以来的UTC时间，精度为100ns。

如果根本不指定时间码(而是要求合成每个时间码)，则使用当前系统时钟时间作为起始时间码(从Unix Epoch开始转换为UTC)，并生成合成值。只要你发送的帧不以任何有意义的方式偏离系统时间，这将保持你的流完全同步。实际上，这意味着，如果您从不指定时间码，它们将总是为您正确地生成。使用这种方式工作时，同一台机器上不同发送者的时间码将始终保持同步。如果您在本地网络上安装了NTP，那么流可以在多台机器之间以非常高的精度进行同步。

如果您在特定的帧(音频或视频)指定了一个时间码，然后要求合成所有后续的时间码，生成的后续时间码将继续这个序列。这维护了流和生成的样本之间的正确关系，避免随时间的推移与您指定的时间码发生任何有意义的偏差。

如果您指定一个流(例如视频)上的时间码，并要求另一个流(音频)被合成，为另一个流生成的时间码完全匹配正确的样本位置;它们不是流间量子化的。这确保您可以只在单个流上指定时间码，并让系统为您生成其他时间码

当您发送元数据消息并要求合成时间码时，选择它来匹配最接近的音频或视频帧时间码(以便它看起来接近您可能想要的东西)。如果没有足够接近的样本，则从最后一个已知的样本和发送后经过的时间合成一个时间码。

> 请注意，如果帧没有在准确的时间提交，则合成生成时间码的算法将正确地分配时间戳。

例如，如果您按顺序提交一个视频帧和一个音频帧，它们将具有相同的时间码，尽管视频帧可能需要多花几毫秒来编码。

也就是说，不会累计每帧错误。所以-如果你提交的音频和视频在一段时间内没有对齐超过几帧-时间码仍然会正确合成而没有累积错误

##### FAILSAFE

故障安全是任何NDI发送方的一种能力。如果在NDI发送端指定了故障保护源，并且发送端由于任何原因失败(甚至是机器完全失败)，任何查看该发送端的接收端都会自动切换到故障保护发送端。如果失败的源重新联机，接收器将切换回该源。

您可以设置任何视频输入的故障转移源与呼叫为:

```c++
void NDIlib_send_set_failover(NDIlib_send_instance_t p_instance,const NDIlib_source_t* p_failover_source)
```

[故障转移](https://blog.csdn.net/u011305680/article/details/79730646)源可以是任何网络源。如果指定为NULL，则将清除failsafe源。

##### CAPABILITIES

一个NDI功能元数据消息可以被提交给NDI发送者，用于通信下游NDI接收者在连接时应该知道的某些功能。例如，如果您正在提供PTZ类型的功能，那么就让NDI接收者知道这将通过这种类型的元数据消息完成。下面是一个NDI能力消息的示例:

<ndi_capabilities web_control="http://ndi.tv/" ntk_ptz="true" ntk_exposure_v2="true" />

您可以将此消息提交给NDI发送方，以便与当前和未来的NDI接收方通信，如下所示:

```c++
NDIlib_metadata_frame_t NDI_capabilities;
NDI_capabilities.p_data = "<ndi_capabilities web_control=\"http://ndi.tv/\" "
 " ntk_ptz=\"true\" "
 " ntk_exposure_v2=\"true\" />";
NDIlib_send_add_connection_metadata(pNDI_send, &NDI_capabilities_type);
```

### NDI-FIND

它用于定位网络上可用的源，通常与NDI-Receive一起使用。

在内部，它使用跨进程的P2P mDNS实现来定位网络上的源。(定位所有可用的源通常需要几秒钟，因为这需要其他正在运行的机器发送响应消息。)

尽管发现使用mDNS，客户端是完全独立的;Bonjour(等)不是必需的。mDNS是一种P2P系统，它交换定位的网络源，并提供一种高度健壮和带宽高效的方式来在本地网络上执行发现。

在mDNS初始化(通常使用NDI-Find SDK完成)时，可能需要几秒钟才能找到网络上的所有源。请注意，一些网络路由器可能会在网段之间阻塞mDNS流量。

创建find实例与其他api非常相似——填充NDIlib_find_create_t结构来描述所需的设备。可以指定一个NULL创建参数，在这种情况下使用默认参数。

如果您希望手动指定参数，则成员值如下:

//.....

一旦你有了NDI find实例的句柄，你就可以在任何时候通过调用NDIlib_find_get_current_sources来恢复当前源列表。这将立即返回已定位源的当前列表。

NDIlib_find_get_current_sources返回的指针由finder实例所有，因此没有理由释放它。它会一直保留到下一次调用NDIlib_find_get_current_sources，或者直到NDIlib_find_destroy函数被销毁。

您可以调用NDIlib_find_wait_for_sources来等待，直到网络源集被更改;这需要一个以毫秒为单位的超时。如果在网络上找到了新的源，或者在此时间之前删除了一个源，该函数将立即返回true。如果在时间过去之前没有看到新的源，则返回false。

下面的代码将创建一个NDI-Find实例，然后列出当前可用的源代码。它使用NDIlib_find_wait_for_sources休眠，直到在网络上找到新的源，当它们被看到时，调用NDIlib_find_get_current_sources来获取当前的源列表:

```c++
// Create the descriptor of the object to create
NDIlib_find_create_t find_create;
find_create.show_local_sources = true;
find_create.p_groups = NULL;
// Create the instance
NDIlib_find_instance_t pFind = NDIlib_find_create_v2(&find_create);
if (!pFind)
 	/* Error */;

while (true) // You would not loop forever of course !
{
 // Wait up till 5 seconds to check for new sources to be added or removed
     if (!NDIlib_find_wait_for_sources(pFind, 5000))
     {
     	// No new sources added!
     	printf("No change to the sources found.\n");
     }
    else
    {
     // Get the updated list of sources
         uint32_t no_sources = 0;
         const NDIlib_source_t* p_sources =
         NDIlib_find_get_current_sources(pFind, &no_sources);
         // Display all the sources.
         printf("Network sources (%u found).\n", no_sources);
         for (uint32_t i = 0; i < no_sources; i++)
             printf("%u. %s\n", i + 1, p_sources[i].p_ndi_name);
    }
}
// Destroy the finder when you’re all done finding things
NDIlib_find_destroy(pFind);

```

重要的是要理解mDNS发现可能需要一些时间来定位所有的网络源。这意味着“早期”返回NDIlib_find_get_current_sources可能不包括网络上的所有资源;当发现其他或新的源时，将添加(或删除)这些源。发现网络中的所有源通常需要几秒钟的时间。

对于希望在用户界面菜单中列出当前源的应用程序，推荐的方法是在打开用户界面时创建一个NDIlib_find_instance_t实例，然后——每次您希望显示当前可用源列表时——调用NDIlib_find_get_current_sources。

### NDI-RECV

NDI®Receive SDK是如何在网络上接收帧的。重要的是要意识到，它可以连接到资源，并保持“连接”，即使它们在网络上不再可用；如果源再次可用，它将自动重新连接。

与其他api一样，起点是使用NDIlib_recv_create_v3函数。这个函数可以初始化为NULL，并使用默认设置。它接受NDIlib_recv_create_v3_t定义的参数，如下所示:

| Supported Parameters |                                                              |
| -------------------- | ------------------------------------------------------------ |
| source_to_connect_to | 这也是应该连接的源名称。这与NDIlib_find_get_sources返回的格式完全相同。<br/>注意，如果您希望创建一个接收器，并希望在稍后使用NDIlib_recv_connect连接，您可以将源指定为NULL源。 |
| p_ndi_name           | 这是一个用于接收方的名称，将在SDK的未来版本中使用，以允许发现网络上的发送方和接收方。可以将其指定为NULL，并使用基于应用程序可执行名称的唯一名称。 |
| color_format         | 这个参数决定当一个帧被接收时传递什么颜色格式。一般来说，在任何场景中都会使用两种颜色格式：当源有alpha通道时存在一种，当源没有alpha通道时存在另一种。 |

下表列出了可用于指定要返回的颜色格式的可选值。

| Optional color_format values       | Frames without alpha             | Frames with alpha                |
| ---------------------------------- | -------------------------------- | -------------------------------- |
| NDIlib_recv_color_format_BGRX_BGRA | BGRX                             | BGRA                             |
| NDIlib_recv_color_format_UYVY_BGRA | UYVY                             | UYVY                             |
| NDIlib_recv_color_format_RGBX_RGBA | RGBX                             | RGBA                             |
| NDIlib_recv_color_format_UYVY_RGBA | UYVY                             | RGBA                             |
| NDIlib_recv_color_format_fastest   | Normally UYVY. See notes  below. | Normally UYVA. See notes  below. |
| NDIlib_recv_color_format_best      | Varies. See notes below.         | Varies. See notes below.         |

###### COLOR_FORMAT NOTES

如果指定颜色选项NDIlib_recv_color_format_fastest, SDK将提供内部处理的格式缓冲区，在它们传递给您之前无需执行任何转换。这将导致最好的性能。这个选项通常运行时的延迟也比其他选项低，因为它支持单字段格式类型。

在此模式中，假定allow_video_fields选项为真。在大多数平台上，当没有alpha通道时，这将返回一个8位UYVY视频缓冲区，当有alpha通道时，返回一个8位UYVY+A缓冲区。这些格式在视频布局的描述中进行了描述。

如果指定颜色选项NDIlib_recv_color_format_best, SDK将以最接近所使用的视频编解码器本地精度的格式为您提供缓冲区。在许多情况下，这是高性能和高质量的，结果是最好的质量。

与NDIlib_recv_color_format_fastest类似，这种格式将始终交付单个字段，隐式地假设allow_video_fields选项为真。

在大多数平台上，当没有alpha通道时，当底层编解码器是原生NDI时，这将返回一个16 bpp的Y+Cb,Cr (P216 FourCC)缓冲区，或当原生编解码器是8位编解码器(如H.264)时返回一个8-bpp的UYVY缓冲区。当有alpha通道时，这通常会返回一个16 bpp的Y+Cb,Cr+ a (PA16 FourCC)缓冲区。

在这种模式下，您应该尽可能广泛地支持NDIlib_video_frame_v2_t属性，因为对于传递的内容很少有限制

| Supported Parameters (Continued) |                                                              |
| -------------------------------- | ------------------------------------------------------------ |
| bandwidth                        | 这允许您指定此连接是处于高带宽模式还是低带宽模式。它是一个枚举，因为将来可能会有其他替代方案。对于大多数情况，您应该指定NDIlib_recv_bandwidth_highest，这将产生从上游源发送给您的相同流。您可以指定NDIlib_recv_bandwidth_lowest，它将为您提供占用显著减少带宽的中等质量流。 |
| allow_video_fields               | 如果您的应用程序不喜欢接收带字段的视频数据，您可以将此值指定为false，并且所有接收到的视频将在传递给您之前被去交错。对于大多数应用程序，默认值应该被认为是true。当color_format为NDIlib_recv_color_format_fastest时，该值为true。 |
| p_ndi_name                       | 这是要创建的NDI接收器的名称。它是一个以null结尾的UTF-8字符串。给接收者一个有意义的、描述性的和唯一的名称。这将是网络上NDI接收器的名称。例如，如果您的网络机器名为“MyMachine”，并且您指定此参数为“Video Viewer”，那么网络上的NDI接收器将是“MyMachine (Video Viewer)”。 |

填充完这个结构后，调用NDIlib_recv_create_v3将为您创建一个实例。SDK中提供了一个完整的示例，它演示了如何查找网络源并创建接收方来查看它(这里不再现该代码)。

如果你用NULL作为设置创建一个接收器，或者如果你想改变你连接到的远程源，你可以在任何时候用NDIlib_source_t指针调用NDIlib_recv_connect。**如果源指针为NULL，它将断开您与任何源的连接**。

一旦有了接收实例，就可以通过调用NDIlib_recv_capture_v3来查询视频、音频或元数据帧。这个函数接受一个指向音频(NDIlib_audio_frame_v3_t)、视频(NDIlib_video_frame_v2_t)和元数据(NDIlib_metadata_frame_t)头的指针，其中任何一个都可以是NULL。它可以安全地一次跨多个线程调用，允许一个线程接收视频，而另一个线程接收音频。

NDIlib_recv_capture_v3函数接受一个以毫秒为单位指定的超时值。如果一个帧在调用NDIlib_recv_capture_v3时可用，它将在没有任何内部等待或锁定的情况下返回。如果超时为零，如果有帧，它将立即返回。如果超时时间不为0，它将等待一帧到指定的超时时间，如果它获得了超时时间就返回(如果调用时已经有一帧在等待，它将立即返回该帧)。如果在超时发生之前接收到请求类型的帧，函数将返回接收到的数据类型。由这个函数返回给您的帧必须被释放。

下面的代码说明了如何根据可用的内容接收音频和/或视频;如果没有接收到数据，它将等待一秒钟后返回;

```c++
//这里在SDK文档中有代码
```

如果你愿意，你可以将接收到的视频、音频或元数据帧释放到另一个线程，以确保在接收这些帧时不会丢失帧。在接收端维护一个短队列，允许您以最方便应用程序的方式处理传入数据。如果您总是比实时更快地处理缓冲区，那么这个队列将始终是空的，并且您将以尽可能低的延迟运行。

NDIlib_recv_capture_v3可以返回NDIlib_frame_type_status_change值，表示设备的属性已经改变了。因为连接到一个视频源可能需要几秒钟的时间，所以设备的一些属性不能立即知道，甚至可能在动态中改变。例如，当连接到PTZ摄像机时，可能在几秒钟内不知道它支持PTZ命令集。

当知道这一点时，将返回值NDIlib_frame_type_status_change，指示您应该重新检查设备属性。当一个源改变PTZ类型、记录能力或web用户界面控制时，该值当前被发送。

如果您希望确定是否有任何音频、视频或元数据帧被丢弃了，您可以调用NDIlib_recv_get_performance，它将提供总帧数，s以及由于不能足够快地去队列而被丢弃的帧数。

如果您希望确定音频、视频或元数据上的当前队列深度(以便轮询接收帧是否会立即给出结果)，您可以调用NDIlib_recv_get_queue。

NDIlib_recv_get_no_connections将返回当前活动的连接数，也可以用于检测您所连接的视频源当前是否在线。接收SDK提供的附加功能允许通过NDIlib_recv_send_metadata将元数据向上传递到连接的源。就像在NDI Send SDK中发送元数据帧一样，这是作为一个将要发送的NDIlib_metadata_frame_t结构传递的。计数信息通过NDIlib_recv_set_tally处理。这将采用一个NDIlib_tally_t结构，可用于定义程序和预览可见性状态。计数状态保留在接收端，以便即使连接丢失，在随后恢复计数状态时也能正确设置计数状态。

连接元数据是一个重要的概念，它允许您“注册”某些元数据消息，以便每次建立新连接时，上游源(通常是NDI Send用户)接收这些字符串。请注意，在运行时丢失和建立连接的原因有很多。

例如，如果NDI-Sender脱机，则连接丢失;如果它在稍后的时间恢复在线，连接将重新建立，连接元数据将重新发送。为连接元数据指定了一些标准连接字符串，下一节将对此进行概述。

连接元数据字符串通过NDIlib_recv_add_connection_metadata添加，它接受一个

NDIlib_metadata_frame_t结构。要清除所有连接元数据字符串，并允许替换它们，请调用NDIlib_recv_clear_connection_metadata。

下面提供了一个示例，说明如何向任何曾经与您有联系的人提供产品名称。

```c++
// Provide a metadata registration that allows people to know what we are.
NDIlib_metadata_frame_t NDI_product_type;
NDI_product_type.p_data = "<ndi_product long_name=\"NDILib Receive Example.\" "
 " short_name=\"NDILib Receive\" "
 " manufacturer=\"CoolCo, inc.\" "
 " version=\"1.000.000\" "
 " model_name=\"PBX-42Q\" "
 " session_name=\"My Midday Show\" "
 " serial=\"ABCDEFG\" />";
NDIlib_recv_add_connection_metadata(pRecv, &NDI_product_type);

```

> 注意:当使用高级SDK时，可以为接收分配自定义内存分配器，这将允许您提供用户控制的缓冲区，并解压到。在某些情况下，这可能会提高性能或允许你接收帧到GPU可访问的缓冲区

##### RECEIVER USER INTERFACES

发送方可以提供允许配置的接口。例如，一个NDI转换器设备可能提供一个允许修改其设置的接口;或PTZ摄像机可能提供一个接口，提供对特定设置和模式值的访问。这些接口是通过您可以托管的web URL提供的。

例如，一个转换器设备可能有一个Advanced SDK web页面，该页面通过一个URL(如http://192.168.1.156/control/index.html)提供。为了得到这个地址，你只需调用这个函数:

```c++
const char* NDIlib_recv_get_web_control(NDIlib_recv_instance_t p_instance);
```

这将返回一个表示URL的字符串，如果当前没有与有问题的发送方关联的URL，则返回NULL。由于连接可能需要几秒钟的时间，因此在调用connect之后，此字符串可能无法立即可用。为了避免需要轮询这个设置，请注意，当这个设置已知(或它已经更改)时，NDIlib_recv_capture_v3返回NDIlib_frame_type_status_change的值。

这将返回一个表示URL的字符串，如果当前没有与有问题的发送方关联的URL，则返回NULL。由于连接可能需要几秒钟的时间，因此在调用connect之后，此字符串可能无法立即可用。为了避免需要轮询这个设置，请注意，当这个设置已知(或它已经更改)时，NDIlib_recv_capture_v3返回NDIlib_frame_type_status_change的值。

返回的字符串归应用程序所有，直到调用NDIlib_recv_free_string。下面是一个恢复的例子:

```c++
const char* p_url = NDIlib_recv_get_web_control(pRecv);
if (p_url)
{
 // You now have a URL that you can embed in your user interface if you want!
 // Do what you want with it here and when done, call:
 NDIlib_recv_free_string(pRecv, p_url);
}
else
{
 // This device does not currently support a configuration user interface.
}

```

然后，您可以存储这个URL，并将其作为该设备的选项提供给终端用户。例如，一个PTZ相机或一个NDI转换框可能允许它的设置使用托管的web界面来配置。

对于支持配置功能的资源，NewTek的NDI Studio Monitor应用程序包括如下图右下角所示的功能：

-----此处有右下角小齿轮的图标

当您单击这个齿轮小工具时，应用程序将打开由发送者指定的网页

##### RECEIVER PTZ CONTRO

##### RECEIVERS AND TALLY MESSAGES

视频接收器可以指定源在视频切换器的程序或预览行上是否可见。它会在上游与源的发送方通信，然后它会指示它的状态(请参阅本文档中关于发送方SDK的部分)。发送方获取它的状态，并将其以元数据消息的形式发送给所有接收方：

```xml
<ndi_tally_echo on_program="true" on_preview="false"/>
```

这个消息是非常有用的，允许每个接收器'知道'它的源是否在程序输出。

为了说明这一点，假设一个名为“My Source A”的发送者发送到两个目的地，“Switcher”和““Multi-viewer”。当“Switcher”将“My Source A”置于节目外时，一个计数信息（tally message）从“Switcher”发送到“My Source A”。因此，源“知道”它在节目输出中是可见的。在这一点上，它将向“Multi-viewer”(和“Switcher”)响应它的计数状态，这样接收者就知道“My Source A”在程序外。该功能在NDI工具Studio Monitor应用程序中使用，以便在被监视的源设置了计数状态时显示一个指示器。

##### FRAME SYNCHRONIZATION

在使用视频时，重要的是要意识到信号链的不同部分通常使用不同的时钟。

在NDI中，发送方可以以它想要的时钟速率发送，接收方也会以这个速率接收。然而，在许多情况下，发送者和接收者极不可能共享完全相同的时钟速率。请记住，计算机时钟依赖于晶体，虽然理论上额定相同的频率，但很少真正相同。

例如，您的发送计算机可能有一个额定工作在48000赫兹的音频时钟。然而，它实际上可能运行在48001 Hz或47998 Hz。

类似的差异也会影响接收者。虽然这些差异看起来很小，但随着时间的推移，它们会累积起来造成显著的音频同步漂移。接收器接收到的样本可能比它播放的要多；或者，由于在给定的时间范围内发送的音频样本太少，可能会发生音频故障。自然，同样的问题也会影响到视频源。

解决这些时间差异是很常见的，有一个“帧缓冲区”，并显示最近收到的视频帧。不幸的是，时钟计时的偏差使它不能成为一个完美的解决方案。例如，通常情况下，当发送和接收时钟几乎对齐时(这实际上是最常见的情况)，视频会出现“抖动”。

视频时钟的“时基校正器”(TBC)或帧同步器提供了另一种机制来处理这些问题。这种方法使用迟滞来确定删除或插入视频帧的最佳时间，以实现平滑的视频回放(音频应该使用高阶重采样滤波器动态采样，以自适应跟踪时钟差异)。

很难开发出适用于所有可能出现的不同场景的东西，因此NDI SDK提供了一种实现来帮助您开发实时音频/视频应用程序，而无需承担所涉及的巨大复杂性。

另一种看待SDK组件所做的事情的方法是将其视为将“推”源(即数据从发送端推到接收端的NDI源)转换为“拉”源，其中主机应用程序将数据向下拉。帧同步自动跟踪所有时钟，以实现最佳的视频和音频性能，同时这样做。

除了时间基校正操作，NDI的帧同步也会自动检测和校正可能发生的时间抖动。它在内部处理时间异常，例如那些由网络、发送端或接收端与CPU限制、网络带宽波动等相关的时间错误引起的异常。

帧同步器的一个非常常见的应用是在GPU v-sync定时的屏幕上显示视频，在这种情况下，你应该将传入的时基转换为GPU的时基。下表列出了一些你可能想要使用帧同步的常见场景：

| Scenario                                  | Recommendation                                               |
| ----------------------------------------- | ------------------------------------------------------------ |
| Video playback on a screen or multiviewer | yes - 你希望时钟与垂直刷新同步。在multi - viewer中，你需要对每个视频源进行帧同步，然后在每个v-sync上调用它们并在那时重绘所有的源 |
| Audio playback through sound card         | yes - 时钟应该与你的声卡时钟同步                             |
| Video mixing of sources                   | yes - 所有的视频输入时钟需要同步到你的输出视频时钟。您可以将每个视频输入和帧同步到一起 |
| Audio mixing                              | yes - 你想要所有输入音频时钟与你的输出音频时钟同步。您将为每个音频源创建一个帧同步器，并在驱动输出时调用每个源，请求输出的正确采样数和采样率。 |
| Recording a single channel                | No - 你应该在没有任何重锁的情况下以原始形式记录信号。        |
| Recording multiple channels               | Maybe - 如果你想同步一些输入通道以匹配主时钟，这样它们就可以进行iso编辑，你可能想要对除一个源之外的所有源进行帧同步(允许它们都与一个单一通道同步)。 |

为了创建一个帧同步器对象，你将调用下面的函数(这是基于一个已经实例化的NDI接收器，它将从中获得帧)。一旦这个接收器被绑定到帧同步，你应该使用它来恢复视频帧。

您可以继续使用底层接收器进行其他操作，如计数、PTZ、元数据等。记住，销毁接收端仍然是你的责任——即使当一个帧同步正在使用它(你应该总是在帧同步被销毁后销毁接收端)。

```c++
NDIlib_framesync_instance_t NDIlib_framesync_create(NDIlib_recv_instance_t p_receiver);
```

帧同步被相应的调用销毁：

```c++
void NDIlib_framesync_destroy(NDIlib_framesync_instance_t p_instance);
```

为了恢复音频，下面的函数将从帧同步队列中提取音频样本。此函数将始终立即返回数据，如果没有当前音频数据，则插入沉默。您应该以您想要的音频速率调用它，它将自动使用动态音频采样来使传入的音频信号符合您正在调用的速率。

> 请注意，您没有义务确保您请求的采样率、通道计数和采样数量与输入信号匹配，并且支持所有转换组合。

音频重采样是用高阶音频滤波器完成的。时间码和每帧元数据被插入到最好的音频样本。

此外，如果您指定所需的采样率为零，它将用原始音频采样率填充缓冲区(和音频数据描述符)。如果您指定通道计数为零，它将用原始音频通道计数填充缓冲区(和音频数据描述符)。

```c++
void NDIlib_framesync_capture_audio(
 NDIlib_framesync_instance_t p_instance, // The frame sync instance
 NDIlib_audio_frame_v2_t* p_audio_data, // The destination audio buffer
 int sample_rate, // Your desired sample rate. 0 for “use source”.
 int no_channels, // Your desired channel count. 0 for “use source”.
 int no_samples); // The number of audio samples that you wish to get.
```

返回的缓冲区使用相应的函数释放:

```c++
void NDIlib_framesync_free_audio(NDIlib_framesync_instance_t p_instance,
 NDIlib_audio_frame_v2_t* p_audio_data);
```

这个函数将从帧同步队列中提取视频样本。通过使用时基校正，它总是会立即返回一个视频样本。您可以指定所需的字段类型，然后使用该类型返回可能的最佳帧。

注意:

- 基于字段的帧同步意味着帧同步器尝试匹配字段输入相位和帧请求，以提供最正确的输出字段顺序。

- 相同的帧可以返回多次，如果需要重复匹配计时标准。


假设渐进式视频源可以

1. 正确显示字段0或字段1
2. 字段源可以正确显示渐进式源
3. 字段1在字段0上的显示(或反之亦然)应该不惜一切代价避免。

如果没有接收到任何视频帧，这将返回DIlib_video_frame_v2_t为空(全为零)结构。这允许您确定还没有任何视频，并采取相应的行动(例如，您可能希望以特定的视频格式或黑色显示恒定的帧输出)。

```c++
void NDIlib_framesync_capture_video(
 NDIlib_framesync_instance_t p_instance, // The frame-sync instance
 NDIlib_video_frame_v2_t* p_video_data, // The destination video frame
 NDIlib_frame_format_type_e field_type); // The frame type that you prefer
```

返回的缓冲区使用相应的函数释放:

```c++
void NDIlib_framesync_free_video(NDIlib_framesync_instance_t p_instance,
 NDIlib_video_frame_v2_t* p_video_data);
```

### NDI-ROUTING

使用NDI®路由，您可以在一台机器上创建一个输出，对所有远程系统来说，它看起来就像一个“真实的”视频源。然而，它不是生成实际的视频帧，而是引导观看输出的源接收来自不同位置的视频。

例如:如果你有两个NDI视频源——“Video Source 1”和“Video Source 2”——你可以创建一个名为“视频路由1”的NDI_router，并将它指向“Video Routing 1”。“Video Routing 1”将作为可用的视频源对网络上的任何NDI接收器可见。当接收端连接到“Video Routing 1”时，接收到的数据实际上来自““Video Source 1”。

NDI路由实际上并不通过托管路由源的计算机传输任何数据;它只是指示接收器在希望从路由器接收数据时查看另一个位置。因此，一台计算机可以充当一个路由器，向网络暴露潜在的数百个路由源——而不需要任何带宽开销。该设备可用于网络级的大规模动态源交换

```c++
NDIlib_routing_instance_t NDIlib_routing_create(const NDIlib_routing_create_t* p_create_settings);
```

创建设置允许您为创建的源分配名称和组。一旦创建了源，您可以告诉它从另一个源路由视频

```c++
bool NDIlib_routing_change(NDIlib_routing_instance_t p_instance, const NDIlib_source_t* p_source);
另一个接口是
bool NDIlib_routing_clear(NDIlib_routing_instance_t p_instance);
```

最后，当您完成时，您可以释放

```c++
void NDIlib_routing_destroy(NDIlib_routing_instance_t p_instance);
```

### COMMAND LINE TOOLS

##### RECORDING

##### NDI DISCOVERY SERVICE

NDI发现服务的设计目的是让您使用一个服务器来代替NDI使用的自动发现，该服务器作为NDI源的集中注册中心运行。

这对于那些希望避免大量源产生大量mDNS通信量，或者不可能或不希望多播的安装非常有帮助2。当使用发现服务器时，NDI能够完全以单播模式运行，因此几乎适用于任何安装。发现服务器支持所有NDI功能，包括NDI组。

###### SERVER

使用发现服务器就像在Bin\Utilities\x64\NDI discovery Service.exe中运行应用程序一样简单。

然后，这个应用程序将在您的本地机器上运行一个服务器，该服务器接受与发送方、查找方和接收方之间的连接，并协调所有这些连接，以确保它们彼此都是可见的。

如果希望将发现服务器绑定到单个NIC，那么可以使用指定要使用的NIC的命令行运行它。例如:

> “NDI Discovery Service.exe” -bind 196.168.1.100

注意:如果你在一台独立于SDK的机器上安装它，你应该确保在那台机器上安装了Visual Studio 2019 C runtime，并且满足NDI许可要求。

发现服务支持32位和64位版本，推荐使用64位版本。服务器将使用很少的CPU占用，但是，当有非常多的源和连接时，可能需要RAM和所有源之间的一些网络流量来协调源列表

> 提示:当然，建议您使用静态IP地址，以便任何配置访问它的客户机在动态重新分配IP时不会失去连接。

######  CLIENTS

客户端应该配置为与发现服务器连接，而不是使用mDNS来定位源。当存在发现服务器时，SDK将同时使用mDNS和发现服务器来查找和接收源，从而定位本地网络上没有配置为使用发现的机器上的源。

对于发送方，如果指定了一个发现服务，该mDNS将不会被使用；这些源将只对配置为使用发现服务器的其他查找器和接收器可见。

###### CONFIGURATION

为了为NDI客户端配置发现服务器，您可以使用Access Manager(包含在NDI Tools包中)输入发现服务器机器的IP地址。

要为NDI客户端配置发现服务器，您可以使用Access Manager(包含在NDI Tools包中)输入发现服务器机器的IP地址。

可以使用命令行选项运行Discovery服务器，该选项指定从哪个网络适配器运行：

*DiscoveryServer.exe -bind 192.168.1.100*

这将要求发现服务器只在指定的IP地址上发布消息。同样地，也可以使用以下命令指定发现服务器使用的端口号：

*DiscoveryServer.exe -port 5400*

这允许您在一个非默认端口号上工作，或者在一台机器上为多个源组运行多个发现服务器。如果指定了端口0，那么操作系统将选择一个端口号，并将在运行时显示。

###### REDUNDANCY AND MULTIPLE SERVERS （冗余和多服务器）

在NDI版本5中，完全支持冗余的NDI发现服务器。当配置一个发现服务器时，可以指定一个逗号分隔的服务器列表(例如“192.168.10.10,192.168.10.12”)，然后它们将同时被使用。如果其中一个服务器宕机，那么只要其中一个服务器保持活动，那么所有的源都将一直可见；只要至少有一个服务器保持活动，那么无论其他服务器做什么，所有源都可以看到。

这种多服务器功能还可以用于确保完全独立的服务器，从而允许将源分成不同的组，从而满足许多工作流或安全需求。

##### NDI BENCHMARK （NDI基准数据集）

为了帮助测量NDI的机器性能，我们提供了一个工具，可以在系统的每个核上启动一个NDI流，并测量有多少1080p流可以实时编码。请注意，这个数字反映了最佳情况下的性能，并被设计用来排除网络的任何影响，只测量系统CPU性能。

这可以用于跨机器的性能比较，而且由于NDI在所有平台上都进行了高度优化，所以当在一个典型系统上利用所有合理的机会实现高性能时，它可以很好地衡量总体CPU性能。例如，在Windows上，NDI将使用所有扩展向量指令(SSSE3及以上，包括VEX指令)，而在ARM上，它将在可能的情况下使用NEON指令。

### FRAME TYPES

##### VIDEO FRAMES (NDILIB_VIDEO_FRAME_V2_T)

##### AUDIO FRAMES (NDILIB_AUDIO_FRAME_V3_T)

NDI Audio以浮点方式传递给SDK，并具有一个没有实际限制的动态范围(没有剪切)。

为了定义浮点值如何映射到真实世界的音频电平，假设一个2.0浮点单位峰值对峰值(即-1.0到+1.0)的正弦波代表一个+4 dBU的音频电平，对应的标称电平为1.228 V RMS。

下面提供了两个表，解释了SMPTE和EBU音频标准的NDI音频值之间的关系。

通常，我们强烈建议您利用NDI工具“Pattern Generator”和“Studio Monitor”，它们为不同的音频标准提供适当的音频校准，以验证您的实现是正确的。

##### METADATA FRAMES (NDILIB_METADATA_FRAME_T)

元数据被指定为以null结尾的UTF-8 XML数据。这样做的原因是，任何使用该格式来表示任何类型和长度的数据的人都可以自然地扩展该格式。

XML还具有向后和向前兼容性，因为任何实现都可以很高兴地忽略不理解的标记或参数(这反过来意味着设备应该自然地相互协作，而不需要严格的数据解析集和标准的复杂数据结构)。

如果您希望将自己特定于供应商的元数据放入字段中，请使用XML名称空间。“NDI”XML命名空间是保留的。

> 注意:编写用于发送的合法XML消息是非常重要的。(在接收元数据时，支持格式不正确的XML是很重要的，以防发送方发送了错误的内容。)

如果您希望特定的元数据标志被标准化，请联系我们。

### WINDOWS DIRECTSHOW FILTER

windows版本的NDI®SDK包括一个DirectShow音频和视频过滤器。这对于那些希望构建简单工具并将NDI视频集成到WPF应用程序中的人来说特别有用。

这个过滤器的x86和x64版本都包含在SDK中。如果您希望使用它们，您必须首先使用regsvr32注册这些过滤器。SDK安装将为您注册这些过滤器。可重新分发的NDI安装程序也将安装和注册这些过滤器，用户可以从http://new.tk/NDIRedistV5下载。当然，根据NDI许可协议的条款，您可以在自己的应用程序安装程序中包括过滤器

一旦注册了过滤器，你可以使用GUID实例化它：

```c++
DEFINE_GUID(CLSID_NdiSourceFilter, 0x90f86efc, 0x87cf, 0x4097, 0x9f, 0xce, 0xc, 0x11, 0xd5, 0x73, 0xff, 0x8f);
```

过滤器名称为“NDI Source”。过滤器显示音频和视频的看法，您可以连接到。音频支持浮点和16位，视频支持UYVY和BGRA。

过滤器可以添加到图中，并响应FileSourceFilter接口。它接受格式为 ndi://computername/source 的“文件名”。这将连接到一个特定的“计算机名”上的“源”。例如，要连接到一个名为“MyComputer (Video 1)”的NDI源，你必须转义字符并使用以下URL: NDI://MyComputer/Video+1

要仅仅接收视频流，请使用audio=false选项，如下所示:

*NDI://computername/source?audio=false*

使用video=false选项只接收音频流，如下所示:

*NDI://computername/source?video=false*

附加选项可以使用添加到url的标准方法指定，例如：

*NDI://computername/source?low_quality=true*

*NDI://computername/source?audio=false&low_quality=true&force_aspect=1.33333&rgb=true*

### NDI ADVANCED SDK

##### OVERVIEW

本节NDI高级SDK是为希望提供硬件辅助编码或解码的设备制造商设计的。它遵循与NDI SDK相同的API，因此任何经验、示例代码和文档都可以应用于另一个。

重要的是，NDI高级SDK的这一部分提供了对压缩格式的视频数据的直接访问，这样就可以直接发送和接收视频数据。因此，这个SDK也可能用于其他需要或受益于直接与压缩视频数据交互以发送和接收的任务。

目前NDI高级SDK有两种主要用途：

1. 你可以使用NDI压缩(有时被称为“SpeedHQ”)，高性能和高质量的IFrame视频编解码器。这个SDK中提供了用于本机NDI的FPGA压缩器。

   如果您使用的是SpeedHQ压缩，那么您可能还使用了带有ARM核心和可用于实时压缩的FPGA的(SoC)设备。NDI高级SDK提供了Xilinx和Altera FPGA的NDI编码和解码IP核心，以及示例FPGA项目和参考c++应用程序，包括完整的源代码。

   为了帮助您入门，提供了几个标准开发套件的预构建的可引导的uSD驱动器映像。假设设备有足够的内存带宽(推荐使用多组RAM)，提供的FPGA核心可以在相对适中的FPGA设计上轻松地实时编码4K视频；在最新一代SoC系统上，如果提供足够的网络带宽，它可以轻松编码一个或多个8K流。

2. 如果您正在使用已经拥有可用硬件压缩器的设备进行开发，则可以使用H.264或H.265来处理视频和AAC音频。

因为许多高级SDK系统需要定制工具链，所以NewTek可以提供专门为您的特定系统构建的SDK的编译版本。如果您有这样的要求，请发邮件至sdk@ndi.tv 【官方开始要吃饭了！！】

##### CONFIGURATION FILES

NDI的所有默认设置都是通过配置文件控制的。这个文件位于$HOME/.ndi/ndiconfig.v1.json。它包含多播和单播发送的设置以及供应商信息。这里指定了您的供应商ID，必须在NewTek注册，以便启用压缩数据传递。

默认情况下，配置文件将自动从磁盘加载，并使用这些设置。如果您希望这样工作，您可以简单地重启您的应用程序，当设备上的配置设置被更改，设置将被更新。

另外，NDI创建函数可以以这个配置文件的字符串表示形式传递，允许您通过在运行时重新创建它们来更改发送方和接收方。

在创建设备时可以对p_config_json进行设置，以允许传入配置文件的内存版本。下面的示例展示了如何设置p_config_json(如果这是您指定配置的首选方法)

```json
const char *p_config_json ="{"
 "\"ndi\": {"
"\"vendor\": {"
 "\"name\": \"CoolCo, inc.\","
 "\"id\": \"00000000-0000-0000-0000-000000000000\""
 "}"
 "}"
"}";

```

为任何发送者、查找者和接收者指定每个连接设置的能力是一个非常强大的能力，因为它允许每个连接在每次使用中完全定制，例如，允许为不同的连接类型使用不同的NICs，通过连接手动指定多播，不同的组等等。

配置文件的完整细节在手册的性能和实现细节（*Performance and  Implementation Details*）一节中提供。

##### NDI SDK REVIEW

##### KVM SUPPORT

NDI高级SDK包括通过NDI控制远程KVM支持的设备。这个SDK允许您向标记为支持这些消息的发送方发送键盘、鼠标、剪贴板和触摸消息。这个功能是在一个NDI接收器上实现的，消息从这个接收器发送到发送方以提供KVM控制。

对任何应用程序进行彻底的测试是至关重要的，因为对远程机器的全面支持并不简单，而且有许多边缘情况很难确保解决——例如，对于每一个键盘和鼠标的“按下”，也必须有相应的“释放消息”，否则远程机器将把这解释为“卡住的键”。

本文档介绍了KVM控制所需的所有相关函数。

```c++
bool NDIlib_recv_kvm_is_supported(NDIlib_recv_instance_t p_instance);
```

这个函数将告诉您这个接收连接到的当前源是否能够被KVM控制。这个函数返回的值可能会根据远程源当前是否启用了KVM而改变。如果您正在使用NDIlib_recv_capture_v2从视频源接收数据，那么当该函数返回NDIlib_frame_type_status_change时，您将收到KVM状态可能发生变化的通知。

```c++
bool NDIlib_recv_kvm_send_left_mouse_click(NDIlib_recv_instance_t p_instance);
bool NDIlib_recv_kvm_send_middle_mouse_click(NDIlib_recv_instance_t p_instance);
bool NDIlib_recv_kvm_send_right_mouse_click(NDIlib_recv_instance_t p_instance);
```

当你想发送一个鼠标下(即鼠标点击已经开始)消息到源，这个接收器连接了，然后你会调用这个函数。有一些单独的功能可以让您发送鼠标左键、鼠标中键和鼠标右键单击的消息。要模拟双击操作，您需要发送三条消息;前两个是鼠标点击消息，第三个是鼠标释放消息。重要的是，每个点击消息必须有至少一个鼠标释放消息，否则您所连接的操作系统将继续认为鼠标按钮永远被按下。

```c++
bool NDIlib_recv_kvm_send_left_mouse_release(NDIlib_recv_instance_t p_instance);
bool NDIlib_recv_kvm_send_middle_mouse_release(NDIlib_recv_instance_t p_instance);
bool NDIlib_recv_kvm_send_right_mouse_release(NDIlib_recv_instance_t p_instance);
```

当您希望向源发送鼠标释放消息时，您将调用这些函数中的一个。它们模拟鼠标消息的释放，并且总是在发送鼠标单击消息之后发送。

```c++
bool NDIlib_recv_kvm_send_vertical_mouse_wheel(NDIlib_recv_instance_t p_instance, const 
float no_units);
bool NDIlib_recv_kvm_send_horizontal_mouse_wheel(NDIlib_recv_instance_t p_instance, const 
float no_units);

```

要模拟鼠标滚轮更新，您将调用此函数。你可以模拟一个垂直或水平的车轮更新，它们在大多数平台上是独立的控件。浮点单元表示您希望鼠标滚轮移动的“单元”的数量，1.0表示向下或向右移动单个单元。

```c++
bool NDIlib_recv_kvm_send_mouse_position(NDIlib_recv_instance_t p_instance, const float posn[2]);
```

要设置鼠标光标的位置，你可以调用这个函数。坐标在与分辨率无关的设置中指定，范围为0.0 - 1.0，用于连接的当前显示。屏幕的分辨率可以知道，如果你从那个设备接收视频源，这可能会在飞行中改变。位置(0,0)位于屏幕左上角。Posn[0]是鼠标光标的x坐标，Posn[1]是鼠标光标的y坐标。

```c++
bool NDIlib_recv_kvm_send_clipboard_contents(NDIlib_recv_instance_t p_instance, const char* 
p_clipboard_contents);
```

为了将一个新的“剪贴板缓冲区”发送到目的地，我们需要调用这个函数，并传递一个以空结束的字符串，该字符串表示将放置在目的地机器缓冲区上的文本。

```c++
bool NDIlib_recv_kvm_send_touch_positions(NDIlib_recv_instance_t p_instance, const int no_posns, const float posns[]);
```

这个函数将向这个接收器连接的源发送一个触摸事件。在传输的阵列中可以有任意数量的同时接触点。no_posns的值表示当前使用了多少个触摸点，而posns[]数组是触摸位置的[x,y]浮点坐标的列表。这些位置的处理精度比许多系统上的屏幕分辨率更高，(0,0)表示屏幕的左上角，(1,1)表示屏幕的右下角。举个例子，如果有两个接触位置，那么posns[0]是第一个位置的x坐标，posns[1]是第一个位置的y坐标，posns[2]是第二个位置的x坐标，posns[3]是第二个位置的y坐标。

```c++
bool NDIlib_recv_kvm_send_keyboard_press(NDIlib_recv_instance_t p_instance, const int key_sym_value);
```

为了发送键盘按下事件，这个函数被调用。键盘消息使用标准的X-Windows Keysym值。为了方便您，NDI SDK中包含了用于这些的标准定义的副本，文件名为“Processing.NDI.KVM.keysymdef.h”。由于该文件包含许多#定义，所以当你简单地包含NDI SDK文件时，默认情况下它是不包含的，如果你希望它被包含，你可以\#define NDI_KVM_INCLUDE_KEYSYM 或简单地手动包含该文件到你的应用程序中。对于每个按键按下事件，发送一个键盘释放事件是很重要的，否则目的地会认为有一个“卡住的键”!关于keysym值的其他信息可以很容易地在网上找到，例如https://www.tcl.tk/man/tcl/TkCmd/keysyms.html

```c++
bool NDIlib_recv_kvm_send_keyboard_release(NDIlib_recv_instance_t p_instance, const int key_sym_value);
```

































