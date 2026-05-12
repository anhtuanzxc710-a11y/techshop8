import express from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, getCartCount, clearCart } from "../controllers/shoppingCartController.js";
import authUser from "../middleware/authUser.js";

const shoppingCartRouter = express.Router();

shoppingCartRouter.post("/get", authUser, getCart);
shoppingCartRouter.post("/add", authUser, addToCart);
shoppingCartRouter.post("/update", authUser, updateCartItem);
shoppingCartRouter.post("/remove", authUser, removeFromCart);
shoppingCartRouter.post("/count", authUser, getCartCount);
shoppingCartRouter.post("/clear", authUser, clearCart);

export default shoppingCartRouter;
