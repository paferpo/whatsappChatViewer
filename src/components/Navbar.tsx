import type { Component } from 'solid-js';
import { FaSolidHouse } from 'solid-icons/fa';
import { useNavigate } from '@solidjs/router';
import store from '../store';

const Navbar: Component = () => {
  const navigate = useNavigate();
  const setMessages = store[1];

  const goBack = () => {
    setMessages([]);
    navigate('/');
  };

  return (
    <nav class="navbar is-transparent" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a role="button" class="navbar-item" onClick={goBack}>
          <span class="icon">
            <FaSolidHouse />
          </span>
          <span>Home</span>
        </a>
        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
