# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY drizzle ./drizzle
COPY shared ./shared
COPY attached_assets ./attached_assets
COPY client ./client
COPY server ./server
COPY vite.config.ts tsconfig.json tsconfig.node.json ./
COPY components.json tailwind.config.js postcss.config.js ./
COPY check-resend-emails.ts populate-eu-ai-act-courses.ts ./

# Install deps and build
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only production necessities
COPY package.json pnpm-lock.yaml ./
COPY drizzle ./drizzle
COPY dist ./dist
COPY shared ./shared
COPY attached_assets ./attached_assets
COPY client ./client
COPY server ./server
COPY vite.config.ts tsconfig.json tsconfig.node.json ./
COPY components.json tailwind.config.js postcss.config.js ./

# Install production deps only
RUN pnpm install --frozen-lockfile --prod

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
