// NullClassifier 단위 테스트.

import { NullClassifier } from "./classifier.service"

describe("NullClassifier", () => {
    it("항상 category/colorHex/confidence null 반환", async () => {
        const classifier = new NullClassifier()
        const result = await classifier.classify("users/u1/items/i1.jpg")
        expect(result).toEqual({ category: null, colorHex: null, confidence: null })
    })
})
