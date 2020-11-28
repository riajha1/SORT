export class SubServiceLineModel {
  idSubServiceCode: string;
  subServiceLineName: string;
  serviceLineCode: string;
}

export class SubserviceLineFilter {
  parent?: any;
  id: string;
  label: string;
  selected: boolean;
  splitlabel: string;
}

export class SubserviceLineOptions {
  name: string;
  value: any;
  prefix: string;
  selected: boolean;
  total?: number;
  dependency?: any;
}
