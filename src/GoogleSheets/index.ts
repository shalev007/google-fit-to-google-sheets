import { Auth, google, sheets_v4 } from "googleapis";
import fs from "fs";

const SHEET_NAME = "Sheet1";
const SPREADSHEET_STATE_FILE = "spreadsheet.json";

export class GoogleSheetsAdapter {
  private readonly client: sheets_v4.Sheets;
  private _spreadsheetId: string = "";

  constructor(authClient: Auth.OAuth2Client) {
    this.client = google.sheets({
      version: "v4",
      auth: authClient,
    });
  }

  public async saveSheetValues(data: any[][]): Promise<void> {
    const spreadsheetId = await this.getSpreadsheetId();
    const range = "A1";
    const response = await this.client.spreadsheets.values.append({
      spreadsheetId,
      range: range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: data,
      },
    });

    console.log({ response });
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
  }
}
