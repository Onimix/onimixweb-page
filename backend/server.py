from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="ONIMIX Artist Platform API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class VerseCategory(str, Enum):
    ALBUM = "album"
    FREESTYLE = "freestyle"
    HOOKS = "hooks"
    COMPLETE_SONGS = "complete_songs"

class ProductCategory(str, Enum):
    TECH_TOOLS = "tech_tools"
    SONG_RECORDS = "song_records"

class ProductType(str, Enum):
    DIGITAL = "digital"
    PHYSICAL = "physical"

# Models
class Verse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    lyrics: str
    category: VerseCategory
    beat_file_url: Optional[str] = None
    beat_external_link: Optional[str] = None
    beat_name: Optional[str] = None
    tags: List[str] = []
    notes: Optional[str] = None
    version: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_complete: bool = False

class VerseCreate(BaseModel):
    title: str
    lyrics: str
    category: VerseCategory
    beat_external_link: Optional[str] = None
    beat_name: Optional[str] = None
    tags: List[str] = []
    notes: Optional[str] = None
    is_complete: bool = False

class VerseUpdate(BaseModel):
    title: Optional[str] = None
    lyrics: Optional[str] = None
    category: Optional[VerseCategory] = None
    beat_external_link: Optional[str] = None
    beat_name: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    is_complete: Optional[bool] = None

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: ProductCategory
    product_type: ProductType
    image_url: Optional[str] = None
    download_url: Optional[str] = None  # For digital products
    stock_quantity: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: ProductCategory
    product_type: ProductType
    image_url: Optional[str] = None
    download_url: Optional[str] = None
    stock_quantity: int = 0

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_email: str
    customer_name: str
    products: List[dict]  # List of {product_id, quantity, price}
    total_amount: float
    status: str = "pending"  # pending, paid, shipped, completed
    stripe_payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    customer_email: str
    customer_name: str
    products: List[dict]

# VERSE ENDPOINTS
@api_router.post("/verses", response_model=Verse)
async def create_verse(verse: VerseCreate):
    verse_dict = verse.dict()
    verse_obj = Verse(**verse_dict)
    result = await db.verses.insert_one(verse_obj.dict())
    return verse_obj

@api_router.get("/verses", response_model=List[Verse])
async def get_verses(category: Optional[VerseCategory] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"lyrics": {"$regex": search, "$options": "i"}},
            {"tags": {"$in": [search]}}
        ]
    
    verses = await db.verses.find(query).sort("updated_at", -1).to_list(1000)
    return [Verse(**verse) for verse in verses]

@api_router.get("/verses/{verse_id}", response_model=Verse)
async def get_verse(verse_id: str):
    verse = await db.verses.find_one({"id": verse_id})
    if not verse:
        raise HTTPException(status_code=404, detail="Verse not found")
    return Verse(**verse)

@api_router.put("/verses/{verse_id}", response_model=Verse)
async def update_verse(verse_id: str, verse_update: VerseUpdate):
    verse = await db.verses.find_one({"id": verse_id})
    if not verse:
        raise HTTPException(status_code=404, detail="Verse not found")
    
    update_data = verse_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    update_data["version"] = verse.get("version", 1) + 1
    
    await db.verses.update_one({"id": verse_id}, {"$set": update_data})
    
    updated_verse = await db.verses.find_one({"id": verse_id})
    return Verse(**updated_verse)

@api_router.delete("/verses/{verse_id}")
async def delete_verse(verse_id: str):
    result = await db.verses.delete_one({"id": verse_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Verse not found")
    return {"message": "Verse deleted successfully"}

# PRODUCT ENDPOINTS
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    result = await db.products.insert_one(product_obj.dict())
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[ProductCategory] = None, active_only: bool = True):
    query = {}
    if category:
        query["category"] = category
    if active_only:
        query["is_active"] = True
    
    products = await db.products.find(query).sort("created_at", -1).to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: dict):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_update["updated_at"] = datetime.utcnow()
    await db.products.update_one({"id": product_id}, {"$set": product_update})
    
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)

# ORDER ENDPOINTS
@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    # Calculate total amount
    total_amount = 0
    for item in order.products:
        product = await db.products.find_one({"id": item["product_id"]})
        if product:
            total_amount += product["price"] * item["quantity"]
    
    order_dict = order.dict()
    order_dict["total_amount"] = total_amount
    order_obj = Order(**order_dict)
    result = await db.orders.insert_one(order_obj.dict())
    return order_obj

@api_router.get("/orders", response_model=List[Order])
async def get_orders():
    orders = await db.orders.find().sort("created_at", -1).to_list(1000)
    return [Order(**order) for order in orders]

# STATS ENDPOINTS
@api_router.get("/stats")
async def get_stats():
    verse_count = await db.verses.count_documents({})
    product_count = await db.products.count_documents({"is_active": True})
    order_count = await db.orders.count_documents({})
    
    # Verse stats by category
    verse_stats = {}
    for category in VerseCategory:
        count = await db.verses.count_documents({"category": category})
        verse_stats[category] = count
    
    return {
        "total_verses": verse_count,
        "total_products": product_count,
        "total_orders": order_count,
        "verse_by_category": verse_stats
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()