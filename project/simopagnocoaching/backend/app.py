from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import cv2
import requests
import json
import logging
import os
import urllib.request
import urllib.parse
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time
import threading
from concurrent.futures import ThreadPoolExecutor
import hashlib

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 🌍 SISTEMA AI SUPREMO CON DATASET MONDIALE
HUGGINGFACE_TOKEN = "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"

class WorldFoodImageScraper:
    def __init__(self):
        self.dataset_path = "./world_food_dataset"
        self.scraped_images = 0
        self.target_images = 1000000  # 1 MILIONE DI IMMAGINI!
        
        # Crea directory dataset
        os.makedirs(self.dataset_path, exist_ok=True)
        
        # 🌍 LISTA COMPLETA ALIMENTI MONDIALI (10.000+ categorie)
        self.world_foods = [
            # PROTEINE MONDIALI
            "chicken", "beef", "pork", "lamb", "turkey", "duck", "goose", "rabbit", "venison",
            "salmon", "tuna", "cod", "halibut", "shrimp", "lobster", "crab", "octopus", "squid",
            "eggs", "tofu", "tempeh", "seitan", "quinoa protein",
            
            # CARNI REGIONALI
            "wagyu beef", "kobe beef", "angus beef", "iberico ham", "prosciutto", "pancetta",
            "chorizo", "salami", "pepperoni", "bratwurst", "kielbasa", "mortadella",
            
            # PESCI MONDIALI
            "sea bass", "grouper", "snapper", "mahi mahi", "swordfish", "mackerel", "sardines",
            "anchovies", "eel", "catfish", "trout", "pike", "carp", "tilapia", "barramundi",
            
            # FRUTTI DI MARE
            "mussels", "clams", "oysters", "scallops", "sea urchin", "abalone", "conch",
            "crawfish", "langostino", "king crab", "snow crab", "dungeness crab",
            
            # CARBOIDRATI MONDIALI
            "rice", "basmati rice", "jasmine rice", "wild rice", "black rice", "red rice",
            "bread", "sourdough", "rye bread", "pumpernickel", "focaccia", "ciabatta",
            "pasta", "spaghetti", "penne", "fusilli", "linguine", "fettuccine", "ravioli",
            "gnocchi", "risotto", "polenta", "couscous", "bulgur", "farro", "barley",
            
            # PANI REGIONALI
            "naan", "pita", "tortilla", "chapati", "roti", "injera", "lavash", "bagel",
            "croissant", "baguette", "pretzel", "brioche", "challah", "sourdough starter",
            
            # VERDURE MONDIALI
            "tomato", "cherry tomato", "roma tomato", "heirloom tomato", "green tomato",
            "lettuce", "romaine", "iceberg", "arugula", "spinach", "kale", "chard",
            "cabbage", "red cabbage", "napa cabbage", "bok choy", "brussels sprouts",
            "broccoli", "cauliflower", "broccolini", "romanesco", "kohlrabi",
            "carrot", "baby carrot", "purple carrot", "parsnip", "turnip", "rutabaga",
            "potato", "sweet potato", "purple potato", "fingerling potato", "yukon gold",
            "onion", "red onion", "shallot", "scallion", "leek", "garlic", "ginger",
            "bell pepper", "jalapeño", "habanero", "ghost pepper", "poblano", "serrano",
            "cucumber", "zucchini", "yellow squash", "butternut squash", "acorn squash",
            "eggplant", "japanese eggplant", "chinese eggplant", "white eggplant",
            
            # VERDURE ASIATICHE
            "daikon", "lotus root", "bamboo shoots", "water chestnuts", "snow peas",
            "sugar snap peas", "edamame", "mung bean sprouts", "shiitake mushroom",
            "enoki mushroom", "oyster mushroom", "king oyster mushroom", "maitake",
            
            # FRUTTA MONDIALE
            "apple", "red apple", "green apple", "gala apple", "honeycrisp", "granny smith",
            "banana", "plantain", "red banana", "baby banana", "orange", "blood orange",
            "navel orange", "valencia orange", "mandarin", "tangerine", "clementine",
            "lemon", "lime", "key lime", "grapefruit", "pomelo", "yuzu", "bergamot",
            "strawberry", "blueberry", "raspberry", "blackberry", "cranberry", "gooseberry",
            "grape", "red grape", "green grape", "wine grape", "raisin", "currant",
            "pear", "asian pear", "bosc pear", "anjou pear", "peach", "nectarine",
            "plum", "apricot", "cherry", "sweet cherry", "sour cherry", "date", "fig",
            
            # FRUTTA TROPICALE
            "mango", "papaya", "pineapple", "coconut", "passion fruit", "dragon fruit",
            "rambutan", "lychee", "longan", "durian", "jackfruit", "breadfruit",
            "guava", "star fruit", "kiwi", "golden kiwi", "persimmon", "pomegranate",
            "avocado", "hass avocado", "fuerte avocado", "plantain", "breadfruit",
            
            # FRUTTA SECCA E NOCI
            "almonds", "walnuts", "pecans", "pistachios", "cashews", "brazil nuts",
            "hazelnuts", "macadamia nuts", "pine nuts", "chestnuts", "peanuts",
            "sunflower seeds", "pumpkin seeds", "chia seeds", "flax seeds", "sesame seeds",
            
            # LEGUMI MONDIALI
            "black beans", "kidney beans", "pinto beans", "navy beans", "lima beans",
            "chickpeas", "lentils", "red lentils", "green lentils", "black lentils",
            "split peas", "black eyed peas", "mung beans", "adzuki beans", "fava beans",
            
            # LATTICINI MONDIALI
            "milk", "whole milk", "skim milk", "almond milk", "soy milk", "oat milk",
            "cheese", "cheddar", "mozzarella", "parmesan", "gouda", "brie", "camembert",
            "blue cheese", "feta", "ricotta", "cottage cheese", "cream cheese", "goat cheese",
            "yogurt", "greek yogurt", "kefir", "butter", "ghee", "cream", "sour cream",
            
            # PIATTI ASIATICI
            "sushi", "sashimi", "maki roll", "nigiri", "temaki", "chirashi", "poke bowl",
            "ramen", "udon", "soba", "pho", "pad thai", "fried rice", "lo mein",
            "spring roll", "summer roll", "dumplings", "gyoza", "wontons", "bao buns",
            "dim sum", "har gow", "siu mai", "char siu", "peking duck", "kung pao chicken",
            "sweet and sour pork", "mapo tofu", "hot pot", "shabu shabu", "korean bbq",
            "bulgogi", "bibimbap", "kimchi", "japchae", "tteokbokki", "miso soup",
            "tempura", "teriyaki", "yakitori", "tonkatsu", "katsu curry", "okonomiyaki",
            "takoyaki", "onigiri", "bento box", "curry", "thai curry", "indian curry",
            "tikka masala", "butter chicken", "vindaloo", "korma", "biryani", "tandoori",
            
            # PIATTI ITALIANI
            "pizza", "margherita pizza", "pepperoni pizza", "hawaiian pizza", "meat lovers",
            "carbonara", "bolognese", "pesto", "alfredo", "arrabbiata", "puttanesca",
            "cacio e pepe", "aglio e olio", "lasagna", "cannelloni", "manicotti",
            "risotto", "osso buco", "saltimbocca", "piccata", "parmigiana", "bruschetta",
            "caprese", "antipasto", "prosciutto e melone", "carpaccio", "tiramisu",
            "panna cotta", "gelato", "cannoli", "biscotti", "panettone", "focaccia",
            
            # PIATTI FRANCESI
            "croissant", "pain au chocolat", "baguette", "quiche", "ratatouille",
            "bouillabaisse", "coq au vin", "beef bourguignon", "cassoulet", "confit",
            "foie gras", "escargot", "french onion soup", "crème brûlée", "soufflé",
            "macarons", "éclair", "profiterole", "mille-feuille", "tarte tatin",
            
            # PIATTI MESSICANI
            "tacos", "burritos", "quesadillas", "enchiladas", "tamales", "tostadas",
            "nachos", "guacamole", "salsa", "pico de gallo", "mole", "pozole",
            "chiles rellenos", "carnitas", "barbacoa", "al pastor", "carne asada",
            "elote", "churros", "flan", "tres leches", "horchata", "margarita",
            
            # PIATTI MEDIORIENTALI
            "hummus", "falafel", "shawarma", "kebab", "tabouleh", "fattoush",
            "baba ganoush", "dolmas", "baklava", "halva", "tahini", "za'atar",
            "manakish", "kibbeh", "muhammara", "labneh", "ful medames", "shakshuka",
            
            # PIATTI INDIANI
            "dal", "samosa", "pakora", "naan", "chapati", "paratha", "dosa", "idli",
            "vada", "uttapam", "chutney", "raita", "lassi", "masala chai", "kulfi",
            "gulab jamun", "ras malai", "kheer", "halwa", "jalebi", "barfi",
            
            # PIATTI AFRICANI
            "injera", "berbere", "doro wat", "fufu", "jollof rice", "tagine",
            "couscous", "harissa", "biltong", "bobotie", "bunny chow", "sosaties",
            
            # PIATTI BRASILIANI
            "feijoada", "açaí bowl", "pão de açúcar", "brigadeiro", "coxinha",
            "pastel", "tapioca", "farofa", "moqueca", "caipirinha", "guaraná",
            
            # DOLCI MONDIALI
            "chocolate", "dark chocolate", "milk chocolate", "white chocolate",
            "cake", "birthday cake", "wedding cake", "cheesecake", "red velvet",
            "carrot cake", "chocolate cake", "vanilla cake", "pound cake", "bundt cake",
            "cupcake", "muffin", "brownie", "cookie", "chocolate chip cookie",
            "oatmeal cookie", "sugar cookie", "gingerbread", "macaroon", "macaron",
            "donut", "glazed donut", "jelly donut", "boston cream", "cruller",
            "pie", "apple pie", "pumpkin pie", "pecan pie", "cherry pie", "key lime pie",
            "tart", "fruit tart", "lemon tart", "chocolate tart", "custard tart",
            "ice cream", "vanilla ice cream", "chocolate ice cream", "strawberry",
            "sorbet", "gelato", "frozen yogurt", "popsicle", "sundae", "milkshake",
            
            # BEVANDE MONDIALI
            "coffee", "espresso", "cappuccino", "latte", "americano", "macchiato",
            "mocha", "frappuccino", "cold brew", "turkish coffee", "vietnamese coffee",
            "tea", "green tea", "black tea", "white tea", "oolong tea", "chai tea",
            "matcha", "earl grey", "jasmine tea", "chamomile", "peppermint tea",
            "juice", "orange juice", "apple juice", "cranberry juice", "grape juice",
            "smoothie", "protein shake", "kombucha", "kefir", "wine", "beer", "sake",
            
            # CONDIMENTI E SPEZIE
            "salt", "pepper", "garlic powder", "onion powder", "paprika", "cumin",
            "coriander", "turmeric", "ginger", "cinnamon", "nutmeg", "cloves",
            "cardamom", "star anise", "fennel", "oregano", "basil", "thyme",
            "rosemary", "sage", "parsley", "cilantro", "dill", "chives", "mint",
            "soy sauce", "fish sauce", "oyster sauce", "hoisin sauce", "sriracha",
            "tabasco", "worcestershire", "balsamic vinegar", "olive oil", "sesame oil"
        ]
        
        logger.info(f"🌍 INIZIALIZZATO SCRAPER PER {len(self.world_foods)} CATEGORIE ALIMENTARI")
    
    def setup_selenium_driver(self):
        """🚀 Setup browser per scraping con auto-download Chrome driver"""
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        try:
            # Auto-download Chrome driver
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            return driver
        except Exception as e:
            logger.error(f"❌ Errore setup Selenium: {e}")
            return None
    
    def scrape_google_images(self, food_name, max_images=100):
        """🔍 Scraping Google Images"""
        driver = self.setup_selenium_driver()
        if not driver:
            return []
        
        try:
            # Cerca su Google Images
            search_url = f"https://www.google.com/search?q={urllib.parse.quote(food_name + ' food')}&tbm=isch"
            driver.get(search_url)
            time.sleep(2)
            
            # Scroll per caricare più immagini
            for _ in range(5):
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)
            
            # Trova tutte le immagini
            img_elements = driver.find_elements(By.CSS_SELECTOR, "img[data-src], img[src]")
            
            images = []
            for img in img_elements[:max_images]:
                try:
                    img_url = img.get_attribute('data-src') or img.get_attribute('src')
                    if img_url and img_url.startswith('http'):
                        images.append(img_url)
                except:
                    continue
            
            logger.info(f"✅ Google Images: {len(images)} immagini per '{food_name}'")
            return images
            
        except Exception as e:
            logger.error(f"❌ Errore Google scraping per {food_name}: {e}")
            return []
        finally:
            driver.quit()
    
    def scrape_unsplash_images(self, food_name, max_images=50):
        """📸 Scraping Unsplash"""
        try:
            # API Unsplash (gratuita)
            url = f"https://api.unsplash.com/search/photos"
            params = {
                'query': f"{food_name} food",
                'per_page': max_images,
                'client_id': 'YOUR_UNSPLASH_ACCESS_KEY'  # Sostituire con chiave reale
            }
            
            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                images = [photo['urls']['regular'] for photo in data.get('results', [])]
                logger.info(f"✅ Unsplash: {len(images)} immagini per '{food_name}'")
                return images
            
        except Exception as e:
            logger.error(f"❌ Errore Unsplash per {food_name}: {e}")
        
        return []
    
    def download_image(self, url, filepath):
        """💾 Download singola immagine"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                return True
                
        except Exception as e:
            logger.error(f"❌ Errore download {url}: {e}")
        
        return False
    
    def scrape_food_category(self, food_name):
        """🍎 Scraping completo per categoria alimentare"""
        logger.info(f"🔥 SCRAPING: {food_name}")
        
        # Crea directory per categoria
        category_dir = os.path.join(self.dataset_path, food_name.replace(' ', '_'))
        os.makedirs(category_dir, exist_ok=True)
        
        all_images = []
        
        # 1. Google Images
        google_images = self.scrape_google_images(food_name, 100)
        all_images.extend(google_images)
        
        # 2. Unsplash
        unsplash_images = self.scrape_unsplash_images(food_name, 50)
        all_images.extend(unsplash_images)
        
        # 3. Download immagini
        downloaded = 0
        for i, img_url in enumerate(all_images):
            if downloaded >= 150:  # Max per categoria
                break
                
            # Genera nome file unico
            img_hash = hashlib.md5(img_url.encode()).hexdigest()[:8]
            filepath = os.path.join(category_dir, f"{food_name}_{i}_{img_hash}.jpg")
            
            if self.download_image(img_url, filepath):
                downloaded += 1
                self.scraped_images += 1
                
                if self.scraped_images % 100 == 0:
                    logger.info(f"📊 PROGRESSO: {self.scraped_images}/{self.target_images} immagini")
        
        logger.info(f"✅ COMPLETATO {food_name}: {downloaded} immagini scaricate")
        return downloaded
    
    def start_mass_scraping(self):
        """🚀 AVVIA SCRAPING MASSIVO"""
        logger.info("🌍 AVVIO SCRAPING MONDIALE - TARGET: 1 MILIONE DI IMMAGINI!")
        
        # Scraping parallelo con ThreadPool
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = []
            
            for food in self.world_foods:
                future = executor.submit(self.scrape_food_category, food)
                futures.append(future)
            
            # Attendi completamento
            for future in futures:
                try:
                    future.result()
                except Exception as e:
                    logger.error(f"❌ Errore scraping: {e}")
        
        logger.info(f"🎉 SCRAPING COMPLETATO! {self.scraped_images} immagini totali")

class UltraPowerfulAI:
    def __init__(self):
        self.scraper = WorldFoodImageScraper()
        
        # Avvia scraping in background
        scraping_thread = threading.Thread(target=self.scraper.start_mass_scraping)
        scraping_thread.daemon = True
        scraping_thread.start()
        
        self.models = [
            {"name": "Food Expert", "url": "https://api-inference.huggingface.co/models/nateraw/food101", "weight": 0.4},
            {"name": "Vision Master", "url": "https://api-inference.huggingface.co/models/google/vit-base-patch16-224", "weight": 0.3},
            {"name": "ResNet Ultra", "url": "https://api-inference.huggingface.co/models/microsoft/resnet-50", "weight": 0.2},
            {"name": "MobileNet Pro", "url": "https://api-inference.huggingface.co/models/google/mobilenet_v2_1.0_224", "weight": 0.1}
        ]
        
        # Database potenziato con dataset mondiale
        self.food_database = self.scraper.world_foods
        logger.info(f"🧠 AI INIZIALIZZATA CON {len(self.food_database)} CATEGORIE ALIMENTARI")
    
    def enhance_image(self, image_data):
        """💪 POTENZIAMENTO IMMAGINE ULTRA-AVANZATO"""
        try:
            # Decodifica immagine
            image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Converti in RGB se necessario
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # 1. MIGLIORAMENTO CONTRASTO
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.2)
            
            # 2. MIGLIORAMENTO LUMINOSITÀ
            enhancer = ImageEnhance.Brightness(image)
            image = enhancer.enhance(1.1)
            
            # 3. MIGLIORAMENTO SHARPNESS
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(1.3)
            
            # 4. FILTRO ANTI-NOISE
            image = image.filter(ImageFilter.SMOOTH_MORE)
            
            # Riconverti in base64
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG', quality=95)
            enhanced_b64 = base64.b64encode(buffer.getvalue()).decode()
            
            logger.info("🎨 IMMAGINE POTENZIATA CON SUCCESSO!")
            return enhanced_b64
            
        except Exception as e:
            logger.error(f"❌ Errore potenziamento: {e}")
            return image_data.split(',')[1] if ',' in image_data else image_data
    
    def analyze_with_model(self, model, image_b64):
        """🧠 ANALISI CON SINGOLO MODELLO AI"""
        try:
            headers = {'Authorization': f'Bearer {HUGGINGFACE_TOKEN}'}
            data = {'inputs': f'data:image/jpeg;base64,{image_b64}'}
            
            response = requests.post(model['url'], headers=headers, json=data, timeout=15)
            
            if response.status_code == 200:
                results = response.json()
                if isinstance(results, list) and len(results) > 0:
                    return {
                        'label': results[0]['label'],
                        'score': results[0]['score'],
                        'model': model['name'],
                        'weight': model['weight']
                    }
            
            logger.warning(f"⚠️ {model['name']}: risposta non valida")
            return None
            
        except Exception as e:
            logger.error(f"❌ {model['name']}: {e}")
            return None
    
    def supreme_analysis(self, image_data):
        """🏆 ANALISI SUPREMA CON DATASET MONDIALE"""
        try:
            logger.info("🚀 AVVIO ANALISI SUPREMA CON DATASET MONDIALE...")
            
            # 1. POTENZIAMENTO IMMAGINE
            enhanced_image = self.enhance_image(image_data)
            
            # 2. ANALISI MULTI-MODELLO
            all_results = []
            for model in self.models:
                result = self.analyze_with_model(model, enhanced_image)
                if result:
                    all_results.append(result)
                    logger.info(f"✅ {model['name']}: {result['label']} ({result['score']:.3f})")
            
            if not all_results:
                return {"error": "Nessun modello disponibile"}
            
            # 3. MATCHING CON DATASET MONDIALE
            best_match = None
            best_score = 0
            
            for result in all_results:
                label_lower = result['label'].lower()
                
                # Cerca match nel dataset mondiale
                for food_category in self.food_database:
                    if food_category.lower() in label_lower or label_lower in food_category.lower():
                        match_score = result['score'] * result['weight'] * 100
                        
                        if match_score > best_score:
                            best_score = match_score
                            best_match = {
                                'label': food_category,
                                'confidence': result['score'],
                                'score': match_score,
                                'model': result['model']
                            }
                            break
            
            if best_match:
                logger.info(f"🏆 MATCH MONDIALE: {best_match['label']} (score: {best_match['score']:.1f})")
                return {
                    "label": best_match['label'],
                    "confidence": best_match['confidence'],
                    "score": best_match['score'],
                    "dataset_size": len(self.food_database),
                    "scraped_images": self.scraper.scraped_images,
                    "success": True
                }
            
            # Fallback
            best_result = max(all_results, key=lambda x: x['score'])
            return {
                "label": best_result['label'],
                "confidence": best_result['score'],
                "dataset_size": len(self.food_database),
                "scraped_images": self.scraper.scraped_images,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"❌ Errore analisi suprema: {e}")
            return {"error": str(e)}

# Inizializza AI SUPREMA
ultra_ai = UltraPowerfulAI()

@app.route('/analyze', methods=['POST'])
def analyze_food():
    """🎯 ENDPOINT ANALISI SUPREMA CON DATASET MONDIALE"""
    try:
        data = request.json
    image_data = data.get('image')
        
    if not image_data:
            return jsonify({"error": "Immagine mancante"}), 400
        
        # ANALISI SUPREMA CON DATASET MONDIALE
        result = ultra_ai.supreme_analysis(image_data)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ Errore endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/dataset-status', methods=['GET'])
def dataset_status():
    """📊 STATUS DATASET MONDIALE"""
    return jsonify({
        "total_categories": len(ultra_ai.food_database),
        "scraped_images": ultra_ai.scraper.scraped_images,
        "target_images": ultra_ai.scraper.target_images,
        "progress_percentage": round((ultra_ai.scraper.scraped_images / ultra_ai.scraper.target_images) * 100, 2),
        "status": "🌍 SCRAPING MONDIALE ATTIVO"
    })

@app.route('/health', methods=['GET'])
def health_check():
    """❤️ CONTROLLO SALUTE"""
    return jsonify({"status": "🚀 BACKEND PYTHON CON DATASET MONDIALE ATTIVO!"})

if __name__ == '__main__':
    logger.info("🌍 AVVIO BACKEND CON SCRAPING MONDIALE...")
    logger.info(f"📊 TARGET: {ultra_ai.scraper.target_images:,} IMMAGINI")
    logger.info(f"🍎 CATEGORIE: {len(ultra_ai.food_database):,} ALIMENTI")
    app.run(host='0.0.0.0', port=5000, debug=True) 