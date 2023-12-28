import styled from 'styled-components';
import { auth } from '../routes/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Error, Input, Title } from './auth-components';

const DeleteAuthButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  font-size: 18px;
  border: 0;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  width: 120px;
  height: 44px;
`;

const DeleteModal = styled.div`
  position: fixed;
  display: flex;
  left: 50%;
  top: 30%;
  width: 720px;
  height: 400px;
  background-color: black;
  border: 1px solid white;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 20px;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    color: gray;
  }
`;

export default function DeleteAuth() {
  const [isModal, setModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const deleteAuth = async () => {
    setModal(!isModal);
    setPassword('');
    setPasswordError(false);
  };

  const onPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const onDelete = async () => {
    try {
      const email = auth.currentUser?.email;

      if (email && password !== null) {
        await signInWithEmailAndPassword(auth, email, password);
        const user = auth.currentUser;
        await user!.delete();
        window.location.replace('/');
      }
    } catch {
      setPasswordError(true);
    }
  };

  return (
    <>
      <DeleteAuthButton onClick={deleteAuth}> 회원 탈퇴 </DeleteAuthButton>

      {isModal ? (
        <DeleteModal>
          <Title>회원 탈퇴</Title>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            onClick={deleteAuth}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6 close"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>

          <Input
            type="password"
            value={password}
            placeholder="비밀번호를 입력해주세요"
            onChange={onPassword}
          />
          {passwordError ? <Error>패스워드가 일치하지 않습니다</Error> : null}
          <DeleteAuthButton onClick={onDelete}> 회원 탈퇴 </DeleteAuthButton>
        </DeleteModal>
      ) : null}
    </>
  );
}
