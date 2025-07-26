# Mental Health Tracker

A modern, privacy-focused web application for tracking mental health, mood, and personal journaling. Built with Next.js 15, Supabase, and Tailwind CSS.

## Features

### 🔐 Authentication
- **Magic Link Authentication**: Secure email-based login without passwords
- **User Session Management**: Automatic session handling and persistence
- **Privacy-First**: No password storage, secure token-based authentication

### 📊 Mood Tracking
- **Daily Mood Entries**: Track your mood with 5 different levels (Excellent to Terrible)
- **Energy Level Tracking**: Monitor your energy levels on a 1-10 scale
- **Activity Logging**: Record daily activities that impact your mood
- **Notes & Reflections**: Add personal notes to each mood entry
- **Visual Statistics**: See your mood trends and patterns over time

### 📝 Journal
- **Private Journaling**: Write personal reflections and thoughts
- **Mood Association**: Link journal entries to your mood
- **Tagging System**: Organize entries with custom tags
- **Search & Filter**: Find entries by content, mood, or tags
- **Rich Content**: Long-form writing with full text support

### 📈 Analytics & Insights
- **Mood Trends**: Visual charts showing your mood over time
- **Weekly Patterns**: Track your mood patterns throughout the week
- **Energy Analysis**: Monitor your energy level trends
- **Streak Tracking**: Celebrate your consistency with tracking streaks
- **Personal Insights**: AI-powered insights about your mental health patterns

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode Ready**: Built with theming support
- **Intuitive Navigation**: Easy-to-use sidebar navigation
- **Beautiful Animations**: Smooth transitions and micro-interactions
- **Accessibility**: Built with accessibility best practices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Forms**: React Hook Form + Zod
- **Charts**: Custom chart components
- **Deployment**: Vercel (ready)

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

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

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
   ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

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

## Project Structure

```
mental_health_tracker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main app pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   ├── contexts/              # React contexts
│   └── lib/                   # Utilities and configurations
├── public/                    # Static assets
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Key Features Explained

### Authentication Flow
1. User enters email on login page
2. Magic link is sent to their email
3. User clicks link and is authenticated
4. Session is maintained automatically
5. User can sign out when needed

### Mood Tracking
- **5 Mood Levels**: Excellent, Good, Neutral, Bad, Terrible
- **Energy Scale**: 1-10 energy level tracking
- **Activity Tags**: Predefined activities (Exercise, Work, Socializing, etc.)
- **Notes**: Optional text notes for each entry
- **Timestamps**: Automatic date/time tracking

### Journal System
- **Rich Text**: Full content support for long-form writing
- **Mood Association**: Link entries to current mood
- **Tagging**: Custom tags for organization
- **Search**: Full-text search across titles and content
- **Filtering**: Filter by mood or tags

### Analytics
- **Weekly Trends**: Visual mood trends over the past week
- **Mood Distribution**: Pie chart of mood frequency
- **Energy Analysis**: Average energy level tracking
- **Streak Counting**: Consecutive days of tracking
- **Personal Insights**: AI-generated insights about patterns

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the project**
   ```bash
   pnpm build
   ```

2. **Start production server**
   ```bash
   pnpm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help setting up the project, please:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include your environment and steps to reproduce

## Roadmap

- [ ] Dark mode support
- [ ] Mobile app (React Native)
- [ ] AI-powered insights
- [ ] Export data functionality
- [ ] Reminder notifications
- [ ] Social features (optional sharing)
- [ ] Advanced analytics
- [ ] Integration with health apps

---

Built with ❤️ for better mental health tracking
