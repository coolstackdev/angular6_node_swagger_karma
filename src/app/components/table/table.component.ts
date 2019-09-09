import {Component, EventEmitter, OnChanges, Input, Output, OnInit} from '@angular/core';

@Component({
    selector: 'app-table',
    templateUrl: './table.component.pug'
})

export class TableComponent implements OnChanges, OnInit {
    @Input() data: Array<any> = [];
    @Input() dataHeader: Array<any> = [];
    @Output() create = new EventEmitter<undefined>();
    @Output() setCash = new EventEmitter<undefined>();
    @Output() delete = new EventEmitter<undefined>();
    @Output() copy = new EventEmitter<undefined>();
    @Output() remove = new EventEmitter<undefined>();
    @Output() apply = new EventEmitter<undefined>();
    @Output() send = new EventEmitter<undefined>();
    @Output() review = new EventEmitter<undefined>();
    @Output() doubleClick = new EventEmitter<undefined>();
    @Output() statusChanged = new EventEmitter<undefined>();
    itemResource: Array<any> = [];
    filter: string;
    itemCount = 0;
    params: any = {
        sortAsc: true,
        sortBy: "index"
    };
    items: Array<any> = [];
    finished = false;

    constructor() {
    }

    ngOnInit(): void {
        this.addIndex();
    }

    ngOnChanges(e) {
        this.addIndex();
        if (e.data.previousValue) {
            this.finished = true;
            setTimeout(() => {
                this.itemResource = this.data.reverse().map((item, i) => {
                    item['index'] = i + 1;
                    return item;
                });
                this.itemCount = this.itemResource.length;
                this.reloadItems(this.params);
            });
        }
    }

    addIndex() {
        if (this.dataHeader && this.dataHeader.every(col => col.header !== 'index')) {
            this.dataHeader.unshift({header: 'index', property: 'index', sortable: true});
        }
    }

    reloadItems(params) {
        if (params) {
            this.params = params;
            let items = this.itemResource;
            if (this.filter) {
                items = items.filter(item => {
                    let result = false;
                    Object.keys(item).map((val) => {
                        let value = item[val];
                        if (typeof value === 'number') {
                            value = value.toString();
                        }
                        if (typeof value === 'string' && value.toLowerCase().indexOf(this.filter.toLowerCase()) >= 0) {
                            result = true;
                        }
                    });
                    return result;
                });
            }
            if (params.sortBy) {
                items.sort((a, b) => {
                    if (params.sortAsc) {
                        return a[params.sortBy] < b[params.sortBy] ? 1 : -1;
                    } else {
                        return a[params.sortBy] > b[params.sortBy] ? 1 : -1;
                    }
                });
            }
            items = items.filter((item, i) => {
                return i >= params.offset && i <= params.limit + params.offset - 1;
            });
            setTimeout(() => {
                this.items = items;
            });
        }
    }

    filterItems(value) {
        this.filter = value;
        this.reloadItems(this.params);
    }

    itemStatusChanged(item, el) {
        el.source.setDisabledState(true);
        // this.dialogService.confirm('form.submit.titleSure', item.fullName).subscribe((res) => {
        //     if (res) {
        //         item.status = !item.status;
        //         this.statusChanged.emit(item);
        //     } else {
        //         item.status = !!item.status;
        //     }
        //     el.source.checked = item.status;
        //     el.source.setDisabledState(false);
        // });
    }
}
