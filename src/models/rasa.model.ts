export interface RasaModel {
  text: string;
  attachment: {
    type:
      | 'toy_list'
      | 'movie_list'
      | 'single_movie'
      | 'genre_list'
      | 'actor_list'
      | 'director_list'
      | 'order_movie'
      | 'simple_list'
      | 'create_order';
    data: any;
  };
}
