# MERN Resource Allocation System - Inventory-Based Upgrade Guide

## Overview

This document guides you through upgrading your Resource Allocation System from a simple boolean-based allocation model to an inventory-based system supporting multi-unit allocation.

## What Changed

### 1. **Database Models**

#### Resource Model
**Before:**
- `isAllocated` (Boolean)
- `allocatedTo` (User reference)

**After:**
- `totalUnits` (Number) - Total units available
- `availableUnits` (Number) - Units remaining for allocation

#### AllocationRequest Model (Request.js)
**Before:**
- No quantity field
- Only tracked single-unit requests

**After:**
- `quantity` (Number, min: 1) - Units requested by user

---

## Backend Changes

### Services

#### ResourceService
**New Methods:**
- `checkAvailability(resourceId, quantity)` - Validates if enough units available
- `reduceAvailableUnits(resourceId, quantity)` - Decrements available units
- `increaseAvailableUnits(resourceId, quantity)` - Increments available units
- `getLowStockResources(threshold)` - Gets resources with low stock

#### RequestService
**Updated Methods:**
- `createRequest(userId, resourceId, quantity = 1)` - Now accepts quantity
- `approveRequest(requestId)` - Automatically reduces availableUnits
- `rejectRequest(requestId)` - Keeps available units unchanged

### Controllers

#### ResourceController
**Updates:**
- `createResource` now accepts `totalUnits` parameter (default: 1)
- Validation added for `totalUnits` (positive integer)
- Removed `isAllocated` and `allocatedTo` population

#### RequestController
**Updates:**
- `requestResource` now accepts `{ resourceId, quantity }`
- Validates quantity before creating request
- Checks availability before approval

### API Endpoints

| Endpoint | Method | Changes |
|----------|--------|---------|
| `/api/requests` | POST | Now accepts `quantity` in request body |
| `/api/requests/:id/approve` | PUT | Auto-reduces `availableUnits` |
| `/api/requests/:id/reject` | PUT | No longer auto-increases units |
| `/api/resources` | POST | Now accepts `totalUnits` parameter |
| `/api/resources` | GET | Returns `totalUnits` and `availableUnits` |

---

## Frontend Changes

### Components Updated

#### UserDashboard.js
**New Features:**
- Quantity selector with +/- buttons
- Number input for exact quantity
- Stock status badge showing available units
- "Out of Stock" indicator when `availableUnits = 0`
- Dynamic "X units left" display
- Request table shows quantity

#### AdminDashboard.js
**New Features:**
- Resource form includes `totalUnits` input field
- Resource cards show inventory stats:
  - Total Units
  - Available Units
  - Allocated Units (calculated as totalUnits - availableUnits)
- Stock status badges:
  - Green: In Stock
  - Yellow: Low Stock (≤5 units)
  - Red: Out of Stock
- Request table includes Quantity column

### Styling (Dashboard.css)
**New Classes:**
- `.stock-badge` - Stock status indicator
- `.quantity-selector` - Quantity input group
- `.qty-input-group` - Container for +/- buttons and input
- `.qty-btn` - Increment/decrement buttons
- `.qty-input` - Number input for quantity
- `.resource-stats` - Resource inventory display
- `.quantity-col` - Table column for quantity

---

## Migration Steps

### Step 1: Backup Your Database
```bash
# MongoDB backup
mongodump --db resource-allocation --out ./backup
```

### Step 2: Update Your Code
All changes are included in this update. No manual code changes needed for new installations.

### Step 3: Update Existing Resources (If Using Old System)
Run this migration script in your backend:

```javascript
// migrations/migrateToInventory.js
const Resource = require('../models/Resource');
const Request = require('../models/Request');

async function migrateToInventory() {
  try {
    // Set totalUnits = 1 and availableUnits = 0 for allocated resources
    // Set totalUnits = 1 and availableUnits = 1 for available resources
    const resources = await Resource.find({});
    
    for (const resource of resources) {
      resource.totalUnits = 1;
      resource.availableUnits = resource.isAllocated ? 0 : 1;
      
      // Remove old fields
      resource.isAllocated = undefined;
      resource.allocatedTo = undefined;
      
      await resource.save();
    }

    // Set quantity = 1 for all existing requests
    await Request.updateMany({}, { $set: { quantity: 1 } });

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateToInventory();
```

To run:
```bash
cd fsd-backend
node migrations/migrateToInventory.js
```

### Step 4: Restart Services
```bash
# Backend
cd fsd-backend
npm install  # If new dependencies were added
npm run dev  # or npm start

# Frontend (in another terminal)
cd fsd-frontend
npm install  # If new dependencies were added
npm start
```

### Step 5: Test the System
1. **Create a resource with multiple units:**
   - Go to Admin Dashboard → Resources
   - Click "+ Add Resource"
   - Enter Name, Description, and Total Units (e.g., 5)
   - Submit

