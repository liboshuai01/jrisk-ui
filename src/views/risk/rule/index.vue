<template>
  <ContentWrap>
    <!-- 1. 顶部搜索框 -->
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
      <el-form-item label="规则编号" prop="ruleCode">
        <el-input
          v-model="queryParams.ruleCode"
          placeholder="请输入规则编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-240px">
          <!-- 这里假设你有字典，如果没有可以使用写死的 el-option -->
          <el-option label="开启" :value="0" />
          <el-option label="关闭" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" plain @click="openForm('create')"
          ><Icon icon="ep:plus" class="mr-5px" /> 新增</el-button
        >
        <el-button type="success" plain @click="handleExport" :loading="exportLoading"
          ><Icon icon="ep:download" class="mr-5px" /> 导出</el-button
        >
        <!-- 批量删除示例，需要配合 table selection -->
        <el-button type="danger" plain @click="handleBatchDelete"
          ><Icon icon="ep:delete" class="mr-5px" /> 批量删除</el-button
        >
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 2. 下方表格列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="规则编号" align="center" prop="ruleCode" />
      <el-table-column label="规则名称" align="center" prop="ruleName" />
      <el-table-column label="预警级别" align="center" prop="riskLevel">
        <template #default="scope">
          <!-- 模拟不同颜色标签 -->
          <el-tag v-if="scope.row.riskLevel === 1" type="danger">高</el-tag>
          <el-tag v-else-if="scope.row.riskLevel === 2" type="warning">中</el-tag>
          <el-tag v-else type="info">低</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            active-text="启用"
            inactive-text="停用"
            inline-prompt
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" width="250px" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row.id)"> 详情 </el-button>
          <el-button link type="primary" @click="openForm('update', scope.row.id)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 3. 分页组件 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 弹窗组件 -->
  <RuleForm ref="formRef" @success="getList" />
  <RuleDetail ref="detailRef" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import * as RuleApi from '@/api/risk/rule'
import RuleForm from './RuleForm.vue'
import RuleDetail from './RuleDetail.vue'

defineOptions({ name: 'RuleManagement' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  ruleName: undefined,
  ruleCode: undefined,
  status: undefined
})
const queryFormRef = ref()
const exportLoading = ref(false)
const multipleSelection = ref<RuleApi.RuleVO[]>([]) // 选中的行

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await RuleApi.getRulePageApi(queryParams)
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

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 详情操作 */
const detailRef = ref()
const openDetail = (id: number) => {
  detailRef.value.open(id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await RuleApi.deleteRuleApi(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** 批量删除 */
const handleSelectionChange = (val: RuleApi.RuleVO[]) => {
  multipleSelection.value = val
}
const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    message.warning('请选择要删除的数据')
    return
  }
  try {
    await message.delConfirm()
    // 假设后端支持批量删除，通常是用 ids 数组
    // await RuleApi.deleteBatchRuleApi(multipleSelection.value.map(item => item.id))
    message.success('批量删除演示成功')
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await RuleApi.exportRuleApi(queryParams)
    download.excel(data, '规则数据.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 状态修改 */
const handleStatusChange = async (row: RuleApi.RuleVO) => {
  try {
    const text = row.status === 0 ? '启用' : '停用'
    await message.confirm(`确认要"${text}""${row.ruleName}"规则吗?`)
    await RuleApi.updateRuleStatusApi(row.id!, row.status)
    message.success(text + '成功')
  } catch {
    row.status = row.status === 0 ? 1 : 0
  }
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>
