<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
      v-loading="formLoading"
    >
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="分类编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入分类编码" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          placeholder="请输入显示排序"
          class="!w-1/1"
          :precision="0"
          :min="0"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="默认部门" prop="deptId">
        <el-tree-select
          v-model="formData.deptId"
          :data="deptTree"
          :props="defaultProps"
          check-strictly
          default-expand-all
          clearable
          placeholder="请选择默认部门"
        />
      </el-form-item>
      <el-form-item label="默认处理人" prop="defaultAssigneeUserId">
        <el-select
          v-model="formData.defaultAssigneeUserId"
          placeholder="请选择默认处理人"
          clearable
          filterable
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          maxlength="255"
          show-word-limit
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import type { FormRules } from 'element-plus'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { defaultProps, handleTree } from '@/utils/tree'
import { CommonStatusEnum } from '@/utils/constants'
import * as HelpdeskCategoryApi from '@/api/helpdesk/category'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'

/** 工单分类 表单 */
defineOptions({ name: 'HelpdeskCategoryForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref<HelpdeskCategoryApi.CategoryVO>({
  id: undefined,
  name: undefined,
  code: undefined,
  sort: undefined,
  status: CommonStatusEnum.ENABLE,
  deptId: undefined,
  defaultAssigneeUserId: undefined,
  remark: undefined
})
const formRules = reactive<FormRules>({
  name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '分类编码不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const deptTree = ref<Tree[]>([]) // 部门树
const userList = ref<UserApi.UserVO[]>([]) // 用户列表

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  formLoading.value = true
  try {
    await getOptions()
    // 修改时，设置数据
    if (id) {
      formData.value = await HelpdeskCategoryApi.getCategory(id)
    }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value
    if (formType.value === 'create') {
      await HelpdeskCategoryApi.createCategory(data)
      message.success(t('common.createSuccess'))
    } else {
      await HelpdeskCategoryApi.updateCategory(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    code: undefined,
    sort: undefined,
    status: CommonStatusEnum.ENABLE,
    deptId: undefined,
    defaultAssigneeUserId: undefined,
    remark: undefined
  }
  formRef.value?.resetFields()
}

/** 初始化选项 */
const getOptions = async () => {
  const [deptData, userData] = await Promise.all([
    DeptApi.getSimpleDeptList(),
    UserApi.getSimpleUserList()
  ])
  deptTree.value = handleTree(deptData)
  userList.value = userData
}
</script>
