export const useBasePath = () => {
    // 解析路徑：移除 /add 或 /edit/[id] 後綴，取得基礎路徑
    // 用於在新增/編輯頁面中，取得基礎路徑
    const getBasePath = (path: string): string => {
        if (!path) return path;
        // 移除 /edit/[id] 部分（例如：/about/edit/123）
        const editMatchWithId = path.match(/^(.+)\/edit\/\d+$/);
        if (editMatchWithId && editMatchWithId[1]) {
            return editMatchWithId[1];
        }
        // 移除 /edit 部分（例如：/about/edit）
        if (path.endsWith('/edit')) {
            return path.replace(/\/edit$/, '');
        }
        // 移除 /add 部分（例如：/about/add）
        if (path.endsWith('/add')) {
            return path.replace(/\/add$/, '');
        }
        return path;
    };
    return { getBasePath };
};
