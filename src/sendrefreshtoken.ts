import { Response } from "express";

export const sendrefreshtoken = (res: Response, token: string) => {
    res.cookie('cookieId', token, {
        httpOnly: true
    });
}