exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'varchar(50)', primaryKey: true },
    username: { type: 'varchar(50)', notNull: true, unique: true },
    password: { type: 'text', notNull: true },
    fullname: { type: 'text', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
