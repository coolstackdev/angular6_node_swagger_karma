import {MatDialogRef, MatDialog} from '@angular/material';
import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';

import {DialogConfirmComponent} from '../components/dialog-confirm/dialog-confirm.component';
import {DialogQuestionComponent} from '../components/dialog-question/dialog-question.component';
import {DialogUserSetComponent} from '../components/dialog-user-set/dialog-user-set.component';
import {DialogSchoolSetComponent} from '../components/dialog-school-set/dialog-school-set.component';
import {DialogSubjectSetComponent} from '../components/dialog-subject-set/dialog-subject-set.component';
import {DialogGradeSetComponent} from '../components/dialog-grade-set/dialog-grade-set.component';
import {DialogStudentAssignToQuizComponent} from '../components/dialog-student-assign-to-quiz/dialog-student-assign-to-quiz.component';
import {DialogQuizResultComponent} from '../components/dialog-quiz-result/dialog-quiz-result.component';
import {DialogSubscriptionSetComponent} from '../components/dialog-subscription-set/dialog-subscription-set.component';
import {DialogCallbackSetComponent} from '../components/dialog-callback-set/dialog-callback-set.component';
import {DialogCompanySetComponent} from '../components/dialog-company-set/dialog-company-set.component';
import {DialogOfflinePaymentActivateComponent} from '../components/dialog-offline-payment-activate/dialog-offline-payment-activate.component';
import {DialogQuestionReviewedComponent} from '../components/dialog-question-reviewed/dialog-question-reviewed.component';
import {DialogNoticeSetComponent} from '../components/dialog-notice-set/dialog-notice-set.component';
import {DialogAlertComponent} from '../components/dialog-alert/dialog-alert.component';
import {DialogUserCashComponent} from '../components/dialog-user-cash/dialog-user-cash.component';

// import {DialogQuizSetComponent} from '../components/dialog-quiz-set/dialog-quiz-set.component';

@Injectable()
export class DialogService {

    constructor(private dialog: MatDialog, private translate: TranslateService) {
    }

    public confirm(title: string, message: string): Observable<boolean> {

        let dialogRef: MatDialogRef<DialogConfirmComponent>;

        dialogRef = this.dialog.open(DialogConfirmComponent);
        dialogRef.componentInstance.title = this.translate.instant(title);
        dialogRef.componentInstance.message = this.translate.instant(message);

        return dialogRef.afterClosed();
    }

    public userCash(user): Observable<any> {

        let dialogRef: MatDialogRef<DialogUserCashComponent>;

        dialogRef = this.dialog.open(DialogUserCashComponent, {
            minWidth: '300px'
        });

        dialogRef.componentInstance.user = user;

        return dialogRef.afterClosed();
    }

    public alert(message: string): Observable<boolean> {

        let dialogRef: MatDialogRef<DialogAlertComponent>;

        dialogRef = this.dialog.open(DialogAlertComponent);
        dialogRef.componentInstance.message = this.translate.instant(message);

        return dialogRef.afterClosed();
    }

    dialogQuestion(question: any): Observable<any> {
        const me = this;
        let dialogRef: MatDialogRef<DialogQuestionComponent>;

        dialogRef = this.dialog.open(DialogQuestionComponent);
        dialogRef.componentInstance.selfClose = function (options?) {
            if (options) {
                dialogRef.close();
            } else {
                me.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((status) => {
                    if (status) {
                        dialogRef.close();
                    }
                });
            }
        };
        dialogRef.componentInstance.question = question;
        return dialogRef.afterClosed();
    }

    dialogQuestionReview(question: any): Observable<any> {
        const me = this;
        let dialogRef: MatDialogRef<DialogQuestionReviewedComponent>;

        dialogRef = this.dialog.open(DialogQuestionReviewedComponent);
        dialogRef.componentInstance.selfClose = function (options?) {
            dialogRef.close();
        };
        dialogRef.componentInstance.question = question;
        return dialogRef.afterClosed();
    }

    dialogUserSet(roles: any, schools: any, referrals: any, user: any): Observable<any> {
        const me = this;
        let dialogRef: MatDialogRef<DialogUserSetComponent>;

        dialogRef = this.dialog.open(DialogUserSetComponent);
        dialogRef.componentInstance.selfClose = function (options?) {
            if (options) {
                if (options.success) {
                    dialogRef.close();
                } else {
                    me.alert('errors.' + options.errorCode);
                }
            } else {
                me.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((status) => {
                    if (status) {
                        dialogRef.close();
                    }
                });
            }
        };
        dialogRef.componentInstance.roles = roles;
        dialogRef.componentInstance.schools = schools;
        dialogRef.componentInstance.referrals = referrals;
        dialogRef.componentInstance.user = user;
        return dialogRef.afterClosed();
    }

    dialogSchoolSet(school: any): Observable<any> {
        const me = this;
        let dialogRef: MatDialogRef<DialogSchoolSetComponent>;

        dialogRef = this.dialog.open(DialogSchoolSetComponent);
        dialogRef.componentInstance.selfClose = function (options?) {
            if (options) {
                dialogRef.close();
            } else {
                me.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((status) => {
                    if (status) {
                        dialogRef.close();
                    }
                });
            }
        };
        dialogRef.componentInstance.school = school;
        return dialogRef.afterClosed();
    }

