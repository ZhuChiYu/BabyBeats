import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './src/navigation/TabNavigator';
import { AddFeedingScreen } from './src/screens/AddFeedingScreen';
import { AddSleepScreen } from './src/screens/AddSleepScreen';
import { AddDiaperScreen } from './src/screens/AddDiaperScreen';
import { AddPumpingScreen } from './src/screens/AddPumpingScreen';
import { AddGrowthScreen } from './src/screens/AddGrowthScreen';
import { QuickAddRecordScreen } from './src/screens/QuickAddRecordScreen';
import { EditFeedingScreen } from './src/screens/EditFeedingScreen';
import { EditBabyScreen } from './src/screens/EditBabyScreen';
import { EditSleepScreen } from './src/screens/EditSleepScreen';
import { EditDiaperScreen } from './src/screens/EditDiaperScreen';
import { EditPumpingScreen } from './src/screens/EditPumpingScreen';
import { AddBabyScreen } from './src/screens/AddBabyScreen';
import { BabyManagementScreen } from './src/screens/BabyManagementScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { TermsScreen } from './src/screens/TermsScreen';
import { HelpScreen } from './src/screens/HelpScreen';
import { SyncSettingsScreen } from './src/screens/SyncSettingsScreen';
import { FontSizeSettingsScreen } from './src/screens/FontSizeSettingsScreen';
import { StatsReportScreen } from './src/screens/StatsReportScreen';
import { getDatabase } from './src/database';
import { useBabyStore } from './src/store/babyStore';
import { useAuthStore } from './src/store/authStore';
import { BabyService } from './src/services/babyService';
import { AuthApiService } from './src/services/api/authService';
import { BabyApiService } from './src/services/api/babyApiService';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
// Auth screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
// Health screens
import { AddTemperatureScreen } from './src/screens/AddTemperatureScreen';
import { AddVaccineScreen } from './src/screens/AddVaccineScreen';
import { AddMilestoneScreen } from './src/screens/AddMilestoneScreen';
import { AddMedicationScreen } from './src/screens/AddMedicationScreen';
import { AddMedicalVisitScreen } from './src/screens/AddMedicalVisitScreen';
import { VaccineListScreen } from './src/screens/VaccineListScreen';
import { MilestoneTimelineScreen } from './src/screens/MilestoneTimelineScreen';
import { MedicationListScreen } from './src/screens/MedicationListScreen';
import { MedicalVisitListScreen } from './src/screens/MedicalVisitListScreen';
import { TemperatureListScreen } from './src/screens/TemperatureListScreen';
import { SmartInputScreen } from './src/screens/SmartInputScreen';
import { SleepSoundScreen } from './src/screens/SleepSoundScreen';
import { debugDatabaseState } from './src/utils/debugDatabase';
import { syncBabyStore } from './src/utils/babyValidation';
import { migrateAddUrineFields } from './src/utils/databaseMigration';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setBabies, setCurrentBaby } = useBabyStore();
  const { user, setUser, setLoading, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    initializeApp();
  }, []);
  
  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // 初始化数据库（用于本地缓存）
      const db = await getDatabase();
      
      // 运行数据库迁移
      await migrateAddUrineFields();
      
      // 调试：输出数据库状态
      await debugDatabaseState();
      
      // 尝试恢复登录状态
      const savedUser = await AuthApiService.restoreAuth();
      if (savedUser) {
        console.log('✅ 已恢复登录状态:', savedUser.email);
        setUser(savedUser);
        
        // 加载云端宝宝数据
        try {
          const babies = await BabyApiService.getAll();
      setBabies(babies);
      
          if (babies.length > 0) {
            setCurrentBaby(babies[0].id);
            console.log('✅ 已加载云端宝宝数据:', babies.length, '个');
          }
        } catch (error) {
          console.error('加载宝宝数据失败:', error);
        }
      } else {
        console.log('⚠️ 未登录，显示登录页面');
      }
      
      setIsInitialized(true);
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setIsInitialized(true);
      setLoading(false);
    }
  };
  
  if (!isInitialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  
  return (
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
        {/* 登录注册流程 */}
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="AddFeeding"
          component={AddFeedingScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddSleep"
          component={AddSleepScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddDiaper"
          component={AddDiaperScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddPumping"
          component={AddPumpingScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddGrowth"
          component={AddGrowthScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="QuickAddRecord"
          component={QuickAddRecordScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="EditFeeding"
          component={EditFeedingScreen as any}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="EditBaby"
          component={EditBabyScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="EditSleep"
          component={EditSleepScreen as any}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="EditDiaper"
          component={EditDiaperScreen as any}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="EditPumping"
          component={EditPumpingScreen as any}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddBaby"
          component={AddBabyScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="SmartInput"
          component={SmartInputScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="SleepSound"
          component={SleepSoundScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="BabyManagement"
          component={BabyManagementScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="Terms"
          component={TermsScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="Help"
          component={HelpScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="SyncSettings"
          component={SyncSettingsScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="FontSizeSettings"
          component={FontSizeSettingsScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="StatsReport"
          component={StatsReportScreen as any}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        {/* Health & Milestone screens */}
        <Stack.Screen
          name="AddTemperature"
          component={AddTemperatureScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddVaccine"
          component={AddVaccineScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddMilestone"
          component={AddMilestoneScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddMedication"
          component={AddMedicationScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddMedicalVisit"
          component={AddMedicalVisitScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="VaccineList"
          component={VaccineListScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="MilestoneTimeline"
          component={MilestoneTimelineScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="MedicationList"
          component={MedicationListScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="MedicalVisitList"
          component={MedicalVisitListScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="TemperatureList"
          component={TemperatureListScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
});
