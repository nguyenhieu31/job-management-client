# ===========================
# 1️⃣ BUILD STAGE
# ===========================
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ===========================
# 2️⃣ RUN STAGE (Next.js server)
# ===========================
FROM node:20-alpine

WORKDIR /app
COPY --from=build /app ./

# Set biến môi trường production
ENV NODE_ENV=production
EXPOSE 3000

# Chạy Next.js server
CMD ["npm", "run", "start"]
