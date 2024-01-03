import styled from 'styled-components';
import { ITweet } from './timeline';
import { auth, db, storage } from '../routes/firebase';
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Comment from './comment';
import { LikeButton } from './auth-components';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  line-height: 24px;
`;
const Form = styled.form`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div``;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
`;

const Payload = styled.p`
  margin: 10px 0;
  font-size: 18px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  font-size: 12px;
  border: 0;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;
const EditButton = styled.button`
  background-color: transparent;
  color: #1d9bf0;
  font-weight: 600;
  font-size: 12px;
  border: 1px solid #1d9bf0;
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

// const Form = styled.form`
//     display: grid;
//     grid-template-columns: 3fr 1fr;
//     padding: 20px;
//     border: 1px solid rgba(255, 255, 255, 0.5);
//     border-radius: 15px;`;

const TextArea = styled.textarea`
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

const PhotoZone = styled.input`
  display: none;
`;
const FileLabel = styled.label`
  width: 100%;
  padding: 10px 0;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;
const PhotoEdit = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

const ConfirmButton = styled.button`
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

const TextBox = styled.div`
  position: relative;
`;
const TextCounter = styled.span`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 14px;
`;

const DisplayFlex = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  &.space-between {
    justify-content: space-between;
  }
`;

const Avatar = styled.div`
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

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
`;

export default function Tweet({
  username,
  photo,
  tweet,
  userId,
  id,
  likes,
}: ITweet) {
  const [isEdit, setEdit] = useState(false);
  // 수정한 정보를 저장하기위한 hooks
  const [editTweet, setEditTweet] = useState(tweet);
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [showPhoto, setShowphoto] = useState(photo);
  const [testCount, setTextCount] = useState(tweet.length);
  const [avatar, setAvatar] = useState('');

  const [like, isLike] = useState(false);

  const navigation = useNavigate();

  const user = auth.currentUser;

  useEffect(() => {
    const avatarImporter = async () => {
      const avatarRef = await ref(storage, `avartars/${userId}`);
      try {
        const avatarImg = await getDownloadURL(avatarRef);
        setAvatar(avatarImg);
      } catch {
        setAvatar('');
      }
    };
    avatarImporter();
    if (likes.includes(user?.uid ?? '')) {
      isLike(true);
    }
  }, [userId]);
  const onDelete = async () => {
    const ok = confirm('해당 트윗을 삭제 하시겠습니까?');
    if (!ok || user?.uid !== userId) return;
    try {
      // uid가 로그인된 아이디와 일치하면 db안에 해당 트윗을 삭제
      await deleteDoc(doc(db, 'tweets', id));
      // 이미지가 있을경우 해당 이미지도 삭제
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    }
  };
  // EDIT 버튼 클릭시 입력창으로 전환
  const onEditMode = () => {
    setEdit(!isEdit);
    setEditTweet(tweet);
    setEditPhoto(null);
    setShowphoto(photo);
  };

  const onEditText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textValue = e.target.value;
    setEditTweet(textValue);
    setTextCount(textValue.length);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files && files.length === 1) {
      if (files[0].size < 1048576) {
        setEditPhoto(files[0]);
        setShowphoto(URL.createObjectURL(files[0]));
      } else {
        alert('1MB이하의 이미지만 업로드 할 수 있습니다.');
      }
    }
  };

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userDoc = doc(db, 'tweets', id);

    if (user?.uid !== userId) return;

    try {
      //트윗 글 수정
      await updateDoc(userDoc, {
        tweet: editTweet,
      });
      // 이미지가 있을경우 해당 이미지도 삭제 및 새 이미지 저장
      if (editPhoto) {
        if (photo) {
          const onriginRef = ref(storage, `tweets/${user.uid}/${id}`);
          await deleteObject(onriginRef);
        }

        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        const result = await uploadBytes(photoRef, editPhoto);
        const url = await getDownloadURL(result.ref);
        updateDoc(userDoc, {
          photo: url,
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setEdit(false);
    }
  };
  const onButtonEdit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const userDoc = doc(db, 'tweets', id);

    if (user?.uid !== userId) return;

    try {
      //트윗 글 수정
      await updateDoc(userDoc, {
        tweet: editTweet,
      });
      // 이미지가 있을경우 해당 이미지도 삭제 및 새 이미지 저장
      if (editPhoto) {
        if (photo) {
          const onriginRef = ref(storage, `tweets/${user.uid}/${id}`);
          await deleteObject(onriginRef);
        }

        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        const result = await uploadBytes(photoRef, editPhoto);
        const url = await getDownloadURL(result.ref);
        updateDoc(userDoc, {
          photo: url,
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setEdit(false);
    }
  };
  const goProfile = () => {
    navigation(`/profile?${userId}`);
  };

  const onLike = async () => {
    try {
      // 좋아요 이미 누른 상태일경우
      const userDoc = doc(db, 'tweets', id);
      if (likes.includes(user?.uid ?? '')) {
        await updateDoc(userDoc, {
          likes: arrayRemove(user?.uid),
        });
      } else {
        // 좋아요 누르지않은 상태일경우
        await updateDoc(userDoc, {
          likes: arrayUnion(user?.uid),
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setEdit(false);
    }

    isLike(!like);
  };

  return (
    <>
      {isEdit ? (
        <Form onSubmit={onEdit}>
          <TextBox>
            <TextArea
              rows={5}
              maxLength={180}
              value={editTweet}
              onChange={onEditText}
              placeholder={tweet}
              required
            />
            <TextCounter>{testCount} / 180</TextCounter>
          </TextBox>
          <PhotoEdit>
            {photo ? <Photo src={showPhoto} /> : null}

            <FileLabel htmlFor="file-btn">
              {editPhoto ? 'File Added' : 'Add Photo'}
            </FileLabel>
            <PhotoZone
              type="file"
              id="file-btn"
              accept="image/*"
              onChange={onFile}
            />
          </PhotoEdit>

          <Column>
            <Column>
              <EditButton onClick={onEditMode}>Cancel</EditButton>
              <ConfirmButton onClick={onButtonEdit}>Edit</ConfirmButton>
            </Column>
          </Column>
        </Form>
      ) : (
        <Wrapper>
          <Column>
            <DisplayFlex className="space-between">
              <DisplayFlex>
                <Avatar onClick={goProfile}>
                  {avatar ? (
                    <AvatarImg src={avatar} />
                  ) : (
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  )}
                </Avatar>
                <Username onClick={goProfile}>{username}</Username>
              </DisplayFlex>
              <LikeButton
                onClick={onLike}
                className={like ? 'like-active' : ''}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
                <span>{likes.length > 999 ? '999+' : likes.length}</span>
              </LikeButton>
            </DisplayFlex>
            <Payload>
              {tweet && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: tweet.replace(/\n/g, '<br />'),
                  }}
                />
              )}
            </Payload>
            <DisplayFlex className="space-between">
              <DisplayFlex>
                {user?.uid === userId ? (
                  <DeleteButton onClick={onDelete}>Delete</DeleteButton>
                ) : null}
                {user?.uid === userId ? (
                  <EditButton onClick={onEditMode}>Edit</EditButton>
                ) : null}
              </DisplayFlex>
            </DisplayFlex>
          </Column>
          <Column>{photo ? <Photo src={photo} /> : null}</Column>
          <Comment tweetId={id} />
        </Wrapper>
      )}
    </>
  );
}
