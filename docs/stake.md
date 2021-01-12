# 名词解释
- project: 一个可以被投保的defi合约
- deposit: 从账户余额扣sote存入soteria系统中
- deposited_sote: 当前该账户deposit的sote总数
- stake: 用deposited_sote去stake多个project
  总数不能超过deposited_sote*10，每个project最多stake deposited_sote个sote
  每个project最少20个sote. 每次stake，不扣sote账户余额
- unstake: 每次至少unstake 20个，或者全部。成功后,账户余额sote不增加。unstake过程需要90天
  If you unstake from a project you will enter a 90 day lock up period. During this time you will continue to receive SOTE rewards and can still lose some (or all) of your deposit if a successful claim is made.
- Withdraw_deposited: 可以把deposited_sote-max(staked)个sote提取到账户余额，立即到账
- Withdraw_stake_reward: 保险到期或者被拒，会因为stake过这个project而收到奖励。提取后立即到账


# 流程
## 1. 如何增加project
- 编辑frontend/public/data/contracts.json

