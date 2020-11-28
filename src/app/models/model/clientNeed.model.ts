export class ClientNeedModel {
  idClientNeed: number;
  clientNeedName: string;
  clientNeedDescription: string;
}

export class ClientFilter {
  parent?: any;
  id: string;
  label: string;
  selected: boolean;
}
