<template>
  <ContentWrap title="操作日志">
    <div v-loading="loading">
      <el-empty v-if="!list.length" description="暂无操作日志" />
      <el-timeline v-else>
        <el-timeline-item
          v-for="(log, index) in list"
          :key="log.id ?? index"
          :timestamp="formatNullableDate(log.createTime)"
          placement="top"
        >
          <div class="flex flex-wrap items-center gap-8px">
            <el-tag size="small" :type="getUserTypeTagType(log.userType)">
              {{ log.userName || getUserTypeLabel(log.userType) }}
            </el-tag>
            <span class="font-bold">{{ log.subType || log.type || '操作' }}</span>
          </div>
          <div class="mt-6px whitespace-pre-wrap break-all text-[var(--el-text-color-regular)]">
            {{ log.action || '-' }}
          </div>
          <div
            v-if="log.extra"
            class="mt-4px whitespace-pre-wrap break-all text-12px text-[var(--el-text-color-secondary)]"
          >
            {{ log.extra }}
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { DICT_TYPE, getDictLabel, getDictObj } from '@/utils/dict'
import { formatNullableDate } from '@/utils/formatTime'
import type { ElementPlusInfoType } from '@/types/elementPlus'
import * as HelpdeskOperateLogApi from '@/api/helpdesk/operateLog'

defineOptions({ name: 'HelpdeskTicketOperateLogTimeline' })

defineProps<{
  list: HelpdeskOperateLogApi.HelpdeskOperateLogVO[]
  loading: boolean
}>()

/** 获取用户类型标签 */
const getUserTypeLabel = (userType?: number) => {
  return getDictLabel(DICT_TYPE.USER_TYPE, userType) || '用户'
}

/** 获取用户类型颜色 */
const getUserTypeTagType = (userType?: number): ElementPlusInfoType | undefined => {
  return getDictObj(DICT_TYPE.USER_TYPE, userType)?.colorType || undefined
}
</script>
