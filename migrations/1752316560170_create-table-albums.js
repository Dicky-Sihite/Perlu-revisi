exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: { type: 'varchar(50)', primaryKey: true },
    name: { type: 'text', notNull: true },
    year: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
