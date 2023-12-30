import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  public services = [{
    name: 'Web Development',
    icon: 'web.svg',
  }, {
    name: 'Mobile Development',
    icon: 'phone.svg',
  }, {
    name: 'CI/CD',
    icon: 'cicd.svg',
  }];
}
