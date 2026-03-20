export type EquipmentRow = {
  category: string;
  feature: string;
  by_variant_id: Record<string, boolean | null | undefined>;
};

/** Satırda araçlar arasında fark var mı (boolean veya eksik değer farkı) */
export function equipmentRowHasDifference(row: EquipmentRow, carIds: number[]): boolean {
  const vals = carIds.map((id) => row.by_variant_id[String(id)]);
  const norm = vals.map((v) => (v === true ? "y" : v === false ? "n" : "u"));
  const set = new Set(norm);
  return set.size > 1;
}

/** Tam olarak bir araçta "var", diğerlerinde yok → benzersiz avantaj */
export function countUniqueEquipmentAdvantages(rows: EquipmentRow[], carIds: number[]): number {
  let n = 0;
  for (const row of rows) {
    const trueIds = carIds.filter((id) => row.by_variant_id[String(id)] === true);
    if (trueIds.length === 1) n += 1;
  }
  return n;
}

export function uniqueEquipmentCategories(rows: EquipmentRow[]): string[] {
  return Array.from(new Set(rows.map((r) => r.category))).sort((a, b) => a.localeCompare(b));
}
