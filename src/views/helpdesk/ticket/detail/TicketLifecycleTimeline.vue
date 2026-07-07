<template>
  <ContentWrap title="生命周期">
    <div v-loading="loading">
      <el-empty v-if="!list.length" description="暂无生命周期记录" />
      <el-timeline v-else>
        <el-timeline-item
          v-for="item in list"
          :key="item.id"
          :timestamp="formatNullableDate(item.createTime)"
          placement="top"
        >
          <div class="font-bold">{{ getTicketLifecycleActionLabel(item.action) }}</div>
          <el-descriptions :column="1" size="small" class="mt-8px">
            <el-descriptions-item label="状态变化">
              <template v-if="item.fromStatus != null || item.toStatus != null">
                <dict-tag
                  v-if="item.fromStatus != null"
                  :type="DICT_TYPE.HELPDESK_TICKET_STATUS"
                  :value="item.fromStatus"
                />
                <span v-else>-</span>
                <span class="mx-6px">→</span>
                <dict-tag
                  v-if="item.toStatus != null"
                  :type="DICT_TYPE.HELPDESK_TICKET_STATUS"
                  :value="item.toStatus"
                />
                <span v-else>-</span>
              </template>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="处理人变化">
              {{ getUserNickname(item.fromAssigneeUserId) }}
              <span class="mx-6px">→</span>
              {{ getUserNickname(item.toAssigneeUserId) }}
            </el-descriptions-item>
            <el-descriptions-item label="操作人">
              {{ getUserNickname(item.operatorUserId) }}
            </el-descriptions-item>
            <el-descriptions-item label="原因说明">
              {{ item.reason || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-timeline-item>
      </el-timeline>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { formatNullableDate } from '@/utils/formatTime'
import * as HelpdeskTicketLifecycleApi from '@/api/helpdesk/ticketLifecycle'
import * as UserApi from '@/api/system/user'
import { getTicketLifecycleActionLabel } from '../ticketActions'

defineOptions({ name: 'HelpdeskTicketLifecycleTimeline' })

const props = defineProps<{
  list: HelpdeskTicketLifecycleApi.TicketLifecycleVO[]
  loading: boolean
  userList: UserApi.UserVO[]
}>()

/** 获取用户昵称 */
const getUserNickname = (userId?: number) => {
  if (userId == null) {
    return '-'
  }
  return props.userList.find((user) => user.id === userId)?.nickname ?? `#${userId}`
}
</script>
