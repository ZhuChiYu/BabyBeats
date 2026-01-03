import { getDatabase } from '../database';

/**
 * 验证并修正 baby_id
 * 如果 baby_id 不存在，自动使用数据库中的第一个宝宝
 * 
 * @param babyId 要验证的 baby_id
 * @returns 有效的 baby_id
 * @throws 如果数据库中没有任何宝宝
 */
export async function validateAndFixBabyId(babyId: string): Promise<string> {
  const db = await getDatabase();
  
  // 检查 baby_id 是否存在
  const babyExists = await db.getFirstAsync(
    'SELECT id FROM babies WHERE id = ?',
    [babyId]
  );
  
  if (babyExists) {
    return babyId;
  }
  
  console.warn('⚠️ Baby不存在! babyId:', babyId);
  const allBabies = await db.getAllAsync('SELECT id, name FROM babies') as any[];
  console.log('📋 数据库中的所有宝宝:', allBabies);
  
  if (allBabies.length === 0) {
    throw new Error('数据库中没有任何宝宝，请先创建宝宝！');
  }
  
  // 使用数据库中的第一个宝宝
  const firstBaby = allBabies[0];
  console.log(`✅ 自动使用数据库中的第一个宝宝: ${firstBaby.name} (${firstBaby.id})`);
  
  // 更新 babyStore 中的 currentBabyId
  try {
    const { useBabyStore } = await import('../store/babyStore');
    const store = useBabyStore.getState();
    
    // 如果 store 中没有这个宝宝，重新加载所有宝宝
    if (!store.babies.find(b => b.id === firstBaby.id)) {
      const { BabyService } = await import('../services/babyService');
      const allBabiesData = await BabyService.getAll('temp-user-id');
      store.setBabies(allBabiesData);
      console.log('✅ 已重新同步宝宝列表到 store');
    }
    
    store.setCurrentBaby(firstBaby.id);
    console.log('✅ 已更新当前选中的宝宝');
  } catch (error) {
    console.warn('更新 store 失败，但不影响记录创建:', error);
  }
  
  return firstBaby.id;
}

/**
 * 同步 store 和数据库中的宝宝数据
 */
export async function syncBabyStore(): Promise<void> {
  try {
    const { useBabyStore } = await import('../store/babyStore');
    const { BabyService } = await import('../services/babyService');
    
    const store = useBabyStore.getState();
    const allBabies = await BabyService.getAll('temp-user-id');
    
    store.setBabies(allBabies);
    console.log('✅ 宝宝列表已同步到 store');
    
    // 如果当前没有选中的宝宝，选中第一个
    if (!store.currentBabyId && allBabies.length > 0) {
      const firstActive = allBabies.find(b => !b.isArchived);
      if (firstActive) {
        store.setCurrentBaby(firstActive.id);
        console.log('✅ 已自动选中第一个宝宝:', firstActive.name);
      }
    }
  } catch (error) {
    console.error('同步宝宝列表失败:', error);
    throw error;
  }
}

