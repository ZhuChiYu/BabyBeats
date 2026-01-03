import { getDatabase, generateId, getCurrentTimestamp } from '../database';
import { Milestone } from '../types';
import { validateAndFixBabyId } from '../utils/babyValidation';

export class MilestoneService {
  /**
   * 创建里程碑记录
   */
  static async create(data: {
    babyId: string;
    time: number;
    milestoneType: string;
    title: string;
    description?: string;
    photoUrl?: string;
  }): Promise<Milestone> {
    const db = await getDatabase();
    const id = generateId();
    const now = getCurrentTimestamp();
    
    // 验证并修正 baby_id
    const validBabyId = await validateAndFixBabyId(data.babyId);

    await db.runAsync(
      `INSERT INTO milestones (
        id, baby_id, time, milestone_type, title, description, 
        photo_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validBabyId,
        data.time,
        data.milestoneType,
        data.title,
        data.description || null,
        data.photoUrl || null,
        now,
        now,
      ]
    );

    return {
      id,
      babyId: validBabyId,
      time: data.time,
      milestoneType: data.milestoneType,
      title: data.title,
      description: data.description,
      photoUrl: data.photoUrl,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * 获取宝宝的所有里程碑记录
   */
  static async getByBabyId(babyId: string): Promise<Milestone[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync(
      'SELECT * FROM milestones WHERE baby_id = ? ORDER BY time DESC',
      [babyId]
    ) as any[];

    return results.map(row => ({
      id: row.id,
      babyId: row.baby_id,
      time: row.time,
      milestoneType: row.milestone_type,
      title: row.title,
      description: row.description,
      photoUrl: row.photo_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    }));
  }

  /**
   * 按类型获取里程碑
   */
  static async getByType(babyId: string, type: string): Promise<Milestone[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync(
      'SELECT * FROM milestones WHERE baby_id = ? AND milestone_type = ? ORDER BY time DESC',
      [babyId, type]
    ) as any[];

    return results.map(row => ({
      id: row.id,
      babyId: row.baby_id,
      time: row.time,
      milestoneType: row.milestone_type,
      title: row.title,
      description: row.description,
      photoUrl: row.photo_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    }));
  }

  /**
   * 获取单个里程碑
   */
  static async getById(id: string): Promise<Milestone | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync(
      'SELECT * FROM milestones WHERE id = ?',
      [id]
    ) as any;

    if (!result) return null;

    return {
      id: result.id,
      babyId: result.baby_id,
      time: result.time,
      milestoneType: result.milestone_type,
      title: result.title,
      description: result.description,
      photoUrl: result.photo_url,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      syncedAt: result.synced_at,
    };
  }

  /**
   * 更新里程碑记录
   */
  static async update(id: string, data: Partial<Milestone>): Promise<void> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();

    const updates: string[] = [];
    const values: any[] = [];

    if (data.time !== undefined) {
      updates.push('time = ?');
      values.push(data.time);
    }
    if (data.milestoneType !== undefined) {
      updates.push('milestone_type = ?');
      values.push(data.milestoneType);
    }
    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.photoUrl !== undefined) {
      updates.push('photo_url = ?');
      values.push(data.photoUrl);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE milestones SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * 删除里程碑记录
   */
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM milestones WHERE id = ?', [id]);
  }

  /**
   * 获取里程碑统计（按类型）
   */
  static async getStatsByType(babyId: string): Promise<{ [key: string]: number }> {
    const db = await getDatabase();
    const results = await db.getAllAsync(
      `SELECT milestone_type, COUNT(*) as count 
       FROM milestones 
       WHERE baby_id = ? 
       GROUP BY milestone_type`,
      [babyId]
    ) as any[];

    const stats: { [key: string]: number } = {};
    results.forEach(row => {
      stats[row.milestone_type] = row.count;
    });

    return stats;
  }

  /**
   * 获取里程碑类型列表
   */
  static getMilestoneTypes(): Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    items: string[];
  }> {
    return [
      {
        id: 'motor',
        name: '运动发展',
        icon: 'fitness',
        color: '#FF9500',
        items: [
          '第一次抬头',
          '第一次翻身',
          '第一次坐起',
          '第一次爬行',
          '第一次站立',
          '第一次走路',
          '第一次跑步',
          '第一次跳跃',
          '第一次骑车',
          '第一次游泳',
        ],
      },
      {
        id: 'language',
        name: '语言发展',
        icon: 'chatbubbles',
        color: '#5856D6',
        items: [
          '第一次微笑',
          '第一次咿呀学语',
          '第一次叫爸爸',
          '第一次叫妈妈',
          '第一次说话',
          '第一次说完整句子',
          '第一次背诗',
          '第一次唱歌',
        ],
      },
      {
        id: 'social',
        name: '社交发展',
        icon: 'people',
        color: '#34C759',
        items: [
          '第一次认人',
          '第一次挥手告别',
          '第一次拍手',
          '第一次亲吻',
          '第一次拥抱',
          '第一次分享',
          '第一次交朋友',
        ],
      },
      {
        id: 'feeding',
        name: '饮食发展',
        icon: 'restaurant',
        color: '#FF6B6B',
        items: [
          '第一次吃辅食',
          '第一次用勺子',
          '第一次用筷子',
          '第一次自己喝水',
          '第一次自己吃饭',
          '第一次断奶',
        ],
      },
      {
        id: 'life_skills',
        name: '生活技能',
        icon: 'home',
        color: '#AF52DE',
        items: [
          '第一次睡整觉',
          '第一次自己穿衣',
          '第一次穿鞋',
          '第一次上厕所',
          '第一次刷牙',
          '第一次洗手',
          '第一次帮忙做家务',
        ],
      },
      {
        id: 'special',
        name: '特殊时刻',
        icon: 'star',
        color: '#FFD60A',
        items: [
          '第一次洗澡',
          '第一次理发',
          '第一次出门',
          '第一次旅行',
          '第一颗牙齿',
          '第一次上学',
          '第一次表演',
          '第一次获奖',
          '第一次生病',
          '第一次过生日',
        ],
      },
      {
        id: 'cognitive',
        name: '认知发展',
        icon: 'bulb',
        color: '#5AC8FA',
        items: [
          '第一次认颜色',
          '第一次数数',
          '第一次认字',
          '第一次写字',
          '第一次画画',
          '第一次拼图',
        ],
      },
      {
        id: 'emotion',
        name: '情感发展',
        icon: 'heart',
        color: '#FF2D55',
        items: [
          '第一次笑出声',
          '第一次哭泣',
          '第一次生气',
          '第一次害羞',
          '第一次说爱你',
          '第一次安慰别人',
        ],
      },
    ];
  }
}
