import pandas as pd
from pymongo import MongoClient
from datetime import datetime
import re

# === 1. MongoDB Connection ===
client = MongoClient("mongodb://localhost:27017/")  # change if needed
db = client["mainffc"]
collection = db["vehicles"]

# === 2. Read Excel File ===
file_path = "C:\\Users\\Client\\Downloads\\Autowhat AI (2).xlsx"
df = pd.read_excel(file_path)

# === 3. Debug: Print column names to see what's available ===
print("Available columns:", df.columns.tolist())

# === 4. Function to parse date from Excel format ===
def parse_date(date_str):
    if pd.isna(date_str):
        return None
    try:
        if isinstance(date_str, str):
            date_str = date_str.strip()
            
            # Handle "Aug-24" format (Month-Year)
            if len(date_str) == 6 and '-' in date_str and date_str[0].isalpha():
                month, year = date_str.split('-')
                month_map = {
                    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                }
                month_num = month_map.get(month, 1)
                # Convert 2-digit year to 4-digit year
                year_num = 2000 + int(year) if int(year) < 50 else 1900 + int(year)
                print(f"Parsed '{date_str}' as {year_num}-{month_num:02d}-01")
                return datetime(year_num, month_num, 1)  # First day of the month
            
            # Handle "04-Jul-25" format (Day-Month-Year)
            elif len(date_str) == 8 and '-' in date_str and date_str[0].isdigit():
                day, month, year = date_str.split('-')
                month_map = {
                    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                }
                month_num = month_map.get(month, 1)
                year_num = 2000 + int(year) if int(year) < 50 else 1900 + int(year)
                print(f"Parsed '{date_str}' as {year_num}-{month_num:02d}-{int(day):02d}")
                return datetime(year_num, month_num, int(day))
            
            # Handle other date formats
            else:
                print(f"Could not parse date format: '{date_str}'")
                return None
                
        # Handle if it's already a datetime object
        elif isinstance(date_str, datetime):
            return date_str
            
    except Exception as e:
        print(f"Error parsing date '{date_str}': {e}")
        return None
    
    return None

# === 5. Function to Convert a Row to Schema ===
def row_to_document(row):
    return {
        # Basic vehicle info
        "vehicleNumber": str(row["Vehicle No"]).strip(),
        "model": str(row.get("Model", "")),
        "make": str(row.get("Make", "")),
        "companyName": str(row.get("Company Name", "")),
        
        # Location and status
        "branch": str(row.get("Location", "")),
        "status": "active",  # Default status
        
        # Physical properties
        "year": 2024,  # Default year since not in Excel
        "color": "White",  # Default color
        "fuelType": str(row.get("Fuel", "")).lower(),
        "seatingCapacity": int(row.get("Capacity", 0)) if not pd.isna(row.get("Capacity")) else 0,
        "cargoLength": int(row.get("C. LENGTH", 0)) if not pd.isna(row.get("C. LENGTH")) else 0,
        
        # Technical details
        "engineNumber": str(row.get("Engine No", "")),
        "chassisNumber": str(row.get("Chassis No", "")),
        "vehicleDetails": str(row.get("Veh. Details", "")),
        "acModel": str(row.get("AC Model", "")),
        
        # Dates
        "registrationDate": parse_date(row.get("REG. DATE")),
        "insuranceExpiry": parse_date(row.get("Insurance F")),
        "fitnessExpiry": None,
        "pucExpiry": None,
        
        # Timestamps
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }

# === 6. Convert All Rows and Insert ===
documents = [row_to_document(row) for _, row in df.iterrows()]

if documents:
    collection.insert_many(documents)
    print(f"✅ Inserted {len(documents)} vehicle records successfully!")
    print("Sample document:", documents[0])
else:
    print("⚠️ No valid records found to insert.")
