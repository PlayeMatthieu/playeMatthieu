import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';


interface project {
  title: string;
  description: string;
  image: string;
  link: string;
  color: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  public projects: project[] = [{
    title: 'buildmate',
    description: 'Web & mobile application',
    image: 'assets/images/Buildmate_app.png',
    link: 'https://buildmate.be',
    color: '#EFF3F8'
  }]
}
