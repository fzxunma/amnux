export interface XmExprContext<TModel> {
  model: Readonly<TModel>;
  get<K extends keyof TModel>(key: K): TModel[K];
}

export type XmExpr<TModel> =
  | boolean
  | ((ctx: XmExprContext<TModel>) => boolean);

export interface XmFieldMeta<TModel> {
  /** 字段名，必须是 model 的 key */
  key: keyof TModel & string;

  label: string;
  type: string;

  required?: boolean;

  /** 默认值必须来自 model */
  default?: TModel[keyof TModel];

  /** props 仍然允许弱类型（IO 边界） */
  props?: Record<string, unknown>;

  /** 校验规则（如 Naive UI） */
  rules?: unknown[];

  /** 显隐控制 */
  visible?: XmExpr<TModel>;

  /** 禁用控制 */
  disabled?: XmExpr<TModel>;
}

export interface XmFormMeta<TModel> {
  key: string;
  title?: string;
  layout?: "vertical" | "inline" | "grid";
  cols?: number;
  fields: XmFieldMeta<TModel>[];
}
type UserModel = {
  username: string
  role: 'admin' | 'user'
  enable: boolean
}

const _userFormMeta: XmFormMeta<UserModel> = {
  key: 'userForm',
  layout: 'grid',
  cols: 2,
  fields: [
    {
      key: 'username',
      label: '用户名',
      type: 'input',
      required: true
    },
    {
      key: 'role',
      label: '角色',
      type: 'select'
    },
    {
      key: 'enable',
      label: '启用',
      type: 'switch',
      default: true
    },
    {
      key: 'username',
      label: '仅管理员可见字段',
      type: 'input',
      visible: ({ get }) => get('role') === 'admin'
      //           ↑ 有 role / enable 的智能提示
    }
  ]
}


function _createExprContext<TModel>(
  model: TModel
): XmExprContext<TModel> {
  return {
    model,
    get: key => model[key]
  }
}

function _resolveExpr<TModel>(
  expr: XmExpr<TModel> | undefined,
  ctx: XmExprContext<TModel>
): boolean {
  if (expr === undefined) return true
  if (typeof expr === 'boolean') return expr
  return expr(ctx)
}

// export interface XmExprContext<TModel> {
//   model: Readonly<TModel>
//   get<K extends keyof TModel>(key: K): TModel[K]

//   // 扩展上下文
//   path?: string[]
//   route?: RouteLocationNormalized
//   node?: XmTreeNode
//   permission?: string[]
// }
