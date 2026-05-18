// ItemsService 단위 테스트. presign·create 흐름과 가드를 검증한다.

import {
    BadRequestException,
    NotFoundException,
    PayloadTooLargeException,
} from "@nestjs/common"
import { ItemsService } from "./items.service"
import type { ClassificationResult, ClassifierService } from "./classifier.service"
import type { ItemsRepository } from "./items.repository"
import type {
    PresignedUploadUrl,
    StorageProvider,
} from "../storage/storage.types"

function makeStorage(): jest.Mocked<StorageProvider> {
    return {
        createPresignedUpload: jest.fn(
            async ({ objectKey }): Promise<PresignedUploadUrl> => ({
                objectKey,
                uploadUrl: `https://storage.local/${objectKey}?sig=x`,
                publicUrl: `https://cdn.local/${objectKey}`,
                expiresInSeconds: 3600,
            }),
        ),
        publicUrl: jest.fn((objectKey: string) => `https://cdn.local/${objectKey}`),
        headObject: jest.fn(async (_objectKey: string) => ({
            size: 1024,
            contentType: "image/jpeg",
        })),
        delete: jest.fn(),
    } as jest.Mocked<StorageProvider>
}

function makeClassifier(
    result: ClassificationResult = { category: null, colorHex: null, confidence: null },
): ClassifierService & { classify: jest.Mock } {
    return { classify: jest.fn(async (_: string) => result) } as unknown as
        ClassifierService & { classify: jest.Mock }
}

function makeRepo(): jest.Mocked<ItemsRepository> {
    return {
        ensureCloset: jest.fn(async () => "c1"),
        createItem: jest.fn(async (input) => ({
            id: "i1",
            closetId: "c1",
            photoUrl: input.photoUrl,
            category: input.category ?? null,
            emoji: null,
            colorHex: input.colorHex,
            brand: null,
            season: null,
            aiConfidence: input.aiConfidence,
            registeredAt: new Date("2026-05-18T00:00:00Z"),
            deletedAt: null,
        })),
    } as unknown as jest.Mocked<ItemsRepository>
}

describe("ItemsService", () => {
    describe("presign", () => {
        it("지원 contentType + 정상 크기는 storage 위임", async () => {
            const storage = makeStorage()
            const service = new ItemsService(storage, makeClassifier(), makeRepo())
            const result = await service.presign({
                userId: "u1",
                contentType: "image/jpeg",
                contentLength: 1_000_000,
            })
            expect(storage.createPresignedUpload).toHaveBeenCalledTimes(1)
            const call = storage.createPresignedUpload.mock.calls[0][0]
            expect(call.objectKey).toMatch(
                /^users\/u1\/items\/[0-9a-f-]{36}\.jpg$/,
            )
            expect(result.expiresInSeconds).toBe(3600)
        })

        it("지원하지 않는 contentType은 400", async () => {
            const service = new ItemsService(
                makeStorage(),
                makeClassifier(),
                makeRepo(),
            )
            await expect(
                service.presign({
                    userId: "u1",
                    contentType: "image/gif",
                    contentLength: 1024,
                }),
            ).rejects.toBeInstanceOf(BadRequestException)
        })

        it("contentLength > 10MB는 413", async () => {
            const service = new ItemsService(
                makeStorage(),
                makeClassifier(),
                makeRepo(),
            )
            await expect(
                service.presign({
                    userId: "u1",
                    contentType: "image/jpeg",
                    contentLength: 11 * 1024 * 1024,
                }),
            ).rejects.toBeInstanceOf(PayloadTooLargeException)
        })
    })

    describe("create", () => {
        it("정상 흐름. classifier 결과 + storage.publicUrl 반영", async () => {
            const storage = makeStorage()
            const repo = makeRepo()
            const classifier = makeClassifier({
                category: "TOP",
                colorHex: "#000000",
                confidence: 0.92,
            })
            const service = new ItemsService(storage, classifier, repo)
            const result = await service.create({
                userId: "u1",
                objectKey: "users/u1/items/i1.jpg",
            })
            expect(storage.headObject).toHaveBeenCalledWith("users/u1/items/i1.jpg")
            expect(storage.publicUrl).toHaveBeenCalledWith("users/u1/items/i1.jpg")
            expect(classifier.classify).toHaveBeenCalledWith("users/u1/items/i1.jpg")
            expect(repo.createItem).toHaveBeenCalledWith({
                userId: "u1",
                photoUrl: "https://cdn.local/users/u1/items/i1.jpg",
                category: "TOP",
                colorHex: "#000000",
                aiConfidence: 0.92,
            })
            expect(result.category).toBe("TOP")
            expect(result.photoUrl).toBe("https://cdn.local/users/u1/items/i1.jpg")
        })

        it("classifier null 반환 시 미분류 Item 저장", async () => {
            const repo = makeRepo()
            const service = new ItemsService(makeStorage(), makeClassifier(), repo)
            const result = await service.create({
                userId: "u1",
                objectKey: "users/u1/items/i1.jpg",
            })
            expect(repo.createItem).toHaveBeenCalledWith(
                expect.objectContaining({ category: null, colorHex: null, aiConfidence: null }),
            )
            expect(result.category).toBeNull()
        })

        it("타 사용자 objectKey는 400 + headObject 호출 안 됨", async () => {
            const storage = makeStorage()
            const service = new ItemsService(storage, makeClassifier(), makeRepo())
            await expect(
                service.create({ userId: "u1", objectKey: "users/u2/items/i1.jpg" }),
            ).rejects.toBeInstanceOf(BadRequestException)
            expect(storage.headObject).not.toHaveBeenCalled()
        })

        it("형식 어긋난 objectKey는 400", async () => {
            const service = new ItemsService(
                makeStorage(),
                makeClassifier(),
                makeRepo(),
            )
            await expect(
                service.create({ userId: "u1", objectKey: "foo/bar.jpg" }),
            ).rejects.toBeInstanceOf(BadRequestException)
        })

        it("headObject가 null이면 404", async () => {
            const storage = makeStorage()
            storage.headObject.mockResolvedValueOnce(null)
            const service = new ItemsService(storage, makeClassifier(), makeRepo())
            await expect(
                service.create({ userId: "u1", objectKey: "users/u1/items/i1.jpg" }),
            ).rejects.toBeInstanceOf(NotFoundException)
        })

        it("업로드 size가 10MB 초과면 413", async () => {
            const storage = makeStorage()
            storage.headObject.mockResolvedValueOnce({
                size: 11 * 1024 * 1024,
                contentType: "image/jpeg",
            })
            const service = new ItemsService(storage, makeClassifier(), makeRepo())
            await expect(
                service.create({ userId: "u1", objectKey: "users/u1/items/i1.jpg" }),
            ).rejects.toBeInstanceOf(PayloadTooLargeException)
        })
    })
})
