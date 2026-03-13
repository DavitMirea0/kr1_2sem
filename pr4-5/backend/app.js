const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) console.log('Body:', req.body);
  });
  next();
});

// ── Pre-seeded users (пароли захешированы bcrypt) ─────────────────────────────
// ivan@mail.ru      → password123
// maria@mail.ru     → securePass
// admin@softshop.ru → admin2025
let users = [
  {
    id: nanoid(6),
    email: 'ivan@mail.ru',
    first_name: 'Иван',
    last_name: 'Петров',
    hashedPassword: '$2b$10$N26J0xwiqcUpPz6gvRvPp.rkiPi1COZ5Bt7IcTjKw/1CYxnA4E6jW',
  },
  {
    id: nanoid(6),
    email: 'maria@mail.ru',
    first_name: 'Мария',
    last_name: 'Сидорова',
    hashedPassword: '$2b$10$pOAHYpuU8AqIoXuMsVoI5.xQdm9SENpXgr7sMYI8s5IUhBEAasgmm',
  },
  {
    id: nanoid(6),
    email: 'admin@softshop.ru',
    first_name: 'Администратор',
    last_name: 'SoftShop',
    hashedPassword: '$2b$10$9gFw6Gx.6xD1GPQoxqAf/.oBM57mTacdcjTfQTjoTSAC3dMG9o.7W',
  },
];

// ── Products ──────────────────────────────────────────────────────────────────
let products = [
  { id: nanoid(6), title: 'Adobe Photoshop 2025',        category: 'Графика и дизайн', description: 'Профессиональный редактор растровой графики',         price: 3990  },
  { id: nanoid(6), title: 'Microsoft Office 2024',       category: 'Офис',             description: 'Word, Excel, PowerPoint, Outlook. Лицензия на 1 ПК', price: 6990  },
  { id: nanoid(6), title: 'JetBrains All Products Pack', category: 'Разработка',       description: 'Подписка на все IDE JetBrains',                      price: 24990 },
  { id: nanoid(6), title: 'Kaspersky Total Security',    category: 'Безопасность',     description: 'Защита от вирусов и шифровальщиков, 3 устройства',   price: 2490  },
  { id: nanoid(6), title: 'Vegas Pro 21',                category: 'Видеомонтаж',      description: 'Нелинейный видеоредактор с поддержкой 8K и HDR',      price: 14990 },
  { id: nanoid(6), title: 'Notion Business',             category: 'Офис',             description: 'Заметки, задачи, базы данных. Подписка на 1 год',     price: 4990  },
  { id: nanoid(6), title: 'GitHub Copilot',              category: 'Разработка',       description: 'AI-ассистент для программирования',                  price: 1990  },
  { id: nanoid(6), title: 'DaVinci Resolve Studio',      category: 'Видеомонтаж',      description: 'Монтаж, цветокоррекция, VFX и аудиопостпродакшн',     price: 29900 },
  { id: nanoid(6), title: 'Figma Professional',          category: 'Графика и дизайн', description: 'UI/UX-дизайн и прототипирование в реальном времени',  price: 5990  },
  { id: nanoid(6), title: 'Acronis Cyber Protect',       category: 'Безопасность',     description: '1 ТБ облачного хранилища, резервное копирование',     price: 3490  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) { res.status(404).json({ error: 'Product not found' }); return null; }
  return product;
}

// ── Swagger ───────────────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SoftShop API',
      version: '1.0.0',
      description: 'API авторизации и управления товарами (ПО)',
    },
    servers: [{ url: `http://localhost:${port}`, description: 'Локальный сервер' }],
  },
  apis: ['./app.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *       example:
 *         id: "abc123"
 *         email: "ivan@mail.ru"
 *         first_name: "Иван"
 *         last_name: "Петров"
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           example: ivan@mail.ru
 *         password:
 *           type: string
 *           example: password123
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *       example:
 *         id: "xyz789"
 *         title: "Adobe Photoshop 2025"
 *         category: "Графика и дизайн"
 *         description: "Профессиональный редактор растровой графики"
 *         price: 3990
 *     ProductInput:
 *       type: object
 *       required: [title, category, description, price]
 *       properties:
 *         title:
 *           type: string
 *           example: Figma Professional
 *         category:
 *           type: string
 *           example: Дизайн
 *         description:
 *           type: string
 *           example: Инструмент для UI/UX-дизайна
 *         price:
 *           type: number
 *           example: 5990
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

// ── AUTH ──────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     description: |
 *       Тестовые аккаунты:
 *       - ivan@mail.ru / password123
 *       - maria@mail.ru / securePass
 *       - admin@softshop.ru / admin2025
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Отсутствуют обязательные поля
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Неверный пароль
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const user = users.find(u => u.email === email.trim().toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const ok = await bcrypt.compare(password, user.hashedPassword);
  if (!ok) return res.status(401).json({ error: 'Invalid password' });

  const { hashedPassword, ...safeUser } = user;
  res.json({ login: true, user: safeUser });
});

// ── PRODUCTS ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Отсутствуют обязательные поля
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/products', (req, res) => {
  const { title, category, description, price } = req.body;
  if (!title || !category || !description || price === undefined) {
    return res.status(400).json({ error: 'title, category, description and price are required' });
  }
  const newProduct = {
    id: nanoid(6),
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить параметры товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Обновлённый товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  const { title, category, description, price } = req.body;
  if (title !== undefined) product.title = title.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар успешно удалён
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete('/api/products/:id', (req, res) => {
  const exists = products.some(p => p.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Product not found' });
  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});
