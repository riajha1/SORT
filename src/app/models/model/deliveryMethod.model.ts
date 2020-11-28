export class DeliveryMethodModel {
  idService: number;
  deliveryMethodName: string;
  deliveryMethodDescription: string;
  order: number;
}

export class DeliveryModel {
  public idDeliveryMethod: number;
  public idService: number;
  public deliveryMethodName: string;
  public deliveryMethodDescription: string;
  public readmore: boolean;
}
