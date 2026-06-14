import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "@/api/getApiErrorMessage";
import { getMyTopTracks, searchAlbums, searchTracks } from "@/api/spotify";
import { ApiError } from "@/api/client";
import { AlbumPickListItem } from "@/components/AlbumPickListItem";
import { Icon } from "@/components/Icon";
import { PageTransition } from "@/components/PageTransition";
import { SearchTypeSwitcher, type SearchType } from "@/components/SearchTypeSwitcher";
import { SongPickListItem } from "@/components/SongPickListItem";
import { SoundbarLoader } from "@/components/SoundbarLoader";
import { useAuth } from "@/context/AuthContext";
import type { SpotifyAlbum, SpotifySong } from "@/types/api";

export function SearchPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("tracks");
  const [trackResults, setTrackResults] = useState<SpotifySong[]>([]);
  const [albumResults, setAlbumResults] = useState<SpotifyAlbum[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifySong[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const searchCacheRef = useRef<{
    tracks: Map<string, SpotifySong[]>;
    albums: Map<string, SpotifyAlbum[]>;
  }>({ tracks: new Map(), albums: new Map() });

  useEffect(() => {
    if (!token) return;

    void getMyTopTracks(token, 10)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) return [] as SpotifySong[];
        throw err;
      })
      .then((tracks) => setTopTracks(tracks))
      .catch((err) =>
        setSuggestionsError(getApiErrorMessage(err, t, "search.suggestionsError")),
      )
      .finally(() => setLoadingSuggestions(false));
  }, [token, t]);

  useEffect(() => {
    if (!token || query.trim().length < 2) {
      setTrackResults([]);
      setAlbumResults([]);
      searchCacheRef.current.tracks.clear();
      searchCacheRef.current.albums.clear();
      return;
    }

    const normalizedQuery = query.trim();
    const cache = searchCacheRef.current;

    if (searchType === "tracks") {
      const cachedTracks = cache.tracks.get(normalizedQuery);
      if (cachedTracks !== undefined) {
        setTrackResults(cachedTracks);
        setError(null);
        setIsSearching(false);
        return;
      }
    } else {
      const cachedAlbums = cache.albums.get(normalizedQuery);
      if (cachedAlbums !== undefined) {
        setAlbumResults(cachedAlbums);
        setError(null);
        setIsSearching(false);
        return;
      }
    }

    const timer = setTimeout(async () => {
      if (searchType === "tracks") {
        const cachedTracks = cache.tracks.get(normalizedQuery);
        if (cachedTracks !== undefined) {
          setTrackResults(cachedTracks);
          setError(null);
          return;
        }
      } else {
        const cachedAlbums = cache.albums.get(normalizedQuery);
        if (cachedAlbums !== undefined) {
          setAlbumResults(cachedAlbums);
          setError(null);
          return;
        }
      }

      setIsSearching(true);
      setError(null);
      try {
        if (searchType === "tracks") {
          const tracks = await searchTracks(token, normalizedQuery);
          cache.tracks.set(normalizedQuery, tracks);
          setTrackResults(tracks);
        } else {
          const albums = await searchAlbums(token, normalizedQuery);
          cache.albums.set(normalizedQuery, albums);
          setAlbumResults(albums);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, t, "search.searchError"));
        if (searchType === "tracks") {
          setTrackResults([]);
        } else {
          setAlbumResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, token, t, searchType]);

  const hasQuery = query.trim().length > 0;
  const results = searchType === "tracks" ? trackResults : albumResults;

  const handleSelectSong = (song: SpotifySong) => {
    navigate("/write", { state: { song } });
  };

  return (
    <PageTransition>
      <div className="sticky top-[var(--shell-header-height)] z-30 border-b border-surface-container-high/40 bg-surface/90 px-container-margin py-md backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-content-md flex-col gap-md">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-md">
              <Icon name="search" size="md" className="text-on-surface-variant" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              placeholder={t("search.placeholder")}
              className="w-full rounded-full border-none bg-surface-container-highest py-md pr-md pl-[48px] text-body-lg text-on-surface placeholder:text-on-surface-variant/70 transition-default focus:ring-1 focus:ring-primary focus:outline-none"
            />
            {hasQuery && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-md text-on-surface-variant transition-default hover:text-on-surface"
                aria-label={t("search.clearSearch")}
              >
                <Icon name="close" size="md" />
              </button>
            )}
          </div>
          {hasQuery && (
            <div className="flex justify-center pb-xs">
              <SearchTypeSwitcher value={searchType} onChange={setSearchType} />
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-content-md flex-grow flex-col px-container-margin pb-xl">
        {!hasQuery ? (
          <div className="flex w-full flex-col gap-lg pt-md">
            <div className="flex w-full flex-col items-center rounded-xl bg-gradient-to-b from-surface-container-high/80 to-transparent px-lg py-xl text-center">
              <Icon name="library_music" size="xl" className="mb-md text-outline" />
              <h2 className="mb-sm w-full max-w-content-sm text-balance text-headline-md text-on-surface">
                {t("search.emptyTitle")}
              </h2>
              <p className="w-full max-w-content-sm text-balance text-body-md text-on-surface-variant">
                {t("search.emptyHint")}
              </p>
            </div>

            <section>
              <h3 className="mb-md text-label-md tracking-widest text-on-surface-variant uppercase">
                {t("search.suggestionsTitle")}
              </h3>
              {loadingSuggestions ? (
                <div className="flex flex-col gap-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-md rounded-lg p-sm">
                      <div className="h-[56px] w-[56px] rounded shimmer" />
                      <div className="flex flex-grow flex-col gap-xs">
                        <div className="h-4 w-3/5 rounded shimmer" />
                        <div className="h-3 w-2/5 rounded shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : suggestionsError ? (
                <p className="text-body-md text-error">{suggestionsError}</p>
              ) : topTracks.length > 0 ? (
                <div className="flex flex-col gap-sm">
                  {topTracks.map((song, index) => (
                    <SongPickListItem
                      key={song.id}
                      song={song}
                      index={index}
                      onSelect={handleSelectSong}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-body-md text-on-surface-variant">
                  {t("search.noSuggestions")}
                </p>
              )}
            </section>
          </div>
        ) : (
          <div className="flex w-full min-h-[200px] flex-col gap-xs pt-md">
            {isSearching && (
              <div className="flex justify-center py-lg">
                <SoundbarLoader size="md" label={t("search.searching")} />
              </div>
            )}
            {error && (
              <p className="py-md text-center text-body-md text-error">{error}</p>
            )}
            {!isSearching && !error && results.length === 0 && query.trim().length >= 2 && (
              <div className="flex flex-col items-center py-xl text-center">
                <Icon name="search_off" size="xl" className="mb-md text-surface-container-highest" />
                <p className="max-w-content-sm text-balance text-body-md text-on-surface-variant">
                  {searchType === "tracks"
                    ? t("search.noTrackResults", { query: query.trim() })
                    : t("search.noAlbumResults", { query: query.trim() })}
                </p>
              </div>
            )}
            {searchType === "tracks"
              ? trackResults.map((song, index) => (
                  <SongPickListItem
                    key={song.id}
                    song={song}
                    index={index}
                    onSelect={handleSelectSong}
                  />
                ))
              : albumResults.map((album, index) => (
                  <AlbumPickListItem key={album.id} album={album} index={index} />
                ))}
          </div>
        )}
      </main>
    </PageTransition>
  );
}
