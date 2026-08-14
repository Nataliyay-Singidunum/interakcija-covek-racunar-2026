from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

import requests
import unicodedata

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
      dispatcher.utter_message(text="Please specify which movie you would like to order")
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
      dispatcher.utter_message(text="Please specify which movie you would like to order")
      return []

    dispatcher.utter_message(text="Permalink " + permalink)

    return []

class ActionListCinema(Action):
  def name(self) -> Text:
    return "action_list_cinema"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    bot_response = {"type": "simple_list","data": ["Usce", "Beo", "Ada Mall"]};
    dispatcher.utter_message(text="Here are all of the available cinemas:  " + bot_response);

    return [];

class ActionListHall(Action):
  def name(self) -> Text:
    return "action_list_hall"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    bot_response = {"type": "simple_list","data": [ "Big", "Small", "Private"]};
    dispatcher.utter_message(text="Here are all of the available halls:  " + bot_response);

    return [];

class ActionListTime(Action):
  def name(self) -> Text:
    return "action_list_time"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    bot_response = {"type": "simple_list","data": [ "Monday 22h", "Tuesday 17h", "Friday 13h"]};
    dispatcher.utter_message(text="Here are all of the available screening times: " + bot_response);

    return [];

class ActionSelectCinema(Action):
  def name(self) -> Text:
    return "action_select_cinema"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    criteria = tracker.get_slot("cinema_criteria");
    cinemas = ["Usce", "Beo", "Ada Mall"];
    matched = [];

    if not criteria:
      dispatcher.utter_message(text="Please specify which cinema you would like to book tickets for. ");
      return [];

    if criteria:
      normalized_criteria = normalize(criteria);
      for cinema in cinemas:
        if normalize(cinema) == normalized_criteria:
          matched.append(cinema);

    if len(matched) > 0:
      exact_cinema = matched[0];
      dispatcher.utter_message(text='Selected cinema: '+ exact_cinema);
      return [SlotSet('cinema_id',exact_cinema)];

    dispatcher.utter_message(text='No cinema for that criteria found!');
    return [];

class ActionSelectHall(Action):
  def name(self) -> Text:
    return "action_select_hall"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    criteria = tracker.get_slot("hall_criteria");
    halls = [ "Big", "Small", "Private"];
    matched = [];

    if not criteria:
      dispatcher.utter_message(text="Please specify which hall you would like to book tickets for. ");
      return [];

    if criteria:
      normalized_criteria = normalize(criteria);
      for hall in halls:
        if normalize(hall) == normalized_criteria:
          matched.append(hall);

    if len(matched) > 0:
      exact_hall = matched[0];
      dispatcher.utter_message(text='Selected hall: '+ exact_hall);
      return [SlotSet('hall_id', exact_hall)];

    dispatcher.utter_message(text='No halls for that criteria found!');
    return [];

class ActionSelectTime(Action):
  def name(self) -> Text:
    return "action_select_time"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    criteria = tracker.get_slot("time_criteria");
    times = [ "Monday 22h", "Tuesday 17h", "Friday 13h"];
    matched = [];

    if not criteria:
      dispatcher.utter_message(text="Please specify which showing you would like to book tickets for. ");
      return [];

    if criteria:
      normalized_criteria = normalize(criteria);
      for time in times:
        if normalize(time) == normalized_criteria:
          matched.append(time);

    if len(matched) > 0:
      exact_time = matched[0];
      dispatcher.utter_message(text='Selected showing: '+ exact_time);
      return [SlotSet('time_id', exact_time)];

    dispatcher.utter_message(text='No showings for that criteria found!');
    return [];

class ActionSelectCount(Action):

  def name(self) -> Text:
    return "action_select_count"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    criteria = tracker.get_slot("count_criteria")
    dispatcher.utter_message(text='Selected number of tickets: '+ criteria)
    return [SlotSet('ticket_count',criteria)]


class ActionPlaceOrder(Action):

  def name(self) -> Text:
    return "action_place_order"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    order_details= {
      "movie": tracker.get_slot("movie_permalink"),
      "cinema": tracker.get_slot("cinema_id"),
      "hall":  tracker.get_slot("hall_id"),
      "time": tracker.get_slot("time_id"),
      "count": tracker.get_slot("ticket_count")
    }

    dispatcher.utter_message(
      text='Your order has been placed:',
      attachment={
        "type": "create_order",
        "data": order_details
      }
    )
    return []
