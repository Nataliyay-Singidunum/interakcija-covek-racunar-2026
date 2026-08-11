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


class ActionOrderMovies(Action):
  def name(self) -> Text:
    return "action_order_movie"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    criteria = tracker.get_slot("order_criteria")
    url="https://movie.pequla.com/api/movie?search=" + str(criteria)
    rsp = requests.get(url)
    movies = rsp.json()

    if len(movies) > 0:
      bot_response = {"type": "order_movie","data": movies[0]}
      dispatcher.utter_message(text="Placing an order for: " + str(criteria), attachment = bot_response)
    else:
      dispatcher.utter_message(text="No movies for that criteria found :(" + str(criteria))
    return [SlotSet("order_criteria", None)]


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

    return [SlotSet("search_criteria", None)]


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
