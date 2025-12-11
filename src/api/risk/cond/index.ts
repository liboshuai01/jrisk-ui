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

// 风控条件 API
export const CondApi = {
  // 查询风控条件分页
  getCondPage: async (params: any) => {
    return await request.get({ url: `/risk/cond/page`, params })
  },

  // 查询风控条件详情
  getCond: async (id: number) => {
    return await request.get({ url: `/risk/cond/get?id=` + id })
  },

  // 新增风控条件
  createCond: async (data: Cond) => {
    return await request.post({ url: `/risk/cond/create`, data })
  },

  // 修改风控条件
  updateCond: async (data: Cond) => {
    return await request.put({ url: `/risk/cond/update`, data })
  },

  // 删除风控条件
  deleteCond: async (id: number) => {
    return await request.delete({ url: `/risk/cond/delete?id=` + id })
  },

  /** 批量删除风控条件 */
  deleteCondList: async (ids: number[]) => {
    return await request.delete({ url: `/risk/cond/delete-list?ids=${ids.join(',')}` })
  },

  // 导出风控条件 Excel
  exportCond: async (params) => {
    return await request.download({ url: `/risk/cond/export-excel`, params })
  },
}