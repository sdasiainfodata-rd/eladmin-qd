import request from '@/utils/request'

export function getPermissionTree() {
  return request({
    url: 'api/dataPermissions/tree',
    method: 'get'
  })
}

// 获取所有的Role
export function getAll() {
  return request({
    url: 'api/dataPermissions',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: 'api/dataPermissions',
    method: 'post',
    data
  })
}

export function get(id) {
  return request({
    url: 'api/roles/' + id,
    method: 'get'
  })
}

export function getLevel() {
  return request({
    url: 'api/roles/level',
    method: 'get'
  })
}

export function del(id) {
  return request({
    url: 'api/dataPermissions/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/dataPermissions',
    method: 'put',
    data
  })
}

export function editPermission(data) {
  return request({
    url: 'api/roles/permission',
    method: 'put',
    data
  })
}

export function editMenu(data) {
  return request({
    url: 'api/roles/menu',
    method: 'put',
    data
  })
}
