import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware, Int } from 'type-graphql'
import { User } from './entity/User';
import { hash, compare } from 'bcrypt'
import { MyContext } from './MyContext';
import { CreateAccessToken, CreateRefreshToken } from './auth';
import { isAuth } from './isAuth';
import { getConnection } from 'typeorm';

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: String
}

@Resolver()
export class UserResolvers {
    @Query(() => String)
    hello() {
        return "hi!";
    }

    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(
        @Ctx() { playload }: MyContext
    ) {
        console.log(playload?.userId)
        return `User Id :${playload?.userId}`;
    }

    @Query(() => [User])
    users() {
        return User.find();
    }

    @Mutation(() => Boolean)
    async RevokeUserRefreshToken(@Arg("userId", () => Int) userId: number) {
        await getConnection().getRepository(User).increment({id:userId},"tokenVersion",1)

        return  true;
    }

    @Mutation(() => LoginResponse)
    async Login(@Arg('email') email: string, @Arg('password') password: string, @Ctx() { res }: MyContext) {

        const user = await User.findOne({ where: { email } })

        if (!user) {
            throw new Error("User Not Found!!!")
        }

        const valid = await compare(password, user.password)

        if (!valid) {
            throw new Error("Wrong password !!! ")
        }
        res.cookie("cookieId", CreateRefreshToken(user), { httpOnly: true });

        return {
            accessToken: CreateAccessToken(user)
        }
    }

    @Mutation(() => Boolean)
    async register(@Arg('email') email: string, @Arg('password') password: string) {

        const hashedPassword = await hash(password, 12);
        try {
            await User.insert({ email, password: hashedPassword })
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}