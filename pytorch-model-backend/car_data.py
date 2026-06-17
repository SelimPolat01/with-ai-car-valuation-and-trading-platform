from pydantic import BaseModel
from typing import Optional

class CarData(BaseModel):
    brand: str
    model: str
    model_year: int
    body_type: str
    engine_capacity: int
    horsepower: int
    transmission: str
    kilometer: int
    fuel_type: str
    trim_level: str
    price: Optional[float] = None
    has_scratch: Optional[bool] = False
    has_dent: Optional[bool] = False