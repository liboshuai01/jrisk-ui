<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="规则编号" prop="ruleId">
        <el-input v-model="formData.ruleId" placeholder="请输入规则编号" />
      </el-form-item>
      <el-form-item label="规则名称" prop="ruleName">
        <el-input v-model="formData.ruleName" placeholder="请输入规则名称" />
      </el-form-item>
      <el-form-item label="规则描述" prop="ruleDesc">
        <el-input v-model="formData.ruleDesc" type="textarea" placeholder="请输入规则描述" />
      </el-form-item>
      <el-form-item label="预警模板" prop="template">
        <el-input v-model="formData.template" type="textarea" placeholder="请输入预警模板" />
      </el-form-item>
      <el-form-item label="预警级别" prop="level">
        <el-select v-model="formData.level" placeholder="请选择预警级别">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.RISK_RULE_LEVEL)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="渠道" prop="channel">
        <el-select v-model="formData.channel" placeholder="请选择渠道">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.RISK_RULE_CHANNEL)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="目标" prop="target">
        <el-select v-model="formData.target" placeholder="请选择目标">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.RISK_RULE_TARGET)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
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
    </el-form>
    <!-- 子表的表单 -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="风控条件" name="cond">
        <CondForm ref="condFormRef" :rule-id="formData.id || 0" />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { RuleApi, Rule } from '@/api/risk/rule'
import CondForm from './components/CondForm.vue'

/** 风控规则 表单 */
defineOptions({ name: 'RuleForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  ruleId: undefined,
  ruleName: undefined,
  ruleDesc: undefined,
  template: undefined,
  level: undefined,
  channel: undefined,
  target: undefined,
  status: undefined,
})
const formRules = reactive({
  ruleId: [{ required: true, message: '规则编号不能为空', trigger: 'blur' }],
  ruleName: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }],
  template: [{ required: true, message: '预警模板不能为空', trigger: 'blur' }],
  level: [{ required: true, message: '预警级别不能为空', trigger: 'change' }],
  channel: [{ required: true, message: '渠道不能为空', trigger: 'change' }],
  target: [{ required: true, message: '目标不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('cond')
const condFormRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await RuleApi.getRule(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 校验子表单
  try {
    await condFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'cond'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as Rule
    // 拼接子表的数据
    data.conds = condFormRef.value.getData()
    if (formType.value === 'create') {
      await RuleApi.createRule(data)
      message.success(t('common.createSuccess'))
    } else {
      await RuleApi.updateRule(data)
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
    ruleId: undefined,
    ruleName: undefined,
    ruleDesc: undefined,
    template: undefined,
    level: undefined,
    channel: undefined,
    target: undefined,
    status: undefined,
  }
  formRef.value?.resetFields()
}
</script>
