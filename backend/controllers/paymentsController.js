const Stripe = require('stripe');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');

// Inicializar Stripe con tu clave secreta
// Por ahora usaremos una clave de prueba
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51...');

const paymentsController = {
    // Crear un Payment Intent
    async createPaymentIntent(req, res) {
        try {
            const { items, totalAmount } = req.body;
            const userId = req.user.id;

            // Validar productos y stock
            const productValidations = await Promise.all(
                items.map(async (item) => {
                    const product = await Product.findById(item.productId);
                    if (!product) {
                        throw new Error(`Producto no encontrado: ${item.productId}`);
                    }
                    if (product.quantity < item.quantity) {
                        throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.quantity}`);
                    }
                    return {
                        product,
                        requestedQuantity: item.quantity,
                        unitPrice: product.price
                    };
                })
            );

            // Crear el Payment Intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100), // Stripe usa centavos
                currency: 'clp',
                metadata: {
                    userId,
                    items: JSON.stringify(items)
                }
            });

            res.json({
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            });

        } catch (error) {
            console.error('Error creating payment intent:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Confirmar el pago y procesar la venta
    async confirmPayment(req, res) {
        try {
            const { paymentIntentId } = req.body;
            const userId = req.user.id;

            // Verificar el payment intent con Stripe
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status !== 'succeeded') {
                return res.status(400).json({
                    success: false,
                    message: 'El pago no se completó exitosamente'
                });
            }

            // Obtener los items del metadata
            const items = JSON.parse(paymentIntent.metadata.items);
            const totalAmount = paymentIntent.amount / 100; // Convertir de centavos

            // Crear la venta en la base de datos
            const saleItems = await Promise.all(
                items.map(async (item) => {
                    const product = await Product.findById(item.productId);
                    return {
                        product: product._id,
                        quantity: item.quantity,
                        unitPrice: product.price,
                        subtotal: product.price * item.quantity
                    };
                })
            );

            const newSale = new Sale({
                customer: userId,
                items: saleItems,
                totalAmount,
                paymentStatus: 'Pagado',
                paymentMethod: 'Stripe',
                paymentIntentId: paymentIntentId,
                date: new Date()
            });

            await newSale.save();

            // Actualizar el inventario
            for (const item of items) {
                const product = await Product.findById(item.productId);
                product.quantity -= item.quantity;
                await product.save();

                // Registrar movimiento de inventario
                const inventoryMovement = new InventoryMovement({
                    product: item.productId,
                    movementType: 'Salida',
                    quantity: item.quantity,
                    reason: `Venta #${newSale._id}`,
                    date: new Date()
                });
                await inventoryMovement.save();
            }

            res.json({
                success: true,
                sale: newSale,
                message: 'Pago procesado exitosamente'
            });

        } catch (error) {
            console.error('Error confirming payment:', error);
            res.status(500).json({
                success: false,
                message: 'Error procesando el pago'
            });
        }
    },

    // Obtener historial de pagos del usuario
    async getUserPayments(req, res) {
        try {
            const userId = req.user.id;
            
            const sales = await Sale.find({ customer: userId })
                .populate('items.product')
                .sort({ date: -1 });

            res.json({
                success: true,
                payments: sales
            });

        } catch (error) {
            console.error('Error fetching user payments:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo historial de pagos'
            });
        }
    }
};

module.exports = paymentsController;