/**
 * 表單用型別（新增/編輯分類），與 CaseForm 寫法一致。
 * classlistID 僅編輯時使用。
 */
export interface ProductCategoryForm {
    classlistID?: number;
    folderName: string;
    classname: string;
    classseries: string;
    classmaster: number;
    classordernum: number;
    chkdel: number;
    onTop: number;
    pic: string;
}

export interface ProductCategoryFormErrors {
    classname: string | boolean;
}
