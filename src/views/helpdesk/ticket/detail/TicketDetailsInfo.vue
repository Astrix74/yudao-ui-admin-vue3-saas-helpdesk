<template>
  <ContentWrap>
    <el-collapse v-model="activeNames">
      <el-collapse-item name="basicInfo">
        <template #title>
          <span class="text-base font-bold">基本信息</span>
        </template>
        <el-descriptions :column="4">
          <el-descriptions-item label="工单号">
            {{ props.ticket.no || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="标题">
            {{ props.ticket.title || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            {{ getCategoryName(props.ticket.categoryId) }}
          </el-descriptions-item>
          <el-descriptions-item label="请求人">
            {{ getUserNickname(props.ticket.requesterUserId) }}
          </el-descriptions-item>
          <el-descriptions-item label="处理人">
            {{ getUserNickname(props.ticket.assigneeUserId) }}
          </el-descriptions-item>
          <el-descriptions-item label="负责部门">
            {{ getDeptName(props.ticket.teamDeptId) }}
          </el-descriptions-item>
          <el-descriptions-item label="评论数">
            {{ props.ticket.commentCount ?? 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="附件数">
            {{ props.ticket.attachmentCount ?? 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="描述">
            {{ props.ticket.description || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
      <el-collapse-item name="timeInfo">
        <template #title>
          <span class="text-base font-bold">时间信息</span>
        </template>
        <el-descriptions :column="4">
          <el-descriptions-item label="创建时间">
            {{ formatNullableDate(props.ticket.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="最后评论时间">
            {{ formatNullableDate(props.ticket.lastCommentTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="解决时间">
            {{ formatNullableDate(props.ticket.resolvedTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="关闭时间">
            {{ formatNullableDate(props.ticket.closedTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="重开时间">
            {{ formatNullableDate(props.ticket.reopenedTime) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
    </el-collapse>
  </ContentWrap>
</template>
<script setup lang="ts">
import * as HelpdeskCategoryApi from '@/api/helpdesk/category'
import * as HelpdeskTicketApi from '@/api/helpdesk/ticket'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { formatNullableDate } from '@/utils/formatTime'

defineOptions({ name: 'HelpdeskTicketDetailsInfo' })

const props = defineProps<{
  ticket: HelpdeskTicketApi.TicketVO
  categoryList: HelpdeskCategoryApi.CategorySimpleVO[]
  deptList: DeptApi.DeptVO[]
  userList: UserApi.UserVO[]
}>()

const activeNames = ref(['basicInfo', 'timeInfo']) // 展示的折叠面板

/** 获取分类名称 */
const getCategoryName = (categoryId?: number) => {
  if (categoryId == null) {
    return '-'
  }
  return props.categoryList.find((category) => category.id === categoryId)?.name ?? `#${categoryId}`
}

/** 获取部门名称 */
const getDeptName = (deptId?: number) => {
  if (deptId == null) {
    return '-'
  }
  return props.deptList.find((dept) => dept.id === deptId)?.name ?? `#${deptId}`
}

/** 获取用户昵称 */
const getUserNickname = (userId?: number) => {
  if (userId == null) {
    return '-'
  }
  return props.userList.find((user) => user.id === userId)?.nickname ?? `#${userId}`
}
</script>
