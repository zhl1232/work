# 📊 Supabase 数据库表创建 - 详细操作步骤

## 🎯 目标
在 Supabase 控制台中执行 SQL 脚本，创建完整的数据库表结构。

---

## 📝 操作步骤

### Step 1: 登录 Supabase
1. 打开浏览器，访问 https://supabase.com
2. 点击右上角 **Sign In**
3. 使用 GitHub 账号登录（或你注册时使用的方式）

### Step 2: 打开你的项目
1. 登录后进入 Dashboard（仪表板）
2. 点击你创建的项目 `steam-explore-share`
3. 等待项目加载完成

### Step 3: 进入 SQL Editor
1. 在左侧导航栏中，找到 **SQL Editor** 
   - 图标看起来像 `</>`
2. 点击进入 SQL Editor 页面
3. 你会看到一个代码编辑器界面

### Step 4: 创建新查询
1. 点击左上角的 **+ New query** 按钮
2. 会出现一个空白的 SQL 编辑区域
3. 你可以给这个查询命名，比如 `初始化数据库表`

### Step 5: 复制并粘贴 SQL 脚本
1. 打开项目根目录的 `supabase-schema.sql` 文件
2. **全选所有内容** (Ctrl+A)
3. **复制** (Ctrl+C)
4. 回到 Supabase SQL Editor
5. **粘贴** 到编辑器中 (Ctrl+V)

### Step 6: 执行 SQL 脚本
1. 检查 SQL 代码已正确粘贴
2. 点击右下角的 **Run** 按钮（或按 Ctrl+Enter）
3. 等待执行完成（大约 5-10 秒）

### Step 7: 查看执行结果
**成功标志**：
- ✅ 底部会显示 "Success. No rows returned"
- ✅ 或显示一些提示信息（NOTICE）
- ✅ 看到类似这样的消息：
  ```
  NOTICE:  ✅ 数据库表结构创建完成！
  NOTICE:  📊 共创建 13 个表
  NOTICE:  🔒 已启用 Row Level Security
  ```

**如果出错**：
- ❌ 会显示红色错误信息
- 常见错误：
  - 表已存在：可以忽略，说明之前已创建
  - 语法错误：检查复制是否完整
  - 权限错误：确认你是项目的 Owner

### Step 8: 验证表已创建
1. 点击左侧导航栏的 **Table Editor**（表格编辑器）
2. 你应该能看到以下表：
   - ✅ profiles（用户档案）
   - ✅ projects（项目）
   - ✅ project_materials（材料）
   - ✅ project_steps（步骤）
   - ✅ comments（评论）
   - ✅ likes（点赞）
   - ✅ completed_projects（完成记录）
   - ✅ discussions（讨论）
   - ✅ discussion_replies（讨论回复）
   - ✅ challenges（挑战）
   - ✅ challenge_participants（挑战参与）
   - ✅ badges（徽章）
   - ✅ user_badges（用户徽章）

3. 点击任意表名，可以查看表结构和字段

### Step 9: 查看初始数据
1. 在 Table Editor 中点击 **badges** 表
2. 你应该能看到 5 条初始徽章数据：
   - 初级探索者 ⭐
   - 小小科学家 🔬
   - STEAM 大师 🏆
   - 创意达人 🎨
   - 热心助人 💬

---

## 🎨 可选：使用 Supabase UI 可视化创建表

如果你不想用 SQL，也可以使用 Supabase 的可视化界面：

### 方法 1: Table Editor 创建
1. 点击左侧 **Table Editor**
2. 点击 **+ New table**
3. 填写表名、字段等信息
4. 点击 **Save**

**但我强烈建议用 SQL**，因为：
- ✅ 一次性创建所有表
- ✅ 包含完整的关系和约束
- ✅ 自动设置 RLS 策略
- ✅ 可以保存脚本重复使用

---

## ⚠️ 常见问题

### Q1: 执行时报错 "relation already exists"
**答案**: 这是正常的！说明某些表已经存在了。脚本中使用了 `IF NOT EXISTS`，所以不会重复创建。

### Q2: 执行后看不到表？
**答案**: 
1. 刷新页面（F5）
2. 切换到 Table Editor 查看
3. 检查是否在 `public` schema 下

### Q3: RLS 策略是什么？需要设置吗？
**答案**: Row Level Security（行级安全）是 Supabase 的核心功能，脚本已经全部设置好了。它确保：
- 用户只能看到自己的数据
- 防止未授权访问
- 已经在脚本中配置完成，无需手动设置

### Q4: 如何删除所有表重新开始？
**答案**: 在 SQL Editor 中执行：
```sql
-- 慎用！会删除所有数据！
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
然后重新执行 `supabase-schema.sql`

---

## ✅ 完成检查清单

- [ ] 已登录 Supabase 控制台
- [ ] 进入了 SQL Editor
- [ ] 复制粘贴了完整的 SQL 脚本
- [ ] 点击 Run 执行成功
- [ ] 在 Table Editor 中看到了 13 个表
- [ ] badges 表中有 5 条初始数据
- [ ] 没有红色错误提示

---

## 🎉 下一步

表创建完成后，你就可以：
1. ✅ 开始编写 API Routes
2. ✅ 创建 Supabase 客户端文件
3. ✅ 实现用户认证
4. ✅ 开始数据迁移

---

## 💡 小贴士

- 📌 保存好 `supabase-schema.sql` 文件，以后可能需要重新执行
- 📌 可以在 SQL Editor 中保存常用的 SQL 片段
- 📌 Supabase 会自动备份数据，但还是建议定期手动备份
- 📌 Table Editor 可以直接编辑数据，对调试很有用

---

## 🆘 需要帮助？

如果遇到任何问题：
1. 检查 Supabase 控制台右下角的错误提示
2. 查看 SQL Editor 底部的执行结果
3. 告诉我具体的错误信息，我来帮你解决！
