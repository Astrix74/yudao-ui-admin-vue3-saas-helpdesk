import request from '@/config/axios'

// 工单评论 VO
export interface TicketCommentVO {
  id: number
  ticketId: number
  userId: number
  content: string
  internal: boolean
  createTime: Date
}

export interface TicketCommentCreateReqVO {
  ticketId: number
  content: string
  internal?: boolean
}

export interface TicketCommentPageReqVO extends PageParam {
  ticketId: number
}

// 查询工单评论分页
export const getTicketCommentPage = async (params: TicketCommentPageReqVO) => {
  return await request.get<PageResult<TicketCommentVO[]>>({
    url: '/helpdesk/ticket-comment/page',
    params
  })
}

// 新增工单评论
export const createTicketComment = async (data: TicketCommentCreateReqVO) => {
  return await request.post({ url: '/helpdesk/ticket-comment/create', data })
}

// 删除工单评论
export const deleteTicketComment = async (id: number) => {
  return await request.delete({ url: '/helpdesk/ticket-comment/delete?id=' + id })
}
