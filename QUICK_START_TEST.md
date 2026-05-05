# Quick Start - Testing the Inventory System

## 🚀 Getting Started

This guide shows you how to quickly test the new inventory-based resource allocation system.

---

## Step 1: Start the Backend

```bash
cd fsd-backend
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
📍 Environment: development
```

---

## Step 2: Start the Frontend

```bash
cd fsd-frontend
npm start
```

Browser will open to http://localhost:3000

---

## Step 3: Login (or Create Account)

### First Time?
1. Click "Register"
2. Create an account:
   - Name: Test User
   - Email: user@example.com
   - Password: Test123

### Already Have Admin Account?
```bash
# In fsd-backend, run the seed script
node seedAdmin.js

# Admin credentials:
# Email: admin@example.com
# Password: admin123
```

---

## 🧪 Test Scenario 1: Create Resources (Admin)

### Login as Admin
1. Go to http://localhost:3000/admin
2. Email: admin@example.com
3. Password: admin123

### Create First Resource
1. Click **Resources** tab
2. Click **+ Add Resource** button
3. Fill in:
   - **Name:** Laptops
   - **Description:** Dell XPS 13 development laptops
   - **Total Units:** 5
4. Click **Create Resource**

✅ You should see success message and card showing:
- Name: Laptops
- Total Units: 5
- Available: 5
- Allocated: 0
- Green badge: "In Stock (5/5)"

### Create Second Resource
1. Click **+ Add Resource** again
2. Fill in:
   - **Name:** Monitors
   - **Description:** 27" 4K monitors for workstations
   - **Total Units:** 10
3. Click **Create Resource**

✅ Now you have 2 resources with inventory

---

## 🧪 Test Scenario 2: Request Multiple Units (User)

### Switch to User Account
1. Logout (click user menu → Logout)
2. Click **Login**
3. Email: user@example.com (or your created account)
4. Password: Test123

### View Resources
1. You should see **Available Resources** section
2. See both resources:
   - Laptops: 5 available
   - Monitors: 10 available

### Request Laptops with Quantity
1. Find **Laptops** card
2. See quantity selector with:
   - `-` button
   - Input showing "1"
   - `+` button
3. Click `+` button twice → Input shows "3"
4. Click **Request Resource** button

✅ Success message: "Request submitted for 3 unit(s)"

### Request Monitors with Different Quantity
1. Find **Monitors** card
2. Click `+` button 5 times → Input shows "6"
3. Click **Request Resource**

✅ Another success message

### Check Your Requests
1. Scroll down to **My Requests** table
2. Should see 2 pending requests:
   - Laptops: 3 unit(s), Status: PENDING
   - Monitors: 6 unit(s), Status: PENDING

---

## 🧪 Test Scenario 3: Approve Requests (Admin)

### Switch Back to Admin
1. Logout
2. Login with admin@example.com / admin123

### View Requests
1. Click **Requests** tab
2. You should see 2 pending requests:
   - User: Test User
   - Resource: Laptops, Quantity: 3
   - Resource: Monitors, Quantity: 6

### Approve Laptop Request
1. Find Laptops request row
2. Click **✓ Approve** button

✅ Success message appears
✅ Request status changes to APPROVED

### Check Updated Resources
1. Click **Resources** tab
2. Find **Laptops** card
3. Verify it now shows:
   - Total Units: 5
   - Available: 2 (5 - 3 approved)
   - Allocated: 3

### Approve Monitor Request
1. Back to **Requests** tab
2. Find Monitors request row
3. Click **✓ Approve** button

✅ Monitors should now show:
   - Total Units: 10
   - Available: 4 (10 - 6 approved)
   - Allocated: 6

---

## 🧪 Test Scenario 4: Out of Stock Behavior

### Request Remaining Laptops
1. Logout → Login as user
2. Find **Laptops** card
3. See "2 units left" (yellow badge - low stock!)
4. Try to request 3 units:
   - Click `+` button 3 times → Shows "3" but max is "2"
   - Notice `+` button becomes disabled at quantity 2

### Try to Request
1. Set quantity to 2
2. Click **Request Resource**

✅ Request submitted for 2 remaining units

### Check as Admin
1. Logout → Login as admin
2. Go to **Resources**
3. **Laptops** now shows:
   - Available: 0
   - Badge: "Out of Stock" (red)

4. As user, try to request Laptops
5. **Request Resource** button is disabled
6. Shows "Out of Stock"

---

## 🧪 Test Scenario 5: Reject Request

### As Admin
1. View **Requests** tab
2. Find any PENDING request
3. Click **✕ Reject** button

✅ Request status changes to REJECTED
✅ Notification created
✅ **Important:** Available units NOT increased on rejection

---

