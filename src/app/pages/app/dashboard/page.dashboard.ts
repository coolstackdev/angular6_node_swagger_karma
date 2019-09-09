import {Component, Input, OnInit} from '@angular/core';
import {LocalStorageService} from 'ngx-webstorage';
import {Router} from '@angular/router';

import {ApiService} from '../../../services/api.service';
// chart.component.ts
import * as CanvasJS from './canvasjs.min';
import * as moment from 'moment'

@Component({
    selector: 'app-page-dashboard',
    templateUrl: './page.dashboard.pug',
    styleUrls: ['./page.dashboard.scss']
})

export class PageDashboard implements OnInit {

    user: any

    countsByDate: any = []
    countToday: Number
    dateArray: any = []
    diffDate: Number
    
    startDate = new Date(new Date().setDate(new Date().getDate()-30))
    endDate = new Date()

    constructor(private apiService: ApiService, private router: Router, private storage: LocalStorageService) {
    }

    async ngOnInit() {

        this.user = this.storage.retrieve('user')

        var endDate = new Date()
        var startDate = new Date(new Date().setDate(new Date().getDate()-30))
        var ssdd = moment(startDate).format('YYYY-MM-DD')
        var eedd = moment(endDate).format('YYYY-MM-DD')

        await this.getCountStudentsByDate(ssdd, eedd)
        this.dateArray = this.dateArray.sort()
        var eedda = moment(new Date().setDate(endDate.getDate() + 1)).format('YYYY-MM-DD')
        await this.getCountToday(eedd, eedda)
        this.showChart(startDate, endDate)
    }

    showChart(start, end) {
        var oneDay = 24*60*60*1000
        var diffDays = Math.round(Math.abs((start.getTime() - end.getTime())/(oneDay)))

        let chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: true,
            exportEnabled: true,
            title: {
                text: "Number of students registered last " + diffDays + " days"
            },
            data: [{
                type: "column",
                dataPoints: [
                    
                ]
            }]
        });
        for(var i = 0 ; i < diffDays ; i++) {
            chart.options.data[0].dataPoints.push({y: this.countsByDate[i], label: this.dateArray[i], color: "RoyalBlue"})
        }
        chart.render();
    }

    async showChartByDate(start, end) {
        var ssdd = moment(start).format('YYYY-MM-DD')
        var eedd = moment(end).format('YYYY-MM-DD')
        await this.getCountStudentsByDate(ssdd, eedd)
        this.dateArray = this.dateArray.sort()
        var oneDay = 24*60*60*1000
        var diffDays = Math.round(Math.abs((start.getTime() - end.getTime())/(oneDay)))

        let chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: true,
            exportEnabled: true,
            title: {
                text: "Number of students registered last " + diffDays +  " days"
            },
            data: [{
                type: "column",
                dataPoints: [
                    
                ]
            }]
        });
        for(var i = 0 ; i < diffDays ; i++) {
            chart.options.data[0].dataPoints.push({y: this.countsByDate[i], label: this.dateArray[i], color: "RoyalBlue"})
        }
        chart.render();
    }

    async getCountStudentsByDate(start, end) {
        await this.apiService.usersByDateGET(start, end).then((data) => {
            if(data.counts.length == 0) {
                alert("No registered users are existing!")
            }
            this.countsByDate = data.counts
            this.dateArray = data.dateArray.map((date) => {
                return date = this.sortDateArray(date)
            })
        })
    }

    async getCountToday(today, tomorrow) {
        await this.apiService.usersByDateGET(today, tomorrow).then((data) => {
            if(data.counts.length == 0) {
                this.countToday = 0
            } else {
                this.countToday = data.counts
            }
        })
    }

    sortDateArray(date) {
        var new_date = date.split("-")
        if(new_date[1] < 10)
            new_date[1] = "0" + new_date[1]
        if(new_date[2] < 10)
            new_date[2] = "0" + new_date[2]
        return new_date[0] + '-' + new_date[1] + '-' + new_date[2]
    }
}
