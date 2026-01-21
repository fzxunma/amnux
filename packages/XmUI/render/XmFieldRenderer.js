// XmFieldRenderer.js
import { h, computed } from 'vue'
import {
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  NDatePicker,
  NCheckbox,
  NCheckboxGroup,
  NRadio,
  NRadioGroup,
  NTreeSelect,
  NTransfer,
  NFormItem,
  NSpace,
  NButton,
  NUpload,
  NDropdown,
  NCalendar,
  NCascader,
  NDynamicTags,
  useNotification
} from 'naive-ui'
import { resolveFieldProps as defaultResolveFieldProps } from './XmFormUtils.js'
// import {toRaw} from 'vue'
/**
 * 低代码字段组件映射
 */
export const XmFormFieldMap = {
  XmInput: NInput,
  XmInputNumber: NInputNumber,
  XmSelect: NSelect,
  XmSwitch: NSwitch,
  XmDatePicker: NDatePicker,
  XmCheckbox: NCheckbox,
  XmCheckboxGroup: NCheckboxGroup,
  XmRadio: NRadio,
  XmRadioGroup: NRadioGroup,
  XmTreeSelect: NTreeSelect,
  XmTransfer: NTransfer,
  XmUpload: NUpload,
  XmDropdown: NDropdown,
  XmCalendar: NCalendar,
  XmCascader: NCascader,
  XmNDynamicTags: NDynamicTags
}

/**
 * 渲染单个字段（基础字段 + 分类 + transfer 等）
 */
