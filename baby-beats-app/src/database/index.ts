import * as SQLite from 'expo-sqlite';
import { initializeDatabase } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }
  
  db = await SQLite.openDatabaseAsync('babybeats.db');
  await initializeDatabase(db);
  
  return db;
};

export const closeDatabase = async () => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};

// 生成 UUID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 获取当前时间戳
export const getCurrentTimestamp = (): number => {
  return Date.now();
};

