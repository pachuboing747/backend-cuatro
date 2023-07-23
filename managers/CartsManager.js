// CartsManager.js

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CartsManager {
  #carts = [];

  constructor(filename) {
    this.filename = filename;
    this.filepath = path.join(__dirname, "../data", this.filename);
  }

  #readFile = async () => {
    try {
      const data = await fs.readFile(this.filepath, "utf-8");
      if (data == "") {
        this.#carts = [];
      } else {
        this.#carts = JSON.parse(data);
      }
    } catch (e) {
      this.#carts = [];
    }
  };

  #writeFile = async () => {
    const data = JSON.stringify(this.#carts, null, 2);
    await fs.writeFile(this.filepath, data);
  };

  //Take data from carts id
  async getById(id) {
    await this.#readFile();

    return this.#carts.find((c) => c.id == id);
  }

  //Create a new carts
  async create(carts) {
    await this.#readFile();

    const id = (this.#carts[this.#carts.length - 1]?.id || 0) + 1;

    const newcarts = {
      id,
      ...carts,
      products: [],
    };

    this.#carts.push(newcarts);

    await this.#writeFile();

    return newcarts;
  }

  async existInCart(cart, productId) {
    return cart.products.find((p) => p.product == productId);
  }

  //Create a new entry in the products array for a determined cart
  async createProduct(cart, productId, cantidad) {
    await this.#readFile();

    const newProduct = {
      product: productId,
      quantity: cantidad,
    };

   if (!cart.products){
    cart.products = []
   };
   cart.products.push(newProduct)

    await this.#writeFile();

    return cart;
  }

  //Update the quantity of a product in a determined cart
  async updateProduct(cart, productId) {
    await this.#readFile();

    const productInCart = cart.products.find((p) => p.product === productId);

    if (!productInCart) {
      return await this.createProduct(cart, productId +1)
    }else {
      const product = await productManager.getById(productId);

    if (productInCart.quantity >= product.stock) {
      return null; // Si la cantidad en el carrito ya es igual o mayor al stock, no se puede actualizar.
    }
    productInCart.quantity++; // Incrementamos la cantidad del producto en el carrito.

    await this.#writeFile();

    return productInCart.quantity;
  }
  }

  async getAll() {
    await this.#readFile();

    return this.#carts;
  }
}

export default CartsManager;
