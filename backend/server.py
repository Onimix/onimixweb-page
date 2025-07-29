from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from enum import Enum
import re

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
    DRAFTS = "drafts"
    COLLABORATIONS = "collaborations"

class ProductCategory(str, Enum):
    TECH_TOOLS = "tech_tools"
    SONG_RECORDS = "song_records"
    BEATS = "beats"
    SAMPLES = "samples"
    MERCH = "merch"

class ProductType(str, Enum):
    DIGITAL = "digital"
    PHYSICAL = "physical"
    SUBSCRIPTION = "subscription"

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# Advanced Models
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
    word_count: int = 0
    line_count: int = 0
    rhyme_scheme: Optional[str] = None
    bpm: Optional[int] = None
    key: Optional[str] = None
    mood: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    collaborators: List[str] = []
    recording_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_edited_at: datetime = Field(default_factory=datetime.utcnow)
    is_complete: bool = False
    is_recorded: bool = False
    is_published: bool = False
    plays_count: int = 0
    likes_count: int = 0

class VerseCreate(BaseModel):
    title: str
    lyrics: str
    category: VerseCategory
    beat_external_link: Optional[str] = None
    beat_name: Optional[str] = None
    tags: List[str] = []
    notes: Optional[str] = None
    bpm: Optional[int] = None
    key: Optional[str] = None
    mood: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    collaborators: List[str] = []
    recording_notes: Optional[str] = None
    is_complete: bool = False

class VerseUpdate(BaseModel):
    title: Optional[str] = None
    lyrics: Optional[str] = None
    category: Optional[VerseCategory] = None
    beat_external_link: Optional[str] = None
    beat_name: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    bpm: Optional[int] = None
    key: Optional[str] = None
    mood: Optional[str] = None
    priority: Optional[Priority] = None
    collaborators: Optional[List[str]] = None
    recording_notes: Optional[str] = None
    is_complete: Optional[bool] = None
    is_recorded: Optional[bool] = None
    is_published: Optional[bool] = None

class Beat(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    producer: Optional[str] = None
    bpm: Optional[int] = None
    key: Optional[str] = None
    genre: Optional[str] = None
    mood: Optional[str] = None
    file_url: Optional[str] = None
    external_link: Optional[str] = None
    duration: Optional[int] = None  # in seconds
    tags: List[str] = []
    price: Optional[float] = None
    is_free: bool = True
    download_count: int = 0
    rating: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BeatCreate(BaseModel):
    name: str
    producer: Optional[str] = None
    bpm: Optional[int] = None
    key: Optional[str] = None
    genre: Optional[str] = None
    mood: Optional[str] = None
    external_link: Optional[str] = None
    duration: Optional[int] = None
    tags: List[str] = []
    price: Optional[float] = None
    is_free: bool = True

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: ProductCategory
    product_type: ProductType
    image_url: Optional[str] = None
    gallery_urls: List[str] = []
    download_url: Optional[str] = None
    stock_quantity: int = 0
    sold_count: int = 0
    rating: float = 0.0
    review_count: int = 0
    tags: List[str] = []
    features: List[str] = []
    requirements: List[str] = []
    is_active: bool = True
    is_featured: bool = False
    discount_percentage: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: ProductCategory
    product_type: ProductType
    image_url: Optional[str] = None
    gallery_urls: List[str] = []
    download_url: Optional[str] = None
    stock_quantity: int = 0
    tags: List[str] = []
    features: List[str] = []
    requirements: List[str] = []
    is_featured: bool = False
    discount_percentage: float = 0.0

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    customer_name: str
    customer_email: str
    rating: int = Field(ge=1, le=5)
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_verified: bool = False

class ReviewCreate(BaseModel):
    product_id: str
    customer_name: str
    customer_email: str
    rating: int = Field(ge=1, le=5)
    comment: str

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"ONX-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}")
    customer_email: str
    customer_name: str
    customer_phone: Optional[str] = None
    shipping_address: Optional[Dict[str, str]] = None
    products: List[dict]  # List of {product_id, quantity, price, product_name}
    total_amount: float
    tax_amount: float = 0.0
    shipping_cost: float = 0.0
    discount_amount: float = 0.0
    final_amount: float
    status: OrderStatus = OrderStatus.PENDING
    payment_method: Optional[str] = None
    stripe_payment_id: Optional[str] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

class OrderCreate(BaseModel):
    customer_email: str
    customer_name: str
    customer_phone: Optional[str] = None
    shipping_address: Optional[Dict[str, str]] = None
    products: List[dict]
    payment_method: Optional[str] = None

class AnalyticsData(BaseModel):
    total_verses: int
    total_products: int
    total_orders: int
    total_revenue: float
    verse_by_category: Dict[str, int]
    products_by_category: Dict[str, int]
    orders_by_status: Dict[str, int]
    monthly_revenue: List[Dict[str, Any]]
    top_selling_products: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]

