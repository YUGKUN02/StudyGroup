// ===================================
// store/index.js - Redux Store 설정
// ===================================
// 역할: Redux의 중앙 저장소(Store) 생성
// - 여러 Slice들을 하나로 통합
// - main.jsx에서 Provider로 앱 전체에 제공됨
//
// 새로운 Slice 추가 시:
// 1. import 추가: import newReducer from "./newSlice";
// 2. reducer에 등록: newName: newReducer,

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

// ========== Redux Store 생성 ==========
export const store = configureStore({
  reducer: {
    user: userReducer,  // userSlice의 상태를 "user"라는 이름으로 사용
    // 추가 Slice는 여기에 등록 (예: posts: postsReducer)
  },
});
