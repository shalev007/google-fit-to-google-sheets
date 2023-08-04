import { GoogleFitDay } from "../Entities/GoogleFitDay";
import { customDateFormat } from "../util";

export const SHEET_HEADERS = [
  "Date",
  "Steps",
  "Average Heart Rate",
  "Max Heart Rate",
  "Min Heart Rate",
  "Distance",
  "Calories",
  "Sleep Hours",
  "Sleep Awake Hours",
  "Sleep Deep Hours",
  "Sleep REM Hours",
];

export function googleFitDayToSheetRow(googleFitDay: GoogleFitDay) {
  return [
    customDateFormat(googleFitDay.from),
    googleFitDay.stepCount,
    googleFitDay.averageHeartRate,
    googleFitDay.maxHeartRate,
    googleFitDay.minHeartRate,
    googleFitDay.distance,
    googleFitDay.calories,
    googleFitDay.sleepHours,
    googleFitDay.sleepAwakeHours,
    googleFitDay.sleepDeepHours,
    googleFitDay.sleepRemHours,
    customDateFormat(googleFitDay.wentToSleepAt),
    customDateFormat(googleFitDay.wokeUpAt),
  ];
}
