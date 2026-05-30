export function itemSoldTemplate(seller: string, itemName: string, price: number): string {
  return `💰 *Item Sold!*\n\n${seller}'s *${itemName}* was purchased for *${price.toLocaleString()} $MAGIC*!`
}

export function itemListedTemplate(seller: string, itemName: string, rarity: string, price: number): string {
  return `🏪 *New Listing!*\n\n${seller} listed *${itemName}* (${rarity}) for *${price.toLocaleString()} $MAGIC*`
}
