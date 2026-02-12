import initSqlJs, { Database } from 'sql.js';

export interface Song {
  songId: string;
  title: string;
  artists: string;
  duration: string; // in seconds
  thumbnailUrl: string;
  likedAt?: number;
  totalPlayTimeMs?: number;
}

export interface Playlist {
  id: number;
  name: string;
  browseId: string;
  songs: Song[];
  selected?: boolean;
}

export interface AlbumData {
  id: string;
  title: string;
  thumbnailUrl: string;
  year: string;
  authorsText: string;
  shareUrl: string;
  timestamp: number | null;
  bookmarkedAt: number | null;
}

export interface ArtistData {
  id: string;
  name: string;
  thumbnailUrl: string;
  timestamp: number | null;
  bookmarkedAt: number | null;
}

export interface SongAlbumMapData {
  songId: string;
  albumId: string;
  position: number | null;
}

export interface SongArtistMapData {
  songId: string;
  artistId: string;
}

export interface EventData {
  songId: string;
  timestamp: number;
  playTime: number;
}

export interface FormatData {
  songId: string;
  itag: number | null;
  mimeType: string;
  bitrate: number | null;
  contentLength: number | null;
  lastModified: number | null;
  loudnessDb: number | null;
}

export interface LyricsData {
  songId: string;
  fixed: string;
  synced: string;
}

export interface SearchQueryData {
  query: string;
}

export interface TableInfo {
  name: string;
  columns: { name: string; type: string }[];
  rowCount: number;
}

export interface CleaningReport {
  field: string;
  original: string;
  cleaned: string;
  issue: string;
}

export interface ConversionResult {
  playlists: Playlist[];
  songs: Song[];
  albums: AlbumData[];
  artists: ArtistData[];
  songAlbumMaps: SongAlbumMapData[];
  songArtistMaps: SongArtistMapData[];
  events: EventData[];
  formats: FormatData[];
  lyrics: LyricsData[];
  searchQueries: SearchQueryData[];
  errors: string[];
  warnings: string[];
  tableInfo: TableInfo[];
  cleaningReport: CleaningReport[];
  kreateSchema: TableInfo[];
  cubicMusicSchema: TableInfo[];
}

// Cubic Music expected schema
export const CUBIC_MUSIC_SCHEMA: TableInfo[] = [
  {
    name: 'Song',
    columns: [
      { name: 'id', type: 'TEXT NOT NULL PK' },
      { name: 'title', type: 'TEXT NOT NULL' },
      { name: 'artistsText', type: 'TEXT' },
      { name: 'durationText', type: 'TEXT' },
      { name: 'thumbnailUrl', type: 'TEXT' },
      { name: 'likedAt', type: 'INTEGER' },
      { name: 'totalPlayTimeMs', type: 'INTEGER NOT NULL' },
    ],
    rowCount: 0,
  },
  {
    name: 'Playlist',
    columns: [
      { name: 'id', type: 'INTEGER PK AUTOINCREMENT' },
      { name: 'name', type: 'TEXT NOT NULL' },
      { name: 'browseId', type: 'TEXT' },
    ],
    rowCount: 0,
  },
  {
    name: 'SongPlaylistMap',
    columns: [
      { name: 'songId', type: 'TEXT NOT NULL' },
      { name: 'playlistId', type: 'INTEGER NOT NULL' },
      { name: 'position', type: 'INTEGER NOT NULL' },
    ],
    rowCount: 0,
  },
  {
    name: 'Artist',
    columns: [
      { name: 'id', type: 'TEXT NOT NULL PK' },
      { name: 'name', type: 'TEXT' },
      { name: 'thumbnailUrl', type: 'TEXT' },
      { name: 'timestamp', type: 'INTEGER' },
      { name: 'bookmarkedAt', type: 'INTEGER' },
    ],
    rowCount: 0,
  },
  {
    name: 'SongArtistMap',
    columns: [
      { name: 'songId', type: 'TEXT NOT NULL' },
      { name: 'artistId', type: 'TEXT NOT NULL' },
    ],
    rowCount: 0,
  },
  {
    name: 'Album',
    columns: [
      { name: 'id', type: 'TEXT NOT NULL PK' },
      { name: 'title', type: 'TEXT' },
      { name: 'thumbnailUrl', type: 'TEXT' },
      { name: 'year', type: 'TEXT' },
      { name: 'authorsText', type: 'TEXT' },
      { name: 'shareUrl', type: 'TEXT' },
      { name: 'timestamp', type: 'INTEGER' },
      { name: 'bookmarkedAt', type: 'INTEGER' },
    ],
    rowCount: 0,
  },
  {
    name: 'SongAlbumMap',
    columns: [
      { name: 'songId', type: 'TEXT NOT NULL' },
      { name: 'albumId', type: 'TEXT NOT NULL' },
      { name: 'position', type: 'INTEGER' },
    ],
    rowCount: 0,
  },
  {
    name: 'Event',
    columns: [
      { name: 'id', type: 'INTEGER PK AUTOINCREMENT' },
      { name: 'songId', type: 'TEXT NOT NULL' },
      { name: 'timestamp', type: 'INTEGER NOT NULL' },
      { name: 'playTime', type: 'INTEGER NOT NULL' },
    ],
    rowCount: 0,
  },
  {
    name: 'Format',
    columns: [
      { name: 'songId', type: 'TEXT NOT NULL PK' },
      { name: 'itag', type: 'INTEGER' },
      { name: 'mimeType', type: 'TEXT' },
      { name: 'bitrate', type: 'INTEGER' },
      { name: 'contentLength', type: 'INTEGER' },
      { name: 'lastModified', type: 'INTEGER' },
      { name: 'loudnessDb', type: 'REAL' },
    ],
    rowCount: 0,
  },
  {
    name: 'Lyrics',
    columns: [
      { name: 'songId', type: 'TEXT NOT NULL PK' },
      { name: 'fixed', type: 'TEXT' },
      { name: 'synced', type: 'TEXT' },
    ],
    rowCount: 0,
  },
  {
    name: 'SearchQuery',
    columns: [
      { name: 'id', type: 'INTEGER PK AUTOINCREMENT' },
      { name: 'query', type: 'TEXT NOT NULL' },
    ],
    rowCount: 0,
  },
  {
    name: 'QueuedMediaItem',
    columns: [
      { name: 'id', type: 'INTEGER PK AUTOINCREMENT' },
      { name: 'mediaItem', type: 'BLOB NOT NULL' },
      { name: 'position', type: 'INTEGER' },
    ],
    rowCount: 0,
  },
];

