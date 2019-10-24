import request from '@/utils/request'

// 获取所有的Role
export function getAllUsers() {
  return request({
    url: 'api/dataUsers',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: 'api/dataUsers',
    method: 'post',
    data
  })
}

export function get(username) {
  return request({
    url: 'api/dataUser/' + username,
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
    url: 'api/dataUsers/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/dataUsers',
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
