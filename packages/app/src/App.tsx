import { Home } from "./systems/Home";
import { Providers } from "./systems/Providers";

function App() {
  return (
    <Providers>
      <Home />
    </Providers>
  );
}

export default App;
