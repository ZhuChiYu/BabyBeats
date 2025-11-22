import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
import { SleepSoundService, SoundItem } from '../services/sleepSoundService';

interface SleepSoundScreenProps {
  navigation: any;
}

export const SleepSoundScreen: React.FC<SleepSoundScreenProps> = ({ navigation }) => {
  const [currentSound, setCurrentSound] = useState<SoundItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customSounds, setCustomSounds] = useState<SoundItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showRecordModal, setShowRecordModal] = useState(false);

  useEffect(() => {
    loadCustomSounds();
    requestPermissions();

    // 不在组件卸载时停止播放，支持后台播放
    // 音频只有在点击停止按钮时才会停止
  }, []);

  // 每次页面获得焦点时，恢复播放状态
  useFocusEffect(
    useCallback(() => {
      const playbackState = SleepSoundService.getPlaybackState();
      if (playbackState.soundItem) {
        setCurrentSound(playbackState.soundItem);
        setIsPlaying(playbackState.isPlaying);
      }
    }, [])
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('提示', '需要麦克风权限才能录制白噪音');
      }
    } catch (error) {
      console.error('请求权限失败:', error);
    }
  };

  const loadCustomSounds = async () => {
    try {
      const sounds = await SleepSoundService.getCustomSounds();
      setCustomSounds(sounds);
    } catch (error) {
      console.error('加载自定义声音失败:', error);
    }
  };

  const handlePlaySound = async (sound: SoundItem) => {
    try {
      setIsLoading(true);
      
      if (currentSound?.id === sound.id && isPlaying) {
        // 如果正在播放当前声音，则暂停
        await SleepSoundService.pause();
        setIsPlaying(false);
      } else {
        // 播放新声音或恢复播放
        if (currentSound?.id !== sound.id) {
          await SleepSoundService.play(sound);
          setCurrentSound(sound);
        } else {
          await SleepSoundService.resume();
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('播放失败:', error);
      Alert.alert('错误', '播放失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSound = async () => {
    try {
      await SleepSoundService.stop();
      setIsPlaying(false);
      setCurrentSound(null);
    } catch (error) {
      console.error('停止失败:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      setShowRecordModal(true);
      setRecordingDuration(0);
      await SleepSoundService.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('开始录音失败:', error);
      Alert.alert('错误', '录音失败，请检查麦克风权限');
      setShowRecordModal(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      const uri = await SleepSoundService.stopRecording();
      setIsRecording(false);
      
      if (uri) {
        Alert.prompt(
          '保存录音',
          '请为这段白噪音命名',
          [
            {
              text: '取消',
              style: 'cancel',
              onPress: async () => {
                // 删除未保存的录音
                await FileSystem.deleteAsync(uri, { idempotent: true });
                setShowRecordModal(false);
              },
            },
            {
              text: '保存',
              onPress: async (name?: string) => {
                if (name && name.trim()) {
                  const success = await SleepSoundService.saveRecording(uri, name.trim());
                  if (success) {
                    Alert.alert('成功', '录音已保存');
                    await loadCustomSounds();
                  } else {
                    Alert.alert('错误', '保存录音失败');
                  }
                }
                setShowRecordModal(false);
              },
            },
          ],
          'plain-text',
          '我的白噪音'
        );
      }
    } catch (error) {
      console.error('停止录音失败:', error);
      Alert.alert('错误', '停止录音失败');
      setShowRecordModal(false);
    }
  };

  const handleDeleteCustomSound = async (sound: SoundItem) => {
    Alert.alert(
      '确认删除',
      `确定要删除"${sound.name}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const success = await SleepSoundService.deleteCustomSound(sound.id);
            if (success) {
              if (currentSound?.id === sound.id) {
                await handleStopSound();
              }
              await loadCustomSounds();
            } else {
              Alert.alert('错误', '删除失败');
            }
          },
        },
      ]
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const builtInSounds = SleepSoundService.getBuiltInSounds();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>哄睡白噪音</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 当前播放状态 */}
        {currentSound && (
          <View style={styles.nowPlayingCard}>
            <View style={styles.nowPlayingTop}>
              <View style={styles.nowPlayingIcon}>
                <Ionicons 
                  name={isPlaying ? "musical-notes" : "pause"} 
                  size={32} 
                  color="#5856D6" 
                />
              </View>
              <View style={styles.nowPlayingInfo}>
                <Text style={styles.nowPlayingLabel}>正在播放</Text>
                <Text style={styles.nowPlayingName}>{currentSound.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStopSound}
              >
                <Ionicons name="stop-circle" size={40} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            <View style={styles.nowPlayingWave}>
              {isPlaying && (
                <View style={styles.waveContainer}>
                  {[...Array(20)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.wavebar,
                        {
                          height: 3 + Math.random() * 20,
                          opacity: 0.3 + Math.random() * 0.7,
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* 内置白噪音 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>内置白噪音</Text>
          <Text style={styles.sectionDesc}>精选多种舒缓白噪音，帮助宝宝快速入睡</Text>

          {builtInSounds.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              style={[
                styles.soundCard,
                currentSound?.id === sound.id && styles.soundCardActive,
              ]}
              onPress={() => handlePlaySound(sound)}
              disabled={isLoading}
            >
              <View style={styles.soundIcon}>
                <Ionicons name={sound.icon} size={24} color="#5856D6" />
              </View>
              <View style={styles.soundInfo}>
                <Text style={styles.soundName}>{sound.name}</Text>
                <Text style={styles.soundDesc}>{sound.description}</Text>
              </View>
              <View style={styles.soundAction}>
                {isLoading && currentSound?.id === sound.id ? (
                  <ActivityIndicator size="small" color="#5856D6" />
                ) : (
                  <Ionicons
                    name={
                      currentSound?.id === sound.id && isPlaying
                        ? "pause-circle"
                        : "play-circle"
                    }
                    size={40}
                    color={currentSound?.id === sound.id ? "#5856D6" : "#C7C7CC"}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 录制自定义白噪音 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>自定义录音</Text>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={handleStartRecording}
              disabled={isRecording}
            >
              <Ionicons name="mic" size={20} color="#FFF" />
              <Text style={styles.recordButtonText}>录制</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDesc}>
            录制您喜欢的声音，如吹风机、洗衣机等
          </Text>

          {customSounds.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="mic-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyText}>还没有自定义录音</Text>
              <Text style={styles.emptyDesc}>点击"录制"按钮开始录制</Text>
            </View>
          ) : (
            customSounds.map((sound) => (
              <View
                key={sound.id}
                style={[
                  styles.soundCard,
                  currentSound?.id === sound.id && styles.soundCardActive,
                ]}
              >
                <TouchableOpacity
                  style={styles.customSoundMain}
                  onPress={() => handlePlaySound(sound)}
                  disabled={isLoading}
                >
                  <View style={styles.soundIcon}>
                    <Ionicons name="musical-note" size={24} color="#FF9500" />
                  </View>
                  <View style={styles.soundInfo}>
                    <Text style={styles.soundName}>{sound.name}</Text>
                    <Text style={styles.soundDesc}>自定义录音</Text>
                  </View>
                  <View style={styles.soundAction}>
                    {isLoading && currentSound?.id === sound.id ? (
                      <ActivityIndicator size="small" color="#FF9500" />
                    ) : (
                      <Ionicons
                        name={
                          currentSound?.id === sound.id && isPlaying
                            ? "pause-circle"
                            : "play-circle"
                        }
                        size={40}
                        color={currentSound?.id === sound.id ? "#FF9500" : "#C7C7CC"}
                      />
                    )}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCustomSound(sound)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* 录音模态框 */}
      <Modal
        visible={showRecordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.recordModal}>
            <View style={styles.recordingIcon}>
              <Ionicons name="mic" size={48} color="#FF3B30" />
            </View>
            <Text style={styles.recordingTitle}>正在录制</Text>
            <Text style={styles.recordingDuration}>
              {formatDuration(recordingDuration)}
            </Text>
            <View style={styles.recordingWave}>
              {[...Array(5)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.recordingBar,
                    {
                      height: 20 + Math.random() * 40,
                    },
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.stopRecordButton}
              onPress={handleStopRecording}
            >
              <Ionicons name="stop-circle" size={24} color="#FFF" />
              <Text style={styles.stopRecordButtonText}>停止录制</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  nowPlayingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nowPlayingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nowPlayingIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F7F6FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  nowPlayingName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  stopButton: {
    padding: 4,
  },
  nowPlayingWave: {
    height: 40,
    justifyContent: 'center',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30,
  },
  wavebar: {
    width: 3,
    backgroundColor: '#5856D6',
    borderRadius: 1.5,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  recordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  soundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  soundCardActive: {
    borderWidth: 2,
    borderColor: '#5856D6',
  },
  customSoundMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  soundIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7F6FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  soundInfo: {
    flex: 1,
  },
  soundName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  soundDesc: {
    fontSize: 13,
    color: '#8E8E93',
  },
  soundAction: {
    marginLeft: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
  },
  footer: {
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '80%',
  },
  recordingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  recordingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  recordingDuration: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 24,
  },
  recordingWave: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 8,
    marginBottom: 24,
  },
  recordingBar: {
    width: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 2,
  },
  stopRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  stopRecordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

