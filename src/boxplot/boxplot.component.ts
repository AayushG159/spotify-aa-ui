import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import spotify_tracks from '../data/spotify_tracks.json';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface SpotifyTrack {
  track_id: string;
  name: string;
  artists: string[];
  year: number;
  ranking: number;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  type: string;
  id: string;
  uri: string;
  track_href: string;
  analysis_url: string;
  duration_ms: number;
  time_signature: number;
  [key: string]: string | number | string[] | undefined;
}

interface BoxplotStats {
  year: number;
  q1: number;
  median: number;
  q3: number;
  min: number;
  max: number;
  outliers: number[];
  outlierData: OutlierData[];
}

interface OutlierData {
  value: number;
  track: SpotifyTrack;
}

@Component({
  selector: 'boxplot',
  templateUrl: './boxplot.component.html',
  styleUrl: './boxplot.component.css',
  standalone: true,
  imports: [MatRadioModule, FormsModule, CommonModule],
})
export class BoxplotComponent implements AfterViewInit {
  @ViewChild('boxplotContainer', { static: true }) container!: ElementRef;

  tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  width = window.innerWidth - 600;
  height = window.innerHeight - 200;
  marginTop = 20;
  marginRight = 20;
  marginBottom = 50;
  marginLeft = 70;

  selectedFeature = 'tempo';
  features = [
    { value: 'tempo', label: 'Tempo' },
    { value: 'danceability', label: 'Danceability' },
    { value: 'energy', label: 'Energy' },
    { value: 'loudness', label: 'Loudness' },
    { value: 'speechiness', label: 'Speechiness' },
    { value: 'acousticness', label: 'Acousticness' },
    { value: 'liveness', label: 'Liveness' },
    { value: 'valence', label: 'Valence' },
  ];

  svg: any;
  xscale: any;
  yscale: any;

  constructor() {}

  ngAfterViewInit(): void {
    this.createBoxplot();
  }
  capitalizeFeature(feature: string): string {
    return feature.charAt(0).toUpperCase() + feature.slice(1);
  }

  calculateBoxplotStats(data: number[]) {
    const sorted = data.sort(d3.ascending);
    const q1 = d3.quantile(sorted, 0.25) || 0;
    const median = d3.quantile(sorted, 0.5) || 0;
    const q3 = d3.quantile(sorted, 0.75) || 0;
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = sorted.filter((d) => d < lowerBound || d > upperBound);
    const min = sorted.find((d) => d >= lowerBound) || sorted[0];
    const max = sorted.reverse().find((d) => d <= upperBound) || sorted[0];

    return { q1, median, q3, min, max, outliers };
  }