# Helper Functions
def calculate_word_count(lyrics: str) -> int:
    return len(lyrics.split())

def calculate_line_count(lyrics: str) -> int:
    return len([line for line in lyrics.split('\n') if line.strip()])

def analyze_rhyme_scheme(lyrics: str) -> str:
    # Simple rhyme scheme analysis (can be enhanced)
    lines = [line.strip() for line in lyrics.split('\n') if line.strip()]
    if len(lines) < 2:
        return "N/A"
    
    # Basic pattern detection (AABB, ABAB, etc.)
    return "ABAB"  # Placeholder - would need more sophisticated analysis

# VERSE ENDPOINTS
@api_router.post("/verses", response_model=Verse)
async def create_verse(verse: VerseCreate):
    verse_dict = verse.dict()
    
    # Calculate metrics
    verse_dict["word_count"] = calculate_word_count(verse.lyrics)
    verse_dict["line_count"] = calculate_line_count(verse.lyrics)
    verse_dict["rhyme_scheme"] = analyze_rhyme_scheme(verse.lyrics)
    
    verse_obj = Verse(**verse_dict)
    result = await db.verses.insert_one(verse_obj.dict())
    return verse_obj

@api_router.get("/verses", response_model=List[Verse])
async def get_verses(
    category: Optional[VerseCategory] = None,
    search: Optional[str] = None,
    priority: Optional[Priority] = None,
    tags: Optional[str] = None,
    limit: int = Query(100, le=1000),
    skip: int = Query(0, ge=0)
):
    query = {}
    
    if category:
        query["category"] = category
    if priority:
        query["priority"] = priority
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"lyrics": {"$regex": search, "$options": "i"}},
            {"tags": {"$in": [search]}},
            {"beat_name": {"$regex": search, "$options": "i"}}
        ]
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    verses = await db.verses.find(query).sort("updated_at", -1).skip(skip).limit(limit).to_list(limit)
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
    update_data["last_edited_at"] = datetime.utcnow()
    update_data["version"] = verse.get("version", 1) + 1
    
    # Recalculate metrics if lyrics changed
    if "lyrics" in update_data:
        update_data["word_count"] = calculate_word_count(update_data["lyrics"])
        update_data["line_count"] = calculate_line_count(update_data["lyrics"])
        update_data["rhyme_scheme"] = analyze_rhyme_scheme(update_data["lyrics"])
    
    await db.verses.update_one({"id": verse_id}, {"$set": update_data})
    
    updated_verse = await db.verses.find_one({"id": verse_id})
    return Verse(**updated_verse)

