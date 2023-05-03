import { hoursToMilliseconds } from "date-fns";
import { Auth, fitness_v1, google } from "googleapis";
import { DataTypeName } from "./enums";

export class GoogleFitClient {
  private readonly client: fitness_v1.Fitness;

  constructor(authClient: Auth.OAuth2Client) {
    this.client = google.fitness({
      version: "v1",
      auth: authClient,
    });
  }

  public async getAggregateData(
    startTimeMillis: number,
    endTimeMillis: number
  ): Promise<fitness_v1.Schema$AggregateResponse> {
    const response = await this.client.users.dataset.aggregate({
      // @ts-ignore
      userId: "me",
      requestBody: {
        aggregateBy: [
          { dataTypeName: DataTypeName.StepCount },
          { dataTypeName: DataTypeName.HeartRate },
          { dataTypeName: DataTypeName.Distance },
          { dataTypeName: DataTypeName.Calories },
        ],
        bucketByTime: { durationMillis: hoursToMilliseconds(24) },
        startTimeMillis,
        endTimeMillis,
      },
    });

    // @ts-ignore
    return response.data;
  }

  public async getSleepData(
    startTimeMillis: number,
    endTimeMillis: number
  ): Promise<fitness_v1.Schema$AggregateResponse> {
    const response = await this.client.users.dataset.aggregate({
      // @ts-ignore
      userId: "me",
      requestBody: {
        aggregateBy: [{ dataTypeName: DataTypeName.SleepSegment }],
        startTimeMillis,
        endTimeMillis,
      },
    });

    // @ts-ignore
    return response.data;
  }
}
