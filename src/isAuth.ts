import { MiddlewareFn } from 'type-graphql';
import {verify} from 'jsonwebtoken'
import { MyContext } from './MyContext';

export const isAuth: MiddlewareFn<MyContext> = ( { context }, next) => {
    
    const authorization = context.req.headers["authorization"]

    if(!authorization){
        throw new Error("Not authenticated");
    }
    try{
        console.log("bbrrfbe")
        const token =authorization.split(' ')[1];
        const playload=verify(token,process.env.ACCESS_TOKEN_SECRET!)
        context.playload=playload as any
    }
    catch(err)
    {
        console.log(err);
        throw new Error("Not authenticated");   
    }
    return next();
};