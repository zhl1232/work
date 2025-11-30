/**
 * 探索页面数据获取函数
 * 用于服务端组件中获取项目列表
 */

import { createClient } from '@/lib/supabase/server'
import { mapDbProject, type Project } from '@/lib/mappers/types'

/**
 * 项目筛选参数
 */
export interface ProjectFilters {
    category?: string
    difficulty?: 'easy' | 'medium' | 'hard' | 'all'
    minDuration?: number
    maxDuration?: number
    materials?: string[]
    searchQuery?: string
}

/**
 * 分页参数
 */
export interface PaginationOptions {
    page?: number
    pageSize?: number
}

/**
 * 获取已审核通过的项目列表
 * 
 * @param filters - 筛选条件
 * @param pagination - 分页参数
 * @returns 项目列表和总数
 */
export async function getProjects(
    filters: ProjectFilters = {},
    pagination: PaginationOptions = {}
): Promise<{ projects: Project[]; total: number; hasMore: boolean }> {
    const supabase = await createClient()

    const {
        category,
        difficulty,
        minDuration,
        maxDuration,
        materials,
        searchQuery
    } = filters

    const {
        page = 0,
        pageSize = 12
    } = pagination

    const from = page * pageSize
    const to = from + pageSize - 1

    // 构建查询
    let query = supabase
        .from('projects')
        .select(`
      *,
      profiles:author_id (display_name),
      project_materials (*),
      project_steps (*)
    `, { count: 'exact' })
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(from, to)

    // 应用筛选条件
    if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

    if (category && category !== '全部') {
        query = query.eq('category', category)
    }

    if (difficulty && difficulty !== 'all') {
        query = query.eq('difficulty', difficulty)
    }

    if (minDuration !== undefined || maxDuration !== undefined) {
        if (minDuration !== undefined) {
            query = query.gte('duration', minDuration)
        }
        if (maxDuration !== undefined) {
            query = query.lte('duration', maxDuration)
        }
    }

    // 材料筛选需要特殊处理
    if (materials && materials.length > 0) {
        const { data: projectsWithMaterials } = await supabase
            .from('project_materials')
            .select('project_id')
            .in('material', materials)

        if (projectsWithMaterials && projectsWithMaterials.length > 0) {
            const projectIds = Array.from(new Set(projectsWithMaterials.map((m: any) => m.project_id)))
            query = query.in('id', projectIds)
        } else {
            // 没有匹配的项目
            return { projects: [], total: 0, hasMore: false }
        }
    }

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching projects:', error)
        return { projects: [], total: 0, hasMore: false }
    }

    const projects = (data || []).map(mapDbProject)
    const total = count || 0
    const hasMore = total > to + 1

    return { projects, total, hasMore }
}

/**
 * 获取单个项目详情
 * 
 * @param id - 项目 ID
 * @returns 项目详情或 null
 */
export async function getProjectById(id: string | number): Promise<Project | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('projects')
        .select(`
      *,
      profiles:author_id (display_name),
      project_materials (*),
      project_steps (*),
      comments (
        *,
        profiles:author_id (display_name, avatar_url)
      )
    `)
        .eq('id', id)
        .single()

    if (error || !data) {
        console.error('Error fetching project:', error)
        return null
    }

    return mapDbProject(data)
}

/**
 * 获取相关项目推荐
 * 
 * @param projectId - 当前项目 ID
 * @param category - 项目分类
 * @param limit - 返回数量
 * @returns 相关项目列表
 */
export async function getRelatedProjects(
    projectId: string | number,
    category: string,
    limit: number = 3
): Promise<Project[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('projects')
        .select(`
      *,
      profiles:author_id (display_name),
      project_materials (*),
      project_steps (*)
    `)
        .eq('category', category)
        .eq('status', 'approved')
        .neq('id', projectId)
        .limit(limit)

    if (error || !data) {
        console.error('Error fetching related projects:', error)
        return []
    }

    return data.map(mapDbProject)
}
