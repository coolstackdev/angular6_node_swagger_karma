import {NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuard, AuthLoginRedirect, AuthAdmin, AuthTeacher} from './services/auth.guard';

import {PageLogin} from './pages/login/page.login';
import {PageSignUp} from './pages/sign-up/page.sign-up';
import {PageForgotPassword} from './pages/forgot-password/page.forgot-password';
import {PageApp} from './pages/app/page.app';
import {PageAdmin} from './pages/app/admin/page.admin';
import {PageAdminUsers} from './pages/app/admin/users/page.users';
import {PageAdminSchools} from './pages/app/admin/schools/page.schools';
import {PageDashboard} from './pages/app/dashboard/page.dashboard';
import {PageLessons} from './pages/app/lessons/page.lessons';
import {PageLessonSet} from './pages/app/lesson-set/page.lesson-set';
import {PageStudentsList} from './pages/app/students-list/page.students-list';
import {PageProfileEdit} from './pages/app/profile-edit/page.profile-edit';
import {PageAdminSubjects} from './pages/app/admin/subjects/page.subjects';
import {PageAdminGrade} from './pages/app/admin/grade/page.grade';
import {PageQuizzes} from './pages/app/quizzes/page.quizzes';
import {PageQuizSet} from './pages/app/quiz-set/page.quiz-set';
import {PageHomework} from './pages/app/homework/page.homework';
import {DialogStudentAssignToQuizComponent} from './components/dialog-student-assign-to-quiz/dialog-student-assign-to-quiz.component';
import {PageQuestion} from './pages/app/question/page.question';
import {PageExams} from './pages/app/exams/page.exams';
import {PageChatManagement} from './pages/app/chat-management/page.chat-management';
import {PageAdminSubscriptions} from './pages/app/admin/subscriptions/page.subscriptions';
import {PageAdminOfflinePayments} from './pages/app/admin/offline-payments/page.offline-payments';
import {PageAdminOrangePayments} from './pages/app/admin/orange-payments/page.orange-payments';
import {PageAdminPayPalPayments} from './pages/app/admin/paypal-payments/page.paypal-payments';
import {PageCallbacks} from './pages/app/callbacks/page.callbacks';
import {PageAdminSettings} from './pages/app/admin/settings/page.settings';
import {AdminNoticeBoardComponent} from './pages/app/admin/notice-board/page.notice-board';
import {PageIdeas} from './pages/app/admin/ideas/page.ideas';
import {PagePaymentStatus} from './pages/payment-status/page.payment-status';
import {PageAdminUserRankList} from './pages/app/admin/user-rank-list/page.user-rank-list';

export const appRoutes: Routes = [
    {
        path: 'login',
        component: PageLogin,
        canActivate: [AuthLoginRedirect]
    },
    {
        path: 'sign-up',
        component: PageSignUp,
        canActivate: [AuthLoginRedirect]
    },
    {
        path: 'forgot-password',
        component: PageForgotPassword,
        canActivate: [AuthLoginRedirect]
    },
    {
        path: 'payment-success',
        component: PagePaymentStatus,
        data: {success: true}
    },
    {
        path: 'payment-cancel',
        component: PagePaymentStatus,
        data: {success: false}
    },
    {
        path: 'app',
        component: PageApp,
        canActivate: [AuthGuard],
        children: [
            {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
            {path: 'dashboard', component: PageDashboard},
            {
                path: 'admin',
                component: PageAdmin,
                canActivate: [AuthAdmin],
                children: [
                    {path: '', redirectTo: 'users', pathMatch: 'full'},
                    {path: 'users', component: PageAdminUsers},
                    {path: 'user-rank-list', component: PageAdminUserRankList},
                    {path: 'schools', component: PageAdminSchools},
                    {path: 'grade', component: PageAdminGrade},
                    {path: 'subjects', component: PageAdminSubjects},
                    {path: 'subscriptions', component: PageAdminSubscriptions},
                    {path: 'offline-payments', component: PageAdminOfflinePayments},
                    {path: 'orange-payments', component: PageAdminOrangePayments},
                    {path: 'paypal-payments', component: PageAdminPayPalPayments},
                    {path: 'settings', component: PageAdminSettings},
                    {path: 'notice-board', component: AdminNoticeBoardComponent},
                    {path: 'ideas', component: PageIdeas}
                ]
            },
            {
                path: 'lessons',
                component: PageLessons,
                canActivate: [AuthTeacher]
            },
            {
                path: 'lesson/create',
                component: PageLessonSet,
                canActivate: [AuthTeacher]
            },
            {
                path: 'lesson/:id',
                component: PageLessonSet,
                canActivate: [AuthTeacher]
            },
            {
                path: 'quizzes',
                component: PageQuizzes,
                canActivate: [AuthTeacher]
            },
            {
                path: 'quiz/create',
                component: PageQuizSet,
                canActivate: [AuthTeacher]
            },
            {
                path: 'quiz/:id',
                component: PageQuizSet,
                canActivate: [AuthTeacher]
            },
            {
                path: 'homework',
                component: PageHomework,
                canActivate: [AuthTeacher]
            },
            {
                path: 'exams',
                component: PageExams,
                canActivate: [AuthTeacher]
            },
            {
                path: 'question',
                component: PageQuestion,
                canActivate: [AuthTeacher]
            },
            {
                path: 'callbacks',
                component: PageCallbacks
            },
            {
                path: 'chat-management',
                component: PageChatManagement,
                canActivate: [AuthTeacher]
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'app',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [
        RouterModule
    ],
    providers: [AuthGuard, AuthLoginRedirect, AuthAdmin, AuthTeacher],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA
    ]
})

export class AppRoutesModule {
}
