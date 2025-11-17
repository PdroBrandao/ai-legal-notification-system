import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { sheets_v4 } from "googleapis";
import { environment } from "./environment";

export class GoogleSheetsConfig {
  private static instance: GoogleSheetsConfig;
  private auth: GoogleAuth;
  private sheets: sheets_v4.Sheets;

  private constructor() {
    this.auth = null as unknown as GoogleAuth;
    this.sheets = null as unknown as sheets_v4.Sheets;
  }

  private async initialize(): Promise<void> {
    try {
      if (!environment.GOOGLE_CREDENTIALS) {
        throw new Error("GOOGLE_CREDENTIALS não está definido");
      }

      const credentials = JSON.parse(
        Buffer.from(environment.GOOGLE_CREDENTIALS, "base64").toString()
      );

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      this.sheets = google.sheets({
        version: "v4",
        auth: this.auth,
      });
    } catch (error) {
      console.error("Erro ao inicializar Google Sheets:", error);
      throw error;
    }
  }

  public static async getInstance(): Promise<GoogleSheetsConfig> {
    if (!GoogleSheetsConfig.instance) {
      GoogleSheetsConfig.instance = new GoogleSheetsConfig();
      await GoogleSheetsConfig.instance.initialize();
    }
    return GoogleSheetsConfig.instance;
  }

  public getAuth(): GoogleAuth {
    return this.auth;
  }

  public getSheets(): sheets_v4.Sheets {
    return this.sheets;
  }

  public async appendToSheet(
    values: Array<Array<string | number | null>>
  ): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        auth: this.auth,
        spreadsheetId: environment.SPREADSHEET_ID,
        range: "V3.0!A:AD",
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });
    } catch (error) {
      console.error("Erro ao adicionar dados na planilha:", error);
      throw error;
    }
  }
}
