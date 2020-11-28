export class CompentencyDomainModel {
  idCompentencyDomain: any;
  idSubServiceCode: string;
  competencyDomainName: string;
}

export class CompetencyFilter {
  parent?: any;
  subparent: string;
  id: string;
  label: string;
  selected: boolean;
}
