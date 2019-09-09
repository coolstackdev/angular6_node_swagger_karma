import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Restangular} from 'ngx-restangular';
import {LocalStorageService} from 'ngx-webstorage';

import {environment} from '../../environments/environment';

let RestangularP;

export function RestangularConfigFactory(RestangularProvider) {
    RestangularP = RestangularProvider;
    RestangularProvider.setBaseUrl(environment.baseUrl);
}

function setHeaders(restangular, token) {
    restangular.setDefaultHeaders({'Authorization': token});
}

function removeNulls(obj) {
    const isArray = obj instanceof Array;
    for (const k in obj) {
        if (obj[k] === null) {
            isArray ? obj.splice(k, 1) : delete obj[k];
        } else if (typeof obj[k] === 'object') {
            removeNulls(obj[k]);
        }
    }
}

@Injectable()
export class ApiService {
    public token: string;
    translates = [];
    role: number;

    constructor(private restangular: Restangular, private storage: LocalStorageService, private router: Router) {
        const token = this.storage.retrieve('token');
        this.token = token;
        if (token) {
            setHeaders(RestangularP, token);
        }
        RestangularP.setResponseInterceptor((data, operation, what, url, response) => {
            const tokenNew = response.headers.get('token-refresh');
            if (tokenNew) {
                this.storage.store('token', tokenNew);
                setHeaders(RestangularP, tokenNew);
            }
            return data;
        });
        RestangularP.addErrorInterceptor((response) => {
            if (response.status === 401) {
                console.log('401');
                this.storage.store('user', null);
                this.storage.store('token', null);
                this.router.navigate(['/']);
                return false;
            }
            console.log('error', response);
        });
    }

    public getToken() {
        return this.token;
    }

    public currentUserRoleGET() {
        return this.restangular.one('role').get().toPromise()
            .then((res) => {
                if (res.data.level) {
                    this.role = res.data.level;
                }
                return res.data;
            })
            .catch((error) => error.data);
    }

    public login(credentials) {
        return this.restangular.one('login').post(null, credentials).toPromise().then((data) => {
            this.storage.store('user', data.data.user);
            this.storage.store('token', data.data.token);
            setHeaders(RestangularP, data.data.token);
            return data;
        }).catch((error) => error.data);
    }

    public socialLogin(credentials) {
        this.storage.store('user', credentials.user);
        this.storage.store('token', credentials.token);
        setHeaders(RestangularP, credentials.token);
        return credentials;
    }

    public forgotPassword(username) {
        return this.restangular.one('forgot').post(null, {username: username}).toPromise()
            .then((res) => res.data)
            .catch((error) => error.data);
    }

    public changePassword(data) {
        return this.restangular.one('forgot').one('password').post(null, data).toPromise()
            .then((res) => res.data)
            .catch((error) => error.data);
    }

    public rolesGET() {
        return this.restangular.one('roles').get().toPromise()
            .then((res) => res.success ? res.data : {roles: []})
            .catch((error) => error.data);
    }

    public referralsGET() {
        return this.restangular.one('referrals').get().toPromise()
            .then(res => res.success ? res.data : {referrals: []})
            .catch(error => error.data);
    }

    public usersGET(types) {
        console.log(types)
        return this.restangular.one('users').get({types: types}).toPromise()
            .then((res) => res.success ? res.data : {users: []})
            .catch((error) => error.data);
    }
    
    public usersByDateGET(start, end) {
        return this.restangular.one('usersbydate').get({start:start, end:end}).toPromise()
            .then((res) => res.success ? res.data : {users: []})
            .catch((error) => error.data);
    }

    public topGET() {
        return this.restangular.one('top').get({top: 100}).toPromise()
            .then((res) => res.success ? res.data : {top: []})
            .catch((error) => error.data);
    }

    public userBalanceGET(user) {
        return this.restangular.one('/balance/admin').get({user: user._id}).toPromise()
            .then((res) => res.success ? res.data : {})
            .catch((error) => error.data);
    }

    public userBalanceAdd(options) {
        return this.restangular.one('/balance/admin').customPOST(options).toPromise()
            .then((res) => res.success ? res.data : {})
            .catch((error) => error.data);
    }

