declare module 'opensea-scraper' {

  export function floorPrice(slug: string): number|undefined;
  export function basicInfo(slug: string): Record<string, any>;

}
