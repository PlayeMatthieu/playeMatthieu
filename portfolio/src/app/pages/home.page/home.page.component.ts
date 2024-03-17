import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {SkillsSliderComponent} from "../../components/skills-slider/skills-slider.component";
import {ProjectsComponent} from "../../components/projects/projects.component";
import {AboutComponent} from "../../components/about/about.component";
import {ContactComponent} from "../../components/contact/contact.component";

@Component({
  selector: 'app-home.page',
  standalone: true,
  imports: [CommonModule, SkillsSliderComponent, NgOptimizedImage, ProjectsComponent, AboutComponent, ContactComponent],
  templateUrl: './home.page.component.html',
  styleUrl: './home.page.component.scss'
})
export class HomePageComponent {

}
