import jwt from 'jsonwebtoken';
import { prisma } from "../../../util/prisma/index.js"

export default async function (req, res, next){
    try{
        const { authorization } = req.headers;
        // ** Access token 검사
        if (!authorization) throw new Error('토큰이 존재하지 않습니다');
        const [tokenType, token] = authorization.split(' ');
        // ** Bearer token 유효성 검사
        if (tokenType !== 'Bearer')
            throw new Error('토큰 타입이 일치하지 않습니다');

        // ** JWT 토큰 검사
        const decodedToken = jwt.verify(token, process.env.USER_TOKEN_KEY);
        const accountName = decodedToken.accountName;
        
        const user = await prisma.user.findFirst({
            where : {
                accountName : accountName
            }
        });
        // ** JWT 토큰 검사 후 토큰 유저 존재하는지 검사
        if(!user){
            throw new Error('토큰 사용자가 존재하지 않습니다.')
        }

        req.user=user;
        next();
    }
    catch(error){
        switch(error.name){
            case 'TokenExpiredError' :
                return res.status(401).json({message:'토큰이 만료되었습니다'});
            case 'JsonWebTokenError' :
                return res.status(401).json({message:'토큰이 조작되었습니다'});
            default :
                return res.status(401).json({message:error.message ?? '비정상적인 요청입니다'});
        }
    }
}



