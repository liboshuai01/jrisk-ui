<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="条件编号" prop="condId">
        <el-input v-model="formData.condId" placeholder="请输入条件编号" />
      </el-form-item>
      <el-form-item label="条件类型" prop="condType">
        <el-select v-model="formData.condType" placeholder="请选择条件类型">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.RISK_COND_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="窗口值" prop="windowValue">
        <el-input v-model="formData.windowValue" placeholder="请输入窗口值" />
      </el-form-item>
      <el-form-item label="窗口单位" prop="windowUnit">
        <el-input v-model="formData.windowUnit" placeholder="请输入窗口单位" />
      </el-form-item>
      <el-form-item label="阈值" prop="threshold">
        <el-input v-model="formData.threshold" placeholder="请输入阈值" />
      </el-form-item>
      <el-form-item label="跨历史时间点" prop="timeline">
        <el-date-picker
          v-model="formData.timeline"
          type="date"
          value-format="x"
          placeholder="选择跨历史时间点"
        />
      </el-form-item>
      <el-form-item label="规则编号" prop="ruleId">
        <el-input v-model="formData.ruleId" placeholder="请输入规则编号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { CondApi, Cond } from '@/api/risk/cond'

/** 风控条件 表单 */
defineOptions({ name: 'CondForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  condId: undefined,
  condType: undefined,
  windowValue: undefined,
  windowUnit: undefined,
  threshold: undefined,
  timeline: undefined,
  ruleId: undefined,
})
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
      formData.value = await CondApi.getCond(id)
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
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as Cond
    if (formType.value === 'create') {
      await CondApi.createCond(data)
      message.success(t('common.createSuccess'))
    } else {
      await CondApi.updateCond(data)
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
    condId: undefined,
    condType: undefined,
    windowValue: undefined,
    windowUnit: undefined,
    threshold: undefined,
    timeline: undefined,
    ruleId: undefined,
  }
  formRef.value?.resetFields()
}
</script>
