import { open, type NitroSQLiteConnection } from 'react-native-nitro-sqlite';

let db: NitroSQLiteConnection | null = null;

export const getDb = (): NitroSQLiteConnection => {
  if (db) return db;
  try {
    db = open({ name: 'myDatabase.db' });
  } catch {
    db = open({ name: 'myDatabase.db', connection: 'independent' });
  }
  return db!;
};

const queryRows = <T>(sql: string, params: any[] = []): T[] => {
  try {
    const res = getDb().execute(sql, params);
    return (res.rows?._array as unknown as T[]) || [];
  } catch (error) {
    console.error('DB query error:', error);
    return [];
  }
};

const execSql = (sql: string, params: any[] = []): boolean => {
  try {
    getDb().execute(sql, params);
    return true;
  } catch (error) {
    console.error('DB exec error:', error);
    return false;
  }
};

export type Category = {
  id: number;
  name: string;
  productCount?: number;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
  categoryName?: string;
  description?: string;
};

export type User = {
  id: number;
  username: string;
  password?: string;
  role: string;
  fullname?: string;
  phone?: string;
  address?: string;
};

export type CartItem = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImg: string;
  quantity: number;
};

export type Order = {
  id: number;
  userId: number;
  customerName: string;
  phone: string;
  address: string;
  totalAmount: number;
  paymentMethod: string;
  orderDate: string;
  status: string;
  items?: OrderItem[];
};

const initialCategories = [
  'Áo thời trang',
  'Giày sneaker',
  'Balo & Túi xách',
  'Đồng hồ',
  'Phụ kiện',
];

const initialProducts = [
  {
    name: 'Áo sơ mi Oxford Nam',
    price: 250000,
    img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
    categoryId: 1,
  },
  {
    name: 'Áo thun Polo Classic',
    price: 195000,
    img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500',
    categoryId: 1,
  },
  {
    name: 'Giày Sneaker Trắng Retro',
    price: 850000,
    img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    categoryId: 2,
  },
  {
    name: 'Giày Thể Thao Running Sport',
    price: 620000,
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    categoryId: 2,
  },
  {
    name: 'Balo Laptop Chống Nước Cao Cấp',
    price: 420000,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    categoryId: 3,
  },
  {
    name: 'Đồng Hồ Nam Thép Không Gỉ',
    price: 1250000,
    img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500',
    categoryId: 4,
  },
];

export const initDatabase = async (onSuccess?: () => void) => {
  try {
    const database = getDb();

    const tables = [
      'CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);',
      'CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, img TEXT, categoryId INTEGER);',
      'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT, fullname TEXT, phone TEXT, address TEXT);',
      'CREATE TABLE IF NOT EXISTS cart (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, productId INTEGER, quantity INTEGER);',
      'CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, customerName TEXT, phone TEXT, address TEXT, totalAmount REAL, paymentMethod TEXT, orderDate TEXT, status TEXT);',
      'CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, orderId INTEGER, productId INTEGER, productName TEXT, productPrice REAL, productImg TEXT, quantity INTEGER);',
    ];
    tables.forEach(sql => database.execute(sql));

    ['fullname', 'phone', 'address'].forEach(col => {
      try {
        database.execute(`ALTER TABLE users ADD COLUMN ${col} TEXT;`);
      } catch {}
    });

    const catCount =
      queryRows<{ count: number }>(
        'SELECT COUNT(*) as count FROM categories;',
      )[0]?.count || 0;
    if (catCount === 0) {
      initialCategories.forEach(name =>
        database.execute('INSERT INTO categories (name) VALUES (?);', [name]),
      );
    }

    const prodCount =
      queryRows<{ count: number }>('SELECT COUNT(*) as count FROM products;')[0]
        ?.count || 0;
    if (prodCount === 0) {
      initialProducts.forEach(p =>
        database.execute(
          'INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?);',
          [p.name, p.price, p.img, p.categoryId],
        ),
      );
    }

    database.execute(`
      INSERT INTO users (username, password, role, fullname, phone, address)
      SELECT 'admin', '123456', 'admin', 'Quản Trị Viên', '0901234567', 'Đà Nẵng'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
    `);
    database.execute(`
      INSERT INTO users (username, password, role, fullname, phone, address)
      SELECT 'user', '123456', 'user', 'Nguyễn Văn A', '0987654321', 'Hà Nội'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user');
    `);

    try {
      database.execute(
        "UPDATE orders SET status = 'Chờ xác nhận' WHERE status = 'Đã đặt hàng';",
      );
    } catch {}

    try {
      database.execute(`
        UPDATE products 
        SET img = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500' 
        WHERE (img LIKE '%photo-1523275335684-37898b6baf30%' OR img = '' OR img IS NULL) 
          AND (LOWER(name) LIKE '%giày%' OR LOWER(name) LIKE '%sneaker%' OR LOWER(name) LIKE '%dép%');
      `);
      database.execute(`
        UPDATE products 
        SET img = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500' 
        WHERE (img LIKE '%photo-1523275335684-37898b6baf30%' OR img = '' OR img IS NULL) 
          AND (LOWER(name) LIKE '%áo%' OR LOWER(name) LIKE '%quần%' OR LOWER(name) LIKE '%sơ mi%' OR LOWER(name) LIKE '%polo%');
      `);
      database.execute(`
        UPDATE products 
        SET img = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' 
        WHERE (img LIKE '%photo-1523275335684-37898b6baf30%' OR img = '' OR img IS NULL) 
          AND (LOWER(name) LIKE '%balo%' OR LOWER(name) LIKE '%túi%' OR LOWER(name) LIKE '%cặp%');
      `);
      database.execute(`
        UPDATE products 
        SET img = 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500' 
        WHERE (img LIKE '%photo-1523275335684-37898b6baf30%' OR img = '' OR img IS NULL) 
          AND (LOWER(name) LIKE '%đồng hồ%' OR LOWER(name) LIKE '%dong ho%');
      `);
    } catch (e) {
      console.warn('DB update images migration error:', e);
    }

    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('Lỗi khởi tạo DB:', error);
  }
};

