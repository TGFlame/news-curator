export function loadSeedConfig(): Promise<any>
export function crawlSeedPage(seedUrl: string, category: string, config: any, visitedUrls: Set<string>): Promise<string[]>
export function crawlArticle(url: string, category: string, config: any): Promise<any>
export function crawlHandler(): Promise<void>