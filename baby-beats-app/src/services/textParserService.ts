/**
 * 智能文本解析服务
 * 从自然语言文本中提取喂养、睡眠、尿布等记录信息
 */

export interface ParsedRecord {
  id: string;
  type: 'feeding' | 'sleep' | 'diaper' | 'pumping' | 'unknown';
  time: Date;
  data: any;
  confidence: number; // 置信度 0-1
  originalText: string;
}

export class TextParserService {
  /**
   * 解析文本，提取所有可能的记录
   */
  static parseText(text: string): ParsedRecord[] {
    const records: ParsedRecord[] = [];
    
    // 按句子分割（句号、换行、数字序号）
    const sentences = text
      .split(/[。\n]|(?=\d+、)/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const sentence of sentences) {
      // 移除序号
      const cleanSentence = sentence.replace(/^\d+、\s*/, '');
      
      // 尝试提取多条记录（一句话可能包含多个时间点）
      const extracted = this.extractRecordsFromSentence(cleanSentence);
      records.push(...extracted);
    }

    return records;
  }

  /**
   * 从单个句子中提取记录
   */
  private static extractRecordsFromSentence(sentence: string): ParsedRecord[] {
    const records: ParsedRecord[] = [];
    
    // 按时间词分割句子
    const timePattern = /(?:昨晚|今早|昨天|今天|凌晨)?\s*(?:十点|一点|两点|三点|四点|五点|六点|七点|八点|九点|十一点|十二点|\d{1,2}点|\d{1,2}:\d{2})[左右半多]?/g;
    
    let lastIndex = 0;
    let match;
    const segments: Array<{ time: string; text: string }> = [];

    while ((match = timePattern.exec(sentence)) !== null) {
      if (match.index > lastIndex) {
        // 如果前面有内容但没有时间，可能是前一个时间的延续
        if (segments.length > 0) {
          segments[segments.length - 1].text += sentence.substring(lastIndex, match.index);
        }
      }
      
      segments.push({
        time: match[0],
        text: sentence.substring(match.index + match[0].length)
      });
      
      lastIndex = match.index + match[0].length;
    }

    // 如果没有找到时间词，整句作为一个片段，使用当前时间
    if (segments.length === 0) {
      segments.push({ time: '', text: sentence });
    }

    // 解析每个片段
    for (const segment of segments) {
      const time = this.parseTime(segment.time);
      const type = this.detectRecordType(segment.text);
      
      if (type === 'feeding') {
        const feedingRecord = this.parseFeedingRecord(segment.text, time);
        if (feedingRecord) {
          records.push(feedingRecord);
        }
      } else if (type === 'sleep') {
        const sleepRecord = this.parseSleepRecord(segment.text, time);
        if (sleepRecord) {
          records.push(sleepRecord);
        }
      } else if (type === 'diaper') {
        const diaperRecord = this.parseDiaperRecord(segment.text, time);
        if (diaperRecord) {
          records.push(diaperRecord);
        }
      } else if (type === 'pumping') {
        const pumpingRecord = this.parsePumpingRecord(segment.text, time);
        if (pumpingRecord) {
          records.push(pumpingRecord);
        }
      }
    }

    return records;
  }

  /**
   * 检测记录类型
   */
  private static detectRecordType(text: string): 'feeding' | 'sleep' | 'diaper' | 'pumping' | 'unknown' {
    // 喂养关键词
    if (/吃|喂|奶|母乳|奶粉|配方奶|亲喂|瓶喂/.test(text)) {
      return 'feeding';
    }
    
    // 睡眠关键词
    if (/睡|觉|醒/.test(text)) {
      return 'sleep';
    }
    
    // 尿布关键词
    if (/拉|尿|便|屎|尿布|纸尿裤/.test(text)) {
      return 'diaper';
    }
    
    // 挤奶关键词
    if (/挤奶|泵奶|吸奶/.test(text)) {
      return 'pumping';
    }
    
    return 'unknown';
  }

