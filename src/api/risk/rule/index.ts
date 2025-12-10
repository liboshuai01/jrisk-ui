import request from '@/config/axios'

// 定义规则数据的类型接口 (VO: View Object)
// 修改：将 id, ruleId, riskLevel, status 等改为可选属性 (?)，以兼容表单初始的 undefined 状态
export interface RuleVO {
  id?: number
  ruleId?: number
  ruleName: string
  ruleDesc: string
  riskLevel?: number
  status?: number
  riskTemplate: string
  channel: string
  target: string
  creator?: string
  createTime?: string
  updater?: string
  updateTime?: string
}

// 查询列表参数类型
export interface RulePageReqVO extends PageParam {
  ruleName?: string
  ruleId?: number
  status?: number
}

// 1. 查询规则分页列表
export const getRulePage = (params: RulePageReqVO) => {
  return request.get({ url: '/risk/rule/page', params })
}

// 2. 查询规则详情
export const getRule = (id: number) => {
  return request.get({ url: `/risk/rule/get?id=${id}` })
}

// 3. 新增规则
export const createRule = (data: RuleVO) => {
  return request.post({ url: '/risk/rule/create', data })
}

// 4. 修改规则
export const updateRule = (data: RuleVO) => {
  return request.put({ url: '/risk/rule/update', data })
}

// 5. 删除规则
export const deleteRule = (id: number) => {
  return request.delete({ url: `/risk/rule/delete?id=${id}` })
}

// 6. 导出 Excel
export const exportRule = (params: RulePageReqVO) => {
  return request.download({ url: '/risk/rule/export-excel', params })
}

// 7. 修改状态 (启停)
export const updateRuleStatus = (id: number, status: number) => {
  return request.put({ url: '/risk/rule/update-status', data: { id, status } })
}
