// 로컬 개발용 시드 스크립트. QA 더미 유저·옷장·옷·코디를 생성한다.
// 실행. `pnpm --filter @my-closet/database exec tsx prisma/seed.ts`

import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"
import {
    PrismaClient,
    ItemCategory,
    OutfitSlot,
    OutfitSource,
} from "../src/generated/prisma/client"

const SEED_PHONE = "+821000000000"
// bcrypt cost 12 해시. 평문은 "000000".
const SEED_PIN_HASH = "$2b$12$bd9z9OZ8Yo8tQX0G5o3yPugZv4nDgQ4yI0u3iCKj3xqM4pXxh5h6m"

async function main(): Promise<void> {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        throw new Error("DATABASE_URL 환경 변수가 필요합니다.")
    }
    const prisma = new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
    })

    const user = await prisma.user.upsert({
        where: { phoneNumber: SEED_PHONE },
        update: {},
        create: {
            phoneNumber: SEED_PHONE,
            pinHash: SEED_PIN_HASH,
            closet: { create: {} },
        },
        include: { closet: true },
    })

    if (!user.closet) {
        throw new Error("시드 사용자의 옷장이 생성되지 않았습니다.")
    }

    const items = await Promise.all(
        [
            { category: ItemCategory.TOP, emoji: "👕", colorHex: "#1f6feb" },
            { category: ItemCategory.BOTTOM, emoji: "👖", colorHex: "#0d1117" },
            { category: ItemCategory.OUTER, emoji: "🧥", colorHex: "#6e7681" },
            { category: ItemCategory.SHOES, emoji: "👟", colorHex: "#ffffff" },
        ].map((item, index) =>
            prisma.item.create({
                data: {
                    closetId: user.closet!.id,
                    photoUrl: `https://placehold.co/600x800/png?text=seed-${index + 1}`,
                    ...item,
                },
            }),
        ),
    )

    await prisma.outfit.create({
        data: {
            userId: user.id,
            source: OutfitSource.MANUAL,
            slotsFilled: items.length,
            items: {
                create: items.map((item) => ({
                    itemId: item.id,
                    slot: mapCategoryToSlot(item.category),
                })),
            },
        },
    })

    await prisma.$disconnect()
    console.log(`Seed complete. user=${user.id} items=${items.length}`)
}

function mapCategoryToSlot(category: ItemCategory): OutfitSlot {
    switch (category) {
        case ItemCategory.TOP:
            return OutfitSlot.TOP
        case ItemCategory.BOTTOM:
            return OutfitSlot.BOTTOM
        case ItemCategory.OUTER:
            return OutfitSlot.OUTER
        case ItemCategory.SHOES:
            return OutfitSlot.SHOES
        default:
            return OutfitSlot.TOP
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
