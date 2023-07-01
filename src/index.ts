import { Auth } from "googleapis";
import { config } from "dotenv";
import { GoogleSheetsClient } from "./GoogleSheets";
import { GoogleFitClient } from "./GoogleFit";
import { GoogleFitDay } from "./Entities/GoogleFitDay";
import { addDays, isBefore, min, startOfYesterday, subDays } from "date-fns";
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
  const theDayBeforeYesterday = subDays(yesterday, 1);

  let lastRowDate = await googleSheets.getLastRowDate();
  if (lastRowDate && isBefore(lastRowDate, theDayBeforeYesterday)) {
    lastRowDate = addDays(lastRowDate, 1);
  }

  // If there is no last row date, we start from the day before yesterday
  const startDate: Date = min([
    lastRowDate ?? new Date(),
    theDayBeforeYesterday,
  ]);

  const data = await googleFit.getAggregateData(startDate.getTime(), yesterday);

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

  googleSheets.saveSheetValues(googleSheetsValues).then(() => {
    console.log("Saved to Google Sheets!");
  });
};

main();
