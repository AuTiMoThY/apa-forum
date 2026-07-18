/**
 * 查找圖片對應的圖說欄位
 * @param fields 欄位陣列
 * @param imageFieldIndex 圖片欄位的索引
 * @returns 圖說欄位的值，如果沒有則返回空字串
 */
export const getImageCaption = (fields: any[], imageFieldIndex: number): string => {
    if (!fields || !Array.isArray(fields)) return "";

    const imageField = fields[imageFieldIndex];
    if (!imageField) return "";

    // 嘗試查找緊接在圖片後面的圖說欄位
    const nextField = fields[imageFieldIndex + 1];
    if (nextField && nextField.type === "caption") {
        return typeof nextField.value === "string" ? nextField.value : "";
    }

    // 如果沒有緊接的圖說，嘗試通過 label 匹配
    // 例如 "圖片1" 對應 "圖說1"，"圖片2" 對應 "圖說2"
    const imageLabel = imageField.label || "";
    const captionLabel = imageLabel.replace(/圖片(\d*)/, "圖說$1");

    const captionField = fields.find(
        (f) => f.type === "caption" && f.label === captionLabel
    );

    if (captionField) {
        return typeof captionField.value === "string" ? captionField.value : "";
    }

    // 如果還是找不到，嘗試找任何圖說欄位（作為後備）
    const anyCaptionField = fields.find((f) => f.type === "caption");
    if (anyCaptionField) {
        return typeof anyCaptionField.value === "string"
            ? anyCaptionField.value
            : "";
    }

    return "";
};
