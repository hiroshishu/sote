import request from '@/utils/request'
import { BigNumber } from 'bignumber.js'

export const getCoverContracts = async (vue) => {
  const [contractsRes, capacitiesRes] = await Promise.all([
    request({
      url: `/data/contracts.json`,
      method: 'get'
    }),
    request({
      url: `/quote-api/capacities`,
      method: 'get'
    })
  ])
  const capacities = capacitiesRes.data || [];
  contractsRes.data.forEach((item) => {
    const capacity = capacities.find(val => item.address.toUpperCase() === val.contractAddress.toUpperCase())
    if (capacity) {
      item.capacityBNB = BigNumber(vue.$etherToNumber(capacity.capacityBNB)).toFixed(2, 1)
    }
  })
  return contractsRes
}

// 查询保险报价
export const getQuote = (params) => {
  return request({
    url: `/quote-api/quote`,
    method: 'get',
    params: params
  })
}
