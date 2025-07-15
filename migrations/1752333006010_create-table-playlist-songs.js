exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: { type: 'varchar(50)', primaryKey: true },
    playlist_id: { type: 'varchar(50)', notNull: true },
    song_id: { type: 'varchar(50)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', {
    foreignKeys: {
      columns: 'song_id',
      references: 'songs(id)',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};
