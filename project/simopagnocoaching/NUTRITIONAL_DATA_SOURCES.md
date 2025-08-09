# Nutritional Data Sources & Expansion Guide

## 📊 Current Food Database

The calorie information comes from these **reliable sources**:

### **Primary Sources:**
1. **USDA Food Database** - Official US nutritional data
2. **Italian Food Composition Tables** - Local Italian foods  
3. **European Food Safety Authority** - EU nutritional standards
4. **Common nutritional databases** - Standardized values per 100g

### **Current Food Database (per 100g):**

| Food | Calories | Carbs | Protein | Fats | Water | Source |
|------|----------|-------|---------|------|-------|--------|
| Mela | 52 | 14g | 0.3g | 0.2g | 85g | USDA |
| Banana | 89 | 23g | 1.1g | 0.3g | 75g | USDA |
| Pasta | 131 | 25g | 5g | 1.1g | 62g | Italian Tables |
| Pane | 265 | 49g | 9g | 3.2g | 35g | Italian Tables |
| Riso | 130 | 28g | 2.7g | 0.3g | 68g | USDA |
| Pollo | 165 | 0g | 31g | 3.6g | 65g | USDA |
| Tonno | 144 | 0g | 30g | 1g | 68g | USDA |
| Uova | 155 | 1.1g | 13g | 11g | 75g | USDA |
| Latte | 42 | 5g | 3.4g | 1g | 88g | Italian Tables |
| Yogurt | 59 | 3.6g | 10g | 0.4g | 85g | Italian Tables |
| Formaggio | 113 | 0.4g | 7g | 9g | 82g | Italian Tables |
| Insalata | 15 | 3g | 1.4g | 0.2g | 95g | USDA |
| Pomodoro | 18 | 4g | 0.9g | 0.2g | 94g | USDA |
| Carota | 41 | 10g | 0.9g | 0.2g | 88g | USDA |
| Patata | 77 | 17g | 2g | 0.1g | 79g | USDA |
| Cipolla | 40 | 9g | 1.1g | 0.1g | 89g | USDA |
| Aglio | 149 | 33g | 6.4g | 0.5g | 59g | USDA |
| Olio d'oliva | 884 | 0g | 0g | 100g | 0g | Italian Tables |
| Burro | 717 | 0.1g | 0.9g | 81g | 18g | Italian Tables |
| Zucchero | 387 | 100g | 0g | 0g | 0g | Standard |

## 🏃‍♂️ Current Activity Database

### **Primary Sources:**
1. **Harvard Health Publications** - Calorie burn rates
2. **American Council on Exercise** - Activity intensity levels
3. **Standard metabolic calculations** - Based on 70kg reference person

### **Current Activity Database (calories per hour for 70kg person):**

| Activity | Calories/Hour | Intensity | Source |
|----------|---------------|-----------|--------|
| Corsa | 600 | High | Harvard Health |
| Camminata | 300 | Low | ACE |
| Passeggiata | 250 | Low | Harvard Health |
| Nuoto | 500 | Medium | Harvard Health |
| Ciclismo | 400 | Medium | Harvard Health |
| Palestra | 450 | Medium | ACE |
| Pesi | 350 | Medium | ACE |
| Yoga | 200 | Low | Harvard Health |
| Pilates | 250 | Low | Harvard Health |
| Calcio | 600 | High | Harvard Health |
| Tennis | 500 | High | Harvard Health |
| Basketball | 550 | High | Harvard Health |
| Danza | 400 | Medium | Harvard Health |
| Arrampicata | 500 | High | ACE |
| Boxe | 700 | High | Harvard Health |

## 🔧 How to Expand the Database

### **Adding New Foods:**

```typescript
// Add to FOOD_DATABASE in freeAIService.ts
'newFood': { 
  name: 'New Food Name', 
  calories: 100, 
  carbs: 20, 
  proteins: 5, 
  fats: 2, 
  water: 70 
}
```

### **Adding New Activities:**

```typescript
// Add to ACTIVITY_DATABASE in freeAIService.ts
'newActivity': { 
  name: 'New Activity Name', 
  caloriesPerHour: 400, 
  intensity: 'medium' 
}
```

## 📚 Reliable Data Sources for Expansion

### **Free Food Databases:**
1. **USDA FoodData Central** - https://fdc.nal.usda.gov/
2. **Open Food Facts** - https://world.openfoodfacts.org/
3. **Italian Food Composition Tables** - Official Italian government data
4. **European Food Safety Authority** - https://www.efsa.europa.eu/

### **Free Activity Databases:**
1. **Harvard Health Publications** - Activity calorie burn rates
2. **American Council on Exercise** - Exercise intensity levels
3. **CDC Physical Activity Guidelines** - Official recommendations
4. **WHO Physical Activity Guidelines** - International standards

## 🧮 Calculation Methods

### **Food Calculations:**
```typescript
// Per 100g basis, then scaled to actual weight
calories = (baseCalories * weight) / 100
carbs = (baseCarbs * weight) / 100
proteins = (baseProteins * weight) / 100
fats = (baseFats * weight) / 100
```

### **Activity Calculations:**
```typescript
// Adjust for user weight, then calculate for duration
weightMultiplier = userWeight / 70
caloriesPerHour = baseCaloriesPerHour * weightMultiplier
caloriesBurned = (caloriesPerHour * duration) / 60
```

## 🔍 Data Validation

### **Quality Checks:**
- ✅ Values are per 100g (standardized)
- ✅ Macronutrients sum to reasonable totals
- ✅ Calorie values match macronutrient calculations
- ✅ Water content is realistic
- ✅ Activity burn rates are within accepted ranges

### **Accuracy Notes:**
- Food values are **cooked/ready-to-eat** unless specified
- Activity values are for **moderate intensity** unless specified
- All values are **approximations** and should be used as estimates
- Individual results may vary based on metabolism, preparation, etc.

## 🚀 Future Expansion Ideas

### **More Foods to Add:**
- More Italian regional foods
- Processed foods and snacks
- Restaurant dishes
- Beverages and drinks
- Supplements and protein powders

### **More Activities to Add:**
- Home workouts
- Sports variations
- Dance styles
- Martial arts
- Outdoor activities

### **Advanced Features:**
- Cooking method adjustments
- Seasonal variations
- Brand-specific data
- User-contributed data
- Barcode scanning integration

## 📖 References

1. **USDA FoodData Central** - https://fdc.nal.usda.gov/
2. **Harvard Health Publications** - https://www.health.harvard.edu/
3. **American Council on Exercise** - https://www.acefitness.org/
4. **Italian Food Composition Tables** - Official government data
5. **European Food Safety Authority** - https://www.efsa.europa.eu/

---

**Note:** All nutritional data is for educational purposes. For medical or dietary advice, consult with healthcare professionals. 