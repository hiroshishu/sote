import request from '@/utils/request'
import store from '@/store'

export const getCoverContracts = (vue) => {
  return request({
    url:`/data/contracts.json`,
    method:'get'
  })
}

// 查询保险报价
export const getQuote = (params) => {
  return request({
    url:`/quote-api/quote`,
    method:'get',
    params: params
  })
}
