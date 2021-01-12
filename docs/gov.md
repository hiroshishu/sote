## 名词解释
- member: sote会员
- ab：Advisory Board. [sote项目方管理员地址](https://github.com/devsoteria/sote/issues/88)，一般是5个，有高级权限
- 提案分类category: 每个提案归属于9个分类之一. 分类定义了属于该分类提案的：
```
- action，
- closing time
计算投票是否通过的几个阈值参数:
- quorumPerc
- majorityVotePerc
- categoryABReq
```
- action：定义了提案通过后执行哪个合约的哪个接口
- action waiting time:
- 提案状态：
```
        Draft,
        AwaitingSolution,
        VotingStarted,
        Accepted,
        Rejected,
        Denied
```


## 治理步骤
- 所有member可以创建提案
- 必须先对提案分类才可以投票。仅ab可对提案分类
- 分类后，提案owner输入提案通过后将要执行的[参数]()
- 开始投票，投票开放窗口为closing time，7d
- closing time到了后，任何人可以关闭投票环节
- 投票环节结束后，如果提案是rejected或者denied状态，提案进入最终状态
- 投票环节结束后，如果提案是[Accepted]()状态，任何人可以在action waiting time，1d， 后触发提案action，然后提案进入最终状态


___
## 计票规则：
1. 持有sote数量1：1计算票。
2. 当该会员持有SOTE超过SOTE总供应量的5%，投票按照sote总供应量5%计票。

### 1. 提案核算结果，如果没有过期
首先计算quorumPerc

- a:  voteTallyData(_proposalId, 0)第1个返回值 + voteTallyData(_proposalId, 1)第1个返回值
- b：sote总供应
- c:  所有会员数量
```
quorumPerc = a * 100  / (b + c * 10^18)
```

* 如果quorumPerc >= 15%进入：
  投同意的达到majorityVotePerc 50%，提案通过。
  否则，提案拒绝。

* 如果quorumPerc < 15%进入：
  AB会员一人一票，同意需要达到categoryABReq 60%则提案通过。
  否则，提案拒绝。

### 2. 提案核算结果，如果已经过期
* 提案起草阶段：发起提案后，如果超过maxDraftTime，提案状态变为拒绝。
* 如果超过投票时间，将无法关闭提案，无法对该提案投票。

### 3. 调整QuotationData合约投票为例
gov合约发起投票调用 QuotationData合约 `updateUintParameters(bytes8 code, uint val)` 修改全局参数。

```
_addInitialCategories("Update Quotation Parameters", "QmTtSbBp2Cxaz8HzB4TingUozr9AW91siCfMjjyzf8qqAb", 
            "QD", 50, 15, 2, 60);
```
* 这里的50为majorityVotePerc，多数票百分比。
* 这里的15为quorumPerc，The minimum % of members required to vote on a proposal. A proposal is denied if quorum % is not reached.
* 这里的2表示该项提案都是所有会员参与投票。
* 这里的60 categoryABReq表示AB会员投票通过百分比。


___
## 合约治理参数 `updateUintParameters(bytes8,uint256)`

|合约                    | 合约中参数或函数 | code(根据code指定对应参数，byte8)| 备注         |
| ---                    | ---           | ---                          |         ---   |
|TokenData             | _setTokenExponent | TOKEXP             |  token指数，用于内部计算mcr |
|  | _setPriceStep | TOKSTEP  |  价格梯度，用于bnb swap sote价格控制 |
|  | _changeSCValidDays | RALOCKT  |  系统未使用到参数 |
|  | _setStakerCommissionPer | RACOMM  | 购买保险费用的%给与staker激励  |
|  | _setStakerMaxCommissionPer | RAMAXC  | 购买保险费用的%给与staker激励上限  |
|  | _changeBookTime | CABOOKT  | staker投票sote锁定时间，该时间内不允许再次投票  |
|  | _changelockCADays | CALOCKT  |  CA投票sote锁定天数 |
|  | _changelockMVDays | MVLOCKT  |  MV投票sote锁定天数 |
|  | _setLockTokenTimeAfterCoverExp | QUOLOCKT  |  cover过期后设置该cover更多的锁定时间 |
|  | _setJoiningFee | JOINFEE| 注册会员费用|
|Governance | tokenHoldingTime | GOVHOLD | 会员在gov投票sote锁定时间|
|  | maxDraftTime | MAXDRFT | 提案最大起草时间 |
|  | SOTEMaster updatePauseTime | EPTIME | 系统暂停时间 |
|  | actionWaitingTime | ACWT |投票结束后，要过ACWT才能触发提案
|QuotationData | _changeSTLP | STLP | 系统未使用到参数 |
|  | _changeSTL | STL | 系统未使用到参数 |
|  | _changePM | PM | 系统未使用到参数 |
|  | _changeMinDays | QUOMIND | Cover最低时间（天） |
|  | _setTokensRetained | QUOTOK | 用户每次发起索赔，消耗的抵押sote数量% |
|ClaimsData | _setMaxVotingTime | CAMAXVT|索赔投票最大时间|
|  | _setMinVotingTime | CAMINVT|索赔投票最小时间|
|  | _setPayoutRetryTime | CAPRETRY|系统支付索赔支付重试间隔时间。场景发生于用户索赔投票成功后，系统资金不足以支付索赔金额，稍后支付，系统会尝试多次|
|  | _setClaimDepositTime | CADEPT| 索赔投票，需要锁仓sote的时间（天） |
|  | _setClaimRewardPerc | CAREWPER| 索赔投票后投票参与人按比例分的该笔cover支付费用的%|
|  | _setMinVoteThreshold | CAMINTH|索赔投票最小投票阈值|
|  | _setMaxVoteThreshold | CAMAXTH|索赔投票最大投票阈值||
|  | _setMajorityConsensus | CACONPER| 一致意见达成比例%|
|  | _setPauseDaysCA | CAPAUSET|索赔投票参与人，投票限制间隔的时间（天）|
|PoolData | _changeMCRTime | MCRTIM |mcr数据提交间隔时间|
|  | _changeMCRFailTime | MCRFTIM | mcr提交失败间隔时间|
|  | _changeMinCap | MCRMIN|最低资产要求|
|  | _changeShockParameter | MCRSHOCK|系统承保总额比例%，用于内部计算mcr|
|  | _changeCapacityLimit | MCRCAPL| 资产阈值|
|  | _changeVariationPercX100 | IMZ| 资金储备比例%|
|  | _changeIARatesTime | IMRATET|喂价时间间隙|
|  | _changeUniswapDeadlineTime | IMUNIDL|系统暂未使用到参数|
|  | _changeliquidityTradeCallbackTime | IMLIQT|资金储备交易时间间隙|
|  | _setEthVolumeLimit | IMETHVL|深度阈值，资金储备比例%|
|  | _changeC | C |C值，用于初始化系统中SOTE价格|
|  | _changeA | A |A值，用于初始化系统中SOTE价格|
|SOTEMaster | TokenData changeWalletAddress | MSWALLET |会员费接收地址|
|  | PoolData changeNotariseAddress | MCRNOTA |MCR数据提交权限地址，用于mcr定时提交机器人|
|  | MemberRoles swapOwner | OWNER | gov投票的owner地址 |
|  | QuotationData changeAuthQuoteEngine | QUOAUTH | 报价服务器签名报价数据地址，该地址不需要储备gas费|
|TokenController|   minCALockTime = val.mul(1 days) | MNCLT| 索赔CA投票最低SOTE锁仓时间|
