export interface RasaModel {
  text: string;
  attachment: {
    type:
      | 'toy_list'
      | 'toy'
      | 'toy_rating_list'
      | 'actor_list'
      | 'director_list'
      | 'order_movie'
      | 'simple_list'
      | 'cart_item'
      | 'show_cart'
      | 'place_order'
      | 'create_order';
    data: any;
  };
}
