<template>
  <TicketActionDialog
    ref="dialogRef"
    title="解决工单"
    success-message="解决成功"
    reason-placeholder="请输入解决说明"
    :submit="submitAction"
    @success="emit('success')"
  />
</template>

<script setup lang="ts">
import * as HelpdeskTicketApi from '@/api/helpdesk/ticket'
import TicketActionDialog from './TicketActionDialog.vue'
import type { TicketActionDialogSubmitData } from './ticketActionDialogTypes'

defineOptions({ name: 'HelpdeskTicketResolveDialog' })

const dialogRef = ref()

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const open = (ticket: HelpdeskTicketApi.TicketVO | number) => {
  dialogRef.value?.open(ticket)
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const submitAction = (data: TicketActionDialogSubmitData) => {
  return HelpdeskTicketApi.resolveTicket({
    id: data.id,
    reason: data.reason
  })
}
</script>
