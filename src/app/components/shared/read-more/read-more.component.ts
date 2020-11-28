import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';

@Component({
  selector: 'app-read-more',
  template: `
  <div class="readme-box" [style.height.px]="height" [class.show]="show">
  <ng-content></ng-content>
  </div>
  <button *ngIf="enable" class="btn btn-link btn__read p-0" [ngClass]="{'high': highLightBoolean}" (click)="readmoreLess()" appScroller>{{ show ? 'Read less': 'Read more' }}</button>
`,
  styles: [`
  .readme-box {
    overflow: hidden;
  }
  .show {
    overflow: visible;
    height: auto !important;
  }
  .high {
    background-color: #FFE600 !important;
  }
`]
})
export class ReadMoreComponent implements OnChanges {
  @Input() height = 45;
  @Input() enable = false;
  @Input() targetdiv = '';
  @Input() highLight = [];
  @Input() text = '';
  @Input() enableHighlight = false;
  @Input() section = '';
  show = false;
  highLightBoolean = false;

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'highLight': {
              if (this.highLight.length === 0) {
                this.highLightBoolean = false;
              } else if (this.highLight.length > 0) {
                let numberItem = 500;
                const onlytext = this.text.replace( /(<([^>]+)>)/ig, '');
                const a = new RegExp(`(${ this.highLight.join('|') })`, 'gi');
                const startPart = this.text.substring(0, 500);
                const ListItemFound = startPart.match(/<li.*>/);
                const EnterFound = startPart.match(/<br.*>/);
                const paragraphFound = startPart.match(/<p.*>/);
                const parser = new DOMParser();
                const doc = parser.parseFromString(startPart, 'text/html');
                const numberOfList = doc.querySelectorAll('li').length;
                const numberOfEnter = doc.querySelectorAll('br').length;
                const numberOfparagraph = doc.querySelectorAll('p').length;
                if (ListItemFound !== null && ListItemFound.length > 0 || EnterFound !== null && EnterFound.length > 0
                  || paragraphFound !== null && paragraphFound.length > 0) {
                  const addItems = (numberOfList * 200) + (numberOfEnter * 200) + (numberOfparagraph * 200);
                  numberItem = numberItem - addItems > 0 ? numberItem - addItems : 0;
                }
                const withoutSpace = onlytext.replace(/&nbsp;/g, '');
                const afterTwoRows = withoutSpace.substring(numberItem);
                const find = afterTwoRows.search(a);
                if (find === -1) {
                  this.highLightBoolean = false;
                } else {
                  this.highLightBoolean = a.test(this.text);
                }
              }
              break;
          }
          case 'section': {
            if (this.section === 'Eytechnology' && this.enableHighlight === true) {
              this.highLightBoolean = true;
            }
            break;
          }
        }
      }
    }
  }
  readmoreLess() {
    this.show = !this.show;
    if (this.section === 'Eytechnology') {
      if (this.enableHighlight) {
        this.highLightBoolean = !this.highLightBoolean;
      }
    } else {
      if (this.text !== '' && this.highLight.length > 0) {
        let numberItem = 500;
        const onlytext = this.text.replace( /(<([^>]+)>)/ig, '');
        const a = new RegExp(`(${ this.highLight.join('|') })`, 'gi');
        const startPart = this.text.substring(0, 500);
        const ListItemFound = startPart.match(/<li.*>/);
        const EnterFound = startPart.match(/<br.*>/);
        const paragraphFound = startPart.match(/<p.*>/);
        const parser = new DOMParser();
        const doc = parser.parseFromString(startPart, 'text/html');
        const numberOfList = doc.querySelectorAll('li').length;
        const numberOfEnter = doc.querySelectorAll('br').length;
        const numberOfparagraph = doc.querySelectorAll('p').length;
        if (ListItemFound !== null && ListItemFound.length > 0 || EnterFound !== null && EnterFound.length > 0
          || paragraphFound !== null && paragraphFound.length > 0) {
          const addItems = (numberOfList * 200) + (numberOfEnter * 200) + (numberOfparagraph * 200);
          numberItem = numberItem - addItems > 0 ? numberItem - addItems : 0;
        }
        const withoutSpace = onlytext.replace(/&nbsp;/g, '');
        const afterTwoRows = withoutSpace.substring(numberItem);
        const find = afterTwoRows.search(a);
        if (find === -1) {
          this.highLightBoolean = false;
        } else {
          this.highLightBoolean = this.show === true ? false : true;
        }
      }
    }
    if (this.targetdiv !== '' && this.show === false) {
      this.scrollToElement(this.targetdiv);
    }
  }
  scrollToElement($element): void {
    $element.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  }
}
