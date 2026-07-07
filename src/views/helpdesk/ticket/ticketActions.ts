export const HELPDESK_TICKET_STATUS = {
  NEW: 10,
  IN_PROGRESS: 20,
  WAITING_REQUESTER: 30,
  RESOLVED: 40,
  CLOSED: 50
} as const

export type TicketActionCode =
  | 'assign'
  | 'transfer'
  | 'request-info'
  | 'resolve'
  | 'close'
  | 'reopen'

export interface TicketActionMeta {
  code: TicketActionCode
  label: string
  permission: `helpdesk:ticket:${TicketActionCode}`
  allowedStatuses: number[]
}

export const TICKET_ACTIONS: TicketActionMeta[] = [
  {
    code: 'assign',
    label: '分配',
    permission: 'helpdesk:ticket:assign',
    allowedStatuses: [HELPDESK_TICKET_STATUS.NEW]
  },
  {
    code: 'transfer',
    label: '转派',
    permission: 'helpdesk:ticket:transfer',
    allowedStatuses: [HELPDESK_TICKET_STATUS.IN_PROGRESS, HELPDESK_TICKET_STATUS.WAITING_REQUESTER]
  },
  {
    code: 'request-info',
    label: '请求补充',
    permission: 'helpdesk:ticket:request-info',
    allowedStatuses: [HELPDESK_TICKET_STATUS.IN_PROGRESS]
  },
  {
    code: 'resolve',
    label: '解决',
    permission: 'helpdesk:ticket:resolve',
    allowedStatuses: [HELPDESK_TICKET_STATUS.IN_PROGRESS]
  },
  {
    code: 'close',
    label: '关闭',
    permission: 'helpdesk:ticket:close',
    allowedStatuses: [HELPDESK_TICKET_STATUS.RESOLVED]
  },
  {
    code: 'reopen',
    label: '重开',
    permission: 'helpdesk:ticket:reopen',
    allowedStatuses: [
      HELPDESK_TICKET_STATUS.WAITING_REQUESTER,
      HELPDESK_TICKET_STATUS.RESOLVED,
      HELPDESK_TICKET_STATUS.CLOSED
    ]
  }
]

const TICKET_LIFECYCLE_ACTION_LABEL_MAP: Record<string, string> = {
  create: '创建工单',
  update: '更新工单',
  assign: '分配工单',
  transfer: '转派工单',
  'request-info': '请求补充',
  resolve: '解决工单',
  close: '关闭工单',
  reopen: '重开工单',
  comment: '评论工单',
  attachment: '附件变更'
}

export const getTicketActionMeta = (code: TicketActionCode) => {
  return TICKET_ACTIONS.find((action) => action.code === code)
}

export const getAvailableTicketActionsByStatus = (status?: number) => {
  if (status == null) {
    return []
  }
  return TICKET_ACTIONS.filter((action) => action.allowedStatuses.includes(status))
}

export const getTicketLifecycleActionLabel = (action?: string) => {
  if (!action) {
    return '-'
  }
  return TICKET_LIFECYCLE_ACTION_LABEL_MAP[action] ?? action
}