  /**
   * 解析时间
   */
  private static parseTime(timeStr: string): Date {
    const now = new Date();
    let targetDate = new Date(now);

    // 处理相对日期
    if (timeStr.includes('昨晚') || timeStr.includes('昨天')) {
      targetDate.setDate(targetDate.getDate() - 1);
    } else if (timeStr.includes('今早') || timeStr.includes('今天')) {
      // 保持今天
    }

    // 处理具体时间
    let hour = now.getHours();
    let minute = 0;

    // 匹配 HH:MM 格式
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hour = parseInt(timeMatch[1]);
      minute = parseInt(timeMatch[2]);
    } else {
      // 匹配中文时间
      const hourMap: Record<string, number> = {
        '一点': 1, '两点': 2, '三点': 3, '四点': 4, '五点': 5,
        '六点': 6, '七点': 7, '八点': 8, '九点': 9, '十点': 10,
        '十一点': 11, '十二点': 12
      };

      for (const [key, value] of Object.entries(hourMap)) {
        if (timeStr.includes(key)) {
          hour = value;
          break;
        }
      }

      // 匹配数字点
      const digitMatch = timeStr.match(/(\d{1,2})点/);
      if (digitMatch) {
        hour = parseInt(digitMatch[1]);
      }

      // 处理半点
      if (timeStr.includes('半')) {
        minute = 30;
      }
    }

    // 特殊时间处理
    if (timeStr.includes('昨晚') || timeStr.includes('晚')) {
      if (hour < 12) hour += 12; // 转为24小时制
    }
    if (timeStr.includes('凌晨') && hour >= 12) {
      hour -= 12;
    }

