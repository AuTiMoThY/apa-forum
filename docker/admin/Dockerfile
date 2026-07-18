FROM node:20-alpine

# 安裝 pnpm
RUN npm install -g pnpm@10.24.0

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 安裝依賴（利用 Docker 層快取）
RUN pnpm install --frozen-lockfile

# 複製專案檔案
COPY . .

# 暴露端口
EXPOSE 8091

# 預設命令（可在 docker-compose.yml 中覆蓋）
CMD ["pnpm", "dev"]
