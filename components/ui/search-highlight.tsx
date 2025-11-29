import * as React from "react";

interface SearchHighlightProps {
  text: string;
  query: string;
  className?: string;
}

/**
 * 搜索结果高亮组件
 * 用于在搜索结果中高亮显示匹配的关键词
 */
export function SearchHighlight({ text, query, className = "" }: SearchHighlightProps) {
  // 如果没有搜索词，直接返回原文本
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  // 处理多个搜索词（用空格分隔）
  const keywords = query.trim().split(/\s+/).filter(Boolean);
  
  // 如果没有有效的关键词，返回原文本
  if (keywords.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // 创建正则表达式，不区分大小写，匹配任意一个关键词
  // 使用 (?:...) 非捕获组，使用 | 表示或
  const escapedKeywords = keywords.map(keyword => 
    keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
  );
  const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');

  // 分割文本并高亮匹配的部分
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // 检查是否是匹配的关键词
        const isMatch = keywords.some(keyword => 
          part.toLowerCase() === keyword.toLowerCase()
        );

        if (isMatch) {
          return (
            <mark 
              key={index}
              className="bg-primary/20 text-inherit font-semibold px-0.5 rounded"
            >
              {part}
            </mark>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
