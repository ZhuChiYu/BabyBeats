import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SoundItem {
  id: string;
  name: string;
  description?: string;
  icon: any;
  uri?: string;
  isBuiltIn: boolean;
}

const CUSTOM_SOUNDS_KEY = '@babybeats_custom_sounds';
const RECORDINGS_DIR = `${FileSystem.documentDirectory}sleep_sounds/`;

class SleepSoundServiceClass {
  private sound: Sound | null = null;
  private recording: Audio.Recording | null = null;
  private isLooping: boolean = true;
  private currentSoundItem: SoundItem | null = null;
  private currentlyPlaying: boolean = false;

  // 内置白噪音列表
  private builtInSounds: SoundItem[] = [
    {
      id: 'white-noise',
      name: '白噪音',
      description: '经典白噪音，模拟子宫环境',
      icon: 'water',
      isBuiltIn: true,
    },
    {
      id: 'rain',
      name: '雨声',
      description: '轻柔雨声，舒缓放松',
      icon: 'rainy',
      isBuiltIn: true,
    },
    {
      id: 'ocean',
      name: '海浪',
      description: '平静海浪声，安抚情绪',
      icon: 'boat',
      isBuiltIn: true,
    },
    {
      id: 'heartbeat',
      name: '心跳',
      description: '妈妈的心跳声，给宝宝安全感',
      icon: 'heart',
      isBuiltIn: true,
    },
    {
      id: 'fan',
      name: '风扇',
      description: '电风扇声音，持续低频白噪音',
      icon: 'fitness',
      isBuiltIn: true,
    },
    {
      id: 'shush',
      name: '嘘声',
      description: '轻柔的"嘘嘘"声，安抚神器',
      icon: 'mic-off',
      isBuiltIn: true,
    },
  ];

  constructor() {
    this.initAudio();
    this.ensureRecordingsDirExists();
  }

