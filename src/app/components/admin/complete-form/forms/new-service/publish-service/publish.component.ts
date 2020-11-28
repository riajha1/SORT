import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss']
})
export class PublishComponent implements OnInit, OnChanges {
  // Input and Output
  @Input() active: any;
  @Input() IdService: any = 0;
  @Input() basicData: any = [];
  @Input() progress: string = '0';
  @Input() tree: any[] = [];
  @Input() locationsSaved: any = [];
  @Input() enableLocal: boolean = false;
  @Input() countryList: Array<any> = [];
  @Input() published: Array<any> = [];

  // component variables
  loading: boolean = true;
  nodesPublish: any = [];
  scrollbarOptions = { axis: 'y', theme: 'dark-3'};

  constructor() { }

  ngOnInit() {
    this.loading = false;
  }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'published': { // Get service line guidance object from database
            if (this.published.length > 0 && this.countryList.length > 0) {
              this.initializeVariablesLocal(this.published);
            }
            break;
          }
          case 'countryList': {
            if (this.countryList.length > 0) {
              this.initializeVariablesLocal(this.published);
            }
            break;
        }
        }
      }
    }
  }
  initializeVariablesLocal(locations) {
    const listOfLocations = locations;
    if (this.countryList.length > 0) { // Local piece
      if (listOfLocations.length > 0) {
        listOfLocations.map(item => {
          if (this.countryList.filter(c => c.countryCode === item.name && item.name !== 'GLB').length > 0) { // Tree use full name of country, Database only send countryCode, replace countryCode with countryName in name variable
            item.name = this.countryList.filter(c => c.countryCode === item.name)[0].countryName;
          }
        });
        this.nodesPublish = listOfLocations;
      }
    }
  }

  getPublishByNode(node) { // Function to get independence considerations in local tree
    const condition = this.nodesPublish.filter(e => e.level === node.level && e.name === node.name);
    if (condition.length === 0) {
      this.nodesPublish.push(node); // new node to store
    }
  }
}
