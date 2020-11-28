import { Component } from '@angular/core';
import { serviceinventorylist as serviceinventorylist, ServiceInventoryModel, PendingSelection } from '../../../../models/model.index'
import { ServiceInventoryReport } from '../../../../providers/provider.index';

@Component({
  selector: 'app-dual-list-inventory',
  templateUrl: './dual-list-inventory.component.html',
  styleUrls: ['./dual-list-inventory.component.scss']
})
export class DualListInventoryComponent {

  column: ServiceInventoryModel[];
  pendingSelection: PendingSelection; // selecting id and returning boolean value
  selectedListOfColumnInventorys: ServiceInventoryModel[]; // selected data variable
  unselectedListOfColumnInventorys: ServiceInventoryModel[]; // unselected data variable
  showGlobalIndependenceRestrictionsMag: boolean = false;

  constructor(private serviceinventoryreport: ServiceInventoryReport) {
    this.column = serviceinventorylist;
    this.unselectedListOfColumnInventorys = serviceinventorylist;
    this.selectedListOfColumnInventorys = [];
    this.pendingSelection = Object.create(null);
  }

  // add data based on selection of column list
  addToSelectedColumn(data?: ServiceInventoryModel): void {
    var changeColumnList = (data) ? [data] : this.getPendingSelectionFromCollection(this.unselectedListOfColumnInventorys);
    this.pendingSelection = Object.create(null);
    this.unselectedListOfColumnInventorys = this.removeColumnFromCollection(this.unselectedListOfColumnInventorys, changeColumnList);
    this.selectedListOfColumnInventorys = changeColumnList.concat(this.selectedListOfColumnInventorys);
    this.serviceinventoryreport.saveSelectedColumn(this.selectedListOfColumnInventorys);
    this.showIndependenceRestrictionsMsg(this.selectedListOfColumnInventorys);
  }
  // remove data based on selection of column list
  removeFromSelectedColumn(data?: ServiceInventoryModel): void {
    let changeColumnList = (data) ? [data] : this.getPendingSelectionFromCollection(this.selectedListOfColumnInventorys);
    this.pendingSelection = Object.create(null);

    this.selectedListOfColumnInventorys = this.removeColumnFromCollection(this.selectedListOfColumnInventorys, changeColumnList);
    this.unselectedListOfColumnInventorys = changeColumnList.concat(this.unselectedListOfColumnInventorys);
    this.serviceinventoryreport.saveSelectedColumn(this.selectedListOfColumnInventorys);
    this.showIndependenceRestrictionsMsg(this.selectedListOfColumnInventorys);
  }

  // toggling selection and un-selected
  togglePendingSelection(data: ServiceInventoryModel): void {
    this.pendingSelection[data.id] = !this.pendingSelection[data.id];
  }

  // filtering data to move from div to another div - vise versa
  private getPendingSelectionFromCollection(collection: ServiceInventoryModel[]): ServiceInventoryModel[] {
    var selectionFromCollection = collection.filter(
      (data) => {
        if (this.pendingSelection[data.id] == true) {
          return data;
        }
      }
    );
    return (selectionFromCollection);
  }

  // checking and removing data if any selected one
  private removeColumnFromCollection(collection: ServiceInventoryModel[],
    dataToRemove: ServiceInventoryModel[]): ServiceInventoryModel[] {
    var collectionWithoutContacts = collection.filter((contact) => {
      return (!dataToRemove.includes(contact));
    }
    );
    return (collectionWithoutContacts);
  }
  // to add data in bulk
  addAllColumnData(data?: ServiceInventoryModel) {
    let changeColumnList = (data) ? [data] : this.getPendingSelectionFromCollection(this.column);
    this.pendingSelection = Object.create(null);
    this.unselectedListOfColumnInventorys = [];
    this.selectedListOfColumnInventorys = this.column;
    this.serviceinventoryreport.saveSelectedColumn(this.selectedListOfColumnInventorys);
    this.showIndependenceRestrictionsMsg(this.selectedListOfColumnInventorys);
  }
  //to remove data in bulk
  removeAllColumnData(data?: ServiceInventoryModel) {
    let changeColumnList = (data) ? [data] : this.getPendingSelectionFromCollection(this.column);
    this.pendingSelection = Object.create(null);
    this.selectedListOfColumnInventorys = [];
    this.unselectedListOfColumnInventorys = this.column;
    this.serviceinventoryreport.saveSelectedColumn(this.selectedListOfColumnInventorys);
    this.showIndependenceRestrictionsMsg(this.selectedListOfColumnInventorys);
  }

  showIndependenceRestrictionsMsg(selectedListOfColumnInventorys: ServiceInventoryModel[]) {
    if (selectedListOfColumnInventorys.map(m => m.name).indexOf("Independence Restrictions") !== -1) {
      this.showGlobalIndependenceRestrictionsMag = true;
    }
    else {
      this.showGlobalIndependenceRestrictionsMag = false;
    }
  }

}