    dialogSubjectSet(subject: any, subjects: any): Observable<any> {
        const me = this;
        let dialogRef: MatDialogRef<DialogSubjectSetComponent>;

        dialogRef = this.dialog.open(DialogSubjectSetComponent);
        dialogRef.componentInstance.selfClose = function (options?) {
            if (options) {
                dialogRef.close();
            } else {
                me.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((status) => {
                    if (status) {
                        dialogRef.close();
                    }
                });
            }
        };
        dialogRef.componentInstance.subject = subject;
        dialogRef.componentInstance.subjects = subjects;
        return dialogRef.afterClosed();
    }

    dialogGradeSet(grade: any): Observable<any> {
        const me = this;
        let dialogRef: MatDialogRef<DialogGradeSetComponent>;

        dialogRef = this.dialog.open(DialogGradeSetComponent);
        dialogRef.componentInstance.selfClose = function (options?) {
            if (options) {
                dialogRef.close();
            } else {
                me.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((status) => {
                    if (status) {
                        dialogRef.close();
                    }
                });
            }
        };
        dialogRef.componentInstance.grade = grade;
        return dialogRef.afterClosed();
    }

    dialogCallbackSet(callback: any): Observable<any> {
        const me = this;
        let dialogRef: MatDialogRef<DialogCallbackSetComponent>;

        dialogRef = this.dialog.open(DialogCallbackSetComponent);
        dialogRef.componentInstance.selfClose = function (options?) {
            if (options) {
                dialogRef.close();
            } else {
                me.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((status) => {
                    if (status) {
                        dialogRef.close();
                    }
                });
            }
        };
        dialogRef.componentInstance.callback = callback;
        return dialogRef.afterClosed();
    }

    dialogStudentAssignToQuiz(quizzes: any[], students: any[], isExams?: boolean, quizAnswer?: any) {
        const me = this;
        let dialogRef: MatDialogRef<DialogStudentAssignToQuizComponent>;

        dialogRef = this.dialog.open(DialogStudentAssignToQuizComponent);
        dialogRef.componentInstance.selfClose = function (options?) {
            if (options) {
                dialogRef.close();
            } else {
                me.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((status) => {
                    if (status) {
                        dialogRef.close();
                    }
                });
            }
        };
        dialogRef.componentInstance.students = students;
        dialogRef.componentInstance.quizzes = quizzes;
        dialogRef.componentInstance.isExams = isExams;
        dialogRef.componentInstance.quizAnswer = quizAnswer;
        return dialogRef.afterClosed();
    }

    dialogQuizResult(answers: any): Observable<any> {
        const me = this;
        let dialogRef: MatDialogRef<DialogQuizResultComponent>;

        dialogRef = this.dialog.open(DialogQuizResultComponent);
        dialogRef.componentInstance.selfClose = function () {
            dialogRef.close();
        };
        dialogRef.componentInstance.answers = answers;
        return dialogRef.afterClosed();
    }

    dialogSubscriptionSet(subscription, currencies) {
        const me = this;
        let dialogRef: MatDialogRef<DialogSubscriptionSetComponent>;

        dialogRef = this.dialog.open(DialogSubscriptionSetComponent);
        dialogRef.componentInstance.currencies = currencies;
        dialogRef.componentInstance.selfClose = function (options?) {
            if (options) {
                dialogRef.close();
            } else {
                me.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((status) => {
                    if (status) {
                        dialogRef.close();
                    }
                });
            }
        };
        dialogRef.componentInstance.subscription = subscription;
        return dialogRef.afterClosed();
    }

    dialogCompanySet(company?) {
        const me = this;
        let dialogRef: MatDialogRef<DialogCompanySetComponent>;

        dialogRef = this.dialog.open(DialogCompanySetComponent);
        dialogRef.componentInstance.selfClose = function (action, options) {
            let hasData = false;
            Object.keys(options).some((val) => hasData = !!options[val]);
            if (hasData) {
                if (action) {
                    dialogRef.close(options);
                } else {
                    me.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((status) => {
                        if (status) {
                            dialogRef.close();
                        }
                    });
                }
            } else {
                dialogRef.close();
            }
        };
        dialogRef.componentInstance.company = company;
        return dialogRef.afterClosed();
    }

    dialogNoticeSet(notice: any) {
        const me = this;
        let dialogRef: MatDialogRef<DialogNoticeSetComponent>;

        dialogRef = this.dialog.open(DialogNoticeSetComponent);
        dialogRef.componentInstance.selfClose = function (action, options) {
            let hasData = false;
            Object.keys(options).some((val) => hasData = !!options[val]);
            if (hasData) {
                if (action) {
                    dialogRef.close(options);
                } else {
                    me.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((status) => {
                        if (status) {
                            dialogRef.close();
                        }
                    });
                }
            } else {
                dialogRef.close();
            }
        };
        dialogRef.componentInstance.notice = notice;
        return dialogRef.afterClosed();
    }

    dialogOfflinePaymentActivate(payment) {
        const me = this;
        let dialogRef: MatDialogRef<DialogOfflinePaymentActivateComponent>;

        dialogRef = this.dialog.open(DialogOfflinePaymentActivateComponent);
        dialogRef.componentInstance.selfClose = function (options?) {
            if (options) {
                dialogRef.close();
            } else {
                me.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((status) => {
                    if (status) {
                        dialogRef.close();
                    }
                });
            }
        };
        dialogRef.componentInstance.payment = payment;
        return dialogRef.afterClosed();
    }
}
