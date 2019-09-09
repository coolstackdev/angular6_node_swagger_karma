import {Component, EventEmitter, Output, Input, ViewChild, ElementRef} from '@angular/core';
import {ApiService} from '../../services/api.service';

@Component({
    selector: 'app-upload-icon',
    templateUrl: './upload-icon.component.pug',
    styleUrls: ['./upload-icon.scss']
})

export class UploadIconComponent {
    @Output() iconOnLoaded = new EventEmitter<{ icon: string }>();
    @Input() icon: string;
    @ViewChild('fileInput')
    fileInput: ElementRef;

    constructor(private apiService: ApiService) {
    }

    processWebImage(): void {
        const imgEl = this.fileInput.nativeElement;
        if (imgEl.files && imgEl.files[0]) {
            const formData = new FormData();
            formData.append('file', imgEl.files[0]);
            this.apiService.fileReference(formData).then((data) => this.iconOnLoaded.emit({'icon': data.data.url}));
        }
    }

    getIcon(): void {
        this.fileInput.nativeElement.click();
    }
}
