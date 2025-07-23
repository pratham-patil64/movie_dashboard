# WatchTime: Your Personal Movie & Series Dashboard

## 🎬 Introduction

**WatchTime** is your ultimate personal movie and series dashboard, designed to bring clarity and control back to your entertainment world. Tired of endless scrolling or forgetting that perfect recommendation? WatchTime helps you effortlessly organize your favorite content, discover new titles tailored to your taste, and even schedule watch parties with friends!

Built with modern web technologies, WatchTime offers a sleek, intuitive, and highly responsive user experience, reminiscent of popular streaming platforms.

## ✨ Features

WatchTime comes packed with features to enhance your entertainment journey:

* **Personalized Collection Management:**
    * Effortlessly add and manage your favorite movies and series in one centralized place.
    * Categorize content by genre, year, and type (movie/series).
    * Edit and remove entries from your collection.

* **Smart Search & Auto-Population (TMDB Integration):**
    * Streamlined content entry with real-time search powered by The Movie Database (TMDB).
    * As you type, get instant suggestions for movies and series.
    * Select a suggestion to automatically populate fields like title, poster image, release year, rating, description, and even a YouTube trailer link.

* **Netflix-Inspired Movie Details Modal:**
    * Click on any movie or series to open a professional, immersive modal displaying comprehensive details, a large poster, and quick actions.

* **Dynamic Content Sections:**
    * **Hero Section:** Features your highest-rated movie or a default cinematic experience.
    * **Top 10 Section:** Automatically showcases your top-rated movies and series, providing a quick overview of your best content.
    * **Categorized Browsing:** Content is neatly organized into scrollable rows by genre, making it easy to navigate your collection.

* **Personalized Recommendations:**
    * A dedicated "Recommendations" page that suggests new movies and series.
    * Leverages your existing collection and TMDB's "similar content" API to provide highly personalized suggestions.

* **"Watch Together" Scheduling & Requests:**
    * **For Viewers (of a shared dashboard):** Request to watch a specific movie/series with the dashboard owner by proposing a date and sending a request via email (simulated email notification, real implementation requires serverless function).
    * **For Owners:** A dedicated "Requests" sidebar to view and manage incoming watch requests (accept/decline). Accepted requests visually transform into a reminder card.

* **Public Dashboard Sharing:**
    * Generate a unique, shareable link to your dashboard, allowing others to view your collection without needing to log in.
    * Viewers can interact with the content (e.g., view details, send watch requests) while editing is disabled.

* **User Authentication:**
    * Secure user login and registration powered by Supabase Auth.
    * Protect your personal dashboard with authenticated access.

* **Responsive Design:**
    * Seamlessly adapts to all screen sizes (mobile, tablet, desktop) for an optimal viewing and interaction experience.

## 🛠️ Technologies Used

