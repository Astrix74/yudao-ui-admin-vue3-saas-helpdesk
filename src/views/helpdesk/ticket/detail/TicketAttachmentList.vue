<template>
  <ContentWrap title="附件">
    <div v-hasPermi="['helpdesk:ticket:attachment']" class="mb-16px">
      <UploadFile
        v-if="!submitting"
        v-model="uploadValue"
        directory="helpdesk/ticket"
        :file-size="20"
        :file-type="attachmentFileTypes"
        :limit="1"
      />
      <div v-else class="text-12px text-[var(--el-text-color-secondary)]">
        正在保存附件...
      </div>
    </div>

    <div v-loading="loading">
      <el-empty v-if="!list.length" description="暂无附件" />
      <div v-else class="flex flex-col gap-12px">
        <div
          v-for="attachment in list"
          :key="attachment.id"
          class="border border-[var(--el-border-color-lighter)] rounded-4px p-12px"
        >
          <div class="mb-8px flex items-start justify-between gap-12px">
            <div class="min-w-0">
              <div class="break-all font-bold">
                {{ getDisplayFileName(attachment) }}
              </div>
              <div class="mt-4px text-12px text-[var(--el-text-color-secondary)]">
                类型/大小：{{ formatAttachmentType(attachment.fileType) }} /
                {{ formatAttachmentSize(attachment.fileSize) }}
              </div>
              <div class="mt-4px text-12px text-[var(--el-text-color-secondary)]">
                上传人：{{ getUserNickname(attachment.uploaderUserId) }}
                <span class="mx-6px">·</span>
                {{ formatNullableDate(attachment.createTime) }}
              </div>
            </div>
            <div class="flex flex-shrink-0 items-center gap-8px">
              <el-button
                link
                type="primary"
                @click="handleDownload(attachment.id)"
                v-hasPermi="['helpdesk:ticket:query']"
              >
                下载
              </el-button>
              <el-button
                link
                type="danger"
                :loading="deletingId === attachment.id"
                @click="handleDelete(attachment.id)"
                v-hasPermi="['helpdesk:ticket:attachment']"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { UploadFile } from '@/components/UploadFile'
import { formatFileSize } from '@/utils/file'
import { formatNullableDate } from '@/utils/formatTime'
import * as HelpdeskTicketAttachmentApi from '@/api/helpdesk/ticketAttachment'
import * as UserApi from '@/api/system/user'

defineOptions({ name: 'HelpdeskTicketAttachmentList' })

const props = defineProps<{
  ticketId?: number
  userList: UserApi.UserVO[]
}>()

const emit = defineEmits<{
  changed: []
}>()

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const attachmentFileTypes = [
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'zip',
  'rar',
  '7z'
]

const loading = ref(false) // 附件列表加载中
const submitting = ref(false) // 附件关系保存中
const deletingId = ref<number>() // 正在删除的附件编号
const uploadValue = ref<string | string[]>('') // UploadFile 上传成功后的文件地址
const list = ref<HelpdeskTicketAttachmentApi.TicketAttachmentVO[]>([]) // 附件列表

const getValidTicketId = () => {
  const ticketId = Number(props.ticketId)
  return Number.isFinite(ticketId) && ticketId > 0 ? ticketId : undefined
}

const resetList = () => {
  list.value = []
}

/** 查询附件列表 */
const getList = async () => {
  const ticketId = getValidTicketId()
  if (!ticketId) {
    resetList()
    return
  }
  loading.value = true
  try {
    list.value = await HelpdeskTicketAttachmentApi.getTicketAttachmentList(ticketId)
  } catch {
    resetList()
  } finally {
    loading.value = false
  }
}

/** 上传成功后，持久化工单附件关系 */
const handleUploadedFile = async (fileUrl: string) => {
  const ticketId = getValidTicketId()
  if (!ticketId) {
    message.notifyError('工单编号不能为空')
    uploadValue.value = ''
    return
  }

  submitting.value = true
  try {
    const fileName = getFileNameFromUrl(fileUrl)
    const fileType = getFileTypeFromName(fileName)
    await HelpdeskTicketAttachmentApi.createTicketAttachment({
      ticketId,
      fileUrl,
      fileName,
      fileSize: 0,
      ...(fileType ? { fileType } : {})
    })
    message.success(t('common.createSuccess'))
    await getList()
    emit('changed')
  } finally {
    uploadValue.value = ''
    submitting.value = false
  }
}

/** 删除附件 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    deletingId.value = id
    await HelpdeskTicketAttachmentApi.deleteTicketAttachment(id)
    message.success(t('common.delSuccess'))
    await getList()
    emit('changed')
  } catch {
  } finally {
    deletingId.value = undefined
  }
}

/** 下载附件 */
const handleDownload = (id: number) => {
  window.open(HelpdeskTicketAttachmentApi.getTicketAttachmentDownloadUrl(id), '_blank', 'noopener')
}

/** 获取用户昵称 */
const getUserNickname = (userId?: number) => {
  if (userId == null) {
    return '-'
  }
  return props.userList.find((user) => user.id === userId)?.nickname ?? `#${userId}`
}

/** 展示文件名 */
const getDisplayFileName = (attachment: HelpdeskTicketAttachmentApi.TicketAttachmentVO) => {
  return attachment.fileName || '附件'
}

/** 解析 UploadFile 的模型值 */
const normalizeUploadValue = (value: string | string[]) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }
  return value ? value.split(',').filter(Boolean) : []
}

/** 从 URL 或存储路径中提取文件名 */
const getFileNameFromUrl = (fileUrl: string) => {
  const normalizedUrl = fileUrl.split(/[?#]/)[0]
  const fileName = normalizedUrl.substring(normalizedUrl.lastIndexOf('/') + 1) || '附件'
  try {
    return decodeURIComponent(fileName)
  } catch {
    return fileName
  }
}

/** 从文件名推断文件类型 */
const getFileTypeFromName = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension && extension !== fileName.toLowerCase() ? extension : undefined
}

/** 格式化文件类型 */
const formatAttachmentType = (fileType?: string) => {
  if (!fileType) {
    return '-'
  }
  return fileType.includes('/') ? fileType : fileType.toUpperCase()
}

/** 格式化文件大小 */
const formatAttachmentSize = (fileSize?: number) => {
  if (!fileSize || fileSize <= 0) {
    return '-'
  }
  return formatFileSize(fileSize)
}

watch(
  uploadValue,
  async (value) => {
    const [fileUrl] = normalizeUploadValue(value)
    if (!fileUrl || submitting.value) {
      return
    }
    await handleUploadedFile(fileUrl)
  },
  { deep: true }
)

watch(
  () => props.ticketId,
  async () => {
    await getList()
  },
  { immediate: true }
)
</script>
