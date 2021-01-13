# pooled-staking-process-runner

Runs on a continous basis to call the `.processPendingActions` method of the PooledStaking.sol contract to 
ensure all pooled staking actions (stakes, burns, rewards) are processed.

## Setup and run

### Configuration

Setup your environment variables as shown in the provided `env.sample` file.
`env.sample`文件配置好后，重命名为`.env`

| Option name | Description |
| ------------- |:-------------:|
| PRIVATE_KEY | Ethereum address private key containing ETH funds to spend on gas.
| PROVIDER_URL | Provider URL used by Web3. |
| POLL_INTERVAL_MILLIS | Polling interval to check if there are pending intervals. |
| DEFAULT_ITERATIONS | Default number of iterations used by processPendingActions |
| MAX_GAS | How much gas to use at most. If it is exceeded, the number of used iterations is halved. |
| MAX_GAS_PRICE_GWEI | Max gas price in GWEI that it's allow to use. Stops processing until the price falls under this treshold.
| NETWORK | Network name. Possible values: mainnet, kovan 


### Run
```$xslt
npm i
npm start
```
不使用npm start启动
配置好所有配置项后，在服务器上 soteBOT根目录，执行命令，   pm2 start src/index.js    启动服务
