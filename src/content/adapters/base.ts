export abstract class SiteAdapter {
  abstract name: string;
  abstract matchUrl(url: string): boolean;
  abstract getProblemTitle(): string | null;
  abstract isSuccessState(): boolean;
  
  // NEW: Optional method to get tags
  getProblemTags(): string[] {
    return [];
  }
}