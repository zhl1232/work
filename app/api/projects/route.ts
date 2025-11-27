import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, handleApiError } from '@/lib/api/auth'
import {
  validateRequiredString,
  validateEnum,
  validateArray,
} from '@/lib/api/validation'
import type { 
  ProjectStep, 
  ProjectMaterialInsert, 
  ProjectStepInsert 
} from '@/lib/api/types'

const VALID_CATEGORIES = ['科学', '技术', '工程', '艺术', '数学'] as const

/**
 * POST /api/projects
 * 创建新项目
 * 需要认证
 */
export async function POST(request: Request) {
  const supabase = createClient()
  
  try {
    // 检查用户认证
    const user = await requireAuth(supabase)
    
    const body = await request.json()
    
    // 验证输入
    const title = validateRequiredString(body.title, 'Title', 200)
    const description = validateRequiredString(body.description, 'Description', 2000)
    const category = validateEnum(body.category, 'Category', VALID_CATEGORIES)
    const image_url = validateRequiredString(body.image_url, 'Image URL', 500)
    
    // 验证材料和步骤 - 使用明确的类型定义
    const materials: string[] = body.materials 
      ? validateArray(body.materials, 'Materials', 50).map((m: unknown) => 
          validateRequiredString(m, 'Material', 200)
        )
      : []
    
    const steps: ProjectStep[] = body.steps
      ? validateArray(body.steps, 'Steps', 50).map((step: unknown) => {
          // 类型守卫：确保step是对象
          if (typeof step !== 'object' || step === null) {
            throw new Error('Invalid step format')
          }
          const stepObj = step as { title?: unknown; description?: unknown }
          return {
            title: validateRequiredString(stepObj.title, 'Step title', 200),
            description: validateRequiredString(stepObj.description, 'Step description', 1000),
          }
        })
      : []
    
    // 创建项目（Supabase类型系统需要as any）
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        category,
        image_url,
        author_id: user.id,
        status: 'pending', // 新项目默认为待审核状态
      } as any)
      .select()
      .single() as any
    
    if (projectError || !project) {
      throw projectError || new Error('Failed to create project')
    }
    
    // 并行添加材料和步骤
    const promises: Promise<void>[] = []

    // 添加材料
    if (materials.length > 0) {
      const materialInserts: ProjectMaterialInsert[] = materials.map((material, index) => ({
        project_id: project.id,
        material,
        sort_order: index,
      }))
      
      promises.push(
        (async () => {
          const { error } = await supabase
            .from('project_materials')
            .insert(materialInserts as any)
          if (error) throw error
        })()
      )
    }
    
    // 添加步骤
    if (steps.length > 0) {
      const stepInserts: ProjectStepInsert[] = steps.map((step, index) => ({
        project_id: project.id,
        title: step.title,
        description: step.description,
        sort_order: index,
      }))
      
      promises.push(
        (async () => {
          const { error } = await supabase
            .from('project_steps')
            .insert(stepInserts as any)
          if (error) throw error
        })()
      )
    }

    // 等待所有子资源创建完成
    if (promises.length > 0) {
      await Promise.all(promises)
    }
    
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
