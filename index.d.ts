interface IRanking {
  slug: string;
  thumbanil?: string;
  rank: number;
}

interface IOffer {
  floorPrice: { amount: number; currency: string };
  tokenId: number;
  tokenName: string;
  offerUrl: string;
}

declare module "opensea-scraper" {
  export function basicInfo(slug: string): Promise<Record<string, any>>;
  export function floorPrice(
    slug: string,
    mode?: string
  ): Promise<number | undefined>;
  export function floorPriceByUrl(
    slug: string,
    mode?: string
  ): Promise<number | undefined>;
  export function rankings(nPages?: string, mode?: string): Promise<IRanking[]>;
  export function offers(
    nPages?: string,
    resultSize?: number,
    mode?: string
  ): Promise<IOffer[]>;
  export function offersByUrl(
    url: string,
    resultSize?: number,
    mode?: string
  ): Promise<IOffer[]>;
}
