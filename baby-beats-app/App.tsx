import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './src/navigation/TabNavigator';
import { AddFeedingScreen } from './src/screens/AddFeedingScreen';
import { AddSleepScreen } from './src/screens/AddSleepScreen';
import { AddDiaperScreen } from './src/screens/AddDiaperScreen';
import { AddPumpingScreen } from './src/screens/AddPumpingScreen';
import { getDatabase } from './src/database';
import { useBabyStore } from './src/store/babyStore';
import { BabyService } from './src/services/babyService';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

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
      await getDatabase();
      
      // 加载宝宝数据（暂时使用临时用户ID）
      const babies = await BabyService.getAll('temp-user-id');
      setBabies(babies);
      
      // 如果没有宝宝，创建一个测试宝宝
      if (babies.length === 0) {
        const testBaby = await BabyService.create({
          userId: 'temp-user-id',
          name: '测试宝宝',
          gender: 'unknown',
          birthday: Date.now(),
          isArchived: false,
        });
        setBabies([testBaby]);
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
            headerShown: true,
            title: '记录喂养',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddSleep"
          component={AddSleepScreen}
          options={{
            headerShown: true,
            title: '记录睡眠',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddDiaper"
          component={AddDiaperScreen}
          options={{
            headerShown: true,
            title: '记录尿布',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddPumping"
          component={AddPumpingScreen}
          options={{
            headerShown: true,
            title: '记录挤奶',
            presentation: 'modal',
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
