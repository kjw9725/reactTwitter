import { getDownloadURL, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { auth, db, storage } from '../routes/firebase';
import { Avatar, AvatarImg, Column, DisplayFlex } from './auth-components';
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import MessageBox, { Message } from './messageBox';
interface MsgIdType {
  msgId: string | undefined;
}

const Messenger = styled.div`
  border: 1px solid gray;
  padding: 20px 15px;
  cursor: pointer;
`;
const Username = styled.span`
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
`;
const LastMessage = styled.div``;

const MsgCounter = styled.span`
  display: flex;
  width: 25px;
  height: 25px;
  font-size: 14px;
  border-radius: 50%;
  background: red;
  justify-content: center;
  align-items: center;
`;

const MessageList: React.FC<MsgIdType> = (props) => {
  const { msgId } = props;
  const user = auth.currentUser;
  const [chatData, setChatData] = useState<Message[] | undefined>();
  const [avatar, setAvatar] = useState('');
  // const [lastMsg, setLastMsg] = useState('');
  const [messageUser, setMessageUser] = useState('');
  const [isMsg, setIsMsg] = useState(false);
  const [msgCount, setMsgCount] = useState<number>(0);

  useEffect(() => {
    const avatarImporter = async () => {
      const avatarRef = await ref(storage, `avartars/${msgId}`);
      try {
        const avatarImg = await getDownloadURL(avatarRef);
        setAvatar(avatarImg);
        console.log(avatarImg);
      } catch {
        setAvatar('');
      }
    };

    const q1 = query(
      collection(db, 'messages'),
      where('fromId', '==', user?.uid),
      where('toId', '==', msgId),
    );

    const q2 = query(
      collection(db, 'messages'),
      where('fromId', '==', msgId),
      where('toId', '==', user?.uid),
    );
    // 메신져 유저이름 가져오기
    const getUserName = async () => {
      try {
        const q = query(collection(db, 'users'), where('userId', '==', msgId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // 데이터가 존재하는 경우
          const userData = querySnapshot.docs[0].data();
          const displayName = userData.displayName;
          console.log('displayName:', displayName);
          setMessageUser(displayName);
        } else {
          // 해당 userId를 가진 문서가 없는 경우
          console.log('해당 userId를 가진 문서가 없습니다.');
          return null; // 또는 다른 처리를 수행할 수 있습니다.
        }
      } catch (error) {
        console.error('Firestore 데이터 불러오기 실패:', error);
        return null; // 또는 다른 처리를 수행할 수 있습니다.
      }
    };
    // 메시지 데이터 가져오기
    const getMsg = async () => {
      try {
        const [result1, result2] = await Promise.all([
          getDocs(q1),
          getDocs(q2),
        ]);

        const combinedResults = [...result1.docs, ...result2.docs];

        const orderedMessages = combinedResults
          .map((doc) => doc.data() as Message)
          .sort((a, b) => a.createdAt - b.createdAt);

        // setLastMsg(orderedMessages[orderedMessages.length - 1].message);
        setChatData(orderedMessages);
        console.log(orderedMessages);
        // 새 메시지 카운트
        setMsgCount(0);
        for (let i = orderedMessages?.length - 1; i >= 0; i--) {
          if (orderedMessages[i].fromId === msgId) {
            if (orderedMessages[i].read === false) {
              setMsgCount((prevCount) => prevCount + 1);
              console.log(msgCount);
            } else {
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    getUserName();
    avatarImporter();

    console.log('messageList', msgId);

    // Initial data fetch
    getMsg();
    const unsubscribe1 = onSnapshot(q1, () => {
      getMsg();
    });

    const unsubscribe2 = onSnapshot(q2, () => {
      getMsg();
    });
    // Cleanup subscriptions
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [msgId, setChatData]);

  const msgChange = () => {
    setIsMsg(!isMsg);
  };

  return (
    <Messenger>
      <DisplayFlex onClick={msgChange}>
        <DisplayFlex>
          <Avatar>
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
          <Column>
            <Username>{messageUser}</Username>
            {chatData ? (
              <LastMessage>{chatData[chatData.length - 1].message}</LastMessage>
            ) : null}
          </Column>
        </DisplayFlex>
        {msgCount > 0 ? <MsgCounter>{msgCount}</MsgCounter> : null}
      </DisplayFlex>
      {isMsg ? (
        <MessageBox msgId={msgId || ''} onMsgChange={msgChange} />
      ) : null}
    </Messenger>
  );
};

export default MessageList;
