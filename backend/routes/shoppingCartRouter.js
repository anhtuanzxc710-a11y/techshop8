import express from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, getCartCount } from "../controllers/shoppingCartController.js";
import authUser from "../middleware/authUser.js";

const shoppingCartRouter = express.Router();

shoppingCartRouter.post("/get", authUser, getCart);
shoppingCartRouter.post("/add", authUser, addToCart);
shoppingCartRouter.post("/update", authUser, updateCartItem);
shoppingCartRouter.post("/remove", authUser, removeFromCart);
shoppingCartRouter.post("/count", authUser, getCartCount);

export default shoppingCartRouter;
