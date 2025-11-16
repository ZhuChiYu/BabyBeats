import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export const QuickActionMenu: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation<any>();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  const showMenu = () => {
    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  const hideMenu = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };
  
  const handleAction = (screen: string) => {
    hideMenu();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 100);
  };
  
  const actions = [
    {
      id: 'feeding',
      screen: 'AddFeeding',
      icon: 'nutrition',
      label: '记录喂养',
      color: '#FF9500',
    },
    {
      id: 'sleep',
      screen: 'AddSleep',
      icon: 'moon',
      label: '记录睡眠',
      color: '#5856D6',
    },
    {
      id: 'diaper',
      screen: 'AddDiaper',
      icon: 'water',
      label: '记录尿布',
      color: '#34C759',
    },
    {
      id: 'pumping',
      screen: 'AddPumping',
      icon: 'flask',
      label: '记录挤奶',
      color: '#AF52DE',
    },
  ];
  
  return (
    <>
      <TouchableOpacity style={styles.mainButton} onPress={showMenu}>
        <Ionicons name="add-circle" size={32} color="#007AFF" />
      </TouchableOpacity>
      
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={hideMenu}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={hideMenu}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.menu}>
              <Text style={styles.menuTitle}>快速记录</Text>
              
              <View style={styles.actionsGrid}>
                {actions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.actionButton}
                    onPress={() => handleAction(action.screen)}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: `${action.color}15` },
                      ]}
                    >
                      <Ionicons
                        name={action.icon as any}
                        size={28}
                        color={action.color}
                      />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={hideMenu}
              >
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  mainButton: {
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: width * 0.85,
    maxWidth: 400,
  },
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F5F5F7',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
});

