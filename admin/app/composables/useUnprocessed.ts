import type { NavigationMenuItem } from "@nuxt/ui";

export const useUnprocessed = () => {
    const { resolvePath } = useStructureResolver();
    const { getUnprocessedCount: getUnprocessedContactCount } = useAppContact();
    const { getUnprocessedCount: getUnprocessedCaseMsgCount } = useAppCaseMsg();

    const { data: modulesData } = useModule();
    // 使用 asideData 因為這是用於側邊欄顯示的數據
    const { asideData: structureData } = useStructure();

    // 未處理聯絡表單數量（key: structure_id, value: count）
    const unprocessedContactCountsMap = ref<Map<number, number>>(new Map());
    // 未處理預約賞屋表單數量（key: structure_id, value: count）
    const unprocessedCaseMsgCountsMap = ref<Map<number, number>>(new Map());

    /**
     * 根據選單項目取得對應的 structure_id
     * @param item 選單項目
     * @returns structure_id
     */
    const getStructureIdFromMenuItem = (
        item: NavigationMenuItem
    ): number | null => {
        if (!item.to) return null;

        const toPath =
            typeof item.to === "string" ? item.to : item.to.path || "";
        const pathInfo = resolvePath(toPath);
        return pathInfo.structure_id;
    };

    /**
     * 判斷選單項目是否為聯絡表單
     * @param item 選單項目
     * @returns 是否為聯絡表單
     */
    const isContactMenuItem = (item: NavigationMenuItem): boolean => {
        if (!item.to) return false;

        // 將 to 轉換為字串
        const toPath =
            typeof item.to === "string" ? item.to : item.to.path || "";

        // 移除開頭的斜線
        const path = toPath.startsWith("/") ? toPath.slice(1) : toPath;

        // 檢查是否為聯絡表單的路徑
        // 可以根據 URL 或模組名稱判斷
        const pathInfo = resolvePath(toPath);
        if (pathInfo.module_name === "contact") {
            return true;
        }

        // 也可以直接檢查 URL 是否包含 'contact'
        if (path === "contact" || path.startsWith("contact/")) {
            return true;
        }

        return false;
    };

    /**
     * 取得所有聯絡表單選單項目的未處理數量
     */
    const fetchAllUnprocessedContactCounts = async () => {
        if (!structureData.value || structureData.value.length === 0) return;

        // 找出所有聯絡表單模組的結構項目
        const contactStructureItems = findContactStructureItems(
            structureData.value
        );

        // 批量獲取每個聯絡表單結構項目的未處理數量
        const promises = contactStructureItems.map(async (item: any) => {
            const structureId = item.id ? Number(item.id) : null;
            if (!structureId) return null;

            try {
                const count = await getUnprocessedContactCount(structureId);
                return { structureId, count };
            } catch (error) {
                console.error(
                    `Failed to fetch count for structure ${structureId}:`,
                    error
                );
                return { structureId, count: 0 };
            }
        });

        const results = await Promise.all(promises);

        // 更新 Map
        results.forEach((result) => {
            if (result) {
                unprocessedContactCountsMap.value.set(
                    result.structureId,
                    result.count
                );
            }
        });
    };

    /**
     * 遞迴找出所有聯絡表單模組的結構項目
     * @param items 結構項目陣列
     * @returns 聯絡表單模組的結構項目陣列
     */
    const findContactStructureItems = (items: any[]): any[] => {
        const result: any[] = [];

        const traverse = (nodes: any[]) => {
            for (const node of nodes) {
                if (node?.module_id) {
                    const module = modulesData.value?.find(
                        (m: any) => String(m.id) === String(node.module_id)
                    );
                    if (module?.name === "contact") {
                        result.push(node);
                    }
                }
                if (node?.children && node.children.length > 0) {
                    traverse(node.children);
                }
            }
        };

        traverse(items);
        return result;
    };

    /**
     * 取得特定選單項目的未處理聯絡表單數量
     * @param item 選單項目
     * @returns 未處理聯絡表單數量
     */
    const getUnprocessedContactCountForItem = (
        item: NavigationMenuItem
    ): number => {
        if (!isContactMenuItem(item)) return 0;
        const structureId = getStructureIdFromMenuItem(item);
        if (!structureId) return 0;
        return unprocessedContactCountsMap.value.get(structureId) || 0;
    };

    /**
     * 判斷選單項目是否為建案模組（預約賞屋表單）
     * @param item 選單項目
     * @returns 是否為建案模組
     */
    const isCaseMenuItem = (item: NavigationMenuItem): boolean => {
        if (!item.to) return false;

        // 將 to 轉換為字串
        const toPath =
            typeof item.to === "string" ? item.to : item.to.path || "";

        // 檢查是否為建案模組的路徑
        // 可以根據 URL 或模組名稱判斷
        const pathInfo = resolvePath(toPath);
        if (pathInfo.module_name === "case") {
            return true;
        }

        // 也可以直接檢查 URL 是否包含建案相關路徑
        // 移除開頭的斜線
        const path = toPath.startsWith("/") ? toPath.slice(1) : toPath;
        // 建案模組的 URL 可能是 'case', 'new-case' 等
        if (
            path === "case" ||
            path.startsWith("case/") ||
            path.includes("/case")
        ) {
            return true;
        }

        return false;
    };

    /**
     * 取得所有建案選單項目的未處理預約賞屋表單數量
     */
    const fetchAllUnprocessedCaseMsgCounts = async () => {
        if (!structureData.value || structureData.value.length === 0) return;

        // 找出所有建案模組的結構項目
        const caseStructureItems = findCaseStructureItems(structureData.value);

        // 批量獲取每個建案結構項目的未處理數量
        const promises = caseStructureItems.map(async (item: any) => {
            const structureId = item.id ? Number(item.id) : null;
            if (!structureId) return null;

            try {
                const count = await getUnprocessedCaseMsgCount({
                    structure_id: structureId
                });
                return { structureId, count };
            } catch (error) {
                console.error(
                    `Failed to fetch count for structure ${structureId}:`,
                    error
                );
                return { structureId, count: 0 };
            }
        });

        const results = await Promise.all(promises);

        // 更新 Map
        results.forEach((result) => {
            if (result) {
                unprocessedCaseMsgCountsMap.value.set(
                    result.structureId,
                    result.count
                );
            }
        });
    };

    /**
     * 遞迴找出所有建案模組的結構項目
     * @param items 結構項目陣列
     * @returns 建案模組的結構項目陣列
     */
    const findCaseStructureItems = (items: any[]): any[] => {
        const result: any[] = [];

        const traverse = (nodes: any[]) => {
            for (const node of nodes) {
                if (node?.module_id) {
                    const module = modulesData.value?.find(
                        (m: any) => String(m.id) === String(node.module_id)
                    );
                    if (module?.name === "case") {
                        result.push(node);
                    }
                }
                if (node?.children && node.children.length > 0) {
                    traverse(node.children);
                }
            }
        };

        traverse(items);
        return result;
    };

    /**
     * 取得特定選單項目的未處理預約賞屋表單數量
     * @param item 選單項目
     * @returns 未處理預約賞屋表單數量
     */
    const getUnprocessedCaseMsgCountForItem = (
        item: NavigationMenuItem
    ): number => {
        if (!isCaseMenuItem(item)) return 0;
        const structureId = getStructureIdFromMenuItem(item);
        if (!structureId) return 0;
        return unprocessedCaseMsgCountsMap.value.get(structureId) || 0;
    };

    // 監聽 structureData 和 modulesData 的變化，當數據載入完成後自動獲取數量
    watch(
        [structureData, modulesData],
        ([newStructureData, newModulesData]) => {
            // 確保兩個數據都已載入且有內容
            if (
                newStructureData &&
                newStructureData.length > 0 &&
                newModulesData &&
                newModulesData.length > 0
            ) {
                // 數據載入完成後，立即獲取未處理數量
                fetchAllUnprocessedContactCounts();
                fetchAllUnprocessedCaseMsgCounts();
            }
        },
        { immediate: true }
    );

    return {
        isContactMenuItem,
        fetchAllUnprocessedContactCounts,
        getUnprocessedContactCountForItem,
        isCaseMenuItem,
        fetchAllUnprocessedCaseMsgCounts,
        getUnprocessedCaseMsgCountForItem
    };
};
