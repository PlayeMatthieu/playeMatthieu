import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SkillsSliderComponent} from "../../components/skills-slider/skills-slider.component";

@Component({
  selector: 'app-home.page',
  standalone: true,
  imports: [CommonModule,SkillsSliderComponent],
  templateUrl: './home.page.component.html',
  styleUrl: './home.page.component.scss'
})
export class HomePageComponent {

}
