import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 风控条件信息 */
export interface Cond {
          id: number; // 编号
          condId?: number; // 条件编号
          condType?: string; // 条件类型
          windowValue?: number; // 窗口值
          windowUnit?: string; // 窗口单位
          threshold?: number; // 阈值
          timeline?: string | Dayjs; // 跨历史时间点
          ruleId?: number; // 规则编号
}

/** 风控规则信息 */
export interface Rule {
          id: number; // 编号
          ruleId: number; // 规则编号
          ruleName?: string; // 规则名称
          ruleDesc: string; // 规则描述
          template?: string; // 预警模板
          level?: number; // 预警级别
          channel?: string; // 渠道
          target?: string; // 目标
          status?: number; // 状态
            conds?: Cond[]
}

// 风控规则 API
export const RuleApi = {
  // 查询风控规则分页
  getRulePage: async (params: any) => {
    return await request.get({ url: `/risk/rule/page`, params })
  },

  // 查询风控规则详情
  getRule: async (id: number) => {
    return await request.get({ url: `/risk/rule/get?id=` + id })
  },

  // 新增风控规则
  createRule: async (data: Rule) => {
    return await request.post({ url: `/risk/rule/create`, data })
  },

  // 修改风控规则
  updateRule: async (data: Rule) => {
    return await request.put({ url: `/risk/rule/update`, data })
  },

  // 删除风控规则
  deleteRule: async (id: number) => {
    return await request.delete({ url: `/risk/rule/delete?id=` + id })
  },

  /** 批量删除风控规则 */
  deleteRuleList: async (ids: number[]) => {
    return await request.delete({ url: `/risk/rule/delete-list?ids=${ids.join(',')}` })
  },

  // 导出风控规则 Excel
  exportRule: async (params) => {
    return await request.download({ url: `/risk/rule/export-excel`, params })
  },

// ==================== 子表（风控条件） ====================

  // 获得风控条件列表
  getCondListByRuleId: async (ruleId) => {
    return await request.get({ url: `/risk/rule/cond/list-by-rule-id?ruleId=` + ruleId })
  },
}