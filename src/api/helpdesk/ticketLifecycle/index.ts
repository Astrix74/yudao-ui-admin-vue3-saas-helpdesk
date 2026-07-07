import request from '@/config/axios'

// 工单生命周期 VO
export interface TicketLifecycleVO {
  id?: number
  ticketId?: number
  action?: string
  fromStatus?: number
  toStatus?: number
  fromAssigneeUserId?: number
  toAssigneeUserId?: number
  operatorUserId?: number
  reason?: string
  createTime?: Date
}

// 查询工单生命周期列表
export const getTicketLifecycleList = async (ticketId: number) => {
  return await request.get<TicketLifecycleVO[]>({
    url: '/helpdesk/ticket-lifecycle/list',
    params: { ticketId }
  })
}
