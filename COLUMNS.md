# Google Sheets Column Reference

## Sheet Setup

Create a Google Sheet with the following columns in row 1:

### Basic Information
- **A1**: Timestamp
- **B1**: Customer ID
- **C1**: Lead Date
- **D1**: Customer Name
- **E1**: Phone Number
- **F1**: Has WhatsApp
- **G1**: WhatsApp Number

### Location Information
- **H1**: District
- **I1**: City
- **J1**: Address

### Status & Service
- **K1**: Status
- **L1**: Service Type

### Additional Charges
- **M1**: Has Removals
- **N1**: Removal Charge
- **O1**: Has Additional Labor
- **P1**: Additional Labor Charge

### Ceiling Service Data
- **Q1**: Ceiling Type
- **R1**: Has Macfoil
- **S1**: Price per Sq Ft
- **T1**: Total Area
- **U1**: Total Cost

### Gutters Service Data
- **V1**: Gutters Valance B
- **W1**: B Flashing Valance B
- **X1**: Gutters
- **Y1**: Valance B
- **Z1**: B Flashing
- **AA1**: D Pipes
- **AB1**: Nozzels Count
- **AC1**: End Caps Count
- **AD1**: Chain Packets Count

### Roof Service Data
- **AE1**: Roof Type
- **AF1**: Structure Type
- **AG1**: Finish Type
- **AH1**: Material
- **AI1**: Color
- **AJ1**: Sub Option

### Quotation
- **AK1**: Quotation Number

## Data Format Examples

### Timestamp
```
2024-01-15T10:30:00.000Z
```

### Customer ID
```
A-000a01, B-123b45, etc.
```

### Lead Date
```
2024-01-15
```

### Has WhatsApp
```
"Yes" or "No"
```

### Service Type
```
"ceiling", "gutters", "roof"
```

### Status
```
"pending", "running", "complete", "cancel"
```

### Ceiling Type
```
"ELTORO", "PVC", "PANEL_FLAT", "PANEL_BOX"
```

### Price per Sq Ft
```
180, 250, 360, 430 (numbers)
```

### Total Area
```
285.5 (numbers with decimals)
```

### Gutters Measurements
```
"5' + 6' + 3'" (measurement strings)
```

### Roof Types
```
"new", "repair"
```

### Structure Types
```
"wood", "steel"
```

### Finish Types
```
"normal", "finishing"
```

### Materials
```
"ASBESTOS", "ASBESTOS_COLOR", "TILE", "AMANO_NORMAL", etc.
```

### Colors
```
"TILE_RED", "GREEN", "BROWN", "ASH"
```

## Tips

1. **Format columns appropriately**:
   - Date columns: Format as Date
   - Number columns: Format as Number
   - Currency columns: Format as Currency

2. **Freeze the header row**:
   - Select row 1
   - View > Freeze > 1 row

3. **Enable filters**:
   - Select all data
   - Data > Create a filter

4. **Protect the header row**:
   - Select row 1
   - Right-click > Protect range
   - Set permissions

5. **Create backup copies**:
   - File > Make a copy
   - Name it with date: "Wedabime Backup 2024-01-15"