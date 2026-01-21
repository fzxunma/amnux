/** 默认 Meta 配置 */
export function defaultMeta() {
    return {
        showLabel: true,
        labelPlacement: 'left',
        layout: '',
        editable: false,
        fields: [
            { key: 'name', label: '姓名', type: 'XmInput', editable: true, show: true, required: true, placeholder: '请输入姓名', group: '基本信息', options: [] },
            { key: 'age', label: '年龄', type: 'XmInputNumber', editable: true, show: true, placeholder: '请输入年龄', group: '基本信息', options: [] },
            {
                key: 'gender',
                label: '性别',
                type: 'category',
                categoryType: 'single',
                editable: true,
                required: false,
                show: true,
                placeholder: '请选择性别',
                group: '基本信息',
                options: [
                    { label: '男', value: 'M' },
                    { label: '女', value: 'F' }
                ]
            },
            {
                key: 'hobbies',
                label: '爱好',
                type: 'category',
                categoryType: 'multi',
                editable: true,
                show: true,
                required: false,
                group: '兴趣爱好',
                options: [
                    { label: '篮球', value: 'basketball' },
                    { label: '足球', value: 'football' },
                    { label: '游泳', value: 'swimming' }
                ]
            },
            {
                key: 'department',
                label: '部门',
                type: 'category',
                show: true,
                categoryType: 'tree',
                treeOptions: [
                    { label: '研发', key: 'dev', children: [{ label: '前端', key: 'fe' }, { label: '后端', key: 'be' }] },
                    { label: '产品', key: 'pm' }
                ],
                multiple: true,
                group: '兴趣爱好'
            },
            {
                key: 'skills',
                label: '技能',
                type: 'transfer',
                options: [
                    { key: 'js', label: 'JavaScript', value: 'js' },
                    { key: 'ts', label: 'TypeScript', value: 'ts' },
                    { key: 'vue', label: 'Vue', value: 'vue' },
                    { key: 'react', label: 'React', value: 'react' }
                ],
                titles: ['可选技能', '已选技能'],
                group: '兴趣爱好'
            },
            {
                key: 'tags',
                label: '标签',
                type: 'DynamicTags',
                editable: true,
                show: true,
                defaultValue: [
                    { label: 'JavaScript', value: 'js' },
                    { label: 'TypeScript', value: 'ts' },
                    { label: 'Vue', value: 'vue' },
                    { label: 'React', value: 'react' }
                ],
            }

        ],
        data: [
            { name: '张三', age: 28, gender: 'M', hobbies: ['basketball'] },
            { name: '张三', age: 28, gender: 'M', hobbies: ['basketball'] },
            { name: '张三', age: 28, gender: 'M', hobbies: ['basketball'] },
            { name: '张三', age: 28, gender: 'M', hobbies: ['basketball'] },
            { name: '李四', age: 32, gender: 'F', hobbies: ['football', 'swimming'] }
        ],
        groupType: 'tab',
        mode: 'form',
        showActions: true,
        actions: [],
        btnoptions: [
            { key: 'reset', label: '重置', type: 'default', checked: false },
            { key: 'cancel', label: '取消', type: 'default', checked: false },
            { key: 'submit', label: '确定', type: 'primary', checked: false },
        ],
        enablePagination: false,  // 表格是否分页
        pageSize: 31,             // 每页显示条数(默认值)


    }
}
export const action = [
    { checked: false, key: 'reset', label: '重置', type: '', showActions: true,  },
    { checked: false, key: 'cancel', label: '取消', type: '', showActions: false,  },
    { checked: false, key: 'submit', label: '确定', type: '', showActions: true,  },
    { checked: false, key: '1', label: '1', type: '', showActions: true},
]


export const types = [
    { label: '文本输入', value: 'XmInput' },
    { label: '数字输入', value: 'XmInputNumber' },
    { label: '分类选择', value: 'category' },
    { label: '穿梭框', value: 'transfer' },
    { label: '树选择', value: 'tree' },
    { label: '日期选择器', value: 'DatePicker' },
    { label: '删除', value: 'delect' },
    { label: '复选框', value: 'Checkbox' },
    { label: '抽屉', value: 'drawer' },
    { label: '多行文本', value: 'textarea' },
    { label: '开关', value: 'switch' },
    { label: 'Thing', value: 'thing' },
    { label: '上传', value: 'upload' },
    { label: '下拉菜单', value: 'dropdown' },
    { label: '下拉框', value: 'select' },
    { label: '级联选择', value: 'cascader' },
    { label: '动态标签', value: 'DynamicTags' },
]

export const categoryTypes = [
    { label: '单选', value: 'single' },
    { label: '多选', value: 'multi' }
]

export const groupTypeOptions = [
    { label: 'Step 模式', value: 'step' },
    { label: 'Tab 模式', value: 'tab' },
    { label: '普通 Form 模式', value: 'default' },
    { label: 'Table 模式', value: 'table' },
    { label: 'Card 模式', value: 'card' },
    { label: 'CardList 模式', value: 'cardlist' },
    { label: 'ECharts 模式', value: 'chart' },
    { label: 'View 模式', value: 'view' }
]

export const DatePickerTypes = [
    { label: '日期', value: 'date' },
    { label: '日期时间', value: 'datetime' },
    { label: '日期范围', value: 'daterange' },
    { label: '日期时间范围', value: 'datetimerange' }
]


export const uploadTypes = [
    { label: '单图片上传', value: 'single-image' },
    { label: '单文件上传', value: 'single-file' },
    { label: '单视频上传', value: 'single-video' },
    { label: '多图片上传', value: 'multiple-image' },
    { label: '多文件上传', value: 'multiple-file' },
    { label: '多视频上传', value: 'multiple-video' }
]