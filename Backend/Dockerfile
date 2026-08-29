# Stage 1: Build in Linux environment
FROM public.ecr.aws/lambda/nodejs:20 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --production=false

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production image
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy production files
COPY --from=builder /app/dist ./src
COPY --from=builder /app/node_modules ./node_modules

# Rebuild native modules for Lambda
RUN rm -rf node_modules/bcrypt/lib/binding/*
RUN npm rebuild bcrypt --update-binary

# Set Lambda-specific environment variables
ENV NODE_ENV=production
ENV IS_LAMBDA=true
ENV PORT=3000

# Add database credentials as environment variables
ENV DB_NAME='db_aa010d_eltek'
ENV DB_HOST='MYSQL6013.site4now.net'
ENV DB_PASSWORD='Bp4N3FDfKL7ZTY@'
ENV DB_USER='aa010d_kultwano'
ENV REDIS_URL='redis://timepay-tracker-ga8wlc.serverless.eun1.cache.amazonaws.com:6379'

# Disable filesystem logging
ENV LOG_TO_FILESYSTEM=false

# Use console logging only
ENV LOG_FORMAT=json

CMD ["src/server.handler"]
