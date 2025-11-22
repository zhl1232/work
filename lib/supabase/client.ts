import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * 浏览器端 Supabase 客户端
 * 用于客户端组件中访问 Supabase
 */
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

