import initSqlJs, { Database } from 'sql.js';

export interface Song {
  songId: string;
  playlistBrowseId: string;
  playlistName: string;
  title: string;
  artists: string;
  duration: string;
  thumbnailUrl: string;
}

export interface Playlist {
  id: string;
  name: string;
  browseId: string;
  songs: Song[];
}

export interface ConversionResult {
  playlists: Playlist[];
  songs: Song[];
  errors: string[];
  warnings: string[];
  tableInfo: { name: string; columns: string[]; rowCount: number }[];
}

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

// Parse SQLite database and extract data
export async function parseKreateSQLite(buffer: ArrayBuffer): Promise<ConversionResult> {
  const SqlJs = await getSqlJs();
  const db = new SqlJs.Database(new Uint8Array(buffer));
  
  const result: ConversionResult = {
    playlists: [],
    songs: [],
    errors: [],
    warnings: [],
    tableInfo: [],
  };

  try {
    // Get all tables
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = tables[0]?.values.map(v => String(v[0])) || [];
    
    // Get table info for each table
    for (const tableName of tableNames) {
      try {
        const columnsResult = db.exec(`PRAGMA table_info(${tableName})`);
        const columns = columnsResult[0]?.values.map(v => String(v[1])) || [];
        const countResult = db.exec(`SELECT COUNT(*) FROM ${tableName}`);
        const rowCount = Number(countResult[0]?.values[0]?.[0] || 0);
        
        result.tableInfo.push({ name: tableName, columns, rowCount });
      } catch (e) {
        result.warnings.push(`Could not read table info for ${tableName}`);
      }
    }

    // Try to find and parse songs table
    const songTableNames = ['Song', 'Songs', 'song', 'songs', 'Track', 'Tracks', 'track', 'tracks'];
    let songsTable = tableNames.find(t => songTableNames.includes(t));
    
    // Also check for tables containing 'song' or 'track'
    if (!songsTable) {
      songsTable = tableNames.find(t => 
        t.toLowerCase().includes('song') || t.toLowerCase().includes('track')
      );
    }

    if (songsTable) {
      result.songs = await extractSongs(db, songsTable, result);
    }

    // Try to find and parse playlists table
    const playlistTableNames = ['Playlist', 'Playlists', 'playlist', 'playlists'];
    let playlistTable = tableNames.find(t => playlistTableNames.includes(t));
    
    if (!playlistTable) {
      playlistTable = tableNames.find(t => t.toLowerCase().includes('playlist'));
    }

    if (playlistTable) {
      result.playlists = await extractPlaylists(db, playlistTable, result);
    }

    // Try to find playlist-song mapping table
    const mappingTableNames = ['PlaylistSongMap', 'SongInPlaylist', 'playlist_song', 'PlaylistSong'];
    let mappingTable = tableNames.find(t => 
      mappingTableNames.some(m => t.toLowerCase() === m.toLowerCase())
    );
    
    if (!mappingTable) {
      mappingTable = tableNames.find(t => 
        (t.toLowerCase().includes('playlist') && t.toLowerCase().includes('song')) ||
        (t.toLowerCase().includes('song') && t.toLowerCase().includes('map'))
      );
    }

    if (mappingTable && result.playlists.length > 0 && result.songs.length > 0) {
      await linkSongsToPlaylists(db, mappingTable, result);
    }

    db.close();
  } catch (error) {
    result.errors.push(`Database parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    db.close();
  }

  return result;
}

async function extractSongs(db: Database, tableName: string, result: ConversionResult): Promise<Song[]> {
  const songs: Song[] = [];
  
  try {
    const data = db.exec(`SELECT * FROM ${tableName}`);
    if (!data[0]) return songs;

    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    // Find column indices
    const idIdx = columns.findIndex(c => c === 'id' || c === 'songid' || c === 'song_id' || c === 'videoid' || c === 'video_id');
    const titleIdx = columns.findIndex(c => c === 'title' || c === 'name' || c === 'songtitle');
    const artistIdx = columns.findIndex(c => c === 'artist' || c === 'artists' || c === 'artiststext' || c === 'artists_text' || c === 'artistname');
    const durationIdx = columns.findIndex(c => c === 'duration' || c === 'durationtext' || c === 'duration_text' || c === 'length');
    const thumbIdx = columns.findIndex(c => c === 'thumbnail' || c === 'thumbnailurl' || c === 'thumbnail_url' || c === 'image' || c === 'artwork');

    for (const row of rows) {
      try {
        const song: Song = {
          songId: sanitizeValue(row[idIdx]),
          playlistBrowseId: '',
          playlistName: '',
          title: sanitizeValue(row[titleIdx]),
          artists: sanitizeValue(row[artistIdx]),
          duration: sanitizeDuration(row[durationIdx]),
          thumbnailUrl: sanitizeValue(row[thumbIdx]),
        };

        // Only add songs with valid IDs
        if (song.songId && song.songId.length > 0) {
          songs.push(song);
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

async function extractPlaylists(db: Database, tableName: string, result: ConversionResult): Promise<Playlist[]> {
  const playlists: Playlist[] = [];
  
  try {
    const data = db.exec(`SELECT * FROM ${tableName}`);
    if (!data[0]) return playlists;

    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const idIdx = columns.findIndex(c => c === 'id' || c === 'playlistid' || c === 'playlist_id');
    const nameIdx = columns.findIndex(c => c === 'name' || c === 'title' || c === 'playlistname');
    const browseIdIdx = columns.findIndex(c => c === 'browseid' || c === 'browse_id');

    for (const row of rows) {
      try {
        const playlist: Playlist = {
          id: sanitizeValue(row[idIdx]) || String(playlists.length + 1),
          name: sanitizeValue(row[nameIdx]) || 'Unknown Playlist',
          browseId: sanitizeValue(row[browseIdIdx]),
          songs: [],
        };

        playlists.push(playlist);
      } catch (e) {
        result.warnings.push(`Could not parse playlist row`);
      }
    }
  } catch (error) {
    result.errors.push(`Error reading playlists table: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return playlists;
}

async function linkSongsToPlaylists(db: Database, tableName: string, result: ConversionResult): Promise<void> {
  try {
    const data = db.exec(`SELECT * FROM ${tableName}`);
    if (!data[0]) return;

    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const playlistIdIdx = columns.findIndex(c => 
      c === 'playlistid' || c === 'playlist_id' || c.includes('playlist')
    );
    const songIdIdx = columns.findIndex(c => 
      c === 'songid' || c === 'song_id' || c.includes('song') || c.includes('video')
    );

    if (playlistIdIdx === -1 || songIdIdx === -1) {
      result.warnings.push('Could not find playlist-song mapping columns');
      return;
    }

    // Create a map of songs by ID for quick lookup
    const songMap = new Map(result.songs.map(s => [s.songId, s]));

    for (const row of rows) {
      const playlistId = sanitizeValue(row[playlistIdIdx]);
      const songId = sanitizeValue(row[songIdIdx]);

      const playlist = result.playlists.find(p => p.id === playlistId);
      const song = songMap.get(songId);

      if (playlist && song) {
        const songCopy = { ...song, playlistBrowseId: playlist.browseId, playlistName: playlist.name };
        playlist.songs.push(songCopy);
      }
    }
  } catch (error) {
    result.errors.push(`Error linking songs to playlists: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function sanitizeValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Remove problematic characters and trim
  return str.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

function sanitizeDuration(value: unknown): string {
  if (value === null || value === undefined) return '0';
  
  const str = String(value).trim();
  
  // If it's already a number (in seconds or milliseconds)
  const num = Number(str);
  if (!isNaN(num)) {
    // If greater than 100000, assume milliseconds
    if (num > 100000) {
      return String(Math.floor(num / 1000));
    }
    return String(Math.floor(num));
  }
  
  // If it's in format like "3:45" or "03:45"
  const timeMatch = str.match(/^(\d+):(\d{2})$/);
  if (timeMatch) {
    const minutes = parseInt(timeMatch[1], 10);
    const seconds = parseInt(timeMatch[2], 10);
    return String(minutes * 60 + seconds);
  }
  
  return '0';
}

// Generate Cubic Music compatible SQLite database
export async function generateCubicMusicSQLite(result: ConversionResult): Promise<Uint8Array> {
  const SqlJs = await getSqlJs();
  const db = new SqlJs.Database();

  // Create Song table matching Cubic Music's expected schema
  db.run(`
    CREATE TABLE IF NOT EXISTS Song (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      artistsText TEXT,
      durationText TEXT,
      thumbnailUrl TEXT,
      likedAt INTEGER,
      totalPlayTimeMs INTEGER DEFAULT 0
    )
  `);

  // Create Playlist table
  db.run(`
    CREATE TABLE IF NOT EXISTS Playlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      browseId TEXT
    )
  `);

  // Create SongPlaylistMap junction table
  db.run(`
    CREATE TABLE IF NOT EXISTS SongPlaylistMap (
      songId TEXT NOT NULL,
      playlistId INTEGER NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (songId, playlistId),
      FOREIGN KEY (songId) REFERENCES Song(id),
      FOREIGN KEY (playlistId) REFERENCES Playlist(id)
    )
  `);

  // Insert songs
  const insertSong = db.prepare(`
    INSERT OR REPLACE INTO Song (id, title, artistsText, durationText, thumbnailUrl, totalPlayTimeMs)
    VALUES (?, ?, ?, ?, ?, 0)
  `);

  for (const song of result.songs) {
    // Convert duration seconds to mm:ss format
    const durationSecs = parseInt(song.duration) || 0;
    const minutes = Math.floor(durationSecs / 60);
    const seconds = durationSecs % 60;
    const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    insertSong.run([song.songId, song.title, song.artists, durationText, song.thumbnailUrl]);
  }
  insertSong.free();

  // Insert playlists and mappings
  const insertPlaylist = db.prepare(`INSERT INTO Playlist (name, browseId) VALUES (?, ?)`);
  const insertMapping = db.prepare(`INSERT OR REPLACE INTO SongPlaylistMap (songId, playlistId, position) VALUES (?, ?, ?)`);

  for (const playlist of result.playlists) {
    insertPlaylist.run([playlist.name, playlist.browseId]);
    const playlistId = db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] as number;

    playlist.songs.forEach((song, index) => {
      insertMapping.run([song.songId, playlistId, index]);
    });
  }
  insertPlaylist.free();
  insertMapping.free();

  // Export database as binary
  const data = db.export();
  db.close();
  
  return data;
}

// Parse and sanitize CSV input
export function parseAndSanitizeCSV(content: string): ConversionResult {
  const result: ConversionResult = {
    playlists: [],
    songs: [],
    errors: [],
    warnings: [],
    tableInfo: [],
  };

  try {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) {
      result.errors.push('Empty CSV file');
      return result;
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Find column indices
    const playlistBrowseIdIdx = headers.findIndex(h => 
      h.includes('playlistbrowseid') || h.includes('playlist_browse_id')
    );
    const playlistNameIdx = headers.findIndex(h => 
      h.includes('playlistname') || h.includes('playlist_name') || h === 'playlist'
    );
    const songIdIdx = headers.findIndex(h => 
      h.includes('songid') || h.includes('song_id') || h === 'id' || h.includes('videoid')
    );
    const titleIdx = headers.findIndex(h => 
      h === 'title' || h.includes('songtitle') || h === 'name'
    );
    const artistsIdx = headers.findIndex(h => 
      h === 'artists' || h === 'artist' || h.includes('artiststext')
    );
    const durationIdx = headers.findIndex(h => 
      h === 'duration' || h.includes('durationtext')
    );
    const thumbnailIdx = headers.findIndex(h => 
      h.includes('thumbnail') || h.includes('image') || h.includes('artwork')
    );

    const playlistMap = new Map<string, Playlist>();

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        
        const song: Song = {
          songId: sanitizeValue(values[songIdIdx]),
          playlistBrowseId: sanitizeValue(values[playlistBrowseIdIdx]),
          playlistName: sanitizeValue(values[playlistNameIdx]),
          title: sanitizeValue(values[titleIdx]),
          artists: sanitizeValue(values[artistsIdx]),
          duration: sanitizeDuration(values[durationIdx]),
          thumbnailUrl: sanitizeValue(values[thumbnailIdx]),
        };

        // Skip rows with no song ID
        if (!song.songId) {
          result.warnings.push(`Row ${i + 1}: Missing song ID`);
          continue;
        }

        result.songs.push(song);

        // Group songs by playlist
        if (song.playlistName) {
          if (!playlistMap.has(song.playlistName)) {
            playlistMap.set(song.playlistName, {
              id: song.playlistBrowseId || String(playlistMap.size + 1),
              name: song.playlistName,
              browseId: song.playlistBrowseId,
              songs: [],
            });
          }
          playlistMap.get(song.playlistName)!.songs.push(song);
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
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  values.push(current);
  return values;
}

// Detect file type
export function detectFileType(buffer: ArrayBuffer): 'sqlite' | 'csv' | 'unknown' {
  const bytes = new Uint8Array(buffer);
  
  // Check for SQLite header
  const sqliteHeader = [0x53, 0x51, 0x4C, 0x69, 0x74, 0x65]; // "SQLite"
  if (bytes.length >= 6) {
    let isSqlite = true;
    for (let i = 0; i < 6; i++) {
      if (bytes[i] !== sqliteHeader[i]) {
        isSqlite = false;
        break;
      }
    }
    if (isSqlite) return 'sqlite';
  }

  // Try to decode as text and check for CSV patterns
  try {
    const text = new TextDecoder('utf-8').decode(buffer.slice(0, 1000));
    if (text.includes(',') && (text.includes('\n') || text.includes('\r'))) {
      return 'csv';
    }
  } catch {
    // Not valid text
  }

  return 'unknown';
}
