import { hoursToMilliseconds } from "date-fns";
import { Auth, fitness_v1, google } from "googleapis";

export class GoogleFitAdapter {
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
          { dataTypeName: "com.google.step_count.delta" },
          { dataTypeName: "com.google.heart_rate.bpm" },
          { dataTypeName: "com.google.distance.delta" },
          { dataTypeName: "com.google.calories.expended" },
          { dataTypeName: "com.google.sleep.segment" },
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
        aggregateBy: [{ dataTypeName: "com.google.sleep.segment" }],
        startTimeMillis,
        endTimeMillis,
      },
    });

    // @ts-ignore
    return response.data;
  }
}
