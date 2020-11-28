import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {
  stringLength = 140;
  @Input() carousel: any[] = [];
  @Input() serviceLine: any[] = [];
  @Input() filter: any;
  slideConfig = {
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: '<div class="nav-btn next-slide"></div>',
    prevArrow: '<div class="nav-btn prev-slide"></div>',
    responsive: [
      {
        breakpoint: 1240,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: false,
          dots: false
        }
      },
      {
        breakpoint: 990,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: false,
          dots: false
        }
      },
      {
        breakpoint: 768,
        settings: {
          infinite: false,
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  constructor(private router: Router) {}
  // hooks
  ngOnInit() {}

  // functions
  redirectPage = id => this.router.navigate(['/service', id]);

  onResize(event) {
    if (event.target.innerWidth >= 1240) {
      this.stringLength = 140;
    } else if (event.target.innerWidth >= 1028 && event.target.innerWidth < 1240) {
      this.stringLength = 110;
    } else if (event.target.innerWidth >= 990 && event.target.innerWidth < 1028 ) {
      this.stringLength = 100;
    }
  }

}
