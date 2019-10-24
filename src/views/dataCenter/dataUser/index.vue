<template>
  <div class="app-container">
    <!--表单组件-->
    <eForm ref="form" :is-add="isAdd" />
    <!--工具栏-->
    <div class="head-container">
      <!-- 搜索 -->
      <!-- <el-input v-model="query.value" clearable placeholder="输入名称或者描述搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="toQuery"/>
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="toQuery">搜索</el-button>-->
      <!-- 新增 -->
      <div v-permission="['ADMIN']" style="display: inline-block;margin: 0px 2px;">
        <el-button
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="add"
        >新增</el-button>
      </div>
    </div>
    <el-row :gutter="15">
      <!--中台用户管理-->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" style="margin-bottom: 10px">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">中台用户列表</span>
            <div id="opt" style="float: right">
              <el-radio-group v-model="opt" size="mini">
                <el-radio-button label="角色分配" />
              </el-radio-group>
            </div>
          </div>
          <el-table
            v-loading="loading"
            :data="data"
            highlight-current-row
            size="small"
            style="width: 100%;"
            @current-change="handleCurrentChange"
          >
            <el-table-column prop="username" label="名称" />
            <el-table-column :show-overflow-tooltip="true" prop="create_time" label="创建时间">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.create_time) }}</span>
              </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="last_update_time" label="最后修改时间">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.last_update_time) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="是否删除" align="center">
              <template slot-scope="scope">
                <div v-for="item in dicts" :key="item.id">
                  <el-tag
                    v-if="scope.row.is_delete.toString() === item.value"
                    :type="scope.row.is_delete ? '' : 'info'"
                  >{{ item.label }}</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              v-if="checkPermission(['ADMIN'])"
              label="操作"
              width="130px"
              align="center"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  v-permission="['ADMIN']"
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="edit(scope.row)"
                />
                <el-popover
                  v-permission="['ADMIN']"
                  :ref="scope.row.id"
                  placement="top"
                  width="180"
                >
                  <p>确定删除本条数据吗？</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
                    <el-button
                      :loading="delLoading"
                      type="primary"
                      size="mini"
                      @click="subDelete(scope.row.id)"
                    >确定</el-button>
                  </div>
                  <el-button slot="reference" type="danger" icon="el-icon-delete" size="mini" />
                </el-popover>
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <el-pagination
            :total="total"
            :current-page="page + 1"
            style="margin-top: 8px;"
            layout="total, prev, pager, next, sizes"
            @size-change="sizeChange"
            @current-change="pageChange"
          />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
        <el-card v-if="hackReset" v-show="opt === '角色分配'" class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <el-tooltip class="item" effect="dark" content="选择指定中台用户分配角色" placement="top">
              <span class="role-span">角色分配</span>
            </el-tooltip>
            <el-button
              v-permission="['ADMIN']"
              :disabled="!showButton"
              :loading="dataRoleLoading"
              icon="el-icon-check"
              size="mini"
              style="float: right; padding: 6px 9px"
              type="primary"
              @click="saveRoles"
            >保存</el-button>
          </div>
          <el-tree
            ref="dataRole"
            :data="dataRoles"
            :default-checked-keys="dataRoleIds"
            :props="defaultProps"
            show-checkbox
            accordion
            node-key="id"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import checkPermission from "@/utils/permission";
import initData from "@/mixins/initData";
import initDict from "@/mixins/initDict";
import { del, edit, getAllUsers } from "@/api/dataUser";
import { getAll } from "@/api/dataRole";
import { parseTime } from "@/utils/index";
import eForm from "./form";
export default {
  name: "DataUser",
  components: { eForm },
  mixins: [initData, initDict],
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "label"
      },
      currentId: 0,
      dataRoleLoading: false,
      showButton: false,
      opt: "角色分配",
      delLoading: false,
      dataRoles: [],
      dataRoleIds: [],
      hackReset: true
    };
  },
  created() {
    this.getAllRoles();
    this.$nextTick(() => {
      this.init();
      // 加载数据字典
      this.getDict("data_status");
    });
  },
  methods: {
    parseTime,
    checkPermission,
    beforeInit() {
      this.showButton = false;
      this.url = "api/dataUsers";
      const sort = "level,asc";
      const query = this.query;
      const value = query.value;
      this.params = { page: this.page, size: this.size, sort: sort };
      if (value) {
        this.params["blurry"] = value;
      }
      return true;
    },
    subDelete(id) {
      this.delLoading = true;
      del(id)
        .then(res => {
          this.delLoading = false;
          this.$refs[id].doClose();
          this.dleChangePage();
          this.init();
          this.$notify({
            title: "删除成功",
            type: "success",
            duration: 2500
          });
        })
        .catch(err => {
          this.delLoading = false;
          this.$refs[id].doClose();
          console.log(err.response.data.message);
        });
    },
    handleCurrentChange(val) {
      if (val) {
        const _this = this;
        // 清空权限与菜单的选中
        this.$refs.dataRole.setCheckedKeys([]);
        // 保存当前的角色id
        this.currentId = val.id;
        // 点击后显示按钮
        this.showButton = true;
        // 初始化
        this.dataRoleIds = [];
        if (val.data_roles) {
          val.data_roles.forEach(function(data, index) {
            _this.dataRoleIds.push(data);
          });
        }
      }
    },
    getAllRoles() {
      getAll().then(res => {
        res.forEach(element => {
          this.dataRoles.push({
            id: element.role_name,
            label: element.role_name
          });
        });
        console.log(this.dataRoles);
      });
    },
    saveRoles() {
      this.dataRoleLoading = true;
      var currentCheckedRoles = [];
      this.$refs.dataRole.getCheckedKeys().forEach(function(data, index) {
        currentCheckedRoles.push(data);
      });
      var thisUser = {};
      this.data.forEach(element => {
        if (element.id === this.currentId) {
          thisUser = {
            id: element.id,
            isDelete: element.is_delete,
            lastUpdateTime: element.last_update_time,
            username: element.username,
            createTime: element.create_time,
            dataRoles: currentCheckedRoles
          };
          console.log(thisUser);
        }
      });
      edit(thisUser)
        .then(res => {
          this.$notify({
            title: "保存成功",
            type: "success",
            duration: 2500
          });
          this.dataRoleLoading = false;
          this.update();
          // this.hardReset = false;
          // this.$nextTick(() => {
          //   this.hardReset = true;
          // });
        })
        .catch(err => {
          this.dataRoleLoading = false;
          console.log(err.response.data.message);
        });
    },
    update() {
      // 无刷新更新 表格数据
      get(this.currentId).then(res => {
        for (let i = 0; i < this.data.length; i++) {
          if (res.id === this.data[i].id) {
            this.data[i] = res;
            break;
          }
        }
      });
    },
    add() {
      this.isAdd = true;
      this.$refs.form.dialog = true;
    },
    edit(data) {
      this.isAdd = false;
      const _this = this.$refs.form;
      _this.form = {
        username: data.username,
        id: data.id
      };
      _this.dialog = true;
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.role-span {
  font-weight: bold;
  color: #303133;
  font-size: 15px;
}
</style>

<style scoped>
.el-tree-node__label {
  margin-left: 5px;
}
</style>
