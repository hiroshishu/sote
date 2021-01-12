## 名词解释
- Cover: 保险
- Cover状态：
```
        Active, 
        ClaimAccepted, 
        ClaimDenied, 
        CoverExpired, 
        ClaimSubmitted, 
        Requested 
```


## 投保步骤
* 首先支付会员费成为会员
* 选择需要投保的合约地址，填写保额，填写保险期限（最低30天）
* 支付保费（可以使用BNB和SOTE两种币进行支付）
* 购买保险成功。

## 报价系统 quote-api
#### 1. 【购买保险】使用SOTE币支付保险费
* 用户在页面操作，选择了要买保险的合约，在前端页面中填写了购买保险承保金额和保险时长。使用用户填写的数据。从quote-api获取报价
  `http://api.soteria.fund/v1/quote?coverAmount=10&currency=BNB&period=30&contractAddress=0x00000000219ab540356cBB839Cbe05303d7705Fa`
* coverAmount 整整数，表示10个BNB的保费
* currency 目前只支持BNB计价的保险
* period 单位为天
* contractAddress 保险的合约。
--------------------
* quote-api会返回签名好的数据,如下实例
```
{"currency":"BNB","period":"30","amount":"10","price":"393592980512036997","priceInNXM":"3858753973056222999","expiresAt":1606981808,"generatedAt":1606981507092,"contract":"0x00000000219ab540356cbb839cbe05303d7705fa","v":27,"r":"0x97bb563179d78ebe7a9478a316f6a59a354b159eb32dc29f7ee3379fc4c7962d","s":"0x100a5970fb470d54c562fe5e9d266b05aaf0bee408f9d3c7cab58dcf843c25b8"}
```
* price 表示该用户选择的保险需要支付的保费，BNB计价数量
* priceInNXM 表示用户选择的保险需要支付的保费，用SOTE币支付的数量
* expiresAt 这笔报价签名过期时间，一般是当前时间+5分钟。表示拿到quote-api数据后，该用户如果不操作购买的话，这笔报价就无法使用，需要重新从quote-api拿新的报价数据。
* generatedAt 报价生成时间戳
* contract 要购买保险的合约地址
* v,r,s为签名数据，购买保险需要提交到链上验证。
 -----------------------
* Quotation合约 `makeCoverUsingNXMTokens(uint[] memory coverDetails,uint16 coverPeriod,bytes4 coverCurr,address smartCAdd,uint8 _v,bytes32 _r,bytes32 _s)`
* 首先使用quote-api的数据构造coverDetails数据，coverDetails为数组。
  `["10","393592980512036997","3858753973056222999","1606981808","1606981507092"]`
  数组数据来自quote-api
  `[amount, price, priceInNXM, expiresAt, generatedAt]`
* coverPeriod 为当前这笔保险的保险天数，30
* coverCurr 为“BNB”字符串的byte8,为 0x424e4200
* smartCAdd 为当前这笔保险的保险合约地址，为 0x00000000219ab540356cbb839cbe05303d7705fa
* v,s,r 为当前报价签名quote-api返回数据中的v,r,s
* 注意：用户使用SOTE支付保险，需要有足额对TokenController合约的approve
#### 2. 【购买保险】使用BNB支付保险费
* Pool1合约 `function makeCoverBegin(address smartCAdd,bytes4 coverCurr,uint[] memory coverDetails,uint16 coverPeriod,uint8 _v,bytes32 _r,bytes32 _s )`
* 参数如上构造方式一致；
* 注意：调用该方法需要同时支付BNB，BNB数量为quote-api返回数据price数量。