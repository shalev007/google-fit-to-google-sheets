import { format } from "date-fns";
import { GoogleFitDay } from "../Entities/GoogleFitDay";
import { formatInTimeZone } from "date-fns-tz";

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
    formatInTimeZone(
      googleFitDay.from,
      "Asia/Jerusalem",
      "yyyy-MM-dd HH:mm:ss"
    ),
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
  ];
}
