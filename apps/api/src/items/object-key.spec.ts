// 객체 키 규칙 단위 테스트.

import { buildItemObjectKey, extensionFor, isSupportedContentType } from "./object-key"

describe("object-key", () => {
    describe("extensionFor", () => {
        it("image/jpeg → jpg", () => {
            expect(extensionFor("image/jpeg")).toBe("jpg")
        })
        it("image/png → png", () => {
            expect(extensionFor("image/png")).toBe("png")
        })
        it("대소문자 무시", () => {
            expect(extensionFor("IMAGE/JPEG")).toBe("jpg")
        })
        it("지원하지 않으면 throw", () => {
            expect(() => extensionFor("image/gif")).toThrow()
        })
    })

    describe("isSupportedContentType", () => {
        it("jpeg/png는 true, 그 외 false", () => {
            expect(isSupportedContentType("image/jpeg")).toBe(true)
            expect(isSupportedContentType("image/png")).toBe(true)
            expect(isSupportedContentType("image/heic")).toBe(false)
        })
    })

    describe("buildItemObjectKey", () => {
        it("users/{userId}/items/{itemId}.{ext} 규칙 적용", () => {
            const key = buildItemObjectKey({
                userId: "u1",
                itemId: "i1",
                contentType: "image/jpeg",
            })
            expect(key).toBe("users/u1/items/i1.jpg")
        })
        it("userId 누락은 throw", () => {
            expect(() =>
                buildItemObjectKey({ userId: "", itemId: "i1", contentType: "image/jpeg" }),
            ).toThrow()
        })
        it("itemId 누락은 throw", () => {
            expect(() =>
                buildItemObjectKey({ userId: "u1", itemId: "", contentType: "image/jpeg" }),
            ).toThrow()
        })
        it("지원하지 않는 contentType은 throw", () => {
            expect(() =>
                buildItemObjectKey({
                    userId: "u1",
                    itemId: "i1",
                    contentType: "image/gif",
                }),
            ).toThrow()
        })
    })
})
