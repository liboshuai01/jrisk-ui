import request from '@/config/axios'

// 规则 VO (View Object) 定义，对应后端的实体或DTO
export interface RuleVO {
  id?: number
  ruleCode: string
  ruleName: string
  ruleDesc?: string
  riskLevel: number // 预警级别
  status: number // 状态
  module?: string // 信息模块
  channel?: string // 渠道
  target?: string // 目标
  createTime?: Date
}

// 查询参数接口
export interface RulePageReqVO extends PageParam {
  ruleName?: string
  ruleCode?: string
  status?: number
}

// 1. 查询规则列表 (分页)
export const getRulePageApi = (params: RulePageReqVO) => {
  return request.get({ url: '/risk/rule/page', params })
}

// 2. 获得规则详情
export const getRuleApi = (id: number) => {
  return request.get({ url: '/risk/rule/get?id=' + id })
}

// 3. 新增规则
export const createRuleApi = (data: RuleVO) => {
  return request.post({ url: '/risk/rule/create', data })
}

// 4. 修改规则
export const updateRuleApi = (data: RuleVO) => {
  return request.put({ url: '/risk/rule/update', data })
}

// 5. 删除规则
export const deleteRuleApi = (id: number) => {
  return request.delete({ url: '/risk/rule/delete?id=' + id })
}

// 6. 导出规则 Excel
export const exportRuleApi = (params: RulePageReqVO) => {
  return request.download({ url: '/risk/rule/export-excel', params })
}

// 7. 启动/停止 (假设后端有单独接口，或者复用update)
export const updateRuleStatusApi = (id: number, status: number) => {
  return request.put({ url: '/risk/rule/update-status', data: { id, status } })
}
