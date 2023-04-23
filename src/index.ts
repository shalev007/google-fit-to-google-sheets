import { Auth, GoogleApis, fitness_v1 } from "googleapis";
// import { Schema$AggregateResponse } from "googleapis/build/src/apis/fitness/v1";
import { config } from "dotenv";
import fs from "fs";

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

  const now = new Date().getTime();
  const oneDayAgo = new Date(now - 86400000).getTime();
  const anHourAgo = new Date(now - 3600000).getTime();
  // a week ago
  const aWeekAgo = new Date(now - 604800000).getTime();
  const twoDaysAgo = new Date(now - 172800000).getTime();

  const data = await fitness.users.dataset.aggregate({
    // @ts-ignore
    userId: "me",
    requestBody: {
      aggregateBy: [
        {
          dataTypeName: "com.google.step_count.delta",
          dataSourceId:
            "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
        },
      ],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: twoDaysAgo,
      endTimeMillis: now,
    },
  });

  // print response to json file
  console.log(JSON.stringify(data.data, null, 2));
  fs.writeFile("data.json", JSON.stringify(data.data, null, 2), (err) => {
    if (err) {
      console.log(err);
    }
  });
};

main();
