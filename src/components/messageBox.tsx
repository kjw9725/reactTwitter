import { useEffect, useRef, useState } from 'react';
import {
  ChatBox,
  Chatter,
  Close,
  Input,
  PositionBox,
  SearchIcon,
  dateCalc,
} from './auth-components';
import { auth, db } from '../routes/firebase';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
export interface Message {
  message: string;
  createdAt: number;
  displayName: string | undefined;
  fromId: string | undefined;
  toId: string;
  displayDate: string;
  read: boolean;
}

interface messageboxType {
  msgId: string;
  onMsgChange: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const MessageBox: React.FC<messageboxType> = (props) => {
  const [chatText, setChatText] = useState('');
  const { msgId, onMsgChange } = props;
  const [chatData, setChatData] = useState<Message[] | undefined>();
  const user = auth.currentUser;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

        setChatData(orderedMessages);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    // 읽음처리 함수
    const updateReadStatus = async (msgId: string) => {
      try {
        const user = auth.currentUser;

        if (!user) {
          console.error('User not logged in.');
          return;
        }

        // Find messages where fromId is equal to msgId and toId is equal to user's UID
        const readQuery = query(
          collection(db, 'messages'),
          where('fromId', '==', msgId),
          where('toId', '==', user.uid),
        );

        const querySnapshot = await getDocs(readQuery);

        // Update the read field to true for each matching message
        const updatePromises = querySnapshot.docs.map(async (messageDoc) => {
          const messageRef = doc(db, 'messages', messageDoc.id);
          await updateDoc(messageRef, { read: true });
        });

        await Promise.all(updatePromises);

        console.log('Read status updated successfully.');
      } catch (error) {
        console.error('Error updating read status:', error);
      }
    };
    updateReadStatus(msgId);

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
      scrollToBottom();
    };
  }, [db, user?.uid, msgId, setChatData]);
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // 메시지 전송
  const onChat = async (e: React.MouseEvent<HTMLFormElement>) => {
    const user = auth.currentUser;
    e.preventDefault();
    console.log(msgId);

    if (chatText) {
      await addDoc(collection(db, 'messages'), {
        message: chatText,
        createdAt: Date.now(),
        displayName: user?.displayName,
        fromId: user?.uid,
        toId: msgId,
        displayDate: dateCalc(),
        read: false,
      });
      scrollToBottom();
    }

    setChatText('');
  };
  return (
    <Chatter onSubmit={onChat}>
      <Close onClick={onMsgChange}>
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
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </Close>
      <ChatBox ref={scrollRef}>
        {chatData?.map((chat, index) => (
          <div
            key={index}
            className={chat.fromId === user?.uid ? 'right-box' : 'left-box'}
          >
            {chat.fromId === user?.uid ? (
              <>
                {chat.read ? null : <span className="read">1</span>}
                <div className="right">{chat.message}</div>
              </>
            ) : (
              <>
                <span>{chat.displayName}</span>
                <div className="left">{chat.message}</div>
              </>
            )}
          </div>
        ))}
      </ChatBox>
      <PositionBox>
        <Input
          className="message"
          value={chatText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setChatText(e.target.value)
          }
        />
        <SearchIcon className="send">
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
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </SearchIcon>
      </PositionBox>
    </Chatter>
  );
};

export default MessageBox;
