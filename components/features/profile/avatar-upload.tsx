"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AvatarUploadProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function AvatarUpload({ value, onChange, disabled }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "文件格式错误",
          description: "请上传图片文件",
          variant: "destructive",
        })
        return
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "图片大小不能超过 2MB",
          variant: "destructive",
        })
        return
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      
      onChange(data.publicUrl)
      
      toast({
        title: "上传成功",
        description: "头像已更新",
      })
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "上传失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group cursor-pointer" onClick={() => !disabled && !uploading && fileInputRef.current?.click()}>
        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center transition-all group-hover:opacity-90">
          {value ? (
            <img
              src={value}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-5xl font-bold text-primary-foreground">
              <Upload className="h-10 w-10" />
            </span>
          )}
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full backdrop-blur-[2px]">
          <span className="text-white font-medium text-sm border border-white/50 px-3 py-1 rounded-full bg-black/20">更换</span>
        </div>

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-sm z-10">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>




      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  )
}
