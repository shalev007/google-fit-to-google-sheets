import { Auth, google, sheets_v4 } from "googleapis";
import fs from "fs";
import { SHEET_HEADERS } from "./util";

const SHEET_NAME = "GoogleFitToGoogleSheets";
const SPREADSHEET_STATE_FILE = "spreadsheet.json";

export class GoogleSheetsClient {
  private readonly client: sheets_v4.Sheets;
  private _spreadsheetId: string = process.env.GOOGLE_SHEET_ID ?? "";

  constructor(authClient: Auth.OAuth2Client) {
    this.client = google.sheets({
      version: "v4",
      auth: authClient,
    });
  }

  public async getLastRowDate(): Promise<Date | null> {
    const spreadsheetId = await this.getSpreadsheetId();
    const range = "A2:A";
    const response = await this.client.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values ?? [];
    if (values.length === 0) {
      return null;
    }

    const lastRow = values[values.length - 1];
    return new Date(lastRow[0]);
  }

  public async saveSheetValues(data: any[][]): Promise<void> {
    const spreadsheetId = await this.getSpreadsheetId();
    const range = "A1";
    await this.client.spreadsheets.values.append({
      spreadsheetId,
      range: range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: data,
      },
    });
  }

  public async getSpreadsheetId(): Promise<string> {
    if (this._spreadsheetId) {
      return this._spreadsheetId;
    }

    // create spreadsheet if it doesn't exist
    if (!fs.existsSync(SPREADSHEET_STATE_FILE)) {
      await this.createSheet();
      fs.writeFileSync(
        SPREADSHEET_STATE_FILE,
        JSON.stringify({ spreadsheetId: this._spreadsheetId })
      );
      return this._spreadsheetId;
    }

    // read spreadsheet id from file
    const data = fs.readFileSync(SPREADSHEET_STATE_FILE, "utf8");
    const spreadsheet = JSON.parse(data);
    this._spreadsheetId = spreadsheet.spreadsheetId;
    return this._spreadsheetId;
  }

  private async createSheet(): Promise<void> {
    const createResponse = await this.client.spreadsheets.create({
      requestBody: {
        properties: {
          title: SHEET_NAME,
        },
      },
    });

    this._spreadsheetId = createResponse.data.spreadsheetId ?? "";
    this.saveSheetValues([SHEET_HEADERS]);
  }
}
