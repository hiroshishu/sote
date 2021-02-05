import request from '@/utils/request'

export const totalStakingReward = async () => {
  return request({
    url: `/pub-api/total-staking-reward`,
    method: 'get'
  });
}

export const countOfMembers = async () => {
  return request({
    url: `/pub-api/count-of-members`,
    method: 'get'
  });
}