## 🧪 Test Scenario 6: Low Stock Alert

### Create Resource with Few Units
1. Create resource with **Total Units:** 3
2. Name: USB Cables
3. Click **Create Resource**

### Make Requests to Trigger Low Stock
1. As user, request 1 unit
2. As admin, approve it
3. Resource now shows: "2 left" (yellow badge)

✅ Yellow badge indicates low stock (≤5 units)

---

## 📊 Test Data Verification

### Check Database (MongoDB)

```javascript
// Open MongoDB shell
mongosh

// Use resource-allocation database
use resource-allocation

// Check resources
db.resources.find()
// Output should show:
// {
//   _id: ObjectId(...),
//   name: "Laptops",
//   totalUnits: 5,
//   availableUnits: 0,
//   description: "...",
//   createdAt: ISODate(...),
//   updatedAt: ISODate(...)
// }

// Check requests
db.requests.find()
// Output should show:
// {
//   _id: ObjectId(...),
//   user: ObjectId(...),
//   resource: ObjectId(...),
//   quantity: 3,  // ← New field
//   status: "APPROVED",
//   createdAt: ISODate(...),
//   updatedAt: ISODate(...)
// }
```

---

## ✅ Verification Checklist

- [ ] Admin can create resource with totalUnits
- [ ] Resources show totalUnits and availableUnits
- [ ] Users see quantity selector (+/- buttons)
- [ ] Users can request 1 to availableUnits
- [ ] Request shows quantity in table
- [ ] Admin sees quantity in requests
- [ ] Approving request reduces availableUnits
- [ ] Out of stock shows red badge
- [ ] Low stock shows yellow badge
- [ ] Rejecting doesn't affect availableUnits
- [ ] Database shows quantity field in requests
- [ ] Toast notifications work
- [ ] Error messages for invalid quantities

---

## 🐛 Troubleshooting

### Issue: "Quantity field missing in requests table"
**Solution:**
```bash
# Restart frontend
cd fsd-frontend
npm start

# Clear browser cache (Ctrl+Shift+Delete)
```

### Issue: "availableUnits showing undefined"
**Solution:**
```bash
# Stop backend
# Clear old requests/resources with old schema

# In MongoDB shell:
use resource-allocation
db.resources.deleteMany({})
db.requests.deleteMany({})

# Restart backend
npm run dev
```

### Issue: "Can't set quantity higher than 1"
**Solution:**
- Ensure totalUnits was set when creating resource
- Check database: `db.resources.findOne()`
- Verify availableUnits equals totalUnits

### Issue: "Approval doesn't reduce available units"
**Solution:**
```bash
# Check backend logs for errors
tail -f fsd-backend/logs/error.log

# Verify resource exists in DB
db.resources.findById("resourceId")
```

---

## 📈 Advanced Testing

### Test Rate Limiting
Try making many rapid requests:
```bash
for i in {1..100}; do
  curl -X GET http://localhost:5000/api/resources
done
```

Should be rate-limited (HTTP 429)

### Test Error Handling
Try edge cases:
```bash
# Request with quantity = 0
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"resourceId": "123", "quantity": 0}'
# Should error: "Quantity must be at least 1"

# Request more than available
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"resourceId": "123", "quantity": 999}'
# Should error: "Not enough units available"
```

---

## 🎯 Performance Testing

### Load Test Endpoints
```bash
# Install Apache Bench (if not already installed)
ab -n 100 -c 10 http://localhost:5000/api/resources

# Should handle 100 requests across 10 concurrent connections
```

### Check Query Performance
```javascript
// In MongoDB
db.resources.find().explain("executionStats")
// Should use index on availableUnits
```

---

## 📝 Notes for Testing

- Always test as both admin and regular user
- Test approval immediately after request (no other changes)
- Test approval with other pending requests for same resource
- Test quantity edge cases: 0, 1, max, max+1
- Test UI on mobile (DevTools)
- Check browser console for any errors (F12)
- Monitor backend logs for any errors

---

## ✨ What to Look For

### Success Indicators
✅ No 404 or 500 errors  
✅ Stock quantities decrement correctly  
✅ UI updates in real-time  
✅ Database reflects UI changes  
✅ Toast notifications appear  
✅ Forms validate properly  

### Performance Indicators
⚡ Page loads in < 2 seconds  
⚡ Requests complete in < 500ms  
⚡ No console errors or warnings  
⚡ Smooth animations (no jank)  

---

## 🎉 You've Successfully Tested!

Congratulations! You've verified the inventory-based allocation system works correctly.

**Next Steps:**
1. Deploy to staging environment
2. Have team members test
3. Create test cases for automation
4. Plan rollout to production

See **UPGRADE_GUIDE.md** for production deployment.

---

**Happy Testing!** 🚀
