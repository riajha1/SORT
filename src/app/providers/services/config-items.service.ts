import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/internal/operators/map';
import { Subject } from 'rxjs/internal/Subject';
import { tap } from 'rxjs/internal/operators/tap';

@Injectable()
export class ConfigItemsService {

  tokenRelationChanged = new Subject<any[]>();
  public tokenRelation: any[] = [];

    public months = {
        0: 'Jan',
        1: 'Feb',
        2: 'Mar',
        3: 'Apr',
        4: 'May',
        5: 'Jun',
        6: 'Jul',
        7: 'Aug',
        8: 'Sep',
        9: 'Oct',
        10: 'Nov',
        11: 'Dec'
      };
    public clients = [
          {
              GISID : 93390710, // facebook
              'US SEC Audited Entity and Down': 'data',
              'US SEC NSA Up and Over': 'data',
              'EU Entity and Up or Down Affiliate with Derogation': '',
              'EU Entity and Up or Down Affiliate no Derogation': '',
              'EU Entity and Up or Down Affiliate': '',
              'EU NSA non-EU up and any over affiliates': 'data',
              'Other Channel 1 Listed PIE and Affiliates w similar restrictions': '',
              'Other Channel 1 Listed PIE Other Affiliates': '',
              'Other Channel 1 and Down': 'data',
              'Other Channel 1 NSA Up and Over': '',
              'Channel 2':  '',
              'UK PIE/OEPI Ch1':  '',
              'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': ''
          },
          {
            GISID : 15400614, // Facebook, Inc.
            'US SEC Audited Entity and Down': 'data',
            'US SEC NSA Up and Over': '',
            'EU Entity and Up or Down Affiliate with Derogation': '',
            'EU Entity and Up or Down Affiliate no Derogation': '',
            'EU Entity and Up or Down Affiliate': '',
            'EU NSA non-EU up and any over affiliates': '',
            'Other Channel 1 Listed PIE and Affiliates w similar restrictions': '',
            'Other Channel 1 Listed PIE Other Affiliates': '',
            'Other Channel 1 and Down': '',
            'Other Channel 1 NSA Up and Over': '',
            'Channel 2':  '',
            'UK PIE/OEPI Ch1':  '',
            'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': ''
        },
        {
          GISID : 465441, // Morgan Stanley
          'US SEC Audited Entity and Down': '',
          'US SEC NSA Up and Over': 'data',
          'EU Entity and Up or Down Affiliate with Derogation': '',
          'EU Entity and Up or Down Affiliate no Derogation': '',
          'EU Entity and Up or Down Affiliate': '',
          'EU NSA non-EU up and any over affiliates': '',
          'Other Channel 1 Listed PIE and Affiliates w similar restrictions': '',
          'Other Channel 1 Listed PIE Other Affiliates': '',
          'Other Channel 1 and Down': '',
          'Other Channel 1 NSA Up and Over': '',
          'Channel 2':  '',
          'UK PIE/OEPI Ch1':  '',
          'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': ''
      },
      {
        GISID : 17586844 , // Suez
        'US SEC Audited Entity and Down': '',
        'US SEC NSA Up and Over': '',
        'EU Entity and Up or Down Affiliate with Derogation': '',
        'EU Entity and Up or Down Affiliate no Derogation': 'data',
        'EU Entity and Up or Down Affiliate': 'data',
        'EU NSA non-EU up and any over affiliates': '',
        'Other Channel 1 Listed PIE and Affiliates w similar restrictions': '',
        'Other Channel 1 Listed PIE Other Affiliates': '',
        'Other Channel 1 and Down': '',
        'Other Channel 1 NSA Up and Over': '',
        'Channel 2':  '',
        'UK PIE/OEPI Ch1':  '',
        'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': ''
    },
    {
      GISID : 405933 , // Nissan Motor Co., Ltd.
      'US SEC Audited Entity and Down': 'data',
      'US SEC NSA Up and Over': '',
      'EU Entity and Up or Down Affiliate with Derogation': '',
      'EU Entity and Up or Down Affiliate no Derogation': '',
      'EU Entity and Up or Down Affiliate': '',
      'EU NSA non-EU up and any over affiliates': 'data',
      'Other Channel 1 Listed PIE and Affiliates w similar restrictions': 'data',
      'Other Channel 1 Listed PIE Other Affiliates': '',
      'Other Channel 1 and Down': '',
      'Other Channel 1 NSA Up and Over': '',
      'Channel 2':  '',
      'UK PIE/OEPI Ch1':  '',
      'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': ''
    },
    {
      GISID : 11004636 , // Gulf International Bank B.S.C.
      'US SEC Audited Entity and Down': '',
      'US SEC NSA Up and Over': '',
      'EU Entity and Up or Down Affiliate with Derogation': '',
      'EU Entity and Up or Down Affiliate no Derogation': '',
      'EU Entity and Up or Down Affiliate': '',
      'EU NSA non-EU up and any over affiliates': '',
      'Other Channel 1 Listed PIE and Affiliates w similar restrictions': 'data',
      'Other Channel 1 Listed PIE Other Affiliates': '',
      'Other Channel 1 and Down': '',
      'Other Channel 1 NSA Up and Over': '',
      'Channel 2':  '',
      'UK PIE/OEPI Ch1':  '',
      'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': ''
  },
  {
    GISID : 390178 , // FCA Italy S.p.A.
    'US SEC Audited Entity and Down': 'data',
    'US SEC NSA Up and Over': '',
    'EU Entity and Up or Down Affiliate with Derogation': '',
    'EU Entity and Up or Down Affiliate no Derogation': 'data',
    'EU Entity and Up or Down Affiliate': '',
    'EU NSA non-EU up and any over affiliates': '',
    'Other Channel 1 Listed PIE and Affiliates w similar restrictions': '',
    'Other Channel 1 Listed PIE Other Affiliates': 'data',
    'Other Channel 1 and Down': '',
    'Other Channel 1 NSA Up and Over': '',
    'Channel 2':  '',
    'UK PIE/OEPI Ch1':  '',
    'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': ''
  },
  {
    GISID : 94555338 , // Southwire Holding Company
    'US SEC Audited Entity and Down': '',
    'US SEC NSA Up and Over': '',
    'EU Entity and Up or Down Affiliate with Derogation': '',
    'EU Entity and Up or Down Affiliate no Derogation': '',
    'EU Entity and Up or Down Affiliate': '',
    'EU NSA non-EU up and any over affiliates': '',
    'Other Channel 1 Listed PIE and Affiliates w similar restrictions': '',
    'Other Channel 1 Listed PIE Other Affiliates': '',
    'Other Channel 1 and Down': 'data',
    'Other Channel 1 NSA Up and Over': '',
    'Channel 2':  '',
    'UK PIE/OEPI Ch1':  '',
    'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': ''
  },
  {
    GISID : 84991 , // Temasek (Holdings) Private Limited
    'US SEC Audited Entity and Down': '',
    'US SEC NSA Up and Over': '',
    'EU Entity and Up or Down Affiliate with Derogation': '',
    'EU Entity and Up or Down Affiliate no Derogation': '',
    'EU Entity and Up or Down Affiliate': '',
    'EU NSA non-EU up and any over affiliates': '',
    'Other Channel 1 Listed PIE and Affiliates w similar restrictions': '',
    'Other Channel 1 Listed PIE Other Affiliates': '',
    'Other Channel 1 and Down': '',
    'Other Channel 1 NSA Up and Over': 'data',
    'Channel 2':  '',
    'UK PIE/OEPI Ch1':  '',
    'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': ''
  },
  {
    GISID : 411779 , // Bank of America Corporationed
    'US SEC Audited Entity and Down': '',
    'US SEC NSA Up and Over': '',
    'EU Entity and Up or Down Affiliate with Derogation': '',
    'EU Entity and Up or Down Affiliate no Derogation': '',
    'EU Entity and Up or Down Affiliate': '',
    'EU NSA non-EU up and any over affiliates': '',
    'Other Channel 1 Listed PIE and Affiliates w similar restrictions': '',
    'Other Channel 1 Listed PIE Other Affiliates': '',
    'Other Channel 1 and Down': '',
    'Other Channel 1 NSA Up and Over': '',
    'Channel 2':  'data',
    'UK PIE/OEPI Ch1':  '',
    'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': ''
  },
  {
          GISID : 11048838, // Stichting Administratiekantoor ASD
          'US SEC Audited Entity and Down': '',
          'US SEC NSA Up and Over': '',
          'EU Entity and Up or Down Affiliate with Derogation': '',
          'EU Entity and Up or Down Affiliate no Derogation': '',
          'EU Entity and Up or Down Affiliate': '',
          'EU NSA non-EU up and any over affiliates': '',
          'Other Channel 1 Listed PIE and Affiliates w similar restrictions': 'data',
          'Other Channel 1 Listed PIE Other Affiliates': '',
          'Other Channel 1 and Down': '',
          'Other Channel 1 NSA Up and Over': 'data',
          'Channel 2':  '',
          'UK PIE/OEPI Ch1':  '',
          'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': ''
      },{
        GISID : 65877718, // Zealand Juliana B.V
        'US SEC Audited Entity and Down': '',
        'US SEC NSA Up and Over': '',
        'EU Entity and Up or Down Affiliate with Derogation': '',
        'EU Entity and Up or Down Affiliate no Derogation': '',
        'EU Entity and Up or Down Affiliate': '',
        'EU NSA non-EU up and any over affiliates': '',
        'Other Channel 1 Listed PIE and Affiliates w similar restrictions': '',
        'Other Channel 1 Listed PIE Other Affiliates': 'data',
        'Other Channel 1 and Down': '',
        'Other Channel 1 NSA Up and Over': '',
        'Channel 2':  '',
        'UK PIE/OEPI Ch1':  '',
        'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': 'data'
      },{
        GISID : 157765, // Veolia UK Ltd.
        'US SEC Audited Entity and Down': '',
        'US SEC NSA Up and Over': '',
        'EU Entity and Up or Down Affiliate with Derogation': '',
        'EU Entity and Up or Down Affiliate no Derogation': 'data',
        'EU Entity and Up or Down Affiliate': 'data',
        'EU NSA non-EU up and any over affiliates': '',
        'Other Channel 1 Listed PIE and Affiliates w similar restrictions': 'data',
        'Other Channel 1 Listed PIE Other Affiliates': '',
        'Other Channel 1 and Down': '',
        'Other Channel 1 NSA Up and Over': '',
        'Channel 2':  '',
        'UK PIE/OEPI Ch1':  'data',
        'UK PIE/OEPI non-UK parent and any sister affiliates (UK or non-UK)': ''
      }
    ];
    constructor(private http: HttpClient) {}
    getQuery(query: string) {
      const url = environment.apiUrl + query;
      const headers = new HttpHeaders({
        Autorization: 'Bearer jsdhkasdj'
      });
      // return this.http.get(url, { headers});
      return this.http.get(url);
    }
    getQueryPost(query: string, data) {
      const url = environment.apiUrl + query;
      const headers = new HttpHeaders({
        Autorization: 'Bearer jsdhkasdj'
      });
      return this.http.post(url, data);
    }
    fetchAdminTable() {
      return this.getQuery('leftfilters').pipe(map((data: any) => JSON.parse(data.value)));
    }
    getTokenRelation() {
      return this.getQuery('TokenRelation').pipe(
      map((data: any) => JSON.parse(data.value)),
      tap(data => this.setTokenRelation(data.Result)));
    }
    setTokenRelation(data) {
      this.tokenRelation = data;
      this.tokenRelationChanged.next(this.tokenRelation);
    }

