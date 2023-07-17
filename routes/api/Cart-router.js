import { Router} from "express";
import CartsManager from "../../managers/CartsManager.js"


const cartManager = new CartsManager("cart.json")
const router = Router()


router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit);
  let productsToSend = await cartManager.getProducts();

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
    <h2>Carrito:</h2>
    ${productHTML}
  `);
});

router.get('/api/carts', async (req, res) => {
    try {
      const data = await fs.readFile('cart.json', 'utf8');
      const cartData = JSON.parse(data);
  
      res.status(200).json(cartData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al obtener los datos del carrito.' });
    }
});
     
router.post('/api/carts', async (req, res) => {
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
  
  
router.get('/api/carts/:cid', async (req, res) => {
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

export default  router;