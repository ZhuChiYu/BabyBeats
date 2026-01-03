import React, { useState, useEffect } from 'react';
import {View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../store/babyStore';
import { MilestoneService } from '../services/milestoneService';
import { ModalHeader } from '../components/ModalHeader';
import { CustomDateTimePicker } from '../components/CustomDateTimePicker';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
// import * as ImagePicker from 'expo-image-picker'; // 暂时禁用照片功能
import { Milestone } from '../types';

interface AddMilestoneScreenProps {
  navigation: any;
  route?: any;
}

export const AddMilestoneScreen: React.FC<AddMilestoneScreenProps> = ({ navigation, route }) => {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  const editingMilestone: Milestone | undefined = route?.params?.milestone;

  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [milestoneType, setMilestoneType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);

  // 初始化编辑数据
  useEffect(() => {
    if (editingMilestone) {
      setTime(new Date(editingMilestone.time));
      setMilestoneType(editingMilestone.milestoneType);
      setTitle(editingMilestone.title);
      setDescription(editingMilestone.description || '');
      setPhotoUri(editingMilestone.photoUrl || null);
    }
  }, [editingMilestone]);

  const milestoneTypes = MilestoneService.getMilestoneTypes();
  const selectedType = milestoneTypes.find(t => t.id === milestoneType);

  const pickImage = async () => {
    // 照片功能暂时禁用
    Alert.alert('提示', '照片上传功能暂时不可用');
    return;
    
    // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    // if (status !== 'granted') {
    //   Alert.alert('提示', '需要相册权限才能选择照片');
    //   return;
    // }

    // const result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsEditing: true,
    //   aspect: [4, 3],
    //   quality: 0.8,
    // });

    // if (!result.canceled) {
    //   setPhotoUri(result.assets[0].uri);
    // }
  };

  const handleDelete = async () => {
    if (!editingMilestone) return;

    Alert.alert(
      '确认删除',
      '确定要删除这个里程碑吗？此操作无法撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await MilestoneService.delete(editingMilestone.id);
              Alert.alert('成功', '里程碑已删除', [
                {
                  text: '确定',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('Failed to delete milestone:', error);
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!currentBaby) {
      Alert.alert('错误', '请先选择宝宝');
      return;
    }

    if (!milestoneType) {
      Alert.alert('错误', '请选择里程碑类型');
      return;
    }

    if (!title.trim()) {
      Alert.alert('错误', '请输入里程碑标题');
      return;
    }

    setSaving(true);
    try {
      if (editingMilestone) {
        // 更新现有里程碑
        await MilestoneService.update(editingMilestone.id, {
          time: time.getTime(),
          milestoneType,
          title: title.trim(),
          description: description.trim() || undefined,
          photoUrl: photoUri || undefined,
        });
        Alert.alert('成功', '里程碑已更新！', [
          {
            text: '确定',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // 创建新里程碑
        await MilestoneService.create({
          babyId: currentBaby.id,
          time: time.getTime(),
          milestoneType,
          title: title.trim(),
          description: description.trim() || undefined,
          photoUrl: photoUri || undefined,
        });
        Alert.alert('成功', '里程碑已记录！', [
          {
            text: '确定',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to save milestone:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ModalHeader
        title={editingMilestone ? "编辑里程碑" : "记录里程碑"}
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        saving={saving}
      />

      <KeyboardAvoidingView 


        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}


        style={{ flex: 1 }}


        keyboardVerticalOffset={0}


      >


        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
        {/* 类型选择 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>里程碑类型 *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTypePicker(!showTypePicker)}
          >
            {selectedType ? (
              <View style={styles.selectedType}>
                <View style={[styles.typeIcon, { backgroundColor: `${selectedType.color}15` }]}>
                  <Ionicons name={selectedType.icon as any} size={20} color={selectedType.color} />
                </View>
                <Text style={styles.inputText}>{selectedType.name}</Text>
              </View>
            ) : (
              <Text style={styles.placeholder}>选择里程碑类型</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          {showTypePicker && (
            <View style={styles.typePicker}>
              {milestoneTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.typeItem}
                  onPress={() => {
                    setMilestoneType(type.id);
                    setShowTypePicker(false);
                    setShowItemPicker(true);
                  }}
                >
                  <View style={[styles.typeIcon, { backgroundColor: `${type.color}15` }]}>
                    <Ionicons name={type.icon as any} size={20} color={type.color} />
                  </View>
                  <Text style={styles.typeName}>{type.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 具体事项选择 */}
        {selectedType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>选择具体事项（或自定义）</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowItemPicker(!showItemPicker)}
            >
              <Text style={[styles.inputText, !title && styles.placeholder]}>
                {title || '点击选择或输入'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            {showItemPicker && (
              <View style={styles.itemPicker}>
                <TextInput
                  style={styles.searchInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="搜索或输入自定义标题"
                  placeholderTextColor="#C7C7CC"
                />
                <ScrollView style={styles.itemList}>
                  {selectedType.items.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.itemButton}
                      onPress={() => {
                        setTitle(item);
                        setShowItemPicker(false);
                      }}
                    >
                      <Text style={styles.itemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* 发生时间 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>发生时间 *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#007AFF" />
            <Text style={styles.dateText}>
              {format(time, 'yyyy年MM月dd日', { locale: zhCN })}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* 照片 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>添加照片（选填）</Text>
          {photoUri ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => setPhotoUri(null)}
              >
                <Ionicons name="close-circle" size={28} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
              <Ionicons name="camera" size={32} color="#007AFF" />
              <Text style={styles.addPhotoText}>点击添加照片</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 详细描述 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>详细描述（选填）</Text>
          <TextInput
            style={styles.notesInput}
            value={description}
            onChangeText={setDescription}
            placeholder="记录这个珍贵时刻的细节..."
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 删除按钮（仅编辑模式） */}
        {editingMilestone && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>删除里程碑</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer} />
      </ScrollView>


      </KeyboardAvoidingView>

      <CustomDateTimePicker
        visible={showDatePicker}
        mode="date"
        value={time}
        onConfirm={(date) => {
          setTime(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        maximumDate={new Date()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
  },
  inputText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  placeholder: {
    color: '#C7C7CC',
  },
  selectedType: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typePicker: {
    marginTop: 12,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  typeName: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  itemPicker: {
    marginTop: 12,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    maxHeight: 250,
  },
  searchInput: {
    fontSize: 16,
    color: '#000',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  itemList: {
    maxHeight: 200,
  },
  itemButton: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  photoContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  addPhotoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  notesInput: {
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  footer: {
    height: 32,
  },
});
