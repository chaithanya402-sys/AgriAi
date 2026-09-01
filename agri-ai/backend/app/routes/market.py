from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.analytics import MarketPrice
from app.schemas.market import MarketPricesResponse, MarketPriceItem
from app.services.market import MarketService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/market", tags=["market"])
service = MarketService()


@router.get("/prices", response_model=MarketPricesResponse)
def get_market_prices(
    crop: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = service.get_prices(crop=crop)

    # Optionally persist demo rows (labeled source="demo"). Live rows are not
    # persisted here since they are a raw upstream passthrough.
    if data["demo_mode"]:
        for item in data["prices"]:
            db.add(
                MarketPrice(
                    crop=item["crop"],
                    market=item["market"],
                    price_per_tonne=item["price_per_tonne"],
                    currency=item["currency"],
                    source=item["source"],
                )
            )
        db.commit()

    items = [
        MarketPriceItem(**item)
        for item in data["prices"]
    ]
    return MarketPricesResponse(prices=items, as_of=data["as_of"], demo_mode=data["demo_mode"])
