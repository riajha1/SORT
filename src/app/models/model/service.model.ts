import { IsqmModel,
        IndependenceModel,
        SolutionContactModel,
        ConsiderationModel,
        QualityContactsModel,
        IndependenceContactModel,
        ConflictsDeliveryMethodModel,
        GfisModel,
        MercuryModel,
        EyTechnologyModel,
        DeliveryModel,
        ConflictModel
     } from '../model.index';

export class PreviewService {
    Id: number;
    Name: string;
    HeadLineDescription: string;
    IdCompetencyDomain: Array<any>;
    IdService: number;
    IdClientNeed: Array<any>;
    IdSolution: Array<any>;
    IdSector: Array<any>;
    IdSubServiceCode: Array<any>;
    ServiceLineCode: Array<any>;
    location?: Array<any>;
    disable?: boolean;
    prefix?: any;
    IdFop?: Array<any>;
    IsGlobal?: boolean;
    independenceRestrictions?: any;
    independenceRestrictionslabel?: any;
    mixRestrictions?: string;
}
export class AutocompleteService {
    idService: number;
    name: string;
    prefix: string;
    code?: any;
}
export class HeaderModel {
    public title: string;
    public headline: string;
    public description: string;
    public collateral: string;
    public readmore: boolean;
    public financeText: any;
}
export class BusinessModel {
    public idBusinessContent: number;
    public idService: number;
    public guidanceEytechnology: string;
    public qualityConsiderations: string;
    public readmoreQuality: boolean;
    public activityGrid: string;
    public qualityConsiderationLocal: string;
    public qualityConsiderationGlobal: string;
}
export class BreadcrumbModel {
    public sl: Array<string>;
    public competency: Array<string>;
    public ssl: Array<string>;
    public sslshort: Array<string>;
    public solution: Array<string>;
    public sector: Array<string>;
    public client: Array<string>;
    public filter: Array<string>;
}
export class ServiceviewModel {
    header: HeaderModel;
    restriction: Array<any>;
    delivery: Array<DeliveryModel>;
    considerations: Array<ConsiderationModel>;
    business: BusinessModel;
    conflicts: ConflictModel;
    independece: IndependenceModel;
    contactsl: Array<SolutionContactModel>;
    contactQuality: Array<QualityContactsModel>;
    contactIndependece: Array<IndependenceContactModel>;
    isqm: IsqmModel;
    breadcrumb: BreadcrumbModel;
    conflictsDelivery: Array<ConflictsDeliveryMethodModel>;
    gfis: Array<GfisModel>;
    mercury: Array<MercuryModel>;
    technology: Array<EyTechnologyModel>;
}

export class ServiceModel {
    IdService: number;
    Name: string;
    IsGlobal: boolean;
    CreationDate: string;
    ModificationDate: string;
    IdServiceStatus: number;
    Status: string;
    IdServiceParent: number;
    Version: number;
    DuplicateActive: boolean;
    FirstIdServiceParent: number;
}

