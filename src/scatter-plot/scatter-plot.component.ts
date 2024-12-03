import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import spotify_tracks from '../data/spotify_tracks.json';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrl: './scatter-plot.component.css',
  imports: [MatRadioModule, FormsModule, AgGridAngular],
})
export class ScatterPlotComponent implements AfterViewInit {
  @ViewChild('scatterPlotContainer', { static: true }) container!: ElementRef;

  width = window.innerWidth - 600;
  height = window.innerHeight - 200;
  marginTop = 20;
  marginRight = 20;
  marginBottom = 20;
  marginLeft = 70;

  firstFeature = 'tempo';
  secondFeature = 'danceability';

  features = [
    'tempo',
    'danceability',
    'energy',
    'loudness',
    'speechiness',
    'acousticness',
    'liveness',
    'valence',
  ];

  svg: any;
  xscale: any;
  yscale: any;
  dot: any;
  brushSelected: any = [];

  colDefs: ColDef[] = [
    { field: 'name', headerName: 'Song Name', flex: 1 },
    {
      field: 'artists',
      headerName: 'Artists',
      valueGetter: (track: any) => track.data.artists.join(', '),
      flex: 1.5,
    },
    { field: 'duration_ms', headerName: 'Duration (ms)', flex: 1.5 },
    { field: 'year', headerName: 'Year', flex: 1 },
    { field: 'ranking', headerName: 'Billboard Ranking', flex: 1 },
    { field: 'danceability', headerName: 'Danceability', flex: 1 },
    { field: 'energy', headerName: 'Energy', flex: 1 },
    { field: 'loudness', headerName: 'Loudness', flex: 1 },
    { field: 'speechiness', headerName: 'Speechiness', flex: 1 },
    { field: 'acousticness', headerName: 'Acousticness', flex: 1 },
    { field: 'liveness', headerName: 'Liveness', flex: 1 },
    { field: 'valence', headerName: 'Valence', flex: 1 },
    { field: 'tempo', headerName: 'Tempo', flex: 1 },
  ];

  constructor() {}

  ngAfterViewInit(): void {
    this.createContainer();
    this.createScatterPlot();
  }

  createContainer() {
    // Create the SVG container.
    this.svg = d3
      .create('svg')
      .attr('width', this.width)
      .attr('height', this.height + 100);

    // listening to brush input change
    this.svg.on('input', () => {
      this.brushSelected = this.svg.property('value');
    });

    this.container.nativeElement.appendChild(this.svg.node());
  }

  createScatterPlot() {
    this.clearPlot();
    this.createXAxis();
    this.createYAxis();
    this.createDataPoints();
    this.addBrushBehavior();
  }

  createXAxis() {
    // Remove existing x-axis and label if any
    this.svg.selectAll('#x-axis, #x-axis-label').remove();

    // Get feature values for x-axis
    let xFeatureValues = spotify_tracks.map(
      (track: any) => track[this.firstFeature]
    );

    // Declare the x scale.
    this.xscale = d3
      .scaleLinear()
      .domain([d3.min(xFeatureValues), d3.max(xFeatureValues)])
      .range([this.marginLeft, this.width - this.marginRight]);

    // added x-axis
    this.svg
      .append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0,${this.height - this.marginBottom})`)
      .call(d3.axisBottom(this.xscale).ticks(20));

    // added x-axis label
    this.svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('id', 'x-axis-label')
      .attr('x', (this.marginLeft + this.width - this.marginRight) / 2)
      .attr('y', this.height + 25) // 25 Padding down
      .text(
        this.firstFeature.charAt(0).toUpperCase() + this.firstFeature.slice(1)
      )
      .style('fill', 'black');
  }

  createYAxis() {
    // Remove existing y-axis and label if any
    this.svg.selectAll('#y-axis, #y-axis-label').remove();

    let featureValues = spotify_tracks.map(
      (track: any) => track[this.secondFeature]
    );

    // Declare the y (vertical position) scale.
    this.yscale = d3
      .scaleLinear()
      .domain([d3.min(featureValues), d3.max(featureValues)])
      .range([this.height - this.marginBottom, this.marginTop]);

    // Add the y-axis.
    this.svg
      .append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${this.marginLeft},0)`)
      .call(d3.axisLeft(this.yscale).ticks(10));

    let yLabel =
      this.secondFeature.charAt(0).toUpperCase() +
      this.secondFeature.slice(1).toLowerCase();

    // added y-axis label
    this.svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('id', 'y-axis-label')
      .attr('x', -this.height / 2) // Negative because of rotation
      .attr('y', this.marginLeft / 2) // Position close to the y-axis
      .attr('transform', 'rotate(-90)') // Rotate counter-clockwise
      .text(yLabel)
      .style('fill', 'black');
  }

  createDataPoints() {
    // Remove existing data points if any
    this.svg.selectAll('.data-point').remove();

    // added scatter points for each record
    this.dot = this.svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(spotify_tracks)
      .join('circle')
      .attr('class', 'data-point')
      .attr('cx', (track: any) => this.xscale(track[this.firstFeature]))
      .attr('cy', (track: any) => this.yscale(track[this.secondFeature]))
      .attr('r', 5);
  }

  addBrushBehavior() {
    // Remove existing brush if any
    this.svg.selectAll('.brush').remove();

    // Create the brush behavior.
    this.svg
      .append('g')
      .attr('class', 'brush')
      .call(
        d3.brush().on('end', ({ selection }) => {
          let value = [];
          if (selection) {
            const [[x0, y0], [x1, y1]] = selection;
            value = this.dot
              .style('stroke', 'gray')
              .filter((d: any, i: number, nodes: any) => {
                const circle = d3.select(nodes[i]);
                const cx = Number(circle.attr('cx'));
                const cy = Number(circle.attr('cy'));

                // Check if the point is within the brush selection
                return x0 <= cx && cx < x1 && y0 <= cy && cy < y1;
              })
              .style('stroke', 'steelblue')
              .data();
          } else {
            this.dot.style('stroke', 'steelblue');
          }

          // Inform downstream cells that the selection has changed.
          this.svg.property('value', value).dispatch('input');
        })
      );
  }

  clearPlot() {
    if (this.svg) {
      this.svg
        .selectAll(
          'circle, #y-axis, #y-axis-label, #x-axis, #x-axis-label, .brush'
        )
        .remove();
      console.log('Plot cleared');
    }
  }

  clearBrush() {
    if (this.svg) {
      this.svg.select('.brush').call(d3.brush().move, null);
      if (this.dot) {
        this.dot.style('stroke', 'steelblue');
      }
      this.svg.property('value', []).dispatch('input');
    }
  }

  onFirstSelect(): void {
    this.createScatterPlot();
    this.clearBrush();
  }

  onSecondSelect(): void {
    this.createScatterPlot();
    this.clearBrush();
  }
}
