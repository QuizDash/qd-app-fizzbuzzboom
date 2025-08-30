export interface IToxicityCheckClient {
  detectToxicity(text: string): Promise<any>
}
