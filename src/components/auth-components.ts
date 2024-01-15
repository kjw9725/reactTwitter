import styled from 'styled-components';

// comment 타입
export type ListType = {
  list: {
    avatar: string;
    name: string;
    text: string;
    createdAt: number;
    tweetId: string;
    userId: string;
    displayDate: string;
    id: string;
    likes: string[];
  };
};

export const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 420px;
  padding: 50px 0px;
`;
export const Form = styled.form`
  margin-top: 50px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;
export const Input = styled.input`
  padding: 10px 20px;
  border-radius: 50px;
  border: none;
  width: 100%;
  font-size: 16px;
  &[type='submit'] {
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  &.message {
    border-radius: 0;
  }
`;
export const Title = styled.h1`
  font-size: 42px;
`;
export const Error = styled.span`
  font-weight: 600;
  color: tomato;
`;

export const Switcher = styled.span`
  margin-top: 20px;
  a {
    color: #1d9bf0;
    margin-bottom: 2px;
    margin-left: 4px;
  }
`;

export const Avatar = styled.div`
  width: 40px;
  height: 40px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 30px;
  }
`;

export const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
`;
export const TextArea = styled.textarea`
  position: relative;
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  &::placeholder {
    font-size: 16px;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      'Open Sans',
      'Helvetica Neue',
      sans-serif;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;
export const ConfirmButton = styled.button`
  background-color: #1d9bf0;
  color: white;
  font-weight: 600;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 4px;
  &:hover {
    background-color: #1d9bf0;
    color: white;
  }
`;

export const SendButton = styled.button`
  background-color: transparent;
  color: #1d9bf0;
  font-weight: 600;
  font-size: 16px;
  border: 1px solid #1d9bf0;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 4px;
  white-space: nowrap;
  &:hover {
    background-color: #1d9bf0;
    color: white;
  }
`;
export const Column = styled.div``;

export const DisplayFlex = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  /* margin-top: 8px; */
  &.align-center {
    align-items: center;
  }
  &.justify-between {
    justify-content: space-between;
    align-items: flex-end;
  }
  .font12 {
    white-space: nowrap;
    font-size: 12px;
  }
`;

// 좋아요 버튼
export const LikeButton = styled.div`
  display: flex;
  margin-right: 10px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 10px;

  svg {
    width: 25px;
    cursor: pointer;
  }
  &.like-active svg {
    fill: #e0245e;
  }
`;

// 날짜 계산기
export const dateCalc = () => {
  const now = new Date(new Date().getTime());

  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줍니다.
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

// 메시지

export const SearchBox = styled.input`
  width: 100%;
  height: 48px;
  border-radius: 25px;
  font-size: 18px;
  padding: 0 24px;
`;
export const SearchIcon = styled.button`
  position: absolute;
  top: 9px;
  right: 16px;
  width: 32px;
  border: none;
  cursor: pointer;
  background-color: transparent;
  svg {
    width: 26px;
    color: gray;
  }
  &.send {
    top: 6px;
    right: 10px;
  }
`;
export const Chatter = styled.form`
  position: absolute;
  width: 100%;
  height: 720px;
  border: 1px solid #fff;
  background-color: black;
`;
export const ChatBox = styled.div`
  height: 680px;
  overflow: auto;
  .read {
    margin-bottom: 20px;
    margin-right: 4px;
    font-size: 12px;
  }
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: gray;
  }

  &::-webkit-scrollbar-button {
    width: 0;
    height: 0;
  }
  .left-box {
    display: flex;
    width: fit-content;
    padding: 0 10px;
    flex-direction: column;
    justify-content: flex-start;
  }
  .right-box {
    display: flex;
    justify-content: flex-end;
    padding: 0 10px;
    align-items: flex-end;
  }
  .left {
    position: relative;
    background: #00aabb;
    border-radius: 0.4em;
    margin-bottom: 20px;
    margin-top: 4px;
    padding: 15px;
  }

  .left:after {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-right-color: #00aabb;
    border-left: 0;
    border-top: 0;
    margin-top: -5px;
    margin-left: -10px;
  }
  .right {
    /* width: 50%; */
    position: relative;
    background: #00aabb;
    border-radius: 0.4em;
    margin: 20px 0;
    padding: 15px;
    text-align: right;
  }

  .right:after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-left-color: #00aabb;
    border-right: 0;
    border-top: 0;
    margin-top: -5px;
    margin-right: -10px;
  }
`;
export const Close = styled.div`
  position: absolute;
  right: 0;
  width: 30px;
  cursor: pointer;
  z-index: 999;
`;
export const PositionBox = styled.div`
  position: relative;
  height: fit-content;
`;
