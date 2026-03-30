from abc import ABC, abstractmethod
from models.travel_schema import TravelRequestFlexible


class BaseTravelExtractor(ABC):

    @abstractmethod
    def extract(self, user_input: str) -> TravelRequestFlexible:
        pass
