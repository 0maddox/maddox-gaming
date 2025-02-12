import { Link } from 'react-router-dom';
function Footer() {
  return (
    <footer className="bg-black text-white py-6 mt-16">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-400">© 2025 Maddox Gaming. All Rights Reserved.</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link to="/about" className="text-gray-400 hover:text-white">About</Link>
          <Link to="/tournaments" className="text-gray-400 hover:text-white">Tournaments</Link>
          <Link to="/shop" className="text-gray-400 hover:text-white">Shop</Link>
          <Link to="/content" className="text-gray-400 hover:text-white">Content</Link>
          <Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
