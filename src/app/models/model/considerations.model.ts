export class ConsiderationsModel {
  idConsiderations: number;
  idService: number;
  serviceLineCode: number;
  countryCode: string;
  secAudited: string;
  secSubject: string;
  euAudited: string;
  euSubject: string;
  euAuditedNoValuation: string;
  euSuditedNoTax: string;
  otAudited: string;
  otSubject: string;
  ch1: string;
  ch2: string;
  secAuditedValue: string;
  secSubjectValue: string;
  euAuditedValue: string;
  euSubjectValue: string;
  euAuditedNoValuationValue: string;
  euAuditedNoTaxValue: string;
  otAuditedValue: string;
  otSubjectValue: string;
  ch1Value: string;
  ch2Value: string;
}

export class ConsiderationModel {
  public idIndependence: number;
  public IdService: number;
  public IndependenceName: string;
  public GeneralPrinciples: string;
  public SpecificConsiderations: string;
  public Order: number;
}
