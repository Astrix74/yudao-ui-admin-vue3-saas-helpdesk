import request from '@/config/axios'

// 工单操作日志 VO
export interface HelpdeskOperateLogVO {
  id?: number
  userId?: number
  userName?: string
  userType?: number
  type?: string
  subType?: string
  bizId?: number
  action?: string
  extra?: string
  createTime?: Date
}

export interface HelpdeskOperateLogPageReqVO {
  ticketId: number
}

// 查询工单业务操作日志分页
export const getOperateLogPage = async (params: HelpdeskOperateLogPageReqVO) => {
  return await request.get<PageResult<HelpdeskOperateLogVO[]>>({
    url: '/helpdesk/operate-log/page',
    params
  })
}
