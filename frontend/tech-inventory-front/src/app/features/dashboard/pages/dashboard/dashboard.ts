import { Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  imports: [MatCard, MatCardContent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}