  createBoxplot() {
    if (this.container.nativeElement.firstChild) {
      this.container.nativeElement.removeChild(
        this.container.nativeElement.firstChild
      );
    }

    const dataByYear = d3.group(
      spotify_tracks as SpotifyTrack[],
      (d) => d.year
    );
    const years = Array.from(dataByYear.keys()).sort();

    const boxplotData: BoxplotStats[] = years.map((year) => {
      const yearData = dataByYear.get(year) || [];
      const values = yearData.map(
        (d: SpotifyTrack) => d[this.selectedFeature] as number
      );

      const outlierData = yearData
        .filter((d: SpotifyTrack) => {
          const value = d[this.selectedFeature] as number;
          const sorted = values.sort(d3.ascending);
          const q1 = d3.quantile(sorted, 0.25) || 0;
          const q3 = d3.quantile(sorted, 0.75) || 0;
          const iqr = q3 - q1;
          return value < q1 - 1.5 * iqr || value > q3 + 1.5 * iqr;
        })
        .map((d: SpotifyTrack) => ({
          value: d[this.selectedFeature] as number,
          track: d,
        }));

      return {
        year,
        ...this.calculateBoxplotStats(values),
        outlierData,
      };
    });

    // Create SVG
    this.svg = d3
      .select(this.container.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    // Create scales
    this.xscale = d3
      .scaleBand()
      .domain(years.map(String))
      .range([this.marginLeft, this.width - this.marginRight])
      .padding(0.1);

    const allValues = boxplotData.flatMap((d) => [
      d.min,
      d.q1,
      d.median,
      d.q3,
      d.max,
      ...d.outliers,
    ]);

    this.yscale = d3
      .scaleLinear()
      .domain([d3.min(allValues) || 0, d3.max(allValues) || 0])
      .range([this.height - this.marginBottom, this.marginTop])
      .nice();

    // Add axes
    this.svg
      .append('g')
      .attr('transform', `translate(0,${this.height - this.marginBottom})`)
      .call(d3.axisBottom(this.xscale))
      .append('text')
      .attr('x', this.width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text('Year');
    const selectedFeatureObj = this.features.find(
      (f) => f.value === this.selectedFeature
    );
    const yAxisLabel = selectedFeatureObj
      ? selectedFeatureObj.label
      : this.selectedFeature;

    this.svg
      .append('g')
      .attr('transform', `translate(${this.marginLeft},0)`)
      .call(d3.axisLeft(this.yscale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(yAxisLabel);

    this.svg
      .append('g')
      .attr('transform', `translate(${this.marginLeft},0)`)
      .call(d3.axisLeft(this.yscale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(
        this.selectedFeature.charAt(0).toUpperCase() +
          this.selectedFeature.slice(1)
      );

    // Create boxplots
    const boxWidth = this.xscale.bandwidth();

    const boxplots = this.svg
      .selectAll('g.boxplot')
      .data(boxplotData)
      .enter()
      .append('g')
      .attr('class', 'boxplot')
      .attr(
        'transform',
        (d: BoxplotStats) => `translate(${this.xscale(d.year.toString())},0)`
      );

    // Draw vertical lines (whiskers)
    boxplots
      .append('line')
      .attr('x1', boxWidth / 2)
      .attr('x2', boxWidth / 2)
      .attr('y1', (d: BoxplotStats) => this.yscale(d.min))
      .attr('y2', (d: BoxplotStats) => this.yscale(d.max))
      .style('stroke', 'black');

    // Draw boxes
    boxplots
      .append('rect')
      .attr('x', 0)
      .attr('width', boxWidth)
      .attr('y', (d: BoxplotStats) => this.yscale(d.q3))
      .attr(
        'height',
        (d: BoxplotStats) => this.yscale(d.q1) - this.yscale(d.q3)
      )
      .style('fill', 'steelblue')
      .style('stroke', 'black');

    // Draw median lines
    boxplots
      .append('line')
      .attr('x1', 0)
      .attr('x2', boxWidth)
      .attr('y1', (d: BoxplotStats) => this.yscale(d.median))
      .attr('y2', (d: BoxplotStats) => this.yscale(d.median))
      .style('stroke', 'black')
      .style('stroke-width', '2px');

    // Draw outliers with tooltips
    boxplots.each((d: BoxplotStats, i: number, nodes: any[]) => {
      d3.select(nodes[i])
        .selectAll('circle.outlier')
        .data(d.outlierData)
        .enter()
        .append('circle')
        .attr('class', 'outlier')
        .attr('cx', boxWidth / 2)
        .attr('cy', (data: OutlierData) => this.yscale(data.value))
        .attr('r', 3)
        .style('fill', 'red')
        .style('stroke', 'none')
        .on('mouseover', (event: MouseEvent, data: OutlierData) => {
          this.tooltip.transition().duration(200).style('opacity', 0.9);
          this.tooltip
            .html(
              `
              <strong>${data.track.name}</strong><br/>
              by ${data.track.artists.join(', ')}<br/>
              ${this.selectedFeature}: ${data.value.toFixed(2)}
            `
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px');
        })
        .on('mouseout', () => {
          this.tooltip.transition().duration(500).style('opacity', 0);
        });
    });
  }

  onFeatureSelect(): void {
    this.createBoxplot();
  }
}
