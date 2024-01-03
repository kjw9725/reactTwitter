import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Input } from './auth-components';
import { auth, db } from '../routes/firebase';
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { Unsubscribe } from 'firebase/auth';
import CommentData from './commentBox';

interface CommentProps {
  tweetId: string;
}
export interface CommentType {
  avatar: string;
  name: string;
  text: string;
  createdAt: number;
  tweetId: string;
  userId: string;
  displayDate: string;
  id: string;
  likes: string[];
}

const ShowComment = styled.div`
  width: 100%;
  margin-top: 10px;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;
const DisplayFlex = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  &.align-center {
    align-items: center;
  }
  &.justify-between {
    justify-content: space-between;
    align-items: flex-end;
  }
  .font12 {
    font-size: 12px;
  }
`;
const CommentBox = styled.div`
  grid-column: span 4;
`;

const ConfirmButton = styled.button`
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

const CommentList = styled.div``;

const Comment: React.FC<CommentProps> = (props) => {
  const { tweetId } = props;
  const [isComment, setIsComment] = useState(false);
  const [comment, setComment] = useState('');
  const [commentList, setCommentList] = useState<CommentType[]>([]);
  const user = auth.currentUser;
  let unsubscribe: Unsubscribe | null = null;

  useEffect(() => {
    fetchTweets();
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [tweetId]);

  const fetchTweets = async () => {
    try {
      const tweetsQuery = query(
        collection(db, 'comments'),
        where('tweetId', '==', tweetId),
        orderBy('createdAt', 'desc'),
        limit(25),
      );
      unsubscribe = onSnapshot(tweetsQuery, (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const {
            avatar,
            createdAt,
            userId,
            name,
            text,
            tweetId,
            displayDate,
            likes,
          } = doc.data();
          return {
            name,
            createdAt,
            userId,
            tweetId,
            avatar,
            text,
            id: doc.id,
            displayDate,
            likes,
          };
        });
        setCommentList(data);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const showComment = () => {
    setIsComment(!isComment);
    fetchTweets();
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };
  const dateCalc = () => {
    const now = new Date(new Date().getTime());

    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줍니다.
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
  };
  const onComment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (comment.trim() !== '') {
      const nowDate = dateCalc();
      try {
        await addDoc(collection(db, 'comments'), {
          tweetId: tweetId,
          name: user?.displayName,
          avatar: user?.photoURL ? user?.photoURL : '',
          userId: user?.uid,
          text: comment,
          createdAt: Date.now(),
          displayDate: nowDate,
          likes: [],
        });
      } catch (e) {
        console.log(e);
      }

      setComment('');
    }
  };

  return (
    <>
      {isComment ? (
        <CommentBox>
          <ShowComment onClick={showComment}>댓글 닫기</ShowComment>
          <DisplayFlex>
            <Input
              placeholder="댓글을 입력하세요."
              value={comment}
              onChange={onChange}
            />
            <ConfirmButton onClick={onComment}>전송</ConfirmButton>
          </DisplayFlex>

          <CommentList>
            {commentList.map((list) => {
              return <CommentData key={list.id} list={list} />;
            })}
          </CommentList>
        </CommentBox>
      ) : (
        <ShowComment onClick={showComment}>댓글 보기</ShowComment>
      )}
    </>
  );
};
export default Comment;
