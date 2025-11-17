import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// 底部Tab导航参数
export type TabParamList = {
  Today: undefined;
  Log: undefined;
  Stats: undefined;
  Growth: undefined;
  Health: undefined;
  Settings: undefined;
};

// 根栈导航参数
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  AddFeeding: undefined;
  AddSleep: undefined;
  AddDiaper: undefined;
  AddPumping: undefined;
  AddGrowth: undefined;
  BabyManagement: undefined;
  AddBaby: undefined;
  EditBaby: { babyId: string };
  EditFeeding: { feedingId: string };
  EditSleep: { sleepId: string };
  EditDiaper: { diaperId: string };
  EditPumping: { pumpingId: string };
  
  // 健康相关
  TemperatureList: undefined;
  AddTemperature: undefined;
  EditTemperature: { temperatureId: string };
  
  VaccineList: undefined;
  AddVaccine: undefined;
  EditVaccine: { vaccineId: string };
  
  MilestoneTimeline: undefined;
  AddMilestone: undefined;
  EditMilestone: { milestoneId: string };
  
  MedicalVisitList: undefined;
  AddMedicalVisit: undefined;
  EditMedicalVisit: { visitId: string };
  
  MedicationList: undefined;
  AddMedication: { visitId?: string };
  EditMedication: { medicationId: string };
};

// 导航prop类型
export type TabNavigationProp = BottomTabNavigationProp<TabParamList>;
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// 路由prop类型
export type RootRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;

