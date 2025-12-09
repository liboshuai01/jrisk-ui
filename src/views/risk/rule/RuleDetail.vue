<template>
  <Dialog title="规则详情" v-model="dialogVisible" width="60%">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="规则编号">{{ detailData.ruleCode }}</el-descriptions-item>
      <el-descriptions-item label="规则名称">{{ detailData.ruleName }}</el-descriptions-item>
      <el-descriptions-item label="预警级别">
        <el-tag v-if="detailData.riskLevel === 1" type="danger">高</el-tag>
        <el-tag v-else-if="detailData.riskLevel === 2" type="warning">中</el-tag>
        <el-tag v-else>低</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag v-if="detailData.status === 0" type="success">开启</el-tag>
        <el-tag v-else type="info">关闭</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="信息模块">{{ detailData.module || '-' }}</el-descriptions-item>
      <el-descriptions-item label="渠道">{{ detailData.channel || '-' }}</el-descriptions-item>
      <el-descriptions-item label="目标">{{ detailData.target || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatDate(detailData.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="规则描述" :span="2">
        {{ detailData.ruleDesc }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import * as RuleApi from '@/api/risk/rule'
import { formatDate } from '@/utils/formatTime'

const dialogVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<RuleApi.RuleVO>({} as RuleApi.RuleVO)

/** 打开弹窗 */
const open = async (id: number) => {
  dialogVisible.value = true
  detailLoading.value = true
  try {
    detailData.value = await RuleApi.getRuleApi(id)
  } finally {
    detailLoading.value = false
  }
}
defineExpose({ open })
</script>
