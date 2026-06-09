const express = require('express');
const orderController = require('./orders.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Permite criar orçamentos/leads pelo site público sem login
router.post('/', orderController.createOrder);

// Protege as demais rotas para apenas usuários logados
router.use(authenticate);

router.get('/', orderController.getOrders);
router.put('/:id', orderController.updateOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
