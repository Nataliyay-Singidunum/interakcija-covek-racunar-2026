from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

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
      dispatcher.utter_message(text="Here are some movies: ", attachment = movies[-3:])
    else:
      dispatcher.utter_message(text="Not enough movies found")



    return []
