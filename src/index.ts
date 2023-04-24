import { Auth, GoogleApis, fitness_v1 } from "googleapis";
// import { Schema$AggregateResponse } from "googleapis/build/src/apis/fitness/v1";
import { config } from "dotenv";
import fs from "fs";
import { GoogleSheetsAdapter } from "./GoogleSheets";

config();

const googleOauth2Client = new Auth.OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

googleOauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const main = async () => {
  const fitness = new fitness_v1.Fitness({
    auth: googleOauth2Client,
  });

  const googleSheets = new GoogleSheetsAdapter(googleOauth2Client);
  googleSheets.saveSheetValues([
    ["a", "b", "c", "d"],
    ["e", "f", "7", "h"],
  ]);
  return;

  const now = new Date().getTime();
  const oneDayAgo = new Date(now - 86400000).getTime();
  const anHourAgo = new Date(now - 3600000).getTime();
  // a week ago
  const aWeekAgo = new Date(now - 604800000).getTime();
  const twoDaysAgo = new Date(now - 172800000).getTime();
  const oneWeekAgo = new Date(now - 604800000).getTime();

  const data = await fitness.users.dataset.aggregate({
    // @ts-ignore
    userId: "me",
    requestBody: {
      aggregateBy: [
        // {
        //   dataTypeName: "com.google.step_count.delta",
        //   dataSourceId:
        //     "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
        // },
        // { dataTypeName: "com.google.step_count.delta" },
        // { dataTypeName: "com.google.calories.expended" },
        // { dataTypeName: "com.google.distance.delta" },
        // { dataTypeName: "com.google.heart_rate.bpm" },
        // { dataTypeName: "com.google.weight" },
        // { dataTypeName: "com.google.height" },
        // { dataTypeName: "com.google.body.fat.percentage" },
        // { dataTypeName: "com.google.activity.segment" },
        { dataTypeName: "com.google.sleep.segment" },
      ],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: twoDaysAgo,
      endTimeMillis: now,
    },
  });

  // print response to json file
  console.log(JSON.stringify(data.data, null, 2));
  // fs.writeFile("data.json", JSON.stringify(data.data, null, 2), (err) => {
  //   if (err) {
  //     console.log(err);
  //   }
  // });

  data.data.bucket.forEach((bucket) => {
    console.log(
      new Date(parseInt(bucket.startTimeMillis)).toLocaleDateString(),
      new Date(parseInt(bucket.endTimeMillis)).toLocaleDateString()
    );
    bucket.dataset.forEach((dataset) => {
      // console.log(dataset.dataSourceId, dataset.dataTypeName);
      dataset.point.forEach((point) => {
        console.log(
          new Date(
            parseInt(point.startTimeNanos) / 1000000
          ).toLocaleTimeString(),
          "-",
          new Date(parseInt(point.endTimeNanos) / 1000000).toLocaleTimeString(),
          `name: ${point.dataTypeName}, value: `,
          point.value[0].intVal || point.value[0].fpVal || point.value[0].mapVal
        );
      });
    });
  });

  // get sleep data
  // const sleepData = await fitness.users.sessions
  //   .list({
  //     // @ts-ignore
  //     userId: "me",
  //     activityType: 72,
  //     startTime: new Date(now - 172800000),
  //     endTime: new Date(),
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  // sleepData.data.session.forEach((session) => {
  //   console.log(
  //     new Date(parseInt(session.startTimeMillis)).toLocaleDateString(),
  //     new Date(parseInt(session.endTimeMillis)).toLocaleDateString()
  //   );
  //   console.log({ session });
  //   // console.log(session.name, session.description);
  // });
};

main();
