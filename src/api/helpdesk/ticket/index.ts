import request from '@/config/axios'

// 工单 VO
export interface TicketVO {
  id?: number
  no?: string
  title?: string
  description?: string
  categoryId?: number
  priority?: number
  status?: number
  source?: number
  requesterUserId?: number
  assigneeUserId?: number
  teamDeptId?: number
  lastCommentTime?: Date
  resolvedTime?: Date
  closedTime?: Date
  reopenedTime?: Date
  commentCount?: number
  attachmentCount?: number
  createTime?: Date
}

export interface TicketCreateReqVO {
  title?: string
  description?: string
  categoryId?: number
  priority?: number
}

export interface TicketUpdateReqVO extends TicketCreateReqVO {
  id?: number
}

export interface TicketPageReqVO extends PageParam {
  status?: number
  priority?: number
  source?: number
  categoryId?: number
  requesterUserId?: number
  assigneeUserId?: number
  teamDeptId?: number
  keyword?: string
  createTime?: string[]
}

export interface TicketAssignReqVO {
  id: number
  assigneeUserId: number
  reason?: string
}

export interface TicketTransferReqVO {
  id: number
  assigneeUserId: number
  reason?: string
}

export interface TicketRequestInfoReqVO {
  id: number
  reason: string
}

export interface TicketResolveReqVO {
  id: number
  reason?: string
}

export interface TicketCloseReqVO {
  id: number
  reason?: string
}

export interface TicketReopenReqVO {
  id: number
  reason?: string
}

// 查询工单分页
export const getTicketPage = async (params: TicketPageReqVO) => {
  return await request.get<PageResult<TicketVO[]>>({ url: '/helpdesk/ticket/page', params })
}

// 导出工单 Excel
export const exportTicket = async (params: TicketPageReqVO) => {
  return await request.download({ url: '/helpdesk/ticket/export-excel', params })
}

// 查询工单详情
export const getTicket = async (id: number) => {
  return await request.get<TicketVO>({ url: '/helpdesk/ticket/get?id=' + id })
}

// 新增工单
export const createTicket = async (data: TicketCreateReqVO) => {
  return await request.post({ url: '/helpdesk/ticket/create', data })
}

// 修改工单
export const updateTicket = async (data: TicketUpdateReqVO) => {
  return await request.put({ url: '/helpdesk/ticket/update', data })
}

// 删除工单
export const deleteTicket = async (id: number) => {
  return await request.delete({ url: '/helpdesk/ticket/delete?id=' + id })
}

// 分配工单
export const assignTicket = async (data: TicketAssignReqVO) => {
  return await request.put<boolean>({ url: '/helpdesk/ticket/assign', data })
}

// 转派工单
export const transferTicket = async (data: TicketTransferReqVO) => {
  return await request.put<boolean>({ url: '/helpdesk/ticket/transfer', data })
}

// 请求补充工单信息
export const requestInfoTicket = async (data: TicketRequestInfoReqVO) => {
  return await request.put<boolean>({ url: '/helpdesk/ticket/request-info', data })
}

// 解决工单
export const resolveTicket = async (data: TicketResolveReqVO) => {
  return await request.put<boolean>({ url: '/helpdesk/ticket/resolve', data })
}

// 关闭工单
export const closeTicket = async (data: TicketCloseReqVO) => {
  return await request.put<boolean>({ url: '/helpdesk/ticket/close', data })
}

// 重开工单
export const reopenTicket = async (data: TicketReopenReqVO) => {
  return await request.put<boolean>({ url: '/helpdesk/ticket/reopen', data })
}
