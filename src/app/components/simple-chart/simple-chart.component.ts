import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Chart } from 'chart.js';
import { ColorService } from 'src/app/services/color.service';

@Component({
  selector: 'app-simple-chart',
  templateUrl: './simple-chart.component.html',
  styleUrls: ['./simple-chart.component.css']
})
export class SimpleChartComponent implements OnInit, AfterViewInit {

  @ViewChild('chartCanvas', { read: ElementRef }) chartCanvas: ElementRef;
  @Input() data: number[];
  backgroundColor = 'lightgrey';

  constructor(
    private cs: ColorService
  ) { }

  ngOnInit(): void {
    this.cs.color.subscribe((color: string) => {
      this.backgroundColor = color;
    });
  }

  ngAfterViewInit(): void {
    const context = this.chartCanvas.nativeElement.getContext('2d');
    const chart = new Chart(context, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: this.data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

}
