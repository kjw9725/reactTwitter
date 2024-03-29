import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import styled from 'styled-components';
import { auth, db } from '../routes/firebase';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';

const Button = styled.span`
  width: 100%;
  margin-top: 40px;
  background-color: white;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 50px;
  border: 0;
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  color: black;
  cursor: pointer;
`;

const Logo = styled.img`
  height: 25px;
`;

export default function GithubButton() {
  const navigate = useNavigate();
  const onClick = async () => {
    // console.log(isSignup);
    const provider = new GithubAuthProvider();
    await signInWithPopup(auth, provider);
    await addDoc(collection(db, 'users'), {
      email: auth.currentUser?.email,
      userId: auth.currentUser?.uid,
      displayName: auth.currentUser?.displayName,
    });
    navigate('/');
  };

  return (
    <Button onClick={onClick}>
      <Logo src="/github-logo.svg" />
      Continue with Github
    </Button>
  );
}
