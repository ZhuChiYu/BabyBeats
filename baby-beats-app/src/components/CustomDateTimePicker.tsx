import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants';

interface CustomDateTimePickerProps {
  visible: boolean;
  mode: 'date' | 'time' | 'datetime';
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  visible,
  mode,
  value,
  onConfirm,
  onCancel,
  minimumDate,
  maximumDate,
}) => {
  const [selectedDate, setSelectedDate] = useState(value);

  // 当visible变为true或value改变时，同步selectedDate
  useEffect(() => {
    if (visible) {
      setSelectedDate(value);
    }
  }, [visible, value]);

  const handleConfirm = () => {
    onConfirm(selectedDate);
  };

  const handleCancel = () => {
    setSelectedDate(value); // 重置为原值
    onCancel();
  };

  // Android 原生选择器已经有确认/取消按钮
  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={selectedDate}
        mode={mode}
        display="default"
        onChange={(event, date) => {
          if (event.type === 'set' && date) {
            onConfirm(date);
          } else if (event.type === 'dismissed') {
            onCancel();
          }
        }}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        locale="zh-CN"
      />
    );
  }

  // iOS 需要自定义Modal包装
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={handleCancel}
      >
        <TouchableOpacity 
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {mode === 'date' ? '选择日期' : mode === 'time' ? '选择时间' : '选择日期时间'}
            </Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
              <Text style={styles.confirmText}>保存</Text>
            </TouchableOpacity>
          </View>

          {/* Picker */}
          <View style={styles.pickerContainer}>
            <View style={styles.pickerWrapper}>
              <DateTimePicker
                value={selectedDate}
                mode={mode}
                display="spinner"
                onChange={(event, date) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale="zh-CN"
                textColor="#000000"
              />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // iOS safe area
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  confirmText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

