import { Injectable } from '@angular/core';
import { FilterNodeParent } from 'src/app/models/model.index';

@Injectable()
export class LeftHandFilterService {
    public FilterTree: FilterNodeParent [] = [
        {
          id: 'SSL',
          dbname: 'SubServiceLine',
          label: 'Sub Service Line',
          children: []
        },
        {
          id: 'competency',
          dbname: 'CompetencyDomain',
          label: 'Competency/Domain',
          children: []
        },
        {
          id: 'SSL2',
          dbname: 'Solution',
          label: 'Solution',
          children: []
        },
        {
          id: 'fop',
          dbname: 'FieldOfPlay',
          label: 'Field of Play',
          children: []
        },
        {
          id: 'sector',
          dbname: 'Sector',
          label: 'Sector',
          children: []
        },
        {
          id: 'clientNeed',
          dbname: 'ClientNeed',
          label: 'Client Need',
          children: []
        }
      ];
    constructor() {}
}
