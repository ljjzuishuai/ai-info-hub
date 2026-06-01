# ===== 构建阶段 =====
FROM node:22-alpine AS builder

WORKDIR /app

# 复制 package.json 文件
COPY package.json package-lock.json* ./
COPY client/package.json client/
COPY server/package.json server/

# 安装所有依赖（含 devDependencies，因为要构建）
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# 复制全部源码
COPY . .

# 构建前端
RUN cd client && npm run build

# 构建后端
RUN cd server && npm run build

# ===== 运行阶段 =====
FROM node:22-alpine

WORKDIR /app

# 只复制运行时需要的文件
COPY --from=builder /app/server/package.json /app/server/package-lock.json* /app/server/
COPY --from=builder /app/server/dist /app/server/dist
COPY --from=builder /app/server/node_modules /app/server/node_modules
COPY --from=builder /app/client/dist /app/client/dist

# 创建数据目录
RUN mkdir -p /app/server/data

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "server/dist/index.js"]
