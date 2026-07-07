import request from '@/config/axios'
import { getAccessToken } from '@/utils/auth'

const BASE_URL = '/helpdesk/ticket-attachment'

// 工单附件 VO
export interface TicketAttachmentVO {
  id: number
  ticketId: number
  commentId?: number
  fileName: string
  fileType?: string
  fileSize?: number
  uploaderUserId: number
  createTime: Date
}

export interface TicketAttachmentCreateReqVO {
  ticketId: number
  commentId?: number
  fileUrl: string
  fileName: string
  fileType?: string
  fileSize: number
}

// 查询工单附件列表
export const getTicketAttachmentList = async (ticketId: number) => {
  return await request.get<TicketAttachmentVO[]>({ url: BASE_URL + '/list', params: { ticketId } })
}

// 新增工单附件
export const createTicketAttachment = async (data: TicketAttachmentCreateReqVO) => {
  return await request.post({ url: BASE_URL + '/create', data })
}

// 删除工单附件
export const deleteTicketAttachment = async (id: number) => {
  return await request.delete({ url: BASE_URL + '/delete?id=' + id })
}

// 新标签页 GET 不能携带 Authorization/tenant-id header。本项目后端允许 token query
// 参数并可从 LoginUser 回填租户；P3 风险是 token 可能进入浏览器历史、Referer 或日志。
export const getTicketAttachmentDownloadUrl = (id: number) => {
  const accessToken = getAccessToken()
  const tokenQuery = accessToken ? '&token=' + encodeURIComponent(accessToken) : ''
  return (
    import.meta.env.VITE_BASE_URL +
    import.meta.env.VITE_API_URL +
    BASE_URL +
    '/download?id=' +
    encodeURIComponent(id) +
    tokenQuery
  )
}
