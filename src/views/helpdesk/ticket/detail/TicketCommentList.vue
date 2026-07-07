<template>
  <ContentWrap title="评论">
    <div v-hasPermi="['helpdesk:ticket:comment']" class="mb-16px">
      <el-input
        v-model="commentContent"
        type="textarea"
        :rows="4"
        maxlength="2000"
        show-word-limit
        placeholder="请输入评论内容"
      />
      <div class="mt-10px flex items-center justify-between gap-12px">
        <el-checkbox v-model="internal">内部备注</el-checkbox>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="!trimmedContent"
          @click="handleCreate"
        >
          发布评论
        </el-button>
      </div>
    </div>

    <div v-loading="loading">
      <el-empty v-if="!list.length" description="暂无评论" />
      <div v-else class="flex flex-col gap-12px">
        <div
          v-for="comment in list"
          :key="comment.id"
          class="border border-[var(--el-border-color-lighter)] rounded-4px p-12px"
        >
          <div class="mb-8px flex items-start justify-between gap-12px">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-8px">
                <span class="font-bold">{{ getUserNickname(comment.userId) }}</span>
                <el-tag v-if="comment.internal" size="small" type="warning">内部备注</el-tag>
              </div>
              <div class="mt-4px text-12px text-[var(--el-text-color-secondary)]">
                {{ formatNullableDate(comment.createTime) }}
              </div>
            </div>
            <el-button
              link
              type="danger"
              :loading="deletingId === comment.id"
              @click="handleDelete(comment.id)"
              v-hasPermi="['helpdesk:ticket:comment']"
            >
              删除
            </el-button>
          </div>
          <div class="whitespace-pre-wrap break-all text-[var(--el-text-color-regular)]">
            {{ comment.content || '-' }}
          </div>
        </div>
      </div>

      <Pagination
        v-if="showPagination"
        :total="total"
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { formatNullableDate } from '@/utils/formatTime'
import * as HelpdeskTicketCommentApi from '@/api/helpdesk/ticketComment'
import * as UserApi from '@/api/system/user'

defineOptions({ name: 'HelpdeskTicketCommentList' })

const props = defineProps<{
  ticketId?: number
  userList: UserApi.UserVO[]
}>()

const emit = defineEmits<{
  changed: []
}>()

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(false) // 评论列表加载中
const submitting = ref(false) // 评论提交中
const deletingId = ref<number>() // 正在删除的评论编号
const list = ref<HelpdeskTicketCommentApi.TicketCommentVO[]>([]) // 评论列表
const total = ref(0) // 评论总数
const commentContent = ref('') // 新评论内容
const internal = ref(false) // 是否内部备注
const queryParams = reactive<HelpdeskTicketCommentApi.TicketCommentPageReqVO>({
  ticketId: props.ticketId || 0,
  pageNo: 1,
  pageSize: 10
})

const trimmedContent = computed(() => commentContent.value.trim())
const showPagination = computed(() => total.value > (queryParams.pageSize ?? 0))

const getValidTicketId = () => {
  const ticketId = Number(props.ticketId)
  return Number.isFinite(ticketId) && ticketId > 0 ? ticketId : undefined
}

const resetList = () => {
  queryParams.ticketId = 0
  list.value = []
  total.value = 0
}

/** 查询评论列表 */
const getList = async () => {
  const ticketId = getValidTicketId()
  if (!ticketId) {
    resetList()
    return
  }
  loading.value = true
  try {
    queryParams.ticketId = ticketId
    const data = await HelpdeskTicketCommentApi.getTicketCommentPage(queryParams)
    list.value = data.list
    total.value = data.total
  } catch {
    resetList()
  } finally {
    loading.value = false
  }
}

/** 新增评论 */
const handleCreate = async () => {
  const ticketId = getValidTicketId()
  if (!ticketId) {
    message.notifyError('工单编号不能为空')
    return
  }
  if (!trimmedContent.value) {
    message.warning('评论内容不能为空')
    return
  }

  submitting.value = true
  try {
    await HelpdeskTicketCommentApi.createTicketComment({
      ticketId,
      content: trimmedContent.value,
      internal: internal.value
    })
    message.success(t('common.createSuccess'))
    commentContent.value = ''
    internal.value = false
    const pageSize = queryParams.pageSize || 10
    queryParams.pageNo = Math.ceil((total.value + 1) / pageSize)
    await getList()
    emit('changed')
  } finally {
    submitting.value = false
  }
}

/** 删除评论 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    deletingId.value = id
    await HelpdeskTicketCommentApi.deleteTicketComment(id)
    message.success(t('common.delSuccess'))
    const currentPageNo = queryParams.pageNo ?? 1
    if (list.value.length === 1 && currentPageNo > 1) {
      queryParams.pageNo = currentPageNo - 1
    }
    await getList()
    emit('changed')
  } catch {
  } finally {
    deletingId.value = undefined
  }
}

/** 获取用户昵称 */
const getUserNickname = (userId?: number) => {
  if (userId == null) {
    return '-'
  }
  return props.userList.find((user) => user.id === userId)?.nickname ?? `#${userId}`
}

watch(
  () => props.ticketId,
  async () => {
    queryParams.pageNo = 1
    await getList()
  },
  { immediate: true }
)
</script>
