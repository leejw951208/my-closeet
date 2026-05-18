// PIN 해시·검증·잠금 카운터 관리 서비스.

import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
} from "@nestjs/common"
import * as bcrypt from "bcryptjs"
import { PrismaService } from "../prisma/prisma.service"

const PIN_BCRYPT_COST = 12
const PIN_LOCK_THRESHOLD = 5
const PIN_LOCK_MINUTES = 10

const SIMPLE_PIN_PATTERNS = new Set<string>([
    "000000",
    "111111",
    "222222",
    "333333",
    "444444",
    "555555",
    "666666",
    "777777",
    "888888",
    "999999",
    "123456",
    "654321",
    "012345",
    "543210",
])

export type PinVerifyResult =
    | { ok: true }
    | { ok: false; remainingAttempts: number }

@Injectable()
export class PinService {
    constructor(private readonly prisma: PrismaService) {}

    async hash(pin: string): Promise<string> {
        this.assertFormat(pin)
        return bcrypt.hash(pin, PIN_BCRYPT_COST)
    }

    async verify(userId: string, pin: string): Promise<PinVerifyResult> {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
        })
        if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
            throw new HttpException(
                {
                    code: "pin_locked",
                    message: "잠금 상태입니다. SMS 재인증으로 PIN을 재설정해주세요.",
                    lockedUntil: user.pinLockedUntil.toISOString(),
                },
                HttpStatus.LOCKED,
            )
        }
        const match = await bcrypt.compare(pin, user.pinHash)
        if (match) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    pinFailedCount: 0,
                    pinLockedUntil: null,
                    lastSignInAt: new Date(),
                },
            })
            return { ok: true }
        }
        const newCount = user.pinFailedCount + 1
        const willLock = newCount >= PIN_LOCK_THRESHOLD
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                pinFailedCount: willLock ? 0 : newCount,
                pinLockedUntil: willLock
                    ? new Date(Date.now() + PIN_LOCK_MINUTES * 60 * 1000)
                    : null,
            },
        })
        if (willLock) {
            throw new HttpException(
                {
                    code: "pin_locked",
                    message: "PIN을 5회 틀려 잠금되었습니다. SMS 재인증으로 PIN을 재설정해주세요.",
                },
                HttpStatus.LOCKED,
            )
        }
        return { ok: false, remainingAttempts: PIN_LOCK_THRESHOLD - newCount }
    }

    async resetPin(userId: string, newPin: string): Promise<void> {
        const pinHash = await this.hash(newPin)
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: {
                    pinHash,
                    pinFailedCount: 0,
                    pinLockedUntil: null,
                },
            }),
            this.prisma.pinResetLog.create({ data: { userId } }),
        ])
    }

    private assertFormat(pin: string): void {
        if (!/^\d{6}$/.test(pin)) {
            throw new BadRequestException({
                code: "invalid_pin_format",
                message: "PIN은 6자리 숫자여야 합니다.",
            })
        }
        if (SIMPLE_PIN_PATTERNS.has(pin)) {
            throw new BadRequestException({
                code: "weak_pin",
                message: "쉽게 추측되는 PIN입니다. 다른 PIN을 사용해주세요.",
            })
        }
    }
}