  getPermissibilityByclient(gisId) {
      const PermissibilityByClient = this.clients.filter(e => e.GISID === gisId); // finding the client
      const columns = [];
      const options = {};
      if (PermissibilityByClient.length > 0) {
        _.forOwn(PermissibilityByClient[0], (value, key) => {
          if (value !== '' && key !== 'GISID') {
            const token = this.tokenRelation.filter(item => item.Token === key);
            if (token.length > 0 ) {
              token.map(e => options[e.Column] = e.PositionHighlight);
            }
          }
          if (value !== '' && key === 'EU Entity and Up or Down Affiliate no Derogation') {
            options['without'] = 2;
          }
          if (value !== '' && key === 'EU Entity and Up or Down Affiliate with Derogation') {
            options['with'] = 1;
          }
          if (value !== '' && key === 'EU Entity and Up or Down Affiliate with Derogation') {
            options['down'] = 1;
          }
        });
        columns.push(options);
      }
      return columns;
    }

    getPermissibilityByClientGIS(gisTokens) {
      const columns = [];
      const options = {};
      if (gisTokens.length > 0) {
        gisTokens.map(e => {
          const token = this.tokenRelation.filter(item => item.Token === e);
          if (token.length > 0) {
            token.map(ele => options[ele.Column] = ele.PositionHighlight);
          }
          if (e === 'EU Entity and Up or Down Affiliate no Derogation') {
            options['without'] = 2;
          }
          if (e === 'EU Entity and Up or Down Affiliate with Derogation') {
            options['with'] = 1;
          }
          if (e === 'EU Entity and Up or Down Affiliate with Derogation') {
            options['down'] = 1;
          }
        });
        columns.push(options);
      }
      return columns;
    }


}
