-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  username text unique not null,
  full_name text,
  avatar_url text,
  constraint username_length check (char_length(username) >= 3)
);

-- Create posts table with foreign key to profiles
create table posts (
  id uuid default uuid_generate_v4() primary key not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text not null,
  image_url text,
  author_id uuid references profiles(id) on delete cascade not null
);

-- Create comments table with foreign keys to posts and profiles
create table comments (
  id uuid default uuid_generate_v4() primary key not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Anyone can view posts"
  on posts for select
  using ( true );

create policy "Authenticated users can create posts"
  on posts for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update own posts"
  on posts for update
  using ( auth.uid() = author_id );

create policy "Users can delete own posts"
  on posts for delete
  using ( auth.uid() = author_id );

create policy "Anyone can view comments"
  on comments for select
  using ( true );

create policy "Authenticated users can create comments"
  on comments for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update own comments"
  on comments for update
  using ( auth.uid() = author_id );

create policy "Users can delete own comments"
  on comments for delete
  using ( auth.uid() = author_id );

-- Create indexes for better performance
create index posts_author_id_idx on posts(author_id);
create index comments_post_id_idx on comments(post_id);
create index comments_author_id_idx on comments(author_id);