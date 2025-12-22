export const XmFormMate = {
  key: 'userForm',
  layout: 'grid',
  cols: 2,
  fields: [
    {
      key: 'username',
      label: '用户名',
      type: 'input',
      props: {
        placeholder: '请输入用户名'
      }
    },
    {
      key: 'role',
      label: '角色',
      type: 'select',
      props: {
        options: [
          { label: '管理员', value: 'admin' },
          { label: '用户', value: 'user' }
        ]
      }
    },
    {
      key: 'adminCode',
      label: '管理员编号',
      type: 'input',
      visible: ({ get }) => get('role') === 'admin'
    },
    {
      key: 'enable',
      label: '启用',
      type: 'switch',
      default: true
    }
  ]
}
