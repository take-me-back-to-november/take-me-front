export interface User {
  id: string;
  spotify_id: string;
  email: string | null;
  name: string | null;
  picture_url: string | null;
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

export interface SongPreview {
  preview_url: string;
}

export interface SongReviewUser {
  id: string;
  name: string | null;
  picture_url: string | null;
}

export type ReviewActionType = "like" | "unlike";

export interface SongReviewAction {
  id: string;
  action: ReviewActionType;
}

export interface SongReview {
  id: string;
  title: string;
  stars_count: number;
  text: string;
  image_url: string | null;
  song_name: string | null;
  song_artist: string | null;
  song_album: string | null;
  spotify_song_id: string;
  spotify_album_id: string | null;
  spotify_artist_id: string | null;
  user: SongReviewUser | null;
  actions: SongReviewAction[];
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserResume {
  id: string;
  name: string;
  picture_url: string | null;
  spotify_connected: boolean;
  reviews_count: number;
  reviews_average_stars: number;
  reviews: SongReview[];
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
  title: string;
  text: string;
  stars_count: number;
  spotify_song_id: string;
}

export interface CreateReviewMessagePayload {
  text: string;
}

export interface SongReviewMessage {
  id: string;
  text: string;
  parent_id: string | null;
  song_review_id: string | null;
  user: SongReviewUser | null;
  created_at: string;
  updated_at: string;
}

export interface MessageTreeNode extends SongReviewMessage {
  children: MessageTreeNode[];
}

export interface SpotifyAuthUrlResponse {
  url: string;
}
