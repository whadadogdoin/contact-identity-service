# 📇 Contact Identity Service
A minimal identity resolution API that links user contact information (email and phone) into unified profiles using PostgreSQL and Prisma. Built with Express.js.4

---

## 🔗 Live Demo

Hosted on **Render**  
👉 [https://contact-identity-service-prod.onrender.com/](https://contact-identity-service-prod.onrender.com/)

You can test the `/identify` endpoint using a tool like Postman or with cURL:

```bash
curl -X POST https://contact-identity-service-prod.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "lorraine@hillvalley.edu", "phoneNumber": "123456"}'
```

## 🚀 Features

- Creates or links contacts using email and/or phone number.
- Maintains primary-secondary relationships between contacts.
- Idempotent and deterministic identity resolution logic.
- Designed for easy testing and CI/CD integration.

---

## 📦 Tech Stack

- **Backend**: Node.js + Express
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Testing**: Vitest + Supertest
- **Deployment**: Render

## ⚙️ Setup
### 1. Clone & Install
```bash
git clone https://github.com/your-username/contact-identity-service.git
cd contact-identity-service
npm install
```
### 2. Configure Environment
```bash
cp .env.example .env
```
### 3. Migrate DB
```bash
npx prisma migrate dev --name init
```
## 🧪 Running Tests
```bash
npm run test:integration
```
## 🛠 Deployment (Render)
### Build Command
```bash
npm install && npm run build
```
### Start Command
```bash
npx prisma migrate deploy && npm run start
```
