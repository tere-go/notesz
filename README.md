# 📝 Notes App with AI

A modern, full-featured notes application built with Express.js, Supabase, and OpenAI integration.

## ✨ Features

### 📋 Core Functionality
- **Create, Read, Update, Delete** notes with beautiful modals
- **Real-time search** across titles, content, and actions
- **Multi-line actions** with dedicated sections
- **Responsive design** that works on desktop and mobile

### 🤖 AI-Powered
- **AI Action Generation** using OpenAI GPT-3.5-turbo
- **Smart action extraction** from note content
- **Formatted output** in "Name - Task" format

### 🎨 Modern UI
- **Dark blue gradient theme** with professional appearance
- **Glass-morphism design** with backdrop blur effects
- **Custom scrollbars** and smooth animations
- **Mobile-responsive** layout

### 🔍 Advanced Features
- **Instant search filtering** in sidebar
- **Character counters** for all input fields
- **Loading states** and error handling
- **Keyboard shortcuts** (Escape to close modals)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/notes-app.git
   cd notes-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   ```

4. **Set up Supabase database**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `sql/create_notes_table.sql`

5. **Start the application**
   ```bash
   npm start
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🗄️ Database Schema

The app uses a simple but effective schema:

```sql
CREATE TABLE notes (
    note_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    content TEXT,
    actions TEXT
);
```

## 🔧 Configuration

### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings → API
3. Run the SQL script to create the notes table

### OpenAI Setup
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file
3. The app uses GPT-3.5-turbo for action generation

## 📱 Usage

### Creating Notes
1. Click "**+ Add New Note**" in the sidebar
2. Fill in title, content, and actions
3. Use "**🤖 Generate Actions with AI**" to auto-generate action items
4. Save your note

### Managing Notes
- **Search**: Type in the search bar to filter notes instantly
- **Edit**: Click the ✏️ button on any note
- **Delete**: Click the 🗑️ button with confirmation
- **View**: Click any note in the sidebar to view full content

### AI Features
- Enter note content and click "Generate Actions with AI"
- AI analyzes your content and suggests actionable items
- Actions are formatted as "Name - Task" bullet points

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-3.5-turbo
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Styling**: Modern CSS with glass-morphism effects

## 📦 Scripts

```bash
npm start          # Start the production server
npm run dev        # Start with nodemon for development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend-as-a-service
- [OpenAI](https://openai.com) for the powerful AI capabilities
- [Express.js](https://expressjs.com) for the robust web framework

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

**Made with ❤️ and ☕**