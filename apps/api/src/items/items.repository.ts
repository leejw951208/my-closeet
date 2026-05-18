// Item·Closet 영속화 레포지토리. Closet은 User 1:1로 lazy 생성된다.

import { Injectable } from "@nestjs/common"
import type { Item, ItemCategory } from "@my-closet/database"
import { PrismaService } from "../prisma/prisma.service"

export interface CreateItemInput {
    userId: string
    photoUrl: string
    category: ItemCategory | null
    colorHex: string | null
    aiConfidence: number | null
}

@Injectable()
export class ItemsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async ensureCloset(userId: string): Promise<string> {
        const existing = await this.prisma.closet.findUnique({
            where: { userId },
            select: { id: true },
        })
        if (existing) return existing.id
        const created = await this.prisma.closet.create({
            data: { userId },
            select: { id: true },
        })
        return created.id
    }

    async createItem(input: CreateItemInput): Promise<Item> {
        return this.prisma.$transaction(async (tx) => {
            const closet = await tx.closet.upsert({
                where: { userId: input.userId },
                create: { userId: input.userId },
                update: {},
                select: { id: true },
            })
            return tx.item.create({
                data: {
                    closetId: closet.id,
                    photoUrl: input.photoUrl,
                    category: input.category,
                    colorHex: input.colorHex,
                    aiConfidence: input.aiConfidence,
                },
            })
        })
    }
}
