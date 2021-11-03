interface IRanking {
  slug: string;
  thumbanil?: string;
  rank: number;
}

interface IOfferRturnValue {
  offers: IOffer[];
  stats: { totalOffers: number };
}

interface IOffer {
  floorPrice: { amount: number; currency: string };
  tokenId: number;
  name: string;
  offerUrl: string;
  assetContract: string;
}

interface IOptions {
  debug: boolean,
  logs: boolean,
  sort: boolean,
}

declare module "opensea-scraper" {
  export function basicInfo(slug: string): Promise<Record<string, any>>;
  export function rankings(
    nbrOfPages?: string,
    options?: IOptions,
  ): Promise<IRanking[]>;
  export function offers(
    slug: string,
    options?: IOptions,
  ): Promise<IOfferRturnValue>;
  export function offersByUrl(
    url: string,
    options?: IOptions,
  ): Promise<IOfferRturnValue>;
}
