import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'main-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-header.component.html',
  styleUrl: './main-header.component.scss'
})
export class MainHeaderComponent {


  isMenuOpen = false

  toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
  }
}
