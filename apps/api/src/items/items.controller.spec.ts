// ItemsController 통합 테스트. Nest 테스트 모듈로 HTTP 레이어·DTO 검증·CurrentUser 결선을 확인한다.

import { Test } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import request from "supertest"
import { ItemsController } from "./items.controller"
import { ItemsService } from "./items.service"
import { AuthGuard } from "../auth/auth.guard"
import { JwtService } from "../auth/jwt.service"
import type { Server } from "node:http"

class FakeJwtService {
    verifyAccess() {
        return { sub: "u1", phoneNumber: "+821011112222" }
    }
}

describe("ItemsController (HTTP)", () => {
    let app: INestApplication
    let presign: jest.Mock
    let create: jest.Mock

    beforeAll(async () => {
        presign = jest.fn(async () => ({
            objectKey: "users/u1/items/i1.jpg",
            uploadUrl: "https://storage.local/x?sig=y",
            publicUrl: "https://cdn.local/users/u1/items/i1.jpg",
            expiresInSeconds: 3600,
        }))
        create = jest.fn(async () => ({
            id: "i1",
            category: null,
            colorHex: null,
            photoUrl: "https://cdn.local/users/u1/items/i1.jpg",
            aiConfidence: null,
            registeredAt: new Date("2026-05-18T00:00:00Z"),
        }))

        const moduleRef = await Test.createTestingModule({
            controllers: [ItemsController],
            providers: [
                { provide: ItemsService, useValue: { presign, create } },
                { provide: JwtService, useClass: FakeJwtService },
                Reflector,
                AuthGuard,
            ],
        }).compile()

        app = moduleRef.createNestApplication()
        app.useGlobalPipes(
            new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
        )
        app.useGlobalGuards(app.get(AuthGuard))
        await app.init()
    })

    afterAll(async () => {
        await app.close()
    })

    const server = () => app.getHttpServer() as Server

    it("POST /items/presign 정상", async () => {
        const res = await request(server())
            .post("/items/presign")
            .set("Authorization", "Bearer fake")
            .send({ contentType: "image/jpeg", contentLength: 1_000_000 })
            .expect(200)
        expect(res.body.objectKey).toBe("users/u1/items/i1.jpg")
        expect(res.body.expiresInSeconds).toBe(3600)
        expect(presign).toHaveBeenCalledWith({
            userId: "u1",
            contentType: "image/jpeg",
            contentLength: 1_000_000,
        })
    })

    it("POST /items/presign Authorization 없음 → 401", async () => {
        await request(server())
            .post("/items/presign")
            .send({ contentType: "image/jpeg", contentLength: 1024 })
            .expect(401)
    })

    it("POST /items/presign 잘못된 contentType → 400", async () => {
        await request(server())
            .post("/items/presign")
            .set("Authorization", "Bearer fake")
            .send({ contentType: "image/gif", contentLength: 1024 })
            .expect(400)
    })

    it("POST /items/presign 잘못된 contentLength(0) → 400", async () => {
        await request(server())
            .post("/items/presign")
            .set("Authorization", "Bearer fake")
            .send({ contentType: "image/jpeg", contentLength: 0 })
            .expect(400)
    })

    it("POST /items 정상 → 201", async () => {
        const res = await request(server())
            .post("/items")
            .set("Authorization", "Bearer fake")
            .send({ objectKey: "users/u1/items/i1.jpg" })
            .expect(201)
        expect(res.body.id).toBe("i1")
        expect(create).toHaveBeenCalledWith({
            userId: "u1",
            objectKey: "users/u1/items/i1.jpg",
        })
    })

    it("POST /items 빈 objectKey → 400", async () => {
        await request(server())
            .post("/items")
            .set("Authorization", "Bearer fake")
            .send({ objectKey: "" })
            .expect(400)
    })
})
