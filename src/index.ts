import { Auth } from "googleapis";
import { config } from "dotenv";
import fs from "fs";
import { GoogleSheetsClient } from "./GoogleSheets";
import { GoogleFitClient } from "./GoogleFit";
import { CronJob } from "cron";
import { GoogleFitDay } from "./Entities/GoogleFitDay";
import { startOfYesterday, subDays } from "date-fns";
import { googleFitDayToSheetRow } from "./GoogleSheets/util";

config();

const googleOauth2Client = new Auth.OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

googleOauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const main = async () => {
  const googleSheets = new GoogleSheetsClient(googleOauth2Client);
  const googleFit = new GoogleFitClient(googleOauth2Client);

  const yesterday = startOfYesterday().getTime();
  const theDayBeforeYesterday = subDays(yesterday, 1).getTime();

  const data = await googleFit.getAggregateData(
    theDayBeforeYesterday,
    yesterday
  );

  const googleSheetsValues = [];
  const fitDays = GoogleFitDay.fromAggregateResponse(data);
  for (const fitDay of fitDays) {
    const sleepData = await googleFit.getSleepData(
      fitDay.from.getTime(),
      fitDay.to.getTime()
    );

    fitDay.setSleepDataFromAggregateResponse(sleepData);
    googleSheetsValues.push(googleFitDayToSheetRow(fitDay));
  }

  // console.log all data to json file
  // fs.writeFile("data1.json", JSON.stringify(data, null, 2), (err) => {
  //   if (err) {
  //     console.log(err);
  //   }
  // });

  googleSheets.saveSheetValues(googleSheetsValues);
};

// new CronJob(
//   "0 0 22 * * *",
//   function () {
//     console.log(getCurrentDateTime(new Date()), "A new task has started");
//     main()
//       .then(() => {
//         console.log(
//           getCurrentDateTime(new Date()),
//           "A new task has ended successfully"
//         );
//       })
//       .catch(() => {
//         console.log(
//           getCurrentDateTime(new Date()),
//           "A new task has ended with an error"
//         );
//       })
//       .finally(() => {
//         console.log(getCurrentDateTime(new Date()), "A new task has ended");
//       });
//   },
//   null,
//   true,
//   "Asia/Jerusalem"
// );

main();
