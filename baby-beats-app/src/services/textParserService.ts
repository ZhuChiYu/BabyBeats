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
    
    // 先预处理：将"拉了一次"、"吃了一次"等表达中的"一次"替换，避免被误识别为"一点"
    let processedSentence = sentence
      .replace(/([拉尿吃喂])了?一次/g, '$1了')
      .replace(/([拉尿吃喂])一次/g, '$1了');
    
    // 按时间词分割句子 - 支持上午、下午、中午、晚上等前缀
    const timePattern = /(?:昨晚|今早|昨天|今天|凌晨|上午|下午|中午|晚上|早上)?\s*(?:十一点|十二点|十点|一点|两点|三点|四点|五点|六点|七点|八点|九点|\d{1,2}点|\d{1,2}:\d{2})[左右半多]?/g;
    
    let lastIndex = 0;
    let match;
    const segments: Array<{ time: string; text: string }> = [];

    while ((match = timePattern.exec(processedSentence)) !== null) {
      if (match.index > lastIndex) {
        // 如果前面有内容但没有时间，可能是前一个时间的延续
        if (segments.length > 0) {
          segments[segments.length - 1].text += processedSentence.substring(lastIndex, match.index);
        }
      }
      
      segments.push({
        time: match[0],
        text: processedSentence.substring(match.index + match[0].length)
      });
      
      lastIndex = match.index + match[0].length;
    }

    // 如果没有找到时间词，整句作为一个片段，使用当前时间
    if (segments.length === 0) {
      segments.push({ time: '', text: processedSentence });
    }

    // 解析每个片段
    for (const segment of segments) {
      const time = this.parseTime(segment.time);
      
      // 检查是否包含复合动作（如"吃完...睡觉"）
      const hasFeeding = /吃|喂|奶|母乳|奶粉/.test(segment.text);
      const hasSleep = /睡|觉/.test(segment.text);
      const hasDiaper = /拉|尿|便|屎/.test(segment.text);
      
      // 处理"吃完...睡觉"这种复合场景
      if (hasFeeding && hasSleep) {
        // 先添加喂养记录
        const feedingRecord = this.parseFeedingRecord(segment.text, time);
        if (feedingRecord) {
          records.push(feedingRecord);
        }
        // 再添加睡眠记录（使用同样的开始时间）
        const sleepRecord = this.parseSleepRecord(segment.text, time);
        if (sleepRecord) {
          records.push(sleepRecord);
        }
      } else if (hasFeeding && hasDiaper) {
        // 处理喂养和尿布同时出现的情况
        const feedingRecord = this.parseFeedingRecord(segment.text, time);
        if (feedingRecord) {
          records.push(feedingRecord);
        }
        const diaperRecord = this.parseDiaperRecord(segment.text, time);
        if (diaperRecord) {
          records.push(diaperRecord);
        }
      } else {
        // 单一类型的记录
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
    }

    // 处理具体时间
    let hour = now.getHours();
    let minute = 0;
    let timeFound = false;

    // 匹配 HH:MM 格式
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hour = parseInt(timeMatch[1]);
      minute = parseInt(timeMatch[2]);
      timeFound = true;
    } else {
      // 匹配中文时间 - 注意顺序，长的先匹配
      const hourMap: Record<string, number> = {
        '十一点': 11, '十二点': 12, '十点': 10,
        '一点': 1, '两点': 2, '三点': 3, '四点': 4, '五点': 5,
        '六点': 6, '七点': 7, '八点': 8, '九点': 9
      };

      for (const [key, value] of Object.entries(hourMap)) {
        if (timeStr.includes(key)) {
          hour = value;
          timeFound = true;
          break;
        }
      }

      // 如果中文没匹配到，再匹配数字点
      if (!timeFound) {
        const digitMatch = timeStr.match(/(\d{1,2})点/);
        if (digitMatch) {
          hour = parseInt(digitMatch[1]);
          timeFound = true;
        }
      }

      // 处理半点
      if (timeStr.includes('半')) {
        minute = 30;
      }
    }

    // 特殊时间处理
    // 下午：1-11点转为13-23点
    if (timeStr.includes('下午') && hour >= 1 && hour <= 11) {
      hour += 12;
    }
    // 中午：默认12点
    if (timeStr.includes('中午')) {
      hour = 12;
    }
    // 晚上/昨晚：小于12的转为晚上
    if ((timeStr.includes('昨晚') || timeStr.includes('晚上')) && hour < 12 && hour !== 0) {
      hour += 12;
    }
    // 上午/早上：保持原样（不需要额外处理）
    // 凌晨时间保持在0-6点范围
    if (timeStr.includes('凌晨') && hour >= 12) {
      hour -= 12;
    }
    
    // 如果没有特殊标记，使用智能判断
    if (!timeStr.includes('昨晚') && !timeStr.includes('昨天') && 
        !timeStr.includes('今早') && !timeStr.includes('今天') && 
        !timeStr.includes('凌晨') && !timeStr.includes('晚') &&
        !timeStr.includes('上午') && !timeStr.includes('下午') && 
        !timeStr.includes('中午') && !timeStr.includes('早上')) {
      // 默认使用当前时间的上下文
      // 如果是很小的时间（1-6点）且现在是白天，可能是今天凌晨或明天凌晨
      const currentHour = now.getHours();
      if (hour >= 1 && hour <= 6 && currentHour >= 7) {
        // 可能是今天凌晨，保持不变
      }
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
    let poopColor: 'yellow' | 'green' | 'dark' | 'black' | 'red' | 'brown' | 'white' | 'orange' | 'other' | undefined;
    let poopAmount: 'small' | 'medium' | 'large' | undefined;
    let poopConsistency: 'loose' | 'normal' | 'hard' | 'other' | undefined;
    let peeAmount: 'small' | 'medium' | 'large' | undefined;

    // 判断类型
    if (/拉|大便|便便|屎|💩/.test(text)) {
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

    // 提取大便颜色 - 优先匹配更具体的描述
    if (type === 'poop' || type === 'both') {
      // 先匹配"里面还是有/里面有"后面的描述
      const innerMatch = text.match(/里面[还]?[是]?有([^，。；！？\s]*(?:色|便|屎|💩)[^，。；！？\s]*)/);
      const searchText = innerMatch ? innerMatch[1] : text;
      
      // 黑色（单独分类）
      if (/纯黑|漆黑|黑黑|全黑/.test(searchText)) {
        poopColor = 'black';
        confidence += 0.1;
      } else if (/黑色|黑便|黑屎/.test(searchText)) {
        poopColor = 'black';
        confidence += 0.09;
      }
      // 深色（墨绿等深色系）
      else if (/深黑|墨黑|深色|暗色/.test(searchText)) {
        poopColor = 'dark';
        confidence += 0.1;
      }
      // 红色
      else if (/红色|红便|血色|带血|鲜红/.test(searchText)) {
        poopColor = 'red';
        confidence += 0.1;
      }
      // 褐色
      else if (/褐色|棕色|棕褐|咖啡色|深褐/.test(searchText)) {
        poopColor = 'brown';
        confidence += 0.1;
      }
      // 白色
      else if (/白色|白便|灰白|奶白/.test(searchText)) {
        poopColor = 'white';
        confidence += 0.1;
      }
      // 橙色
      else if (/橙色|橘色|橙黄|橘黄/.test(searchText)) {
        poopColor = 'orange';
        confidence += 0.1;
      }
      // 绿色
      else if (/绿色|绿便|青绿|墨绿|翠绿/.test(searchText)) {
        poopColor = 'green';
        confidence += 0.1;
      }
      // 黄色
      else if (/黄色|黄便|金黄|土黄|淡黄/.test(searchText)) {
        poopColor = 'yellow';
        confidence += 0.1;
      }
      // 灰色
      else if (/灰色|灰便/.test(searchText)) {
        poopColor = 'other';
        confidence += 0.08;
      }
      // 兜底匹配：单字
      else if (/黑/.test(searchText)) {
        poopColor = 'black';
        confidence += 0.05;
      } else if (/红/.test(searchText)) {
        poopColor = 'red';
        confidence += 0.05;
      } else if (/褐|棕|咖/.test(searchText)) {
        poopColor = 'brown';
        confidence += 0.05;
      } else if (/白/.test(searchText)) {
        poopColor = 'white';
        confidence += 0.05;
      } else if (/橙|橘/.test(searchText)) {
        poopColor = 'orange';
        confidence += 0.05;
      } else if (/绿/.test(searchText)) {
        poopColor = 'green';
        confidence += 0.05;
      } else if (/黄/.test(searchText)) {
        poopColor = 'yellow';
        confidence += 0.05;
      }

      // 提取大便量级
      if (/一大坨|很多|大量|超多|好多/.test(text)) {
        poopAmount = 'large';
        confidence += 0.1;
      } else if (/一点点|很少|少量|一丢丢/.test(text)) {
        poopAmount = 'small';
        confidence += 0.1;
      } else if (/量[不很]?多|正常|适中/.test(text)) {
        poopAmount = 'medium';
        confidence += 0.05;
      }

      // 提取大便稠度
      if (/稀|水样|拉稀|腹泻/.test(text)) {
        poopConsistency = 'loose';
        confidence += 0.1;
      } else if (/硬|干|干硬|便秘/.test(text)) {
        poopConsistency = 'hard';
        confidence += 0.1;
      } else if (/正常|成型|软/.test(text)) {
        poopConsistency = 'normal';
        confidence += 0.05;
      } else if (/糊状|粘稠/.test(text)) {
        poopConsistency = 'other';
        confidence += 0.05;
      }
    }

    // 提取尿量
    if (type === 'pee' || type === 'both') {
      if (/尿.*很多|尿.*大量|尿.*超多/.test(text)) {
        peeAmount = 'large';
        confidence += 0.05;
      } else if (/尿.*一点|尿.*很少|尿.*少量/.test(text)) {
        peeAmount = 'small';
        confidence += 0.05;
      } else if (/尿.*正常|尿.*适中/.test(text)) {
        peeAmount = 'medium';
        confidence += 0.05;
      }
    }

    // 构建详细备注
    const notesArr: string[] = [];
    
    // 优先提取原文中的描述性语句
    const descMatches = text.match(/里面[还]?[是]?有[^，。；！？\s]*/g);
    if (descMatches && descMatches.length > 0) {
      descMatches.forEach(match => {
        const cleaned = match.replace(/^里面[还]?[是]?有/, '').trim();
        if (cleaned && cleaned.length > 0 && cleaned.length < 30) {
          notesArr.push(cleaned);
        }
      });
    }
    
    // 如果没有提取到"里面..."的描述，则添加识别到的关键信息
    if (notesArr.length === 0) {
      if (poopColor === 'dark') notesArr.push('黑色');
      else if (poopColor === 'green') notesArr.push('绿色');
      else if (poopColor === 'yellow') notesArr.push('黄色');
      
      if (poopAmount === 'large') notesArr.push('量大');
      else if (poopAmount === 'small') notesArr.push('量少');
      
      if (poopConsistency === 'loose') notesArr.push('偏稀');
      else if (poopConsistency === 'hard') notesArr.push('偏硬');
    }

    const notes = notesArr.join('，');

    return {
      id: `diaper_${Date.now()}_${Math.random()}`,
      type: 'diaper',
      time,
      data: {
        time: time.getTime(),
        type,
        poopColor,
        poopAmount,
        poopConsistency,
        peeAmount,
        notes
      },
      confidence: Math.min(confidence, 1),
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
    
    const colorMap: Record<string, string> = {
      yellow: '黄色',
      green: '绿色',
      dark: '深色',
      black: '黑色',
      red: '红色',
      brown: '褐色',
      white: '白色',
      orange: '橙色',
      other: '其他颜色'
    };
    
    const amountMap: Record<string, string> = {
      small: '量少',
      medium: '量中',
      large: '量大'
    };
    
    const consistencyMap: Record<string, string> = {
      loose: '偏稀',
      normal: '正常',
      hard: '偏硬',
      other: '其他'
    };

    let result = `${timeStr} - ${typeMap[data.type]}`;
    
    // 添加大便详细信息
    if (data.type !== 'pee') {
      const details: string[] = [];
      if (data.poopColor) details.push(colorMap[data.poopColor]);
      if (data.poopAmount) details.push(amountMap[data.poopAmount]);
      if (data.poopConsistency) details.push(consistencyMap[data.poopConsistency]);
      
      if (details.length > 0) {
        result += ` [${details.join('、')}]`;
      }
    }
    
    // 添加尿量信息
    if (data.type !== 'poop' && data.peeAmount) {
      result += ` [尿量${amountMap[data.peeAmount]}]`;
    }
    
    // 添加备注
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

