/**
 * API请求和响应类型定义
 */

/**
 * 创建项目的请求体类型
 */
export interface CreateProjectInput {
  title: string
  description: string
  category: string
  image_url: string
  materials?: string[]
  steps?: ProjectStep[]
}

/**
 * 项目步骤类型
 */
export interface ProjectStep {
  title: string
  description: string
}

/**
 * 项目材料类型（用于数据库插入）
 */
export interface ProjectMaterialInsert {
  project_id: number
  material: string
  sort_order: number
}

/**
 * 项目步骤类型（用于数据库插入）
 */
export interface ProjectStepInsert {
  project_id: number
  title: string
  description: string
  sort_order: number
}
