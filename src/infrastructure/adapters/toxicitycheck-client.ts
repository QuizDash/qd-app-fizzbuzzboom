import { ComprehendClient, DetectToxicContentCommand } from "@aws-sdk/client-comprehend";
import {IToxicityCheckClient} from "../interfaces/toxicitycheck-client.interface";
import {injectable} from 'inversify';

@injectable()
export class ToxicityCheckClient implements IToxicityCheckClient {
  private client = new ComprehendClient();

  constructor() {

  }

  async detectToxicity(text: string): Promise<any>   {
    const command = new DetectToxicContentCommand({
      LanguageCode: "en",
      TextSegments: [{Text: text}],
    });

    const response = await this.client.send(command);
    console.debug("Toxicity Detection Results:", response.ResultList);
    return response

  }
}
