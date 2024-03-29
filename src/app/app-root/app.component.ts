import { Component, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainHeaderComponent } from '../cmps/main-header/main-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,MainHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @HostBinding('class.main-layout') layout:boolean = true
  title = 'elastic-job';
}
