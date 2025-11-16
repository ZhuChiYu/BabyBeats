import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../constants';

interface ModalHeaderProps {
  title: string;
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
  disabled?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onCancel,
  onSave,
  saving = false,
  disabled = false,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={onCancel}
        disabled={saving}
      >
        <Text style={styles.cancelText}>取消</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>{title}</Text>
      
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={onSave}
        disabled={saving || disabled}
      >
        {saving ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Text style={[styles.saveText, (disabled && styles.disabledText)]}>保存</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
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
    color: '#8E8E93',
  },
  saveText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  disabledText: {
    color: '#C7C7CC',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});

