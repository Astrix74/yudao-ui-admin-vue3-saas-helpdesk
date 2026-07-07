<template>
  <TicketActionDialog
    ref="dialogRef"
    title="分配工单"
    assignee-required
    success-message="分配成功"
    reason-placeholder="请输入分配原因"
    :submit="submitAction"
    @success="emit('success')"
  />
</template>

<script setup lang="ts">
import * as HelpdeskTicketApi from '@/api/helpdesk/ticket'
import TicketActionDialog from './TicketActionDialog.vue'
import type { TicketActionDialogSubmitData } from './ticketActionDialogTypes'

defineOptions({ name: 'HelpdeskTicketAssignDialog' })

const dialogRef = ref()

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const open = (ticket: HelpdeskTicketApi.TicketVO | number) => {
  dialogRef.value?.open(ticket)
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const submitAction = (data: TicketActionDialogSubmitData) => {
  return HelpdeskTicketApi.assignTicket({
    id: data.id,
    assigneeUserId: data.assigneeUserId as number,
    reason: data.reason
  })
}
</script>
