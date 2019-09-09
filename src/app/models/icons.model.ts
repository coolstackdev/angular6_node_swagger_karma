export class IconsModel {
    name: string;
    path: string;

    constructor() {
    }

    public static getFullNames(): string[] {
        return ['email_register', 'email_white', 'facebook', 'gmail', 'lock_white', 'logo', 'twitter', 'visibility',
            'a-grade', 'arts', 'arts(2)', 'astronomy', 'astronomy(2)', 'biology', 'biology(2)', 'chemistry', 'economics',
            'geography', 'geography(2)', 'geometry', 'geometry(2)', 'history', 'informatics', 'law', 'literature', 'literature(2)',
            'math', 'math(2)', 'music', 'music(2)', 'physical_education', 'physical_education(2)', 'physics', 'rhetoric', 'scissors',
            'writing'];
    }

    public static getFullPaths(): string[] {
        return ['./assets/icons/email_register.svg', './assets/icons/email_white.svg', './assets/icons/facebook.svg',
            './assets/icons/gmail.svg',
            './assets/icons/lock_white.svg', './assets/icons/logo.svg', './assets/icons/twitter.svg', './assets/icons/visibility.svg',
            './assets/icons/subjects/a-grade.svg', './assets/icons/subjects/arts.svg', './assets/icons/subjects/arts(2).svg',
            './assets/icons/subjects/astronomy.svg', './assets/icons/subjects/astronomy(2).svg', './assets/icons/subjects/biology.svg',
            './assets/icons/subjects/biology(2).svg', './assets/icons/subjects/chemistry.svg', './assets/icons/subjects/economics.svg',
            './assets/icons/subjects/geography.svg', './assets/icons/subjects/geography(2).svg', './assets/icons/subjects/geometry.svg',
            './assets/icons/subjects/geometry(2).svg', './assets/icons/subjects/history.svg', './assets/icons/subjects/informatics.svg',
            './assets/icons/subjects/law.svg', './assets/icons/subjects/literature.svg', './assets/icons/subjects/literature(2).svg',
            './assets/icons/subjects/math.svg', './assets/icons/subjects/math(2).svg', './assets/icons/subjects/music.svg',
            './assets/icons/subjects/music(2).svg', './assets/icons/subjects/physical_education.svg',
            './assets/icons/subjects/physical_education(2).svg',
            './assets/icons/subjects/physics.svg', './assets/icons/subjects/rhetoric.svg', './assets/icons/subjects/scissors.svg'];
    }

    public static getSubjectsNames(): string[] {
        return ['Arts', 'Astronomy', 'Biology', 'Chemistry', 'Economics', 'Geography', 'Geometry', 'History',
            'Informatics', 'Law', 'Literature', 'Mathematics', 'Music', 'Physical Education', 'Physics'];
    }

    public static getSubjectIconsNames(): string[] {
        // return ['./assets/icons/subjects/arts.svg',
        //     './assets/icons/subjects/astronomy.svg', './assets/icons/subjects/biology.svg',
        //     './assets/icons/subjects/chemistry.svg', './assets/icons/subjects/economics.svg',
        //     './assets/icons/subjects/geography.svg', './assets/icons/subjects/geometry.svg',
        //     './assets/icons/subjects/history.svg', './assets/icons/subjects/informatics.svg',
        //     './assets/icons/subjects/law.svg', './assets/icons/subjects/literature.svg',
        //     './assets/icons/subjects/math.svg', './assets/icons/subjects/music.svg', './assets/icons/subjects/physical_education.svg',
        //     './assets/icons/subjects/physics.svg', './assets/icons/subjects/rhetoric.svg'];
        return ['arts', 'astronomy', 'biology', 'chemistry', 'economics', 'geography', 'geometry', 'history',
            'informatics', 'law', 'literature', 'math', 'music', 'physical_education', 'physics'];
    }

}
