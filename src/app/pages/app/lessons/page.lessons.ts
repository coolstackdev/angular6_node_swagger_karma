import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ApiService} from '../../../services/api.service';
import {DialogService} from '../../../services/dialog.service';

@Component({
    selector: 'app-page-lessons',
    templateUrl: './page.lessons.pug',
    styleUrls: ['./page.lessons.scss']
})

export class PageLessons implements OnInit {
    lessons: any = [];
    lessonsDataHeader = [
        // {header: 'table.id', property: '_id'},
        {header: 'table.title', property: 'title'},
        {header: 'table.lesson-subtitle', property: 'subtitle'},
        {header: 'table.subject', property: 'subjectName'},
        {header: 'table.grade', property: 'gradeDescription'},
        // {header: 'table.sections', property: 'sectionsLength'},
        {header: 'table.actions', actions: ['create', 'remove']}
    ];
    reducer: object = (accum, currentValue) => accum ? `${accum}, `  + currentValue.category : accum + currentValue.category;

    constructor(private apiService: ApiService, private dialogService: DialogService,
                private translate: TranslateService, private router: Router) {
        this.translate.onLangChange.subscribe(() => this.parseLessons(this.lessons));
    }

    ngOnInit() {
        this.getLessons();
    }

    parseLessons(data) {
        this.lessons = data.map(lesson => {
            if (lesson.subject) {
                lesson.subjectName = lesson.subject.name[this.translate.currentLang];
            }

            if (lesson.grade) {
                lesson.gradeDescription = lesson.grade.reduce(this.reducer, '');
            }
            // lesson.sectionsLength = lesson.sections.length;
            return lesson;
        });
    }

    getLessons() {
        this.apiService.lessonsManageGET().then((data) => {
            if (data.lessons) {
                this.parseLessons(data.lessons);
            }
        });
    }

    editLesson(lesson?) {
        this.router.navigate(['/app/lesson/' + lesson._id]);
    }

    deleteLesson(lesson?) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe((ok) => {
            if (ok) {
                this.apiService.lessonDELETE([lesson._id]).then((data) => {
                    if (data.success) {
                        this.getLessons();
                    }
                });
            }
        });
    }
}
