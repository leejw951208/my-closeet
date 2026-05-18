// SolapiService 단위 테스트. dev 모드 분기와 운영 실패 시 502 변환.

import { ServiceUnavailableException } from "@nestjs/common"
import { SolapiService } from "./solapi.service"
import { AppConfigService } from "../config/app-config.service"

function makeConfig(overrides: Partial<{
    smsDevMode: boolean
    solapiApiKey?: string
    solapiApiSecret?: string
    solapiSender?: string
}>): AppConfigService {
    return overrides as unknown as AppConfigService
}

describe("SolapiService", () => {
    it("dev 모드는 클라이언트를 생성하지 않고 로그만 남긴다", async () => {
        const svc = new SolapiService(makeConfig({ smsDevMode: true }))
        svc.onModuleInit()
        await expect(svc.sendOtp("+821011112222", "123987")).resolves.toBeUndefined()
        expect((svc as unknown as { client: unknown }).client).toBeNull()
    })

    it("운영 모드에서 API 실패는 502로 변환된다", async () => {
        const svc = new SolapiService(
            makeConfig({
                smsDevMode: false,
                solapiApiKey: "k",
                solapiApiSecret: "s",
                solapiSender: "+821000000000",
            }),
        )
        svc.onModuleInit()
        // 클라이언트의 send를 강제로 실패시킨다.
        ;(svc as unknown as { client: { send: () => Promise<void> } }).client = {
            send: async () => {
                throw new Error("boom")
            },
        }
        await expect(svc.sendOtp("+821011112222", "123987")).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        )
    })

    it("운영 모드인데 키 누락은 onModuleInit에서 즉시 throw", () => {
        const svc = new SolapiService(makeConfig({ smsDevMode: false }))
        expect(() => svc.onModuleInit()).toThrow(/SOLAPI_API_KEY/)
    })
})
