# Mental Health Tracker

A modern, privacy-focused web application for tracking mental health, mood, and personal journaling. Built with Next.js 15, Supabase, and Tailwind CSS. Features AI-powered insights, comprehensive analytics, and a beautiful responsive interface.

🌐 **Live Demo**: [https://mentalhealthai-chi.vercel.app/](https://mentalhealthai-chi.vercel.app/)

## 🚀 Features

### 🔐 Authentication
- **Magic Link Authentication**: Secure email-based login without passwords
- **User Session Management**: Automatic session handling and persistence
- **Privacy-First**: No password storage, secure token-based authentication
- **Production-Ready**: Configured for Vercel deployment with proper redirects

### 📊 Mood Tracking
- **Daily Mood Entries**: Track your mood with 5 different levels (Excellent to Terrible)
- **Energy Level Tracking**: Monitor your energy levels on a 1-10 scale
- **Activity Logging**: Record daily activities that impact your mood
- **Notes & Reflections**: Add personal notes to each mood entry
- **Visual Statistics**: See your mood trends and patterns over time
- **Streak Tracking**: Celebrate consistency with mood tracking streaks

### 📝 Journal
- **Private Journaling**: Write personal reflections and thoughts
- **Mood Association**: Link journal entries to your mood
- **Tagging System**: Organize entries with custom tags
- **Search & Filter**: Find entries by content, mood, or tags
- **Rich Content**: Long-form writing with full text support
- **Journal Streaks**: Track consecutive days of journaling

### 📈 Analytics & Insights
- **Mood Trends**: Visual charts showing your mood over time
- **Weekly Patterns**: Track your mood patterns throughout the week
- **Energy Analysis**: Monitor your energy level trends
- **Streak Tracking**: Celebrate your consistency with tracking streaks
- **Personal Insights**: AI-powered insights about your mental health patterns
- **Growth Metrics**: Track weekly mood and journal growth percentages

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode Ready**: Built with theming support
- **Intuitive Navigation**: Easy-to-use sidebar navigation
- **Beautiful Animations**: Smooth transitions and micro-interactions
- **Accessibility**: Built with accessibility best practices
- **Real-time Notifications**: Smart notification system with personalized insights

### 🧠 AI Insights
- **Personalized Recommendations**: AI-generated insights based on your data
- **Pattern Recognition**: Identify mood and energy patterns
- **Predictive Analytics**: Understand your mental health trends
- **Smart Notifications**: Context-aware reminders and achievements

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Forms**: React Hook Form + Zod
- **Charts**: Custom chart components

### Backend & Database
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage (if needed)

### Development & Deployment
- **Package Manager**: pnpm
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Environment**: Environment variables with Vercel integration

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mental_health_tracker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings > API
   - Create the database tables (see Database Setup below)

4. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # AI Configuration (Optional)
   NEXT_PUBLIC_AI_PROVIDER=gemini
   NEXT_PUBLIC_AI_MODEL=gemini-2.5-flash-lite
   NEXT_PUBLIC_AI_API_KEY=your_ai_api_key_here
   NEXT_PUBLIC_HUGGINGFACE_TOKEN=your_huggingface_token_here
   ```

5. **Database Setup**
   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT NOT NULL,
     full_name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create mood_entries table
   CREATE TABLE mood_entries (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) NOT NULL,
     mood TEXT NOT NULL CHECK (mood IN ('excellent', 'good', 'neutral', 'bad', 'terrible')),
     energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
     notes TEXT,
     activities TEXT[] DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create journal_entries table
   CREATE TABLE journal_entries (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) NOT NULL,
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     mood TEXT CHECK (mood IN ('excellent', 'good', 'neutral', 'bad', 'terrible')),
     tags TEXT[] DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create ai_insights table for AI-powered features
   CREATE TABLE ai_insights (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) NOT NULL,
     data_hash TEXT NOT NULL,
     insights_data JSONB NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     expires_at TIMESTAMP WITH TIME ZONE NOT NULL
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
   ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
   ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);

   CREATE POLICY "Users can insert own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can view own mood entries" ON mood_entries
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own mood entries" ON mood_entries
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own mood entries" ON mood_entries
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own mood entries" ON mood_entries
     FOR DELETE USING (auth.uid() = user_id);

   CREATE POLICY "Users can view own journal entries" ON journal_entries
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own journal entries" ON journal_entries
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own journal entries" ON journal_entries
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own journal entries" ON journal_entries
     FOR DELETE USING (auth.uid() = user_id);

   CREATE POLICY "Users can view own ai insights" ON ai_insights
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own ai insights" ON ai_insights
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own ai insights" ON ai_insights
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own ai insights" ON ai_insights
     FOR DELETE USING (auth.uid() = user_id);

   -- Create function to handle new user registration
   CREATE OR REPLACE FUNCTION handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO profiles (id, email)
     VALUES (NEW.id, NEW.email);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Create trigger for new user registration
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION handle_new_user();
   ```

6. **Run the development server**
   ```bash
   pnpm dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel Deployment (Recommended)

#### Automatic Deployment with CI/CD

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and configure the build

3. **Configure Environment Variables**
   In your Vercel dashboard, add these environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Configure Supabase Auth Redirects**
   - Go to your Supabase dashboard
   - Navigate to Authentication → Settings
   - Update Site URL to your Vercel domain
   - Add redirect URLs:
     ```
     https://your-project.vercel.app/auth/callback
     https://your-project.vercel.app/dashboard
     ```

#### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### GitHub Actions CI/CD

The project includes a GitHub Actions workflow for automated testing and deployment:

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 📁 Project Structure

```
mental_health_tracker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   │   ├── callback/      # Auth callback handling
│   │   │   └── login/         # Login page
│   │   ├── dashboard/         # Main app pages
│   │   │   ├── ai-insights/   # AI-powered insights
│   │   │   ├── analytics/     # Analytics and charts
│   │   │   ├── calendar/      # Calendar view
│   │   │   ├── journal/       # Journal management
│   │   │   ├── mood/          # Mood tracking
│   │   │   └── settings/      # User settings
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   ├── contexts/              # React contexts (AuthContext)
│   └── lib/                   # Utilities and configurations
│       ├── supabase.ts        # Supabase client configuration
│       ├── data-optimization.ts # Data caching and optimization
│       └── ai-insights-enhanced.ts # AI insights functionality
├── public/                    # Static assets
├── scripts/                   # Deployment scripts
│   ├── setup-deployment-windows.bat
│   └── setup-deployment-windows.ps1
├── .github/                   # GitHub Actions workflows
│   └── workflows/
│       └── ci-cd.yml
├── package.json               # Dependencies and scripts
├── vercel.json               # Vercel configuration
├── env.example               # Environment variables template
├── DEPLOYMENT.md             # Deployment guide
├── DEPLOYMENT-WINDOWS.md     # Windows-specific deployment guide
└── README.md                 # This file
```

## 🔧 Key Features Explained

### Authentication Flow
1. User enters email on login page
2. Magic link is sent to their email
3. User clicks link and is authenticated
4. Session is maintained automatically
5. User can sign out when needed
6. **Production-ready**: Configured with proper redirects for Vercel deployment

### Mood Tracking
- **5 Mood Levels**: Excellent, Good, Neutral, Bad, Terrible
- **Energy Scale**: 1-10 energy level tracking
- **Activity Tags**: Predefined activities (Exercise, Work, Socializing, etc.)
- **Notes**: Optional text notes for each entry
- **Timestamps**: Automatic date/time tracking
- **Streak Tracking**: Celebrate consecutive days of mood tracking

### Journal System
- **Rich Text**: Full content support for long-form writing
- **Mood Association**: Link entries to current mood
- **Tagging**: Custom tags for organization
- **Search**: Full-text search across titles and content
- **Filtering**: Filter by mood or tags
- **Journal Streaks**: Track consecutive days of journaling

### Analytics & Insights
- **Weekly Trends**: Visual mood trends over the past week
- **Mood Distribution**: Pie chart of mood frequency
- **Energy Analysis**: Average energy level tracking
- **Streak Counting**: Consecutive days of tracking
- **Personal Insights**: AI-generated insights about patterns
- **Growth Metrics**: Track weekly mood and journal growth percentages
- **Combined Analytics**: View mood and journal data together

### AI Insights
- **Personalized Recommendations**: AI-generated insights based on your data
- **Pattern Recognition**: Identify mood and energy patterns
- **Predictive Analytics**: Understand your mental health trends
- **Smart Notifications**: Context-aware reminders and achievements
- **Data Optimization**: Cached insights for better performance

### Smart Notifications
- **Context-Aware**: Based on your actual data and patterns
- **Achievement Celebrations**: Celebrate streaks and milestones
- **Reminder System**: Gentle reminders for mood tracking and journaling
- **Energy Insights**: Notifications about energy level patterns
- **Personalized**: Tailored to your specific usage patterns

## 🛠 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking

# Database
pnpm db:generate  # Generate database types
pnpm db:push      # Push schema changes to database
```

### Code Quality

- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting with strict rules
- **Prettier**: Code formatting
- **React Hooks**: Proper hook usage with exhaustive deps
- **Error Handling**: Comprehensive error handling and user feedback

### Performance Optimizations

- **Data Caching**: Optimized data fetching with caching
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Next.js built-in image optimization
- **Bundle Optimization**: Tree shaking and code splitting
- **Database Queries**: Optimized Supabase queries

## 🔒 Security

### Authentication Security
- **Magic Links**: No password storage, secure token-based auth
- **Session Management**: Automatic session handling
- **Row Level Security**: Database-level security policies
- **CORS Protection**: Proper CORS configuration
- **Environment Variables**: Secure environment variable handling

### Data Privacy
- **User Isolation**: Each user can only access their own data
- **Encrypted Storage**: Supabase provides encrypted data storage
- **No Data Sharing**: No user data is shared or sold
- **GDPR Compliant**: Built with privacy regulations in mind

## 🚀 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Yes | - |
| `NEXT_PUBLIC_AI_PROVIDER` | AI provider (gemini, openai, huggingface) | No | gemini |
| `NEXT_PUBLIC_AI_MODEL` | AI model name | No | gemini-2.5-flash-lite |
| `NEXT_PUBLIC_AI_API_KEY` | AI API key | No | - |
| `NEXT_PUBLIC_HUGGINGFACE_TOKEN` | Hugging Face token | No | - |

## 🐛 Troubleshooting

### Common Issues

#### Authentication Redirect Issues
If users are redirected to localhost after clicking magic links:

1. **Check Supabase Settings**
   - Go to Authentication → Settings
   - Update Site URL to your production domain
   - Add proper redirect URLs

2. **Verify Environment Variables**
   - Ensure all Supabase environment variables are set correctly
   - Check that the URLs match your deployment

#### Build Errors
If you encounter build errors:

1. **Check TypeScript Errors**
   ```bash
   pnpm type-check
   ```

2. **Fix ESLint Issues**
   ```bash
   pnpm lint
   ```

3. **Clear Cache**
   ```bash
   rm -rf .next
   pnpm build
   ```

#### Database Connection Issues
If you can't connect to Supabase:

1. **Verify Environment Variables**
   - Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
   - Ensure the keys are from the correct project

2. **Check RLS Policies**
   - Verify that Row Level Security policies are properly configured
   - Test with a fresh user account

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   pnpm lint
   pnpm type-check
   pnpm build
   ```
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- **TypeScript**: All new code must be properly typed
- **ESLint**: Follow the project's ESLint rules
- **Testing**: Add tests for new features
- **Documentation**: Update documentation for new features
- **Performance**: Consider performance implications of changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help:

1. **Check the Issues** page for existing solutions
2. **Create a new issue** with detailed information
3. **Include your environment** and steps to reproduce
4. **Check the documentation** in the `/docs` folder

### Getting Help

- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)
- **Documentation**: Check the `/docs` folder for detailed guides
- **Community**: Join our Discord server (if available)

## 🗺 Roadmap

### Short Term (Next 3 months)
- [ ] Dark mode support
- [ ] Mobile app (React Native)
- [ ] Export data functionality
- [ ] Reminder notifications
- [ ] Advanced analytics dashboard

### Medium Term (3-6 months)
- [ ] Social features (optional sharing)
- [ ] Integration with health apps
- [ ] Machine learning insights
- [ ] Custom themes
- [ ] API for third-party integrations

### Long Term (6+ months)
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Voice journaling
- [ ] Professional therapist integration
- [ ] Community features

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Supabase Team** for the excellent backend-as-a-service
- **Vercel Team** for seamless deployment
- **Tailwind CSS** for the beautiful styling system
- **Lucide** for the beautiful icons
- **All Contributors** who help improve this project

---

Built with ❤️ for better mental health tracking

**Live Demo**: [https://mentalhealthai-chi.vercel.app/](https://mentalhealthai-chi.vercel.app/)
