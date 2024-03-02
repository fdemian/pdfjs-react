import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import PDFVIewer from './PDFViewer/PDFViewer';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

function App() {
  return (
    <Theme>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <PDFVIewer url="/ctm.pdf" />
    </Theme>
  )
}

export default App
