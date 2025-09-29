# Payments Service API

A Node.js + MongoDB backend for handling orders, payments, and webhook events. Supports JWT authentication and payment gateway integration.

---

## Features

* User Authentication (JWT)
* Order & Order Status Management
* Payment Gateway Integration (Create Collect Request)
* Webhook for Transaction Updates
* MongoDB Aggregation for Reporting
* Pagination & Sorting Support

---

## Setup & Installation

### Prerequisites

* Node.js >= 18
* MongoDB Atlas cluster

### Installation

```bash
git clone https://github.com/amitkumarpc7/student-dashboard-backend.git
cd student-dashboard-backend
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
MONGO_URI=mongodb+srv://amitkpc11_db_user:I%40makpc1111@edvironbackend.oslokay.mongodb.net/
JWT_SECRET=Iamamitkpc1
PG_KEY=edvtest01
PAYMENT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.
SCHOOL_ID=65b0e6293e9f76a9694d84b4
```

### Run the Server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

---

## API Endpoints

Base URL: `https://student-dashboard-backend-dln5.onrender.com/api`

### 1. User Authentication

#### Register

```bash
curl --location 'https://student-dashboard-backend-dln5.onrender.com/api/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name":"Ammit",
    "email":"amitkpc7@gmail.com",
    "password":"12345678"
}'
```

#### Login

```bash
curl --location 'https://student-dashboard-backend-dln5.onrender.com/api/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email":"amitkpc7@gmail.com",
    "password":"12345678"
}'
```

### 2. Create Payment

````bash
curl --location 'https://student-dashboard-backend-dln5.onrender.com/api/orders/create-payment' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGEzNDliZTZiZDJiZDRkZDdmYjEyYyIsImlhdCI6MTc1OTEzMDg0MSwiZXhwIjoxNzU5NzM1NjQxfQ.CXLcji7v5Xgx7GbUWJcU2f15FMYVCKV1MSet0LBZu0A' \
--header 'Content-Type: application/json' \
--data-raw '{
  "amount": "90",
  "student_info": {
    "name": "Amitttt",
    "email": "amitkpc1122@gmail.com",
    "mobile no":"7021879045"
  },
  "gateway_name": "netbanking"
}'
```bash
curl --location 'https://student-dashboard-backend-dln5.onrender.com/api/orders/create-payment' \
--header 'Authorization: Bearer <your_jwt_token>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "amount": "90",
  "student_info": {
    "name": "Amitttt",
    "email": "amitkpc1122@gmail.com",
    "mobile no":"7021879045"
  },
  "gateway_name": "netbanking"
}'
````

### 3. Webhook (Payment Update)

````bash
curl --location 'https://student-dashboard-backend-dln5.onrender.com/api/webhook' \
--header 'Content-Type: application/json' \
--data-raw '{ 
"status": 200, 
"order_info": { 
"order_id": "68da3564154d1bce65b66b40", 
"order_amount": 2000, 
"transaction_amount": 2200, 
"gateway": "PhonePe",
"bank_reference": "YESBNK222", 
"status": "success", 
"payment_mode": "upi", 
"payemnt_details": "success@ybl", 
"Payment_message": "payment success", 
"payment_time": "2025-04-23T08:14:21.945+00:00", 
"error_message": "NA" 
} 
}'
```json
{
  "status": 200,
  "order_info": {
    "order_id": "collect_id/transaction_id",
    "order_amount": 2000,
    "transaction_amount": 2200,
    "gateway": "PhonePe",
    "bank_reference": "YESBNK222",
    "status": "success",
    "payment_mode": "upi",
    "payment_details": "success@ybl",
    "payment_message": "payment success",
    "payment_time": "2025-04-23T08:14:21.945+00:00",
    "error_message": "NA"
  }
}
````

### 4. Fetch All Transactions

````bash
curl --location 'https://student-dashboard-backend-dln5.onrender.com/api/transactions' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGEzNDliZTZiZDJiZDRkZDdmYjEyYyIsImlhdCI6MTc1OTEzMDg0MSwiZXhwIjoxNzU5NzM1NjQxfQ.CXLcji7v5Xgx7GbUWJcU2f15FMYVCKV1MSet0LBZu0A' \
--data ''
```bash
GET /api/transactions?page=1&limit=10&sort=payment_time&order=desc
````

### 5. Fetch Transactions by School

````bash
curl --location 'https://student-dashboard-backend-dln5.onrender.com/api/transactions/school/65b0e6293e9f76a9694d84b4' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGEzNDliZTZiZDJiZDRkZDdmYjEyYyIsImlhdCI6MTc1OTEzMDg0MSwiZXhwIjoxNzU5NzM1NjQxfQ.CXLcji7v5Xgx7GbUWJcU2f15FMYVCKV1MSet0LBZu0A'
```bash
GET /api/transactions/school/:schoolId
````

---

## Security

* All endpoints are protected using JWT.

