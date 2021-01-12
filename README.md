# A. 接口
## 1. membership
- payJoiningFee: Allows user to pay joining fee and become a member of the mutual
- kycVerdict: Registers KYC status against ethereum address
- withdrawMembership: Allows members to terminate membership
## 2. swap
## 3. cover. 购买保险
## 4. pooled staking. 承包人staking
## 5. claim assessment. 索赔与赔付投票
## 6. governance


-----------------------------------------------------------------------------
-----------------------------------------------------------------------------
# B. 修改工作
## 1. 增加sote和bnb交易池
## 2. 取代oraclize
## 3. 删除dai相关代码

-----------------------------------------------------------------------------
-----------------------------------------------------------------------------
# C. onchain contracts & offchain services
|	index	|	name	|	full name             	|	备注	|
|	 ---	|	 -----	|	 --------------------	|	---	|
|	a|quote|quote-api service	 |		|
|	b|mcr	  |mcr service	     |		|
|	c|timer	|timer service	 	 |oraclize replacement|
|	1	|	CD	|	ClaimData	       |		|
|	2	|	CL	|	Claim1	         |		|
|	3	|	CR	|	ClaimsReward	   |	rewarding or punishing the Claim assessors/Members based on the vote cast and the final verdict	|
|	4	|	GV	|	Governance	     |	Proxy	|
|	5	|	MC	|	Mcr	             |recording the Minimum Capital Requirement (MCR) of the system, each day, thus determining the NXM token price.		|
|	6	|	MR	|	MemberRoles	     |	Proxy	|
|	7	|	NXMASTER	|	NXMaster   |	Proxy	|
|	8	|	NXMTOKEN	|	NXMtoken   |	ERC-20 compilant token	|
|	9	|	P1	|	Pool1	           |calling External oracles through Oraclize and processing the results retrieved|
|	10|	P2	|	Pool2	           |		|
|	11|	PC	|	ProposalCategory |Proxy	|
|	12|	PD	|	PoolData	       |		|
|	13|	QD	|	QuotationData	   |		|
|	14|	QT	|	Quotation	       |contain all logic associated with creating and expiring covers		|
|	15|	TC	|	TokenController  |Proxy. ERC-1132 compilant contract, operator for NXMToken	|
|	16|	TD	|	TokenData		     | Contains all data related to tokens|
|	17|	TF	|	TokenFunction	   |all token related non-standard functions specific to Nexus Mutual	|
|	18|	PS	|	Pooled Staking	 |Proxy	|

-----------------------------------------------------------------------------
-----------------------------------------------------------------------------



