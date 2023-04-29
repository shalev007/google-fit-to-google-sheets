import { Auth, fitness_v1, google } from "googleapis";
import { config } from "dotenv";
import fs from "fs";
import { GoogleSheetsAdapter } from "./GoogleSheets";
import { GoogleFitAdapter } from "./GoogleFit";
import { CronJob } from "cron";

config();

const googleOauth2Client = new Auth.OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

googleOauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

function getCurrentDateTime(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `[${day}-${month}-${year} ${hours}:${minutes}:${seconds}]`;
}

const main = async () => {
  const googleSheets = new GoogleSheetsAdapter(googleOauth2Client);
  const googleFit = new GoogleFitAdapter(googleOauth2Client);

  const aggregateBy = [
    { dataTypeName: "com.google.step_count.delta" },
    { dataTypeName: "com.google.heart_rate.bpm" },
    // { dataTypeName: "com.google.activity.segment" },
    { dataTypeName: "com.google.sleep.segment" },
  ];

  const yesterday = new Date().getTime() - 86400000;
  const theDayBeforeYesterday = new Date().getTime() - 172800000;
  // const aWeekAgo = new Date().getTime() - 604800000;

  const data = await googleFit.getAggregateData(
    aggregateBy,
    theDayBeforeYesterday,
    yesterday
  );

  const adaptedData = googleFitAggregatedDataResponseAdapater(data);

  console.log({ adaptedData });
  // console.log all data to json file
  fs.writeFile("data1.json", JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.log(err);
    }
  });

  googleSheets.saveSheetValues(adaptedData);
};

export const googleFitAggregatedDataResponseAdapater = (
  data: fitness_v1.Schema$AggregateResponse
) => {
  const result: any[][] = [];

  data.bucket?.forEach((bucket) => {
    const bucketResult: any[] = [];
    const startDate = new Date(parseInt(bucket.startTimeMillis || ""));
    bucketResult.push(`${startDate.toLocaleDateString("he-IL")}`);
    bucket.dataset?.forEach((dataset) => {
      dataset.point?.forEach((point) => {
        point.value?.forEach((value) => {
          bucketResult.push(value.fpVal || value.intVal);
        });
      });
    });

    result.push(bucketResult);
  });

  return result;
};

new CronJob(
  "0 0 22 * * *",
  function () {
    console.log(getCurrentDateTime(new Date()), "A new task has started");
    main()
      .then(() => {
        console.log(
          getCurrentDateTime(new Date()),
          "A new task has ended successfully"
        );
      })
      .catch(() => {
        console.log(
          getCurrentDateTime(new Date()),
          "A new task has ended with an error"
        );
      })
      .finally(() => {
        console.log(getCurrentDateTime(new Date()), "A new task has ended");
      });
  },
  null,
  true,
  "Asia/Jerusalem"
);

async function test() {
  const client = google.fitness({
    version: "v1",
    auth: googleOauth2Client,
  });

  const yesterday = new Date().getTime() - 86400000;
  const theDayBeforeYesterday = new Date().getTime() - 172800000;

  const response = await client.users.dataset.aggregate({
    // @ts-ignore
    userId: "me",
    requestBody: {
      aggregateBy: [
        // { dataTypeName: "com.google.activity.segment" },
        { dataTypeName: "com.google.sleep.segment" },
      ],
      startTimeMillis: 1682538906823,
      endTimeMillis: 1682625286295,
    },
  });

  console.log({ response });
  // @ts-ignore
  response.data.bucket?.forEach((bucket) => {
    const startDate = new Date(parseInt(bucket.startTimeMillis || ""));
    const endDate = new Date(parseInt(bucket.endTimeMillis || ""));
    console.log(
      `total time: ${endDate.toISOString()} -  ${startDate.toISOString()}`
    );
    console.log(startDate.toLocaleDateString("he-IL"));
    bucket.dataset?.forEach((dataset) => {
      dataset.point?.forEach((point) => {
        point.value?.forEach((value) => {
          console.log(
            `from ${new Date(
              point.startTimeNanos / 1000000
            ).toISOString()}, to ${new Date(
              point.endTimeNanos / 1000000
            ).toISOString()}, value: ${value.intVal || value.fpVal}}`
          );
        });
      });
    });
  });
  // @ts-ignore
  fs.writeFile("data4.json", JSON.stringify(response.data, null, 2), (err) => {
    if (err) {
      console.log(err);
    }
  });
}

test();
