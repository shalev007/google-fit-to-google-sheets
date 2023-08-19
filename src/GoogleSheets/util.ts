import { GoogleFitDay, UNKNOWN_DATE } from "../Entities/GoogleFitDay";
import { formatDateWithTimezome } from "../util";

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
    formatDateWithTimezome(googleFitDay.from),
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
    googleFitDay.wentToSleepAt !== UNKNOWN_DATE
      ? formatDateWithTimezome(googleFitDay.wentToSleepAt, "HH:mm:ss")
      : UNKNOWN_DATE,
    googleFitDay.wokeUpAt !== UNKNOWN_DATE
      ? formatDateWithTimezome(googleFitDay.wokeUpAt, "HH:mm:ss")
      : UNKNOWN_DATE,
  ];
}
