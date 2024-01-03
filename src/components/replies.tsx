import { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Column,
  DisplayFlex,
  Input,
  ListType,
  SendButton,
  dateCalc,
} from './auth-components';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from '../routes/firebase';
import { Unsubscribe } from 'firebase/database';
import RepliesBox from './replyBox';

type replyType = {
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
const ReplyBox = styled.div`
  margin-left: 15px;
`;

const ReplyButton = styled.div`
  display: flex;
  cursor: pointer;
  margin-top: 10px;
  align-items: center;
  svg {
    width: 16px;
    margin-right: 4px;
  }
`;

const Replies: React.FC<ListType> = (props) => {
  const { list } = props;
  const user = auth.currentUser;
  const [isReply, setIsReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyList, setReplyList] = useState<replyType[]>([]);
  let unsubscribe: Unsubscribe | null = null;

  useEffect(() => {
    fetchTweets();
    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  const fetchTweets = async () => {
    try {
      const replyQuery = query(
        collection(db, 'replies'),
        where('commentId', '==', list.id),
        orderBy('createdAt', 'desc'),
      );
      unsubscribe = onSnapshot(replyQuery, (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const {
            name,
            avatar,
            userId,
            commentId,
            text,
            createdAt,
            displayDate,
            likes,
          } = doc.data();
          return {
            name,
            avatar,
            userId,
            commentId,
            text,
            createdAt,
            displayDate,
            id: doc.id,
            likes,
          };
        });
        setReplyList(data);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const showReplie = () => {
    setIsReply(!isReply);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value);
  };
  const onReply = async () => {
    if (replyText) {
      try {
        await addDoc(collection(db, 'replies'), {
          name: user?.displayName,
          avatar: user?.photoURL ? user?.photoURL : '',
          userId: user?.uid,
          commentId: list.id,
          text: replyText,
          createdAt: Date.now(),
          displayDate: dateCalc(),
          likes: [],
        });
        setReplyText('');
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <>
      {isReply ? (
        <ReplyBox>
          <ReplyButton onClick={showReplie}>
            <svg
              data-slot="icon"
              fill="none"
              strokeWidth="1.5"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 4.5 15 15m0 0V8.25m0 11.25H8.25"
              ></path>
            </svg>
            답글닫기
          </ReplyButton>
          <DisplayFlex>
            <Input
              placeholder="답글을 입력하세요."
              value={replyText}
              onChange={onChange}
            />
            <SendButton onClick={onReply}>전송</SendButton>
          </DisplayFlex>

          <Column>
            {replyList.map((list) => {
              return <RepliesBox key={list.id} list={list} />;
            })}
          </Column>
        </ReplyBox>
      ) : (
        <ReplyBox>
          <ReplyButton onClick={showReplie}>
            <svg
              data-slot="icon"
              fill="none"
              strokeWidth="1.5"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 4.5 15 15m0 0V8.25m0 11.25H8.25"
              ></path>
            </svg>
            답글보기
          </ReplyButton>
        </ReplyBox>
      )}
    </>
  );
};

export default Replies;
