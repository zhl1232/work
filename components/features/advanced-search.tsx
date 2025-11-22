"use client"

import * as React from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

interface AdvancedSearchProps {
  onSearch: (query: string, filters: any) => void
}

export function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  const [query, setQuery] = React.useState("")
  const [difficulty, setDifficulty] = React.useState("all")
  const [duration, setDuration] = React.useState([0, 120])
  const [materials, setMaterials] = React.useState<string[]>([])
  
  const handleSearch = () => {
    onSearch(query, {
      difficulty,
      duration,
      materials
    })
  }

  const clearFilters = () => {
    setDifficulty("all")
    setDuration([0, 120])
    setMaterials([])
    onSearch(query, { difficulty: "all", duration: [0, 120], materials: [] })
  }

  return (
    <div className="flex w-full items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索项目、材料或作者..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            // Debounce could be added here
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="pl-8"
        />
        {query && (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                    setQuery("")
                    onSearch("", { difficulty, duration, materials })
                }}
                className="absolute right-2 top-2 h-6 w-6"
            >
                <X className="h-4 w-4" />
            </Button>
        )}
      </div>
      <Button onClick={handleSearch}>搜索</Button>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>高级筛选</SheetTitle>
            <SheetDescription>
              使用更多条件来精确查找你感兴趣的项目。
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label>难度等级</Label>
              <RadioGroup value={difficulty} onValueChange={setDifficulty}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">全部</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="easy" id="easy" />
                  <Label htmlFor="easy">简单 (适合初学者)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">中等 (需要一定基础)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hard" id="hard" />
                  <Label htmlFor="hard">困难 (挑战自我)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>预计耗时 (分钟)</Label>
                <span className="text-sm text-muted-foreground">
                  {duration[0]} - {duration[1]} 分钟
                </span>
              </div>
              <Slider
                defaultValue={[0, 120]}
                max={180}
                step={10}
                value={duration}
                onValueChange={setDuration}
              />
            </div>

            <div className="space-y-2">
              <Label>常用材料</Label>
              <div className="flex flex-wrap gap-2">
                {["纸板", "电池", "LED", "马达", "吸管", "胶水"].map((material) => (
                  <Badge
                    key={material}
                    variant={materials.includes(material) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setMaterials(prev => 
                        prev.includes(material) 
                          ? prev.filter(m => m !== material)
                          : [...prev, material]
                      )
                    }}
                  >
                    {material}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={clearFilters}>重置</Button>
            <SheetClose asChild>
              <Button onClick={handleSearch}>应用筛选</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
