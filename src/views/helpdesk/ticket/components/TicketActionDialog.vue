<template>
  <Dialog :title="title" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item v-if="assigneeRequired" :label="assigneeLabel" prop="assigneeUserId">
        <el-select
          v-model="formData.assigneeUserId"
          placeholder="请选择处理人"
          clearable
          filterable
          class="!w-1/1"
        >
          <el-option v-for="user in userList" :key="user.id" :label="user.nickname" :value="user.id">
            <div class="flex items-center gap-8px">
              <span>{{ user.nickname }}</span>
              <el-tag v-if="user.deptName" size="small" type="info" class="ml-4px">
                {{ user.deptName }}
              </el-tag>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="原因说明" prop="reason">
        <el-input
          v-model="formData.reason"
          type="textarea"
          :rows="4"
          maxlength="512"
          show-word-limit
          :placeholder="reasonPlaceholder"
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
import * as HelpdeskTicketApi from '@/api/helpdesk/ticket'
import * as UserApi from '@/api/system/user'
import type {
  TicketActionDialogFormData,
  TicketActionDialogSubmitData
} from './ticketActionDialogTypes'

defineOptions({ name: 'HelpdeskTicketActionDialog' })

const props = withDefaults(
  defineProps<{
    title: string
    assigneeRequired?: boolean
    assigneeLabel?: string
    reasonRequired?: boolean
    reasonPlaceholder?: string
    successMessage: string
    submit: (data: TicketActionDialogSubmitData) => Promise<unknown>
  }>(),
  {
    assigneeRequired: false,
    assigneeLabel: '处理人',
    reasonRequired: false,
    reasonPlaceholder: '请输入原因说明'
  }
)

const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单提交加载中
const formData = ref<TicketActionDialogFormData>({
  id: undefined,
  assigneeUserId: undefined,
  reason: undefined
})
const formRef = ref() // 表单 Ref
const userList = ref<UserApi.UserVO[]>([]) // 用户列表

const validateRequiredReason = (
  _rule: unknown,
  value: string | undefined,
  callback: (error?: Error) => void
) => {
  if (!value?.trim()) {
    callback(new Error('原因说明不能为空'))
    return
  }
  callback()
}

const formRules = computed<FormRules>(() => ({
  assigneeUserId: props.assigneeRequired
    ? [{ required: true, message: '处理人不能为空', trigger: 'change' }]
    : [],
  reason: props.reasonRequired
    ? [{ required: true, validator: validateRequiredReason, trigger: 'blur' }]
    : []
}))

/** 打开弹窗 */
const open = async (ticket: HelpdeskTicketApi.TicketVO | number) => {
  dialogVisible.value = true
  resetForm(ticket)
  if (!props.assigneeRequired) {
    return
  }
  formLoading.value = true
  try {
    userList.value = await UserApi.getSimpleUserList()
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  if (!formData.value.id) {
    message.notifyError('工单编号不能为空')
    return
  }

  formLoading.value = true
  try {
    await props.submit({
      id: formData.value.id,
      assigneeUserId: formData.value.assigneeUserId,
      reason: formData.value.reason?.trim() || undefined
    })
    message.success(props.successMessage)
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = (ticket: HelpdeskTicketApi.TicketVO | number) => {
  formData.value = {
    id: typeof ticket === 'number' ? ticket : ticket.id,
    assigneeUserId: typeof ticket === 'number' ? undefined : ticket.assigneeUserId,
    reason: undefined
  }
  nextTick(() => formRef.value?.clearValidate())
}
</script>
