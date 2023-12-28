import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from './firebase';
import { Link, useNavigate } from 'react-router-dom';
import {
  Error,
  Form,
  Input,
  Switcher,
  Title,
  Wrapper,
} from '../components/auth-components';
import GithubButton from '../components/github-btn';
import styled from 'styled-components';

const EamilBox = styled.div`
  display: flex;
  gap: 10px;
`;
const EmailButton = styled.button`
  white-space: nowrap;
  background: transparent;
  border: 2px solid #1d9bf0;
  color: #1d9bf0;
  border-radius: 20px;
  padding: 0 20px;
  cursor: pointer;
  &:hover {
    background-color: #1d9bf0;
    color: white;
  }
`;
const EmailError = styled.div`
  color: red;
  &.green-text {
    color: green;
  }
`;

const ErrorMsg = styled.div`
  color: red;
`;

export default function CreateAccount() {
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');

  // 유효성검사
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPassowrdError] = useState(false);
  const [passwordConfirmError, setPasswordConfirmError] = useState(false);

  // 이메일 중복체크 메시지
  const [emailMsg, setEmailMsg] = useState('');

  const [greenText, setGreenText] = useState('');

  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name == 'name') {
      setName(value);
      if (value == '') {
        setNameError(true);
      } else {
        setNameError(false);
      }
    } else if (name == 'email') {
      setEmail(value);
    } else if (name == 'passwordConfirm') {
      setPasswordConfirm(value);
      if (password !== value) {
        setPasswordConfirmError(true);
      } else {
        setPasswordConfirmError(false);
      }
    } else {
      setPassword(value);
      const reg = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,25}$/;
      if (!reg.test(password)) {
        setPassowrdError(true);
      } else {
        setPassowrdError(false);
      }
    }
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (
      isLoading ||
      name === '' ||
      email === '' ||
      password === '' ||
      passwordConfirm === ''
    ) {
      if (name === '') {
        setNameError(true);
      }
      if (email === '') {
        setEmailError(true);
        setEmailError(true);
        setEmailMsg('이메일을 입력해주세요');
      }
      if (password === '') {
        setPassowrdError(true);
      }
      if (password && password !== passwordConfirm) {
        setPasswordConfirmError(true);
      }
      return;
    }

    try {
      setLoading(true);
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(credentials.user, {
        displayName: name,
      });
      navigate('/');
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  //  이메일 중복체크
  const onEmailCheck = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isLoading || email === '') {
      setEmailError(true);
      setEmailMsg('이메일을 입력해주세요');
      return;
    }

    try {
      setLoading(true);

      await createUserWithEmailAndPassword(auth, email, 'someDummyPassword');
      auth.currentUser && (await auth.currentUser.delete());

      setEmailError(true);
      setEmailMsg('사용 가능한 이메일입니다.');
      setGreenText('green-text');
    } catch (error: unknown) {
      if (error != null && isAuthError(error)) {
        setEmailError(true);
        setEmailMsg('이미 등록된 이메일입니다.');
        setGreenText('');
      } else {
        console.error('Error checking email:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  function isAuthError(obj: unknown): obj is { code: string } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      (obj as Record<string, unknown>).code !== undefined
    );
  }

  return (
    <Wrapper>
      <Title>Join to X</Title>
      <Form onSubmit={onSubmit}>
        <Input
          name="name"
          onChange={onChange}
          value={name}
          placeholder="Name"
          type="text"
        />
        {nameError ? <ErrorMsg>이름을 입력해주세요</ErrorMsg> : null}
        <EamilBox>
          <Input
            name="email"
            onChange={onChange}
            value={email}
            placeholder="Email"
            type="email"
          />
          <EmailButton onClick={onEmailCheck}>중복체크</EmailButton>
        </EamilBox>
        {emailError ? (
          <EmailError className={greenText}>{emailMsg}</EmailError>
        ) : null}
        <Input
          name="password"
          onChange={onChange}
          value={password}
          placeholder="Password"
          type="password"
        />
        {passwordError ? (
          <ErrorMsg>영문, 숫자조합 8자이상 입력해주세요</ErrorMsg>
        ) : null}
        <Input
          name="passwordConfirm"
          onChange={onChange}
          value={passwordConfirm}
          placeholder="Password Check"
          type="password"
        />
        {passwordConfirmError ? (
          <ErrorMsg>비밀번호가 일치하지 않습니다</ErrorMsg>
        ) : null}
        <Input
          type="submit"
          value={isLoading ? 'Loading...' : 'create Account'}
        />
      </Form>
      {error !== '' ? <Error>{error} </Error> : null}
      <Switcher>
        Do you have an account?
        <Link to="/Login">Login</Link>
      </Switcher>
      <GithubButton />
    </Wrapper>
  );
}
