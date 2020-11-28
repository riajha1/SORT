import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from 'src/app/auth/auth.service';
import { FavoritesService, UserService, ConfigItemsService } from 'src/app/providers/provider.index';
import { ModalNavbarComponent } from '../modal/modal.component';

interface ValidateClient {
  successfull?: boolean;
  message?: string;
}

const iframeEl = document.getElementById('the_iframe');
const isIFrame = (input: HTMLElement | null): input is HTMLIFrameElement =>
    input !== null && input.tagName === 'IFRAME';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit, AfterViewInit {
  public scrollbarOptions = { axis: 'y', theme: 'dark'};
  gisSearchUrl = 'home/external/search-entity?mode=add-to-portfolio';

  @Input() public filterNav: any;

  Allfavorites = [];
  dataClientIframe = [];
  resultClientValidation: ValidateClient;
  loadingFavorites: boolean = false;
  modalRef: NgbModalRef;
  subscriptionFavorites: Subscription;

  constructor(private favoriteService: FavoritesService,
              private modalService: NgbModal,
              private authService: AuthService,
              private userService: UserService,
              private configService: ConfigItemsService) {

    function bindEvent(element, eventName: string, eventHandler: (event: any) => void) {  // iframe clients
      if (element.addEventListener) {
          element.addEventListener(eventName, eventHandler, false);
      } else if (element.attachEvent) {
          element.attachEvent('on' + eventName, eventHandler);
      }
    }
    bindEvent(window, 'message', (event: any) => this.getDataClientIframe(event));
  }

  ngOnInit() {
    this.Allfavorites = this.favoriteService.favorites;
    if (this.Allfavorites.length === 0) {
      this.getAllFavorites();
    }
    this.subscriptionFavorites = this.favoriteService.favoritesChanged
    .subscribe(favorites => {
      this.Allfavorites = favorites;
      // console.log('subscribe favorites', this.Allfavorites)
    });
  }
  ngAfterViewInit() {
    const sendMessage = (msg: any) => {
      if (isIFrame(iframeEl) && iframeEl.contentWindow) {
          iframeEl.contentWindow.postMessage(msg, '*');
      }
    };
  }
  openModal = (content: any) => {
    this.modalRef = this.modalService.open(content, { backdrop: 'static', size: 'xl'});
    if (this.Allfavorites.length === 0) {
      this.getAllFavorites();
    }
    // console.log('Favorites avalible when the user open the modal', this.Allfavorites);
  }

  getAllFavorites(validation= false, fav= {}, gisid= 0) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    // console.log('start request get favorites', userData);
    if (userData !== null ) {
      this.favoriteService.getAllFavoritesByUser(userData.UserName).subscribe(
          (data: any) => {
           // console.log('complete request get favorites', userData);
          // this.Allfavorites = data;
            if (validation) {
              this.getFavoriteByGIS(fav, gisid);
            }
        }, (error) => {
          console.log('error getAllFavorites', error);
        });
    }
  }
  getDataClientIframe(event) {
    // Show complete information about client doesn't matter if is a favorite or not
    if ( event.data.data ) {
      this.favoriteService.getDataClient(event.data.data.gisId).subscribe(
        (data: any) => {
          this.dataClientIframe = data;
          const temp = event;
          temp.data.data.mdmid = data.Mdmid;
          temp.data.data.gfisid = data.Gfisid;
          this.addClient(temp);
        },
        errorService => console.log('error endpoint', errorService.message));
    }
  }
  getPermissibility(temp) {
      const gisId = temp.GISId;
      const res = this.configService.getPermissibilityByclient(gisId);
      const temporal = {...temp, permissibility: res};
      this.userService.saveClientFilter(temporal);
  }
  getPermissibilityByGIS(temp) {
    const gisId = temp.GISId;
    this.favoriteService.getGISTokens(gisId).subscribe(
      (data: any) => {
        const gisTokens = data;
        const res = this.configService.getPermissibilityByClientGIS(gisTokens);
        const temporal = { ...temp, permissibility: res };
        this.userService.saveClientFilter(temporal);
      },
      errorService => console.log('error endpoint', errorService.message));
  }

  heartFunction() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (this.filterNav.client.GISId) {
      this.filterNav.client.favorite = !this.filterNav.client.favorite;
      if (this.filterNav.client.favorite ) {
        this.favoriteService.addFavoriteByUser(userData.UserName, this.filterNav.client).subscribe(() => this.getAllFavorites());
      } else {
        this.removeFavorite(this.filterNav.client.GISId);
      }
    }
  }
  removeClient = () => {
    this.userService.removeClientFilter();
    this.userService.savePreviousClient({});
  }
  removeFavorite = (id: number) => this.favoriteService.deleteFavorite(id).subscribe(() => this.getAllFavorites());
  validation(favorite: any) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const favoriteData = {...favorite, favorite: true};
    this.loadingFavorites = true;
    this.favoriteService.validationFavorite(userData.UserName, favoriteData).subscribe(
      (data: any) => {
      this.resultClientValidation = data;
      this.openValidationModal(favoriteData);
    },
    errorService => console.log('error endpoint getPermissibility', errorService.message));
  }
  openValidationModal(fav) {
    this.loadingFavorites = false;
    if (this.resultClientValidation.successfull ) {
      if ( this.resultClientValidation.message === 'This client will be removed from your favorites as the attributes have changed so please search GIS again. Click OK.') {
        const modalRef = this.modalService.open(ModalNavbarComponent, { backdrop: 'static', size: 'sm'});
        modalRef.componentInstance.result = this.resultClientValidation;
        this.getAllFavorites();
      } else {
        if ( this.resultClientValidation.message !== 'All ok') {
          const modalRef = this.modalService.open(ModalNavbarComponent, { backdrop: 'static', size: 'sm'});
          modalRef.componentInstance.result = this.resultClientValidation;
          this.getAllFavorites(true, fav, fav.gisid);
        } else { // All ok
          this.addClient(fav, true);
          this.modalRef.close();
        }
      }
    }
  }
  getFavoriteByGIS(fav, gisid: number) {
    const result = this.Allfavorites.filter(item => item.gisid === gisid);
    const favorite = {...fav};
    favorite.clientName = result[0].clientName;
    favorite.gfisid = result[0].gfisid;
    favorite.mdmid = result[0].mdmid;
    this.addClient(favorite, true);
  }
  addClient(res, validation = false) {
    //Todo. 'isQAOrDev' to be removed and SORT needs to always call getPermissibilityByGIS when it is ready to move to UAT1.
    var isQAOrDev =  window.location.href.indexOf('defrnvmupacwb02') >= 0 || window.location.href.indexOf('localhost') >= 0;
    const temp = {GISId: '', ClientName: '', url: '', gfisid: null, MDMId: null, DateAdd: null, DateUpdated: null, favorite: false};
    if (validation === true) { // selected user from favorites
      temp.GISId = res.gisid;
      temp.MDMId = res.mdmid;
      temp.gfisid = res.gfisid;
      temp.ClientName = res.clientName;
      temp.favorite = true;
      temp.url = `https://gis7.eyua.net/home/entity-view/${res.gisid}/full-tree`;
      isQAOrDev ? this.getPermissibilityByGIS(temp) : this.getPermissibility(temp);
    } else { // selected user from iframe
      if ( res.data.data ) {
        const favorito = this.Allfavorites.find( element => element.gisid === res.data.data.gisId );
        temp.favorite = (favorito !== undefined ? true : false);
        temp.GISId = res.data.data.gisId;
        temp.ClientName = res.data.data.entityName;
        temp.MDMId = res.data.data.mdmid;
        temp.gfisid = res.data.data.gfisid;
        temp.url = `https://gis7.eyua.net/home/entity-view/${res.data.data.gisId}/full-tree`;
        isQAOrDev ? this.getPermissibilityByGIS(temp) : this.getPermissibility(temp);
        this.modalRef.close();
      }
    }
  }

}
