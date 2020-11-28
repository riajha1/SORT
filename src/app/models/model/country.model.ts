export class CountryModel {
    countryCode: string;
    countryName?: string;
    region?: string;
    area?: string;
    active?: boolean;
}
export class CountryLocationModel {
    countryCode: string;
    IsSelectedArea: boolean;
    IsSelectedRegion: boolean;
    IsSelectedCountry: boolean;
    IsGlobal: boolean;
}
