/** 產品區域 tw/sg/mm 與顯示名稱 */
export const PRODUCT_REGIONS = [
    { value: "tw", label: "台灣 Taiwan" },
    { value: "sg", label: "新加坡 Singapore" },
    { value: "mm", label: "緬甸 apaforum" }
] as const;

export type ProductRegion = (typeof PRODUCT_REGIONS)[number]["value"];
