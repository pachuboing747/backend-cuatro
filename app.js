import express from "express"
import ProductManager from "./ProductManager.js";
import fs from "fs/promises";



const app = express();
const productManager = new ProductManager("productos.json");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res) => {
  const products = await productManager.getProducts();

  const productHTML = products
    .map(
      (product) => `
    <div>
      <h3>${product.title}</h3>
      <p>${product.description}</p>
      <p>Precio: ${product.price}</p>
      <img src="${product.thumbnail}" alt="${product.title}" width="200">
      <p>Código: ${product.code}</p>
      <p>Stock: ${product.stock}</p>
      <p>ID: ${product.id}</p>
    </div>
  `
    )
    .join("");
  res.send(`${productHTML}`);
});

app.get("/api/products", async (req, res) => {
  const limit = parseInt(req.query.limit);
  let productsToSend = await productManager.getProducts();

  if (!isNaN(limit) && limit > 0) {
    productsToSend = productsToSend.slice(0, limit);
  }

  const productHTML = productsToSend
    .map(
      (product) => `
      <div>
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <p>Precio: ${product.price}</p>
        <img src="${product.thumbnail}" alt="${product.title}" width="200">
        <p>Código: ${product.code}</p>
        <p>Stock: ${product.stock}</p>
        <p>ID: ${product.id}</p>
      </div>
    `
    )
    .join("");

  res.send(`
    <h2>Lista de Productos:</h2>
    ${productHTML}
  `);
});

app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const products = await productManager.getProducts();
  const product = products.find((product) => product.id === parseInt(id));

  if (product) {
    res.send(`
      <div>
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <p>Precio: ${product.price}</p>
        <img src="${product.thumbnail}" alt="${product.title}" width="200">
        <p>Código: ${product.code}</p>
        <p>Stock: ${product.stock}</p>
        <p>ID: ${product.id}</p>
      </div>
    `);
  } else {
    res.send("Producto no encontrado");
  }
});

app.post("/api/products", async (req, res) => {
  const status = req.body.status || true;

  const newProduct = {
    title: "Nike Zoom Mercurial Superfly 9 Academy MG",
    description: "Cuenta con una unidad Zoom Air y con una NikeSkin flexible en la parte superior para brindar un toque excepcional, de modo que puedas dominar en los últimos y más importantes minutos de un partido.",
    price: 49900,
    thumbnail: "https://nikearprod.vtexassets.com/arquivos/ids/452821/DJ5625_001_A_PREM.jpg?v=638149287879500000",
    code: "GW1022",
    stock: 15,
    category: "Zapatillas",
    status: true,
  };

  if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
    res.status(400).json({ error: "Faltan campos obligatorios" });
    return;
  }

  try {
    await productManager.addProduct(newProduct);
    res.status(201).json({ message: "Producto agregado exitosamente", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto" });
  }
});


app.put("/api/products/:pid", async (req, res) => {
  const productId = req.params.pid;
  const updatedFields = req.body;

  try {
    const product = await productManager.getProductById(productId);
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    await productManager.updateProduct(productId, updatedFields);

    const updatedProduct = {
      ...product,
      ...updatedFields,
      id: product.id,
    };

    res.status(200).json({ message: "Producto actualizado exitosamente", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});


app.delete('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const data = await fs.readFile('productos.json', 'utf8');
    let products = JSON.parse(data);

    const productIndex = products.findIndex(product => product.id === id);

    if (productIndex !== -1) {
      products.splice(productIndex, 1);

      await fs.writeFile('productos.json', JSON.stringify(products), 'utf8');

      res.status(200).json({ message: 'Producto eliminado correctamente.' });
    } else {
      res.status(404).json({ message: 'No se encontró el producto.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al procesar la solicitud.' });
  }
});



app.get('/api/carts', async (req, res) => {
  try {
    const data = await fs.readFile('cart.json', 'utf8');
    const cartData = JSON.parse(data);

    res.status(200).json(cartData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los datos del carrito.' });
  }
});
   
app.post('/api/carts', async (req, res) => {
  try {
    const cartData = await fs.readFile('cart.json', 'utf8');
    let cart = JSON.parse(cartData);

    if (!Array.isArray(cart)) {
      cart = [];
    }

    const newItemId = cart.length > 0 ? cart[cart.length - 1].id + 1 : 1;

    const isDuplicate = cart.some((item) => item.id === newItemId);
    if (isDuplicate) {
      throw new Error("El producto ya existe.");
    }

    const productToAdd = {
      id: newItemId,
      title: 'Nike Zoom Mercurial Superfly 9 Academy MG',
      description: 'Cuenta con una unidad Zoom Air y con una NikeSkin flexible en la parte superior para brindar un toque excepcional, de modo que puedas dominar en los últimos y más importantes minutos de un partido.',
      price: 49900,
      thumbnail: 'https://nikearprod.vtexassets.com/arquivos/ids/452821/DJ5625_001_A_PREM.jpg?v=638149287879500000',
      code: 'GW1022',
      stock: 15,
      category: 'Zapatillas',
      status: true,
    };

    cart.push(productToAdd);

    await fs.writeFile('cart.json', JSON.stringify(cart, null, 2), 'utf8');

    res.status(201).json({ message: 'Producto agregado al carrito correctamente.', product: productToAdd });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al agregar el producto al carrito.' });
  }
});


app.get('/api/carts/:cid', async (req, res) => {
  try {
    const cartId = parseInt(req.params.cid);

    const cartData = await fs.readFile('cart.json', 'utf8');
    const cart = JSON.parse(cartData);

    const targetCart = cart[cartId];

    if (!targetCart) {
      res.status(404).json({ message: 'Carrito no encontrado.' });
      return;
    }

    res.status(200).json({ cart: targetCart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los productos del carrito.' });
  }
});

app.post('/:cid/product/:pid', async (req, res) => {
  const cid = req.params.cid;
  const pid = req.params.pid;

  try {
    let data = await fs.readFile('products.json', 'utf-8');
    let cartList = JSON.parse(data);

    const cartIndex = cartList.findIndex((item) => item.cid === cid);

    if (cartIndex !== -1) {
      const cart = cartList[cartIndex];
      const existingProduct = cart.products.find((item) => item.product === pid);

      const newProductId = cart.products.length + 1;
      const newProduct = { id: newProductId, product: pid, quantity: 1 };
      cart.products.push(newProduct);
    } else {
  
      const newProduct = { id: 1, product: pid, quantity: 1 };
      const newCart = { cid, products: [newProduct] };
      cartList.push(newCart);
    }

    data = JSON.stringify(cartList, null, 2);
    await fs.writeFile('products.json', data, 'utf-8');

    res.json(cartList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar el producto al carrito' });
  }
});

const port = 8080;
app.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
});

