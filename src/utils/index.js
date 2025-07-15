const mapDBToModel = ({
  id,
  name,
  year,
  title,
  performer,
  genre,
  duration,
  album_id,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  year,
  title,
  performer,
  genre,
  duration,
  albumId: album_id,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapDBToPlaylistModel = ({
  id,
  name,
  owner,
  username,
}) => ({
  id,
  name,
  username,
});

module.exports = { mapDBToModel, mapDBToPlaylistModel };