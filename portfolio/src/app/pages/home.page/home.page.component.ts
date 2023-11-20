import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeroComponent} from "../../components/hero/hero.component";
import {AboutComponent} from "../../components/about/about.component";
import {ProjectsComponent} from "../../components/projects/projects.component";
import {ExperienceSkillsComponent} from "../../components/experience-skills/experience-skills.component";
import {ContactComponent} from "../../components/contact/contact.component";

@Component({
  selector: 'app-home.page',
  standalone: true,
  imports: [CommonModule, HeroComponent, AboutComponent, ProjectsComponent, ExperienceSkillsComponent, ContactComponent],
  templateUrl: './home.page.component.html',
  styleUrl: './home.page.component.scss'
})
export class HomePageComponent {

}