@api_router.delete("/verses/{verse_id}")
async def delete_verse(verse_id: str):
    result = await db.verses.delete_one({"id": verse_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Verse not found")
    return {"message": "Verse deleted successfully"}

@api_router.post("/verses/bulk-delete")
async def bulk_delete_verses(verse_ids: List[str]):
    result = await db.verses.delete_many({"id": {"$in": verse_ids}})
    return {"message": f"Deleted {result.deleted_count} verses"}

@api_router.get("/verses/{verse_id}/export")
async def export_verse(verse_id: str, format: str = "txt"):
    verse = await db.verses.find_one({"id": verse_id})
    if not verse:
        raise HTTPException(status_code=404, detail="Verse not found")
    
    if format == "txt":
        content = f"Title: {verse['title']}\n"
        content += f"Category: {verse['category']}\n"
        content += f"Beat: {verse.get('beat_name', 'N/A')}\n"
        content += f"BPM: {verse.get('bpm', 'N/A')}\n"
        content += f"Key: {verse.get('key', 'N/A')}\n"
        content += f"Word Count: {verse.get('word_count', 0)}\n"
        content += f"Line Count: {verse.get('line_count', 0)}\n"
        content += "\n--- LYRICS ---\n"
        content += verse['lyrics']
        content += "\n\n--- NOTES ---\n"
        content += verse.get('notes', 'No notes')
        
        return {"content": content, "filename": f"{verse['title']}.txt"}
    
    return {"error": "Unsupported format"}

# BEAT ENDPOINTS
@api_router.post("/beats", response_model=Beat)
async def create_beat(beat: BeatCreate):
    beat_dict = beat.dict()
    beat_obj = Beat(**beat_dict)
    result = await db.beats.insert_one(beat_obj.dict())
    return beat_obj

@api_router.get("/beats", response_model=List[Beat])
async def get_beats(
    genre: Optional[str] = None,
    mood: Optional[str] = None,
    bpm_min: Optional[int] = None,
    bpm_max: Optional[int] = None,
    is_free: Optional[bool] = None,
    limit: int = Query(100, le=1000)
):
    query = {}
    
    if genre:
        query["genre"] = {"$regex": genre, "$options": "i"}
    if mood:
        query["mood"] = {"$regex": mood, "$options": "i"}
    if is_free is not None:
        query["is_free"] = is_free
    if bpm_min or bpm_max:
        bpm_query = {}
        if bpm_min:
            bpm_query["$gte"] = bpm_min
        if bpm_max:
            bpm_query["$lte"] = bpm_max
        query["bpm"] = bpm_query
    
    beats = await db.beats.find(query).sort("created_at", -1).limit(limit).to_list(limit)
    return [Beat(**beat) for beat in beats]

# PRODUCT ENDPOINTS (Enhanced)
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    result = await db.products.insert_one(product_obj.dict())
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[ProductCategory] = None,
    product_type: Optional[ProductType] = None,
    is_featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    tags: Optional[str] = None,
    active_only: bool = True,
    limit: int = Query(100, le=1000)
):
    query = {}
    
    if category:
        query["category"] = category
    if product_type:
        query["product_type"] = product_type
    if is_featured is not None:
        query["is_featured"] = is_featured
    if active_only:
        query["is_active"] = True
    if min_price or max_price:
        price_query = {}
        if min_price:
            price_query["$gte"] = min_price
        if max_price:
            price_query["$lte"] = max_price
        query["price"] = price_query
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    products = await db.products.find(query).sort("created_at", -1).limit(limit).to_list(limit)
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

# REVIEW ENDPOINTS
@api_router.post("/reviews", response_model=Review)
async def create_review(review: ReviewCreate):
    review_dict = review.dict()  
    review_obj = Review(**review_dict)
    result = await db.reviews.insert_one(review_obj.dict())
    
    # Update product rating
    reviews = await db.reviews.find({"product_id": review.product_id}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    await db.products.update_one(
        {"id": review.product_id},
        {"$set": {"rating": round(avg_rating, 1), "review_count": len(reviews)}}
    )
    
    return review_obj

@api_router.get("/reviews/product/{product_id}", response_model=List[Review])
async def get_product_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}).sort("created_at", -1).to_list(1000)
    return [Review(**review) for review in reviews]

# ORDER ENDPOINTS (Enhanced)
@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    # Calculate amounts
    total_amount = 0
    enhanced_products = []
    
    for item in order.products:
        product = await db.products.find_one({"id": item["product_id"]})
        if product:
            item_total = product["price"] * item["quantity"]
            discount = item_total * (product.get("discount_percentage", 0) / 100)
            final_price = product["price"] - (product["price"] * product.get("discount_percentage", 0) / 100)
            
            enhanced_products.append({
                **item,
                "product_name": product["name"],
                "unit_price": product["price"],
                "final_price": final_price,
                "discount": discount
            })
            total_amount += final_price * item["quantity"]
    
    # Calculate final amounts
    tax_amount = total_amount * 0.08  # 8% tax
    shipping_cost = 0.0 if total_amount > 50 else 9.99  # Free shipping over $50
    final_amount = total_amount + tax_amount + shipping_cost
    
    order_dict = order.dict()
    order_dict.update({
        "products": enhanced_products,
        "total_amount": total_amount,
        "tax_amount": tax_amount,
        "shipping_cost": shipping_cost,
        "final_amount": final_amount
    })
    
    order_obj = Order(**order_dict)
    result = await db.orders.insert_one(order_obj.dict())
    
    # Update product sold count
    for item in enhanced_products:
        await db.products.update_one(
            {"id": item["product_id"]},
            {"$inc": {"sold_count": item["quantity"]}}
        )
    
    return order_obj

@api_router.get("/orders", response_model=List[Order])
async def get_orders(
    status: Optional[OrderStatus] = None,
    customer_email: Optional[str] = None,
    limit: int = Query(100, le=1000)
):
    query = {}
    if status:
        query["status"] = status
    if customer_email:
        query["customer_email"] = customer_email
    
    orders = await db.orders.find(query).sort("created_at", -1).limit(limit).to_list(limit)
    return [Order(**order) for order in orders]

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, new_status: OrderStatus, tracking_number: Optional[str] = None):
    update_data = {"status": new_status, "updated_at": datetime.utcnow()}
    
    if new_status == OrderStatus.SHIPPED and tracking_number:
        update_data["tracking_number"] = tracking_number
        update_data["shipped_at"] = datetime.utcnow()
    elif new_status == OrderStatus.DELIVERED:
        update_data["delivered_at"] = datetime.utcnow()
    
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    return {"message": "Order status updated successfully"}

