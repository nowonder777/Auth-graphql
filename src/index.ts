import "reflect-metadata";
import { createConnection } from "typeorm";
import 'dotenv/config'
import express from "express";
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from "type-graphql";
import { UserResolvers } from "./UserResolvers";
import cookieParser from 'cookie-parser'
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { CreateRefreshToken } from "./auth";
import { sendrefreshtoken } from "./sendrefreshtoken";

(
    async () => {

        const app = express();
        app.use(cookieParser());
        app.get('/', (_req, res) => res.send("hello"))
        app.post('/Refresh_Token', async (req,res) => {
            console.log(req.cookies)
            const token =req.cookies.cookieId;
            if(!token){
                return  res.send({ok:false,accesstoken:""})
            }
            let playload:any =null;
            try{
                playload=verify(token,process.env.REFRESH_TOKEN_SECRET!)
            }
            catch(err)
            {
                console.log(err)
                return  res.send({ok:false,accesstoken:""})
            }


            const user = await User.findOne({ where: { id:playload.userId } })

            if(!user){
                return  res.send({ok:false,accesstoken:""})
            }
            sendrefreshtoken(res,CreateRefreshToken(user))
            return  res.send({ok:true,accesstoken:CreateRefreshToken(user)})
        })

        await createConnection();


        const apolloServer = new ApolloServer({
            schema: await buildSchema({
                resolvers: [UserResolvers]
            }),
            context: ({ req, res }) => ({ req, res })
        })


        apolloServer.applyMiddleware({ app })

        app.listen(4000, () => { console.log("server Started") })
    }
)();

