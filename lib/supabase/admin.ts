import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * 管理员客户端（仅在服务端使用）
 * 警告：包含 service_role 密钥，仅在 API Routes 或 Server Components 中使用
 * 
 * 重要：不要在客户端组件中导入此文件！
 */
export const supabaseAdmin = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
