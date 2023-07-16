import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface ClaimsRo {
    email: string,
    role: string
}

@Injectable()
export class ClaimsGuard implements CanActivate {
    constructor(private roles: string[]) {}

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        try {
            const claims = await axios.get<ClaimsRo>("https://api.mcsynergy.nl/auth/get-user-claims", {
                headers: {Authorization: request.headers.authorization}
            })
            return this.roles.includes(claims.data.role);
        } catch (err) {
            throw new HttpException("failed to get claims", HttpStatus.UNAUTHORIZED, {cause: err})
        }
    }
}