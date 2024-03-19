import {Component} from '@angular/core';
import {NgForOf} from "@angular/common";

interface skill {
  title: string;
  image: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent{
  public skills: skill[] = [{
    title: 'angular',
    image: 'assets/images/skills/Angular_logo.svg'
  }, {
    title: 'typescript',
    image: 'assets/images/skills/Typescript_logo.svg'
  }, {
    title: 'Ionic',
    image: 'assets/images/skills/Ionic_logo.svg'
  }, {
    title: 'Html',
    image: 'assets/images/skills/Html_logo.svg'
  }, {
    title: 'Javascript',
    image: 'assets/images/skills/Javascript_logo.svg'
  }, {
    title: 'Css',
    image: 'assets/images/skills/Css_logo.svg'
  }, {
    title: 'Sass',
    image: 'assets/images/skills/Sass_logo.svg'
  }, {
    title: 'aws',
    image: 'assets/images/skills/Aws_logo.svg'
  }]
}
