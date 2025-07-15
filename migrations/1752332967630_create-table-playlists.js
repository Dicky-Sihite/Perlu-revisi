exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: { type: 'varchar(50)', primaryKey: true },
    name: { type: 'text', notNull: true },
    owner: { type: 'varchar(50)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlists');
};
