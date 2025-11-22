import { supabaseAdmin } from './supabase/client'

/**
 * 数据迁移脚本
 * 将现有的默认数据迁移到 Supabase
 * 
 * 使用方法：
 * 1. 确保已配置好 .env.local
 * 2. 运行：node --loader ts-node/esm lib/migrate-data.ts
 * 或在浏览器控制台调用 migrateData() 函数
 */

// 从 context 中导入的默认数据
const defaultProjects = [
  {
    id: 'pixel-art',
    title: '像素艺术工坊',
    author: 'STEAM 官方',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
    category: '艺术',
    likes: 888,
    description: '体验 8-bit 艺术创作的乐趣！在这个数字画布上，你可以像早期的游戏设计师一样，用一个个方块构建出精彩的世界。',
    materials: ['电脑或平板', '创意'],
    steps: [
      { title: '选择颜色', description: '从左侧调色板中选择你喜欢的颜色。' },
      { title: '绘制图案', description: '在网格上点击或拖动鼠标来填充像素。' },
      { title: '保存作品', description: '完成创作后，记得截图保存你的杰作！' }
    ]
  },
  {
    id: 'color-lab',
    title: '光的三原色实验室',
    author: 'STEAM 官方',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
    category: '科学',
    likes: 999,
    description: '探索 RGB 颜色模型，看看红、绿、蓝三种光是如何混合出千万种颜色的。',
    materials: ['电脑或平板', '好奇心'],
    steps: [
      { title: '打开实验室', description: '点击进入光的三原色实验室页面。' },
      { title: '调节滑块', description: '拖动红、绿、蓝三个滑块，观察颜色的变化。' },
      { title: '完成挑战', description: '尝试调出指定的颜色，完成挑战任务。' }
    ]
  },
  {
    id: 1,
    title: '自制火山爆发',
    author: '科学小达人',
    image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=2070&auto=format&fit=crop',
    category: '科学',
    likes: 128,
    description: '这是一个经典的科学实验，利用小苏打和醋的化学反应来模拟火山爆发。非常适合在家和小朋友一起动手制作！',
    materials: ['小苏打 2勺', '白醋 100ml', '红色食用色素 适量', '空塑料瓶 1个', '橡皮泥或粘土'],
    steps: [
      { title: '准备火山主体', description: '用橡皮泥或粘土围绕一个塑料瓶捏出火山的形状。' },
      { title: '加入反应物', description: '在瓶中加入两勺小苏打和几滴红色食用色素。' },
      { title: '引发爆发', description: '迅速倒入白醋，观察火山喷发！' }
    ]
  },
  // ... 可以继续添加其他项目
]

const defaultDiscussions = [
  {
    id: 1,
    title: '如何让水火箭飞得更高？',
    author: '小小宇航员',
    content: '我做的水火箭只能飞 10 米高，有没有什么改进的建议？是不是水加太多了？',
    tags: ['科学', '求助'],
    likes: 12,
    replies: [
      { author: '物理老师', content: '试着调整水和空气的比例，通常 1/3 的水效果最好。另外检查一下气密性。' },
      { author: '火箭迷', content: '尾翼的形状也很重要，尽量做成流线型。' }
    ]
  },
  {
    id: 2,
    title: '分享一个有趣的静电实验',
    author: '闪电侠',
    content: '只需要一个气球和一些碎纸屑。摩擦气球后，它能吸起纸屑，甚至能让水流弯曲！太神奇了。',
    tags: ['科学', '分享'],
    likes: 45,
    replies: []
  }
]

const defaultChallenges = [
  {
    id: 1,
    title: '环保小发明挑战',
    description: '利用废旧物品制作一个有用的装置。变废为宝，保护地球！',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop',
    participants: 128,
    end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['工程', '环保']
  },
  {
    id: 2,
    title: '未来城市设计',
    description: '画出或搭建你心目中的未来城市。它会有会飞的汽车吗？还是漂浮在空中的花园？',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2070&auto=format&fit=crop',
    participants: 85,
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['艺术', '设计']
  },
  {
    id: 3,
    title: '家庭机械臂制作',
    description: '只用纸板和针筒，制作一个液压机械臂。比比谁的机械臂力气大！',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
    participants: 203,
    end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['工程', '物理']
  }
]

