import axios from 'axios'
import router from '@/router/routers'
import { Notification, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'
import Config from '@/config'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.BASE_API : '/', // api 的 base_url
  timeout: Config.timeout // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    console.log(config)
    if (config.url.startsWith('api/dataUsers')) {
      if (config.method === 'delete') {
        var id = config.url;
        id = id.replace('api/dataUsers/', '')
        config.url = 'admin/users/' + id
      } else if (config.url.startsWith('api/dataUsers/edit/')) {
        var id = config.url;
        id = id.replace('api/dataUsers/edit/', '')
        config.url = 'admin/users/' + id
      } else {
        config.url = 'admin/users'
      }
      config.baseURL = 'https://localhost:9090'
    }
    if (config.url.startsWith('api/dataUser')) {
      var username = config.url;
      username = username.replace('api/dataUser/', '')
      config.url = 'admin/users/' + username
      config.baseURL = 'https://localhost:9090'
    }
    if (config.url.startsWith('api/dataRoles')) {
      if (config.method === 'delete') {
        var id = config.url;
        id = id.replace('api/dataRoles/', '')
        config.url = 'admin/roles/' + id
      } else if (config.url.startsWith('api/dataRoles/edit/')) {
        var id = config.url;
        id = id.replace('api/dataRoles/edit/', '')
        config.url = 'admin/roles/' + id
      } else if (config.url === 'api/dataRoles/tree') {
        config.url = 'admin/roles/tree'
      } else {
        config.url = 'admin/roles'
      }
      config.baseURL = 'https://localhost:9090'
    }
    if (config.url.startsWith('api/dataPermissions')) {
      if (config.method === 'delete') {
        var id = config.url;
        id = id.replace('api/dataPermissions/', '')
        config.url = 'admin/permissions/' + id
      } else if (config.url === 'api/dataPermissions/tree') {
        config.url = 'admin/permissions/tree'
      } else {
        config.url = 'admin/permissions'
      }
      config.baseURL = 'https://localhost:9090'
    }
    // config.baseURL = 'https://localhost:8443'
    if (getToken()) {
      config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    config.headers['Content-Type'] = 'application/json'
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    console.log(response)
    const code = response.status
    if (code < 200 || code > 300) {
      Notification.error({
        title: response.message
      })
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    let code = 0
    try {
      code = error.response.data.status
    } catch (e) {
      if (error.toString().indexOf('Error: timeout') !== -1) {
        Notification.error({
          title: '网络请求超时',
          duration: 2500
        })
        return Promise.reject(error)
      }
      if (error.toString().indexOf('Error: Network Error') !== -1) {
        Notification.error({
          title: '网络请求错误',
          duration: 2500
        })
        return Promise.reject(error)
      }
    }
    if (code === 401) {
      MessageBox.confirm(
        '登录状态已过期，您可以继续留在该页面，或者重新登录',
        '系统提示',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        store.dispatch('LogOut').then(() => {
          location.reload() // 为了重新实例化vue-router对象 避免bug
        })
      })
    } else if (code === 403) {
      router.push({ path: '/401' })
    } else {
      const errorMsg = error.response.data.message
      if (errorMsg !== undefined) {
        Notification.error({
          title: errorMsg,
          duration: 2500
        })
      }
    }
    return Promise.reject(error)
  }
)
export default service
