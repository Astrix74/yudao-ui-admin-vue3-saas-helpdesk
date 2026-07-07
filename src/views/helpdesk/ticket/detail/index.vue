<template>
  <template v-if="hasTicket">
    <TicketDetailsHeader
      :ticket="ticket"
      :loading="loading"
      :actions="visibleTicketActions"
      @back="backToList"
      @action="handleActionCommand"
    />
    <TicketDetailsInfo
      :ticket="ticket"
      :category-list="categoryList"
      :dept-list="deptList"
      :user-list="userList"
    />

    <el-row :gutter="15">
      <el-col :xs="24" :md="8">
        <TicketCommentList
          :ticket-id="loadedTicketId"
          :user-list="userList"
          @changed="handleCommentChanged"
        />
      </el-col>
      <el-col :xs="24" :md="8">
        <TicketAttachmentList
          :ticket-id="loadedTicketId"
          :user-list="userList"
          @changed="handleAttachmentChanged"
        />
      </el-col>
      <el-col :xs="24" :md="8">
        <TicketLifecycleTimeline
          :list="lifecycleList"
          :loading="lifecycleLoading"
          :user-list="userList"
        />
      </el-col>
    </el-row>

    <TicketOperateLogTimeline
      v-if="canViewOperateLog"
      :list="operateLogList"
      :loading="operateLogLoading"
    />
  </template>
  <ContentWrap v-else v-loading="loading">
    <el-empty :description="loading ? '正在加载工单...' : '工单不存在或无权限访问'">
      <el-button v-if="!loading" type="primary" @click="backToList">返回列表</el-button>
    </el-empty>
  </ContentWrap>

  <TicketAssignDialog ref="assignDialogRef" @success="handleActionSuccess" />
  <TicketTransferDialog ref="transferDialogRef" @success="handleActionSuccess" />
  <TicketRequestInfoDialog ref="requestInfoDialogRef" @success="handleActionSuccess" />
  <TicketResolveDialog ref="resolveDialogRef" @success="handleActionSuccess" />
  <TicketCloseDialog ref="closeDialogRef" @success="handleActionSuccess" />
  <TicketReopenDialog ref="reopenDialogRef" @success="handleActionSuccess" />
</template>

<script setup lang="ts">
import { checkPermi } from '@/utils/permission'
import * as HelpdeskCategoryApi from '@/api/helpdesk/category'
import * as HelpdeskOperateLogApi from '@/api/helpdesk/operateLog'
import * as HelpdeskTicketApi from '@/api/helpdesk/ticket'
import * as HelpdeskTicketLifecycleApi from '@/api/helpdesk/ticketLifecycle'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import TicketAssignDialog from '../components/TicketAssignDialog.vue'
import TicketCloseDialog from '../components/TicketCloseDialog.vue'
import TicketReopenDialog from '../components/TicketReopenDialog.vue'
import TicketRequestInfoDialog from '../components/TicketRequestInfoDialog.vue'
import TicketResolveDialog from '../components/TicketResolveDialog.vue'
import TicketTransferDialog from '../components/TicketTransferDialog.vue'
import {
  getAvailableTicketActionsByStatus,
  type TicketActionCode,
  type TicketActionMeta
} from '../ticketActions'
import TicketDetailsHeader from './TicketDetailsHeader.vue'
import TicketDetailsInfo from './TicketDetailsInfo.vue'
import TicketAttachmentList from './TicketAttachmentList.vue'
import TicketCommentList from './TicketCommentList.vue'
import TicketLifecycleTimeline from './TicketLifecycleTimeline.vue'
import TicketOperateLogTimeline from './TicketOperateLogTimeline.vue'

/** 工单详情 */
defineOptions({ name: 'HelpdeskTicketDetail' })

const message = useMessage() // 消息弹窗
const { params } = useRoute() // 查询参数
const { push } = useRouter() // 路由

const loading = ref(true) // 详情的加载中
const lifecycleLoading = ref(false) // 生命周期的加载中
const operateLogLoading = ref(false) // 操作日志的加载中
const ticketId = computed(() => Number(params.id)) // 当前工单编号
const ticket = ref<HelpdeskTicketApi.TicketVO>({} as HelpdeskTicketApi.TicketVO) // 工单详情
const lifecycleList = ref<HelpdeskTicketLifecycleApi.TicketLifecycleVO[]>([]) // 生命周期列表
const operateLogList = ref<HelpdeskOperateLogApi.HelpdeskOperateLogVO[]>([]) // 操作日志列表
const categoryList = ref<HelpdeskCategoryApi.CategorySimpleVO[]>([]) // 分类列表
const deptList = ref<DeptApi.DeptVO[]>([]) // 部门列表
const userList = ref<UserApi.UserVO[]>([]) // 用户列表
const canViewOperateLog = computed(() => checkPermi(['helpdesk:operate-log:query']))
const hasTicket = computed(() => !!ticket.value.id)
const loadedTicketId = computed(() => ticket.value.id || 0)

