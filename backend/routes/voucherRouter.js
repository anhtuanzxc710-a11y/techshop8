import express from 'express'
import { addVoucher, listVouchers, removeVoucher, validateVoucher, updateVoucher } from '../controllers/voucherController.js'
import authAdmin from '../middleware/authAdmin.js'
import authUser from '../middleware/authUser.js'

const voucherRouter = express.Router()

voucherRouter.post('/add', authAdmin, addVoucher)
voucherRouter.get('/list', listVouchers)
voucherRouter.post('/remove', authAdmin, removeVoucher)
voucherRouter.post('/update', authAdmin, updateVoucher)
voucherRouter.post('/validate', authUser, validateVoucher)

export default voucherRouter