# ADVANCED ANALYTICS ENDPOINTS
@api_router.get("/analytics/dashboard", response_model=AnalyticsData)
async def get_analytics_dashboard():
    # Basic counts
    verse_count = await db.verses.count_documents({})
    product_count = await db.products.count_documents({"is_active": True})
    order_count = await db.orders.count_documents({})
    
    # Revenue calculation
    orders = await db.orders.find({"status": {"$in": ["paid", "shipped", "delivered"]}}).to_list(1000)
    total_revenue = sum(order.get("final_amount", 0) for order in orders)
    
    # Verse stats by category
    verse_stats = {}
    for category in VerseCategory:
        count = await db.verses.count_documents({"category": category})
        verse_stats[category.value] = count
    
    # Product stats by category
    product_stats = {}
    for category in ProductCategory:
        count = await db.products.count_documents({"category": category, "is_active": True})
        product_stats[category.value] = count
    
    # Order stats by status
    order_stats = {}
    for status in OrderStatus:
        count = await db.orders.count_documents({"status": status})
        order_stats[status.value] = count
    
    # Monthly revenue (last 6 months)
    monthly_revenue = []
    for i in range(6):
        start_date = datetime.now().replace(day=1) - timedelta(days=30*i)
        end_date = start_date.replace(day=28) + timedelta(days=4)
        end_date = end_date - timedelta(days=end_date.day)
        
        month_orders = await db.orders.find({
            "created_at": {"$gte": start_date, "$lte": end_date},
            "status": {"$in": ["paid", "shipped", "delivered"]}
        }).to_list(1000)
        
        month_revenue = sum(order.get("final_amount", 0) for order in month_orders)
        monthly_revenue.append({
            "month": start_date.strftime("%B %Y"),
            "revenue": month_revenue,
            "orders": len(month_orders)
        })
    
    # Top selling products
    products = await db.products.find({"is_active": True}).sort("sold_count", -1).limit(5).to_list(5)
    top_selling = [{"name": p["name"], "sold": p.get("sold_count", 0), "revenue": p["price"] * p.get("sold_count", 0)} for p in products]
    
    # Recent activity (last 10 activities)
    recent_verses = await db.verses.find().sort("created_at", -1).limit(3).to_list(3)
    recent_orders = await db.orders.find().sort("created_at", -1).limit(3).to_list(3)
    recent_products = await db.products.find().sort("created_at", -1).limit(2).to_list(2)
    
    recent_activity = []
    for verse in recent_verses:
        recent_activity.append({
            "type": "verse",
            "title": f"New verse: {verse['title']}",
            "date": verse["created_at"],
            "category": verse["category"]
        })
    
    for order in recent_orders:
        recent_activity.append({
            "type": "order",
            "title": f"Order {order['order_number']} - ${order.get('final_amount', 0):.2f}",
            "date": order["created_at"],
            "status": order["status"]
        })
    
    for product in recent_products:
        recent_activity.append({
            "type": "product",
            "title": f"Product added: {product['name']}",
            "date": product["created_at"],
            "category": product["category"]
        })
    
    # Sort recent activity by date
    recent_activity.sort(key=lambda x: x["date"], reverse=True)
    
    return AnalyticsData(
        total_verses=verse_count,
        total_products=product_count,
        total_orders=order_count,
        total_revenue=total_revenue,
        verse_by_category=verse_stats,
        products_by_category=product_stats,
        orders_by_status=order_stats,
        monthly_revenue=monthly_revenue,
        top_selling_products=top_selling,
        recent_activity=recent_activity[:10]
    )

@api_router.get("/analytics/verses")
async def get_verse_analytics():
    # Detailed verse analytics
    total_verses = await db.verses.count_documents({})
    completed_verses = await db.verses.count_documents({"is_complete": True})
    recorded_verses = await db.verses.count_documents({"is_recorded": True})
    published_verses = await db.verses.count_documents({"is_published": True})
    
    # Average metrics
    verses = await db.verses.find().to_list(1000)
    avg_word_count = sum(v.get("word_count", 0) for v in verses) / len(verses) if verses else 0
    avg_line_count = sum(v.get("line_count", 0) for v in verses) / len(verses) if verses else 0
    
    # Productivity over time (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_verses = await db.verses.find({"created_at": {"$gte": thirty_days_ago}}).to_list(1000)
    
    productivity = {}
    for verse in recent_verses:
        date_key = verse["created_at"].strftime("%Y-%m-%d")
        productivity[date_key] = productivity.get(date_key, 0) + 1
    
    return {
        "total_verses": total_verses,
        "completed_verses": completed_verses,
        "recorded_verses": recorded_verses,
        "published_verses": published_verses,
        "completion_rate": (completed_verses / total_verses * 100) if total_verses > 0 else 0,
        "average_word_count": round(avg_word_count, 1),
        "average_line_count": round(avg_line_count, 1),
        "daily_productivity": productivity
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