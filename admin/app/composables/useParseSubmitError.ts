/**
 * 從 API 拋出的錯誤中解析出欄位錯誤與一般訊息。
 * 會把 data.errors 寫入傳入的 errors 物件，並回傳用於 submitError / toast 的訊息。
 *
 * @param error - catch 到的錯誤（$fetch 可能為 error.data / error.response._data）
 * @param errors - 表單欄位錯誤物件（會就地寫入 API 回傳的欄位錯誤）
 * @param defaultMessage - 無法取得訊息時的預設中文
 * @returns 用於 submitError.value 與 toast 的訊息字串
 */
export function parseSubmitError(
    error: unknown,
    errors: Record<string, unknown>,
    defaultMessage: string
): string {
    const err = error as {
        data?: unknown;
        response?: { _data?: unknown };
        message?: string;
    };
    const data = err?.data ?? err?.response?._data;

    const fieldErrors =
        data &&
        typeof data === "object" &&
        "errors" in data &&
        data.errors &&
        typeof data.errors === "object"
            ? (data.errors as Record<string, string | string[]>)
            : null;

    if (fieldErrors) {
        const errObj = errors as Record<string, string>;
        Object.entries(fieldErrors).forEach(([key, val]) => {
            errObj[key] = Array.isArray(val) ? val.join(", ") : String(val);
        });
    }

    const dataObj = data && typeof data === "object" ? data as { message?: string } : null;
    const msg =
        (typeof dataObj?.message === "string" && dataObj.message) ||
        (typeof data === "string" ? data : null) ||
        (typeof err?.message === "string" ? err.message : null) ||
        defaultMessage;

    return msg;
}
