from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, Restarted
from datetime import datetime

import requests
import unicodedata

def normalize(text: str) -> str:
  return (
    unicodedata.normalize("NFKD", text)
    .encode("ascii", "ignore")
    .decode("utf-8")
    .lower()
  )

class ActionHelloWorld(Action):
  def name(self) -> Text:
    return "action_hello_world"

  def run(self, dispatcher: CollectingDispatcher,
    tracker: Tracker,
    domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    dispatcher.utter_message(text="Hello World from actions!")
    return []

class ActionAllToys(Action):
  def name(self) -> Text:
    return "action_all_toys"
  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    url="https://toy.pequla.com/api/toy"
    rsp = requests.get(url)
    toys = rsp.json()

    toys.sort(key=lambda x: x.get("productionDate", ""), reverse=True)

    if len(toys) >= 3:
      bot_response = {
        "type": "toy_list",
        "data": toys
      }
      dispatcher.utter_message(text="Here are all toys: ", attachment = bot_response)
    else:
      dispatcher.utter_message(text="Not enough toys found")
    return []


class ActionNewToys(Action):
  def name(self) -> Text:
    return "action_new_toys"
  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    url="https://toy.pequla.com/api/toy"
    rsp = requests.get(url)
    toys = rsp.json()

    toys.sort(key=lambda x: x.get("productionDate", ""), reverse=True)

    if len(toys) >= 3:
      bot_response = {
        "type": "toy_list",
        "data": toys[:3]
      }
      dispatcher.utter_message(text="Here are some new toys: ", attachment = bot_response)
    else:
      dispatcher.utter_message(text="Not enough toys found")
    return []


class ActionToysByName(Action):
  def name(self) -> Text:
    return "action_toys_by_name"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    toy_name = tracker.get_slot("toy_name")
    if not toy_name:
      dispatcher.utter_message(text="I didn't quite catch the name. Could you type it again?")
      return []

    url="https://toy.pequla.com/api/toy"
    rsp = requests.get(url)
    toys = rsp.json()

    toysByName = [
      toy for toy in toys
      if toy_name.lower() in toy.get("name").lower()
    ]

    if len(toysByName) > 0:
      bot_response = {"type": "toy_list","data": toysByName}
      dispatcher.utter_message(text="Here are the search results for: " + str(toy_name), attachment = bot_response)
    else:
      dispatcher.utter_message(text="I couldn't find any toys matching: " + str(toy_name))

    return [SlotSet("toy_name", None)]

class ActionToysByDescription(Action):
  def name(self) -> Text:
    return "action_toys_by_description"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    toy_description = tracker.get_slot("toy_description")
    if not toy_description:
      dispatcher.utter_message(text="I didn't quite catch the description. Could you type it again?")
      return []

    url="https://toy.pequla.com/api/toy"
    rsp = requests.get(url)
    toys = rsp.json()

    toysByDescription = [
      toy for toy in toys
      if toy_description.lower() in toy.get("description").lower()
    ]

    if len(toysByDescription) > 0:
      bot_response = {"type": "toy_list","data": toysByDescription}
      dispatcher.utter_message(text="Here are the search results for: " + str(toy_description), attachment = bot_response)
    else:
      dispatcher.utter_message(text="I couldn't find any toys matching: " + str(toy_description))

    return [SlotSet("toy_description", None)]

class ActionToysByType(Action):
  def name(self) -> Text:
    return "action_toys_by_type"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    toy_type = tracker.get_slot("toy_type")
    if not toy_type:
      dispatcher.utter_message(text="I didn't quite catch the type. Could you type it again?")
      return []

    url="https://toy.pequla.com/api/toy"
    rsp = requests.get(url)
    toys = rsp.json()

    toysByType = [
      toy for toy in toys
      if toy_type.lower() in toy.get("type").get("name").lower()
    ]

    if len(toysByType) > 0:
      bot_response = {"type": "toy_list","data": toysByType}
      dispatcher.utter_message(text="Here are the search results for: " + str(toy_type), attachment = bot_response)
    else:
      dispatcher.utter_message(text="I couldn't find any toys matching: " + str(toy_type))

    return [SlotSet("toy_type", None)]


class ActionToysByPrice(Action):
  def name(self) -> Text:
    return "action_toys_by_price"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    toy_price = tracker.get_slot("toy_price")
    if not toy_price:
      dispatcher.utter_message(text="I didn't quite catch the price. Could you type it again?")
      return []

    url="https://toy.pequla.com/api/toy"
    rsp = requests.get(url)
    toys = rsp.json()

    price_category = toy_price.lower().strip()
    toysByPrice = []

    for toy in toys:
      price = float(toy.get("price"))
      match = False

      if "under 1,500" in price_category:
        match = price < 1500
      elif "1,500 - 3,000" in price_category:
        match = 1500 <= price <= 3000
      elif "3,000 - 5,000" in price_category:
        match = 3000 <= price <= 5000
      elif "over 5,000" in price_category:
        match = price > 5000
      elif "all" in price_category:
        match = True
      if match:
        toysByPrice.append(toy)

    if len(toysByPrice) > 0:
      bot_response = {"type": "toy_list","data": toysByPrice}
      dispatcher.utter_message(text="Here are the search results for: " + str(toy_price), attachment = bot_response)
    else:
      dispatcher.utter_message(text="I couldn't find any toys matching: " + str(toy_price))

    return [SlotSet("toy_price", None)]

class ActionToysByAge(Action):
  def name(self) -> Text:
    return "action_toys_by_age"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    toy_age = tracker.get_slot("toy_age")
    if not toy_age:
      dispatcher.utter_message(text="I didn't quite catch the age group. Could you type it again?")
      return []

    url="https://toy.pequla.com/api/toy"
    rsp = requests.get(url)
    toys = rsp.json()

    toysByAge = [
      toy for toy in toys
      if toy_age.lower() in toy.get("ageGroup").get("name").lower()
    ]

    if len(toysByAge) > 0:
      bot_response = {"type": "toy_list","data": toysByAge}
      dispatcher.utter_message(text="Here are the search results for: " + str(toy_age), attachment = bot_response)
    else:
      dispatcher.utter_message(text="I couldn't find any toys matching: " + str(toy_age))

    return [SlotSet("toy_age", None)]

class ActionToysByTargetGroup(Action):
  def name(self) -> Text:
    return "action_toys_by_target_group"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    toy_target_group = tracker.get_slot("toy_target_group")
    if not toy_target_group:
      dispatcher.utter_message(text="I didn't quite catch the target group. Could you type it again?")
      return []

    url="https://toy.pequla.com/api/toy"
    rsp = requests.get(url)
    toys = rsp.json()

    toysByTargetGroup = [
      toy for toy in toys
      if toy_target_group.lower() in toy.get("targetGroup").lower()
    ]

    if len(toysByTargetGroup) > 0:
      bot_response = {"type": "toy_list","data": toysByTargetGroup}
      dispatcher.utter_message(text="Here are the search results for: " + str(toy_target_group), attachment = bot_response)
    else:
      dispatcher.utter_message(text="I couldn't find any toys matching: " + str(toy_target_group))

    return [SlotSet("toy_target_group", None)]


class ActionToysByDate(Action):
  def name(self) -> Text:
    return "action_toys_by_date"

  def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    toy_date = tracker.get_slot("toy_date")
    if not toy_date:
      dispatcher.utter_message(text="I didn't quite catch the date. Could you type it again?")
      return []

    url="https://toy.pequla.com/api/toy"
    rsp = requests.get(url)
    toys = rsp.json()

    date_category = toy_date.lower().strip()
    toysByDate = []

    for toy in toys:
      prod_date = toy.get("productionDate")
      match = False

      if prod_date:
        try:
          date_obj = datetime.strptime(prod_date, "%Y-%m-%d")
          year = date_obj.year
          month = date_obj.month

          if "2024 half 2" in date_category or ("jul-dec" in date_category and "2024" in date_category):
            match = (year == 2024 and 7 <= month <= 12)
          elif "2024 half 1" in date_category or ("jan-jun" in date_category and "2024" in date_category):
            match = (year == 2024 and 1 <= month <= 6)
          elif "2023 half 2" in date_category or ("jul-dec" in date_category and "2023" in date_category):
            match = (year == 2023 and 7 <= month <= 12)
          elif "all" in date_category:
            match = True

        except ValueError:
          pass

      if match:
        toysByDate.append(toy)

    if len(toysByDate) > 0:
      bot_response = {"type": "toy_list","data": toysByDate}
      dispatcher.utter_message(text="Here are the search results for: " + str(toy_date), attachment = bot_response)
    else:
      dispatcher.utter_message(text="I couldn't find any toys matching: " + str(toy_date))

    return [SlotSet("toy_date", None)]


class ActionToysByRating(Action):
  def name(self) -> Text:
    return "action_toys_by_rating"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    toy_rating = tracker.get_slot("toy_rating")
    if not toy_rating:
      dispatcher.utter_message(text="I didn't quite catch the price. Could you type it again?")
      return []

    bot_response = {"type": "toy_rating_list","data": toy_rating}
    dispatcher.utter_message(text="Here are the search results for: " + str(toy_rating), attachment = bot_response)


    return [SlotSet("toy_rating", None)]


class ActionPickToy(Action):
  def name(self) -> Text:
    return "action_pick_toy"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    picked_toy = tracker.get_slot("picked_toy")
    print("action_pick_toy, picked_toy: ", picked_toy) # DEBUG
    if not picked_toy:
      dispatcher.utter_message(text="I didn't quite catch the name. Could you type it again?")
      return []

    url="https://toy.pequla.com/api/toy"
    rsp = requests.get(url)
    toys = rsp.json()

    toysByName = [
      toy for toy in toys
      if picked_toy.lower() in toy.get("name").lower()
    ]

    if len(toysByName) > 0:
      toy = toysByName[0]
      short_url = toy.get("permalink", "")
      print(short_url)
      bot_response = {"type": "toy","data": toysByName[0]}
      dispatcher.utter_message(text="Here are the search results for: " + str(picked_toy), attachment = bot_response)
      dispatcher.utter_message(text="Is this the toy you were looking for? ")
      return [SlotSet("toy_permalink", short_url)]
    else:
      dispatcher.utter_message(text="I couldn't find any toys matching: " + str(picked_toy))


    return []


class ActionAddToCart(Action):
  def name(self) -> Text:
    return "action_add_to_cart"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    picked_toy = tracker.get_slot("picked_toy")
    print("action_pick_toy, picked_toy: ", picked_toy) # DEBUG
    dispatcher.utter_message(text="Here are some new toys: action_add_to_cart ")
    return []


class ActionShowCart(Action):
  def name(self) -> Text:
    return "action_show_cart"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    dispatcher.utter_message(text="Here are some new toys: action_show_cart ")
    return []

class ActionKeepShopping(Action):
  def name(self) -> Text:
    return "action_keep_shopping"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    dispatcher.utter_message(text="Here are some new toys: action_keep_shopping ")
    return []


class ActionOrderToys(Action):

  def name(self) -> Text:
    return "action_order_toys"

  def run(self, dispatcher: CollectingDispatcher,
          tracker: Tracker,
          domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

    dispatcher.utter_message(text="Here are some new toys: action_order_toys ")
    return []

#
# class ActionLatestMovies(Action):
#
#   def name(self) -> Text:
#     return "action_latest_movies"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     url="https://movie.pequla.com/api/movie"
#     rsp = requests.get(url)
#     movies = rsp.json()
#
#     if len(movies) >= 3:
#       bot_response = {
#         "type": "movie_list",
#         "data": movies[-3:]
#       }
#       dispatcher.utter_message(text="Here are some movies: ", attachment = bot_response)
#     else:
#       dispatcher.utter_message(text="Not enough movies found")
#
#     return []
#
# class ActionSearchMovies(Action):
#   def name(self) -> Text:
#     return "action_search_movies"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     criteria = tracker.get_slot("search_criteria")
#     url="https://movie.pequla.com/api/movie?search=" + str(criteria)
#     rsp = requests.get(url)
#     movies = rsp.json()
#
#     bot_response = {"type": "movie_list","data": movies}
#     dispatcher.utter_message(text="Here are the search results for: " + str(criteria), attachment = bot_response)
#
#     return [SlotSet("search_criteria", None)]
#
#
# class ActionGenreList(Action):
#   def name(self) -> Text:
#     return "action_genre_list"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     url="https://movie.pequla.com/api/genre"
#     rsp = requests.get(url)
#     genres = rsp.json()
#
#     bot_response = {"type": "genre_list","data": genres}
#     dispatcher.utter_message(text="Here are the available genres: ", attachment = bot_response)
#
#     return []
#
#
# class ActionActorList(Action):
#   def name(self) -> Text:
#     return "action_actor_list"
#
#   def run(self, dispatcher: CollectingDispatcher,
#         tracker: Tracker,
#         domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     url="https://movie.pequla.com/api/actor"
#     rsp = requests.get(url)
#     actors = rsp.json()
#
#     bot_response = {"type": "actor_list","data": actors}
#     dispatcher.utter_message(text="Here are the available actors: ", attachment = bot_response)
#
#     return [SlotSet("search_criteria", None)]
#
#
# class ActionDirectorList(Action):
#   def name(self) -> Text:
#     return "action_director_list"
#
#   def run(self, dispatcher: CollectingDispatcher,
#       tracker: Tracker,
#       domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     url="https://movie.pequla.com/api/director"
#     rsp = requests.get(url)
#     directors = rsp.json()
#
#     bot_response = {"type": "director_list","data": directors}
#     dispatcher.utter_message(text="Here are the available directors: ", attachment = bot_response)
#
#     return [SlotSet("search_criteria", None)]
#
# class ActionExtractMovie(Action):
#   def name(self) -> Text:
#     return "action_extract_movie"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     # debug
#     print(      "action_extract_movie -> " +
#                 "SETUP -> " +
#                 'Movie: ' +  str(tracker.get_slot("movie_permalink")) +
#                 ' Cienema: ' +  str(tracker.get_slot("cinema_id")) +
#                 ' Hall: ' +  str(tracker.get_slot("hall_id")) +
#                 ' Time: ' +  str(tracker.get_slot("time_id")) +
#                 ' Count: ' +  str(tracker.get_slot("ticket_count")))
#     criteria = tracker.get_slot("order_criteria")
#
#     if not criteria:
#       dispatcher.utter_message(text="Please specify which movie you would like to order")
#       return []
#
#     url="https://movie.pequla.com/api/movie?search=" + str(criteria)
#     rsp = requests.get(url)
#     movies = rsp.json()
#
#     if len(movies) > 0:
#       exact_movie = movies[0]
#       short_url = exact_movie.get("shortUrl", "")
#
#       print("action_extract_movie -> " + str(short_url))
#       dispatcher.utter_message(text="Selected movie: " + exact_movie['title'] + "<br/>Is this the movie you want to purchase tickets for?")
#       return [SlotSet("movie_permalink", short_url), SlotSet("order_criteria", None)]
#
#     dispatcher.utter_message(text="No movies for that criteria found :(" + str(criteria))
#     return [SlotSet("order_criteria", None)]
#
#
# class ActionListCinema(Action):
#   def name(self) -> Text:
#     return "action_list_cinema"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     bot_response = {"type": "simple_list","data": ["Usce", "Beo", "Ada Mall"]}
#     dispatcher.utter_message(text="Here are all of the available cinemas:  ", attachment = bot_response)
#
#     return []
#
#
# class ActionListHall(Action):
#   def name(self) -> Text:
#     return "action_list_hall"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     bot_response = {"type": "simple_list","data": [ "Big", "Small", "Private"]}
#     dispatcher.utter_message(text="Here are all of the available halls:  ", attachment = bot_response)
#
#     return []
#
#
# class ActionListTime(Action):
#   def name(self) -> Text:
#     return "action_list_time"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     bot_response = {"type": "simple_list","data": [ "Monday 22h", "Tuesday 17h", "Friday 13h"]}
#     dispatcher.utter_message(text="Here are all of the available screening times: ", attachment = bot_response)
#
#     return []
#
#
# class ActionSelectCinema(Action):
#   def name(self) -> Text:
#     return "action_select_cinema"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     criteria = tracker.get_slot("cinema_criteria")
#     print( "action_select_cinema -> user input " + criteria)
#     cinemas = ["Usce", "Beo", "Ada Mall"]
#     matched = []
#
#     if not criteria:
#       dispatcher.utter_message(text="Please specify which cinema you would like to book tickets for. ")
#       return []
#
#     if criteria:
#       normalized_criteria = normalize(criteria)
#       for cinema in cinemas:
#         if normalize(cinema) == normalized_criteria:
#           matched.append(cinema)
#
#     if len(matched) > 0:
#       exact_cinema = matched[0]
#       dispatcher.utter_message(text='Selected cinema: ' + exact_cinema)
#       # debug
#       print("action_select_cinema -> tracker " + str(tracker.get_slot("search_criteria")))
#       print("action_select_cinema -> " + exact_cinema)
#       return [SlotSet('cinema_id',exact_cinema)]
#
#     dispatcher.utter_message(text='No cinema for that criteria found!')
#     return []
#
#
# class ActionSelectHall(Action):
#   def name(self) -> Text:
#     return "action_select_hall"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     criteria = tracker.get_slot("hall_criteria")
#     halls = [ "Big", "Small", "Private"]
#     matched = []
#
#     if not criteria:
#       dispatcher.utter_message(text="Please specify which hall you would like to book tickets for. ")
#       return []
#
#     if criteria:
#       normalized_criteria = normalize(criteria)
#       for hall in halls:
#         if normalize(hall) == normalized_criteria:
#           matched.append(hall)
#
#     if len(matched) > 0:
#       exact_hall = matched[0]
#       dispatcher.utter_message(text='Selected hall: '+ exact_hall)
#       print("action_select_hall -> " + exact_hall)
#       return [SlotSet('hall_id', exact_hall)]
#
#     dispatcher.utter_message(text='No halls for that criteria found!')
#     return []
#
#
# class ActionSelectTime(Action):
#   def name(self) -> Text:
#     return "action_select_time"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     criteria = tracker.get_slot("time_criteria")
#     times = [ "Monday 22h", "Tuesday 17h", "Friday 13h"]
#     matched = []
#
#     if not criteria:
#       dispatcher.utter_message(text="Please specify which showing you would like to book tickets for. ")
#       return []
#
#     if criteria:
#       normalized_criteria = normalize(criteria)
#       for time in times:
#         if normalize(time) == normalized_criteria:
#           matched.append(time)
#
#     if len(matched) > 0:
#       exact_time = matched[0]
#       dispatcher.utter_message(text='Selected showing: '+ exact_time)
#       print("action_select_time -> " + exact_time)
#       return [SlotSet('time_id', exact_time)]
#
#     dispatcher.utter_message(text='No showings for that criteria found!')
#     return []
#
#
# class ActionSelectCount(Action):
#   def name(self) -> Text:
#     return "action_select_count"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     criteria = tracker.get_slot("count_criteria")
#     dispatcher.utter_message(text='Selected number of tickets: '+ criteria)
#     print("action_select_cinema -> " + criteria)
#     return [SlotSet('ticket_count',criteria)]
#
# class ActionListOrder(Action):
#   def name(self) -> Text:
#     return "action_list_order"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     order_list= [
#       'Movie: ' +  tracker.get_slot("movie_permalink"),
#       'Cienema: ' +  tracker.get_slot("cinema_id"),
#       'Hall: ' +  tracker.get_slot("hall_id"),
#       'Time: ' +  tracker.get_slot("time_id"),
#       'Count: ' +  tracker.get_slot("ticket_count"),
#       ]
#
#
#
#     dispatcher.utter_message(
#       text='This is your current order:',
#       attachment={
#         "type": "simple_list",
#         "data": order_list
#       }
#     )
#     return []
#
#
# class ActionPlaceOrder(Action):
#   def name(self) -> Text:
#     return "action_place_order"
#
#   def run(self, dispatcher: CollectingDispatcher,
#           tracker: Tracker,
#           domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#     order_details= {
#       "movie": tracker.get_slot("movie_permalink"),
#       "cinema": tracker.get_slot("cinema_id"),
#       "hall":  tracker.get_slot("hall_id"),
#       "time": tracker.get_slot("time_id"),
#       "count": tracker.get_slot("ticket_count")
#     }
#
#     dispatcher.utter_message(
#       text='Your order has been placed:',
#       attachment={
#         "type": "create_order",
#         "data": order_details
#       }
#     )
#
#     # debug
#     print(      "action_place_order -> " +
#                 'Movie: ' +  str(tracker.get_slot("movie_permalink")) +
#                 ' Cienema: ' +  str(tracker.get_slot("cinema_id")) +
#                 ' Hall: ' +  str(tracker.get_slot("hall_id")) +
#                 ' Time: ' +  str(tracker.get_slot("time_id")) +
#                 ' Count: ' +  str(tracker.get_slot("ticket_count")))
#

    # dodato da radi vise ordera unutar jedne sesije - nasla sam cistiji nacin

    # return [
    #   SlotSet("order_criteria", None),
    #   SlotSet("movie_permalink", None),
    #   SlotSet("cinema_criteria", None),
    #   SlotSet("cinema_id", None),
    #   SlotSet("hall_criteria", None),
    #   SlotSet("hall_id", None),
    #   SlotSet("time_criteria", None),
    #   SlotSet("time_id", None),
    #   SlotSet("count_criteria", None),
    #   SlotSet("ticket_count", None)
    # ]

    return [Restarted()]
