# Quote API

### Requirements

Node 安装 v10版本

```
https://nodejs.org/dist/latest-v10.x/node-v10.23.1-linux-x64.tar.gz
```

### Getting started

```

# 安装依赖
npm install

# 修改配置文件
cp env.sample .env
vi .env

# 运行
配置好所有配置项后，在服务器上 quote-api根目录，执行命令，   `pm2 start src/index.js`    启动服务
```



### 部署说明

1. 修改abi.json文件中所有合约的地址。

   abi.json 将主网合约地址都替换后，将abi.json上传到网站根目录， http://soteria.finance/abi.json 可以访问。

   注意：升级合约后，合约地址如果有变化，必须要修改abi.json合约中对应地址，不然无法正确对保险进行报价。

2. 将abi.json上传到网站根目录，可以通过url进行访问。

3. 在当前目录中找到`.env`项目配置文件，将上面访问abi.json的url配置到`VERSION_DATA_URL`

4. 拿到mongodb实例的url连接，在`.env`中配置到`MONGO_URL`

5. 配置私钥，该私钥是对报价进行签名私钥，保险合约中会对所有报价使用该私钥对应的公钥进行签名验证。

6. 配置bsc rpc链接。

配置完毕，启动quote-api。

### 白名单维护
`src/models/contract-whitelist.js`文件第14行
* 修改`http://soteria.fund/contracts.json`路径,上传`contracts.json`到网站根目录。
