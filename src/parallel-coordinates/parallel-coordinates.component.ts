import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NgModule } from '@angular/core';
import * as d3 from 'd3';
import spotify_tracks from '../data/spotify_tracks.json';

@Component({
  selector: 'parallel-coordinates',
  template: `
    <div>
      <label for="yearDropdown">Select Year: </label>
      <select id="yearDropdown" (change)="onYearChange($event)">
        <option *ngFor="let year of years" [value]="year">{{ year }}</option>
      </select>
    </div>
    <div #chartContainer></div>
  `,
  styleUrls: ['./parallel-coordinates.component.css'],
})
export class ParallelCoordinatesComponent implements AfterViewInit {
  @ViewChild('chartContainer', { static: true }) container!: ElementRef;

  width = 1000;
  height = 500;
  margin = { top: 50, right: 30, bottom: 50, left: 50 };

  features = [
    'danceability',
    'energy',
    'loudness',
    'speechiness',
    'acousticness',
    'valence',
    'tempo',
  ];

  years = Array.from(
    new Set(spotify_tracks.map((track: any) => track['year']))
  ).sort();

  selectedYear = this.years[0]; // Default year

  constructor() {}

  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    const svg = d3
      .select(this.container.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const updateChart = (filteredData: any[]) => {
      svg.selectAll('*').remove(); // Clear previous chart content

      // Scales for each feature
      const scales = new Map<string, d3.ScaleLinear<number, number>>();
      this.features.forEach((feature) => {
        scales.set(
          feature,
          d3
            .scaleLinear()
            .domain(
              d3.extent(filteredData, (d: any) => d[feature]) as [
                number,
                number
              ]
            )
            .range([this.height - this.margin.bottom, this.margin.top])
        );
      });

      // X-axis scale for features
      const xScale = d3
        .scalePoint()
        .domain(this.features)
        .range([this.margin.left, this.width - this.margin.right]);

      // Add lines for each song
      svg
        .append('g')
        .selectAll('path')
        .data(filteredData)
        .join('path')
        .attr('d', (d: any) =>
          d3.line()(
            this.features.map((feature) => [
              xScale(feature) as number,
              scales.get(feature)!(d[feature]),
            ])
          )
        )
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1)
        .attr('opacity', 0.7)
        .on('mouseover', function () {
          d3.select(this).attr('stroke', 'orange').attr('stroke-width', 2);
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke', 'steelblue').attr('stroke-width', 1);
        })
        .append('title') // Tooltip
        .text((d: any) => `${d.name} (${d.year})`);

      // Add axes for each feature
      svg
        .append('g')
        .selectAll('g')
        .data(this.features)
        .join('g')
        .attr('transform', (d) => `translate(${xScale(d)},0)`)
        .each(function (d) {
          const scale = scales.get(d)!;
          d3.select(this as SVGGElement).call(d3.axisLeft(scale).ticks(6));
        })
        .append('text')
        .attr('y', this.margin.top - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text((d) => d)
        .attr('transform', (d) => `translate(0,-15)`);

      // Add column labels
      svg
        .append('g')
        .selectAll('text')
        .data(this.features)
        .join('text')
        .attr('x', (d) => xScale(d)!)
        .attr('y', this.height - this.margin.bottom + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text((d) => d);
    };

    // Initial chart render with default year
    const initialData = spotify_tracks.filter(
      (track: any) => track.year === this.selectedYear
    );
    updateChart(initialData);

    // Update chart when year changes
    this.onYearChange = (event: Event) => {
      this.selectedYear = +(event.target as HTMLSelectElement).value;
      const filteredData = spotify_tracks.filter(
        (track: any) => track.year === this.selectedYear
      );
      updateChart(filteredData);
    };
  }

  onYearChange(event: Event) {
    // Placeholder for TypeScript; actual logic is in `createChart` to avoid circular references
  }
}
