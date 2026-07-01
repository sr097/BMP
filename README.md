# ClearSpeak AI

A web application designed to help autistic teens understand confusing phrases, social situations, and conversations by breaking them down into clear, literal explanations using AI.

## 🌟 Features

ClearSpeak AI provides three simple tools to make communication easier and less stressful:

1. **Literal Meaning Tool** - Explains what figurative phrases actually mean versus what they sound like they mean
2. **Common Situations** - Pre-loaded social situation explanations with ability to describe custom situations
3. **Conversation Breakdown Helper** - Analyzes confusing conversations by intent, emotion, and hidden social rules

## 🚀 Quick Start

### Prerequisites

- Node.js 24+
- pnpm package manager
- Groq API key (optional - app degrades gracefully without it)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <repository-name>
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:
```
GROQ_API_KEY=your_groq_api_key_here
PORT=8080
```

### Running the Application

1. Start the API server:
```bash
pnpm --filter @workspace/api-server run dev
```

2. Start the frontend (in a new terminal):
```bash
pnpm --filter @workspace/clearspeak run dev
```

3. Open your browser to: http://localhost:3000

### Development Commands

```bash
# Typecheck all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Run API server only
pnpm --filter @workspace/api-server run dev

# Run frontend only
pnpm --filter @workspace/clearspeak run dev

# Run mobile app build
pnpm --filter @workspace/clearspeak-mobile run dev
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React + Vite + Tailwind CSS v4 + wouter routing
- **Backend**: Express 5 with TypeScript
- **AI**: Groq API (llama-3.3-70b-versatile model)
- **Build Tool**: pnpm workspaces
- **Database**: Optional PostgreSQL (app works with in-memory storage for development)

### Project Structure

```
frontend/
├── artifacts/
│   ├── api-server/          # Express backend server
│   ├── clearspeak/          # Main web application
│   ├── clearspeak-mobile/   # Mobile app (Expo)
│   └── mockup-sandbox/      # Development sandbox
├── lib/
│   ├── api-client-react/    # React API client
│   ├── api-spec/           # OpenAPI specification
│   ├── api-zod/            # Zod schemas
│   ├── db/                 # Database layer
│   └── replit-auth-web/    # Authentication hook
└── scripts/                # Build and utility scripts
```

## 🔐 Authentication

The app includes a mock authentication system for development:

- **Development**: Uses simple username-based login with in-memory sessions
- **Production**: Can be configured to use real OIDC authentication (Replit/Google)
- **Sessions**: Stored in memory by default, can use PostgreSQL with `DATABASE_URL`

To enable real authentication:
1. Set up a PostgreSQL database
2. Add `DATABASE_URL` to your `.env` file
3. Configure OIDC provider settings (currently set up for Replit)

## 🧪 Testing

```bash
# Run API server tests
pnpm --filter @workspace/api-server run test

# Run tests with coverage
pnpm --filter @workspace/api-server run test:coverage
```

## 📦 Deployment

### Frontend (Vercel)

The frontend can be deployed to Vercel:

1. **Install Vercel CLI** (optional):
```bash
npm i -g vercel
```

2. **Deploy to Vercel**:
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

**Required Environment Variables:**
- `VITE_API_URL` - Your API server URL (e.g., https://your-api-server.vercel.app)

### Backend (API Server)

The API server should be deployed separately:

**Options:**
- **Vercel Serverless Functions**: Convert Express to serverless functions
- **Railway**: Easy deployment with PostgreSQL
- **Render**: Free tier available
- **DigitalOcean App Platform**
- **Heroku** (paid)

**Example Railway deployment:**
1. Create a new project on Railway
2. Add PostgreSQL database
3. Set environment variables (`GROQ_API_KEY`, `DATABASE_URL`, `PORT`)
4. Deploy the `artifacts/api-server` directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with React, Vite, and Tailwind CSS
- AI powered by Groq's llama-3.3-70b-versatile model
- Designed to help neurodivergent individuals communicate more effectively

## 🐛 Known Issues

- Mock authentication uses in-memory storage (sessions lost on server restart)
- Mobile app requires Replit-specific environment variables for deployment
- Some IDE-specific configurations may need adjustment for local development

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub or contact the maintainers.

---

**Note**: This project is designed to be helpful and inclusive. If you have suggestions for improving accessibility or user experience for neurodivergent individuals, please contribute!