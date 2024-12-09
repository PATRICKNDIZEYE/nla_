export interface IStat {
  _id: string;
  count: number;
}

export interface IAnalytics {
  allclaimscount: number;
  allclaimsbystatus: IStat[];
  allclaimsbylevel: IStat[];
  allclaimsbycategory: IStat[];
  allclaimsbyassignee: IStat[];
  allappealsbycreatedat: IStat[];
}
