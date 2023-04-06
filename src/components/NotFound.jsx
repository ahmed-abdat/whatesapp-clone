import React from 'react';
import { Link } from 'react-router-dom';
import './styles/NotFound.css'

function NotFound() {
  return (
    <div className='not-found-container'>
      <h1 className='not-found-text '>Page Not Found</h1>
      <p className='not-found-text '>Sorry, the page you are looking for could not be found.</p>
      <Link to="/" className=''>Go to Home Page</Link>
    </div>
  );
}

export default NotFound;
