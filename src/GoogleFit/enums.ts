export enum DataTypeName {
  StepCount = "com.google.step_count.delta",
  HeartRate = "com.google.heart_rate.bpm",
  Distance = "com.google.distance.delta",
  Calories = "com.google.calories.expended",
  SleepSegment = "com.google.sleep.segment",
}
export enum DataSourceId {
  StepCount = "derived:com.google.step_count.delta:com.google.android.gms:aggregated",
  HeartRate = "derived:com.google.heart_rate.summary:com.google.android.gms:aggregated",
  Distance = "derived:com.google.distance.delta:com.google.android.gms:aggregated",
  Calories = "derived:com.google.calories.expended:com.google.android.gms:aggregated",
  SleepSegment = "derived:com.google.sleep.segment:com.google.android.gms:merged",
}

export enum SleepStage {
  Awake = 1,
  Sleep = 2,
  OutOfBed = 3,
  LightSleep = 4,
  DeepSleep = 5,
  REM = 6,
}
