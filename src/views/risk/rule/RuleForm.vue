<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="规则编号" prop="ruleId">
            <el-input v-model="formData.ruleId" placeholder="请输入规则编号" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规则名称" prop="ruleName">
            <el-input v-model="formData.ruleName" placeholder="请输入规则名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="预警级别" prop="riskLevel">
            <el-select v-model="formData.riskLevel" placeholder="请选择预警级别">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.RISK_RULE_LEVEL)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.RISK_RULE_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="渠道" prop="channel">
        <el-select v-model="formData.channel" placeholder="请选择渠道" style="width: 100%">
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.RISK_RULE_CHANNEL)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="目标" prop="target">
        <el-select v-model="formData.target" placeholder="请选择目标" style="width: 100%">
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.RISK_RULE_TARGET)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="规则描述" prop="ruleDesc">
        <el-input v-model="formData.ruleDesc" type="textarea" placeholder="请输入规则描述" />
      </el-form-item>

      <el-form-item label="预警模板" prop="riskTemplate">
        <el-input
          v-model="formData.riskTemplate"
          type="textarea"
          placeholder="请输入预警模板内容"
        />
      </el-form-item>

      <el-row v-if="formData.id">
        <el-col :span="12">
          <el-form-item label="创建者">
            <el-input v-model="formData.creator" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="formData.createTime"
              type="datetime"
              disabled
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitForm" :loading="formLoading">确 定</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions, getDictOptions } from '@/utils/dict'
import * as RuleApi from '@/api/risk/rule'

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
// 显式指定类型为 RuleApi.RuleVO，这样 TS 就能正确理解字段类型
const formData = ref<RuleApi.RuleVO>({
  id: undefined,
  ruleId: undefined,
  ruleName: '',
  ruleDesc: '',
  riskLevel: undefined,
  status: undefined,
  riskTemplate: '',
  channel: '',
  target: '',
  creator: '',
  createTime: ''
})

const formRules = reactive({
  ruleId: [{ required: true, message: '规则编号不能为空', trigger: 'blur' }],
  ruleName: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }],
  riskLevel: [{ required: true, message: '预警级别不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

const formRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增规则' : type === 'update' ? '修改规则' : '规则详情'
  formType.value = type
  resetForm()

  if (id) {
    formLoading.value = true
    try {
      // 修复：直接赋值，去除多余的局部变量 res
      formData.value = await RuleApi.getRule(id)
    } finally {
      formLoading.value = false
    }
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    ruleId: undefined,
    ruleName: '',
    ruleDesc: '',
    riskLevel: undefined,
    status: undefined,
    riskTemplate: '',
    channel: '',
    target: '',
    creator: '',
    createTime: ''
  }
  formRef.value?.resetFields()
}

/** 提交表单 */
const submitForm = async () => {
  if (formType.value === 'detail') {
    dialogVisible.value = false
    return
  }

  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await RuleApi.createRule(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await RuleApi.updateRule(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open })
const emit = defineEmits(['success'])
</script>