export function renderField(f, formModel, updateField, exprCtx) {

  const value = computed({
    get: () => formModel[f.key],
    set: v => updateField(f, v)
  })

  const disabled = computed(() => typeof f.disabled === 'function' ? f.disabled(exprCtx) : !!f.disabled)
  const readonly = computed(() => typeof f.readonly === 'function' ? f.readonly(exprCtx) : !!f.readonly)
  const visible = computed(() => typeof f.visible === 'function' ? f.visible(exprCtx) : f.visible !== false)

  if (!visible.value) return null
  // 分类字段
  if (f.type === 'category') {
    if (f.categoryType === 'single') {
      return h(NRadioGroup, {
        value: value.value,
        options: f.options || [],
        placeholder: f.placeholder,
        disabled: disabled.value || readonly.value,
        clearable: f.clearable,
        'onUpdate:value': v => value.value = v
      }, () =>
        (f.options || []).map(o =>
          h(NRadio, { key: o.value, value: o.value }, () => o.label)
        )
      )
    }
    if (f.categoryType === 'multi') {
      return h(NCheckboxGroup, {
        value: Array.isArray(value.value) ? value.value : [],
        disabled: disabled.value || readonly.value,
        'onUpdate:value': v => value.value = v
      }, () =>
        (f.options || []).map(o =>
          h(NCheckbox, { key: o.value, value: o.value }, () => o.label)
        )
      )
    }
    if (f.categoryType === 'tree') {

      return h(NTreeSelect, {
        value: f.multiple ? (Array.isArray(value.value) ? value.value : []) : value.value,
        multiple: !!f.multiple,
        options: f.treeOptions || [],
        placeholder: f.placeholder,
        disabled: disabled.value || readonly.value,
        'onUpdate:value': v => value.value = v
      })
    }
    //下拉框
    if (f.categoryType === 'select') {
      return h(NTreeSelect, {
        value: f.multiple ? (Array.isArray(value.value) ? value.value : []) : value.value,
        multiple: !!f.multiple,
        options: f.treeOptions || [],
        placeholder: f.placeholder,
        disabled: disabled.value || readonly.value,
        'onUpdate:value': v => value.value = v
      })
    }
  }

  //级联选择
  if (f.type === 'cascader') {
    return h(NCascader, {
      value: Array.isArray(value.value) ? value.value : [],
      options: f.options || [],
      'children-field': 'children',
      'label-field': 'label',
      'value-field': 'value',
      cascade: true,
      multiple: true,
      'check-strategy': 'all',
      disabled: disabled.value || readonly.value,
      'expand-trigger': 'click',
      'onUpdate:value': v => value.value = v
    })
  }


  //thing
  if (f.type === 'thing') {
    const ALL_VALUE = '__all__'

    return h(
      NSpace,
      { vertical: true },
      {
        default: () => [
          // 多选（最前面插入“全选”）
          h(
            NRadioGroup,
            {
              value: value.value || null,
              disabled: disabled.value || readonly.value,
              'onUpdate:value': v => value.value = v
            },
            () =>
              [
                // 全选（renderer 内部）
                h(
                  NRadio,
                  { key: ALL_VALUE, value: ALL_VALUE },
                  () => '全选'
                ),
                // 原有选项
                ...(f.options || []).map(o =>
                  h(
                    NRadio,
                    { key: o.value, value: o.value },
                    () => o.label
                  )
                )
              ]
          ),

          // 按钮区
          h(
            NSpace,
            { size: 'small' },
            () => {
              const selected = value.value || []

              // ① 勾选了“全选” → 显示全部按钮
              if (selected.includes(ALL_VALUE)) {
                return (f.options || []).map(o =>
                  h(
                    NButton,
                    {
                      key: o.value,
                      type: 'primary',
                      'data-field': f.key,
                      'data-option': o.value
                    },
                    () => o.buttonText || o.label
                  )
                )
              }

              // ② 否则 → 显示选中项对应的按钮
              return (f.options || [])
                .filter(o => selected.includes(o.value))
                .map(o =>
                  h(
                    NButton,
                    {
                      key: o.value,
                      type: 'primary',
                      'data-field': f.key,
                      'data-option': o.value
                    },
                    () => o.buttonText || o.label
                  )
                )
            }
          )
        ]
      }
    )
  }

  // 动态标签
  if (f.type === 'DynamicTags') {
    console.log(f)
    return h(
      NDynamicTags,
      {
        modelValue:  Array.isArray(value.value) ? value.value : [],
        defaultValue:f.defaultValue||[],
        disabled: disabled.value || readonly.value,
         'onUpdate:value': v => value.value = v
      }, () =>
        (f.defaultValue || []).map(o =>
          h(NTag, { key: o.value, value: o.value }, () => o.label)
        )
    )
  }


  // 下拉菜单
  if (f.type === 'dropdown') {

    // 递归渲染菜单项
    const renderOptions = (options) => {
      return options.map(option => {
        // 如果 option 的 value 是 URL，则使用该 URL
        const href = option.value.startsWith('http') ? option.value : `/${option.value}`;

        // 递归处理子菜单项
        const children = option.children ? renderOptions(option.children) : [];

        return {
          label: h('a', { href: href, target: '_blank' }, option.label),  // 渲染菜单项标签，value 为 URL 时直接作为链接
          key: option.value,  // 用 value 作为 key
          children,  // 如果有子菜单，递归渲染
        };
      });
    };

    return h(NDropdown, {
      options: renderOptions(f.options),  // 使用递归渲染的菜单项
      placement: 'bottom-start',
      trigger: 'hover',  //触发'click' 或 'hover'
      'onUpdate:value': (value) => {
        console.log(value);  // 处理选中项的值更新
      },
      'render-label': (option) => h('a', { href: `/${option.value}`, target: '_blank' }, option.label),  // 自定义标签渲染，动态链接
    }, {
      default: () => h('a', { href: '', target: '_blank' }, '多级菜单') // 默认内容
    });
  }

  //日历
  if (f.type === 'calendar') {

  }

  // 上传文件
  if (f.type === 'upload') {
    let uploadRef = null;
    const notification = useNotification();
    // 上传类型判断
    const isSingleImage = f.uploadType === 'single-image';
    const isMultipleImage = f.uploadType === 'multiple-image';
    const isSingleVideo = f.uploadType === 'single-video';
    const isMultipleVideo = f.uploadType === 'multiple-video';
    const isSingleFile = f.uploadType === 'single-file';
    const isMultipleFile = f.uploadType === 'multiple-file';

    const isSingle = isSingleImage || isSingleVideo || isSingleFile;
    const multiple = !isSingle;  // 判断是否允许多文件上传

    // 上传路径设置
    let uploadPath = '';
    if (isSingleImage || isMultipleImage) {
      uploadPath = './uploads/images';  // 图片上传路径
    } else if (isSingleVideo || isMultipleVideo) {
      uploadPath = './uploads/videos';  // 视频上传路径
    } else if (isSingleFile || isMultipleFile) {
      uploadPath = './uploads/files';  // 文件上传路径
    }

    // 上传文件信息创建
    const createUploadFile = (file, status = 'pending') => {
      return {
        id: file.name + Date.now(), // 使用文件名加当前时间戳确保唯一性
        name: file.name,
        status: status,
        batchId: null,  // 可以在批量上传时使用，暂无批次
        file: file,
        fullPath: uploadPath + '/' + file.name,
        percentage: null,
        thumbnailUrl: null,  // 图片类型可以设置缩略图
        type: file.type,
        url: null,  // 文件下载地址，上传完成后可以通过 onFinish 更新
      };
    };

    // 图片上传
    if (isSingleImage || isMultipleImage) {
      return h('div', { style: { width: '100%' } }, [
        h(NUpload, {
          ref: (el) => { uploadRef = el },
          multiple,
          disabled: disabled.value || readonly.value,
          defaultUpload: false,
          'default-upload': true,
          fileList: isSingle ? (value.value ? [value.value] : []) : (Array.isArray(value.value) ? value.value : []),
          'list-type': 'image-card',
          'show-preview-button': true,
          accept: 'image/*',
          action: uploadPath,  // 设置上传路径

          customRequest({ file, onProgress, onFinish, onError }) {
            const uploadFile = createUploadFile(file, 'uploading');
            console.log('开始上传文件：', uploadFile);

            let percent = 0;
            const timer = setInterval(() => {
              percent += 10;
              onProgress({ percent });

              if (percent === 50 && file.name.includes('fail')) {
                clearInterval(timer);
                onError(new Error('上传失败'));
                uploadFile.status = 'error';
                return;
              }

              if (percent >= 100) {
                clearInterval(timer);
                uploadFile.status = 'finished';
                uploadFile.url = `${uploadPath}/${file.name}`;
                onFinish();
                notification.success({
                  title: '上传成功',
                  content: `文件 "${file.name}" 上传成功！`,
                  duration: 3 * 1000 // 持续时间
                });
              }
            }, 300);

            return {
              abort() {
                clearInterval(timer);
                console.log('取消上传：', file);
                uploadFile.status = 'removed';
              }
            };
          },

          onChange({ fileList }) {
            // 过滤文件，只保留类型为 image 的文件，确保 file.type 存在
            fileList = fileList.filter(file => file.type && file.type.startsWith('image/'));

            // 保存所有上传的文件，单文件或多文件
            value.value = isSingle ? (fileList[0] || null) : fileList;
          }


        })
      ]);
    }

    // 视频上传
    if (isSingleVideo || isMultipleVideo) {
      return h('div', { style: { width: '100%' } }, [
        h(NSpace, { vertical: true }, {
          default: () => [
            h(NSpace, { size: 'small' }, () => [
              // 选择文件按钮
              h(NButton, {
                type: 'default',
                disabled: disabled.value || readonly.value,
                onClick: () => {
                  const input = uploadRef?.$el?.querySelector('input[type="file"]');
                  input?.click();
                }
              }, () => '选择视频'),

              // 上传按钮
              h(NButton, {
                type: 'primary',
                disabled: disabled.value || readonly.value || (isSingle ? !value.value : !Array.isArray(value.value) || value.value.length === 0),
                onClick: () => {
                  uploadRef?.submit();
                }
              }, () => '上传视频')
            ])
          ]
        }),
        h(NUpload, {
          ref: (el) => { uploadRef = el },
          multiple,
          disabled: disabled.value || readonly.value,
          defaultUpload: false,
          fileList: isSingle ? (value.value ? [value.value] : []) : (Array.isArray(value.value) ? value.value : []),
          'list-type': 'image',
          accept: 'video/*',
          action: uploadPath,  // 设置上传路径

          customRequest({ file, onProgress, onFinish, onError }) {
            const uploadFile = createUploadFile(file, 'uploading');
            console.log('开始上传文件：', uploadFile);

            let percent = 0;
            const timer = setInterval(() => {
              percent += 10;
              onProgress({ percent });

              if (percent === 50 && file.name.includes('fail')) {
                clearInterval(timer);
                onError(new Error('上传失败'));
                uploadFile.status = 'error';
                return;
              }

              if (percent >= 100) {
                clearInterval(timer);
                uploadFile.status = 'finished';
                uploadFile.url = `${uploadPath}/${file.name}`;
                onFinish();
                notification.success({
                  title: '上传成功',
                  content: `文件 "${file.name}" 上传成功！`,
                  duration: 3 * 1000 // 持续时间
                });
              }
            }, 300);

            return {
              abort() {
                clearInterval(timer);
                console.log('取消上传：', file);
                uploadFile.status = 'removed';
              }
            };
          },

          onChange({ fileList }) {
            fileList = fileList.filter(file => file.type.startsWith('video/')); // 过滤非视频文件

            value.value = isSingle
              ? fileList[0] || null
              : fileList;
          }
        })
      ]);
    }

    // 文件上传   
    if (isSingleFile || isMultipleFile) {
      return h('div', { style: { width: '100%' } }, [
        h(NSpace, { vertical: true }, {
          default: () => [
            h(NSpace, { size: 'small' }, () => [
              // 选择文件按钮
              h(NButton, {
                type: 'default',
                disabled: disabled.value || readonly.value,
                onClick: () => {
                  const input = uploadRef?.$el?.querySelector('input[type="file"]');
                  input?.click();
                }
              }, () => '选择文件'),

              // 上传按钮
              h(NButton, {
                type: 'primary',
                disabled: disabled.value || readonly.value || (isSingle ? !value.value : !Array.isArray(value.value) || value.value.length === 0),
                onClick: () => {
                  uploadRef?.submit();
                }
              }, () => '上传文件')
            ])
          ]
        }),

        h(NUpload, {
          style: { width: '100%' },
          ref: (el) => { uploadRef = el },
          multiple,
          disabled: disabled.value || readonly.value,
          defaultUpload: false,
          fileList: isSingle ? (value.value ? [value.value] : []) : (Array.isArray(value.value) ? value.value : []),
          'list-type': 'image',
          accept: '*/*',
          action: uploadPath,  // 设置上传路径

          customRequest({ file, onProgress, onFinish, onError }) {
            const uploadFile = createUploadFile(file, 'uploading');
            console.log('开始上传文件：', uploadFile);

            let percent = 0;
            const timer = setInterval(() => {
              percent += 10;
              onProgress({ percent });

              if (percent === 50 && file.name.includes('fail')) {
                clearInterval(timer);
                console.log('上传失败：', file);
                onError(new Error('上传失败'));
                uploadFile.status = 'error';
                return;
              }

              if (percent >= 100) {
                clearInterval(timer);
                uploadFile.status = 'finished';
                uploadFile.url = `${uploadPath}/${file.name}`;
                onFinish();
                notification.success({
                  title: '上传成功',
                  content: `文件 "${file.name}" 上传成功！`,
                  duration: 3 * 1000 // 持续时间
                });
              }
            }, 300);

            return {
              abort() {
                clearInterval(timer);
                console.log('取消上传：', file);
                uploadFile.status = 'removed';
              }
            };
          },

          onChange({ fileList }) {
            value.value = isSingle
              ? fileList[0] || null
              : fileList;
          }
        })
      ]);
    }
  }

  // 穿梭框
  if (f.type === 'transfer') {
    return h(NTransfer, {
      value: Array.isArray(value.value) ? value.value : [],
      options: f.options || [],
      titles: f.titles || ['可选', '已选'],
      filterable: f.filterable ?? true,
      disabled: disabled.value || readonly.value,
      'onUpdate:value': v => value.value = v
    })
  }
  // 日期选择器
  if (f.type === 'DatePicker') {
    let type = f.DatePickerTypes
    return h(NDatePicker, {
      format: 'yyyy.MM.dd HH:mm',
      type,
      modelValue: value.value || null,
      disabled: disabled.value || readonly.value,
      onchange: v => value.value = v,
      'onUpdate:modelValue': v => value.value = v
    })

  }
  
  // 多行文本
  if (f.type === 'textarea') {
    return h(NInput, {
      type: 'textarea',
      modelValue: value.value || null,
      placeholder: f.placeholder,
      disabled: disabled.value || readonly.value,
      onInput: v => value.value = v,
      'onUpdate:modelValue': v => value.value = v
    })
  }
  // 基础字段
  const Comp = XmFormFieldMap[f.type] || NInput
  return h(Comp, {
    ...f.props,
    modelValue: value.value,
    placeholder: f.placeholder,
    disabled: disabled.value || readonly.value,
    onInput: v => value.value = v,
    'onUpdate:modelValue': v => value.value = v
  })
}

