# MySQL 初始化腳本目錄

將您的 SQL 初始化檔案放在此目錄下，容器首次啟動時會自動執行。

## 使用方式

1. 將 SQL 檔案複製到此目錄：
   ```bash
   cp your_init.sql docker/mysql/init/
   ```

2. 檔案會按照字母順序執行

3. 重新啟動 MySQL 容器（如果已經啟動）：
   ```bash
   docker compose down mysql
   docker compose up -d mysql
   ```

## 腳本執行順序（依檔名字母）

- `00_*`：字符集、使用者
- `01_*`：系統表（架構、模組、權限等）
- `02_*`：顏色／商品相關表
- `03_*`：最新商品表（new_products）
- `04_*`：首頁橫幅表（home_banner，含連結欄位 link_type / link_product_id / link_url）
- `04b_*`：若 home_banner 已存在但無連結欄位，可手動執行一次以新增欄位
- `05_*`：首頁兩連結表（home_links）
- `06_*`：首頁精選商品表（home_top_pdt）

若資料庫已存在，欲新增上述表請手動執行對應 SQL 或使用 `docker compose exec` 載入。

## 注意事項

- 只有首次啟動時會執行（當資料庫 Volume 為空時）
- 如果資料庫已經存在資料，不會再次執行
- 如需重新初始化，需要刪除 Volume：
  ```bash
  docker compose down -v
  docker compose up -d
  ```

## 資料庫字符集配置

專案預設使用 **utf8mb4** 字符集和 **utf8mb4_general_ci** 排序規則，以支援完整的 Unicode 字符（包括 emoji）。

配置方式：
1. **MySQL 配置文件**：`docker/mysql/my.cnf` 設置伺服器預設字符集
2. **初始化腳本**：`00_init_database_charset.sql` 明確設置資料庫字符集

如果資料庫已存在，需要手動設置字符集：
```sql
ALTER DATABASE `your_database_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

## 用戶密碼同步

如果修改了 `.env` 文件中的 `MYSQL_USER` 或 `MYSQL_PASSWORD`，或者遇到 phpMyAdmin 無法連線的問題，請使用同步腳本：

**Windows (PowerShell):**
```powershell
.\sync-mysql-users.ps1
```

**Windows (CMD):**
```cmd
sync-mysql-users.bat
```

**Linux/Mac:**
```bash
bash ../sync-mysql-users.sh
```

此腳本會確保 MySQL 用戶密碼與環境變數一致，無需重新初始化資料庫。
