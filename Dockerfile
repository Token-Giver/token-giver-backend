FROM node:latest AS builder

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

# Generate Prisma client
RUN npx prisma generate

RUN yarn build

# Production stage
FROM node:latest AS production
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install only production dependencies
RUN yarn install --production

# Copy built application and Prisma files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Create a startup script to handle Prisma migrations
RUN echo '#!/bin/sh\n\
    echo "Running Prisma migrations..."\n\
    npx prisma migrate deploy\n\
    echo "Starting application..."\n\
    node dist/main' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]