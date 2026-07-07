<template>
  <div v-loading="loading">
    <div class="flex items-start justify-between gap-12px">
      <div>
        <el-col>
          <el-row>
            <span class="text-xl font-bold">{{ ticket.title || '-' }}</span>
          </el-row>
          <el-row class="mt-5px text-[var(--el-text-color-secondary)]">
            <span>{{ ticket.no || '-' }}</span>
          </el-row>
        </el-col>
      </div>
      <div class="flex flex-wrap justify-end gap-8px">
        <el-button
          v-for="action in actions"
          :key="action.code"
          type="primary"
          plain
          @click="emit('action', action.code)"
        >
          {{ action.label }}
        </el-button>
        <el-button @click="emit('back')">
          <Icon icon="ep:back" class="mr-5px" />
          返回列表
        </el-button>
      </div>
    </div>
  </div>
  <ContentWrap class="mt-10px">
    <el-descriptions :column="5" direction="vertical">
      <el-descriptions-item label="状态">
        <dict-tag
          v-if="ticket.status != null"
          :type="DICT_TYPE.HELPDESK_TICKET_STATUS"
          :value="ticket.status"
        />
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="优先级">
        <dict-tag
          v-if="ticket.priority != null"
          :type="DICT_TYPE.HELPDESK_TICKET_PRIORITY"
          :value="ticket.priority"
        />
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="来源">
        <dict-tag
          v-if="ticket.source != null"
          :type="DICT_TYPE.HELPDESK_TICKET_SOURCE"
          :value="ticket.source"
        />
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="评论数">
        {{ ticket.commentCount ?? 0 }}
      </el-descriptions-item>
      <el-descriptions-item label="附件数">
        {{ ticket.attachmentCount ?? 0 }}
      </el-descriptions-item>
    </el-descriptions>
  </ContentWrap>
</template>
<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import * as HelpdeskTicketApi from '@/api/helpdesk/ticket'
import type { TicketActionCode, TicketActionMeta } from '../ticketActions'

defineOptions({ name: 'HelpdeskTicketDetailsHeader' })

defineProps<{
  ticket: HelpdeskTicketApi.TicketVO
  loading: boolean
  actions: TicketActionMeta[]
}>()

const emit = defineEmits<{
  back: []
  action: [code: TicketActionCode]
}>()
</script>
