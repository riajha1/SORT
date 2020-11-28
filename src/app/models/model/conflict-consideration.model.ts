export class StandardTextModel {
    IdConflicts?: number;
    ConflictsDescription: string;
    ConflictsName: string;
}

export class OrderModel {
    IdDeliveryMethod: number;
    IdService: number;
    DeliveryMethodName: string;
    DeliveryMethodDescription: string;
    IsDeliveryMethod: any;
    Order: number;
}
