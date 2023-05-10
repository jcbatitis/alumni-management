import { MatSnackBarConfig } from "@angular/material/snack-bar";

export const ERROR_SNACKBAR_OPTION: MatSnackBarConfig = {
  duration: 3000,
  panelClass: ['error-snackbar'],
  horizontalPosition: 'right',
  verticalPosition: 'top',
};

export const SUCCESS_SNACKBAR_OPTION: MatSnackBarConfig = {
    duration: 3000,
    panelClass: ['success-snackbar'],
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };
  