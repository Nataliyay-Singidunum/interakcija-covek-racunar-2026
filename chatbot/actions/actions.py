from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

import requests

class ActionHelloWorld(Action):

    def name(self) -> Text:
        return "action_hello_world"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        dispatcher.utter_message(text="Hello World from actions!")
        return []

class ActionLatestMovies(Action):

  def name(self) -> Text:
    return "action_latest_movies"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    url="https://movie.pequla.com/api/movie"
    rsp = requests.get(url)
    movies = rsp.json()

    if len(movies) >= 3:
      bot_response = {
        "type": "movie_list",
        "data": movies[-3:]
      }
      dispatcher.utter_message(text="Here are some movies: ", attachment = bot_response)
    else:
      dispatcher.utter_message(text="Not enough movies found")



    return []

class ActionSearchMovies(Action):
  def name(self) -> Text:
    return "action_search_movies"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    criteria = tracker.get_slot("search_criteria")
    url="https://movie.pequla.com/api/movie?search=" + str(criteria)
    rsp = requests.get(url)
    movies = rsp.json()

    bot_response = {"type": "movie_list","data": movies}
    dispatcher.utter_message(text="Here are the search results for: " + str(criteria), attachment = bot_response)

    return [SlotSet("search_criteria", None)]


class ActionGenreList(Action):
  def name(self) -> Text:
    return "action_genre_list"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    url="https://movie.pequla.com/api/genre"
    rsp = requests.get(url)
    genres = rsp.json()

    bot_response = {"type": "genre_list","data": genres}
    dispatcher.utter_message(text="Here are the available genres: ", attachment = bot_response)

    return []


class ActionActorList(Action):
  def name(self) -> Text:
    return "action_actor_list"

  def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    url="https://movie.pequla.com/api/actor"
    rsp = requests.get(url)
    actors = rsp.json()

    bot_response = {"type": "actor_list","data": actors}
    dispatcher.utter_message(text="Here are the available actors: ", attachment = bot_response)

    return [SlotSet("search_criteria", None)]


class ActionDirectorList(Action):
  def name(self) -> Text:
    return "action_director_list"

  def run(self, dispatcher: CollectingDispatcher,
      tracker: Tracker,
      domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    url="https://movie.pequla.com/api/director"
    rsp = requests.get(url)
    directors = rsp.json()

    bot_response = {"type": "director_list","data": directors}
    dispatcher.utter_message(text="Here are the available directors: ", attachment = bot_response)

    return [SlotSet("search_criteria", None)]

class ActionExtractMovie(Action):
  def name(self) -> Text:
    return "action_extract_movie"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    criteria = tracker.get_slot("order_criteria")

    if not criteria:
      dispatcher.utter_message(text="Please specify which movie you would like to order (e.g. 'order movie dogmen')")
      return []


    url="https://movie.pequla.com/api/movie?search=" + str(criteria)
    rsp = requests.get(url)
    movies = rsp.json()

    if len(movies) > 0:
      exact_movie = movies[0]
      short_url = exact_movie.get("shortUrl", "")

      dispatcher.utter_message(text="Selected movie: " + exact_movie['title'])
      return [SlotSet("movie_permalink", short_url)]

    dispatcher.utter_message(text="No movies for that criteria found :(" + str(criteria))
    return []


class ActionPlaceOrder(Action):
  def name(self) -> Text:
    return "action_place_order"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    permalink = tracker.get_slot("movie_permalink")
    if not permalink:
      dispatcher.utter_message(text="Please specify which movie you would like to order (e.g. 'order movie dogmen')")
      return []

    dispatcher.utter_message(text="Permalink " + permalink)

    return []
