export interface IUserDTO {
  first_name: string;
  middle_name: string;
  family_name: string;
  email: string;
  student_id: string;
  role: string;
}

export interface IAuthUserDTO {
  email: string;
  password: string;
  returnSecureToken: boolean;
}