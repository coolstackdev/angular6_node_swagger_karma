// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    redirectUrl: 'http://localhost:8018',
    baseUrl: 'http://localhost:5100/api/',
    socketIOUrl: '',
    socialIDs: {
        facebook: '2036562366377079',
        google: '1083635468785-36r49qh5r5eddt1utfq72vuhdntqtmb8.apps.googleusercontent.com',
        twitter: ''
    },
    defaultLanguage: 'en'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
