import { Auth, fitness_v1 } from "googleapis";
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

main();