    public userProfilePUT(options) {
        removeNulls(options);
        return this.restangular.one('profile').customPUT(options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public usersDELETE(ids) {
        return this.restangular.one('user').remove({ids: ids}).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public schoolsGET() {
        return this.restangular.one('schools').get().toPromise()
            .then((res) => res.success ? res.data : {schools: []})
            .catch((error) => error.data);
    }

    public schoolSET(options) {
        removeNulls(options);
        return this.restangular.one('school').customPOST(options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public schoolDELETE(id: string []) {
        return this.restangular.one('school').remove({ids: id}).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public gradesGET() {
        return this.restangular.one('grades').get().toPromise()
            .then((res) => res.success ? res.data : {grades: []})
            .catch((error) => error.data);
    }

    public categoriesGET() {
        return this.restangular.one('categories').get().toPromise()
            .then((res) => res.success ? res.data : {categories: []})
            .catch((error) => error.data);
    }

    public gradeSET(options) {
        removeNulls(options);
        return this.restangular.one('grade').customPOST(options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public gradeDELETE(id: string []) {
        return this.restangular.one('grade').remove({ids: id}).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public callbacksGET() {
        return this.restangular.one('callbacks').get().toPromise()
            .then((res) => res.success ? res.data : {grades: []})
            .catch((error) => error.data);
    }

    public callbackSET(options) {
        removeNulls(options);
        options['caller'] = this.storage.retrieve('user')._id;
        return this.restangular.one('callback').customPOST(options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public callbackDELETE(id: string []) {
        return this.restangular.one('callback').remove({ids: id}).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public subjectsGET() {
        return this.restangular.one('subjects/manage').get().toPromise()
            .then((res) => res.success ? res.data : {subjects: []})
            .catch((error) => error.data);
    }

    public subjectSET(options) {
        removeNulls(options);
        return this.restangular.one('subject').customPOST(options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public subjectDELETE(id: string []) {
        return this.restangular.one('subject').remove({ids: id}).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public lessonsManageGET() {
        return this.restangular.one('lessons/manage').get().toPromise()
            .then((res) => res.success ? res.data : {lessons: []})
            .catch((error) => error.data);
    }

    public lessonGET(id) {
        return this.restangular.one('lesson', id).get().toPromise()
            .then((res) => res.success ? res.data : {})
            .catch((error) => error.data);
    }

    public lessonSET(options) {
        removeNulls(options);
        return this.restangular.one('lesson').customPOST(options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public lessonDELETE(id: string []) {
        return this.restangular.one('lesson').remove({ids: id}).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public quizzesManageGET() {
        return this.restangular.one('quizzes/manage').get().toPromise()
            .then((res) => res.success ? res.data : {quizzes: []})
            .catch((error) => error.data);
    }

    public quizGET(id) {
        return this.restangular.one('quiz', id).get().toPromise()
            .then((res) => res.success ? res.data : {})
            .catch((error) => error.data);
    }

    public quizSET(options) {
        removeNulls(options);
        return this.restangular.one('quiz').customPOST(options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public quizDELETE(id: string []) {
        return this.restangular.one('quiz').remove({ids: id}).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public homeworkGET() {
        return this.restangular.one('quizanswers?homework=1').get().toPromise()
            .then((res) => res.success ? res.data : {quizzes: []})
            .catch((error) => error.data);
    }

    public examsGET() {
        return this.restangular.one('exams').get().toPromise()
            .then((res) => res.success ? res.data : {quizzes: []})
            .catch((error) => error.data);
    }

    public quizAnswerSET(options) {
        return this.restangular.one('quizanswer')[options._id ? 'customPUT' : 'customPOST'](options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public examSET(options) {
        return this.restangular.one('quizanswer/exam')[options._id ? 'customPUT' : 'customPOST'](options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public quizAnswerDELETE(id: string []) {
        return this.restangular.one('quizanswer').remove({ids: id}).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public questionManageGET(options) {
        return this.restangular.one('question/manage').get(options).toPromise()
            .then((res) => res.success ? res.data : {questions: []})
            .catch((error) => error.data);
    }

    public questionManageUPDATE(options) {
        return this.restangular.one('question/manage').customPOST(options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public questionGET(id) {
        return this.restangular.one('getquestion').get({id: id}).toPromise()
            .then((res) => res.data.question)
            .catch((error) => error.data);
    }

    public subscriptionsGET() {
        return this.restangular.one('subscriptions/manage').get().toPromise()
            .then((res) => res.data)
            .catch((error) => error.data);
    }

    public subscriptionSET(subscription) {
        removeNulls(subscription);
        return this.restangular.one('subscriptions/manage').customPOST(subscription).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public settingsGET() {
        return this.restangular.one('settings').get().toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public settingsSET(params) {
        return this.restangular.one('settings').customPUT(params).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public companySET(params) {
        return this.restangular.one('company')[params._id ? 'customPUT' : 'customPOST'](params).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public companiesGET() {
        return this.restangular.one('companies').get().toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public companiesDELETE(id) {
        return this.restangular.one('companies').remove({company: id}).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public noticeGET() {
        return this.restangular.one('notices').get().toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public noticeSET(params) {
        return this.restangular.one('notice').customPOST(params).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public noticeDelete(id: string[]) {
        return this.restangular.one('notice').remove({ids: id}).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    subscriptionDELETE(id) {
        return this.restangular.one('subscription').remove({ids: id}).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    offlinePaymentsGET(status) {
        return this.restangular.one('admin/payment/offline' + '?status=' + status).get().toPromise()
            .then((res) => res.data)
            .catch((error) => error.data);
    }

    offlinePaymentActivatePUT(options) {
        removeNulls(options);
        return this.restangular.one('balance').customPUT(options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    orangePaymentsGET() {
        return this.restangular.one('admin/payment/orange').get().toPromise()
            .then((res) => res.data)
            .catch((error) => error.data);
    }

    paypalPaymentsGET() {
        return this.restangular.one('admin/payment/paypal').get().toPromise()
            .then((res) => res.data)
            .catch((error) => error.data);
    }

    fileReference(options) {
        return this.restangular.one('filereference').customPOST(options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    fileExcelUpload(options) {
        return this.restangular.one('/quiz/parse').customPOST(options).toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    verifyQuizzes() {
        return this.restangular.one('/quizzes/verify').get().toPromise()
            .then((res) => res)
            .catch((error) => error.data);
    }

    public ideasGET() {
        return this.restangular.one('idea').get().toPromise()
            .then((res) => res.success ? res.data : {ideas: []})
            .catch((error) => error.data);
    }

    public bugsGET() {
        return this.restangular.one('bugreport').get().toPromise()
            .then((res) => res.success ? res.data : {bugs: []})
            .catch((error) => error.data);
    }
}
