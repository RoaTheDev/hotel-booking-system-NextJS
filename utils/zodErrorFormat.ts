import {ZodError} from "zod";

export function validationErrorFormat(error: ZodError): Record<string, string> {
    return error.errors.reduce((acc, curr) => {
        const path = curr.path.join(".");
        acc[path] = curr.message;
        return acc;
    }, {} as Record<string, string>);
}