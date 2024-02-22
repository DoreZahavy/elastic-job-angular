import { HttpErrorResponse } from "@angular/common/http";

type ErrorType = string | null | HttpErrorResponse

export interface Errors extends Record<string, ErrorType> {
    fetch: ErrorType,
    save: ErrorType,
    remove: ErrorType,
}
