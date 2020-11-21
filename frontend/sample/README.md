#  web3 开发

## 开发环境
1. Mac, Nodejs v10.20.0
2. 安装metamask钱包插件的chrome浏览器

## 编译合约
1. 将需要编译的合约直接放在`contracts`目录
2. 下载truffle框架
``` npm install -g truffle ```
3. 编译合约
进入项目根目录，执行
``` truffle compile ```
这样就得到了我们web3需要的合约实例文件。合约编译后，编译结果在`build/contracts`目录。
得到我们需要的合约ABI文件`Counter.json`,将该json文件放在`src`目录下。
我们完成了非常关键的一步。

4. 部署合约，拿到合约的地址，在`src/js/app.js`第8行填写要交互的counter合约。 

5. 接下来，参考`src/js/app.js`参考web3开发与合约交互过程。前端显示的逻辑在`src/index.html`中。

## web3安装部署说明

1. 安装.
    ```javascript
    npm i
    ```

2. 启动web服务.
    ```javascript
    npm run dev
    ```
3. 打开chrome浏览器，访问 http://localhost:3000/