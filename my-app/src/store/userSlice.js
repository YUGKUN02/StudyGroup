// ===================================
// userSlice.js - Redux 사용자 상태 관리
// ===================================
// 역할: 전역 사용자 정보 저장 및 관리
// - 로그인 상태 (isAuthenticated)
// - 사용자 정보 (username, name)
// - 로그인/로그아웃 처리
//
// Redux란? 앱 전체에서 공유하는 데이터 저장소
// - 어느 페이지에서든 useSelector로 사용자 정보 가져올 수 있음

import { createSlice } from "@reduxjs/toolkit";

// ========== 초기 상태 (로그아웃 상태) ==========
const initialState = {
  username: null,           // 사용자 아이디
  name: null,               // 사용자 이름
  isAuthenticated: false,   // 로그인 여부
};

// ========== Redux Slice 생성 ==========
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // ========== 토큰으로 로그인 상태 설정 ==========
    // 사용 시점: 로그인 성공 시, 앱 시작 시 (새로고침 대응)
    setUserFromToken(state, action) {
      const token = action.payload;
      try {
        // localStorage에 accessToken 저장
        localStorage.setItem("accessToken", token);
        // 토큰이 있으면 로그인 상태로 변경
        state.isAuthenticated = true;
      } catch {
        // 토큰 저장 실패 시 로그아웃 상태로
        state.username = null;
        state.name = null;
        state.isAuthenticated = false;
      }
    },

    // ========== 아이디 저장 ==========
    setUsername(state, action) {
      state.username = action.payload;
    },

    // ========== 이름 저장 ==========
    setName(state, action) {
      state.name = action.payload;
      if (action.payload) {
        localStorage.setItem("userName", action.payload);
      }
    },

    // ========== 로그아웃 처리 ==========
    // localStorage 토큰 삭제 + Redux 상태 초기화
    logout(state) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userName");
      state.username = null;
      state.name = null;
      state.isAuthenticated = false;
    },
  },
});

// ========== 액션 함수들 내보내기 (다른 파일에서 사용) ==========
export const { setUserFromToken, setUsername, setName, logout } = userSlice.actions;

// ========== Reducer 내보내기 (store에 등록용) ==========
export default userSlice.reducer;
