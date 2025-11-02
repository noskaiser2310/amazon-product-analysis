import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCartIcon } from './Icons';
import { useCart } from '../hooks/useCart';

const Navbar: React.FC = () => {
  const { cart } = useCart(); // ✅ Di chuyển hook vào trong component

  return (
    <header className="bg-slate-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold hover:text-cyan-400 transition-colors"
          >
            <ShoppingCartIcon className="h-7 w-7"/>
            <span>Product Explorer</span>
          </Link>
          
          <nav>
            <ul className="flex items-center space-x-6">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `text-lg font-medium hover:text-cyan-400 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-300'
                    }`
                  }
                >
                  Home
                </NavLink>
              </li>
              
              <li>
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    `text-lg font-medium hover:text-cyan-400 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-300'
                    }`
                  }
                >
                  Products
                </NavLink>
              </li>
              
              <li>
                <NavLink
                  to="/price-prediction"
                  className={({ isActive }) =>
                    `text-lg font-medium hover:text-cyan-400 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-300'
                    }`
                  }
                >
                  Price Prediction
                </NavLink>
              </li>

              {/* ✅ Cart Link với số lượng sản phẩm */}
              <li>
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    `flex items-center space-x-1 text-lg font-medium hover:text-cyan-400 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-300'
                    }`
                  }
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>Cart ({cart.items.length})</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;