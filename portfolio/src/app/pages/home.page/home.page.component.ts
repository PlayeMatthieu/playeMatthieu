import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeroComponent} from "../../components/hero/hero.component";

@Component({
  selector: 'app-home.page',
  standalone: true,
  imports: [CommonModule, HeroComponent],
  templateUrl: './home.page.component.html',
  styleUrl: './home.page.component.scss'
})
export class HomePageComponent {

}
