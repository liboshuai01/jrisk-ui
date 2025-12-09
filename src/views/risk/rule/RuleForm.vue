<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="规则编号" prop="ruleCode">
        <el-input v-model="formData.ruleCode" placeholder="请输入规则编号" />
      </el-form-item>
      <el-form-item label="规则名称" prop="ruleName">
        <el-input v-model="formData.ruleName" placeholder="请输入规则名称" />
      </el-form-item>
      <el-form-item label="预警级别" prop="riskLevel">
        <el-select v-model="formData.riskLevel" placeholder="请选择预警级别">
          <el-option label="高" :value="1" />
          <el-option label="中" :value="2" />
          <el-option label="低" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="0">开启</el-radio>
          <el-radio :label="1">关闭</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="信息模块" prop="module">
        <el-input v-model="formData.module" placeholder="例如：支付模块" />
      </el-form-item>
      <el-form-item label="渠道" prop="channel">
        <el-input v-model="formData.channel" placeholder="例如：App/Web" />
      </el-form-item>
      <el-form-item label="目标" prop="target">
        <el-input v-model="formData.target" placeholder="例如：用户ID" />
      </el-form-item>
      <el-form-item label="规则描述" prop="ruleDesc">
        <el-input type="textarea" v-model="formData.ruleDesc" placeholder="请输入规则的详细逻辑" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitForm" :loading="formLoading">确 定</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import * as RuleApi from '@/api/risk/rule'

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('') // create or update
const formData = ref<RuleApi.RuleVO>({
  id: undefined,
  ruleCode: '',
  ruleName: '',
  riskLevel: 2,
  status: 0,
  ruleDesc: ''
})
const formRules = reactive({
  ruleCode: [{ required: true, message: '规则编号不能为空', trigger: 'blur' }],
  ruleName: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }],
  riskLevel: [{ required: true, message: '预警级别不能为空', trigger: 'change' }]
})
const formRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时回显数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await RuleApi.getRuleApi(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 暴露给父组件

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于回调列表刷新
const submitForm = async () => {
  // 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as RuleApi.RuleVO
    if (formType.value === 'create') {
      await RuleApi.createRuleApi(data)
      message.success(t('common.createSuccess'))
    } else {
      await RuleApi.updateRuleApi(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    ruleCode: '',
    ruleName: '',
    riskLevel: 2,
    status: 0,
    ruleDesc: ''
  }
  formRef.value?.resetFields()
}
</script>
