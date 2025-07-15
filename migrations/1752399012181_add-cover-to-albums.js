/* eslint-disable camelcase */

export const up = (pgm) => {
  pgm.addColumns('albums', {
    cover_url: { type: 'TEXT', notNull: false },
  });
};

export const down = (pgm) => {
  pgm.dropColumns('albums', 'cover_url');
};