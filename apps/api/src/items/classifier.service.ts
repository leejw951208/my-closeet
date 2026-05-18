// 분류 마이크로서비스 추상화. P2에서 실 구현으로 교체된다. 현재는 null stub.

import { Injectable } from "@nestjs/common"

export type ItemCategoryLabel =
    | "TOP"
    | "BOTTOM"
    | "DRESS"
    | "OUTER"
    | "SHOES"
    | "HAT"
    | "BAG"
    | "ACCESSORY"

export interface ClassificationResult {
    category: ItemCategoryLabel | null
    colorHex: string | null
    confidence: number | null
}

export abstract class ClassifierService {
    abstract classify(objectKey: string): Promise<ClassificationResult>
}

@Injectable()
export class NullClassifier extends ClassifierService {
    async classify(_objectKey: string): Promise<ClassificationResult> {
        return { category: null, colorHex: null, confidence: null }
    }
}
