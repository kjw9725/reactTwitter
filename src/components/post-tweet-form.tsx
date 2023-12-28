import { addDoc, collection, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import styled from 'styled-components';
import { auth, db, storage } from '../routes/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextArea = styled.textarea`
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
const TextBox = styled.div`
  position: relative;
`;
const TextCounter = styled.span`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 14px;
`;

const AttachFileButton = styled.label`
  padding: 10px 0;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const AttachFileInput = styled.input`
  display: none;
`;

const SubmitBtn = styled.input`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 10px 0;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

export default function PostTweetForm() {
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [testCount, setTextCount] = useState(0);
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(e.target.value);
    setTextCount(tweet.length);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files && files.length === 1) {
      if (files[0].size < 1048576) {
        setFile(files[0]);
      } else {
        alert('1MB이하의 이미지만 업로드 할 수 있습니다.');
      }
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || tweet === '' || tweet.length > 180) return;

    try {
      setLoading(true);
      const doc = await addDoc(collection(db, 'tweets'), {
        tweet,
        createdAt: Date.now(),
        username: user.displayName || 'Annoymous',
        userId: user.uid,
        likes: [],
      });
      if (file) {
        const locationRef = ref(storage, `tweets/${user.uid}/${doc.id}`);

        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);
        await updateDoc(doc, {
          photo: url,
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setTweet('');
      setFile(null);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <TextBox>
        <TextArea
          rows={5}
          maxLength={180}
          value={tweet}
          onChange={onChange}
          placeholder="What is happening?!"
          required
        />
        <TextCounter>{testCount} / 180</TextCounter>
      </TextBox>
      <AttachFileButton htmlFor="file">
        {file ? 'File Added' : 'Add Photo'}
      </AttachFileButton>
      <AttachFileInput
        type="file"
        id="file"
        accept="image/*"
        onChange={onFileChange}
      />
      <SubmitBtn type="submit" value="Post Tweet" />
    </Form>
  );
}
