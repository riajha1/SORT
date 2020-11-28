export class FieldOfPlayModel {
    IdFop: number;
    FopName: string;
    Date: any;
    Order: number;
    Active: boolean;
}

export class FieldOfPlayFilter {
    parent?: any;
    id: string;
    label: string;
    selected: boolean;
  }
