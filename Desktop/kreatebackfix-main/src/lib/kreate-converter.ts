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
    cleaningReport: [],
    kreateSchema: [],
    cubicMusicSchema: CUBIC_MUSIC_SCHEMA,
  };

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

    // Try to find and parse songs table
    const songTableNames = ['Song', 'Songs', 'song', 'songs', 'Track', 'Tracks', 'track', 'tracks'];
    let songsTable = tableNames.find(t => songTableNames.includes(t));
    
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
    const mappingTableNames = ['PlaylistSongMap', 'SongInPlaylist', 'playlist_song', 'PlaylistSong', 'SongPlaylistMap'];
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

    // Mark all playlists as selected by default
    result.playlists.forEach(p => p.selected = true);

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
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return songs;

    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    // Find column indices with flexible matching
    const idIdx = columns.findIndex(c => c === 'id' || c === 'songid' || c === 'song_id' || c === 'videoid' || c === 'video_id');
    const titleIdx = columns.findIndex(c => c === 'title' || c === 'name' || c === 'songtitle');
    const artistIdx = columns.findIndex(c => c === 'artist' || c === 'artists' || c === 'artiststext' || c === 'artists_text' || c === 'artistname');
    const durationIdx = columns.findIndex(c => c === 'duration' || c === 'durationtext' || c === 'duration_text' || c === 'length');
    const thumbIdx = columns.findIndex(c => c === 'thumbnail' || c === 'thumbnailurl' || c === 'thumbnail_url' || c === 'image' || c === 'artwork');
    const likedIdx = columns.findIndex(c => c === 'likedat' || c === 'liked_at' || c === 'liked');
    const playTimeIdx = columns.findIndex(c => c === 'totalplaytimems' || c === 'playtime' || c === 'play_time');

    for (const row of rows) {
      try {
        const rawId = row[idIdx];
        const rawTitle = row[titleIdx];
        const rawArtist = row[artistIdx];
        const rawDuration = row[durationIdx];
        const rawThumb = row[thumbIdx];
        
        const song: Song = {
          songId: cleanAndReport(rawId, 'songId', result),
          title: cleanAndReport(rawTitle, 'title', result),
          artists: cleanAndReport(rawArtist, 'artists', result),
          duration: cleanDuration(rawDuration, result),
          thumbnailUrl: cleanAndReport(rawThumb, 'thumbnailUrl', result),
          likedAt: likedIdx >= 0 ? Number(row[likedIdx]) || undefined : undefined,
          totalPlayTimeMs: playTimeIdx >= 0 ? Number(row[playTimeIdx]) || 0 : 0,
        };

        // Only add songs with valid IDs
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

async function extractPlaylists(db: Database, tableName: string, result: ConversionResult): Promise<Playlist[]> {
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
        const playlist: Playlist = {
          id: Number(row[idIdx]) || playlists.length + 1,
          name: cleanAndReport(row[nameIdx], 'playlistName', result) || 'Unknown Playlist',
          browseId: cleanAndReport(row[browseIdIdx], 'browseId', result),
          songs: [],
          selected: true,
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
    const data = db.exec(`SELECT * FROM "${tableName}"`);
    if (!data[0]) return;

    const columns = data[0].columns.map(c => c.toLowerCase());
    const rows = data[0].values;

    const playlistIdIdx = columns.findIndex(c => 
      c === 'playlistid' || c === 'playlist_id' || c.includes('playlist')
    );
    const songIdIdx = columns.findIndex(c => 
      c === 'songid' || c === 'song_id' || c.includes('song') || c.includes('video')
    );
    const positionIdx = columns.findIndex(c => 
      c === 'position' || c === 'pos' || c === 'order' || c === 'index'
    );

    if (playlistIdIdx === -1 || songIdIdx === -1) {
      result.warnings.push('Could not find playlist-song mapping columns');
      return;
    }

    // Create a map of songs by ID for quick lookup
    const songMap = new Map(result.songs.map(s => [s.songId, s]));

    // Group mappings by playlist
    const playlistSongsMap = new Map<number, { song: Song; position: number }[]>();

    for (const row of rows) {
      const playlistId = Number(row[playlistIdIdx]);
      const songId = cleanAndReport(row[songIdIdx], 'mappingSongId', result);
      const position = positionIdx >= 0 ? Number(row[positionIdx]) || 0 : 0;

      const song = songMap.get(songId);

      if (song) {
        if (!playlistSongsMap.has(playlistId)) {
          playlistSongsMap.set(playlistId, []);
        }
        playlistSongsMap.get(playlistId)!.push({ song: { ...song }, position });
      }
    }

    // Assign songs to playlists
    for (const playlist of result.playlists) {
      const playlistSongs = playlistSongsMap.get(playlist.id);
      if (playlistSongs) {
        playlist.songs = playlistSongs
          .sort((a, b) => a.position - b.position)
          .map(ps => ps.song);
      }
    }
  } catch (error) {
    result.errors.push(`Error linking songs to playlists: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function cleanAndReport(value: unknown, field: string, result: ConversionResult): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const original = String(value);
  let cleaned = original;
  let issues: string[] = [];

  // Remove control characters
  if (/[\x00-\x1F\x7F]/.test(cleaned)) {
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
    issues.push('control characters removed');
  }

  // Trim whitespace
  if (cleaned !== cleaned.trim()) {
    cleaned = cleaned.trim();
    issues.push('whitespace trimmed');
  }

  // Handle escaped quotes
  if (cleaned.includes('\\"') || cleaned.includes("\\'")) {
    cleaned = cleaned.replace(/\\"/g, '"').replace(/\\'/g, "'");
    issues.push('escaped quotes fixed');
  }

  // Log significant changes
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
    // If greater than 100000, assume milliseconds
    if (num > 100000) {
      seconds = Math.floor(num / 1000);
      issue = 'converted from milliseconds';
    } else {
      seconds = Math.floor(num);
    }
  } else {
    // If it's in format like "3:45" or "03:45"
    const timeMatch = original.match(/^(\d+):(\d{2})$/);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      const secs = parseInt(timeMatch[2], 10);
      seconds = minutes * 60 + secs;
      issue = 'parsed from mm:ss format';
    } else {
      seconds = 0;
      issue = 'invalid duration set to 0';
    }
  }

  if (issue && original !== String(seconds)) {
    result.cleaningReport.push({
      field: 'duration',
      original,
      cleaned: String(seconds),
      issue,
    });
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

  // ===== Insert song data =====
  const playlistsToExport = selectedPlaylists
    ? result.playlists.filter(p => selectedPlaylists.includes(p.id))
    : result.playlists.filter(p => p.selected !== false);

  const insertSong = db.prepare(`
    INSERT OR REPLACE INTO Song (id, title, artistsText, durationText, thumbnailUrl, likedAt, totalPlayTimeMs)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const addedSongIds = new Set<string>();
  for (const song of result.songs) {
    if (addedSongIds.has(song.songId)) continue;

    // Convert duration seconds to mm:ss format
    const durationSecs = parseInt(song.duration) || 0;
    const minutes = Math.floor(durationSecs / 60);
    const seconds = durationSecs % 60;
    const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    insertSong.run([
      song.songId,
      song.title || 'Unknown Title',
      song.artists || '',
      durationText,
      song.thumbnailUrl || '',
      song.likedAt || null,
      song.totalPlayTimeMs || 0,
    ]);
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

  // Set PRAGMA user_version to 23 (matches reference Cubic Music DB)
  // The app will run migrations 23→27 automatically
  db.run("PRAGMA user_version = 23");

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
    cleaningReport: [],
    kreateSchema: [],
    cubicMusicSchema: CUBIC_MUSIC_SCHEMA,
  };

  try {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) {
      result.errors.push('Empty CSV file');
      return result;
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Create virtual table info for CSV
    result.kreateSchema.push({
      name: 'CSV Import',
      columns: headers.map(h => ({ name: h, type: 'TEXT' })),
      rowCount: lines.length - 1,
    });

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

        // Skip rows with no song ID
        if (!song.songId) {
          result.warnings.push(`Row ${i + 1}: Missing song ID`);
          continue;
        }

        result.songs.push(song);

        // Group songs by playlist
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
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
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
  const sqliteHeader = [0x53, 0x51, 0x4C, 0x69, 0x74, 0x65];
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
    // Ignore decoding errors
  }

  return 'unknown';
}
