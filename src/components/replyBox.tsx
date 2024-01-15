import styled from 'styled-components';
import { Avatar, AvatarImg, DisplayFlex, LikeButton } from './auth-components';
import ReplyEdit from './replyEdit';
import { useState } from 'react';
import { auth, db } from '../routes/firebase';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
type replyType = {
  list: {
    name: string;
    avatar: string;
    text: string;
    createdAt: number;
    commentId: string;
    userId: string;
    displayDate: string;
    id: string;
    likes: string[];
  };
};

const Comments = styled.div`
  border-bottom: 1px solid #ffffff54;
  padding-bottom: 18px;
`;
const RepliesBox: React.FC<replyType> = (props) => {
  const { list } = props;
  const user = auth.currentUser;
  const [isLike, setIsLike] = useState(
    list.likes.includes(user?.uid ?? '') ? true : false,
  );

  const onLike = async () => {
    try {
      // 좋아요 이미 누른 상태일경우
      const userDoc = doc(db, 'replies', list.id);
      if (list.likes.includes(user?.uid ?? '')) {
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
    }

    setIsLike(!isLike);
  };

  return (
    <>
      <Comments>
        <DisplayFlex className="justify-between">
          <DisplayFlex>
            <DisplayFlex className="align-center">
              <Avatar>
                {list.avatar ? (
                  <AvatarImg
                    src={list.avatar}
                    alt="avatar"
                    className="avatar"
                  />
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
              <div className="user-name">{list.name}</div>
            </DisplayFlex>
            <LikeButton
              onClick={onLike}
              className={isLike ? 'like-active' : ''}
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
              <span title={list.likes.length.toString()}>
                {list.likes.length > 999 ? '999+' : list.likes.length}
              </span>
            </LikeButton>
          </DisplayFlex>
          <span className="font12">{list.displayDate}</span>
        </DisplayFlex>
        <ReplyEdit list={list} />
      </Comments>
    </>
  );
};

export default RepliesBox;
