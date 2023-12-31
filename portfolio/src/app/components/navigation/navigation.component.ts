import {Component, HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  standalone: true,
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  imports: [CommonModule]
})
export class NavigationComponent {

  navOpen: boolean = false;

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    // Check if scroll is greater than 100px
    if (window.scrollY > 100 && this.navOpen) {
      this.navOpen = false;
    }
  }

  toggleNav() {
    this.navOpen = !this.navOpen;
  }
}