/**
 * 渲染多个字段
 * @param {Array} list 字段列表
 * @param {*} meta 元数据
 * @param {*} formModel 数据对象
 * @param {*} exprCtx 表达式上下文
 * @param {*} updateField 更新回调 function(key, value)
 * @param {*} resolveFieldProps 可选，解析字段 props
 * @param {*} readonly 可选，外层只读开关
 */
export function renderFields({
  list = [],
  meta,
  formModel,
  exprCtx,
  updateField,
  resolveFieldProps = defaultResolveFieldProps,
  readonly
}) {
  return list.map(f => {
    const props = resolveFieldProps(f)
    const isEditable = readonly !== undefined ? !readonly : f.editable !== false
    console.log('render field', f.key, 'isEditable=', isEditable)
    switch (f.type) {
      case 'XmInput':
      case 'XmInputNumber':
      case 'XmSelect':
      case 'XmSwitch':
      case 'XmDatePicker':
        if (!isEditable) {
          // 不可编辑 → 直接渲染文本
          return h(NFormItem, { label: f.label }, {
            default: () => h('span', formModel[f.key] ?? '')
          })
        }
        const Comp = XmFormFieldMap[f.type] || NInput
        return h(Comp, {
          ...props,
          modelValue: formModel[f.key],
          'onUpdate:modelValue': isEditable ? val => updateField(f.key, val) : undefined,
          disabled: !isEditable,
          placeholder: f.placeholder || ''
        })
      case 'category':
        if (f.categoryType === 'single') {
          return h(NRadioGroup, {
            modelValue: formModel[f.key],
            'onUpdate:modelValue': isEditable ? val => updateField(f.key, val) : undefined,
            disabled: !isEditable
          }, {
            default: () => f.options.map(opt =>
              h(NRadio, { value: opt.value }, { default: () => opt.label })
            )
          })
        } else if (f.categoryType === 'multi') {
          return h(NCheckboxGroup, {
            modelValue: formModel[f.key] || [],
            'onUpdate:modelValue': isEditable ? val => updateField(f.key, val) : undefined,
            disabled: !isEditable
          }, {
            default: () => f.options.map(opt =>
              h(NCheckbox, { value: opt.value }, { default: () => opt.label })
            )
          })
        }
        break
      case 'transfer':
        return h(NTransfer, {
          source: f.options || [],
          target: formModel[f.key] || [],
          'onUpdate:target': isEditable ? val => updateField(f.key, val) : undefined,
          disabled: !isEditable,
          titles: f.titles || ['可选', '已选']
        })
      default:
        // 默认文本输入
        return h(NInput, {
          modelValue: formModel[f.key],
          'onUpdate:modelValue': isEditable ? val => updateField(f.key, val) : undefined,
          disabled: !isEditable,
          placeholder: f.placeholder || ''
        })
    }
  })
}