2. **Request multiple units as a user:**
   - Go to User Dashboard
   - See the resource with "5 available" badge
   - Use +/- buttons to select quantity (e.g., 2)
   - Click "Request Resource"

3. **Approve request as admin:**
   - Go to Admin Dashboard → Requests
   - See the pending request with quantity shown
   - Click "✓ Approve"
   - Verify available units decreased

---

## Example Usage

### Creating a Resource
**Request:**
```json
POST /api/resources
{
  "name": "Laptops",
  "description": "Dell XPS 13 Laptops for development",
  "totalUnits": 10
}
```

**Response:**
```json
{
  "success": true,
  "resource": {
    "_id": "123abc",
    "name": "Laptops",
    "description": "Dell XPS 13 Laptops for development",
    "totalUnits": 10,
    "availableUnits": 10,
    "createdAt": "2026-05-04T..."
  }
}
```

### Requesting a Resource
**Request:**
```json
POST /api/requests
{
  "resourceId": "123abc",
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "request": {
    "_id": "req123",
    "user": { "_id": "usr1", "name": "John Doe" },
    "resource": { "_id": "123abc", "name": "Laptops" },
    "quantity": 3,
    "status": "PENDING",
    "createdAt": "2026-05-04T..."
  }
}
```

### Approving a Request
**Request:**
```
PUT /api/requests/req123/approve
```

**Response:**
```json
{
  "success": true,
  "message": "Request approved successfully and stock updated",
  "request": {
    "_id": "req123",
    "quantity": 3,
    "status": "APPROVED",
    "resource": {
      "totalUnits": 10,
      "availableUnits": 7  // Reduced from 10 to 7
    }
  }
}
```

---

## Breaking Changes

### For Frontend Developers
1. **Resource data structure changed:**
   - Remove checks for `isAllocated`
   - Use `availableUnits` and `totalUnits` instead
   - `allocatedTo` field no longer exists

2. **Request data structure changed:**
   - Requests now include `quantity` field
   - Display quantity in request tables

### For API Consumers
1. **POST /api/requests now requires:**
   ```json
   {
     "resourceId": "...",
     "quantity": 1
   }
   ```
   (Previously only had `resourceId`)

2. **GET /api/resources returns:**
   - `totalUnits` and `availableUnits` instead of `isAllocated` and `allocatedTo`

---

## Error Handling

### Common Errors and Solutions

**Error: "Not enough units available"**
- User requested more units than available
- Solution: Reduce quantity or wait for approvals to be rejected

**Error: "Cannot approve: Only X units available"**
- Admin tried to approve but units were already allocated
- Solution: Check current available units before approving

**Error: "Quantity must be at least 1"**
- Invalid quantity sent
- Solution: Ensure quantity is a positive integer ≥ 1

---

## Rollback Plan

If you need to revert to the old system:

1. **Backup current data:**
   ```bash
   mongodump --db resource-allocation --out ./backup-inventory
   ```

2. **Restore previous backup:**
   ```bash
   mongorestore --db resource-allocation ./backup
   ```

3. **Revert code to previous commit:**
   ```bash
   git revert <commit-hash>
   ```

4. **Restart services**

---

## Support and Troubleshooting

### Check Logs
```bash
# Backend
tail -f fsd-backend/logs/error.log

# Frontend
Check browser console (F12)
```

### Validate Data Integrity
```javascript
// In MongoDB shell
db.resources.find({ availableUnits: { $gt: 5 } })
db.requests.find({ quantity: { $exists: false } })
```

### Performance Notes
- Inventory system is more efficient than boolean tracking
- Added indexes on `availableUnits` and request status for faster queries
- Consider archiving old requests after 3-6 months

---

## FAQ

**Q: Can I have 0 units for a resource?**
A: Yes, set `totalUnits: 0`. The resource will show as "Out of Stock".

**Q: What happens if I approve a request and units go negative?**
A: The system prevents this. It checks availability before approval.

**Q: Can users see how many units others requested?**
A: Users can see this in the admin requests table, not in user dashboard.

**Q: How do I restock a resource?**
A: Manually update `totalUnits` via admin panel or API. `availableUnits` won't automatically increase.

**Q: Can I batch approve multiple requests?**
A: Currently, approvals are one at a time. Feature can be added.

---

## Next Steps

1. ✅ Upgrade complete! Review the [IMPROVEMENT_GUIDE.md](./IMPROVEMENT_GUIDE.md) for future enhancements
2. Test all user flows
3. Train admins on new inventory system
4. Monitor resource allocation patterns

---

**Version:** 2.0.0 (Inventory-Based)  
**Last Updated:** May 4, 2026  
**Compatibility:** Node.js 14+, React 18+, MongoDB 4.4+
