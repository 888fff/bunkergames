## 本地部署Qwen

### 所需食材

Miniconda，CUDA，pytorch

auto-gptq，optimum，bitsandbytes ，transformers_stream_generator，tiktoken，deepspeed，flash-attention

### 食材处理

#### Miniconda

Windows版本下载官方地址：

```text
https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe
```

安装完成后，执行：

```
conda init
```

为了加速下载，我们需要更改配置，修改下载源。国内有许多优质的源，方便日后调用下载，我们进行如下操作进行修改。

首先，我们打开开始菜单miniconda3的Anaconda Prompt (miniconda3)，输入：

```
notepad .condarc
```

然后打开下面的镜像网站，找到这个位置，复制全部，然后粘贴到刚刚打开的”.condarc“文本内，点保存：

![image-20231226101150429](K:\bunkergames\work_doc\img\部署Qwen\image-20231226101150429.png)

输入以下命令，把他原来的配置清除掉，确保我们的配置搞上去！

```
conda clean -i
```

然后我们返回到镜像仓库网页上，往下拉，找到第三方源列表，这里你可以根据自己干项目的需求，配置源，那我们第一个就需要“conda-forge”的源，复制他下面的源。

<img src="K:\bunkergames\work_doc\img\部署Qwen\image-20231226101357449.png" alt="image-20231226101357449" style="zoom:67%;" />

然后我们去到窗口Anaconda Prompt (miniconda3)，粘贴回车。

下面这两个源，也是建议要换的：

```text
conda config --set custom_channels.nvidia https://mirrors.cernet.edu.cn/anaconda-extra/cloud/
pip config set global.index-url https://mirrors.cernet.edu.cn/pypi/web/simple
```

#### CUDA

CUDA安装直接寻找Nvidia官网即可，找到对应的显卡支持的CUDA版本即可。如果按照完成，我们可以通过

```
nvidia-smi # 查看当前 GPU 支持的最高 CUDA 版本
```

#### Pytorch 

去官网查找合适的版本：https://pytorch.org/get-started/locally/

然后将地址在Anaconda Prompt 中输入：

```
conda install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia
```

安装完成后，可以通过如下口令验证安装是否成功：

```
python
import torch
#pytorch的版本
torch.__version__
#是否支持CUDA
torch.cuda.is_available()
#CUDA的版本
print(torch.version.cuda)
#cuDNN的版本
print(torch.backends.cudnn.version())
#GPU内存
torch.cuda.get_device_capability(device=0)
```

### 料理方法‘

首先创建一个新的环境，并切换到这个新环境中。

```
conda create -n model310 python=3.10
conda activate model310
```

用Git下载Qwen的项目，先切换到目的目录下，然后安装各种库

```
D:
git clone https://github.com/QwenLM/Qwen.git
#安装modelscope基础库
pip install modelscope
#然后安装量化依赖
pip install auto-gptq optimum
#然后安装量化包，这个向量化包应该过期了，可以去git上下载编译好的whl
pip install bitsandbytes --prefer-binary --extra-index-url=https://jllllll.github.io/bitsandbytes-windows-webui
#安装其他依赖项
pip install transformers_stream_generator
pip install tiktoken
pip install deepspeed
#选安装flash-attention库，例如，选取合适的版本即可
git clone -b v1.0.8 https://github.com/Dao-AILab/flash-attention
cd flash-attention
pip install .

```

截至本文写作时，各种库的版本差不多是这样的：

```
auto-gptq 0.5.1
deepspeed 0.3.16
bitsandbytes 0.38.1
#如果国内镜像源的版本低，可以在安装的时候加默认的PIP源
--extra-index-url=https://pypi.org/simple/
```

然后，下载训练好的模型，入口在这里，选择合适的模型：

```
https://github.com/QwenLM/Qwen/blob/main/README_CN.md
```

接下来，将启动的配置文件进行修改，cli_demo.py，在如下地方：

```python
DEFAULT_CKPT_PATH = './Qwen/Qwen-7B-Chat-Int4'
```

最后，启动就可以正常推理了

```
>> python cli_demo.py
```

如果你需要用网页版的，可以直接用这个指令，安装gradio

```
pip install gradio mdtex2html
```

安装后启动也很简单

```
>> python web_demo.py
```

### 营养介绍

