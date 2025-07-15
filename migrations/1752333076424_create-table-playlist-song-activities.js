exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
    id: { type: 'varchar(50)', primaryKey: true },
    playlist_id: { type: 'varchar(50)', notNull: true },
    song_id: { type: 'varchar(50)', notNull: true },
    user_id: { type: 'varchar(50)', notNull: true },
    action: { type: 'varchar(50)', notNull: true },
    time: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('playlist_song_activities', 'fk_activities.playlist_id_playlists.id', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('playlist_song_activities', 'fk_activities.song_id_songs.id', {
    foreignKeys: {
      columns: 'song_id',
      references: 'songs(id)',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('playlist_song_activities', 'fk_activities.user_id_users.id', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_song_activities');
};
