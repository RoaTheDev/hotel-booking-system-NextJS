export type ApiErrorResponse = {
    detail?: string
}

type ErrorShape = {
    type: "FieldError" |"ServerError" | "MissingParam" | "AuthError" | "NotFound" | "NotMatch" | "Conflict",
    field?: string
}

export type ApiResponse<T> = {
    data: T | null,
    message: string,
    success: boolean,
    errors?: Record<string, string> | ErrorShape
}