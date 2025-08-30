import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/authMiddleware';
import { MoviesServices } from '../services/movie.services';

const moviesService = new MoviesServices()

export const moviesRoutes = new Elysia({ prefix: '/api/movies' })

  .group('/movies' , (app) => app)
    .get('/', async () => {
      const movies = await moviesService.getMovies();
      return {Movies: movies};
    })
    .get('/:id', async ({ params }: any) => {
      const movie = await moviesService.getMovieById(params.id);
      if (!movie) {
        throw new Error("NOT_FOUND");
      }
      return movie;
    }, {
      beforeHandle: [authMiddleware],
      params: t.Object({
        id: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })

    .post('/', async ({ body }: any) => {
      const movie = await moviesService.createMovie(body);
      return movie;
    },{
      beforeHandle: [authMiddleware],
      body: t.Object({
        title: t.String(),
        description: t.String(),
        genre: t.Array(t.String()),
        duration: t.Number(),
      })
    })

    .put('/:id', async ({ params, body }: any) => {
      const movie = await moviesService.updateMovie(params.id, body);
      return movie;
    }, {
      beforeHandle: [authMiddleware],
      params: t.Object({
        id: t.String()  // t.Number() lebih baik jika id harus angka
      }),
      body: t.Partial(t.Object({
        title: t.String(),
        description: t.String(),
        genre: t.Array(t.String()),
        duration: t.Number(),
        rating: t.String(),
      }))
    })

    .delete('/:id', async ({ params }: any) => {
      const movie = await moviesService.deleteMovie(params.id);
      return movie;
    }, {
      beforeHandle: [authMiddleware],
      params: t.Object({
        id: t.String()  // t.Number() lebih baik jika id harus angka
      })
    })