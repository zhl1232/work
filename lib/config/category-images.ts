/**
 * 项目类别主题图片配置
 * 当用户未上传自定义封面时，根据项目类别使用对应的主题图片
 */

export const CATEGORY_THEME_IMAGES: Record<string, string> = {
  '科学': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&h=675&fit=crop&q=85',
  '技术': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=675&fit=crop&q=85',
  '工程': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=675&fit=crop&q=85',
  '艺术': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=675&fit=crop&q=85',
  '数学': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=675&fit=crop&q=85',
  '其他': 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=1200&h=675&fit=crop&q=85',
}

/**
 * 获取项目的封面图片
 * @param category - 项目类别
 * @param customImage - 用户自定义上传的图片URL（可选）
 * @returns 图片URL
 */
export function getProjectCoverImage(category: string, customImage?: string | null): string {
  // 优先使用用户上传的图片
  if (customImage) {
    return customImage
  }
  
  // 使用类别主题图片
  return CATEGORY_THEME_IMAGES[category] || CATEGORY_THEME_IMAGES['其他']
}
