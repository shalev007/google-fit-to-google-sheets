import { Auth, GoogleApis, fitness_v1 } from "googleapis";
// import { Schema$AggregateResponse } from "googleapis/build/src/apis/fitness/v1";
import { config } from "dotenv";
import fs from "fs";
import { GoogleSheetsAdapter } from "./GoogleSheets";
import { GoogleFitAdapter } from "./GoogleFit";

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
  const googleFit = new GoogleFitAdapter(googleOauth2Client);

  const aggregateBy = [
    { dataTypeName: "com.google.step_count.delta" },
    { dataTypeName: "com.google.calories.expended" },
    { dataTypeName: "com.google.distance.delta" },
    { dataTypeName: "com.google.heart_rate.bpm" },
    { dataTypeName: "com.google.weight" },
    { dataTypeName: "com.google.height" },
    { dataTypeName: "com.google.body.fat.percentage" },
    { dataTypeName: "com.google.activity.segment" },
    // { dataTypeName: "com.google.sleep.segment" },
  ];

  const now1 = new Date().getTime();
  const oneDayAgo1 = new Date(now1 - 86400000).getTime();
  // const twoDaysAgo = new Date(now - 172800000).getTime();

  const data1 = await googleFit.getAggregateData(aggregateBy, oneDayAgo1, now1);

  console.log({ data1 });
  // console.log all data to json file
  fs.writeFile("data1.json", JSON.stringify(data1, null, 2), (err) => {
    if (err) {
      console.log(err);
    }
  });

  return;
};

main();
