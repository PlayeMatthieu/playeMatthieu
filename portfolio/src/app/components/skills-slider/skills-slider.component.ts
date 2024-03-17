import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';

interface skill {
  title: string;
  image: string;
}

@Component({
  selector: 'app-skills-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills-slider.component.html',
  styleUrl: './skills-slider.component.scss'
})
export class SkillsSliderComponent implements AfterViewInit{

  @ViewChild('scroller') scroller: ElementRef;
  @ViewChild('innerScroller') innerScroller: ElementRef;
  @Input() maxWidth: number;

  public skills: skill[] = [{
    title: 'angular',
    image: 'assets/images/skills/Angular_logo.png'
  }, {
    title: 'typescript',
    image: 'assets/images/skills/Typescript_logo.png'
  }, {
    title: 'Ionic',
    image: 'assets/images/skills/Ionic_logo.png'
  }, {
    title: 'Html',
    image: 'assets/images/skills/Html_logo.png'
  }, {
    title: 'Javascript',
    image: 'assets/images/skills/Javascript_logo.png'
  }, {
    title: 'Css',
    image: 'assets/images/skills/Css_logo.png'
  }, {
    title: 'Sass',
    image: 'assets/images/skills/Sass_logo.png'
  }, {
    title: 'aws',
    image: 'assets/images/skills/Aws_logo.png'
  }]

  ngAfterViewInit(): void {
    if (!window.matchMedia(("(prefers-reduced-motion: reduce)")).matches) {
      this.addAnimation();
    }
  }

  private addAnimation(): void {
    this.scroller.nativeElement.setAttribute('data-animated', 'true');
    const scrollerContent = Array.from(this.innerScroller.nativeElement.children);

    scrollerContent.forEach((item: any) => {
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute("aria-hidden", true);
      this.innerScroller.nativeElement.appendChild(duplicatedItem);
    });
  }
}
