import * as SQLite from 'expo-sqlite';

// 数据库初始化脚本
export const initializeDatabase = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    
    -- 用户表
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    
    -- 宝宝表
    CREATE TABLE IF NOT EXISTS babies (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      gender TEXT CHECK(gender IN ('male', 'female', 'unknown')),
      birthday INTEGER NOT NULL,
      due_date INTEGER,
      blood_type TEXT,
      birth_height REAL,
      birth_weight REAL,
      birth_head_circ REAL,
      avatar TEXT,
      is_archived INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_babies_user_id ON babies(user_id);
    CREATE INDEX IF NOT EXISTS idx_babies_is_archived ON babies(is_archived);
    
    -- 喂养记录表
    CREATE TABLE IF NOT EXISTS feedings (
      id TEXT PRIMARY KEY,
      baby_id TEXT NOT NULL,
      time INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('breast', 'bottled_breast_milk', 'formula')),
      left_duration INTEGER DEFAULT 0,
      right_duration INTEGER DEFAULT 0,
      milk_amount REAL DEFAULT 0,
      milk_brand TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER,
      FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_feedings_baby_id ON feedings(baby_id);
    CREATE INDEX IF NOT EXISTS idx_feedings_time ON feedings(time);
    CREATE INDEX IF NOT EXISTS idx_feedings_baby_time ON feedings(baby_id, time);
    
    -- 尿布记录表
    CREATE TABLE IF NOT EXISTS diapers (
      id TEXT PRIMARY KEY,
      baby_id TEXT NOT NULL,
      time INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('poop', 'pee', 'both')),
      poop_consistency TEXT CHECK(poop_consistency IN ('loose', 'normal', 'hard', 'other')),
      poop_color TEXT CHECK(poop_color IN ('yellow', 'green', 'dark', 'black', 'red', 'brown', 'white', 'orange', 'other')),
      poop_amount TEXT CHECK(poop_amount IN ('small', 'medium', 'large')),
      pee_amount TEXT CHECK(pee_amount IN ('small', 'medium', 'large')),
      has_abnormality INTEGER DEFAULT 0,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER,
      FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_diapers_baby_id ON diapers(baby_id);
    CREATE INDEX IF NOT EXISTS idx_diapers_time ON diapers(time);
    CREATE INDEX IF NOT EXISTS idx_diapers_baby_time ON diapers(baby_id, time);
    
    -- 睡眠记录表
    CREATE TABLE IF NOT EXISTS sleeps (
      id TEXT PRIMARY KEY,
      baby_id TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      sleep_type TEXT NOT NULL CHECK(sleep_type IN ('nap', 'night')),
      fall_asleep_method TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER,
      FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_sleeps_baby_id ON sleeps(baby_id);
    CREATE INDEX IF NOT EXISTS idx_sleeps_start_time ON sleeps(start_time);
    CREATE INDEX IF NOT EXISTS idx_sleeps_baby_time ON sleeps(baby_id, start_time);
    
    -- 挤奶记录表
    CREATE TABLE IF NOT EXISTS pumpings (
      id TEXT PRIMARY KEY,
      baby_id TEXT NOT NULL,
      time INTEGER NOT NULL,
      method TEXT CHECK(method IN ('electric', 'manual', 'other')),
      left_amount REAL DEFAULT 0,
      right_amount REAL DEFAULT 0,
      total_amount REAL,
      storage_method TEXT CHECK(storage_method IN ('refrigerate', 'freeze', 'feed_now', 'other')),
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER,
      FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_pumpings_baby_id ON pumpings(baby_id);
    CREATE INDEX IF NOT EXISTS idx_pumpings_time ON pumpings(time);
    
    -- 成长记录表
    CREATE TABLE IF NOT EXISTS growth_records (
      id TEXT PRIMARY KEY,
      baby_id TEXT NOT NULL,
      date INTEGER NOT NULL,
      height REAL,
      weight REAL,
      head_circ REAL,
      temperature REAL,
      bmi REAL,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER,
      FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_growth_baby_id ON growth_records(baby_id);
    CREATE INDEX IF NOT EXISTS idx_growth_date ON growth_records(date);
    
    -- 里程碑表
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      baby_id TEXT NOT NULL,
      time INTEGER NOT NULL,
      milestone_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      photo_url TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER,
      FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_milestones_baby_id ON milestones(baby_id);
    CREATE INDEX IF NOT EXISTS idx_milestones_time ON milestones(time);
    
    -- 就诊记录表
    CREATE TABLE IF NOT EXISTS medical_visits (
      id TEXT PRIMARY KEY,
      baby_id TEXT NOT NULL,
      visit_time INTEGER NOT NULL,
      hospital TEXT,
      department TEXT,
      doctor_name TEXT,
      symptoms TEXT,
      diagnosis TEXT,
      doctor_advice TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER,
      FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_visits_baby_id ON medical_visits(baby_id);
    CREATE INDEX IF NOT EXISTS idx_visits_time ON medical_visits(visit_time);
    
    -- 用药记录表
    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      baby_id TEXT NOT NULL,
      medication_time INTEGER NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT,
      start_date INTEGER,
      end_date INTEGER,
      administration_method TEXT,
      visit_id TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER,
      FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE,
      FOREIGN KEY (visit_id) REFERENCES medical_visits(id) ON DELETE SET NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_medications_baby_id ON medications(baby_id);
    CREATE INDEX IF NOT EXISTS idx_medications_time ON medications(medication_time);
    
    -- 疫苗记录表
    CREATE TABLE IF NOT EXISTS vaccines (
      id TEXT PRIMARY KEY,
      baby_id TEXT NOT NULL,
      vaccine_name TEXT NOT NULL,
      vaccination_date INTEGER NOT NULL,
      dose_number INTEGER,
      location TEXT,
      batch_number TEXT,
      next_date INTEGER,
      reminder_enabled INTEGER DEFAULT 0,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER,
      FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_vaccines_baby_id ON vaccines(baby_id);
    CREATE INDEX IF NOT EXISTS idx_vaccines_date ON vaccines(vaccination_date);
    CREATE INDEX IF NOT EXISTS idx_vaccines_next_date ON vaccines(next_date);
  `);
  
  console.log('Database initialized successfully');
};

