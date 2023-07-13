import { Router } from "express";
import ProductManager from "../../managers/ProductManager.js";

const productManager = new ProductManager("productos.json");
const router = Router()

  
// /api/products
router.get("/", async (req, res) => {
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


// /api/products/:id
router.get("/:id", async (req, res) => {
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
  
// /api/products
router.post("/", async (req, res) => {
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
// /api/products/:pid
router.put("/:pid", async (req, res) => {
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
  
// /api/products/:id
router.delete('/:id', async (req, res) => {
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


export default router;