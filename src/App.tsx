import Navbar from './components/Navbar';
import type { ParentProps, Component } from 'solid-js';

const App: Component = (props: ParentProps) => {
  return (
    <>
      <Navbar />
      {props.children}
    </>
  );
}

export default App;
