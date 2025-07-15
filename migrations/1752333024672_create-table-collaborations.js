exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: { type: 'varchar(50)', primaryKey: true },
    playlist_id: { type: 'varchar(50)', notNull: true },
    user_id: { type: 'varchar(50)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('collaborations', 'fk_collaborations.playlist_id_playlists.id', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('collaborations', 'fk_collaborations.user_id_users.id', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
