# Ubuntu设置

sudo apt-get update

sudo apt-get upgrade

查看网络服务：

> 查看服务器否开启：netstat -tlp
>
> 启动服务：sudo /etc/init.d/ssh start
>
> 重启服务：sudo /etc/init.d/ssh restart

安装ssh：sudo apt install openssh-server

确认是否正常：sudo systemctl status ssh

Ubuntu 自带一个配置防火墙配置工具UFW。如果防火墙在你的系统上被启用，请确保打开了 SSH 端口：sudo ufw allow ssh

允许root用户远程登录：

在终端上输入 sudo vi /etc/ssh/sshd_config ，进入配置文件，将PermitRootLogin的注释去掉，然后将后面的参数值改为yes

然后重启ssh服务： service sshd restart

安装FTP服务：sudo apt-get install vsftpd

权限设置：sudo vi /etc/vsftpd.conf 命令，将 #write_enable=YES 前面的#去掉，然后保存

然后重启ftp服务：sudo /etc/init.d/vsftpd restart

接下来就可以用 FileZilla工具连接了！工具下载地址：https://www.filezilla.cn/download

------

安装编译工具：sudo apt install build-essential

查看版本信息：

> gcc --version
>
> g++ --version

------

更新下载慢怎么办：

设置 --》关于 --》软件更新 --》下载自：http://mirrors.aliyun.com/ubuntu

------

## Ubuntu安装VSCode编译和调试

***以编译NDI官方examples为例***

首先，确认系统的gcc 、 g++、gdb 是否为安装

然后，在应用商店找到VSCode，并安装。

在VSCode中，下载插件：C/C++ , C/C++ Extension Pack , Code Runner, Makefile Tools

接下来，用VSCode打开 NDIlib_Find 文件夹，则建立了工作区。此时，IDE会提示生成一个配置文件 c_cpp_properties.json ，如不提示则ctrl+shift+P选择C/C++:Edit Configurations，然后，根据需要配置 includePath ，成功后，则编辑器中的cpp文件中可以找到包含NDI下的include目录文件。

然后，运行此cpp，进行调试。ctrl+shift+P，选择 Tasks::ConfigureTasks，配置编译的相关参数。

1. 查看command是否为我们需要的g++

   > gcc -dumpmachine 可以收集到当前编译器的目标机型

2. 设置arg参数：
   - -g	编译生成调试信息
   
   - -std=c++11   标准库使用版本
   
   - -pthread     多线程编译加此参数
   
   - -I    （大写I）设置include路径
   
   - -L   （大写L）设置lib路径
   
   - -l    （小写L）设置要连接的文件，例如 -lndi，则会在设置的路径中，查找 libndi.so文件。其中，lib和.so是编译器默认加上的。[ 配置中添加了 -lndi -ldl]
   
   - -Wl    设置编译选项
     - -Wl,--rpath='$ORIGIN'		这个可以在开发版时候，为编译好的执行程序设置搜索动态库位置。变量$ORIGIN是当前执行文件所在目录地址。
     
       > 我们可以用命令行  readelf -d ./NDIlib_Find 查看动态节的RUNPATH
     
     - -Wl,--allow-shlib-undefined       就是让你链接时用的一个版本的so，运行时加载用的另外一个版本的so，可能你的加载时的so里面有这个符号，所以就先让你找不到符号也编译通过了。
     
       > ？？这应该是为啥，运行的时候会加载libndi.so.5 而，编译的时候只需要 libndi.so的原因么？
     
     - -Wl,--as-needed      链接过程中，链接器会检查所有的依赖库，没有实际被引用的库，不再写入可执行文件头。最终生成的可执行文件头中包含的都是必要的链接库信息。-Wl,--no-as-needed 选项不会做这样的检查，会把用户指定的链接库完全写入可执行文件中。
   
   设置内容像这样：
   
   ```json
   {
   	"version": "2.0.0",
   	"tasks": [
   		{
   			"type": "cppbuild",
   			"label": "C/C++: g++ 生成活动文件",
   			"command": "/usr/bin/g++",
   			"args": [
   				"-fdiagnostics-color=always",
   				"-g",
   				"${file}",
   				"-std=c++11",
   				"-pthread",
   				"-o",
   				"${fileDirname}/${fileBasenameNoExtension}",
   				"-I",
                   "/home/wwh/Documents/NDI SDK for Linux/include",
   				"-L",
   				"/home/wwh/Documents/NDI SDK for Linux/lib/x86_64-linux-gnu",
   				"-Wl,--rpath='$ORIGIN'",
   				"-Wl,--allow-shlib-undefined",
   				"-Wl,--as-needed",
   				"-lndi",
   				"-ldl"
   			],
   			"options": {
   				"cwd": "${fileDirname}"
   			},
   			"problemMatcher": [
   				"$gcc"
   			],
   			"group": "build",
   			"detail": "编译器: /usr/bin/g++"
   		}
   	]
   }
   ```
   
   之后，我们就可以加断点对程序代码文件进行调试了。方便很多~