const isValidTicketId = (id: number) => Number.isFinite(id) && id > 0

/** 清空详情关联数据，避免失败后继续展示旧数据 */
const resetDetailState = () => {
  ticket.value = {} as HelpdeskTicketApi.TicketVO
  lifecycleList.value = []
  operateLogList.value = []
}

/** 获得详情 */
const getDetail = async (ticketId: number) => {
  if (!hasTicket.value || ticket.value.id !== ticketId) {
    resetDetailState()
  }
  loading.value = true
  try {
    const data = await HelpdeskTicketApi.getTicket(ticketId)
    if (!data?.id) {
      return false
    }
    ticket.value = data
    return true
  } catch {
    resetDetailState()
    return false
  } finally {
    loading.value = false
  }
}

/** 获得生命周期 */
const getLifecycleList = async (ticketId: number) => {
  if (!isValidTicketId(ticketId)) {
    lifecycleList.value = []
    return
  }
  lifecycleLoading.value = true
  try {
    lifecycleList.value = await HelpdeskTicketLifecycleApi.getTicketLifecycleList(ticketId)
  } catch {
    lifecycleList.value = []
  } finally {
    lifecycleLoading.value = false
  }
}

/** 获得操作日志 */
const getOperateLogList = async (ticketId: number) => {
  if (!canViewOperateLog.value || !isValidTicketId(ticketId)) {
    operateLogList.value = []
    return
  }
  operateLogLoading.value = true
  try {
    const data = await HelpdeskOperateLogApi.getOperateLogPage({ ticketId })
    operateLogList.value = data.list
  } catch {
    operateLogList.value = []
  } finally {
    operateLogLoading.value = false
  }
}

/** 初始化选项 */
const getOptions = async () => {
  const [categoryData, deptData, userData] = await Promise.all([
    HelpdeskCategoryApi.getCategorySimpleList(),
    DeptApi.getSimpleDeptList(),
    UserApi.getSimpleUserList()
  ])
  categoryList.value = categoryData
  deptList.value = deptData
  userList.value = userData
}

/** 返回列表 */
const backToList = async () => {
  await push({ name: 'HelpdeskTicket' })
}

/** 生命周期动作 */
const visibleTicketActions = computed<TicketActionMeta[]>(() => {
  if (!hasTicket.value) {
    return []
  }
  return getAvailableTicketActionsByStatus(ticket.value.status).filter((action) =>
    checkPermi([action.permission])
  )
})

const assignDialogRef = ref()
const transferDialogRef = ref()
const requestInfoDialogRef = ref()
const resolveDialogRef = ref()
const closeDialogRef = ref()
const reopenDialogRef = ref()

const handleActionCommand = (command: TicketActionCode) => {
  if (!hasTicket.value) {
    return
  }
  if (command === 'assign') {
    assignDialogRef.value?.open(ticket.value)
  } else if (command === 'transfer') {
    transferDialogRef.value?.open(ticket.value)
  } else if (command === 'request-info') {
    requestInfoDialogRef.value?.open(ticket.value)
  } else if (command === 'resolve') {
    resolveDialogRef.value?.open(ticket.value)
  } else if (command === 'close') {
    closeDialogRef.value?.open(ticket.value)
  } else if (command === 'reopen') {
    reopenDialogRef.value?.open(ticket.value)
  }
}

const handleActionSuccess = async () => {
  const id = loadedTicketId.value
  if (!isValidTicketId(id)) {
    return
  }
  const detailLoaded = await getDetail(id)
  if (!detailLoaded) {
    return
  }
  await Promise.all([getLifecycleList(id), getOperateLogList(id)])
}

const handleCommentChanged = async () => {
  const id = loadedTicketId.value
  if (!isValidTicketId(id)) {
    return
  }
  const detailLoaded = await getDetail(id)
  if (!detailLoaded) {
    return
  }
  await getOperateLogList(id)
}

const handleAttachmentChanged = async () => {
  const id = loadedTicketId.value
  if (!isValidTicketId(id)) {
    return
  }
  const detailLoaded = await getDetail(id)
  if (!detailLoaded) {
    return
  }
  await getOperateLogList(id)
}

/** 初始化 **/
onMounted(async () => {
  const id = ticketId.value
  if (!isValidTicketId(id)) {
    message.notifyError('工单编号不能为空')
    await backToList()
    return
  }
  const detailLoaded = await getDetail(id)
  if (!detailLoaded) {
    return
  }
  await Promise.all([getLifecycleList(id), getOperateLogList(id), getOptions()])
})
</script>
