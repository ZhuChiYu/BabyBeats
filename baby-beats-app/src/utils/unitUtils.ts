import { UNITS } from '../constants';

/**
 * 体重单位转换
 */
export const convertWeight = {
  kgToLb: (kg: number): number => {
    return Number((kg * UNITS.weight.kgToLb).toFixed(2));
  },
  lbToKg: (lb: number): number => {
    return Number((lb / UNITS.weight.kgToLb).toFixed(2));
  },
};

/**
 * 身高单位转换
 */
export const convertHeight = {
  cmToInch: (cm: number): number => {
    return Number((cm * UNITS.height.cmToInch).toFixed(2));
  },
  inchToCm: (inch: number): number => {
    return Number((inch / UNITS.height.cmToInch).toFixed(2));
  },
};

/**
 * 体积单位转换
 */
export const convertVolume = {
  mlToOz: (ml: number): number => {
    return Number((ml * UNITS.volume.mlToOz).toFixed(2));
  },
  ozToMl: (oz: number): number => {
    return Number((oz / UNITS.volume.mlToOz).toFixed(2));
  },
};

/**
 * 温度单位转换
 */
export const convertTemperature = {
  celsiusToFahrenheit: (celsius: number): number => {
    return Number(UNITS.temperature.celsiusToFahrenheit(celsius).toFixed(1));
  },
  fahrenheitToCelsius: (fahrenheit: number): number => {
    return Number(UNITS.temperature.fahrenheitToCelsius(fahrenheit).toFixed(1));
  },
};

/**
 * 计算BMI
 */
export const calculateBMI = (weight: number, height: number): number => {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
};

/**
 * 格式化体重显示
 */
export const formatWeight = (weight: number, unit: 'kg' | 'lb' = 'kg'): string => {
  if (unit === 'lb') {
    return `${convertWeight.kgToLb(weight)} lb`;
  }
  return `${weight} kg`;
};

/**
 * 格式化身高显示
 */
export const formatHeight = (height: number, unit: 'cm' | 'inch' = 'cm'): string => {
  if (unit === 'inch') {
    return `${convertHeight.cmToInch(height)} inch`;
  }
  return `${height} cm`;
};

/**
 * 格式化体积显示
 */
export const formatVolume = (volume: number, unit: 'ml' | 'oz' = 'ml'): string => {
  if (unit === 'oz') {
    return `${convertVolume.mlToOz(volume)} oz`;
  }
  return `${volume} ml`;
};

/**
 * 格式化温度显示
 */
export const formatTemperature = (temp: number, unit: '℃' | '℉' = '℃'): string => {
  if (unit === '℉') {
    return `${convertTemperature.celsiusToFahrenheit(temp)}℉`;
  }
  return `${temp}℃`;
};

