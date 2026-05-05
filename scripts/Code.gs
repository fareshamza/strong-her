// ==========================================
// Strong Her Planner - Google Apps Script Backend
// ==========================================
// 1. ضع ID الشيت الخاص بك هنا (موجود في رابط الشيت بين /d/ و /edit)
const SPREADSHEET_ID = "1LdVRrELqYmgoT_jJpgYawFgltbGmfw-wZwXMJrywDTo";
// 2. ضع ID الفولدر الذي سيتم حفظ الإيصالات فيه (موجود في رابط الفولدر)
const FOLDER_ID = "1TaBYSOxPdLdeC0Dp3EKx91eTFFRpGPnN";
// 3. كلمة مرور الأدمن
const ADMIN_TOKEN = "0107652871";

// ==========================================
// إعداد الشيت (قم بتشغيل هذه الدالة مرة واحدة فقط لإنشاء الجداول)
// ==========================================
function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Orders Sheet
  let ordersSheet = ss.getSheetByName("Orders");
  if (!ordersSheet) {
    ordersSheet = ss.insertSheet("Orders");
    ordersSheet.appendRow(["ID", "Name", "Phone", "WorkoutDays", "Split", "Exercises", "PaymentNumber", "ReceiptUrl", "Status", "CreatedAt", "DiscountCode"]);
  }
  
  // 2. Settings Sheet
  let settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Settings");
    settingsSheet.appendRow(["Key", "Value"]);
    settingsSheet.appendRow(["planner_price", "450"]);
    settingsSheet.appendRow(["transfer_number", "010XXXXXXXX"]);
  }
  
  // 3. Discounts Sheet
  let discountsSheet = ss.getSheetByName("Discounts");
  if (!discountsSheet) {
    discountsSheet = ss.insertSheet("Discounts");
    discountsSheet.appendRow(["ID", "Code", "DiscountPercent", "Active", "UsageCount", "CreatedAt"]);
  }
}

// ==========================================
// معالجة GET Requests (جلب البيانات)
// ==========================================
function doGet(e) {
  const params = e.parameter;
  const action = params.action;
  
  try {
    if (action === "settings") {
      return jsonResponse(getSettings());
    }
    
    if (action === "orders") {
      if (params.adminToken !== ADMIN_TOKEN) return errorResponse("Unauthorized", 401);
      return jsonResponse(getOrders());
    }
    
    if (action === "discounts") {
      if (params.adminToken !== ADMIN_TOKEN) return errorResponse("Unauthorized", 401);
      return jsonResponse(getDiscounts());
    }

    if (action === "trackOrder") {
      return jsonResponse(trackOrder(params.id));
    }

    return jsonResponse({ message: "Strong Her API is running" });
  } catch (error) {
    return errorResponse(error.message);
  }
}

// ==========================================
// معالجة POST Requests (إرسال وتحديث البيانات)
// ==========================================
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return errorResponse("Invalid JSON payload", 400);
  }

  const action = body.action;

  try {
    // 1. Create Order
    if (action === "createOrder") {
      return jsonResponse(createOrder(body.data));
    }

    // 2. Update Order Status (Admin)
    if (action === "updateStatus") {
      if (body.adminToken !== ADMIN_TOKEN) return errorResponse("Unauthorized", 401);
      return jsonResponse(updateOrderStatus(body.id, body.status));
    }

    // 3. Update Settings (Admin)
    if (action === "updateSettings") {
      if (body.adminToken !== ADMIN_TOKEN) return errorResponse("Unauthorized", 401);
      return jsonResponse(updateSettings(body.settings));
    }

    // 4. Create Discount (Admin)
    if (action === "createDiscount") {
      if (body.adminToken !== ADMIN_TOKEN) return errorResponse("Unauthorized", 401);
      return jsonResponse(createDiscount(body.data));
    }

    // 5. Toggle Discount (Admin)
    if (action === "toggleDiscount") {
      if (body.adminToken !== ADMIN_TOKEN) return errorResponse("Unauthorized", 401);
      return jsonResponse(toggleDiscount(body.id, body.active));
    }

    // 6. Verify Discount (Client)
    if (action === "verifyDiscount") {
      return jsonResponse(verifyDiscount(body.code));
    }

    return errorResponse("Unknown action", 400);
  } catch (error) {
    return errorResponse(error.message);
  }
}

