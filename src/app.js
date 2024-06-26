require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');

const ClientError = require('./exceptions/ClientError');

//albums
const album = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

//songs
const song = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

//users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

//authentication
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

//Playlist
const playlist = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

//PlaylistSongs
const playlistSongs = require('./api/playlistsongs');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongsValidator = require('./validator/playlistsongs');

//collaboration
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

//activities
const playlistactivities = require('./api/activities');
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService');

//exports
const producerService = require('./services/rabbitmq/ProducerService');
const exportsPlaylist = require('./api/exports');
const ExportValidator = require('./validator/exports');

//uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

//like
const useralbumlikes = require('./api/useralbumlikes');
const UserAlbumLikesService = require('./services/postgres/UsersAlbumLikesService');

//redis
const CacheService = require('./services/redis/CacheService');


const init = async () => {
  const cacheService = new CacheService();
  const collaborationsService = new CollaborationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService();
  const playlistActivitiesService = new PlaylistActivitiesService(playlistsService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
  const userAlbumLikesService = new UserAlbumLikesService(albumsService, cacheService);


    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    server.register([
      {
        plugin: Jwt,
      },
      {
        plugin: Inert,
      }
    ]);

    // mendefinisikan strategy autentikasi jwt
    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    server.ext('onPreResponse', (request, h) => {
        // mendapatkan konteks response dari request
        const { response } = request;

        if (response instanceof ClientError) {
            // membuat response baru dari response toolkit sesuai kebutuhan error handling
            const newResponse = h.response({
                status: 'fail',
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
        return response.continue || response;
    });

    await server.register([
      {
        plugin: album,
        options: {
          albumsService: albumsService,
          songsService: songsService,
          validator: AlbumsValidator,
        },
      },
      {
        plugin: song,
        options: {
          service: songsService,
          validator: SongsValidator,
        },
      },
      {
        plugin: users,
        options: {
          service: usersService,
          validator: UsersValidator,
        },
      },
      {
        plugin: authentications,
        options: {
          authenticationsService,
          usersService,
          tokenManager: TokenManager,
          validator: AuthenticationsValidator,
        },
      },
      {
        plugin: playlist,
        options: {
          service: playlistsService,
          validator: PlaylistsValidator,
        },
      },
      {
        plugin: playlistactivities,
        options: {
          service: playlistActivitiesService,
        },
      },
      {
        plugin: playlistSongs,
        options: {
          playlistSongsService,
          playlistsService,
          playlistActivitiesService,
          validator: PlaylistSongsValidator,
        },
      },
      {
        plugin: collaborations,
        options: {
          collaborationsService,
          playlistsService,
          usersService,
          validator: CollaborationsValidator,
        },
      },
      {
        plugin: exportsPlaylist,
        options: {
          producerService: producerService,
          playlistService: playlistsService,
          validator: ExportValidator,
        },
      },
      {
        plugin: uploads,
        options: {
          storageService: storageService,
          albumsService: albumsService,
          validator: UploadsValidator,
        },
      },{
        plugin: useralbumlikes,
        options: {
          service: userAlbumLikesService,
        },
      }
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();