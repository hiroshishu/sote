# 名词解释
- AB会员: Advisory Board, 共5个地址, AB同意后，一个提案才能进入投票阶段
- 成员状态
```
    enum Role {UnAssigned, AdvisoryBoard, Member, Owner}
```
- 提案状态
```
    enum ProposalStatus { 
        Draft,
        AwaitingSolution,
        VotingStarted,
        Accepted,
        Rejected,
        Majority_Not_Reached_But_Accepted,
        Denied
    }
```
- 提案字段
```
    struct ProposalData {
        uint propStatus;
        uint finalVerdict;
        uint category;
        uint commonIncentive;
        uint dateUpd;
        address owner;
        string title;
        string desc;
    }
```

# 提案流程
## 1. 会员createProposal， 状态变为：draft
## 2. AB对提案分类，并设置激励. 状态变为：AwaitingSolution
```
categorizeProposal
```
## 3. 提案创建人输入要更新的参数和值， 状态变为：VotingStarted
```
submitProposalWithSolution
```
## 4. 全体会员投票
```
submitVote(uint _proposalId, uint _solutionChosen)

```
## 5. 投票比例达到阈值，或者过期， 状态成为：closed(accepted, rejected)

# API
## 1. Governance合约  创建提案
`createProposal(string calldata _proposalTitle, string calldata _proposalSD, string calldata _proposalDescHash, uint _categoryId) `
```
function createProposalwithSolution(
        string calldata _proposalTitle,
        string calldata _proposalSD,
        string calldata _proposalDescHash,
        uint _categoryId,
        string calldata _solutionHash,
        bytes calldata _action
    )
```
* _proposalTitle 标题
* _proposalSD 提案简单描述
* _proposalDescHash  提案描述上传ipfs的ID
* _categoryId  分类ID
* 必须是会员

## 2. Governance合约  AB会员给提案分类并分配激励
`categorizeProposal(uint _proposalId, uint _categoryId,uint _incentives ) `
* _proposalId 提案ID
* _categoryId  分类ID
* _incentives 投票激励，0 为参与投票的成员不给激励，100 SOTE为投票成员一致意见平分激励
* 必须是AB会员
* 什么情况下会调用该方法?

## 3. Governance合约 更新提案 【接口已删除】
`updateProposal(uint _proposalId, string calldata _proposalTitle, string calldata _proposalSD, string calldata _proposalDescHash) ` 
* 必须是提案创建人
```
   {
        require(
            allProposalSolutions[_proposalId].length < 2,
            "Not allowed"
        );
        allProposalData[_proposalId].propStatus = uint(ProposalStatus.Draft);
        allProposalData[_proposalId].category = 0;
        allProposalData[_proposalId].commonIncentive = 0;
        emit Proposal(
            allProposalData[_proposalId].owner,
            _proposalId,
            now,
            _proposalTitle, 
            _proposalSD, 
            _proposalDescHash
        );
    }
```

## 4. Governance合约 提案创建人提供提案执行方案
`submitProposalWithSolution(uint _proposalId, string _solutionHash,bytes _action ) ` 
* _proposalId 提案ID
* _solutionHash 执行方案的hash:操作函数hashID以及操作的数值
* _action执行函数调用的bytes
* 必须是提案创建人

* 参数调用代码示例
工具函数
```
const abi = require('ethereumjs-abi');
const Web3 = require('web3');

function encode (...args) {

  if (args.length === 1) {
    return '0x';
  }

  const [fn, ...params] = args;
  const types = fn
    .slice(0, fn.length - 1)
    .split('(')[1]
    .split(',');

  for (let i = 0; i < types.length; i++) {
    if (types[i].includes('bytes') && !params[i].startsWith('0x')) {
      params[i] = Web3.utils.toHex(params[i]);
    }
  }

  return encode1(types, params);
}

function encode1 (...args) {
  const encoded = abi.rawEncode.apply(this, args);
  return '0x' + encoded.toString('hex');
}
```

调用
```
let actionHash = encode(
          'updateUintParameters(bytes8,uint)',
          'CADEPT',
          12
        );
        
gv.submitProposalWithSolution(1, 'proposal', actionHash);
```

## 5. Governance合约  会员提案投票
`submitVote(uint _proposalId, uint _solutionChosen)`
* _proposalId 提案ID
* _solutionChosen 填1为同意提案，非1为拒绝

## 6. Governance合约  投票后关闭提案
`closeProposal(uint _proposalId)`
* _proposalId 提案ID
* 什么情况下会调用该方法?
* 谁有权限调用

## 7. Governance合约  提案详情 【查合约】
`proposal(uint _proposalId)`
* _proposalId 提案ID

## 8. Governance合约 执行提案
`triggerAction(uint _proposalId)` 
* _proposalId 提案ID
* 什么情况下会调用该方法?
* 谁有权限调用

## 9. Governance合约  查询奖励
`getPendingReward(address _memberAddress)`
* _memberAddress 会员地址

## 10. 领取gov投票奖励只能通过 ClaimsReward合约  _records默认填20
`claimAllPendingReward(uint _records)`



