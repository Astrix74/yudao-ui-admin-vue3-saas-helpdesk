import request from '@/config/axios'

// 工单分类 VO
export interface CategoryVO {
  id?: number
  name?: string
  code?: string
  sort?: number
  status?: number
  deptId?: number
  defaultAssigneeUserId?: number
  remark?: string
  createTime?: Date
}

// 工单分类精简 VO
export interface CategorySimpleVO {
  id: number
  name: string
  code: string
}

// 查询工单分类分页
export const getCategoryPage = async (params: any) => {
  return await request.get({ url: '/helpdesk/category/page', params })
}

// 查询工单分类精简列表
export const getCategorySimpleList = async (): Promise<CategorySimpleVO[]> => {
  return await request.get({ url: '/helpdesk/category/simple-list' })
}

// 查询工单分类详情
export const getCategory = async (id: number) => {
  return await request.get({ url: '/helpdesk/category/get?id=' + id })
}

// 新增工单分类
export const createCategory = async (data: CategoryVO) => {
  return await request.post({ url: '/helpdesk/category/create', data })
}

// 修改工单分类
export const updateCategory = async (data: CategoryVO) => {
  return await request.put({ url: '/helpdesk/category/update', data })
}

// 删除工单分类
export const deleteCategory = async (id: number) => {
  return await request.delete({ url: '/helpdesk/category/delete?id=' + id })
}

// 导出工单分类 Excel
export const exportCategory = async (params: any) => {
  return await request.download({ url: '/helpdesk/category/export-excel', params })
}
