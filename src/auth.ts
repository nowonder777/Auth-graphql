import { User } from "./entity/User";
import {sign} from 'jsonwebtoken'

export const CreateAccessToken  =(user:User)=>{
    return  sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "1h" })
};

export const CreateRefreshToken = (user: User) => {

    return sign({ userId: user.id,  tokenVersion:user.tokenVersion },process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "7d" })
};

