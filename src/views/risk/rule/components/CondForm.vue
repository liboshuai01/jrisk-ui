<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    v-loading="formLoading"
    label-width="0px"
    :inline-message="true"
  >
    <el-table :data="formData" class="-mt-10px">
      <el-table-column label="序号" type="index" width="100" />
      <el-table-column label="条件编号" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.condId`" :rules="formRules.condId" class="mb-0px!">
            <el-input v-model="row.condId" placeholder="请输入条件编号" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="条件类型" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.condType`" :rules="formRules.condType" class="mb-0px!">
            <el-select v-model="row.condType" placeholder="请选择条件类型">
                <el-option
                  v-for="dict in getStrDictOptions(DICT_TYPE.RISK_COND_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="窗口值" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.windowValue`" :rules="formRules.windowValue" class="mb-0px!">
            <el-input v-model="row.windowValue" placeholder="请输入窗口值" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="窗口单位" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.windowUnit`" :rules="formRules.windowUnit" class="mb-0px!">
            <el-input v-model="row.windowUnit" placeholder="请输入窗口单位" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="阈值" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.threshold`" :rules="formRules.threshold" class="mb-0px!">
            <el-input v-model="row.threshold" placeholder="请输入阈值" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="跨历史时间点" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.timeline`" :rules="formRules.timeline" class="mb-0px!">
            <el-date-picker
              v-model="row.timeline"
              type="date"
              value-format="x"
              placeholder="选择跨历史时间点"
            />
          </el-form-item>
        </template>
      </el-table-column>
       <el-table-column align="center" fixed="right" label="操作" width="60">
        <template #default="{ $index }">
          <el-button @click="handleDelete($index)" link>—</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
  <el-row justify="center" class="mt-3">
    <el-button @click="handleAdd" round>+ 添加风控条件</el-button>
  </el-row>
</template>
<script setup lang="ts">
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { RuleApi } from '@/api/risk/rule'

const props = defineProps<{
  ruleId: number // 规则编号（主表的关联字段）
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref<any[]>([])
const formRules = reactive({
  condId: [{ required: true, message: '条件编号不能为空', trigger: 'blur' }],
  condType: [{ required: true, message: '条件类型不能为空', trigger: 'change' }],
  windowValue: [{ required: true, message: '窗口值不能为空', trigger: 'blur' }],
  windowUnit: [{ required: true, message: '窗口单位不能为空', trigger: 'blur' }],
  threshold: [{ required: true, message: '阈值不能为空', trigger: 'blur' }],
  timeline: [{ required: true, message: '跨历史时间点不能为空', trigger: 'blur' }],
  ruleId: [{ required: true, message: '规则编号不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.ruleId,
  async (val) => {
    // 1. 重置表单
    formData.value = []
    // 2. val 非空，则加载数据
    if (!val) {
      return;
    }
    try {
      formLoading.value = true
      formData.value = await RuleApi.getCondListByRuleId(val)
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    condId: undefined,
    condType: undefined,
    windowValue: undefined,
    windowUnit: undefined,
    threshold: undefined,
    timeline: undefined,
    ruleId: undefined,
  }
  row.ruleId = props.ruleId as any
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index) => {
  formData.value.splice(index, 1)
}

/** 表单校验 */
const validate = () => {
  return formRef.value.validate()
}

/** 表单值 */
const getData = () => {
  return formData.value
}

defineExpose({ validate, getData })
</script>
