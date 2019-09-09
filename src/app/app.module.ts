import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {RestangularModule} from 'ngx-restangular';
import {LocalStorageService, Ng2Webstorage} from 'ngx-webstorage';
import {TranslateModule, TranslateLoader, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SocketIoModule, SocketIoConfig} from 'ngx-socket-io';
import {Ng2UiAuthModule} from 'ng2-ui-auth';
import {DataTableModule} from 'ng2-datatable-bootstrap4';
import {FroalaEditorModule, FroalaViewModule} from 'angular-froala-wysiwyg';
// Chart Module

// MATERIAL DESIGN
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatTableModule} from '@angular/material/table';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatRadioModule} from '@angular/material/radio';
// PAGES
import {PageLogin} from './pages/login/page.login';
import {PageSignUp} from './pages/sign-up/page.sign-up';
import {PageApp} from './pages/app/page.app';
import {PageAdmin} from './pages/app/admin/page.admin';
import {PageAdminUsers} from './pages/app/admin/users/page.users';
import {PageAdminSchools} from './pages/app/admin/schools/page.schools';
import {PageAdminSubjects} from './pages/app/admin/subjects/page.subjects';
import {PageDashboard} from './pages/app/dashboard/page.dashboard';
import {PageLessons} from './pages/app/lessons/page.lessons';
import {PageLessonSet} from './pages/app/lesson-set/page.lesson-set';
import {PageForgotPassword} from './pages/forgot-password/page.forgot-password';
import {PageStudentsList} from './pages/app/students-list/page.students-list';
import {PageProfileEdit} from './pages/app/profile-edit/page.profile-edit';
import {PageAdminGrade} from './pages/app/admin/grade/page.grade';
import {PageQuizzes} from './pages/app/quizzes/page.quizzes';
import {PageQuizSet} from './pages/app/quiz-set/page.quiz-set';
import {PageHomework} from './pages/app/homework/page.homework';
import {PageQuestion} from './pages/app/question/page.question';
import {PageExams} from './pages/app/exams/page.exams';
import {PageChatManagement} from './pages/app/chat-management/page.chat-management';
import {PageAdminSubscriptions} from './pages/app/admin/subscriptions/page.subscriptions';
import {PageAdminOfflinePayments} from './pages/app/admin/offline-payments/page.offline-payments';
import {PageAdminOrangePayments} from './pages/app/admin/orange-payments/page.orange-payments';
import {PageAdminPayPalPayments} from './pages/app/admin/paypal-payments/page.paypal-payments';
import {PageCallbacks} from './pages/app/callbacks/page.callbacks';
import {AdminNoticeBoardComponent} from './pages/app/admin/notice-board/page.notice-board';


// COMPONENTS
import {AppRoutesModule} from './routes.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './components/login/login.component';
import {SignUpComponent} from './components/sign-up/sign-up.component';
import {HeaderComponent} from './components/app/header/header.component';
import {TableComponent} from './components/table/table.component';
import {DialogConfirmComponent} from './components/dialog-confirm/dialog-confirm.component';
import {DialogQuestionComponent} from './components/dialog-question/dialog-question.component';
import {DialogQuestionReviewedComponent} from './components/dialog-question-reviewed/dialog-question-reviewed.component';
import {DialogUserSetComponent} from './components/dialog-user-set/dialog-user-set.component';
import {DialogSchoolSetComponent} from './components/dialog-school-set/dialog-school-set.component';
import {DialogGradeSetComponent} from './components/dialog-grade-set/dialog-grade-set.component';
import {DialogCallbackSetComponent} from './components/dialog-callback-set/dialog-callback-set.component';
import {DialogSubjectSetComponent} from './components/dialog-subject-set/dialog-subject-set.component';
import {DialogStudentAssignToQuizComponent} from './components/dialog-student-assign-to-quiz/dialog-student-assign-to-quiz.component';
import {DialogQuizResultComponent} from './components/dialog-quiz-result/dialog-quiz-result.component';
import {DialogSubscriptionSetComponent} from './components/dialog-subscription-set/dialog-subscription-set.component';
import {DialogOfflinePaymentActivateComponent} from './components/dialog-offline-payment-activate/dialog-offline-payment-activate.component'; // tslint:disable-line
import {DialogCompanySetComponent} from './components/dialog-company-set/dialog-company-set.component';
import {RefillPointsComponent} from './components/refill-points/refill-points.component';
import {DialogAlertComponent} from './components/dialog-alert/dialog-alert.component';
// import {QuestionsSetComponent} from './components/questions-set/questions-set.component';
import {QuestionElementComponent} from './components/quiestion-element/quiestion-element.component';
import {DialogNoticeSetComponent} from './components/dialog-notice-set/dialog-notice-set.component';

// SERVICES
import {ApiService, RestangularConfigFactory} from './services/api.service';
import {DialogService} from './services/dialog.service';
import {StaticService} from './services/static-data.service';

import {DomSanitizer} from '@angular/platform-browser';
import {environment} from '../environments/environment';
import {IconsModel} from './models/icons.model';

