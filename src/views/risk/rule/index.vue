<template>
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="规则名称" prop="ruleName">
        <el-input
          v-model="queryParams.ruleName"
          placeholder="请输入规则名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="规则编号" prop="ruleId">
        <el-input
          v-model="queryParams.ruleId"
          placeholder="请输入规则编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-240px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.RISK_RULE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" @click="openForm('create')" v-hasPermi="['risk:rule:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['risk:rule:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="规则编号" align="center" prop="ruleId" />
      <el-table-column label="规则名称" align="center" prop="ruleName" />
      <el-table-column label="预警级别" align="center" prop="riskLevel">
        <template #default="scope">
          <DictTag :type="DICT_TYPE.RISK_RULE_LEVEL" :value="scope.row.riskLevel" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <DictTag :type="DICT_TYPE.RISK_RULE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="creator" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ formatDate(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('detail', scope.row.id)">
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['risk:rule:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['risk:rule:delete']"
          >
            删除
          </el-button>

          <el-button
            link
            :type="scope.row.status === 0 ? 'success' : 'warning'"
            @click="handleStatusChange(scope.row)"
            v-hasPermi="['risk:rule:update']"
          >
            {{ scope.row.status === 0 ? '启动' : '停止' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <RuleForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import * as RuleApi from '@/api/risk/rule'
import RuleForm from './RuleForm.vue'

defineOptions({ name: 'RiskRule' })

const message = useMessage() // 消息
const { t } = useI18n() // 国际化

const loading = ref(true)
const exportLoading = ref(false)
const total = ref(0)
const list = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  ruleName: undefined,
  ruleId: undefined,
  status: undefined
})
const queryFormRef = ref()

/** 获取列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await RuleApi.getRulePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改/详情 操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await RuleApi.deleteRule(id)
    message.success(t('common.delSuccess'))
    getList()
  } catch {}
}

/** 启停状态修改 */
const handleStatusChange = async (row: any) => {
  const text = row.status === 0 ? '启动' : '停止'
  try {
    await message.confirm(`确认要"${text}"规则 "${row.ruleName}" 吗?`)
    // 假设 0 是禁用/停止状态，1 是启用状态。根据实际字典调整
    const newStatus = row.status === 0 ? 1 : 0
    await RuleApi.updateRuleStatus(row.id, newStatus)
    message.success(text + '成功')
    getList()
  } catch {
    // 取消时不需要做任何回滚，因为是点击按钮触发，还没改本地值
  }
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    // const data = await RuleApi.exportRule(queryParams)
    // 下载文件工具，项目内通常有 download.excel 或类似封装
    // 假设 download.ts 中默认导出
    // download.excel(data, '风控规则.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>