export const fetchCategories = async (): Promise<Category[]> =>
  queryRows<Category>(
    `SELECT c.id, c.name, COUNT(p.id) as productCount
     FROM categories c LEFT JOIN products p ON c.id = p.categoryId
     GROUP BY c.id ORDER BY c.id ASC;`,
  );

export const addCategory = async (name: string): Promise<boolean> =>
  execSql('INSERT INTO categories (name) VALUES (?);', [name.trim()]);

export const updateCategory = async (category: Category): Promise<boolean> =>
  execSql('UPDATE categories SET name = ? WHERE id = ?;', [
    category.name.trim(),
    category.id,
  ]);

export const deleteCategory = async (id: number): Promise<boolean> =>
  execSql('DELETE FROM products WHERE categoryId = ?;', [id]) &&
  execSql('DELETE FROM categories WHERE id = ?;', [id]);

export const fetchProducts = async (): Promise<Product[]> =>
  queryRows<Product>(
    `SELECT p.*, c.name as categoryName FROM products p
     LEFT JOIN categories c ON p.categoryId = c.id ORDER BY p.id DESC;`,
  );

export const fetchProductsByCategory = async (
  categoryId: number,
): Promise<Product[]> =>
  queryRows<Product>(
    `SELECT p.*, c.name as categoryName FROM products p
     LEFT JOIN categories c ON p.categoryId = c.id
     WHERE p.categoryId = ? ORDER BY p.id DESC;`,
    [categoryId],
  );

export const addProduct = async (product: {
  name: string;
  price: number;
  img: string;
  categoryId: number;
}): Promise<boolean> =>
  execSql(
    'INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?);',
    [product.name.trim(), product.price, product.img || '', product.categoryId],
  );

export const updateProduct = async (product: {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
}): Promise<boolean> =>
  execSql(
    'UPDATE products SET name = ?, price = ?, img = ?, categoryId = ? WHERE id = ?;',
    [
      product.name.trim(),
      product.price,
      product.img || '',
      product.categoryId,
      product.id,
    ],
  );

export const deleteProduct = async (id: number): Promise<boolean> =>
  execSql('DELETE FROM products WHERE id = ?;', [id]) &&
  execSql('DELETE FROM cart WHERE productId = ?;', [id]);

export const searchProductsByNameOrCategory = async (
  keyword: string,
): Promise<Product[]> =>
  queryRows<Product>(
    `SELECT p.*, c.name as categoryName FROM products p
     LEFT JOIN categories c ON p.categoryId = c.id
     WHERE p.name LIKE ? OR c.name LIKE ? ORDER BY p.id DESC;`,
    [`%${keyword}%`, `%${keyword}%`],
  );

export const fetchUsers = async (): Promise<User[]> =>
  queryRows<User>(
    'SELECT id, username, role, fullname, phone, address FROM users ORDER BY id ASC;',
  );

export const addUser = async (
  username: string,
  password: string,
  role: string = 'user',
  fullname: string = '',
  phone: string = '',
  address: string = '',
): Promise<boolean> =>
  execSql(
    'INSERT INTO users (username, password, role, fullname, phone, address) VALUES (?, ?, ?, ?, ?, ?);',
    [
      username.trim(),
      password,
      role,
      fullname.trim(),
      phone.trim(),
      address.trim(),
    ],
  );

export const updateUser = async (user: User): Promise<boolean> =>
  execSql(
    'UPDATE users SET username = ?, role = ?, fullname = ?, phone = ?, address = ? WHERE id = ?;',
    [
      user.username,
      user.role,
      user.fullname || '',
      user.phone || '',
      user.address || '',
      user.id,
    ],
  );

export const updateUserRole = async (
  userId: number,
  newRole: string,
): Promise<boolean> =>
  execSql('UPDATE users SET role = ? WHERE id = ?;', [newRole, userId]);

