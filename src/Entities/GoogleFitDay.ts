import { fitness_v1 } from "googleapis";
import { millisecondsToHours, nanosecondsToMilliseconds } from "../util";
import { DataSourceId, SleepStage } from "../GoogleFit/enums";

export class GoogleFitDay {
  from!: Date;
  to!: Date;
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
            fitDay.stepCount = dataset.point?.[0].value?.[0].intVal || 0;
            break;
          case DataSourceId.HeartRate:
            fitDay.averageHeartRate = dataset.point?.[0].value?.[0].fpVal || 0;
            fitDay.maxHeartRate = dataset.point?.[0].value?.[1].fpVal || 0;
            fitDay.minHeartRate = dataset.point?.[0].value?.[2].fpVal || 0;
            break;
          case DataSourceId.Distance:
            fitDay.distance = dataset.point?.[0].value?.[0].fpVal || 0;
            break;
          case DataSourceId.Calories:
            fitDay.calories = dataset.point?.[0].value?.[0].fpVal || 0;
            break;
          //   case "derived:com.google.sleep.segment:com.google.android.gms:sleep_from_activity_segment":
          //     const sleepSegmentStartTimes: number[] = [];
          //     const sleepSegmentEndTimes: number[] = [];
          //     dataset.point?.forEach((point) => {
          //       point.value?.forEach((value) => {
          //         sleepSegmentStartTimes.push(
          //           parseInt(point.startTimeNanos || "") / 1000000
          //         );
          //         sleepSegmentEndTimes.push(
          //           parseInt(point.endTimeNanos || "") / 1000000
          //         );
          //       });
          //     });
          //     const sleepStart = new Date(sleepSegmentStartTimes[0]);
          //     const sleepEnd = new Date(
          //       sleepSegmentEndTimes[sleepSegmentEndTimes.length - 1]
          //     );
          //     const sleepHours =
          //       (sleepEnd.getTime() - sleepStart.getTime()) / 1000 / 60 / 60;
          //     bucketResult.push(sleepHours);
          //     break;
        }
      });
      result.push(fitDay);
    });
    return result;
  }
}
