// ===================================
// main.jsx - 앱의 시작점 (Entry Point)
// ===================================
// 역할: React 앱을 HTML에 연결하고 Redux 설정
// - 이 파일은 보통 수정할 일이 거의 없음

import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { store } from './store';
import { Provider } from 'react-redux';

// HTML의 <div id="root">에 React 앱을 렌더링
createRoot(document.getElementById('root')).render(
  // Redux Provider: 모든 컴포넌트에서 Redux store 사용 가능하게 설정
  <Provider store={store}>
    <App />
  </Provider>,
)