  private async initAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false, // 不降低音量
        interruptionModeIOS: 1, // DO_NOT_MIX
        interruptionModeAndroid: 1, // DO_NOT_MIX
      });
    } catch (error) {
      console.error('初始化音频失败:', error);
    }
  }

  private async ensureRecordingsDirExists() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(RECORDINGS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('创建录音目录失败:', error);
    }
  }

  /**
   * 获取内置白噪音列表
   */
  getBuiltInSounds(): SoundItem[] {
    return this.builtInSounds;
  }

  /**
   * 获取自定义录音列表
   */
  async getCustomSounds(): Promise<SoundItem[]> {
    try {
      const data = await AsyncStorage.getItem(CUSTOM_SOUNDS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('获取自定义声音失败:', error);
      return [];
    }
  }

  /**
   * 播放声音（循环播放）
   */
  async play(soundItem: SoundItem): Promise<void> {
    try {
      // 停止当前播放
      await this.stop();

      // 确保音频模式正确设置（支持后台播放）
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        interruptionModeIOS: 1, // DO_NOT_MIX
        interruptionModeAndroid: 1, // DO_NOT_MIX
      });

      // 创建新的Sound实例
      const { sound } = await this.createSoundFromItem(soundItem);
      this.sound = sound;

      // 设置循环播放
      await this.sound.setIsLoopingAsync(this.isLooping);

      // 开始播放
      await this.sound.playAsync();
      
      // 更新状态
      this.currentSoundItem = soundItem;
      this.currentlyPlaying = true;
    } catch (error) {
      console.error('播放失败:', error);
      this.currentSoundItem = null;
      this.currentlyPlaying = false;
      throw error;
    }
  }

  /**
   * 暂停播放
   */
  async pause(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
      this.currentlyPlaying = false;
    }
  }

  /**
   * 恢复播放
   */
  async resume(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
      this.currentlyPlaying = true;
    }
  }

  /**
   * 停止播放
   */
  async stop(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (error) {
        console.error('停止播放失败:', error);
      } finally {
        this.sound = null;
        this.currentSoundItem = null;
        this.currentlyPlaying = false;
      }
    }
  }

  /**
   * 设置循环播放
   */
  setLooping(isLooping: boolean) {
    this.isLooping = isLooping;
    if (this.sound) {
      this.sound.setIsLoopingAsync(isLooping);
    }
  }

  /**
   * 获取当前播放状态
   */
  getPlaybackState(): { soundItem: SoundItem | null; isPlaying: boolean } {
    return {
      soundItem: this.currentSoundItem,
      isPlaying: this.currentlyPlaying,
    };
  }

  /**
   * 检查是否正在播放
   */
  isCurrentlyPlaying(): boolean {
    return this.currentlyPlaying;
  }

  /**
   * 获取当前播放的声音
   */
  getCurrentSound(): SoundItem | null {
    return this.currentSoundItem;
  }

  /**
   * 开始录音
   */
  async startRecording(): Promise<void> {
    try {
      // 请求权限
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('没有麦克风权限');
      }

      // 停止当前播放
      await this.stop();

      // 配置音频模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // 开始录音
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      this.recording = recording;
    } catch (error) {
      console.error('开始录音失败:', error);
      throw error;
    }
  }

  /**
   * 停止录音
   */
  async stopRecording(): Promise<string | null> {
    if (!this.recording) {
      return null;
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      // 重置音频模式
      await this.initAudio();

      return uri;
    } catch (error) {
      console.error('停止录音失败:', error);
      this.recording = null;
      return null;
    }
  }

  /**
   * 保存录音
   */
  async saveRecording(uri: string, name: string): Promise<boolean> {
    try {
      // 确保录音目录存在
      await this.ensureRecordingsDirExists();

      const timestamp = Date.now();
      const fileName = `recording_${timestamp}.m4a`;
      const newUri = `${RECORDINGS_DIR}${fileName}`;

      console.log('保存录音:', { from: uri, to: newUri });

      // 检查源文件是否存在
      const sourceInfo = await FileSystem.getInfoAsync(uri);
      if (!sourceInfo.exists) {
        console.error('源录音文件不存在:', uri);
        return false;
      }

      // 移动文件到永久存储
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      // 验证文件是否成功移动
      const destInfo = await FileSystem.getInfoAsync(newUri);
      if (!destInfo.exists) {
        console.error('文件移动失败');
        return false;
      }

      console.log('录音保存成功:', newUri, '大小:', destInfo.size);

      // 创建声音项
      const soundItem: SoundItem = {
        id: `custom_${timestamp}`,
        name,
        icon: 'musical-note',
        uri: newUri,
        isBuiltIn: false,
      };

      // 保存到AsyncStorage
      const customSounds = await this.getCustomSounds();
      customSounds.push(soundItem);
      await AsyncStorage.setItem(CUSTOM_SOUNDS_KEY, JSON.stringify(customSounds));

      return true;
    } catch (error) {
      console.error('保存录音失败:', error);
      return false;
    }
  }

  /**
   * 删除自定义声音
   */
  async deleteCustomSound(id: string): Promise<boolean> {
    try {
      const customSounds = await this.getCustomSounds();
      const sound = customSounds.find(s => s.id === id);
      
      if (!sound) {
        return false;
      }

      // 删除文件
      if (sound.uri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(sound.uri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(sound.uri, { idempotent: true });
          }
        } catch (fileError) {
          console.warn('删除文件失败，继续删除记录:', fileError);
          // 即使文件删除失败，也继续删除记录
        }
      }

      // 从列表中移除
      const updatedSounds = customSounds.filter(s => s.id !== id);
      await AsyncStorage.setItem(CUSTOM_SOUNDS_KEY, JSON.stringify(updatedSounds));

      return true;
    } catch (error) {
      console.error('删除自定义声音失败:', error);
      return false;
    }
  }

  /**
   * 根据SoundItem创建Sound实例
   */
  private async createSoundFromItem(soundItem: SoundItem): Promise<{ sound: Sound }> {
    if (soundItem.isBuiltIn) {
      // 内置声音：使用本地音频资源
      const soundMap: Record<string, any> = {
        'white-noise': require('../../assets/sounds/white-noise.mp3'),
        'rain': require('../../assets/sounds/rain.mp3'),
        'ocean': require('../../assets/sounds/ocean.mp3'),
        'heartbeat': require('../../assets/sounds/heartbeat.mp3'),
        'fan': require('../../assets/sounds/fan.mp3'),
        'shush': require('../../assets/sounds/shush.mp3'),
      };

      const audioSource = soundMap[soundItem.id];
      
      if (!audioSource) {
        throw new Error(`找不到音频文件: ${soundItem.id}。请查看 assets/sounds/README.md 了解如何添加音频文件。`);
      }

      return await Audio.Sound.createAsync(
        audioSource,
        { shouldPlay: false, isLooping: true }
      );
    } else {
      // 自定义录音
      if (!soundItem.uri) {
        throw new Error('自定义声音缺少URI');
      }

      // 验证文件是否存在
      const fileInfo = await FileSystem.getInfoAsync(soundItem.uri);
      if (!fileInfo.exists) {
        throw new Error(`录音文件不存在: ${soundItem.uri}`);
      }

      console.log('播放自定义录音:', soundItem.uri, '大小:', fileInfo.size);

      return await Audio.Sound.createAsync(
        { uri: soundItem.uri },
        { shouldPlay: false, isLooping: true }
      );
    }
  }
}

export const SleepSoundService = new SleepSoundServiceClass();

