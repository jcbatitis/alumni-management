export enum Status {
    OK = 'OK',
    UNAUTHORISED = 'UNAUTHORISED'

}

export interface Authentication {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
}