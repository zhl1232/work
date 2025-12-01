"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ImageUpload } from "@/components/ui/image-upload";
import { Upload, Save, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Project } from "@/lib/types";
import { useProjects } from "@/context/project-context";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectCoverImage } from "@/lib/config/category-images";

const CATEGORIES = ["科学", "技术", "工程", "艺术", "数学", "其他"];
const DIFFICULTIES = [
    { value: "beginner", label: "初级", description: "适合新手" },
    { value: "intermediate", label: "中级", description: "有一定基础" },
    { value: "advanced", label: "高级", description: "需要专业知识" }
];

// 时长配置常量
const DURATION_CONFIG = {
    MIN: 10,        // 最小10分钟
    MAX: 720,       // 最大12小时（720分钟）
    STEP: 15,       // 步长15分钟
    DEFAULT: 60     // 默认1小时
};

interface StepFormData {
    title: string;
    description: string;
    image_url: string | null;
}

interface FormData {
    title: string;
    category: string;
    difficulty: string;
    duration: number;
    materials: string;
    coverImage: string | null;
    steps: StepFormData[];
}

const DRAFT_KEY = "project_draft";

export default function SharePage() {
    const { addProject } = useProjects();
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        title: "",
        category: "科学",
        difficulty: "beginner",
        duration: DURATION_CONFIG.DEFAULT,
        materials: "",
        coverImage: null,
        steps: [{ title: "步骤 1", description: "", image_url: null }]
    });

    // 检查登录状态
    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    // 加载草稿
    useEffect(() => {
        if (user) {
            const savedDraft = localStorage.getItem(`${DRAFT_KEY}_${user.id}`);
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    // 兼容旧格式的草稿，确保必需字段存在
                    setFormData({
                        ...draft,
                        coverImage: draft.coverImage || null,
                        steps: draft.steps || [{ title: "步骤 1", description: "", image_url: null }]
                    });
                    toast({
                        title: "已恢复草稿",
                        description: "自动恢复了您上次保存的内容",
                    });
                } catch (e) {
                    console.error("Failed to load draft:", e);
                }
            }
        }
    }, [user, toast]);

    // 自动保存草稿（防抖）
    useEffect(() => {
        if (!user) return;

        const timer = setTimeout(() => {
            localStorage.setItem(`${DRAFT_KEY}_${user.id}`, JSON.stringify(formData));
        }, 2000); // 2秒防抖

        return () => clearTimeout(timer);
    }, [formData, user]);

    const handleInputChange = (field: keyof Omit<FormData, 'steps' | 'coverImage'>, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCoverImageChange = (url: string | null) => {
        setFormData(prev => ({ ...prev, coverImage: url }));
    };

    const handleStepChange = (index: number, field: keyof StepFormData, value: string | null) => {
        setFormData(prev => {
            const newSteps = [...prev.steps];
            newSteps[index] = { ...newSteps[index], [field]: value };
            return { ...prev, steps: newSteps };
        });
    };

    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, { title: `步骤 ${prev.steps.length + 1}`, description: "", image_url: null }]
        }));
    };

    const removeStep = (index: number) => {
        if (formData.steps.length <= 1) {
            toast({
                title: "至少需要一个步骤",
                variant: "destructive"
            });
            return;
        }
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index)
        }));
    };

    const handleSaveDraft = () => {
        if (!user) return;
        setIsSavingDraft(true);
        localStorage.setItem(`${DRAFT_KEY}_${user.id}`, JSON.stringify(formData));

        toast({
            title: "草稿已保存",
            description: "您可以稍后继续编辑",
        });

        setTimeout(() => setIsSavingDraft(false), 800);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 表单验证
        if (!formData.title.trim()) {
            toast({
                title: "请填写项目标题",
                variant: "destructive",
            });
            return;
        }

        if (formData.steps.length === 0 || !formData.steps.some(step => step.description.trim())) {
            toast({
                title: "请至少添加一个步骤说明",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 获取封面图片（用户上传的或类别主题图）
            const coverImage = getProjectCoverImage(formData.category, formData.coverImage);

            const newProject: Project = {
                id: Date.now(),
                title: formData.title,
                author: user?.user_metadata?.display_name || user?.email || "匿名用户",
                author_id: user!.id,
                image: coverImage,
                category: formData.category,
                difficulty: formData.difficulty === "beginner" ? "easy" : formData.difficulty === "intermediate" ? "medium" : "hard",
                duration: formData.duration,
                likes: 0,
                description: formData.steps.length > 0 ? formData.steps[0].description.slice(0, 100) + "..." : "",
                materials: formData.materials.split("\n").filter(item => item.trim() !== ""),
                steps: formData.steps.map((step, index) => ({
                    title: step.title || `步骤 ${index + 1}`,
                    description: step.description,
                    image_url: step.image_url || undefined
                })),
                tags: [],
                status: 'pending'
            };

            addProject(newProject);

            // 清除草稿
            if (user) {
                localStorage.removeItem(`${DRAFT_KEY}_${user.id}`);
            }

            toast({
                title: "项目已提交审核！",
                description: "您的项目将在审核通过后公开展示，请在个人中心查看审核状态",
                duration: 5000,
            });

            setTimeout(() => {
                router.push("/profile");  // 跳转到个人中心页面
            }, 1500);
        } catch (error) {
            console.error('Project submission error:', error);
            toast({
                title: "提交失败",
                description: "请稍后再试",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 未登录时不显示内容(将重定向)
    if (!user) {
        return null;
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">分享你的创意</h1>
                <p className="text-muted-foreground">将你的 STEAM 项目展示给全世界。</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基本信息卡片 */}
                <Card>
                    <CardHeader>
                        <CardTitle>基本信息</CardTitle>
                        <CardDescription>填写项目的基本信息</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* 项目标题 */}
                        <div className="space-y-2">
                            <Label htmlFor="title">项目标题 *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                placeholder="例如：自制水火箭"
                                required
                            />
                        </div>

                        {/* 项目分类 */}
                        <div className="space-y-2">
                            <Label>项目分类 *</Label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => handleInputChange("category", cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${formData.category === cat
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background hover:bg-muted text-muted-foreground border-input"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 项目封面图片 */}
                        <div className="space-y-2">
                            <Label>项目封面图片（可选）</Label>
                            <p className="text-sm text-muted-foreground mb-2">
                                未上传时将使用&ldquo;{formData.category}&rdquo;类别的默认主题图
                            </p>
                            <ImageUpload
                                value={formData.coverImage}
                                onChange={handleCoverImageChange}
                                bucket="project-images"
                                pathPrefix="covers"
                                placeholder="点击上传项目封面图片"
                            />
                        </div>

                        {/* 难度等级 */}
                        <div className="space-y-3">
                            <Label>难度等级 *</Label>
                            <RadioGroup
                                value={formData.difficulty}
                                onValueChange={(value) => handleInputChange("difficulty", value)}
                            >
                                {DIFFICULTIES.map((diff) => (
                                    <div key={diff.value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                        <RadioGroupItem value={diff.value} id={diff.value} />
                                        <Label htmlFor={diff.value} className="flex-1 cursor-pointer">
                                            <div className="font-medium">{diff.label}</div>
                                            <div className="text-sm text-muted-foreground">{diff.description}</div>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* 预计时长 */}
                        <div className="space-y-3">
                            <Label>
                                预计时长：
                                {formData.duration < 60
                                    ? `${formData.duration} 分钟`
                                    : `${(formData.duration / 60).toFixed(1)} 小时 (${formData.duration} 分钟)`
                                }
                            </Label>
                            <Slider
                                value={[formData.duration]}
                                onValueChange={([value]) => handleInputChange("duration", value)}
                                min={DURATION_CONFIG.MIN}
                                max={DURATION_CONFIG.MAX}
                                step={DURATION_CONFIG.STEP}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{DURATION_CONFIG.MIN}分钟</span>
                                <span className="text-center">
                                    <div>6小时</div>
                                    <div className="text-[10px]">(360分钟)</div>
                                </span>
                                <span>{DURATION_CONFIG.MAX / 60}小时</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                💡 提示：快速实验10-60分钟，标准项目1-3小时，复杂项目可设置更长时间
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 项目详情卡片 */}
                <Card>
                    <CardHeader>
                        <CardTitle>项目详情</CardTitle>
                        <CardDescription>详细描述你的项目</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* 所需材料 */}
                        <div className="space-y-2">
                            <Label htmlFor="materials">所需材料</Label>
                            <Textarea
                                id="materials"
                                value={formData.materials}
                                onChange={(e) => handleInputChange("materials", e.target.value)}
                                placeholder="每行一个材料，例如：&#10;塑料瓶 x1&#10;气球 x2&#10;胶带"
                                rows={5}
                            />
                        </div>

                        {/* 制作步骤 */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>制作步骤 *</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addStep}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    添加步骤
                                </Button>
                            </div>

                            {formData.steps.map((step, index) => (
                                <Card key={index} className="border-2">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">步骤 {index + 1}</CardTitle>
                                            {formData.steps.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeStep(index)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor={`step-title-${index}`}>步骤标题</Label>
                                            <Input
                                                id={`step-title-${index}`}
                                                value={step.title}
                                                onChange={(e) => handleStepChange(index, "title", e.target.value)}
                                                placeholder={`例如：准备材料`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`step-desc-${index}`}>步骤说明 *</Label>
                                            <Textarea
                                                id={`step-desc-${index}`}
                                                value={step.description}
                                                onChange={(e) => handleStepChange(index, "description", e.target.value)}
                                                placeholder="详细描述这一步需要做什么..."
                                                rows={3}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>步骤图片（可选）</Label>
                                            <ImageUpload
                                                value={step.image_url}
                                                onChange={(url) => handleStepChange(index, "image_url", url)}
                                                bucket="project-images"
                                                pathPrefix="steps"
                                                aspectRatio="aspect-video"
                                                placeholder="上传步骤示意图"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 操作按钮 */}
                <div className="flex justify-between items-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={isSavingDraft}
                        className="gap-2"
                    >
                        {isSavingDraft ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isSavingDraft ? "已保存" : "保存草稿"}
                    </Button>

                    <div className="flex gap-3">
                        <Button variant="outline" type="button" onClick={() => router.back()}>
                            取消
                        </Button>
                        <Button type="submit" disabled={isLoading} className="gap-2">
                            <Upload className="h-4 w-4" />
                            {isLoading ? "提交中..." : "提交审核"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
