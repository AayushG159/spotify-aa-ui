import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScatterPlotComponent } from '../scatter-plot/scatter-plot.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ScatterPlotComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'spotify-aa-ui';
}