export const updateUserProfile = async (
  userId: number,
  fullname: string,
  phone: string,
  address: string,
  password?: string,
): Promise<boolean> => {
  if (password && password.trim().length > 0) {
    return execSql(
      'UPDATE users SET fullname = ?, phone = ?, address = ?, password = ? WHERE id = ?;',
      [fullname.trim(), phone.trim(), address.trim(), password, userId],
    );
  }
  return execSql(
    'UPDATE users SET fullname = ?, phone = ?, address = ? WHERE id = ?;',
    [fullname.trim(), phone.trim(), address.trim(), userId],
  );
};

export const deleteUser = async (id: number): Promise<boolean> =>
  execSql('DELETE FROM users WHERE id = ?;', [id]) &&
  execSql('DELETE FROM cart WHERE userId = ?;', [id]);

export const getUserByCredentials = async (
  username: string,
  password: string,
): Promise<User | null> =>
  queryRows<User>(
    'SELECT id, username, role, fullname, phone, address FROM users WHERE username = ? AND password = ?;',
    [username.trim(), password],
  )[0] || null;

export const getUserById = async (id: number): Promise<User | null> =>
  queryRows<User>(
    'SELECT id, username, role, fullname, phone, address FROM users WHERE id = ?;',
    [id],
  )[0] || null;

export const addToCart = async (
  userId: number,
  productId: number,
  quantity: number = 1,
): Promise<boolean> => {
  const existing = queryRows<{ id: number; quantity: number }>(
    'SELECT id, quantity FROM cart WHERE userId = ? AND productId = ?;',
    [userId, productId],
  )[0];

  if (existing) {
    return execSql('UPDATE cart SET quantity = ? WHERE id = ?;', [
      existing.quantity + quantity,
      existing.id,
    ]);
  }
  return execSql(
    'INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?);',
    [userId, productId, quantity],
  );
};

export const getCartItems = async (userId: number): Promise<CartItem[]> =>
  queryRows<CartItem>(
    `SELECT c.id, c.userId, c.productId, c.quantity, p.name, p.price, p.img, p.categoryId
     FROM cart c JOIN products p ON c.productId = p.id
     WHERE c.userId = ? ORDER BY c.id DESC;`,
    [userId],
  );

export const updateCartQuantity = async (
  cartId: number,
  quantity: number,
): Promise<boolean> =>
  quantity <= 0
    ? execSql('DELETE FROM cart WHERE id = ?;', [cartId])
    : execSql('UPDATE cart SET quantity = ? WHERE id = ?;', [quantity, cartId]);

export const removeFromCart = async (cartId: number): Promise<boolean> =>
  execSql('DELETE FROM cart WHERE id = ?;', [cartId]);

export const clearCart = async (userId: number): Promise<boolean> =>
  execSql('DELETE FROM cart WHERE userId = ?;', [userId]);

export const createOrder = async (
  userId: number,
  customerName: string,
  phone: string,
  address: string,
  paymentMethod: string,
  items: CartItem[],
): Promise<number | null> => {
  try {
    const database = getDb();
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const res = database.execute(
      `INSERT INTO orders (userId, customerName, phone, address, totalAmount, paymentMethod, orderDate, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        userId,
        customerName.trim(),
        phone.trim(),
        address.trim(),
        totalAmount,
        paymentMethod,
        new Date().toLocaleString('vi-VN'),
        'Chờ xác nhận',
      ],
    );

    const orderId =
      res.insertId ||
      queryRows<{ id: number }>('SELECT last_insert_rowid() as id;')[0]?.id;
    if (!orderId) return null;

    items.forEach(item =>
      database.execute(
        `INSERT INTO order_items (orderId, productId, productName, productPrice, productImg, quantity)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          orderId,
          item.productId,
          item.name,
          item.price,
          item.img,
          item.quantity,
        ],
      ),
    );

    clearCart(userId);
    return orderId;
  } catch (error) {
    console.error('Lỗi createOrder:', error);
    return null;
  }
};

const attachOrderItems = (orders: Order[]): Order[] =>
  orders.map(order => ({
    ...order,
    items: queryRows<OrderItem>(
      'SELECT * FROM order_items WHERE orderId = ?;',
      [order.id],
    ),
  }));

export const getOrdersByUserId = async (userId: number): Promise<Order[]> =>
  attachOrderItems(
    queryRows<Order>(
      'SELECT * FROM orders WHERE userId = ? ORDER BY id DESC;',
      [userId],
    ),
  );

export const getAllOrders = async (): Promise<Order[]> =>
  attachOrderItems(queryRows<Order>('SELECT * FROM orders ORDER BY id DESC;'));

export const updateOrderStatus = async (
  orderId: number,
  status: string,
): Promise<boolean> =>
  execSql('UPDATE orders SET status = ? WHERE id = ?;', [status, orderId]);