* **Frontend:**
    * [React](https://react.dev/) (Vite + TypeScript)
    * [Tailwind CSS](https://tailwindcss.com/)
    * [shadcn/ui](https://ui.shadcn.com/) (for beautiful, accessible UI components)
    * [Lucide React](https://lucide.dev/icons/) (for icons)
    * [React Router DOM](https://reactrouter.com/en/main) (for navigation)
    * [date-fns](https://date-fns.org/) (for date manipulation)
    * [Embla Carousel React](https://www.embla-carousel.com/) (for smooth carousels)
    * [React Hook Form](https://react-hook-form.com/) (for form management)
    * [Zod](https://zod.dev/) (for schema validation)
    * [@tanstack/react-query](https://tanstack.com/query/latest/docs/react/overview) (for data fetching and caching)
    * [Sonner](https://sonner.emilkowalski.com/) (for toast notifications)

* **Backend & Database:**
    * [Supabase](https://supabase.com/) (as a Backend-as-a-Service for PostgreSQL database, authentication, and real-time features)

* **External APIs:**
    * [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api) (for movie/series data, search, and recommendations)

## 🚀 Getting Started

Follow these steps to set up and run WatchTime locally.

### Prerequisites

* Node.js (LTS version recommended)
* npm or Bun (Bun is used in `bun.lockb`, but npm/yarn should also work)
* Git
* A [Supabase](https://supabase.com/) account
* A [TMDB API Key (v3)](https://www.themoviedb.org/settings/api)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd movie_dashboard # Or whatever your cloned folder is named
    ```

2.  **Install dependencies:**

    ```bash
    # If using npm
    npm install

    # If using Bun (recommended for speed)
    bun install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of your project and add your Supabase and TMDB API keys:

    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    VITE_SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
    VITE_TMDB_API_KEY=YOUR_TMDB_API_KEY
    ```

    * You can find your Supabase URL and Anon Key in your Supabase project settings under `API`.
    * Obtain your TMDB API Key from your [TMDB account settings](https://www.themoviedb.org/settings/api).

### Supabase Database Setup

You need to set up two tables (`movies` and `watch_requests`) and configure Row Level Security (RLS) in your Supabase project.

1.  **Go to your Supabase project dashboard.**

2.  **Navigate to `SQL Editor`** and run the following SQL queries:

    **a) `movies` table:**

    ```sql
    CREATE TABLE public.movies (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL REFERENCES auth.users(id),
        title text NOT NULL,
        genre text NOT NULL,
        year integer,
        rating numeric,
        image text,
        description text,
        trailer_url text,
        type text NOT NULL,
        created_at timestamp with time zone DEFAULT now()
    );

    ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow read access for all users" ON public.movies FOR SELECT USING (true);
    CREATE POLICY "Allow insert for authenticated users" ON public.movies FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Allow update for owner" ON public.movies FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Allow delete for owner" ON public.movies FOR DELETE USING (auth.uid() = user_id);
    ```

    **b) `watch_requests` table:**

    ```sql
    CREATE TABLE public.watch_requests (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        movie_id text NOT NULL,
        movie_title text NOT NULL,
        movie_image text,
        requester_email text NOT NULL,
        scheduled_date date NOT NULL,
        owner_user_id uuid NOT NULL,
        status text NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
        created_at timestamp with time zone DEFAULT now()
    );

    ALTER TABLE public.watch_requests ENABLE ROW LEVEL SECURITY;

    -- Policy for SELECT: Allow anyone to read requests (useful for owner to see them)
    CREATE POLICY "Enable read access for all users" ON public.watch_requests FOR SELECT USING (true);

    -- Policy for INSERT: Allow authenticated users AND anonymous users (for shared links) to create requests
    CREATE POLICY "Allow anon and auth to create watch requests"
    ON public.watch_requests
    FOR INSERT
    TO public, anon, authenticated
    WITH CHECK (true);

    -- Policy for UPDATE: Only the owner of the dashboard can update the request status
    CREATE POLICY "Enable update for owner_user_id" ON public.watch_requests FOR UPDATE USING (auth.uid() = owner_user_id);
    ```

### Running the Application

1.  **Start the development server:**

    ```bash
    # If using npm
    npm run dev

    # If using Bun
    bun run dev
    ```

2.  Open your browser and navigate to `http://localhost:8080` (or the port indicated by your terminal).

## 💡 Usage

* **Authentication:** Sign up or log in to create your personal dashboard.
* **Add Movies/Series:** Click the "Add" button in the header. Use the search bar to find titles via TMDB, or fill in details manually.
* **Explore:** Browse your collection by scrolling through genre categories and check out your "Top 10."
* **Details:** Click on any movie card to open a detailed modal.
* **Recommendations:** Click the "Recommendations" button in the header to discover new content personalized to your existing collection.
* **Share:** Share your dashboard with friends using the "Share" button. They can view your collection and even send "Watch Together" requests.
* **Watch Together:** If you're the dashboard owner, manage incoming watch requests via the "Requests" button in the header. If you're viewing a shared dashboard, use the "Watch Together" button on movie cards.

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements or find a bug, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

## 🙏 Acknowledgements

* [Supabase](https://supabase.com/) for the powerful backend services.
* [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing extensive movie and TV show data.
* [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), and [shadcn/ui](https://ui.shadcn.com/) for making modern web development a joy.