// ==========================================
// الدوال المساعدة (Helper Functions)
// ==========================================

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(message, code = 500) {
  return ContentService.createTextOutput(JSON.stringify({ error: message, code }))
    .setMimeType(ContentService.MimeType.JSON);
}

function uploadImage(base64Data, filename) {
  if (!base64Data) return null;
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const contentType = base64Data.substring(5, base64Data.indexOf(';'));
    const bytes = Utilities.base64Decode(base64Data.split(',')[1]);
    const blob = Utilities.newBlob(bytes, contentType, filename);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getDownloadUrl(); // Or file.getUrl() depending on preference
  } catch (err) {
    console.error("Image upload failed:", err);
    return null;
  }
}

// ==========================================
// دوال معالجة الطلبات (Business Logic)
// ==========================================

function getSettings() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Settings");
  const data = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  return settings;
}

function updateSettings(newSettings) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Settings");
  const data = sheet.getDataRange().getValues();
  
  for (const [key, value] of Object.entries(newSettings)) {
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([key, value]);
    }
  }
  return { success: true };
}

function getDiscounts() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Discounts");
  const data = sheet.getDataRange().getValues();
  const discounts = [];
  for (let i = 1; i < data.length; i++) {
    discounts.push({
      id: data[i][0],
      code: data[i][1],
      discountPercent: data[i][2],
      active: data[i][3],
      usageCount: data[i][4],
      createdAt: data[i][5]
    });
  }
  return discounts;
}

function createDiscount(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Discounts");
  const id = new Date().getTime();
  const code = data.code.toUpperCase().trim();
  sheet.appendRow([id, code, data.discountPercent, true, 0, new Date().toISOString()]);
  return { id, code, discountPercent: data.discountPercent, active: true, usageCount: 0 };
}

function toggleDiscount(id, active) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Discounts");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, 4).setValue(active);
      return { success: true };
    }
  }
  throw new Error("Discount not found");
}

function verifyDiscount(code) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Discounts");
  const data = sheet.getDataRange().getValues();
  const c = code.toUpperCase().trim();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === c && data[i][3] === true) {
      // Valid discount
      return { valid: true, discountPercent: data[i][2] };
    }
  }
  return { valid: false, error: "Invalid or inactive code" };
}

function createOrder(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Orders");
  const id = new Date().getTime();
  
  // Upload receipt if provided
  let receiptUrl = "";
  if (data.receiptBase64) {
    receiptUrl = uploadImage(data.receiptBase64, `Receipt_${id}.jpg`);
  }
  
  sheet.appendRow([
    id,
    data.name,
    data.phone,
    data.workoutDays,
    data.workoutSplit,
    data.exercises,
    data.paymentNumber,
    receiptUrl,
    "pending",
    new Date().toISOString(),
    data.discountCode || ""
  ]);
  
  return { id, success: true };
}

function getOrders() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Orders");
  const data = sheet.getDataRange().getValues();
  const orders = [];
  
  // Headers: ID, Name, Phone, WorkoutDays, Split, Exercises, PaymentNumber, ReceiptUrl, Status, CreatedAt, DiscountCode
  for (let i = data.length - 1; i > 0; i--) { // Reverse order (newest first)
    orders.push({
      id: data[i][0],
      name: data[i][1],
      phone: data[i][2],
      workoutDays: data[i][3],
      workoutSplit: data[i][4],
      exercises: data[i][5],
      paymentNumber: data[i][6],
      receiptUrl: data[i][7],
      status: data[i][8],
      createdAt: data[i][9],
      discountCode: data[i][10] || ""
    });
  }
  return orders;
}

function trackOrder(id) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Orders");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      return {
        id: data[i][0],
        name: data[i][1],
        phone: data[i][2],
        workoutDays: data[i][3],
        workoutSplit: data[i][4],
        exercises: data[i][5],
        status: data[i][8],
        createdAt: data[i][9]
      };
    }
  }
  throw new Error("Order not found");
}

function updateOrderStatus(id, status) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Orders");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, 9).setValue(status);
      return { success: true };
    }
  }
  throw new Error("Order not found");
}
