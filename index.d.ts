declare module 'opensea-scraper' {

  export function floorPrice(slug: string): Promise<number|undefined>;
  export function basicInfo(slug: string): Promise<Record<string, any>>;

}
