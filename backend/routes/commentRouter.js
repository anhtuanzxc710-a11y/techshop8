import express from "express";
import {
  createComment,
  getCommentsByProduct,
  getCommentsByUser,
  updateComment,
  checkEligibility,
} from "../controllers/commentController.js";
import authUser from "../middleware/authUser.js";

const commentRouter = express.Router();

commentRouter.post("/create-comment", authUser, createComment);
commentRouter.get("/get-comments-by-product/:prID", getCommentsByProduct);
commentRouter.post("/update-comment", authUser, updateComment);
commentRouter.get("/get-comments", authUser, getCommentsByUser);
commentRouter.post("/check-eligibility", authUser, checkEligibility);
export default commentRouter;
