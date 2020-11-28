import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalServiceComponent } from '../default-modal/modal.component';
@Component({
  selector: 'app-ey-technology',
  templateUrl: './ey-technology.component.html',
  styleUrls: ['./ey-technology.component.scss']
})
export class EyTechnologyComponent implements OnInit {
  @Input() technology: any;
  @Input() guidance: any;
  @Input() listOfWords: any = [];
  enableReadmore = false;
  enableHighlight = false;
  constructor(private modalService: NgbModal) { }
  showInfo(title, text) {
    const modalRef = this.modalService.open(ModalServiceComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.title = 'EY Technology guidance';
    modalRef.componentInstance.prolog = `<strong>${title}</strong>` + '<br>' + text;
  }
  ngOnInit() {
    if (this.technology) {
      const a = new RegExp(`(${ this.listOfWords.join('|') })`, 'gi');
      let position = 0;
      const technologyItems = this.technology.length;
      if (this.technology.length > 0 && this.listOfWords.length > 0) {
       this.technology.map((e, i) => {
         const findText = e.TechnologyName.search(a);
         if (findText !== -1) {
            position = i;
          }
       });
      }
      if (position > 6) {
        this.enableHighlight = true;
      }
      // const allTechnologies =
      const limitRow = 38;
      const onlytext1 = this.guidance ? this.guidance.guidanceEytechnology.replace( /(<([^>]+)>)/ig, '') : '';
      const totalGuidanceRows = onlytext1.length / limitRow;
      this.enableReadmore = technologyItems + totalGuidanceRows > 7 ? true : false; // 7 rows before enable readmore
    }
  }
}
