// Item 사진 객체 키 규칙. users/{userId}/items/{itemId}.{ext} 형식을 강제한다.

const ALLOWED_CONTENT_TYPES = new Map<string, string>([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
])

export function extensionFor(contentType: string): string {
    const ext = ALLOWED_CONTENT_TYPES.get(contentType.toLowerCase())
    if (!ext) {
        throw new Error(`Unsupported contentType: ${contentType}`)
    }
    return ext
}

export function isSupportedContentType(contentType: string): boolean {
    return ALLOWED_CONTENT_TYPES.has(contentType.toLowerCase())
}

export function buildItemObjectKey(params: {
    userId: string
    itemId: string
    contentType: string
}): string {
    if (!params.userId || !params.itemId) {
        throw new Error("userId and itemId are required")
    }
    const ext = extensionFor(params.contentType)
    return `users/${params.userId}/items/${params.itemId}.${ext}`
}
