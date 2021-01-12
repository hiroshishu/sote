# A. off-chain services
|index|	name	     |	full name      |	备注	|
|---  |	 -----	     | -----------------|	---	|
|a    |quote         |quote-api service	 | 报价服务		      |
|b    |mcr + runner  |mcr service	     | mcr, 	          |
|c    |bot	        |timer service	 	 |oraclize replacement|
|d    |dapp         |web service	 	 |                    |

## 1. quote-api
## 2. mrc service
## 3. bot
## 4. pooled staking process runner
## 5. dapp

-----------------------------------------------------------------------------
-----------------------------------------------------------------------------
# B. on-chain contracts
|	index	|	name	|	full name             	|	备注	|
|	 ---	|	 -----	|	 --------------------	|	---	|
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
|	19|	CSI	|	CommunityStakingIncentives	|		|

-----------------------------------------------------------------------------
-----------------------------------------------------------------------------



