# Keep synchronized with @playwright/test in package.json
FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV CI=1

CMD ["npm", "run", "test:bdd"]
