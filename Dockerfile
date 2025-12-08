# ===========================
# 1️⃣ BUILD STAGE
# ===========================
FROM node:20-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# ===========================
# 2️⃣ RUN STAGE (Next.js server)
# ===========================
FROM node:20-slim

WORKDIR /app
COPY --from=build /app ./

# Set biến môi trường production
ENV NODE_ENV=production
EXPOSE 3000

# Chạy Next.js server
CMD ["npm", "run", "start"]
