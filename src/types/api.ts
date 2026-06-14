export interface User {
  id: string;
  google_id: string;
  google_email: string | null;
  email_verified: boolean | null;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  picture_url: string | null;
  hosted_domain: string | null;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

export interface SpotifyTrack {
  type: "track";
  id: string;
  title: string;
  artist: string;
  album_id: string;
  album_title: string;
  year: number;
  cover_url: string;
  release_date: string;
  duration_ms: number;
  explicit: boolean;
  spotify_url: string | null;
}

export interface SpotifyAlbum {
  type: "album";
  id: string;
  title: string;
  artist: string;
  year: number;
  cover_url: string;
  release_date: string;
  total_tracks: number;
  album_type: string;
  spotify_url: string | null;
}

export type SpotifySong = SpotifyTrack;

export interface SongReview {
  id: string;
  stars_count: number;
  text: string;
  image_url: string | null;
  song_name: string | null;
  song_artist: string | null;
  song_album: string | null;
  likes_count: number;
  unlikes_count: number;
  spotify_song_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserResume {
  id: string;
  name: string;
  picture_url: string | null;
  reviews_count: number;
  reviews_average_stars: number;
  reviews: SongReview[];
}

export interface UserStatus {
  spotify_connected: boolean;
}

export interface CurrentlyPlayingSong {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  progress: number;
  image_url: string;
  is_playing: boolean;
}

export interface CreateReviewPayload {
  text: string;
  stars_count: number;
  spotify_song_id: string;
}

export interface SpotifyAuthUrlResponse {
  url: string;
}