/**
 * 迁移项目数据
 */
export async function migrateProjects() {
  console.log('🚀 开始迁移项目数据...')
  
  for (const project of defaultProjects) {
    try {
      // 插入项目
      const { data: newProject, error: projectError } = await supabaseAdmin
        .from('projects')
        .insert({
          title: project.title,
          description: project.description,
          image_url: project.image,
          category: project.category,
          likes_count: project.likes,
          // author_id 需要一个真实的用户ID，这里先留空
          // 实际使用时可以创建一个官方账号
        })
        .select()
        .single()

      if (projectError) {
        console.error(`❌ 项目 "${project.title}" 迁移失败:`, projectError)
        continue
      }

      console.log(`✅ 项目 "${project.title}" 已创建，ID: ${newProject.id}`)

      // 插入材料
      if (project.materials && project.materials.length > 0) {
        const { error: materialsError } = await supabaseAdmin
          .from('project_materials')
          .insert(
            project.materials.map((material, index) => ({
              project_id: newProject.id,
              material,
              sort_order: index,
            }))
          )

        if (materialsError) {
          console.error(`❌ 材料插入失败:`, materialsError)
        } else {
          console.log(`  ✅ ${project.materials.length} 个材料已添加`)
        }
      }

      // 插入步骤
      if (project.steps && project.steps.length > 0) {
        const { error: stepsError } = await supabaseAdmin
          .from('project_steps')
          .insert(
            project.steps.map((step, index) => ({
              project_id: newProject.id,
              title: step.title,
              description: step.description,
              sort_order: index,
            }))
          )

        if (stepsError) {
          console.error(`❌ 步骤插入失败:`, stepsError)
        } else {
          console.log(`  ✅ ${project.steps.length} 个步骤已添加`)
        }
      }
    } catch (error) {
      console.error(`❌ 项目迁移异常:`, error)
    }
  }

  console.log('✅ 项目数据迁移完成！')
}

/**
 * 迁移讨论数据
 */
export async function migrateDiscussions() {
  console.log('🚀 开始迁移讨论数据...')
  
  for (const discussion of defaultDiscussions) {
    try {
      const { data: newDiscussion, error: discussionError } = await supabaseAdmin
        .from('discussions')
        .insert({
          title: discussion.title,
          content: discussion.content,
          tags: discussion.tags,
          likes_count: discussion.likes,
          // author_id 需要一个真实的用户ID
        })
        .select()
        .single()

      if (discussionError) {
        console.error(`❌ 讨论 "${discussion.title}" 迁移失败:`, discussionError)
        continue
      }

      console.log(`✅ 讨论 "${discussion.title}" 已创建`)

      // 插入回复（需要等有用户系统后）
      // ...
    } catch (error) {
      console.error(`❌ 讨论迁移异常:`, error)
    }
  }

  console.log('✅ 讨论数据迁移完成！')
}

/**
 * 迁移挑战数据
 */
export async function migrateChallenges() {
  console.log('🚀 开始迁移挑战数据...')
  
  for (const challenge of defaultChallenges) {
    try {
      const { data: newChallenge, error: challengeError } = await supabaseAdmin
        .from('challenges')
        .insert({
          title: challenge.title,
          description: challenge.description,
          image_url: challenge.image,
          tags: challenge.tags,
          participants_count: challenge.participants,
          end_date: challenge.end_date,
        })
        .select()
        .single()

      if (challengeError) {
        console.error(`❌ 挑战 "${challenge.title}" 迁移失败:`, challengeError)
        continue
      }

      console.log(`✅ 挑战 "${challenge.title}" 已创建`)
    } catch (error) {
      console.error(`❌ 挑战迁移异常:`, error)
    }
  }

  console.log('✅ 挑战数据迁移完成！')
}

/**
 * 执行所有迁移
 */
export async function migrateAllData() {
  console.log('🎯 开始数据迁移...')
  console.log('=' .repeat(50))
  
  await migrateProjects()
  console.log('')
  await migrateDiscussions()
  console.log('')
  await migrateChallenges()
  
  console.log('=' .repeat(50))
  console.log('🎉 所有数据迁移完成！')
}

// 如果直接运行此文件
if (require.main === module) {
  migrateAllData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('迁移失败:', error)
      process.exit(1)
    })
}
