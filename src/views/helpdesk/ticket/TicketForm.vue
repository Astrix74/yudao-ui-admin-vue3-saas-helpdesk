<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="formData.title"
          maxlength="128"
          show-word-limit
          placeholder="请输入标题"
        />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select
          v-model="formData.categoryId"
          placeholder="请选择分类"
          clearable
          filterable
          class="!w-1/1"
        >
          <el-option
            v-for="category in categoryList"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-radio-group v-model="formData.priority">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.HELPDESK_TICKET_PRIORITY)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="5"
          maxlength="2000"
          show-word-limit
          placeholder="请输入问题描述"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import type { FormRules } from 'element-plus'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import * as HelpdeskCategoryApi from '@/api/helpdesk/category'
import * as HelpdeskTicketApi from '@/api/helpdesk/ticket'

/** 工单 表单 */
defineOptions({ name: 'HelpdeskTicketForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref<HelpdeskTicketApi.TicketUpdateReqVO>({
  id: undefined,
  title: undefined,
  description: undefined,
  categoryId: undefined,
  priority: undefined
})
const formRules = reactive<FormRules>({
  title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '分类不能为空', trigger: 'change' }],
  priority: [{ required: true, message: '优先级不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const categoryList = ref<HelpdeskCategoryApi.CategorySimpleVO[]>([]) // 分类列表

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  formLoading.value = true
  try {
    await getOptions()
    // 修改时，设置数据
    if (id) {
      const ticket = await HelpdeskTicketApi.getTicket(id)
      formData.value = {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        categoryId: ticket.categoryId,
        priority: ticket.priority
      }
    }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = {
      title: formData.value.title,
      description: formData.value.description,
      categoryId: formData.value.categoryId,
      priority: formData.value.priority
    }
    if (formType.value === 'create') {
      await HelpdeskTicketApi.createTicket(data)
      message.success(t('common.createSuccess'))
    } else {
      await HelpdeskTicketApi.updateTicket({
        id: formData.value.id,
        ...data
      })
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
    title: undefined,
    description: undefined,
    categoryId: undefined,
    priority: undefined
  }
  formRef.value?.resetFields()
}

/** 初始化选项 */
const getOptions = async () => {
  categoryList.value = await HelpdeskCategoryApi.getCategorySimpleList()
}
</script>
