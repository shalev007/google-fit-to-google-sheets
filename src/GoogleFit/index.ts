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
    aggregateBy: fitness_v1.Schema$AggregateBy[],
    startTimeMillis: number,
    endTimeMillis: number
  ): Promise<fitness_v1.Schema$AggregateResponse> {
    const response = await this.client.users.dataset.aggregate({
      // @ts-ignore
      userId: "me",
      requestBody: {
        aggregateBy,
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis,
        endTimeMillis,
      },
    });

    // @ts-ignore
    return response.data;
  }

  public async getAggregateDataAsArray(
    aggregateBy: fitness_v1.Schema$AggregateBy[],
    startTimeMillis: number,
    endTimeMillis: number
  ): Promise<any[][]> {
    const data = await this.getAggregateData(
      aggregateBy,
      startTimeMillis,
      endTimeMillis
    );
    const result: any[][] = [];

    data.bucket?.forEach((bucket) => {
      const bucketResult: any[] = [];
      bucket.dataset?.forEach((dataset) => {
        dataset.point?.forEach((point) => {
          point.value?.forEach((value) => {
            bucketResult.push(value.fpVal);
          });
        });
      });

      result.push(bucketResult);
    });

    return result;
  }
}