// Load sql.js WASM
let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

async function getSqlJs() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });
  }
  return SQL;
}

function emptyConversionResult(): ConversionResult {
  return {
    playlists: [],
    songs: [],
    albums: [],
    artists: [],
    songAlbumMaps: [],
    songArtistMaps: [],
    events: [],
    formats: [],
    lyrics: [],
    searchQueries: [],
    errors: [],
    warnings: [],
    tableInfo: [],
    cleaningReport: [],
    kreateSchema: [],
    cubicMusicSchema: CUBIC_MUSIC_SCHEMA,
  };
}

// Parse SQLite database and extract data
export async function parseKreateSQLite(buffer: ArrayBuffer): Promise<ConversionResult> {
  const SqlJs = await getSqlJs();
  const db = new SqlJs.Database(new Uint8Array(buffer));
  
  const result = emptyConversionResult();

  try {
    // Get all tables
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = tables[0]?.values.map(v => String(v[0])) || [];
    
    // Get table info for each table (Kreate schema)
    for (const tableName of tableNames) {
      try {
        const columnsResult = db.exec(`PRAGMA table_info("${tableName}")`);
        const columns = columnsResult[0]?.values.map(v => ({
          name: String(v[1]),
          type: String(v[2]) || 'UNKNOWN',
        })) || [];
        const countResult = db.exec(`SELECT COUNT(*) FROM "${tableName}"`);
        const rowCount = Number(countResult[0]?.values[0]?.[0] || 0);
        
        result.tableInfo.push({ name: tableName, columns, rowCount });
        result.kreateSchema.push({ name: tableName, columns, rowCount });
      } catch (e) {
        result.warnings.push(`Could not read table info for ${tableName}`);
      }
    }

    // ===== Extract Songs =====
    const songTable = findTable(tableNames, ['Song', 'Songs', 'song', 'songs', 'Track', 'Tracks'], 'song', 'track');
    if (songTable) {
      result.songs = extractSongs(db, songTable, result);
    }

    // ===== Extract Playlists =====
    const playlistTable = findTable(tableNames, ['Playlist', 'Playlists', 'playlist', 'playlists'], 'playlist');
    if (playlistTable) {
      result.playlists = extractPlaylists(db, playlistTable, result);
    }

    // ===== Extract Song-Playlist Mappings =====
    const mappingTable = findTable(tableNames, ['PlaylistSongMap', 'SongInPlaylist', 'playlist_song', 'PlaylistSong', 'SongPlaylistMap'], 'playlist');
    if (mappingTable && result.playlists.length > 0 && result.songs.length > 0) {
      linkSongsToPlaylists(db, mappingTable, result);
    }

    // ===== Extract Albums =====
    const albumTable = findTable(tableNames, ['Album', 'Albums', 'album', 'albums'], 'album');
    if (albumTable) {
      result.albums = extractAlbums(db, albumTable, result);
    }

    // ===== Extract Artists =====
    const artistTable = findTable(tableNames, ['Artist', 'Artists', 'artist', 'artists'], 'artist');
    if (artistTable) {
      result.artists = extractArtists(db, artistTable, result);
    }

    // ===== Extract SongAlbumMap =====
    const songAlbumMapTable = findTable(tableNames, ['SongAlbumMap', 'song_album_map', 'SongAlbum'], 'album', 'map');
    if (songAlbumMapTable) {
      result.songAlbumMaps = extractSongAlbumMaps(db, songAlbumMapTable, result);
    }

    // ===== Extract SongArtistMap =====
    const songArtistMapTable = findTable(tableNames, ['SongArtistMap', 'song_artist_map', 'SongArtist'], 'artist', 'map');
    if (songArtistMapTable) {
      result.songArtistMaps = extractSongArtistMaps(db, songArtistMapTable, result);
    }

    // ===== Extract Events =====
    const eventTable = findTable(tableNames, ['Event', 'Events', 'event', 'events'], 'event');
    if (eventTable) {
      result.events = extractEvents(db, eventTable, result);
    }

    // ===== Extract Format =====
    const formatTable = findTable(tableNames, ['Format', 'Formats', 'format', 'formats'], 'format');
    if (formatTable) {
      result.formats = extractFormats(db, formatTable, result);
    }

    // ===== Extract Lyrics =====
    const lyricsTable = findTable(tableNames, ['Lyrics', 'lyrics'], 'lyrics');
    if (lyricsTable) {
      result.lyrics = extractLyrics(db, lyricsTable, result);
    }

    // ===== Extract SearchQuery =====
    const searchTable = findTable(tableNames, ['SearchQuery', 'search_query', 'SearchQueries'], 'search');
    if (searchTable) {
      result.searchQueries = extractSearchQueries(db, searchTable, result);
    }

    // Mark all playlists as selected by default
    result.playlists.forEach(p => p.selected = true);

    db.close();
  } catch (error) {
    result.errors.push(`Database parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    db.close();
  }

  return result;
}

// Helper to find a table by exact names or partial match
function findTable(tableNames: string[], exactMatches: string[], ...partials: string[]): string | undefined {
  let found = tableNames.find(t => exactMatches.includes(t));
  if (!found) {
    found = tableNames.find(t => {
      const lower = t.toLowerCase();
      return partials.every(p => lower.includes(p));
    });
  }
  return found;
}

// ===== Extraction helpers =====

function extractSongs(db: Database, tableName: string, result: ConversionResult): Song[] {
  const songs: Song[] = [];
  try {
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return songs;
    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const idIdx = columns.findIndex(c => c === 'id' || c === 'songid' || c === 'song_id' || c === 'videoid' || c === 'video_id');
    const titleIdx = columns.findIndex(c => c === 'title' || c === 'name' || c === 'songtitle');
    const artistIdx = columns.findIndex(c => c === 'artist' || c === 'artists' || c === 'artiststext' || c === 'artists_text' || c === 'artistname');
    const durationIdx = columns.findIndex(c => c === 'duration' || c === 'durationtext' || c === 'duration_text' || c === 'length');
    const thumbIdx = columns.findIndex(c => c === 'thumbnail' || c === 'thumbnailurl' || c === 'thumbnail_url' || c === 'image' || c === 'artwork');
    const likedIdx = columns.findIndex(c => c === 'likedat' || c === 'liked_at' || c === 'liked');
    const playTimeIdx = columns.findIndex(c => c === 'totalplaytimems' || c === 'playtime' || c === 'play_time');

    for (const row of rows) {
      try {
        const song: Song = {
          songId: cleanAndReport(row[idIdx], 'songId', result),
          title: cleanAndReport(row[titleIdx], 'title', result),
          artists: cleanAndReport(row[artistIdx], 'artists', result),
          duration: cleanDuration(row[durationIdx], result),
          thumbnailUrl: cleanAndReport(row[thumbIdx], 'thumbnailUrl', result),
          likedAt: likedIdx >= 0 ? Number(row[likedIdx]) || undefined : undefined,
          totalPlayTimeMs: playTimeIdx >= 0 ? Number(row[playTimeIdx]) || 0 : 0,
        };
        if (song.songId && song.songId.length > 0) {
          songs.push(song);
        } else {
          result.warnings.push(`Skipped song with empty ID`);
        }
      } catch (e) {
        result.warnings.push(`Could not parse song row`);
      }
    }
  } catch (error) {
    result.errors.push(`Error reading songs table: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  return songs;
}

function extractPlaylists(db: Database, tableName: string, result: ConversionResult): Playlist[] {
  const playlists: Playlist[] = [];
  try {
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return playlists;
    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const idIdx = columns.findIndex(c => c === 'id' || c === 'playlistid' || c === 'playlist_id');
    const nameIdx = columns.findIndex(c => c === 'name' || c === 'title' || c === 'playlistname');
    const browseIdIdx = columns.findIndex(c => c === 'browseid' || c === 'browse_id');

    for (const row of rows) {
      try {
        playlists.push({
          id: Number(row[idIdx]) || playlists.length + 1,
          name: cleanAndReport(row[nameIdx], 'playlistName', result) || 'Unknown Playlist',
          browseId: cleanAndReport(row[browseIdIdx], 'browseId', result),
          songs: [],
          selected: true,
        });
      } catch (e) {
        result.warnings.push(`Could not parse playlist row`);
      }
    }
  } catch (error) {
    result.errors.push(`Error reading playlists table: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  return playlists;
}

function linkSongsToPlaylists(db: Database, tableName: string, result: ConversionResult): void {
  try {
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return;
    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const playlistIdIdx = columns.findIndex(c => c === 'playlistid' || c === 'playlist_id' || c.includes('playlist'));
    const songIdIdx = columns.findIndex(c => c === 'songid' || c === 'song_id' || c.includes('song') || c.includes('video'));
    const positionIdx = columns.findIndex(c => c === 'position' || c === 'pos' || c === 'order' || c === 'index');

    if (playlistIdIdx === -1 || songIdIdx === -1) {
      result.warnings.push('Could not find playlist-song mapping columns');
      return;
    }

    const songMap = new Map(result.songs.map(s => [s.songId, s]));
    const playlistSongsMap = new Map<number, { song: Song; position: number }[]>();

    for (const row of rows) {
      const playlistId = Number(row[playlistIdIdx]);
      const songId = cleanAndReport(row[songIdIdx], 'mappingSongId', result);
      const position = positionIdx >= 0 ? Number(row[positionIdx]) || 0 : 0;
      const song = songMap.get(songId);
      if (song) {
        if (!playlistSongsMap.has(playlistId)) playlistSongsMap.set(playlistId, []);
        playlistSongsMap.get(playlistId)!.push({ song: { ...song }, position });
      }
    }

    for (const playlist of result.playlists) {
      const playlistSongs = playlistSongsMap.get(playlist.id);
      if (playlistSongs) {
        playlist.songs = playlistSongs.sort((a, b) => a.position - b.position).map(ps => ps.song);
      }
    }
  } catch (error) {
    result.errors.push(`Error linking songs to playlists: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractAlbums(db: Database, tableName: string, result: ConversionResult): AlbumData[] {
  const albums: AlbumData[] = [];
  try {
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return albums;
    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const idIdx = columns.findIndex(c => c === 'id' || c === 'albumid');
    const titleIdx = columns.findIndex(c => c === 'title' || c === 'name');
    const thumbIdx = columns.findIndex(c => c === 'thumbnailurl' || c === 'thumbnail_url' || c === 'thumbnail');
    const yearIdx = columns.findIndex(c => c === 'year');
    const authorsIdx = columns.findIndex(c => c === 'authorstext' || c === 'authors_text' || c === 'authors' || c === 'artist' || c === 'artists');
    const shareUrlIdx = columns.findIndex(c => c === 'shareurl' || c === 'share_url');
    const timestampIdx = columns.findIndex(c => c === 'timestamp');
    const bookmarkedIdx = columns.findIndex(c => c === 'bookmarkedat' || c === 'bookmarked_at');

    for (const row of rows) {
      try {
        const id = cleanAndReport(row[idIdx], 'albumId', result);
        if (!id) continue;
        albums.push({
          id,
          title: cleanAndReport(row[titleIdx], 'albumTitle', result),
          thumbnailUrl: cleanAndReport(row[thumbIdx], 'albumThumbnail', result),
          year: cleanAndReport(row[yearIdx], 'albumYear', result),
          authorsText: cleanAndReport(row[authorsIdx], 'albumAuthors', result),
          shareUrl: cleanAndReport(row[shareUrlIdx], 'albumShareUrl', result),
          timestamp: timestampIdx >= 0 ? Number(row[timestampIdx]) || null : null,
          bookmarkedAt: bookmarkedIdx >= 0 ? Number(row[bookmarkedIdx]) || null : null,
        });
      } catch (e) {
        result.warnings.push('Could not parse album row');
      }
    }
  } catch (error) {
    result.errors.push(`Error reading albums: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  return albums;
}

function extractArtists(db: Database, tableName: string, result: ConversionResult): ArtistData[] {
  const artists: ArtistData[] = [];
  try {
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return artists;
    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const idIdx = columns.findIndex(c => c === 'id' || c === 'artistid');
    const nameIdx = columns.findIndex(c => c === 'name' || c === 'artistname');
    const thumbIdx = columns.findIndex(c => c === 'thumbnailurl' || c === 'thumbnail_url' || c === 'thumbnail');
    const timestampIdx = columns.findIndex(c => c === 'timestamp');
    const bookmarkedIdx = columns.findIndex(c => c === 'bookmarkedat' || c === 'bookmarked_at');

    for (const row of rows) {
      try {
        const id = cleanAndReport(row[idIdx], 'artistId', result);
        if (!id) continue;
        artists.push({
          id,
          name: cleanAndReport(row[nameIdx], 'artistName', result),
          thumbnailUrl: cleanAndReport(row[thumbIdx], 'artistThumbnail', result),
          timestamp: timestampIdx >= 0 ? Number(row[timestampIdx]) || null : null,
          bookmarkedAt: bookmarkedIdx >= 0 ? Number(row[bookmarkedIdx]) || null : null,
        });
      } catch (e) {
        result.warnings.push('Could not parse artist row');
      }
    }
  } catch (error) {
    result.errors.push(`Error reading artists: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  return artists;
}

function extractSongAlbumMaps(db: Database, tableName: string, result: ConversionResult): SongAlbumMapData[] {
  const maps: SongAlbumMapData[] = [];
  try {
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return maps;
    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const songIdIdx = columns.findIndex(c => c === 'songid' || c === 'song_id');
    const albumIdIdx = columns.findIndex(c => c === 'albumid' || c === 'album_id');
    const posIdx = columns.findIndex(c => c === 'position' || c === 'pos');

    for (const row of rows) {
      const songId = cleanAndReport(row[songIdIdx], 'songAlbumSongId', result);
      const albumId = cleanAndReport(row[albumIdIdx], 'songAlbumAlbumId', result);
      if (songId && albumId) {
        maps.push({ songId, albumId, position: posIdx >= 0 ? Number(row[posIdx]) || null : null });
      }
    }
  } catch (error) {
    result.errors.push(`Error reading SongAlbumMap: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  return maps;
}

function extractSongArtistMaps(db: Database, tableName: string, result: ConversionResult): SongArtistMapData[] {
  const maps: SongArtistMapData[] = [];
  try {
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return maps;
    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const songIdIdx = columns.findIndex(c => c === 'songid' || c === 'song_id');
    const artistIdIdx = columns.findIndex(c => c === 'artistid' || c === 'artist_id');

    for (const row of rows) {
      const songId = cleanAndReport(row[songIdIdx], 'songArtistSongId', result);
      const artistId = cleanAndReport(row[artistIdIdx], 'songArtistArtistId', result);
      if (songId && artistId) {
        maps.push({ songId, artistId });
      }
    }
  } catch (error) {
    result.errors.push(`Error reading SongArtistMap: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  return maps;
}

function extractEvents(db: Database, tableName: string, result: ConversionResult): EventData[] {
  const events: EventData[] = [];
  try {
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return events;
    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const songIdIdx = columns.findIndex(c => c === 'songid' || c === 'song_id');
    const timestampIdx = columns.findIndex(c => c === 'timestamp');
    const playTimeIdx = columns.findIndex(c => c === 'playtime' || c === 'play_time');

    for (const row of rows) {
      const songId = cleanAndReport(row[songIdIdx], 'eventSongId', result);
      if (songId) {
        events.push({
          songId,
          timestamp: Number(row[timestampIdx]) || 0,
          playTime: Number(row[playTimeIdx]) || 0,
        });
      }
    }
  } catch (error) {
    result.errors.push(`Error reading events: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  return events;
}

function extractFormats(db: Database, tableName: string, result: ConversionResult): FormatData[] {
  const formats: FormatData[] = [];
  try {
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return formats;
    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const songIdIdx = columns.findIndex(c => c === 'songid' || c === 'song_id');
    const itagIdx = columns.findIndex(c => c === 'itag');
    const mimeIdx = columns.findIndex(c => c === 'mimetype' || c === 'mime_type');
    const bitrateIdx = columns.findIndex(c => c === 'bitrate');
    const contentLenIdx = columns.findIndex(c => c === 'contentlength' || c === 'content_length');
    const lastModIdx = columns.findIndex(c => c === 'lastmodified' || c === 'last_modified');
    const loudnessIdx = columns.findIndex(c => c === 'loudnessdb' || c === 'loudness_db' || c === 'loudness');

    for (const row of rows) {
      const songId = cleanAndReport(row[songIdIdx], 'formatSongId', result);
      if (songId) {
        formats.push({
          songId,
          itag: itagIdx >= 0 ? Number(row[itagIdx]) || null : null,
          mimeType: mimeIdx >= 0 ? cleanAndReport(row[mimeIdx], 'mimeType', result) : '',
          bitrate: bitrateIdx >= 0 ? Number(row[bitrateIdx]) || null : null,
          contentLength: contentLenIdx >= 0 ? Number(row[contentLenIdx]) || null : null,
          lastModified: lastModIdx >= 0 ? Number(row[lastModIdx]) || null : null,
          loudnessDb: loudnessIdx >= 0 ? Number(row[loudnessIdx]) || null : null,
        });
      }
    }
  } catch (error) {
    result.errors.push(`Error reading formats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  return formats;
}

function extractLyrics(db: Database, tableName: string, result: ConversionResult): LyricsData[] {
  const lyrics: LyricsData[] = [];
  try {
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return lyrics;
    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const songIdIdx = columns.findIndex(c => c === 'songid' || c === 'song_id');
    const fixedIdx = columns.findIndex(c => c === 'fixed');
    const syncedIdx = columns.findIndex(c => c === 'synced');

    for (const row of rows) {
      const songId = cleanAndReport(row[songIdIdx], 'lyricsSongId', result);
      if (songId) {
        lyrics.push({
          songId,
          fixed: fixedIdx >= 0 ? cleanAndReport(row[fixedIdx], 'lyricsFixed', result) : '',
          synced: syncedIdx >= 0 ? cleanAndReport(row[syncedIdx], 'lyricsSynced', result) : '',
        });
      }
    }
  } catch (error) {
    result.errors.push(`Error reading lyrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  return lyrics;
}

function extractSearchQueries(db: Database, tableName: string, result: ConversionResult): SearchQueryData[] {
  const queries: SearchQueryData[] = [];
  try {
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return queries;
    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const queryIdx = columns.findIndex(c => c === 'query');

    for (const row of rows) {
      const query = cleanAndReport(row[queryIdx], 'searchQuery', result);
      if (query) queries.push({ query });
    }
  } catch (error) {
    result.errors.push(`Error reading search queries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  return queries;
}

// ===== Cleaning helpers =====

function cleanAndReport(value: unknown, field: string, result: ConversionResult): string {
  if (value === null || value === undefined) return '';
  
  const original = String(value);
  let cleaned = original;
  let issues: string[] = [];

  if (/[\x00-\x1F\x7F]/.test(cleaned)) {
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
    issues.push('control characters removed');
  }
  if (cleaned !== cleaned.trim()) {
    cleaned = cleaned.trim();
    issues.push('whitespace trimmed');
  }
  if (cleaned.includes('\\"') || cleaned.includes("\\'")) {
    cleaned = cleaned.replace(/\\"/g, '"').replace(/\\'/g, "'");
    issues.push('escaped quotes fixed');
  }

  if (issues.length > 0 && original !== cleaned) {
    result.cleaningReport.push({
      field,
      original: original.slice(0, 100) + (original.length > 100 ? '...' : ''),
      cleaned: cleaned.slice(0, 100) + (cleaned.length > 100 ? '...' : ''),
      issue: issues.join(', '),
    });
  }
  return cleaned;
}

function cleanDuration(value: unknown, result: ConversionResult): string {
  if (value === null || value === undefined) return '0';
  
  const original = String(value).trim();
  let seconds: number;
  let issue = '';

  const num = Number(original);
  if (!isNaN(num) && num >= 0) {
    if (num > 100000) {
      seconds = Math.floor(num / 1000);
      issue = 'converted from milliseconds';
    } else {
      seconds = Math.floor(num);
    }
  } else {
    const timeMatch = original.match(/^(\d+):(\d{2})$/);
    if (timeMatch) {
      seconds = parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
      issue = 'parsed from mm:ss format';
    } else {
      seconds = 0;
      issue = 'invalid duration set to 0';
    }
  }

  if (issue && original !== String(seconds)) {
    result.cleaningReport.push({ field: 'duration', original, cleaned: String(seconds), issue });
  }
  return String(seconds);
}

// Generate Cubic Music compatible SQLite database with EXACT Room schema
export async function generateCubicMusicSQLite(
  result: ConversionResult,
  selectedPlaylists?: number[]
): Promise<Uint8Array> {
  const SqlJs = await getSqlJs();
  const db = new SqlJs.Database();

  // ===== Create ALL tables matching the exact Cubic Music / Room schema =====
  db.run(`CREATE TABLE \`Song\` (\`id\` TEXT NOT NULL, \`title\` TEXT NOT NULL, \`artistsText\` TEXT, \`durationText\` TEXT, \`thumbnailUrl\` TEXT, \`likedAt\` INTEGER, \`totalPlayTimeMs\` INTEGER NOT NULL, PRIMARY KEY(\`id\`))`);
  db.run(`CREATE TABLE \`Playlist\` (\`id\` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \`name\` TEXT NOT NULL, \`browseId\` TEXT)`);
  db.run(`CREATE TABLE \`SongPlaylistMap\` (\`songId\` TEXT NOT NULL, \`playlistId\` INTEGER NOT NULL, \`position\` INTEGER NOT NULL, PRIMARY KEY(\`songId\`, \`playlistId\`), FOREIGN KEY(\`songId\`) REFERENCES \`Song\`(\`id\`) ON UPDATE NO ACTION ON DELETE CASCADE, FOREIGN KEY(\`playlistId\`) REFERENCES \`Playlist\`(\`id\`) ON UPDATE NO ACTION ON DELETE CASCADE)`);
  db.run(`CREATE TABLE \`Artist\` (\`id\` TEXT NOT NULL, \`name\` TEXT, \`thumbnailUrl\` TEXT, \`timestamp\` INTEGER, \`bookmarkedAt\` INTEGER, PRIMARY KEY(\`id\`))`);
  db.run(`CREATE TABLE \`SongArtistMap\` (\`songId\` TEXT NOT NULL, \`artistId\` TEXT NOT NULL, PRIMARY KEY(\`songId\`, \`artistId\`), FOREIGN KEY(\`songId\`) REFERENCES \`Song\`(\`id\`) ON UPDATE NO ACTION ON DELETE CASCADE, FOREIGN KEY(\`artistId\`) REFERENCES \`Artist\`(\`id\`) ON UPDATE NO ACTION ON DELETE CASCADE)`);
  db.run(`CREATE TABLE \`Album\` (\`id\` TEXT NOT NULL, \`title\` TEXT, \`thumbnailUrl\` TEXT, \`year\` TEXT, \`authorsText\` TEXT, \`shareUrl\` TEXT, \`timestamp\` INTEGER, \`bookmarkedAt\` INTEGER, PRIMARY KEY(\`id\`))`);
  db.run(`CREATE TABLE \`SongAlbumMap\` (\`songId\` TEXT NOT NULL, \`albumId\` TEXT NOT NULL, \`position\` INTEGER, PRIMARY KEY(\`songId\`, \`albumId\`), FOREIGN KEY(\`songId\`) REFERENCES \`Song\`(\`id\`) ON UPDATE NO ACTION ON DELETE CASCADE, FOREIGN KEY(\`albumId\`) REFERENCES \`Album\`(\`id\`) ON UPDATE NO ACTION ON DELETE CASCADE)`);
  db.run(`CREATE TABLE \`SearchQuery\` (\`id\` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \`query\` TEXT NOT NULL)`);
  db.run(`CREATE TABLE \`QueuedMediaItem\` (\`id\` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \`mediaItem\` BLOB NOT NULL, \`position\` INTEGER)`);
  db.run(`CREATE TABLE \`Format\` (\`songId\` TEXT NOT NULL, \`itag\` INTEGER, \`mimeType\` TEXT, \`bitrate\` INTEGER, \`contentLength\` INTEGER, \`lastModified\` INTEGER, \`loudnessDb\` REAL, PRIMARY KEY(\`songId\`), FOREIGN KEY(\`songId\`) REFERENCES \`Song\`(\`id\`) ON UPDATE NO ACTION ON DELETE CASCADE)`);
  db.run(`CREATE TABLE \`Event\` (\`id\` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \`songId\` TEXT NOT NULL, \`timestamp\` INTEGER NOT NULL, \`playTime\` INTEGER NOT NULL, FOREIGN KEY(\`songId\`) REFERENCES \`Song\`(\`id\`) ON UPDATE NO ACTION ON DELETE CASCADE)`);
  db.run(`CREATE TABLE \`Lyrics\` (\`songId\` TEXT NOT NULL, \`fixed\` TEXT, \`synced\` TEXT, PRIMARY KEY(\`songId\`), FOREIGN KEY(\`songId\`) REFERENCES \`Song\`(\`id\`) ON UPDATE NO ACTION ON DELETE CASCADE)`);

  // ===== Create indexes =====
  db.run(`CREATE INDEX \`index_SongPlaylistMap_songId\` ON \`SongPlaylistMap\` (\`songId\`)`);
  db.run(`CREATE INDEX \`index_SongPlaylistMap_playlistId\` ON \`SongPlaylistMap\` (\`playlistId\`)`);
  db.run(`CREATE INDEX \`index_SongArtistMap_songId\` ON \`SongArtistMap\` (\`songId\`)`);
  db.run(`CREATE INDEX \`index_SongArtistMap_artistId\` ON \`SongArtistMap\` (\`artistId\`)`);
  db.run(`CREATE INDEX \`index_SongAlbumMap_songId\` ON \`SongAlbumMap\` (\`songId\`)`);
  db.run(`CREATE INDEX \`index_SongAlbumMap_albumId\` ON \`SongAlbumMap\` (\`albumId\`)`);
  db.run(`CREATE UNIQUE INDEX \`index_SearchQuery_query\` ON \`SearchQuery\` (\`query\`)`);
  db.run(`CREATE INDEX \`index_Event_songId\` ON \`Event\` (\`songId\`)`);

  // ===== Create view =====
  db.run(`CREATE VIEW \`SortedSongPlaylistMap\` AS SELECT * FROM SongPlaylistMap ORDER BY position`);

  // ===== Room metadata tables =====
  db.run(`CREATE TABLE room_master_table (id INTEGER PRIMARY KEY, identity_hash TEXT)`);
  db.run(`INSERT INTO room_master_table (id, identity_hash) VALUES (42, '205c24811149a247279bcbfdc2d6c396')`);
  db.run(`CREATE TABLE android_metadata (locale TEXT)`);
  db.run(`INSERT INTO android_metadata VALUES ('en_US')`);

  // ===== Insert songs =====
  const playlistsToExport = selectedPlaylists
    ? result.playlists.filter(p => selectedPlaylists.includes(p.id))
    : result.playlists.filter(p => p.selected !== false);

  const insertSong = db.prepare(`INSERT OR REPLACE INTO Song (id, title, artistsText, durationText, thumbnailUrl, likedAt, totalPlayTimeMs) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const addedSongIds = new Set<string>();

  for (const song of result.songs) {
    if (addedSongIds.has(song.songId)) continue;
    const durationSecs = parseInt(song.duration) || 0;
    const minutes = Math.floor(durationSecs / 60);
    const seconds = durationSecs % 60;
    const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    insertSong.run([song.songId, song.title || 'Unknown Title', song.artists || '', durationText, song.thumbnailUrl || '', song.likedAt || null, song.totalPlayTimeMs || 0]);
    addedSongIds.add(song.songId);
  }
  insertSong.free();

  // ===== Insert playlists and mappings =====
  const insertPlaylist = db.prepare(`INSERT INTO Playlist (name, browseId) VALUES (?, ?)`);
  const insertMapping = db.prepare(`INSERT OR REPLACE INTO SongPlaylistMap (songId, playlistId, position) VALUES (?, ?, ?)`);

  for (const playlist of playlistsToExport) {
    insertPlaylist.run([playlist.name, playlist.browseId || '']);
    const playlistId = db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] as number;
    playlist.songs.forEach((song, index) => {
      insertMapping.run([song.songId, playlistId, index]);
    });
  }
  insertPlaylist.free();
  insertMapping.free();

  // ===== Insert Albums =====
  if (result.albums.length > 0) {
    const stmt = db.prepare(`INSERT OR REPLACE INTO Album (id, title, thumbnailUrl, year, authorsText, shareUrl, timestamp, bookmarkedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const a of result.albums) {
      stmt.run([a.id, a.title || '', a.thumbnailUrl || '', a.year || '', a.authorsText || '', a.shareUrl || '', a.timestamp, a.bookmarkedAt]);
    }
    stmt.free();
  }

  // ===== Insert Artists =====
  if (result.artists.length > 0) {
    const stmt = db.prepare(`INSERT OR REPLACE INTO Artist (id, name, thumbnailUrl, timestamp, bookmarkedAt) VALUES (?, ?, ?, ?, ?)`);
    for (const a of result.artists) {
      stmt.run([a.id, a.name || '', a.thumbnailUrl || '', a.timestamp, a.bookmarkedAt]);
    }
    stmt.free();
  }

  // ===== Insert SongAlbumMap =====
  if (result.songAlbumMaps.length > 0) {
    const stmt = db.prepare(`INSERT OR REPLACE INTO SongAlbumMap (songId, albumId, position) VALUES (?, ?, ?)`);
    for (const m of result.songAlbumMaps) {
      stmt.run([m.songId, m.albumId, m.position]);
    }
    stmt.free();
  }

  // ===== Insert SongArtistMap =====
  if (result.songArtistMaps.length > 0) {
    const stmt = db.prepare(`INSERT OR REPLACE INTO SongArtistMap (songId, artistId) VALUES (?, ?)`);
    for (const m of result.songArtistMaps) {
      stmt.run([m.songId, m.artistId]);
    }
    stmt.free();
  }

  // ===== Insert Events =====
  if (result.events.length > 0) {
    const stmt = db.prepare(`INSERT INTO Event (songId, timestamp, playTime) VALUES (?, ?, ?)`);
    for (const e of result.events) {
      stmt.run([e.songId, e.timestamp, e.playTime]);
    }
    stmt.free();
  }

  // ===== Insert Formats =====
  if (result.formats.length > 0) {
    const stmt = db.prepare(`INSERT OR REPLACE INTO Format (songId, itag, mimeType, bitrate, contentLength, lastModified, loudnessDb) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const f of result.formats) {
      stmt.run([f.songId, f.itag, f.mimeType || '', f.bitrate, f.contentLength, f.lastModified, f.loudnessDb]);
    }
    stmt.free();
  }

  // ===== Insert Lyrics =====
  if (result.lyrics.length > 0) {
    const stmt = db.prepare(`INSERT OR REPLACE INTO Lyrics (songId, fixed, synced) VALUES (?, ?, ?)`);
    for (const l of result.lyrics) {
      stmt.run([l.songId, l.fixed || '', l.synced || '']);
    }
    stmt.free();
  }

  // ===== Insert SearchQueries =====
  if (result.searchQueries.length > 0) {
    const stmt = db.prepare(`INSERT OR IGNORE INTO SearchQuery (query) VALUES (?)`);
    for (const q of result.searchQueries) {
      stmt.run([q.query]);
    }
    stmt.free();
  }

  // Set PRAGMA user_version to 23
  db.run("PRAGMA user_version = 23");

  const data = db.export();
  db.close();
  return data;
}

// Parse and sanitize CSV input
export function parseAndSanitizeCSV(content: string): ConversionResult {
  const result = emptyConversionResult();

  try {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) {
      result.errors.push('Empty CSV file');
      return result;
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    
    result.kreateSchema.push({
      name: 'CSV Import',
      columns: headers.map(h => ({ name: h, type: 'TEXT' })),
      rowCount: lines.length - 1,
    });

    const playlistBrowseIdIdx = headers.findIndex(h => h.includes('playlistbrowseid') || h.includes('playlist_browse_id'));
    const playlistNameIdx = headers.findIndex(h => h.includes('playlistname') || h.includes('playlist_name') || h === 'playlist');
    const songIdIdx = headers.findIndex(h => h.includes('songid') || h.includes('song_id') || h === 'id' || h.includes('videoid'));
    const titleIdx = headers.findIndex(h => h === 'title' || h.includes('songtitle') || h === 'name');
    const artistsIdx = headers.findIndex(h => h === 'artists' || h === 'artist' || h.includes('artiststext'));
    const durationIdx = headers.findIndex(h => h === 'duration' || h.includes('durationtext'));
    const thumbnailIdx = headers.findIndex(h => h.includes('thumbnail') || h.includes('image') || h.includes('artwork'));

    const playlistMap = new Map<string, Playlist>();
    let playlistIdCounter = 1;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const song: Song = {
          songId: cleanAndReport(values[songIdIdx], 'songId', result),
          title: cleanAndReport(values[titleIdx], 'title', result),
          artists: cleanAndReport(values[artistsIdx], 'artists', result),
          duration: cleanDuration(values[durationIdx], result),
          thumbnailUrl: cleanAndReport(values[thumbnailIdx], 'thumbnailUrl', result),
        };
        if (!song.songId) {
          result.warnings.push(`Row ${i + 1}: Missing song ID`);
          continue;
        }
        result.songs.push(song);

        const playlistName = cleanAndReport(values[playlistNameIdx], 'playlistName', result);
        if (playlistName) {
          if (!playlistMap.has(playlistName)) {
            playlistMap.set(playlistName, {
              id: playlistIdCounter++,
              name: playlistName,
              browseId: cleanAndReport(values[playlistBrowseIdIdx], 'browseId', result),
              songs: [],
              selected: true,
            });
          }
          playlistMap.get(playlistName)!.songs.push({ ...song });
        }
      } catch (e) {
        result.warnings.push(`Row ${i + 1}: Could not parse row`);
      }
    }

    result.playlists = Array.from(playlistMap.values());
  } catch (error) {
    result.errors.push(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    if (inQuotes) {
      if (char === '"' && nextChar === '"') { current += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { current += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { values.push(current); current = ''; }
      else { current += char; }
    }
  }
  values.push(current);
  return values;
}

// Detect file type
export function detectFileType(buffer: ArrayBuffer): 'sqlite' | 'csv' | 'unknown' {
  const bytes = new Uint8Array(buffer);
  const sqliteHeader = [0x53, 0x51, 0x4C, 0x69, 0x74, 0x65];
  if (bytes.length >= 6) {
    let isSqlite = true;
    for (let i = 0; i < 6; i++) {
      if (bytes[i] !== sqliteHeader[i]) { isSqlite = false; break; }
    }
    if (isSqlite) return 'sqlite';
  }
  try {
    const text = new TextDecoder('utf-8').decode(buffer.slice(0, 1000));
    if (text.includes(',') && (text.includes('\n') || text.includes('\r'))) return 'csv';
  } catch { /* ignore */ }
  return 'unknown';
}
