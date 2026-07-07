<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="关键词" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="请输入工单号/标题"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          placeholder="请选择分类"
          clearable
          filterable
          class="!w-240px"
        >
          <el-option
            v-for="category in categoryList"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-240px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.HELPDESK_TICKET_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select
          v-model="queryParams.priority"
          placeholder="请选择优先级"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.HELPDESK_TICKET_PRIORITY)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="来源" prop="source">
        <el-select v-model="queryParams.source" placeholder="请选择来源" clearable class="!w-240px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.HELPDESK_TICKET_SOURCE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="请求人" prop="requesterUserId">
        <el-select
          v-model="queryParams.requesterUserId"
          placeholder="请选择请求人"
          clearable
          filterable
          class="!w-240px"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="处理人" prop="assigneeUserId">
        <el-select
          v-model="queryParams.assigneeUserId"
          placeholder="请选择处理人"
          clearable
          filterable
          class="!w-240px"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="负责部门" prop="teamDeptId">
        <el-tree-select
          v-model="queryParams.teamDeptId"
          :data="deptTree"
          :props="defaultProps"
          check-strictly
          default-expand-all
          clearable
          placeholder="请选择负责部门"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['helpdesk:ticket:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['helpdesk:ticket:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="工单号" align="center" prop="no" min-width="140" />
      <el-table-column label="标题" align="center" prop="title" min-width="180" />
      <el-table-column label="分类" align="center" prop="categoryId" min-width="140">
        <template #default="scope">
          {{ getCategoryName(scope.row.categoryId) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="110">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.HELPDESK_TICKET_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="优先级" align="center" prop="priority" width="110">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.HELPDESK_TICKET_PRIORITY" :value="scope.row.priority" />
        </template>
      </el-table-column>
      <el-table-column label="来源" align="center" prop="source" width="110">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.HELPDESK_TICKET_SOURCE" :value="scope.row.source" />
        </template>
      </el-table-column>
      <el-table-column label="请求人" align="center" prop="requesterUserId" min-width="120">
        <template #default="scope">
          {{ getUserNickname(scope.row.requesterUserId) }}
        </template>
      </el-table-column>
      <el-table-column label="处理人" align="center" prop="assigneeUserId" min-width="120">
        <template #default="scope">
          {{ getUserNickname(scope.row.assigneeUserId) }}
        </template>
      </el-table-column>
      <el-table-column label="负责部门" align="center" prop="teamDeptId" min-width="140">
        <template #default="scope">
          {{ getDeptName(scope.row.teamDeptId) }}
        </template>
      </el-table-column>
      <el-table-column label="评论数" align="center" prop="commentCount" width="90" />
      <el-table-column label="附件数" align="center" prop="attachmentCount" width="90" />
      <el-table-column
        label="最后评论时间"
        align="center"
        prop="lastCommentTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" width="210" fixed="right">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <el-button
              link
              type="primary"
              @click="openDetail(scope.row.id)"
              v-hasPermi="['helpdesk:ticket:query']"
            >
              详情
            </el-button>
            <el-button
              link
              type="primary"
              @click="openForm('update', scope.row.id)"
              v-hasPermi="['helpdesk:ticket:update']"
            >
              编辑
            </el-button>
            <el-dropdown
              v-if="getVisibleTicketActions(scope.row).length > 0"
              @command="(command) => handleActionCommand(command, scope.row)"
            >
              <el-button link type="primary">
                <Icon icon="ep:d-arrow-right" />
                流转
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="action in getVisibleTicketActions(scope.row)"
                    :key="action.code"
                    :command="action.code"
                  >
                    {{ action.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button
              link
              type="danger"
              @click="handleDelete(scope.row.id)"
              v-hasPermi="['helpdesk:ticket:delete']"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <TicketForm ref="formRef" @success="getList" />
  <TicketAssignDialog ref="assignDialogRef" @success="handleActionSuccess" />
  <TicketTransferDialog ref="transferDialogRef" @success="handleActionSuccess" />
  <TicketRequestInfoDialog ref="requestInfoDialogRef" @success="handleActionSuccess" />
  <TicketResolveDialog ref="resolveDialogRef" @success="handleActionSuccess" />
  <TicketCloseDialog ref="closeDialogRef" @success="handleActionSuccess" />
  <TicketReopenDialog ref="reopenDialogRef" @success="handleActionSuccess" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { checkPermi } from '@/utils/permission'
import { defaultProps, handleTree } from '@/utils/tree'
import download from '@/utils/download'
import * as HelpdeskCategoryApi from '@/api/helpdesk/category'
import * as HelpdeskTicketApi from '@/api/helpdesk/ticket'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import TicketAssignDialog from './components/TicketAssignDialog.vue'
import TicketCloseDialog from './components/TicketCloseDialog.vue'
import TicketReopenDialog from './components/TicketReopenDialog.vue'
import TicketRequestInfoDialog from './components/TicketRequestInfoDialog.vue'
import TicketResolveDialog from './components/TicketResolveDialog.vue'
import TicketTransferDialog from './components/TicketTransferDialog.vue'
import TicketForm from './TicketForm.vue'
import {
  getAvailableTicketActionsByStatus,
  type TicketActionCode,
  type TicketActionMeta
} from './ticketActions'

/** 工单 列表 */
defineOptions({ name: 'HelpdeskTicket' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const { push } = useRouter() // 路由

const loading = ref(true) // 列表的加载中
const list = ref<HelpdeskTicketApi.TicketVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive<HelpdeskTicketApi.TicketPageReqVO>({
  pageNo: 1,
  pageSize: 10,
  status: undefined,
  priority: undefined,
  source: undefined,
  categoryId: undefined,
  requesterUserId: undefined,
  assigneeUserId: undefined,
  teamDeptId: undefined,
  keyword: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const categoryList = ref<HelpdeskCategoryApi.CategorySimpleVO[]>([]) // 分类列表
const deptList = ref<DeptApi.DeptVO[]>([]) // 部门列表
const deptTree = ref<Tree[]>([]) // 部门树
const userList = ref<UserApi.UserVO[]>([]) // 用户列表

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await HelpdeskTicketApi.getTicketPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 详情操作 */
const openDetail = (id?: number) => {
  if (!id) return
  push({ name: 'HelpdeskTicketDetail', params: { id } })
}

/** 生命周期动作 */
const assignDialogRef = ref()
const transferDialogRef = ref()
const requestInfoDialogRef = ref()
const resolveDialogRef = ref()
const closeDialogRef = ref()
const reopenDialogRef = ref()

const getVisibleTicketActions = (ticket: HelpdeskTicketApi.TicketVO): TicketActionMeta[] => {
  return getAvailableTicketActionsByStatus(ticket.status).filter((action) =>
    checkPermi([action.permission])
  )
}

const handleActionCommand = (
  command: TicketActionCode,
  ticket: HelpdeskTicketApi.TicketVO
) => {
  if (command === 'assign') {
    assignDialogRef.value?.open(ticket)
  } else if (command === 'transfer') {
    transferDialogRef.value?.open(ticket)
  } else if (command === 'request-info') {
    requestInfoDialogRef.value?.open(ticket)
  } else if (command === 'resolve') {
    resolveDialogRef.value?.open(ticket)
  } else if (command === 'close') {
    closeDialogRef.value?.open(ticket)
  } else if (command === 'reopen') {
    reopenDialogRef.value?.open(ticket)
  }
}

const handleActionSuccess = async () => {
  await getList()
}

/** 删除按钮操作 */
const handleDelete = async (id?: number) => {
  if (!id) return
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await HelpdeskTicketApi.deleteTicket(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await HelpdeskTicketApi.exportTicket(queryParams)
    download.excel(data, '工单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 获取分类名称 */
const getCategoryName = (categoryId?: number) => {
  if (categoryId == null) {
    return '-'
  }
  return categoryList.value.find((category) => category.id === categoryId)?.name ?? `#${categoryId}`
}

/** 获取部门名称 */
const getDeptName = (deptId?: number) => {
  if (deptId == null) {
    return '-'
  }
  return deptList.value.find((dept) => dept.id === deptId)?.name ?? `#${deptId}`
}

/** 获取用户昵称 */
const getUserNickname = (userId?: number) => {
  if (userId == null) {
    return '-'
  }
  return userList.value.find((user) => user.id === userId)?.nickname ?? `#${userId}`
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
  deptTree.value = handleTree(deptData)
  userList.value = userData
}

/** 初始化 **/
onMounted(async () => {
  await Promise.all([getList(), getOptions()])
})
</script>
