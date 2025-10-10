import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

// Configura con tu clave pública de Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OaAWKJ7Z3r5YJbY6YoQ5R8wQ5R8wQ5R8wQ5R8wQ5R8wQ5R8wQ5R8wQ5R8wQ5R8wQ5R8wQ5R8wQ5R8wQ5R8wQ5R8w'
);

const CheckoutForm = ({ isOpen, onClose, items, total }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-90vh overflow-y-auto">
        <Elements stripe={stripePromise}>
          <PaymentForm onClose={onClose} items={items} total={total} />
        </Elements>
      </div>
    </div>
  );
};

const PaymentForm = ({ onClose, items, total }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { clear } = useCart();
  const { user } = useAuth();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');

  useEffect(() => {
    // Crear el Payment Intent cuando se monta el componente
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const stripeItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const response = await api.post('/payments/create-payment-intent', {
        items: stripeItems,
        totalAmount: total
      });

      if (response.data.success) {
        setClientSecret(response.data.clientSecret);
        setPaymentIntentId(response.data.paymentIntentId);
      } else {
        setError(response.data.message || 'Error creando el pago');
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Error conectando con el servidor de pagos');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    // Confirmar el pago con Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.name || 'Cliente',
            email: user?.email || ''
          }
        }
      }
    );

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      // Confirmar el pago en nuestro backend
      try {
        const response = await api.post('/payments/confirm-payment', {
          paymentIntentId: paymentIntent.id
        });

        if (response.data.success) {
          alert('¡Pago exitoso! Tu pedido ha sido procesado.');
          clear(); // Limpiar carrito
          onClose(); // Cerrar modal
        } else {
          setError(response.data.message || 'Error procesando la venta');
        }
      } catch (err) {
        console.error('Error confirming payment:', err);
        setError('Error confirmando el pago');
      }
    }

    setProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Finalizar Compra</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Resumen del pedido */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Resumen del pedido:</h3>
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm mb-1">
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t pt-2 mt-2 font-bold">
          Total: ${total.toLocaleString()}
        </div>
      </div>

      {/* Formulario de pago */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Información de la tarjeta
          </label>
          <div className="border rounded-md p-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
            disabled={processing}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={!stripe || processing}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Procesando...' : `Pagar $${total.toLocaleString()}`}
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>🔒 Pago seguro procesado por Stripe</p>
        <p>Usa 4242 4242 4242 4242 para pruebas</p>
      </div>
    </div>
  );
};

export default CheckoutForm;