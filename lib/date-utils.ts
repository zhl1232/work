import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 将日期转换为相对时间显示（例如："2小时前"）
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: zhCN
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}

/**
 * 格式化为完整日期时间（用于 tooltip）
 */
export function formatFullDateTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}
