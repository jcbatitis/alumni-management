
export interface Transcript {
    student_id: string;
    grades: Grade[];
    certificate_id: string;
}

export interface Grade {
    name: string;
    course_code: string;
    course_coordinator: string;
    mark: string;
    semester: string;
    year: string;
    units: string;
}