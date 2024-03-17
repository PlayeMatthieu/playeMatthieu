import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {SkillsSliderComponent} from "../skills-slider/skills-slider.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    SkillsSliderComponent,
    NgIf
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent{

  public sliderCardWidth: number;

  @ViewChild('sliderCard') sliderCard: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.getCardWidth();
  }

  ngAfterViewInit(): void {
    this.getCardWidth();
    console.log('init')
  }


  private getCardWidth(): void {
    this.sliderCardWidth = this.sliderCard.nativeElement.offsetWidth - 32;
  }
}
