interface IRanking {
  name: string;
  slug: string;
  logo: string;
  isVerified: boolean;
  floorPrice: { amount: number; currency: string };
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
    type?: string,
    chain?: string,
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
