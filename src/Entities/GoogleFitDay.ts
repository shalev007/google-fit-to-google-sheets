import { fitness_v1 } from "googleapis";
import { millisecondsToHours, nanosecondsToMilliseconds } from "../util";
import { DataSourceId, SleepStage } from "../GoogleFit/enums";

export const UNKNOWN_DATE = "UNKNOWN_DATE";
export class GoogleFitDay {
  from!: Date;
  to!: Date;
  wentToSleepAt: Date | typeof UNKNOWN_DATE = UNKNOWN_DATE;
  wokeUpAt: Date | typeof UNKNOWN_DATE = UNKNOWN_DATE;
  stepCount: number = 0;
  averageHeartRate: number = 0;
  maxHeartRate: number = 0;
  minHeartRate: number = 0;
  distance: number = 0;
  calories: number = 0;
  sleepHours: number = 0;
  sleepAwakeHours: number = 0;
  sleepDeepHours: number = 0;
  sleepRemHours: number = 0;

  constructor(data?: Partial<GoogleFitDay>) {
    Object.assign(this, data);
  }

  public setFromDateMillis(dateMillis: number) {
    this.from = new Date(dateMillis);
  }

  public setToDateMillis(dateMillis: number) {
    this.to = new Date(dateMillis);
  }

  public setSleepDataFromAggregateResponse(
    aggregateResponse: fitness_v1.Schema$AggregateResponse
  ) {
    let totalSleepTime = 0;
    let totalAwakeTime = 0;
    let totalLightSleepTime = 0;
    let totalDeepSleepTime = 0;
    let totalRemSleepTime = 0;

    aggregateResponse.bucket?.forEach((bucket) => {
      bucket.dataset?.forEach((dataset) => {
        switch (dataset.dataSourceId) {
          case DataSourceId.SleepSegment:
            dataset.point?.forEach((point) => {
              point.value?.forEach((value) => {
                const startTime = nanosecondsToMilliseconds(
                  parseInt(point.startTimeNanos || "")
                );
                const endTime = nanosecondsToMilliseconds(
                  parseInt(point.endTimeNanos || "")
                );
                const duration = endTime - startTime;

                switch (value.intVal) {
                  case SleepStage.Awake:
                    totalAwakeTime += duration;
                    break;
                  case SleepStage.LightSleep:
                    totalLightSleepTime += duration;
                    totalSleepTime += duration;
                    break;
                  case SleepStage.DeepSleep:
                    totalDeepSleepTime += duration;
                    totalSleepTime += duration;
                    break;
                  case SleepStage.REM:
                    totalRemSleepTime += duration;
                    totalSleepTime += duration;
                    break;
                  case SleepStage.Sleep:
                    totalSleepTime += duration;
                    break;
                }
              });
            });

            break;
        }
      });
    });

    const dataPoint =
      aggregateResponse.bucket?.[0].dataset?.find(
        (ds) => ds.dataSourceId === DataSourceId.SleepSegment
      )?.point ?? [];

    // TODO: need to validate sleep hours
    if (dataPoint.length) {
      const wentToSleepAt = parseInt(dataPoint?.[0].startTimeNanos ?? "");
      const wokeUpAt = parseInt(
        dataPoint?.[dataPoint.length - 1]?.endTimeNanos ?? ""
      );

      this.wentToSleepAt = new Date(nanosecondsToMilliseconds(wentToSleepAt));
      this.wokeUpAt = new Date(nanosecondsToMilliseconds(wokeUpAt));
    }

    this.sleepHours = millisecondsToHours(totalSleepTime);
    this.sleepAwakeHours = millisecondsToHours(totalAwakeTime);
    this.sleepDeepHours = millisecondsToHours(totalDeepSleepTime);
    this.sleepRemHours = millisecondsToHours(totalRemSleepTime);
  }

  static fromAggregateResponse(
    aggregateResponse: fitness_v1.Schema$AggregateResponse
  ): GoogleFitDay[] {
    const result: GoogleFitDay[] = [];
    aggregateResponse.bucket?.forEach((bucket) => {
      const fitDay = new GoogleFitDay();
      fitDay.setFromDateMillis(parseInt(bucket.startTimeMillis || ""));
      fitDay.setToDateMillis(parseInt(bucket.endTimeMillis || ""));
      bucket.dataset?.forEach((dataset) => {
        switch (dataset.dataSourceId) {
          case DataSourceId.StepCount:
            fitDay.stepCount = dataset.point?.[0]?.value?.[0].intVal || 0;
            break;
          case DataSourceId.HeartRate:
            fitDay.averageHeartRate = dataset.point?.[0]?.value?.[0].fpVal || 0;
            fitDay.maxHeartRate = dataset.point?.[0]?.value?.[1].fpVal || 0;
            fitDay.minHeartRate = dataset.point?.[0]?.value?.[2].fpVal || 0;
            break;
          case DataSourceId.Distance:
            fitDay.distance = dataset.point?.[0]?.value?.[0].fpVal || 0;
            break;
          case DataSourceId.Calories:
            fitDay.calories = dataset.point?.[0]?.value?.[0].fpVal || 0;
            break;
        }
      });
      result.push(fitDay);
    });
    return result;
  }
}
