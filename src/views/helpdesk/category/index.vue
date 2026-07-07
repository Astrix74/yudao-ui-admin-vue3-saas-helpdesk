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
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入分类名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="分类编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入分类编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-240px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="默认部门" prop="deptId">
        <el-tree-select
          v-model="queryParams.deptId"
          :data="deptTree"
          :props="defaultProps"
          check-strictly
          default-expand-all
          clearable
          placeholder="请选择默认部门"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="默认处理人" prop="defaultAssigneeUserId">
        <el-select
          v-model="queryParams.defaultAssigneeUserId"
          placeholder="请选择默认处理人"
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
          v-hasPermi="['helpdesk:category:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['helpdesk:category:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="分类编号" align="center" prop="id" width="100" />
      <el-table-column label="分类名称" align="center" prop="name" min-width="140" />
      <el-table-column label="分类编码" align="center" prop="code" min-width="140" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="默认部门" align="center" prop="deptId" min-width="140">
        <template #default="scope">
          {{ getDeptName(scope.row.deptId) }}
        </template>
      </el-table-column>
      <el-table-column
        label="默认处理人"
        align="center"
        prop="defaultAssigneeUserId"
        min-width="140"
      >
        <template #default="scope">
          {{ getUserNickname(scope.row.defaultAssigneeUserId) }}
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" width="80" />
      <el-table-column label="备注" align="center" prop="remark" min-width="160" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" width="140">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['helpdesk:category:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['helpdesk:category:delete']"
          >
            删除
          </el-button>
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
  <CategoryForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { defaultProps, handleTree } from '@/utils/tree'
import download from '@/utils/download'
import * as HelpdeskCategoryApi from '@/api/helpdesk/category'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import CategoryForm from './CategoryForm.vue'

/** 工单分类 列表 */
defineOptions({ name: 'HelpdeskCategory' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<HelpdeskCategoryApi.CategoryVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined as string | undefined,
  code: undefined as string | undefined,
  status: undefined as number | undefined,
  deptId: undefined as number | undefined,
  defaultAssigneeUserId: undefined as number | undefined,
  createTime: [] as string[]
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const deptList = ref<DeptApi.DeptVO[]>([]) // 部门列表
const deptTree = ref<Tree[]>([]) // 部门树
const userList = ref<UserApi.UserVO[]>([]) // 用户列表

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await HelpdeskCategoryApi.getCategoryPage(queryParams)
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

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await HelpdeskCategoryApi.deleteCategory(id)
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
    const data = await HelpdeskCategoryApi.exportCategory(queryParams)
    download.excel(data, '工单分类.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
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
  const [deptData, userData] = await Promise.all([
    DeptApi.getSimpleDeptList(),
    UserApi.getSimpleUserList()
  ])
  deptList.value = deptData
  deptTree.value = handleTree(deptData)
  userList.value = userData
}

/** 初始化 **/
onMounted(async () => {
  await Promise.all([getList(), getOptions()])
})
</script>
