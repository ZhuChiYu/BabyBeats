# BabyBeats 后端 API 完整文档

## 📋 目录
1. [基础信息](#基础信息)
2. [认证流程](#认证流程)
3. [API 端点](#api-端点)
4. [错误处理](#错误处理)
5. [数据模型](#数据模型)

---

## 🌐 基础信息

### 服务器信息

- **生产环境**: http://111.230.110.95:4100/api/v1
- **开发环境**: http://localhost:3000/api/v1

### 通用请求头

```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>  # 需要认证的接口
```

### 通用响应格式

成功响应：
```json
{
  "status": "success",
  "data": { ... }
}
```

错误响应：
```json
{
  "status": "error",
  "message": "错误信息",
  "errors": [...]  # 可选，验证错误时包含
}
```

---

## 🔐 认证流程

### 1. 用户注册

**端点**: `POST /auth/register`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "Password123",  // 至少6位，包含字母和数字
  "name": "用户名"
}
```

**响应**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "1234567890-abc123",
      "email": "user@example.com",
      "name": "用户名",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误码**:
- `400`: 邮箱格式无效或密码强度不够
- `409`: 邮箱已被注册

---

### 2. 用户登录

**端点**: `POST /auth/login`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**响应**: 同注册

**错误码**:
- `401`: 邮箱或密码错误
- `403`: 账户已被禁用

---

### 3. 获取用户信息

**端点**: `GET /auth/profile`

**请求头**: 需要 Bearer Token

**响应**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "1234567890-abc123",
      "email": "user@example.com",
      "name": "用户名",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLogin": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

---

### 4. 更新用户信息

**端点**: `PUT /auth/profile`

**请求头**: 需要 Bearer Token

**请求体**:
```json
{
  "name": "新用户名"
}
```

---

## 👶 宝宝管理 API

### 1. 获取宝宝列表

**端点**: `GET /babies`

**请求头**: 需要 Bearer Token

**响应**:
```json
{
  "status": "success",
  "data": {
    "babies": [
      {
        "id": "baby-123",
        "user_id": "user-123",
        "name": "小宝",
        "gender": "male",
        "birthday": "2024-01-01T00:00:00.000Z",
        "due_date": null,
        "blood_type": "A",
        "birth_height": 50.0,
        "birth_weight": 3.5,
        "birth_head_circ": 35.0,
        "avatar": "https://...",
        "is_archived": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "synced_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 2. 获取单个宝宝

**端点**: `GET /babies/:babyId`

**请求头**: 需要 Bearer Token

**响应**: 同上，返回单个宝宝对象

**错误码**:
- `404`: 宝宝不存在或不属于当前用户

---

### 3. 创建宝宝

**端点**: `POST /babies`

**请求头**: 需要 Bearer Token

**请求体**:
```json
{
  "name": "小宝",
  "gender": "male",  // male, female, unknown
  "birthday": "2024-01-01T00:00:00.000Z",
  "dueDate": "2024-01-01T00:00:00.000Z",  // 可选
  "bloodType": "A",  // 可选
  "birthHeight": 50.0,  // 可选，单位 cm
  "birthWeight": 3.5,  // 可选，单位 kg
  "birthHeadCirc": 35.0,  // 可选，单位 cm
  "avatar": "https://..."  // 可选
}
```

---

### 4. 更新宝宝信息

**端点**: `PUT /babies/:babyId`

**请求头**: 需要 Bearer Token

**请求体**: 同创建，所有字段可选

---

### 5. 删除宝宝

**端点**: `DELETE /babies/:babyId`

**请求头**: 需要 Bearer Token

**响应**: `204 No Content`

---

## 🍼 喂养记录 API

### 1. 获取喂养记录

**端点**: `GET /feedings`

**请求头**: 需要 Bearer Token

**查询参数**:
- `babyId`: 宝宝ID（可选）
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）
- `limit`: 返回数量限制，默认100（可选）

**响应**:
```json
{
  "status": "success",
  "data": {
    "feedings": [
      {
        "id": "feeding-123",
        "baby_id": "baby-123",
        "time": "2024-01-01T10:00:00.000Z",
        "type": "breast",  // breast, bottled_breast_milk, formula
        "left_duration": 10,  // 分钟
        "right_duration": 10,  // 分钟
        "milk_amount": 100,  // ml
        "milk_brand": "品牌",  // 可选
        "notes": "备注",  // 可选
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "synced_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 2. 创建喂养记录

**端点**: `POST /feedings`

**请求头**: 需要 Bearer Token

**请求体**:
```json
{
  "babyId": "baby-123",
  "type": "breast",
  "time": "2024-01-01T10:00:00.000Z",
  "leftDuration": 10,  // 可选
  "rightDuration": 10,  // 可选
  "amount": 100,  // 可选
  "note": "备注"  // 可选
}
```

---

### 3. 更新喂养记录

**端点**: `PUT /feedings/:feedingId`

**请求头**: 需要 Bearer Token

**请求体**: 同创建，所有字段可选

---

### 4. 删除喂养记录

**端点**: `DELETE /feedings/:feedingId`

**请求头**: 需要 Bearer Token

---

## 😴 睡眠记录 API

### 1. 获取睡眠记录

**端点**: `GET /sleeps`

**请求头**: 需要 Bearer Token

**查询参数**: 同喂养记录

**响应**:
```json
{
  "status": "success",
  "data": {
    "sleeps": [
      {
        "id": "sleep-123",
        "baby_id": "baby-123",
        "start_time": "2024-01-01T22:00:00.000Z",
        "end_time": "2024-01-02T06:00:00.000Z",
        "duration": 480,  // 分钟
        "sleep_type": "night",  // nap, night
        "fall_asleep_method": "抱睡",  // 可选
        "notes": "备注",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 2. 创建睡眠记录

**端点**: `POST /sleeps`

**请求体**:
```json
{
  "babyId": "baby-123",
  "startTime": "2024-01-01T22:00:00.000Z",
  "endTime": "2024-01-02T06:00:00.000Z",
  "duration": 480,
  "sleepType": "night",
  "fallAsleepMethod": "抱睡",
  "notes": "备注"
}
```

---

## 🚼 尿布记录 API

### 1. 获取尿布记录

**端点**: `GET /diapers`

**响应**:
```json
{
  "status": "success",
  "data": {
    "diapers": [
      {
        "id": "diaper-123",
        "baby_id": "baby-123",
        "time": "2024-01-01T10:00:00.000Z",
        "type": "both",  // poop, pee, both
        "poop_consistency": "normal",  // loose, normal, hard, other
        "poop_color": "yellow",  // yellow, green, dark, other
        "poop_amount": "medium",  // small, medium, large
        "pee_amount": "medium",  // small, medium, large
        "has_abnormality": false,
        "notes": "备注"
      }
    ]
  }
}
```

---

### 2. 创建尿布记录

**端点**: `POST /diapers`

**请求体**:
```json
{
  "babyId": "baby-123",
  "type": "both",
  "time": "2024-01-01T10:00:00.000Z",
  "poopConsistency": "normal",
  "poopColor": "yellow",
  "poopAmount": "medium",
  "peeAmount": "medium",
  "hasAbnormality": false,
  "notes": "备注"
}
```

---

## 🍶 挤奶记录 API

### 1. 获取挤奶记录

**端点**: `GET /pumpings`

**响应**:
```json
{
  "status": "success",
  "data": {
    "pumpings": [
      {
        "id": "pumping-123",
        "baby_id": "baby-123",
        "time": "2024-01-01T10:00:00.000Z",
        "method": "electric",  // electric, manual, other
        "left_amount": 50,  // ml
        "right_amount": 50,  // ml
        "total_amount": 100,  // ml
        "storage_method": "refrigerate",  // refrigerate, freeze, feed_now, other
        "notes": "备注"
      }
    ]
  }
}
```

---

### 2. 创建挤奶记录

**端点**: `POST /pumpings`

**请求体**:
```json
{
  "babyId": "baby-123",
  "time": "2024-01-01T10:00:00.000Z",
  "method": "electric",
  "leftAmount": 50,
  "rightAmount": 50,
  "totalAmount": 100,
  "storageMethod": "refrigerate",
  "notes": "备注"
}
```

---

## 📊 成长记录 API

### 1. 获取成长记录

**端点**: `GET /growth`

**响应**:
```json
{
  "status": "success",
  "data": {
    "growthRecords": [
      {
        "id": "growth-123",
        "baby_id": "baby-123",
        "date": "2024-01-01T00:00:00.000Z",
        "height": 50.0,  // cm
        "weight": 3.5,  // kg
        "head_circ": 35.0,  // cm
        "temperature": 36.5,  // °C
        "bmi": 14.0,
        "notes": "备注"
      }
    ]
  }
}
```

---

### 2. 创建成长记录

**端点**: `POST /growth`

**请求体**:
```json
{
  "babyId": "baby-123",
  "date": "2024-01-01T00:00:00.000Z",
  "height": 50.0,
  "weight": 3.5,
  "headCirc": 35.0,
  "temperature": 36.5,
  "bmi": 14.0,
  "notes": "备注"
}
```

---

## 🔄 数据同步 API

### 1. 拉取服务器数据

**端点**: `GET /sync/pull`

**请求头**: 需要 Bearer Token

**查询参数**:
- `lastSyncTime`: 上次同步时间（可选，ISO 8601 格式）

**响应**:
```json
{
  "status": "success",
  "data": {
    "syncTime": "2024-01-01T00:00:00.000Z",
    "data": {
      "babies": [...],
      "feedings": [...],
      "diapers": [...],
      "sleeps": [...],
      "pumpings": [...],
      "growth_records": [...],
      "milestones": [...],
      "medical_visits": [...],
      "medications": [...],
      "vaccines": [...]
    }
  }
}
```

---

### 2. 推送本地数据

**端点**: `POST /sync/push`

**请求头**: 需要 Bearer Token

**请求体**:
```json
{
  "data": [
    {
      "tableName": "babies",
      "records": [
        {
          "id": "baby-123",
          "user_id": "user-123",
          "name": "小宝",
          ...
        }
      ]
    },
    {
      "tableName": "feedings",
      "records": [...]
    }
  ]
}
```

**响应**:
```json
{
  "status": "success",
  "data": {
    "success": [
      {
        "tableName": "babies",
        "id": "baby-123",
        "action": "insert"  // insert, update
      }
    ],
    "conflicts": [
      {
        "tableName": "feedings",
        "id": "feeding-123",
        "serverRecord": {...},
        "clientRecord": {...}
      }
    ],
    "errors": [
      {
        "tableName": "diapers",
        "id": "diaper-123",
        "message": "Validation error"
      }
    ]
  }
}
```

---

### 3. 获取同步状态

**端点**: `GET /sync/status`

**请求头**: 需要 Bearer Token

**响应**:
```json
{
  "status": "success",
  "data": {
    "syncLogs": [
      {
        "id": 123,
        "device_id": "device-123",
        "last_sync_time": "2024-01-01T00:00:00.000Z",
        "sync_status": "success",  // success, failed, partial
        "error_message": null
      }
    ]
  }
}
```

---

## ⚠️ 错误处理

### HTTP 状态码

- `200`: 请求成功
- `201`: 资源创建成功
- `204`: 请求成功，无返回内容（如删除操作）
- `400`: 请求参数错误
- `401`: 未认证或 Token 无效
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突（如邮箱已存在）
- `429`: 请求过于频繁（触发速率限制）
- `500`: 服务器内部错误

### 错误响应格式

```json
{
  "status": "error",
  "message": "用户友好的错误信息",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式无效"
    }
  ]
}
```

---

## 📝 数据模型

### User (用户)

```typescript
interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
  is_active: boolean;
}
```

### Baby (宝宝)

```typescript
interface Baby {
  id: string;
  user_id: string;
  name: string;
  gender: 'male' | 'female' | 'unknown';
  birthday: Date;
  due_date: Date | null;
  blood_type: string | null;
  birth_height: number | null;
  birth_weight: number | null;
  birth_head_circ: number | null;
  avatar: string | null;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
  synced_at: Date | null;
}
```

### Feeding (喂养记录)

```typescript
interface Feeding {
  id: string;
  baby_id: string;
  time: Date;
  type: 'breast' | 'bottled_breast_milk' | 'formula';
  left_duration: number;
  right_duration: number;
  milk_amount: number;
  milk_brand: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  synced_at: Date | null;
}
```

---

## 🔐 认证说明

### JWT Token

- Token 有效期：90天（可配置）
- Token 包含信息：userId, email
- Token 在请求头中传递：`Authorization: Bearer <token>`

### Token 刷新

目前不支持 Token 刷新，Token 过期后需要重新登录。

---

**文档完成！** 🎉

