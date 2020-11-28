import { ConflictsDeliveryMethodModel } from './conflictsDeliveryMethod.model';
import { ConflictsModel } from './conflicts.model';
import { DeliveryMethodModel } from './deliveryMethod.model';
import { ConsiderationsModel } from 'src/app/models/model/considerations.model';
import { IndependenceConsiderationModel } from './independenceConsiderations.model';
import { MercuryCodesModel } from './mercuryCode.model';
import { CompentencyDomainModel } from './competencyDomain.model';
import { SubServiceLineModel } from './subServiceLine.model';
import { GfisCodesModel } from './gfisCode.model';
import { SolutionModel } from './solution.model';
import { SectorModel } from './sector.model';
import { ClientNeedModel } from './clientNeed.model';
import { SolutionContactModel } from './solutionContact.model';
import { QualityContactsModel } from './qualityContacts.model';
import { TechnologyGuidanceModel } from './technologyGuidance.model';
import { IsqmModel } from './isqm.model';
import { CountryModel } from './country.model';


export class ServiceInsertModel {
  title: string;
  serviceLine: string;
  subServiceLine: Array<SubServiceLineModel>;
  competencyDomain: Array<CompentencyDomainModel>;
  gfisCodes: Array<GfisCodesModel>;
  mercuryCodes: Array<MercuryCodesModel>;
  financeCodeFreeText: string;
  solution: Array<SolutionModel>;
  sector: Array<SectorModel>;
  clientNeed: Array<ClientNeedModel>;
  headlineDescription: string; // begin
  description: string; // Metadata insert
  serviceLineCollateral: string; // end
  deliveryMethod: Array<DeliveryMethodModel>;
  solutionContacts: Array<SolutionContactModel>; // Update Model to  handle is Local or Global
  eyTechnologyInvolved: string; // begin
  guidanceEYTechnology: string;
  technologyGuidance: Array<TechnologyGuidanceModel>;
  qualityConsiderations: string;
  activityGrid: string; // BusinessContent
  qualityConsiderationsLocal: string;
  qualityConsiderationsGlobal: string; // End
  qualityContacts: Array<QualityContactsModel>;
  considerations: ConsiderationsModel;
  independenceConsiderations: Array<IndependenceConsiderationModel>;
  conflicts: ConflictsModel;
  conflictsDeliveryMethod: Array<ConflictsDeliveryMethodModel>;
  isqm: IsqmModel;
  locationsOfferings: Array<CountryModel>;

}
