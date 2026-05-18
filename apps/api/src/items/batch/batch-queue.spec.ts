// InMemoryBatchQueue 단위 테스트. FIFO 순차 처리·에러 격리·drain 동작.

import { InMemoryBatchQueue } from "./batch-queue"

describe("InMemoryBatchQueue", () => {
    it("등록한 handler를 enqueue 순서대로 호출", async () => {
        const queue = new InMemoryBatchQueue()
        const calls: string[] = []
        queue.registerHandler(async (id) => {
            await new Promise((r) => setImmediate(r))
            calls.push(id)
        })
        queue.enqueue("a")
        queue.enqueue("b")
        queue.enqueue("c")
        await queue.drain()
        expect(calls).toEqual(["a", "b", "c"])
    })

    it("handler 실패는 다음 작업을 막지 않음", async () => {
        const queue = new InMemoryBatchQueue()
        const calls: string[] = []
        queue.registerHandler(async (id) => {
            if (id === "boom") throw new Error("nope")
            calls.push(id)
        })
        queue.enqueue("a")
        queue.enqueue("boom")
        queue.enqueue("c")
        await queue.drain()
        expect(calls).toEqual(["a", "c"])
    })

    it("handler 미등록 상태에서 enqueue는 throw", () => {
        const queue = new InMemoryBatchQueue()
        expect(() => queue.enqueue("a")).toThrow()
    })
})
