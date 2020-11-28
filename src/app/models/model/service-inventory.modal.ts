export interface ServiceInventoryModel {
  id: number;
  name: string;
  column: string
}

export interface PendingSelection {
  [key: number]: boolean;
}

export interface AdditionalFilterItems {
  id: number;
  name: string;
}

let id = 0;
export var serviceinventorylist: ServiceInventoryModel[] = [
  { id: ++id, name: 'Service Title', column: 'L.Name' },
  { id: ++id, name: 'Origin of Service', column: 'C.OriginofService' },
  { id: ++id, name: 'Location', column: 'L.CountryName' },
  { id: ++id, name: 'Solution', column: 'C.SolutionDescription' },
  { id: ++id, name: 'Field of Play', column: 'C.FopName' },
  { id: ++id, name: 'Sector', column: 'C.SectorName' },
  { id: ++id, name: 'Client Need', column: 'C.ClientNeedName' },
  { id: ++id, name: 'Headline Description', column: 'C.HeadLineDescription' },
  { id: ++id, name: 'Full Description', column: 'C.Description' },
  { id: ++id, name: 'Service Line Collateral', column: 'C.ServiceLineCollateral' },
  { id: ++id, name: 'MSC Mercury Code', column: 'C.MSCMercuryCode' },
  { id: ++id, name: 'GFIS Code', column: 'C.GFISCode' },
  { id: ++id, name: 'SORT ID', column: 'C.IdService' },
  { id: ++id, name: 'Activity Grid', column: 'C.ActivityGrid' },
  { id: ++id, name: 'Form of Delivery', column: 'C.FormofDelivery' },
  { id: ++id, name: 'Independence Restrictions', column: "' '" },
  { id: ++id, name: 'Global Independence Considerations', column: 'C.GlobalIndependenceConsiderations' },
  { id: ++id, name: 'Global SL Guidance', column: 'C.GlobalSLGuidance' },
  { id: ++id, name: 'Global Business Contacts', column: 'C.GlobalBusinessContacts' },
  { id: ++id, name: 'Global Quality/Independence Contacts', column: 'C.GlobalQualityContacts' },
  { id: ++id, name: 'Conflict Check Required?', column: 'C.ConflictCheckRequired' },
  { id: ++id, name: 'Conflict Considerations specific for this service', column: 'C.Guidance' },
  { id: ++id, name: 'Conflict Form of Delivery specific guidance', column: 'C.FormofDeliveryGuidance' },
  { id: ++id, name: 'EY Technology', column: 'C.EYTechnology' },
  { id: ++id, name: 'EY Technology - overall guidance', column: 'C.GuidanceEYTechnology' },
  { id: ++id, name: 'Subject to ISQM1', column: 'C.SubjecttoISQM1' },
  { id: ++id, name: 'ISQM Guidance', column: 'C.ISQMguidance' },
  { id: ++id, name: 'Data Processor - Processor of data from Other section of the SAM', column: 'C.DataProcessor' },
  { id: ++id, name: 'Data Processor Guidance', column: 'C.DataProcessorGuidance' },
  { id: ++id, name: 'Launched', column: 'C.Launched' },
  { id: ++id, name: 'Last Updated', column: 'C.ModificationDate' },
  { id: ++id, name: 'Versioning ID', column: 'C.IdServiceParent' },
  { id: ++id, name: 'Service Hierarchy Alignment Exception', column: "''" }
];