// DIRECTIVES
import {CustomMaxDirective, CustomMinDirective} from './directives/min-max-age-validation.directive';
import {PageAdminSettings} from './pages/app/admin/settings/page.settings';
import {CallbackLimitComponent} from './components/callback-limit/callback-limit.component';
import {UploadIconComponent} from './components/upload-icon/upload-icon.component';
import {SocialSettingsComponent} from './components/social-settings/social-settings.component';
import {SafeHtmlPipe} from './pipes/safe-html.pipe';
import {PageIdeas} from './pages/app/admin/ideas/page.ideas';
import {PagePaymentStatus} from './pages/payment-status/page.payment-status';
import {DialogUserCashComponent} from './components/dialog-user-cash/dialog-user-cash.component';
import {PageAdminUserRankList} from './pages/app/admin/user-rank-list/page.user-rank-list';


const useFactory = ((http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'));
const socketConfig: SocketIoConfig = {url: environment.socketIOUrl, options: {}};

@NgModule({
    declarations: [
        // PAGES
        PageLogin,
        PageSignUp,
        PageApp,
        PageAdmin,
        PageAdminUsers,
        PageAdminUserRankList,
        PageAdminSchools,
        PageAdminSubjects,
        PageAdminSubscriptions,
        PageDashboard,
        PageLessons,
        PageLessonSet,
        PageForgotPassword,
        PageStudentsList,
        PageProfileEdit,
        PageAdminGrade,
        PageQuizzes,
        PageQuizSet,
        PageHomework,
        PageQuestion,
        PageExams,
        PageChatManagement,
        PageAdminOfflinePayments,
        PageAdminOrangePayments,
        PageAdminPayPalPayments,
        PageAdminSettings,
        PageCallbacks,
        AdminNoticeBoardComponent,
        PageIdeas,
        PagePaymentStatus,
        // COMPONENTS
        AppComponent,
        LoginComponent,
        SignUpComponent,
        HeaderComponent,
        TableComponent,
        DialogConfirmComponent,
        DialogUserCashComponent,
        DialogQuestionComponent,
        DialogQuestionReviewedComponent,
        DialogUserSetComponent,
        DialogSchoolSetComponent,
        DialogGradeSetComponent,
        DialogSubjectSetComponent,
        DialogStudentAssignToQuizComponent,
        DialogQuizResultComponent,
        QuestionElementComponent,
        DialogSubscriptionSetComponent,
        DialogOfflinePaymentActivateComponent,
        DialogCallbackSetComponent,
        DialogCompanySetComponent,
        DialogNoticeSetComponent,
        DialogAlertComponent,
        CallbackLimitComponent,
        UploadIconComponent,
        RefillPointsComponent,
        SocialSettingsComponent,
        // DIRECTIVES
        CustomMaxDirective,
        CustomMinDirective,
        // PIPES
        SafeHtmlPipe
    ],
    imports: [
        AppRoutesModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RestangularModule.forRoot(RestangularConfigFactory),
        Ng2Webstorage,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: useFactory,
                deps: [HttpClient]
            }
        }),
        FlexLayoutModule,
        FormsModule, ReactiveFormsModule,
        SocketIoModule.forRoot(socketConfig),
        Ng2UiAuthModule.forRoot({
            providers: {
                facebook: {
                    clientId: environment.socialIDs.facebook,
                    url: environment.baseUrl + 'login/facebook',
                    redirectUri: environment.redirectUrl + '/',
                    scope: ['public_profile', 'email']
                },
                google: {
                    clientId: environment.socialIDs.google,
                    url: environment.baseUrl + 'login/google',
                    redirectUri: environment.redirectUrl,
                    scope: ['profile', 'email']
                }
            }
        }),
        DataTableModule,
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
        // MATERIAL DESIGN
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        MatListModule,
        MatMenuModule,
        MatTableModule,
        MatCardModule,
        MatListModule,
        MatSidenavModule,
        MatDialogModule,
        MatAutocompleteModule,
        MatExpansionModule,
        MatTabsModule,
        MatProgressBarModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSlideToggleModule,
        MatRadioModule,
        // Chart Module
    ],
    providers: [
        ApiService,
        DialogService,
        StaticService,
    ],
    entryComponents: [
        DialogAlertComponent,
        DialogConfirmComponent,
        DialogQuestionComponent,
        DialogQuestionReviewedComponent,
        DialogUserSetComponent,
        DialogSchoolSetComponent,
        DialogGradeSetComponent,
        DialogSubjectSetComponent,
        DialogStudentAssignToQuizComponent,
        DialogQuizResultComponent,
        DialogSubscriptionSetComponent,
        DialogOfflinePaymentActivateComponent,
        DialogCallbackSetComponent,
        DialogCompanySetComponent,
        CallbackLimitComponent,
        UploadIconComponent,
        CallbackLimitComponent,
        DialogNoticeSetComponent,
        RefillPointsComponent,
        SocialSettingsComponent,
        DialogUserCashComponent
    ],
    bootstrap: [AppComponent],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA
    ]
})

export class AppModule {
    iconsNameArray = [];
    iconsUrls = [];

    constructor(private translate: TranslateService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, private storage: LocalStorageService) {
        this.translate.setDefaultLang(environment.defaultLanguage);
        this.translate.use(this.storage.retrieve('ln') || environment.defaultLanguage);
        this.iconsNameArray = IconsModel.getFullNames();
        this.iconsUrls = IconsModel.getFullPaths();
        for (let i = 0; i < this.iconsNameArray.length; i++) {
            this.matIconRegistry.addSvgIcon(
                this.iconsNameArray[i],
                this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconsUrls[i])
            );
        }
    }
}
