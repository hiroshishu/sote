# sote项目2个阶段
1. 在bsc测试网上搭建一套环境，不修改任何业务参数，业务流程完全跑通。
2. 根据甲方要求修改业务参数，并跑通相关业务流程


# 阶段一: 在bsc测试网部署sote合约，并跑通业务流程
|	序号 |	任务	                      |	状态	                                  |	备注	|
|	 ---|	 --------------------------	|	 -------------------------------------	|	 ---	|
|	1   |	部署注册/注销会员合约          |	done                                	|	MemberRoles: 0xD6B3e3594cCC72041A9E1B1b4e7072e73298Ba77|
|	2-1	  |	通过web注册/注销会员         |		                                     |	          |
|	2-2	  |	通过web用bnb买sote币         |		                                     |	          |
|	3	  |	sote在会员之间转账 	          |		done                                 |SOTEerc20: 0x6Ecbe1DB9EF729CBe972C83Fb886247691Fb6beb		|
|	4	  |	使用gov地址能够操作修改合约任意参数	|	done	|		|gov:0x5409ED021D9299bf6814279A6A1411A7e866A631
|	5	|	开发修改优化oracleize在合约里的依赖	|	done	|	目前来看只需要删除调用oracleize的地方，因为数据可以通过函数提交到系统中。定时触发只需要在链下程序中做。	| 
|	6	|	使合约仅支持一种币BNB	|	done	|		|
|	7	|	会员可以使用BNB换SOTE（swap）	|	done	|		|
|	8	|	会员可以购买保险	|		|		|
|	9	|	会员可以发起索赔	|		|		|
|	10	|	会员可以领取过期保险没进行索赔的SOTE币	|		|		|
|	11	|	会员可以对多个合约抵押NXM进行承保，并可能领取年化收益	|	done	|		|
|	12	|	quote-api测试网搭建	|	进行中	|		|
|	13	|	gov治理模块部署，替换单一gov地址，使项目去中心化	|		|		|
|	14	|Earn rewards by becoming a Nexus Mutual Claims Assessor		|		|		|
|	15	|		|		|		|
|	16	|		|		|		|
|	17	|		|		|		|
|	18	|		|		|		|
|	19	|		|		|		|
|	20	|		|		|		|

# 阶段二: 修改参数，并跑通业务流程
|	序号 |	任务	                      |	状态	                                  |	备注	|
|	 ---|	 --------------------------	|	 -------------------------------------	|	 ---	|
|	1	  |		|		|		|
|	2	|		|		|		|
|	3	|		|		|		|
|	4	  |		|		|		|
|	5	|		|		|		|
|	6	|		|		|		|
|	7	|		|		|		|
|	8	|		|		|		|
|	9	|		|		|		|
|	10	|		|		|		|