    targetDate.setHours(hour, minute, 0, 0);
    return targetDate;
  }

  /**
   * 解析喂养记录
   */
  private static parseFeedingRecord(text: string, time: Date): ParsedRecord | null {
    let feedingType: 'breast_left' | 'breast_right' | 'breast_both' | 'bottle_breast' | 'bottle_formula' = 'bottle_formula';
    let amount = 0;
    let duration = 0;
    let confidence = 0.7;

    // 判断喂养类型
    if (/母乳|亲喂/.test(text)) {
      if (/左|左边|左侧/.test(text)) {
        feedingType = 'breast_left';
      } else if (/右|右边|右侧/.test(text)) {
        feedingType = 'breast_right';
      } else if (/两边|双侧/.test(text)) {
        feedingType = 'breast_both';
      } else {
        feedingType = 'breast_left'; // 默认左侧
      }
      confidence = 0.9;
    } else if (/奶粉|配方奶/.test(text)) {
      feedingType = 'bottle_formula';
      confidence = 0.9;
    } else if (/瓶喂/.test(text)) {
      feedingType = 'bottle_breast';
      confidence = 0.8;
    }

    // 提取奶量（ml）
    const amountMatch = text.match(/(\d+)\s*(?:ml|毫升|ML)/i);
    if (amountMatch) {
      amount = parseInt(amountMatch[1]);
      confidence += 0.1;
    }

    // 提取时长（分钟）
    const durationMatch = text.match(/(\d+)\s*分钟/);
    if (durationMatch) {
      duration = parseInt(durationMatch[1]);
      confidence += 0.1;
    }

    const data: any = {
      type: feedingType,
      startTime: time.getTime(),
      endTime: duration > 0 ? time.getTime() + duration * 60 * 1000 : time.getTime(),
    };

    if (amount > 0) {
      data.amount = amount;
    }
    if (duration > 0) {
      data.duration = duration;
    }

    return {
      id: `feeding_${Date.now()}_${Math.random()}`,
      type: 'feeding',
      time,
      data,
      confidence: Math.min(confidence, 1),
      originalText: text
    };
  }

  /**
   * 解析睡眠记录
   */
  private static parseSleepRecord(text: string, startTime: Date): ParsedRecord | null {
    let endTime = new Date(startTime);
    let confidence = 0.6;

    // 查找"睡到"模式
    const sleepToMatch = text.match(/睡[了到至]\s*(?:昨晚|今早|昨天|今天|凌晨)?\s*(?:十点|一点|两点|三点|四点|五点|六点|七点|八点|九点|十一点|十二点|\d{1,2}点|\d{1,2}:\d{2})[左右半多]?/);
    if (sleepToMatch) {
      const endTimeStr = sleepToMatch[0].replace(/睡[了到至]\s*/, '');
      endTime = this.parseTime(endTimeStr);
      confidence = 0.9;
    } else {
      // 提取睡眠时长
      const durationMatch = text.match(/睡[了]?\s*(\d+)\s*(?:小时|个小时|h)/);
      if (durationMatch) {
        const hours = parseInt(durationMatch[1]);
        endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);
        confidence = 0.85;
      } else {
        // 默认1小时
        endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        confidence = 0.5;
      }
    }

    const isNightSleep = startTime.getHours() >= 19 || startTime.getHours() < 6;

    return {
      id: `sleep_${Date.now()}_${Math.random()}`,
      type: 'sleep',
      time: startTime,
      data: {
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
        type: isNightSleep ? 'night' : 'nap',
      },
      confidence,
      originalText: text
    };
  }

  /**
   * 解析尿布记录
   */
  private static parseDiaperRecord(text: string, time: Date): ParsedRecord | null {
    let type: 'pee' | 'poop' | 'both' = 'poop';
    let confidence = 0.7;

    // 判断类型
    if (/拉|大便|便便|屎/.test(text)) {
      if (/尿/.test(text)) {
        type = 'both';
        confidence = 0.9;
      } else {
        type = 'poop';
        confidence = 0.9;
      }
    } else if (/尿/.test(text)) {
      type = 'pee';
      confidence = 0.9;
    }

    // 提取备注
    let notes = '';
    if (/量[不很]?多/.test(text)) {
      notes = text.match(/量[不很]?多/)?.[0] || '';
    }

    return {
      id: `diaper_${Date.now()}_${Math.random()}`,
      type: 'diaper',
      time,
      data: {
        time: time.getTime(),
        type,
        notes
      },
      confidence,
      originalText: text
    };
  }

  /**
   * 解析挤奶记录
   */
  private static parsePumpingRecord(text: string, time: Date): ParsedRecord | null {
    let method: 'electric_single' | 'electric_double' | 'manual' = 'electric_single';
    let amount = 0;
    let confidence = 0.7;

    // 判断方式
    if (/双侧|双边|两边/.test(text)) {
      method = 'electric_double';
      confidence = 0.9;
    } else if (/手动|手挤/.test(text)) {
      method = 'manual';
      confidence = 0.9;
    }

    // 提取奶量
    const amountMatch = text.match(/(\d+)\s*(?:ml|毫升|ML)/i);
    if (amountMatch) {
      amount = parseInt(amountMatch[1]);
      confidence += 0.1;
    }

    return {
      id: `pumping_${Date.now()}_${Math.random()}`,
      type: 'pumping',
      time,
      data: {
        time: time.getTime(),
        method,
        totalAmount: amount,
      },
      confidence: Math.min(confidence, 1),
      originalText: text
    };
  }

  /**
   * 格式化记录为可读文本（用于预览）
   */
  static formatRecord(record: ParsedRecord): string {
    const timeStr = this.formatTime(record.time);
    
    switch (record.type) {
      case 'feeding':
        return this.formatFeedingRecord(timeStr, record.data);
      case 'sleep':
        return this.formatSleepRecord(timeStr, record.data);
      case 'diaper':
        return this.formatDiaperRecord(timeStr, record.data);
      case 'pumping':
        return this.formatPumpingRecord(timeStr, record.data);
      default:
        return `未知记录 - ${timeStr}`;
    }
  }

  private static formatTime(date: Date): string {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (isToday) {
      return `今天 ${timeStr}`;
    } else if (isYesterday) {
      return `昨天 ${timeStr}`;
    } else {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}-${day} ${timeStr}`;
    }
  }

  private static formatFeedingRecord(timeStr: string, data: any): string {
    const typeMap: Record<string, string> = {
      breast_left: '左侧母乳',
      breast_right: '右侧母乳',
      breast_both: '双侧母乳',
      bottle_breast: '瓶喂母乳',
      bottle_formula: '配方奶'
    };

    let result = `${timeStr} - ${typeMap[data.type] || '喂养'}`;
    
    if (data.amount > 0) {
      result += ` ${data.amount}ml`;
    }
    if (data.duration > 0) {
      result += ` ${data.duration}分钟`;
    }

    return result;
  }

  private static formatSleepRecord(timeStr: string, data: any): string {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    const endHours = endTime.getHours().toString().padStart(2, '0');
    const endMinutes = endTime.getMinutes().toString().padStart(2, '0');

    let result = `${timeStr} - ${endHours}:${endMinutes} 睡眠`;
    if (hours > 0) {
      result += ` (${hours}小时${minutes}分钟)`;
    } else {
      result += ` (${minutes}分钟)`;
    }

    return result;
  }

  private static formatDiaperRecord(timeStr: string, data: any): string {
    const typeMap: Record<string, string> = {
      pee: '尿',
      poop: '便',
      both: '尿+便'
    };

    let result = `${timeStr} - ${typeMap[data.type]}`;
    if (data.notes) {
      result += ` (${data.notes})`;
    }

    return result;
  }

  private static formatPumpingRecord(timeStr: string, data: any): string {
    const methodMap: Record<string, string> = {
      electric_single: '单侧电动',
      electric_double: '双侧电动',
      manual: '手动'
    };

    let result = `${timeStr} - ${methodMap[data.method]}挤奶`;
    if (data.totalAmount > 0) {
      result += ` ${data.totalAmount}ml`;
    }

    return result;
  }
}

