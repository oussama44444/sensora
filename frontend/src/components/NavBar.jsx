import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
   console.log('Login clicked');
    navigate('/login');
  };
  const handleRegister = () => {
       console.log('Register clicked'); 
    navigate('/register');
  };
  return (
    <nav className="bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-teal-600">SVT Platform</h1>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center">
            <div className="flex space-x-8 text-white">
              <Link to='/home' className='hover:scale-110'>Accueil</Link>
              <Link to='/course' className='hover:scale-110'>Cours</Link>
              <Link to='/career' className='hover:scale-110'>Carrières</Link>
              <Link to='/blog' className='hover:scale-110'>Blog</Link>
              <Link to='/about' className='hover:scale-110'>À propos de nous</Link>
            </div>
            <div className="ml-8 flex items-center space-x-4">
              <button onClick={handleLogin} className="px-4 py-2 rounded-full hover:scale-110 text-sm font-medium text-black bg-white hover:bg-teal-500">
                Connexion
              </button>
              <button onClick={handleRegister} className="px-4 py-2 rounded-full hover:scale-110 text-sm font-medium text-white bg-customblue hover:bg-teal-500">
                Inscription
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white rounded-lg shadow-lg mt-2 p-4">
            <div className="flex flex-col space-y-4">
              <Link to='/home' className='text-gray-800 hover:text-teal-500'>Accueil</Link>
              <Link to='/course' className='text-gray-800 hover:text-teal-500'>Cours</Link>
              <Link to='/career' className='text-gray-800 hover:text-teal-500'>Carrières</Link>
              <Link to='/blog' className='text-gray-800 hover:text-teal-500'>Blog</Link>
              <Link to='/about' className='text-gray-800 hover:text-teal-500'>À propos de nous</Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <button onClick={handleLogin} className="w-full px-4 py-2 rounded-full text-sm font-medium text-black bg-gray-100 hover:bg-teal-500">
                  Connexion
                </button>
                <button onClick={handleRegister} className="w-full px-4 py-2 rounded-full text-sm font-medium text-white bg-customblue hover:bg-teal-500">
                  Inscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
