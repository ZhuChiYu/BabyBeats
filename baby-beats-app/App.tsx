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
import { BabyService } from './src/services/babyService';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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

const Stack = createNativeStackNavigator();

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setBabies } = useBabyStore();
  
  useEffect(() => {
    initializeApp();
  }, []);
  
  const initializeApp = async () => {
    try {
      // 初始化数据库
      const db = await getDatabase();
      
      // 确保临时用户存在（用于开发测试）
      const tempUserId = 'temp-user-id';
      const existingUser = await db.getFirstAsync(
        'SELECT id FROM users WHERE id = ?',
        [tempUserId]
      );
      
      if (!existingUser) {
        // 创建临时用户
        const now = Date.now();
        await db.runAsync(
          `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [tempUserId, 'temp@example.com', 'temp-hash', '临时用户', now, now]
        );
        console.log('Temporary user created');
      }
      
      // 加载宝宝数据
      const babies = await BabyService.getAll(tempUserId);
      setBabies(babies);
      
      // 如果没有宝宝，创建一个测试宝宝
      if (babies.length === 0) {
        const testBaby = await BabyService.create({
          userId: tempUserId,
          name: '测试宝宝',
          gender: 'unknown',
          birthday: Date.now(),
          isArchived: false,
        });
        setBabies([testBaby]);
        console.log('Test baby created');
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setIsInitialized(true); // 即使失败也继续
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
