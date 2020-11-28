
export class Client {
    public GISId: number;
    public MDMId: any;
    public gfisid: any;
    public ClientName: string;
    public favorite: boolean;
    public url: string;
}
export class FilterObject {
  serviceLine: Array<string>;
  client: Client;
  searchString: string;
}

export class FilterNodeParent {
  id: string;
  dbname?: string;
  label?: string;
  children?: FilterNode[];
}

export class FilterNode {
  id?: string;
  parent?: number;
  label?: string;
  subparent?: string;
  selected?: boolean;
}

// model location tree
export class LocationFilterNode {
  label?: string;
  name: string;
  selected: boolean;
  children?: LocationFilterNode[];
}

export class  LocationFiltreChildNode {
  expandable: boolean;
  name: string;
  level: number;
  selected: boolean;
}

// model Local tree publish

export class LocationFilterPublishNode {
  label?: string;
  name: string;
  selected: boolean;
  children?: LocationFilterNode[];
  RIL?: boolean;
  RSQL?: boolean;
  status?: string;
  enable?: boolean;
  id?: any;
  update?: any;
  create?: any;
}

export class  LocationFiltrePublishChildNode {
  expandable: boolean;
  name: string;
  level: number;
  selected: boolean;
  RIL?: boolean;
  RSQL?: boolean;
  status?: string;
  enable?: boolean;
  id?: any;
  update?: any;
  create?: any;
}

// model Local tree Independence consideration and Service line guidance
export class LocationFilterTextareaNode {
  label?: string;
  name: string;
  selected: boolean;
  text?: string;
  children?: LocationFilterNode[];
  id?: number;
}

export class  LocationFiltreTextareaChildNode {
  expandable: boolean;
  name: string;
  level: number;
  selected: boolean;
  text?: string;
  id?: number;
}

// Model local Tree permissibility
export class Permissibilitygetmodel {
  SecauditedValue: any;
  SecsubjectValue: any;
  EuauditedValue: string;
  EusubjectValue: string;
  EuAuditedNoValuationValue: string;
  OtAuditedValue: string;
  OtSubjectValue: string;
  Ch1Value: string;
  Ch1NsaValue: string;
  Ch2Value: string;
  deviationSecauditedValue: any;
  deviationSecsubjectValue: any;
  deviationEuauditedValue: any;
  deviationEusubjectValue: any;
  deviationEuAuditedNoValuationValue: any;
  deviationOtAuditedValue: any;
  deviationOtSubjectValue: any;
  deviationCh1Value: any;
  deviationCh1NsaValue: any;
  deviationCh2Value: any;
}

export class  LocationFiltreDropdownChildNode {
  expandable: boolean;
  name: string;
  level: number;
  selected: boolean;
  permissibility?: Permissibilitygetmodel;
  permissibilityGlobal?: Permissibilitygetmodel;
  id?: number;
  deviation?: boolean;
}

export class LocationFilterDropdownNode {
  label?: string;
  name: string;
  selected: boolean;
  permissibility?: Permissibilitygetmodel;
  permissibilityGlobal?: Permissibilitygetmodel;
  children?: LocationFilterNode[];
  id?: number;
  deviation?: boolean;
}
export class  LocationFiltreBoxChildNode {
  expandable: boolean;
  name: string;
  level: number;
  selected: boolean;
  permissibility?: PermissibilitygetmodelBox;
  permissibilityGlobal?: PermissibilitygetmodelBox;
  id?: number;
  deviation?: boolean;
}

export class LocationFilterNodeBox {
  label?: string;
  name: string;
  selected: boolean;
  permissibility?: PermissibilitygetmodelBox;
  permissibilityGlobal?: PermissibilitygetmodelBox;
  children?: LocationFilterNode[];
  id?: number;
  deviation?: boolean;
}

export class PermissibilitygetmodelBox {
  SecauditedValue: any;
  SecsubjectValue: any;
  EuauditedValue: string;
  EusubjectValue: string;
  EuAuditedNoValuationValue: string;
  OtAuditedValue: string;
  OtSubjectValue: string;
  Ch1Value: string;
  Ch1NsaValue: string;
  Ch2Value: string;
  deviationSecauditedValue: any;
  deviationSecsubjectValue: any;
  deviationEuauditedValue: any;
  deviationEusubjectValue: any;
  deviationEuAuditedNoValuationValue: any;
  deviationOtAuditedValue: any;
  deviationOtSubjectValue: any;
  deviationCh1Value: any;
  deviationCh1NsaValue: any;
  deviationCh2Value: any;
  SecauditedHighlight: any;
  SecsubjectHighlight: any;
  EuauditedHighlight: any;
  EusubjectHighlight: any;
  EuAuditedNoValuationHighlight: any;
  OtAuditedHighlight: any;
  OtSubjectHighlight: any;
  Ch1Highlight: any;
  Ch1NsaHighlight: any;
  Ch2Highlight: any;
}

// Model Local Tree Solution
export class SolutionContactgetmodel {
  IdService: number;
  IdContacts: any;
  IdSolutionContacts: any;
  Name: string;
  Title: string;
  Mail: string;
  Url: string;
  Location: string;
  Order: number;
  IdserviceCountry: any;
  countryCode: string;
  region: string;
  isLocal: boolean;
}

export class  LocationFiltreModalSolutionChildNode {
  expandable: boolean;
  name: any;
  level: number;
  selected: boolean;
  contact?: Array<SolutionContactgetmodel>;
}

export class LocationFilterModalSolutionNode {
  label?: string;
  name: string;
  selected: boolean;
  contact?: Array<SolutionContactgetmodel>;
  children?: LocationFiltreModalSolutionChildNode[];
}

// Model Local Tree Quality
export class QualityContactgetmodel {
  IdService: number;
  IdContacts: any;
  IdQualityContact: any;
  Name: string;
  Title: string;
  Mail: string;
  Url: string;
  Location: string;
  Order: number;
  IdserviceCountry: any;
  countryCode: string;
  region: string;
  isLocal: boolean;
}
export class  LocationFiltreModalQualityChildNode {
  expandable: boolean;
  name: any;
  level: number;
  selected: boolean;
  contact?: Array<QualityContactgetmodel>;
}

export class LocationFilterModalQualityNode {
  label?: string;
  name: string;
  selected: boolean;
  contact?: Array<QualityContactgetmodel>;
  children?: LocationFiltreModalQualityChildNode[];
}


