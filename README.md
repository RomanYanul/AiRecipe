# AI Recipe Generator

A full-stack application that generates recipes using AI. This project is built with React, TypeScript, Material UI, and Redux for the frontend, and Node.js, Express, and MongoDB for the backend.

## Features

- User authentication (register, login, logout)
- JWT-based authentication
- Responsive UI with Material UI
- State management with Redux Toolkit
- MongoDB database with Mongoose ODM
- Docker container for MongoDB

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ai-recipe-generator
   ```

2. Start the MongoDB container:
   ```
   docker-compose up -d
   ```

3. Install backend dependencies and start the server:
   ```
   cd server
   npm install
   npm run dev
   ```

4. In a new terminal, install frontend dependencies and start the client:
   ```
   cd client
   npm install
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
ai-recipe-generator/
├── client/                 # React frontend
│   ├── public/             # Public assets
│   ├── src/                # Source files
│   │   ├── app/            # Redux store setup
│   │   ├── components/     # React components
│   │   ├── features/       # Redux slices
│   │   └── ...
│   └── package.json        # Frontend dependencies
├── server/                 # Node.js backend
│   ├── src/                # Source files
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Entry point
│   └── package.json        # Backend dependencies
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # Project documentation
```

## Environment Variables

### Backend (.env file in server directory)

```
PORT=5000
MONGODB_URI=mongodb://admin:password@localhost:27017/ai-recipe?authSource=admin
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=30d
```

## Future Enhancements

- AI-powered recipe generation
- Save favorite recipes
- Search and filter recipes
- Share recipes with others
- Mobile app version 