import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScatterPlotComponent } from '../scatter-plot/scatter-plot.component';
import { ParallelCoordinatesComponent } from '../parallel-coordinates/parallel-coordinates.component';
import { BoxplotComponent } from '../boxplot/boxplot.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ScatterPlotComponent,
    ParallelCoordinatesComponent,
    BoxplotComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'spotify-aa-ui';
}
