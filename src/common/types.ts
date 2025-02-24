export interface IndexerConfig {
  eventKeys: string[];
  handler: (data: any) => Promise<void>;
}
