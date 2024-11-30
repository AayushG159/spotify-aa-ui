import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import * as d3 from "d3";
import spotify_tracks from '../data/spotify_tracks.json'
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from "@angular/forms";
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

@Component({
    selector: 'scatter-plot',
    templateUrl: './scatter-plot.component.html',
    styleUrl: './scatter-plot.component.css',
    imports: [
        MatRadioModule,
        FormsModule,
        AgGridAngular
    ]
})
export class ScatterPlotComponent implements AfterViewInit {

    @ViewChild('scatterPlotContainer', { static: true }) container!: ElementRef;

    width = window.innerWidth - 600;
    height = window.innerHeight - 200;
    marginTop = 20;
    marginRight = 20;
    marginBottom = 20;
    marginLeft = 70;

    startDate = new Date("2009-01-01");
    endDate = new Date("2024-01-01");

    firstFeature = 'tempo';
    secondFeature = '';

    dotSizeMin = 5;
    dotSizeMax = 15;

    svg: any;
    xscale: any;
    yscale: any;
    dot: any;
    brushSelected: any = [];

    colDefs: ColDef[] = [
        { field: "name", headerName: 'Song Name', flex: 1 },
        { field: "artists", headerName: 'Artists', valueGetter: (track: any) => track.data.artists.join(", "), flex: 1.5 },
        { field: "duration_ms", headerName: 'Duration (ms)', flex: 1.5 },
        { field: "year", headerName: 'Year', flex: 1 },
        { field: "ranking", headerName: 'Billboard Ranking', flex: 1 },
        { field: "danceability", headerName: 'Danceability', flex: 1 },
        { field: "energy", headerName: 'Energy', flex: 1 },
        { field: "loudness", headerName: 'Loudness', flex: 1 },
        { field: "speechiness", headerName: 'Speechiness', flex: 1 },
        { field: "acousticness", headerName: 'Acousticness', flex: 1 },
        // { field: "instrumentalness", headerName: 'Instrumentalness', flex: 1 },
        { field: "liveness", headerName: 'Liveness', flex: 1 },
        { field: "valence", headerName: 'Valence', flex: 1 },
        { field: "tempo", headerName: 'Tempo', flex: 1 }
    ];

    constructor() { }

    ngAfterViewInit(): void {
        this.createContainer();
        this.createXAxis();
        this.refreshYAxis();
    }

    createContainer() {
        // Create the SVG container.
        this.svg = d3.create("svg")
            .attr("width", this.width)
            .attr("height", this.height + 100);

        // listening to brush input change
        this.svg.on("input", () => {
            this.brushSelected = this.svg.property("value");
        });

        this.container.nativeElement.appendChild(this.svg.node());
    }

    createXAxis() {
        // Declare the x scale.
        this.xscale = d3.scaleUtc()
            .domain([this.startDate, this.endDate])
            .range([this.marginLeft, this.width - this.marginRight]);

        // added x-axis
        this.svg.append("g")
            .attr("transform", `translate(0,${this.height - this.marginBottom})`)
            .call(d3.axisBottom(this.xscale).ticks(20));

        // added x-axis label
        this.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("id", "x-axis-label")
            .attr("x", (this.marginLeft + this.width - this.marginRight) / 2)
            .attr("y", this.height + 25) // 25 Padding down
            .text("Year")
            .style("fill", "black");
    }

    clearPlot() {
        if (this.svg) {
            this.svg.selectAll("circle").remove();
            this.svg.select("#y-axis-label").remove();
            this.svg.select("#y-axis").remove();
            console.log("All dots cleared");
        }
    }

    clearBrush() {
        if (this.svg) {
            this.svg.select(".brush").call(d3.brush().move, null);
            this.dot.style("stroke", "steelblue");
            this.svg.property("value", []).dispatch("input");
        }
    }

    onFirstSelect(): void {
        this.clearPlot();
        this.clearBrush();
        this.refreshYAxis();

        // resetting 2nd feature selection as new 1st feature selection creates new dots after clearing grid
        this.secondFeature = '';
    }

    onSecondSelect(): void {
        if (this.dot) {
            let featureValues = spotify_tracks.map((track: any) => track[this.secondFeature]);
            let featureMin = d3.min(featureValues);
            let featureMax = d3.max(featureValues);
            const oldRange = featureMax - featureMin;
            const newRange = this.dotSizeMax - this.dotSizeMin;
            this.dot.attr('r', (track: any) => {
                const radius = (((track[this.secondFeature] - featureMin) * newRange) / oldRange) + this.dotSizeMin;
                return radius;
            });
        }
        this.clearBrush();
    }

    refreshYAxis() {
        {
            let featureValues = spotify_tracks.map((track: any) => track[this.firstFeature])

            // Declare the y (vertical position) scale.
            this.yscale = d3.scaleLinear()
                .domain([d3.min(featureValues), d3.max(featureValues)])
                .range([this.height - this.marginBottom, this.marginTop]);
        }

        // Add the y-axis.
        this.svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${this.marginLeft},0)`)
            .call(d3.axisLeft(this.yscale).ticks(10));

        {
            let yLabel = this.firstFeature.charAt(0).toUpperCase() + this.firstFeature.slice(1).toLowerCase();
            // added y-axis label
            this.svg.append("text")
                .attr("text-anchor", "middle")
                .attr("id", "y-axis-label")
                .attr("x", -this.height / 2) // Negative because of rotation
                .attr("y", this.marginLeft / 2) // Position close to the y-axis
                .attr("transform", "rotate(-90)") // Rotate counter-clockwise
                .text(yLabel)
                .style("fill", "black");
        }

        // added scatter points for each record
        this.dot = this.svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(spotify_tracks)
            .join("circle")
            // .attr("transform", (track: any) => `translate(${this.xscale(new Date(track["year"].toString()))},${this.yscale(track[this.firstFeature])})`)
            .attr("transform", (track: any) => {
                const jitter = (Math.random() - 0.5) * (this.width / 20); // Adjust the divisor to control the spread
                return `translate(${this.xscale(new Date(track["year"].toString())) + jitter},${this.yscale(track[this.firstFeature])})`;
            })
            .attr("r", this.dotSizeMin);

        // Create the brush behavior.
        this.svg.append("g")
            .attr("class", "brush")
            .call(d3.brush().on("end", ({ selection }) => {
                let value = [];
                if (selection) {
                    const [[x0, y0], [x1, y1]] = selection;
                    value = this.dot
                        .style("stroke", "gray")
                        .filter((d: any, i: number, nodes: any) => {
                            // Retrieve the current circle's transformed position
                            const circle = d3.select(nodes[i]);
                            const transform = circle.attr("transform");

                            // Use a fallback if the match fails (default to no selection)
                            const match = transform?.match(/translate\(([\d.]+),([\d.]+)\)/);
                            if (!match) return false; // Skip this point if transform is null or invalid

                            const [, tx, ty] = match.map(Number);

                            // Check if the transformed position is within the brush selection
                            return x0 <= tx && tx < x1 && y0 <= ty && ty < y1;
                        })
                        .style("stroke", "steelblue")
                        .data();
                } else {
                    this.dot.style("stroke", "steelblue");
                }

                // Inform downstream cells that the selection has changed.
                this.svg.property("value", value).dispatch("input");
            }));
    }



}