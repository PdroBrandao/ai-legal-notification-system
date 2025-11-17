import {
  LlmAnalysisResponse,
  JsonValidationResult,
  ChatGPTResponse,
  FeriadoTribunal,
} from "../../types/interfaces";
import { handleJsonResponse } from "../../utils/jsonUtils";
import { environment } from "../../config/environment";
// import { PrismaClient } from "../../generated/prisma";

export class FeriadosService {
  // private db: PrismaClient;

  private feriadosTRT3: FeriadoTribunal[] = [];
  private feriadosTJMG: FeriadoTribunal[] = [];

  constructor() {
    this.feriadosTJMG = [
      { siglaTribunal: "TJMG", data: "2025-01-01T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-01-02T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-01-03T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-01-04T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-01-05T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-01-06T00:00:00Z" },

      { siglaTribunal: "TJMG", data: "2025-03-03T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-03-04T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-03-05T00:00:00Z" },

      { siglaTribunal: "TJMG", data: "2025-04-16T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-04-17T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-04-18T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-04-21T00:00:00Z" },

      { siglaTribunal: "TJMG", data: "2025-05-01T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-05-02T00:00:00Z" },

      { siglaTribunal: "TJMG", data: "2025-09-07T00:00:00Z" },

      { siglaTribunal: "TJMG", data: "2025-10-12T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-10-27T00:00:00Z" },

      { siglaTribunal: "TJMG", data: "2025-11-02T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-11-15T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-11-20T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-11-21T00:00:00Z" },

      { siglaTribunal: "TJMG", data: "2025-12-08T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-12-20T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-12-21T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-12-22T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-12-23T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-12-24T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-12-25T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-12-26T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-12-27T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-12-28T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-12-29T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-12-30T00:00:00Z" },
      { siglaTribunal: "TJMG", data: "2025-12-31T00:00:00Z" },
    ];

    this.feriadosTRT3 = [
      { siglaTribunal: "TRT3", data: "2025-01-01T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-01-02T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-01-03T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-01-04T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-01-05T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-01-06T00:00:00Z" },

      { siglaTribunal: "TRT3", data: "2025-03-03T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-03-04T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-03-05T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-04-16T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-04-17T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-04-18T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-04-19T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-04-20T00:00:00Z" },

      { siglaTribunal: "TRT3", data: "2025-04-21T00:00:00Z" },

      { siglaTribunal: "TRT3", data: "2025-05-01T00:00:00Z" },

      { siglaTribunal: "TRT3", data: "2025-06-19T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-08-14T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-08-15T00:00:00Z" },

      { siglaTribunal: "TRT3", data: "2025-09-07T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-10-12T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-10-31T00:00:00Z" },

      { siglaTribunal: "TRT3", data: "2025-11-01T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-11-02T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-11-15T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-11-20T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-08T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-20T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-21T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-22T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-23T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-24T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-25T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-26T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-27T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-28T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-29T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-30T00:00:00Z" },
      { siglaTribunal: "TRT3", data: "2025-12-31T00:00:00Z" },
    ];
  }
  async obterFeriadosTribunal(siglaTribunal: string): Promise<string[]> {
    try {
      if (siglaTribunal === "TRT3") {
        return this.feriadosTRT3.map((f) => f.data);
      }

      if (siglaTribunal === "TJMG") {
        return this.feriadosTJMG.map((f) => f.data);
      }

      return [];
    } catch (error) {
      console.error("Erro ao obter feriados:", error);
      return [];
    }
  }
}
