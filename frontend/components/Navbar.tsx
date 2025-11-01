import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCartIcon } from './Icons';

const Navbar: React.FC = () => {
  return (
    <header className="bg-slate-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold hover:text-cyan-400 transition-colors">
            <ShoppingCartIcon className="h-7 w-7"/>
            <span>Product Explorer</span>
          </Link>
          <nav>
            <ul className="flex items-center space-x-6">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `text-lg font-medium hover:text-cyan-400 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-300'}`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/recommendations"
                  className={({ isActive }) =>
                    `text-lg font-medium hover:text-cyan-400 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-300'}`
                  }
                >
                  Recommendations
                </NavLink>
              </li>
              {/* ✅ NEW LINK */}
              <li>
                <NavLink
                  to="/price-prediction"
                  className={({ isActive }) =>
                    `text-lg font-medium hover:text-cyan-400 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-300'}`
                  }
                >
                  Price Prediction
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
