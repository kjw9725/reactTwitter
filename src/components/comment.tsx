import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Avatar, AvatarImg, Input } from "./auth-components";
import { auth, db } from "../routes/firebase";  
import { addDoc, collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore"; 
import { Unsubscribe } from "firebase/auth";
import CommentEdit from "./commentEdit";

interface CommentProps{
  tweetId: string;
}
export interface CommentType{
  avatar: string,
  name: string,
  text: string,
  createdAt: number,
  tweetId: string,
  userId: string,
  displayDate: string,
  id: string
}

const ShowComment = styled.div`
  width: 100%;
  margin-top: 10px;
  &:hover{
    text-decoration: underline;
    cursor: pointer;
  }
`;
const DisplayFlex = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  &.align-center{
    align-items: center; 
  }
  &.justify-between{
    justify-content: space-between;
    align-items: flex-end;
  }
  .font12{
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
  &:hover{
      background-color: #1d9bf0;
      color: white;
  }
`;

const CommentList = styled.div``;
const Comments = styled.div`
  border-bottom: 1px solid #ffffff54;
  padding-bottom: 18px;
`;
 


const Comment: React.FC<CommentProps> = (props) => {
  const {tweetId} = props;
  const [isComment, setIsComment] = useState(false);
  const [comment, setComment] = useState('');
  const [commentList, setCommentList] = useState<CommentType[]>([]); 
  const user = auth.currentUser;
  let unsubscribe: Unsubscribe | null = null;

  useEffect(()=>{
    fetchTweets();
    return () => {
        unsubscribe && unsubscribe();
    }
  }, [tweetId])

  const fetchTweets = async() => {
    try{
      const tweetsQuery = query(
          collection(db, "comments"),
          where('tweetId', '==', tweetId),
          orderBy("createdAt", "desc"),
          limit(25)
      );
      unsubscribe = onSnapshot(tweetsQuery, (snapshot) => {
          const data = snapshot.docs.map((doc) => {
              const {avatar, createdAt, userId, name, text, tweetId, displayDate} = doc.data();
              return {
                  name,
                  createdAt,
                  userId,
                  tweetId,
                  avatar,
                  text,
                  id: doc.id,
                  displayDate
              };
          });
          setCommentList(data);
          console.log('commentData',commentList); 
      })
    } catch(e){
      console.log
    }
  };

  const showComment = () => {
    setIsComment(!isComment);
    console.log('user Id', user?.uid);
    fetchTweets();
  }

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => { 
    setComment(e.target.value); 

  }
  const dateCalc = () =>{ 
    const now = new Date(new Date().getTime());
    
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줍니다.
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes(); 

    return (`${year}년 ${month}월 ${day}일 ${hours}:${minutes}`)
 
  }
  const onComment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if(comment.trim() !== ''){ 
      const nowDate = dateCalc();
    try{
      await addDoc(collection(db, "comments"), {
        tweetId: tweetId,
        name: user?.displayName,
        avatar: user?.photoURL ? user?.photoURL : '',
        userId: user?.uid,
        text: comment,
        createdAt: Date.now(),
        displayDate: nowDate
    })

    }catch(e){
      console.log(e);
    }

      setComment("");
    }

  } 

  return(
    <>
      {isComment ? (
          <CommentBox>
            <ShowComment onClick={showComment}>댓글 닫기</ShowComment>
              <DisplayFlex>
                  <Input placeholder="댓글을 입력하세요." value={comment} onChange={onChange}/>
                  <ConfirmButton onClick={onComment}>전송</ConfirmButton>
                </DisplayFlex>

                <CommentList>
                {commentList.map((list) => {
                  return(
                    <Comments key={list.id}>
                      <DisplayFlex className="justify-between">
                        <DisplayFlex className="align-center">
                          <Avatar>
                            {list.avatar ? <AvatarImg src={list.avatar} alt="avatar" className="avatar"/>  : (<svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>)}
                            
                          </Avatar>
                          <div className="user-name">{list.name}</div>
                        </DisplayFlex>
                        <span className="font12">{list.displayDate}</span>
                      </DisplayFlex>
                      <CommentEdit list={list}/>
                    </Comments>
                    )
                })}
                  
                </CommentList>
          </CommentBox>
        ) : <ShowComment onClick={showComment}>댓글 보기</ShowComment>
      }
    </>
  )
}
export default Comment;
 