<template>
  <el-dialog
    :visible.sync="dialog"
    :close-on-click-modal="false"
    :before-close="cancel"
    :title="isAdd ? '新增用户' : '编辑用户'"
    append-to-body
    width="500px"
  >
    <el-form ref="formm" :model="formm" :rules="rules" size="small" label-width="80px">
      <el-form-item label="用户名称" prop="username">
        <el-input v-model="formm.username" style="width: 370px;" />
      </el-form-item>
      <el-form-item v-if="isAdd" style="margin-bottom: 0px;" label="角色">
        <el-select v-model="roleIds" style="width: 370px;" multiple placeholder="请选择">
          <el-option
            v-for="(item, index) in roles"
            :key="item.roleName + index"
            :label="item.roleName"
            :value="item._id"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="角色级别" prop="sort">
        <el-input-number v-model.number="form.level" :min="1" controls-position="right" style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="数据范围">
        <el-select v-model="form.dataScope" style="width: 370px" placeholder="请选择数据范围" @change="changeScope">
          <el-option
            v-for="item in dateScopes"
            :key="item"
            :label="item"
            :value="item"/>
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.dataScope === '自定义'" label="数据权限">
        <treeselect v-model="deptIds" :options="depts" multiple style="width: 370px" placeholder="请选择" />
      </el-form-item>
      <el-form-item label="描述信息">
        <el-input v-model="form.remark" style="width: 370px;" rows="5" type="textarea"/>
      </el-form-item>-->
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getDepts } from "@/api/dept";
import { add, edit } from "@/api/dataUser";
import { getAll } from "@/api/dataRole";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  components: { Treeselect },
  props: {
    isAdd: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      dateScopes: ["全部", "本级", "自定义"],
      loading: false,
      dialog: false,
      depts: [],
      deptIds: [],
      roleIds: [],
      roles: [],
      form: {
        name: "",
        depts: [],
        remark: "",
        dataScope: "本级",
        level: 3,
        roles: []
      },
      formm: {
        username: "",
        dataRoles: [],
        _id: ""
      },
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }]
      }
    };
  },
  methods: {
    cancel() {
      this.resetForm();
    },
    doSubmit() {
      // if (this.form.dataScope === "自定义" && this.deptIds.length === 0) {
      //   this.$message({
      //     message: "自定义数据权限不能为空",
      //     type: "warning"
      //   });
      // } else {
      // this.form.depts = [];
      // if (this.form.dataScope === "自定义") {
      //   for (let i = 0; i < this.deptIds.length; i++) {
      //     this.form.depts.push({
      //       id: this.deptIds[i]
      //     });
      //   }
      // }
      this.$refs["formm"].validate(valid => {
        if (valid) {
          this.loading = true;
          this.formm.dataRoles = [];
          this.roles.forEach(element => {
            this.roleIds.forEach(id => {
              if (id === element._id) {
                this.formm.dataRoles.push(element.roleName);
              }
            });
          });
          if (this.isAdd) {
            this.doAdd();
          } else this.doEdit();
        } else {
          return false;
        }
      });
      // }
    },
    doAdd() {
      delete this.formm["_id"];
      add(this.formm)
        .then(res => {
          this.resetForm();
          this.$notify({
            title: "添加成功",
            type: "success",
            duration: 2500
          });
          this.loading = false;
          this.$parent.init();
        })
        .catch(err => {
          this.loading = false;
          console.log(err.response.data.message);
        });
    },
    doEdit() {
      edit(this.formm)
        .then(res => {
          this.resetForm();
          this.$notify({
            title: "修改成功",
            type: "success",
            duration: 2500
          });
          this.loading = false;
          this.$parent.init();
        })
        .catch(err => {
          this.loading = false;
          console.log(err.response.data.message);
        });
    },
    resetForm() {
      this.dialog = false;
      this.$refs["formm"].resetFields();
      this.formm = {
        username: "",
        dataRoles: []
      };
    },
    getRoles() {
      getAll()
        .then(res => {
          console.log(res);
          this.roles = res;
        })
        .catch(err => {
          console.log(err.response.data.message);
        });
    },
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content;
      });
    },
    changeScope() {
      if (this.form.dataScope === "自定义") {
        this.getDepts();
      }
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
/deep/ .el-input-number .el-input__inner {
  text-align: left;
}
</style>
