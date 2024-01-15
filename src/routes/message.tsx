import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { auth, db } from './firebase';
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import MessageBox, { Message } from '../components/messageBox';
import {
  PositionBox,
  SearchBox,
  SearchIcon,
} from '../components/auth-components';
import MessageList from '../components/messageList';
interface MessageIdType {
  messageId: string | undefined;
}
interface UserData {
  displayName: string;
  userId: string;
  email: string;
}

const Messenger = styled.div`
  margin-top: 10px;
`;

export default function Message() {
  const msgId = window.location.href.split('?')[1];
  const [isMsg, setIsMsg] = useState(msgId ? true : false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<UserData[]>([]);
  const [messageId, setMessageId] = useState<MessageIdType[]>();
  useEffect(() => {
    // 유저 메시지 아이콘 클릭후 진입했을때
    const userImporter = async () => {
      try {
        if (!msgId) return;
        const querySnapshot = await getDocs(
          query(collection(db, 'users'), where('userId', '==', msgId)),
        );

        if (!querySnapshot.empty) {
          // 문서가 존재하는 경우 데이터 가져오기
          const userDB = querySnapshot.docs[0].data() as UserData;
          setUserData(userDB);
          console.log(userData);
        } else {
          console.log('해당 userId를 가진 문서가 없습니다.');
        }
      } catch (error) {
        console.error('Firestore 데이터 불러오기 실패:', error);
      }
    };

    const getMsgList = async () => {
      const user = auth.currentUser;
      // 보낸사람이 로그인된 유저일때
      const q1 = query(
        collection(db, 'messages'),
        where('fromId', '==', user?.uid),
      );

      // 받는사람이 로그인된 유저일때
      const q2 = query(
        collection(db, 'messages'),
        where('toId', '==', user?.uid),
      );
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

          // const uniqueMessagesSet = new Set([
          //   orderedMessages.map((msg) =>
          //     msg.toId !== user?.uid ? msg.toId : msg.fromId,
          //   ),
          // ]);
          // const uniqueMessage = Array.from(uniqueMessagesSet).map(
          //   (messageId) => messageId,
          // );
          const uniqueMessagesSet = new Set<string | undefined>();
          orderedMessages.forEach((msg) => {
            uniqueMessagesSet.add(
              msg.toId !== user?.uid ? msg.toId : msg.fromId,
            );
          });

          const uniqueMessage = Array.from(uniqueMessagesSet).map(
            (uniqueId) => {
              // Find the corresponding message based on uniqueId
              const correspondingMessage = orderedMessages.find((msg) =>
                msg.toId !== user?.uid
                  ? msg.toId === uniqueId
                  : msg.fromId === uniqueId,
              );

              // Ensure that correspondingMessage is not undefined and contains messageId
              if (
                correspondingMessage &&
                correspondingMessage.fromId === user?.uid
              ) {
                return {
                  messageId: correspondingMessage.toId,
                };
              } else {
                return {
                  messageId: correspondingMessage?.fromId,
                };
              }
            },
          );
          setMessageId(uniqueMessage);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      // Initial data fetch
      getMsg();
      const unsubscribe1 = onSnapshot(q1, () => {
        getMsg();
      });

      const unsubscribe2 = onSnapshot(q2, () => {
        getMsg();
      });

      return () => {
        unsubscribe1();
        unsubscribe2();
      };
    };
    userImporter();
    getMsgList();
  }, [msgId]);

  const msgChange = () => {
    setIsMsg(!isMsg);
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    if (!searchText.trim()) return setSearchResult([]);

    try {
      const usersCollection = collection(db, 'users');

      const q = query(
        usersCollection,
        where('displayName', '>=', searchText.trim()),
        where('displayName', '<=', searchText.trim() + '\uf8ff'),
      );

      const querySnapshot = await getDocs(q);

      querySnapshot.docs.map((doc) => {
        const data = doc.data() as UserData;
        setSearchResult([]);
        console.log(searchResult);
        return setSearchResult((prevState) => [...prevState, data]);
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <>
      <PositionBox>
        <SearchBox onChange={onChange} value={searchText} />
        <SearchIcon type="submit">
          <svg
            data-slot="icon"
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </SearchIcon>
        {/* 채팅창 or 채팅목록 */}
        <Messenger>
          {isMsg ? (
            <MessageBox msgId={msgId} onMsgChange={msgChange} />
          ) : (
            messageId &&
            messageId.map((data) => (
              <MessageList key={data.messageId} msgId={data.messageId} />
            ))
          )}
        </Messenger>
      </PositionBox>
    </>
  );
}
