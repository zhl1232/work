-- Seed data for STEAM Explore & Share
-- 包含项目、讨论和挑战的初始中文数据

-- 1. 插入项目数据
-- 注意：这里假设已经有一个管理员用户或使用第一个注册用户作为作者。
-- 为了简单起见，我们暂时不指定 author_id，或者需要用户手动更新 author_id。
-- 在实际运行此脚本前，请确保替换 'YOUR_USER_ID_HERE' 为实际的用户 UUID。

DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- 清空现有数据以避免重复
  TRUNCATE TABLE public.project_materials, public.project_steps, public.comments, public.likes, public.completed_projects, public.projects, public.discussion_replies, public.discussions, public.challenge_participants, public.challenges RESTART IDENTITY CASCADE;

  -- 尝试获取第一个用户作为作者，如果没有用户，则需要手动指定
  SELECT id INTO admin_id FROM auth.users LIMIT 1;
  
  IF admin_id IS NULL THEN
    RAISE NOTICE '没有找到用户，跳过数据插入。请先注册一个用户。';
    RETURN;
  END IF;

  -- 插入项目 1: 像素艺术工坊
  WITH p AS (
    INSERT INTO public.projects (title, author_id, image_url, category, likes_count, description)
    VALUES (
      '像素艺术工坊',
      admin_id,
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
      '艺术',
      888,
      '体验 8-bit 艺术创作的乐趣！在这个数字画布上，你可以像早期的游戏设计师一样，用一个个方块构建出精彩的世界。'
    ) RETURNING id
  )
  INSERT INTO public.project_steps (project_id, title, description, sort_order)
  SELECT id, title, description, sort_order FROM p, (VALUES 
    ('选择颜色', '从左侧调色板中选择你喜欢的颜色。', 0),
    ('绘制图案', '在网格上点击或拖动鼠标来填充像素。', 1),
    ('保存作品', '完成创作后，记得截图保存你的杰作！', 2)
  ) AS t(title, description, sort_order);

  -- 插入项目 1 材料
  INSERT INTO public.project_materials (project_id, material, sort_order)
  SELECT id, material, sort_order FROM public.projects, (VALUES 
    ('电脑或平板', 0),
    ('创意', 1)
  ) AS t(material, sort_order) WHERE title = '像素艺术工坊';


  -- 插入项目 2: 光的三原色实验室
  WITH p AS (
    INSERT INTO public.projects (title, author_id, image_url, category, likes_count, description)
    VALUES (
      '光的三原色实验室',
      admin_id,
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
      '科学',
      999,
      '探索 RGB 颜色模型，看看红、绿、蓝三种光是如何混合出千万种颜色的。'
    ) RETURNING id
  )
  INSERT INTO public.project_steps (project_id, title, description, sort_order)
  SELECT id, title, description, sort_order FROM p, (VALUES 
    ('打开实验室', '点击进入光的三原色实验室页面。', 0),
    ('调节滑块', '拖动红、绿、蓝三个滑块，观察颜色的变化。', 1),
    ('完成挑战', '尝试调出指定的颜色，完成挑战任务。', 2)
  ) AS t(title, description, sort_order);

  -- 插入项目 2 材料
  INSERT INTO public.project_materials (project_id, material, sort_order)
  SELECT id, material, sort_order FROM public.projects, (VALUES 
    ('电脑或平板', 0),
    ('好奇心', 1)
  ) AS t(material, sort_order) WHERE title = '光的三原色实验室';

  -- 插入项目 3: 自制火山爆发
  WITH p AS (
    INSERT INTO public.projects (title, author_id, image_url, category, likes_count, description)
    VALUES (
      '自制火山爆发',
      admin_id,
      'https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=2070&auto=format&fit=crop',
      '科学',
      128,
      '这是一个经典的科学实验，利用小苏打和醋的化学反应来模拟火山爆发。非常适合在家和小朋友一起动手制作！'
    ) RETURNING id
  )
  INSERT INTO public.project_steps (project_id, title, description, sort_order)
  SELECT id, title, description, sort_order FROM p, (VALUES 
    ('准备火山主体', '用橡皮泥或粘土围绕一个塑料瓶捏出火山的形状。', 0),
    ('加入反应物', '在瓶中加入两勺小苏打和几滴红色食用色素。', 1),
    ('引发爆发', '迅速倒入白醋，观察火山喷发！', 2)
  ) AS t(title, description, sort_order);

  -- 插入项目 3 材料
  INSERT INTO public.project_materials (project_id, material, sort_order)
  SELECT id, material, sort_order FROM public.projects, (VALUES 
    ('小苏打 2勺', 0),
    ('白醋 100ml', 1),
    ('红色食用色素 适量', 2),
    ('空塑料瓶 1个', 3),
    ('橡皮泥或粘土', 4)
  ) AS t(material, sort_order) WHERE title = '自制火山爆发';

  -- 插入项目 4: 柠檬电池实验
  WITH p AS (
    INSERT INTO public.projects (title, author_id, image_url, category, likes_count, description)
    VALUES (
      '柠檬电池实验',
      admin_id,
      'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=2070&auto=format&fit=crop',
      '技术',
      85,
      '利用柠檬中的酸性物质作为电解质，制作一个能点亮 LED 灯的电池。'
    ) RETURNING id
  )
  INSERT INTO public.project_steps (project_id, title, description, sort_order)
  SELECT id, title, description, sort_order FROM p, (VALUES 
    ('准备电极', '在每个柠檬上切两个口，分别插入铜片和锌片。', 0),
    ('串联电池', '用导线将一个柠檬的铜片连接到下一个柠檬的锌片。', 1),
    ('连接 LED', '将最后剩下的铜片和锌片分别连接到 LED 灯的长脚和短脚。', 2)
  ) AS t(title, description, sort_order);

   -- 插入项目 4 材料
  INSERT INTO public.project_materials (project_id, material, sort_order)
  SELECT id, material, sort_order FROM public.projects, (VALUES 
    ('柠檬 2-3个', 0),
    ('铜片 (硬币)', 1),
    ('锌片 (镀锌钉子)', 2),
    ('导线', 3),
    ('LED 灯珠', 4)
  ) AS t(material, sort_order) WHERE title = '柠檬电池实验';

  -- 插入项目 5: 纸板机械臂
  WITH p AS (
    INSERT INTO public.projects (title, author_id, image_url, category, likes_count, description)
    VALUES (
      '纸板机械臂',
      admin_id,
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
      '工程',
      256,
      '利用液压原理，用针筒和纸板制作一个可以控制抓取的机械臂。'
    ) RETURNING id
  )
  INSERT INTO public.project_steps (project_id, title, description, sort_order)
  SELECT id, title, description, sort_order FROM p, (VALUES 
    ('制作骨架', '根据图纸裁剪纸板，制作机械臂的各个关节。', 0),
    ('安装液压系统', '将针筒固定在关节处，用软管连接控制端的针筒。', 1),
    ('注水调试', '在系统中注水，推动控制端针筒，测试机械臂动作。', 2)
  ) AS t(title, description, sort_order);

  -- 插入项目 5 材料
  INSERT INTO public.project_materials (project_id, material, sort_order)
  SELECT id, material, sort_order FROM public.projects, (VALUES 
    ('废旧纸板', 0),
    ('针筒 4-8个', 1),
    ('软管', 2),
    ('扎带', 3),
    ('热熔胶', 4)
  ) AS t(material, sort_order) WHERE title = '纸板机械臂';

  -- 插入项目 6: 光影艺术装置
  WITH p AS (
    INSERT INTO public.projects (title, author_id, image_url, category, likes_count, description)
    VALUES (
      '光影艺术装置',
      admin_id,
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
      '艺术',
      92,
      '利用光线的反射和折射，创造出梦幻的投影效果。'
    ) RETURNING id
  )
  INSERT INTO public.project_steps (project_id, title, description, sort_order)
  SELECT id, title, description, sort_order FROM p, (VALUES 
    ('设计图案', '在透明塑料片上绘制或粘贴图案。', 0),
    ('布置光源', '固定手电筒位置，调整照射角度。', 1),
    ('调整投影', '利用镜子和玻璃纸改变光路和颜色，创造艺术效果。', 2)
  ) AS t(title, description, sort_order);

  -- 插入项目 6 材料
  INSERT INTO public.project_materials (project_id, material, sort_order)
  SELECT id, material, sort_order FROM public.projects, (VALUES 
    ('手电筒', 0),
    ('彩色玻璃纸', 1),
    ('镜子', 2),
    ('透明塑料片', 3)
  ) AS t(material, sort_order) WHERE title = '光影艺术装置';

  -- 插入项目 7: 斐波那契螺旋画
  WITH p AS (
    INSERT INTO public.projects (title, author_id, image_url, category, likes_count, description)
    VALUES (
      '斐波那契螺旋画',
      admin_id,
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2070&auto=format&fit=crop',
      '数学',
      150,
      '用圆规和直尺画出完美的黄金螺旋，感受数学的几何之美。'
    ) RETURNING id
  )
  INSERT INTO public.project_steps (project_id, title, description, sort_order)
  SELECT id, title, description, sort_order FROM p, (VALUES 
    ('画正方形', '按照斐波那契数列 (1, 1, 2, 3, 5, 8...) 的边长画正方形。', 0),
    ('连接圆弧', '在每个正方形内画四分之一圆弧，连接起来形成螺旋。', 1),
    ('上色装饰', '发挥创意，为螺旋填充颜色或图案。', 2)
  ) AS t(title, description, sort_order);

  -- 插入项目 7 材料
  INSERT INTO public.project_materials (project_id, material, sort_order)
  SELECT id, material, sort_order FROM public.projects, (VALUES 
    ('画纸', 0),
    ('圆规', 1),
    ('直尺', 2),
    ('铅笔', 3),
    ('彩色笔', 4)
  ) AS t(material, sort_order) WHERE title = '斐波那契螺旋画';

  -- 插入项目 8: 水火箭发射
  WITH p AS (
    INSERT INTO public.projects (title, author_id, image_url, category, likes_count, description)
    VALUES (
      '水火箭发射',
      admin_id,
      'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2070&auto=format&fit=crop',
      '科学',
      300,
      '利用压缩空气的动力，将塑料瓶制作的火箭发射上天。'
    ) RETURNING id
  )
  INSERT INTO public.project_steps (project_id, title, description, sort_order)
  SELECT id, title, description, sort_order FROM p, (VALUES 
    ('制作箭体', '将一个瓶子作为箭体，安装尾翼保持平衡。', 0),
    ('制作发射塞', '在橡胶塞上打孔，安装气门芯。', 1),
    ('发射准备', '加入约 1/3 的水，塞紧塞子，连接打气筒，打气发射！', 2)
  ) AS t(title, description, sort_order);

  -- 插入项目 8 材料
  INSERT INTO public.project_materials (project_id, material, sort_order)
  SELECT id, material, sort_order FROM public.projects, (VALUES 
    ('大号碳酸饮料瓶 2个', 0),
    ('硬纸板 (尾翼)', 1),
    ('橡胶塞', 2),
    ('气门芯', 3),
    ('打气筒', 4)
  ) AS t(material, sort_order) WHERE title = '水火箭发射';


  -- 2. 插入讨论数据
  INSERT INTO public.discussions (title, author_id, content, likes_count, tags)
  VALUES 
    ('如何让水火箭飞得更高？', admin_id, '我做的水火箭只能飞 10 米高，有没有什么改进的建议？是不是水加太多了？', 12, ARRAY['科学', '求助']),
    ('分享一个有趣的静电实验', admin_id, '只需要一个气球和一些碎纸屑。摩擦气球后，它能吸起纸屑，甚至能让水流弯曲！太神奇了。', 45, ARRAY['科学', '分享']);

  -- 插入讨论回复
  INSERT INTO public.discussion_replies (discussion_id, author_id, content)
  SELECT public.discussions.id, admin_id, t.content FROM public.discussions, (VALUES 
    ('试着调整水和空气的比例，通常 1/3 的水效果最好。另外检查一下气密性。'),
    ('尾翼的形状也很重要，尽量做成流线型。')
  ) AS t(content) WHERE title = '如何让水火箭飞得更高？';


  -- 3. 插入挑战数据
  INSERT INTO public.challenges (title, description, image_url, participants_count, end_date, tags)
  VALUES 
    ('环保小发明挑战', '利用废旧物品制作一个有用的装置。变废为宝，保护地球！', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop', 128, now() + interval '15 days', ARRAY['工程', '环保']),
    ('未来城市设计', '画出或搭建你心目中的未来城市。它会有会飞的汽车吗？还是漂浮在空中的花园？', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2070&auto=format&fit=crop', 85, now() + interval '7 days', ARRAY['艺术', '设计']),
    ('家庭机械臂制作', '只用纸板和针筒，制作一个液压机械臂。比比谁的机械臂力气大！', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop', 203, now() + interval '20 days', ARRAY['工程', '物理']);

END $$;
