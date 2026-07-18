/**
 * 與 pro_product 資料表欄位一致（單一來源）。
 * 型別對應：bigint/int/tinyint → number，varchar/text/longtext/datetime → string | null。
 */
export interface ProProductTable {
    productID: number;
    color_on_off?: number;
    size_on_off?: number;
    qty_on_off?: number;
    color?: string | null;
    size?: string | null;
    qty?: string | null;
    youtube?: string | null;
    weight?: string | null;
    stock?: string | number | null;
    chk_stock?: number;
    classID?: number | null;
    productname?: string | null;
    productseries?: string | null;
    providerseries?: string | null;
    bonus?: number | null;
    productsimpleprofile?: string | null;
    productprofile?: string | null;
    productprofile1?: string | null;
    productprofile2?: string | null;
    usermanual?: string | null;
    auction_startprice?: number | null;
    auction_unit?: number | null;
    auction_start_yy?: number | null;
    auction_start_mm?: number | null;
    auction_start_dd?: number | null;
    auction_end_yy?: number | null;
    auction_end_mm?: number | null;
    auction_end_dd?: number | null;
    auction_ship_price?: number | null;
    marketprice?: string | number | null;
    memberprice?: string | null;
    providerprice?: string | number | null;
    bonusprice?: string | null;
    bonuspriceSel?: string | null;
    bonuspriceA?: string | null;
    bonuspriceB?: string | null;
    bonuspriceC?: string | null;
    bonuspriceA_percent?: string | null;
    bonuspriceA_Sel?: string | null;
    bonuspriceB_Plus?: string | null;
    chk_hot?: number | null;
    chk_auction?: number | null;
    chk_special?: number | null;
    chk_limit?: number | null;
    chk_assembly?: number;
    product_s_gif?: string | null;
    product_s_1_gif?: string | null;
    product_s_2_gif?: string | null;
    product_l_gif?: string | null;
    product_large_gif?: string | null;
    product_special_gif?: string | null;
    productnum?: number | null;
    productordernum?: number | null;
    posttime?: string | null;
    wholeseries?: string | null;
    limit_ordernum?: number | null;
    auction_ordernum?: number | null;
    hot_ordernum?: number | null;
    special_ordernum?: number | null;
    factory_email?: string | null;
    click?: number;
    safenum?: number;
    colorsize?: number;
    letterSearch?: string | null;
    languageSearch?: string | null;
    shopNum?: number;
    chkdel?: number;
    barcode?: string | null;
    combination_amount?: string | null;
    combination_price?: string | null;
    combination_bonus?: string | null;
    onTop?: number;
    level1?: string | null;
    level2?: string | null;
    level3?: string | null;
    level4?: string | null;
    level5?: string | null;
    cost?: string | null;
    updatetime?: string | null;
    creator?: string | null;
    modifer?: string | null;
}

/**
 * API 列表/詳情回傳的產品型別（與 ProProductTable 對齊，productID 必填）。
 * 由 useAppProduct 使用，getById / fetchList 回傳此型別。
 * folderName 為前端/API 擴充，非 DB 欄位（最上層分類的產品圖片資料夾名稱）。
 */
export type ProductItem = Partial<ProProductTable> & {
    productID: number;
    classID: number;
    productname: string;
    productordernum: number;
    stock: number;
    chkdel: number;
    onTop: number;
    marketprice: number | string;
    folderName?: string | null;
};

/**
 * 表單用型別（新增/編輯產品）。
 * 欄位與 pro_product 一致，productID 僅編輯時有值；必填欄位為表單驗證用。
 */
export type ProductForm = Partial<ProProductTable> & {
    productID?: number;
    classID: number;
    productname: string;
    productseries: string;
    productsimpleprofile: string;
    productprofile: string;
    productprofile2: string;
    marketprice: number;
    productordernum: number;
    stock: number;
    chkdel: number;
    onTop: number;
};

export interface ProductFormErrors {
    productname: string | boolean;
}
