import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AdminUserAccessService } from '../../../../providers/provider.index';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-admin-user-access',
  templateUrl: './admin-user-access.component.html',
  styleUrls: ['./admin-user-access.component.scss']
})
export class AdminUserAccessComponent implements OnInit {
  userRoles;
  noExistRight = '';
  alreadyExistMessage = '';
  employee: any = [];
  editAccess: FormGroup;
  commentsAddNewUser; // add new form
  rolesAddnewUser; // add new form
  roles;
  SearchResultListData: any = [];
  SearchResultList: any = [];
  employeeAddnew: any = [];
  clearEmployee = false;
  modalRef: NgbModalRef;
  modalRefEdit: NgbModalRef;
  deleteReason
  modalRefDelete: NgbModalRef;
  constructor(private modalService: NgbModal, private adminUserAccessService: AdminUserAccessService) { }

  ngOnInit() {
    this.userRoleList();
  }
  open(content) { // to open addnew modal pop-up
    this.alreadyExistMessage = '';
    this.commentsAddNewUser = '';
    this.rolesAddnewUser = '';
    this.modalRef = this.modalService.open(content, { backdrop: 'static', size: 'xl' });
  }

  accessRightEdit(content, name, role, comment) { //to open edit modal pop-up
    this.modalRefEdit = this.modalService.open(content, { backdrop: 'static', size: 'xl' });
    this.editAccess = new FormGroup({
      name: new FormControl(name),
      role: new FormControl(role),
      comment: new FormControl(comment),
    });
  }

  deleteAccessRightRemoved(content) {
    this.deleteReason = '';
    this.modalRefDelete = this.modalService.open(content, { backdrop: 'static', size: 'lg' });
  }
  userRoleList() { // display user roles list
    this.adminUserAccessService.getUserRoles().subscribe((data: any) => { this.userRoles = data; });
  }
  removeAccessRights(id, deleteReason) { // functions to remove an employee from the table
    if (deleteReason !== undefined) {
      this.modalRefDelete.close();
      const user = this.SearchResultListData.filter(i => i.Id === id)[0];
      user['Reason'] = deleteReason;
      console.log('Reason delete', user);
      this.SearchResultListData = this.SearchResultListData.filter(i => i.Id !== id);
      this.adminUserAccessService.deleteAccessRight(user).subscribe((data: any) => {
        if (data.message === 'OK') {
          const result = JSON.parse(data.value);
          this.noExistRight = '';
        }
      });
    }
  }

  cancelDeletingUserAccess() {
    this.deleteReason = '';
    this.modalRefDelete.close();
  }

  SaveUpdate(id) { // to edit the table row
    this.noExistRight = '';
    const userData = this.SearchResultListData.filter(i => i.Id === id)[0];
    userData.Name = this.editAccess.controls.name.value;
    userData.Role = this.editAccess.controls.role.value;
    userData.Comments = this.editAccess.controls.comment.value;
    this.adminUserAccessService.updateAccessRight(userData)
      .subscribe((data: any) => {
        if (data.message === 'OK') {
          const result = JSON.parse(data.value);
          console.log('edited - your data has been saved', result);
          this.modalRefEdit.close();
        }
        if (data.value === '[]') {
          this.noExistRight = 'Access rights does not exist for this user';
        }
      });
  }
  SetSelectedEmployee(employee) { // Function to get employee selected in the people picker
    this.clearEmployee = false;
    this.employee = employee;
  }
  RemoveEmployee(status) { // Function to remove employee selected in the people picker
    if (status) { this.employee = []; }
  }

  SetSelectedEmployeeAddNew(employee) { // Function to get employee selected in the people picker for add form
    this.clearEmployee = false;
    this.employeeAddnew = employee;
  }
  RemoveEmployeeAddNew(status) { // Function to remove employee selected in the people picker for add form
    if (status) { this.employeeAddnew = []; }
  }

  searchResult(data) { // subscribe the get method to show show the GHR table result
    this.noExistRight = '';
    this.adminUserAccessService.getSearchResult(data).subscribe((data: any) => {
      if (data.message === 'OK') {
        this.SearchResultList = JSON.parse(data.value);
        this.SearchResultListData = this.SearchResultList;
      }
      if (data.value === '[]') {
        this.SearchResultList = JSON.parse(data.value);
        this.SearchResultListData = this.SearchResultList;
        this.noExistRight = 'Access rights does not exist for this user';

      }
    })
  }

  search() { // to search the data in GHR table based on the input
    const data = {
      Role: this.roles,
      Text: this.employee.FullName
    };
    this.searchResult(data);
  }

  addNewItemPost(newdata) {
    this.alreadyExistMessage = '';
    if ((newdata.Name !== undefined && newdata.Role !== '')){
    this.adminUserAccessService.addNewUser(newdata).subscribe((data: any) => {
        if (data.message === 'User Added') {
          const result = JSON.parse(data.value);
          console.log('new user has been added', result);
          this.modalRef.close();
          this.search();
          this.employeeAddnew = [];
        }
        if (data.message === 'User Already Exists') {
          this.alreadyExistMessage = 'Access already exists for this user';
        }
      })
    }


  }

  cancelAddNewForm() { // to reset the form and close the add new modal pop-up window
    this.modalRef.close();
    this.commentsAddNewUser = '';
    this.rolesAddnewUser = '';
    this.employeeAddnew = [];
  }

  saveNewForm() { // to save the new add to table
    const newDetail = {
      AdUserId: this.employeeAddnew.AduserId,
      Active: 'Yes',
      Date: '2020-10-16 18:49:32.213',
      Gui: this.employeeAddnew.Gui,
      Name: this.employeeAddnew.FullName,
      Email: this.employeeAddnew.Email,
      Comments: this.commentsAddNewUser,
      Role: this.rolesAddnewUser
    }
    this.addNewItemPost(newDetail);
  }
}
