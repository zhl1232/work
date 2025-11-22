import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'


/**
 * POST /api/migrate
 * 执行数据迁移
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type } = body // 'projects', 'discussions', 'challenges', 或 'all'
    
    const results = {
      projects: { success: 0, failed: 0, errors: [] as string[] },
      discussions: { success: 0, failed: 0, errors: [] as string[] },
      challenges: { success: 0, failed: 0, errors: [] as string[] },
    }
    
    // 迁移项目数据
    if (type === 'projects' || type === 'all') {
      const projectsData = await migrateProjects()
      results.projects = projectsData
    }
    
    // 迁移讨论数据
    if (type === 'discussions' || type === 'all') {
      const discussionsData = await migrateDiscussions()
      results.discussions = discussionsData
    }
    
    // 迁移挑战数据
    if (type === 'challenges' || type === 'all') {
      const challengesData = await migrateChallenges()
      results.challenges = challengesData
    }
    
    return NextResponse.json({
      success: true,
      results,
      message: '数据迁移完成'
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 迁移项目
async function migrateProjects() {
  const result = { success: 0, failed: 0, errors: [] as string[] }
  
  const defaultProjects = [
    {
      title: '像素艺术工坊',
      description: '体验 8-bit 艺术创作的乐趣！在这个数字画布上，你可以像早期的游戏设计师一样，用一个个方块构建出精彩的世界。',
      image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
      category: '艺术',
      likes_count: 888,
      materials: ['电脑或平板', '创意'],
      steps: [
        { title: '选择颜色', description: '从左侧调色板中选择你喜欢的颜色。' },
        { title: '绘制图案', description: '在网格上点击或拖动鼠标来填充像素。' },
        { title: '保存作品', description: '完成创作后，记得截图保存你的杰作！' }
      ]
    },
    {
      title: '光的三原色实验室',
      description: '探索 RGB 颜色模型，看看红、绿、蓝三种光是如何混合出千万种颜色的。',
      image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
      category: '科学',
      likes_count: 999,
      materials: ['电脑或平板', '好奇心'],
      steps: [
        { title: '打开实验室', description: '点击进入光的三原色实验室页面。' },
        { title: '调节滑块', description: '拖动红、绿、蓝三个滑块，观察颜色的变化。' },
        { title: '完成挑战', description: '尝试调出指定的颜色，完成挑战任务。' }
      ]
    },
    {
      title: '自制火山爆发',
      description: '这是一个经典的科学实验，利用小苏打和醋的化学反应来模拟火山爆发。非常适合在家和小朋友一起动手制作！',
      image_url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=2070&auto=format&fit=crop',
      category: '科学',
      likes_count: 128,
      materials: ['小苏打 2勺', '白醋 100ml', '红色食用色素 适量', '空塑料瓶 1个', '橡皮泥或粘土'],
      steps: [
        { title: '准备火山主体', description: '用橡皮泥或粘土围绕一个塑料瓶捏出火山的形状。' },
        { title: '加入反应物', description: '在瓶中加入两勺小苏打和几滴红色食用色素。' },
        { title: '引发爆发', description: '迅速倒入白醋，观察火山喷发！' }
      ]
    },
    {
      title: '柠檬电池实验',
      description: '利用柠檬中的酸性物质作为电解质，制作一个能点亮 LED 灯的电池。',
      image_url: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=2070&auto=format&fit=crop',
      category: '技术',
      likes_count: 85,
      materials: ['柠檬 2-3个', '铜片 (硬币)', '锌片 (镀锌钉子)', '导线', 'LED 灯珠'],
      steps: [
        { title: '准备电极', description: '在每个柠檬上切两个口，分别插入铜片和锌片。' },
        { title: '串联电池', description: '用导线将一个柠檬的铜片连接到下一个柠檬的锌片。' },
        { title: '连接 LED', description: '将最后剩下的铜片和锌片分别连接到 LED 灯的长脚和短脚。' }
      ]
    },
    {
      title: '纸板机械臂',
      description: '利用液压原理，用针筒和纸板制作一个可以控制抓取的机械臂。',
      image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
      category: '工程',
      likes_count: 256,
      materials: ['废旧纸板', '针筒 4-8个', '软管', '扎带', '热熔胶'],
      steps: [
        { title: '制作骨架', description: '根据图纸裁剪纸板，制作机械臂的各个关节。' },
        { title: '安装液压系统', description: '将针筒固定在关节处，用软管连接控制端的针筒。' },
        { title: '注水调试', description: '在系统中注水，推动控制端针筒，测试机械臂动作。' }
      ]
    },
    {
      title: '水火箭发射',
      description: '利用压缩空气的动力，将塑料瓶制作的火箭发射上天。',
      image_url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2070&auto=format&fit=crop',
      category: '科学',
      likes_count: 300,
      materials: ['大号碳酸饮料瓶 2个', '硬纸板 (尾翼)', '橡胶塞', '气门芯', '打气筒'],
      steps: [
        { title: '制作箭体', description: '将一个瓶子作为箭体，安装尾翼保持平衡。' },
        { title: '制作发射塞', description: '在橡胶塞上打孔，安装气门芯。' },
        { title: '发射准备', description: '加入约 1/3 的水，塞紧塞子，连接打气筒，打气发射！' }
      ]
    }
  ]
  
  for (const project of defaultProjects) {
    try {
      // 插入项目
      const { data: newProject, error: projectError } = await supabaseAdmin
        .from('projects')
        .insert({
          title: project.title,
          description: project.description,
          image_url: project.image_url,
          category: project.category,
          likes_count: project.likes_count,
        })
        .select()
        .single()

      if (projectError) throw projectError

      // 插入材料
      if (project.materials && project.materials.length > 0) {
        await supabaseAdmin
          .from('project_materials')
          .insert(
            project.materials.map((material, index) => ({
              project_id: newProject.id,
              material,
              sort_order: index,
            }))
          )
      }

      // 插入步骤
      if (project.steps && project.steps.length > 0) {
        await supabaseAdmin
          .from('project_steps')
          .insert(
            project.steps.map((step, index) => ({
              project_id: newProject.id,
              title: step.title,
              description: step.description,
              sort_order: index,
            }))
          )
      }

      result.success++
    } catch (error: any) {
      result.failed++
      result.errors.push(`${project.title}: ${error.message}`)
    }
  }
  
  return result
}

// 迁移讨论
async function migrateDiscussions() {
  const result = { success: 0, failed: 0, errors: [] as string[] }
  
  const defaultDiscussions = [
    {
      title: '如何让水火箭飞得更高？',
      content: '我做的水火箭只能飞 10 米高，有没有什么改进的建议？是不是水加太多了？',
      tags: ['科学', '求助'],
      likes_count: 12,
    },
    {
      title: '分享一个有趣的静电实验',
      content: '只需要一个气球和一些碎纸屑。摩擦气球后，它能吸起纸屑，甚至能让水流弯曲！太神奇了。',
      tags: ['科学', '分享'],
      likes_count: 45,
    }
  ]
  
  for (const discussion of defaultDiscussions) {
    try {
      const { error } = await supabaseAdmin
        .from('discussions')
        .insert(discussion)

      if (error) throw error
      result.success++
    } catch (error: any) {
      result.failed++
      result.errors.push(`${discussion.title}: ${error.message}`)
    }
  }
  
  return result
}

// 迁移挑战
async function migrateChallenges() {
  const result = { success: 0, failed: 0, errors: [] as string[] }
  
  const defaultChallenges = [
    {
      title: '环保小发明挑战',
      description: '利用废旧物品制作一个有用的装置。变废为宝，保护地球！',
      image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop',
      participants_count: 128,
      end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['工程', '环保']
    },
    {
      title: '未来城市设计',
      description: '画出或搭建你心目中的未来城市。它会有会飞的汽车吗？还是漂浮在空中的花园？',
      image_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2070&auto=format&fit=crop',
      participants_count: 85,
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['艺术', '设计']
    },
    {
      title: '家庭机械臂制作',
      description: '只用纸板和针筒，制作一个液压机械臂。比比谁的机械臂力气大！',
      image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
      participants_count: 203,
      end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['工程', '物理']
    }
  ]
  
  for (const challenge of defaultChallenges) {
    try {
      const { error } = await supabaseAdmin
        .from('challenges')
        .insert(challenge)

      if (error) throw error
      result.success++
    } catch (error: any) {
      result.failed++
      result.errors.push(`${challenge.title}: ${error.message}`)
    }
  }
  
  return result
}
