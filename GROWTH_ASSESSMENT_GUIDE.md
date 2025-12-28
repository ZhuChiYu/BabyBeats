# 生长发育评估功能使用指南

## 功能概述

基于国家卫健委发布的 **WS/T 423-2022《7岁以下儿童生长标准》**，为宝宝提供科学的生长发育评估。

## 主要特性

### 1. 标准数据（WS/T 423-2022）
- ✅ 体重-年龄曲线（0-36月龄）
- ✅ 身高-年龄曲线（0-36月龄）
- ✅ 头围-年龄曲线（0-36月龄）
- 📊 7条百分位曲线：P3、P10、P25、P50、P75、P90、P97

### 2. 核心功能

#### 📈 生长曲线图表
- 显示 7 条国标百分位参考曲线
- 宝宝实际数据点和连线
- 自动标注异常点（低于P3或高于P97）
- 交互式图表，可查看详细数据

#### 📊 智能评估
- 自动计算百分位（Pxx）
- 评估状态：正常/偏低/偏高
- 生成易懂的描述："超过同龄约xx%的宝宝"
- 提供个性化建议

#### 💡 健康建议
- P3-P97 之间：正常范围，给予肯定
- 低于 P3：建议咨询医生，关注营养
- 高于 P97：建议咨询医生，注意控制
- 跨越多条曲线：提示关注生长速度变化

## 技术架构

### 文件结构
```
baby-beats-app/src/
├── constants/growthStandards/
│   ├── types.ts                          # 类型定义
│   ├── index.ts                          # 数据索引
│   ├── wst423_2022_male_weight.ts       # 男童体重标准
│   ├── wst423_2022_female_weight.ts     # 女童体重标准
│   ├── wst423_2022_male_height.ts       # 男童身高标准
│   ├── wst423_2022_female_height.ts     # 女童身高标准
│   ├── wst423_2022_male_head.ts         # 男童头围标准
│   └── wst423_2022_female_head.ts       # 女童头围标准
├── utils/
│   └── percentileCalculator.ts           # 百分位计算工具
├── services/
│   └── growthAssessment.ts              # 评估服务
├── components/
│   ├── GrowthChart.tsx                  # 生长曲线图表
│   └── AssessmentCard.tsx               # 评估结果卡片
└── screens/
    └── GrowthScreen.tsx                 # 成长页面（已更新）
```

### 核心算法

#### 1. 线性插值计算百分位
```typescript
// 在相邻两个月龄点之间进行插值
function linearInterpolate(x, x0, x1, y0, y1) {
  return y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
}
```

#### 2. 百分位定位
```typescript
// 根据测量值落在哪两条百分位曲线之间来计算
if (y >= P25 && y < P50) {
  percentile = 25 + ((y - P25) / (P50 - P25)) * 25;
}
```

#### 3. 月龄计算
```typescript
// 从出生日期到测量日期的精确月龄
ageMonths = diffDays / 30.44; // 平均每月30.44天
```

## 使用方式

### 用户操作流程

1. **添加成长记录**
   - 点击 "+" 按钮
   - 输入体重、身高、头围等数据
   - 保存记录

2. **查看生长曲线**
   - 切换体重/身高/头围标签
   - 查看宝宝数据点在百分位曲线中的位置
   - 绿色点表示正常，红色点表示异常

3. **查看评估结果**
   - 自动显示最新记录的评估
   - 查看百分位（Pxx）
   - 阅读个性化建议
   - 可以关闭/重新显示评估卡片

### 开发者集成示例

```typescript
import { assessGrowthRecord } from '../services/growthAssessment';
import { GrowthChart } from '../components/GrowthChart';
import { AssessmentCard } from '../components/AssessmentCard';

// 评估成长记录
const assessment = assessGrowthRecord(baby, record, previousRecords);

// 显示图表
<GrowthChart
  baby={currentBaby}
  records={records}
  metric="weight_for_age"
/>

// 显示评估结果
{assessment.weight && (
  <AssessmentCard
    assessment={assessment.weight}
    title="体重评估"
    icon="scale"
  />
)}
```

## 数据说明

### 百分位含义
- **P3**：只有3%的同龄儿童比这个值低
- **P50**：中位数，50%的儿童在这个值以下
- **P97**：只有3%的同龄儿童比这个值高

### 评估标准
- **正常范围**：P3 - P97 之间
- **需关注**：< P3 或 > P97
- **跨越曲线**：短期内跨越2条以上主百分位线

## 注意事项

1. **医学声明**
   - 本功能仅供参考，不能替代专业医学诊断
   - 如有异常情况，请及时咨询儿科医生或儿保专家

2. **数据准确性**
   - 测量数据应准确记录
   - 建议定期（每月）记录成长数据
   - 保持测量条件一致（如时间、衣着）

3. **特殊情况**
   - 早产儿需使用矫正月龄
   - 特殊体质儿童请遵医嘱
   - 混血儿童可能有个体差异

## 未来扩展

### 计划添加的功能
- [ ] WHO 2006 标准作为对照选项
- [ ] 7-18岁身高发育标准
- [ ] BMI-年龄评估
- [ ] 体重-身高评估
- [ ] 生长速度分析
- [ ] 导出评估报告
- [ ] 多宝宝对比

### 数据来源
- WS/T 423-2022《7岁以下儿童生长标准》
- 国家卫生健康委员会发布
- 适用于中国0-7岁儿童

## 技术支持

如有问题或建议，请查看项目文档或联系开发团队。



