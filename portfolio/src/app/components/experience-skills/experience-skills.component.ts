import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';

interface skill {
  title: string;
  image: string;
}

@Component({
  selector: 'app-experience-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience-skills.component.html',
  styleUrl: './experience-skills.component.scss'
})
export class ExperienceSkillsComponent {
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
}
