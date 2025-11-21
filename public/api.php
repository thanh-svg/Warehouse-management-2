<?php
/**
 * AME.VN Warehouse Management API
 * Single-file PHP backend using SQLite
 */

// 1. Headers for CORS and JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Database Connection
// The database file will be created in the same directory as this script.
// Ensure the folder has write permissions.
$db_file = __DIR__ . '/inventory.db';
try {
    $db = new SQLite3($db_file);
    $db->enableExceptions(true);
    // Set busy timeout to 5 seconds to handle concurrent writes better
    $db->busyTimeout(5000);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// 3. Initialize Tables if they don't exist
$init_sql = "
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    sku TEXT NOT NULL,
    item_type TEXT,
    current_quantity INTEGER DEFAULT 0,
    location TEXT,
    description TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY(item_id) REFERENCES items(id)
);
";

try {
    $db->exec($init_sql);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Table initialization failed: ' . $e->getMessage()]);
    exit;
}

// Helper to send JSON response
function sendResponse($data) {
    echo json_encode(['data' => $data]);
    exit;
}

// Helper to send Error
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

// 4. Route Handling
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    // --- Action: SEARCH ---
    if ($action === 'search' && $method === 'GET') {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $search = isset($_GET['q']) ? trim($_GET['q']) : '';

        $whereClause = "";
        if ($search) {
            $whereClause = "WHERE name LIKE :q OR sku LIKE :q OR brand LIKE :q";
        }

        // Count total results for pagination
        $countSql = "SELECT COUNT(*) as count FROM items $whereClause";
        $stmt = $db->prepare($countSql);
        if ($search) {
            $stmt->bindValue(':q', "%$search%", SQLITE3_TEXT);
        }
        $result = $stmt->execute();
        $row = $result->fetchArray(SQLITE3_ASSOC);
        $total = $row['count'];

        // Fetch items
        $sql = "SELECT * FROM items $whereClause ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($sql);
        if ($search) {
            $stmt->bindValue(':q', "%$search%", SQLITE3_TEXT);
        }
        $stmt->bindValue(':limit', $limit, SQLITE3_INTEGER);
        $stmt->bindValue(':offset', $offset, SQLITE3_INTEGER);
        
        $result = $stmt->execute();
        $items = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            // Map DB columns (snake_case) to Frontend types (camelCase)
            $items[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'brand' => $row['brand'],
                'sku' => $row['sku'],
                'itemType' => $row['item_type'],
                'currentQuantity' => $row['current_quantity'],
                'location' => $row['location'],
                'description' => $row['description'],
                'createdAt' => $row['created_at'],
                'events' => [] // List view doesn't need full event history
            ];
        }
        
        sendResponse(['items' => $items, 'total' => $total]);

    // --- Action: GET (Single Item) ---
    } elseif ($action === 'get' && $method === 'GET') {
        $id = $_GET['id'] ?? '';
        if (!$id) sendError("Missing ID");

        // Get Item
        $stmt = $db->prepare("SELECT * FROM items WHERE id = :id");
        $stmt->bindValue(':id', $id, SQLITE3_TEXT);
        $result = $stmt->execute();
        $itemRow = $result->fetchArray(SQLITE3_ASSOC);

        if (!$itemRow) {
            sendError("Item not found", 404);
        }

        // Get Events
        $stmtEvents = $db->prepare("SELECT * FROM events WHERE item_id = :id ORDER BY timestamp DESC");
        $stmtEvents->bindValue(':id', $id, SQLITE3_TEXT);
        $eventsResult = $stmtEvents->execute();
        $events = [];
        while ($evRow = $eventsResult->fetchArray(SQLITE3_ASSOC)) {
            $events[] = [
                'id' => $evRow['id'],
                'type' => $evRow['type'],
                'quantity' => $evRow['quantity'],
                'timestamp' => $evRow['timestamp'],
                'notes' => $evRow['notes']
            ];
        }

        $item = [
            'id' => $itemRow['id'],
            'name' => $itemRow['name'],
            'brand' => $itemRow['brand'],
            'sku' => $itemRow['sku'],
            'itemType' => $itemRow['item_type'],
            'currentQuantity' => $itemRow['current_quantity'],
            'location' => $itemRow['location'],
            'description' => $itemRow['description'],
            'createdAt' => $itemRow['created_at'],
            'events' => $events
        ];

        sendResponse($item);

    // --- Action: CREATE ---
    } elseif ($action === 'create' && $method === 'POST') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data) sendError("Invalid JSON body");
        
        // Validate required fields
        if (empty($data['id']) || empty($data['name']) || empty($data['sku'])) {
            sendError("Missing required fields (id, name, sku)");
        }

        $db->exec('BEGIN TRANSACTION');
        try {
            // Insert Item
            $stmt = $db->prepare("INSERT INTO items (id, name, brand, sku, item_type, current_quantity, location, description, created_at) VALUES (:id, :name, :brand, :sku, :itemType, :qty, :loc, :desc, :created)");
            $stmt->bindValue(':id', $data['id'], SQLITE3_TEXT);
            $stmt->bindValue(':name', $data['name'], SQLITE3_TEXT);
            $stmt->bindValue(':brand', $data['brand'] ?? '', SQLITE3_TEXT);
            $stmt->bindValue(':sku', $data['sku'], SQLITE3_TEXT);
            $stmt->bindValue(':itemType', $data['itemType'] ?? 'Spare Part', SQLITE3_TEXT);
            $stmt->bindValue(':qty', $data['currentQuantity'], SQLITE3_INTEGER);
            $stmt->bindValue(':loc', $data['location'] ?? '', SQLITE3_TEXT);
            $stmt->bindValue(':desc', $data['description'] ?? '', SQLITE3_TEXT);
            $stmt->bindValue(':created', $data['createdAt'], SQLITE3_TEXT);
            $stmt->execute();

            // Insert Initial Stock Event if provided
            if (isset($data['events']) && is_array($data['events']) && count($data['events']) > 0) {
                $evt = $data['events'][0];
                $stmtEvt = $db->prepare("INSERT INTO events (id, item_id, type, quantity, timestamp, notes) VALUES (:id, :itemId, :type, :qty, :ts, :notes)");
                $stmtEvt->bindValue(':id', $evt['id'], SQLITE3_TEXT);
                $stmtEvt->bindValue(':itemId', $data['id'], SQLITE3_TEXT);
                $stmtEvt->bindValue(':type', $evt['type'], SQLITE3_TEXT);
                $stmtEvt->bindValue(':qty', $evt['quantity'], SQLITE3_INTEGER);
                $stmtEvt->bindValue(':ts', $evt['timestamp'], SQLITE3_TEXT);
                $stmtEvt->bindValue(':notes', $evt['notes'] ?? '', SQLITE3_TEXT);
                $stmtEvt->execute();
            }

            $db->exec('COMMIT');
            sendResponse(['success' => true, 'id' => $data['id']]);
        } catch (Exception $e) {
            $db->exec('ROLLBACK');
            // Check for duplicate ID or SKU
            if (strpos($e->getMessage(), 'UNIQUE constraint failed') !== false) {
                sendError("Item ID already exists.");
            } else {
                sendError("Failed to create item: " . $e->getMessage());
            }
        }

    // --- Action: LOG EVENT ---
    } elseif ($action === 'log_event' && $method === 'POST') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        // Expected payload: { itemId, event: { id, type, quantity, timestamp, notes }, newQuantity }
        if (!$data || empty($data['itemId']) || empty($data['event'])) {
            sendError("Invalid event data");
        }

        $db->exec('BEGIN TRANSACTION');
        try {
            // Insert Event
            $stmtEvt = $db->prepare("INSERT INTO events (id, item_id, type, quantity, timestamp, notes) VALUES (:id, :itemId, :type, :qty, :ts, :notes)");
            $stmtEvt->bindValue(':id', $data['event']['id'], SQLITE3_TEXT);
            $stmtEvt->bindValue(':itemId', $data['itemId'], SQLITE3_TEXT);
            $stmtEvt->bindValue(':type', $data['event']['type'], SQLITE3_TEXT);
            $stmtEvt->bindValue(':qty', $data['event']['quantity'], SQLITE3_INTEGER);
            $stmtEvt->bindValue(':ts', $data['event']['timestamp'], SQLITE3_TEXT);
            $stmtEvt->bindValue(':notes', $data['event']['notes'] ?? '', SQLITE3_TEXT);
            $stmtEvt->execute();

            // Update Item Quantity
            $stmtUpd = $db->prepare("UPDATE items SET current_quantity = :qty WHERE id = :id");
            $stmtUpd->bindValue(':qty', $data['newQuantity'], SQLITE3_INTEGER);
            $stmtUpd->bindValue(':id', $data['itemId'], SQLITE3_TEXT);
            $stmtUpd->execute();

            $db->exec('COMMIT');
            sendResponse(['success' => true]);
        } catch (Exception $e) {
            $db->exec('ROLLBACK');
            sendError("Failed to log event: " . $e->getMessage());
        }

    } else {
        sendError("Invalid action or method", 400);
    }

} catch (Exception $e) {
    sendError("Server Error: " . $e->getMessage(), 500);
}
?>