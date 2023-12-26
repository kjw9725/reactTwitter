import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import styled from "styled-components";
import { auth, db } from "../routes/firebase";  
import { Column, ConfirmButton, TextArea } from "./auth-components";

type ListType = {
    list: {
        avatar: string;
        name: string;
        text: string;
        createdAt: number;
        tweetId: string;
        userId: string;
        displayDate: string;
        id: string;
    };
};
 

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
const TextBox = styled.div`
  padding: 10px;
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
    &:hover{
        background-color: #1d9bf0;
        color: white;
    }
    `;


const CommentEdit:React.FC<ListType> = (props) => {
    const {list} = props;
    const [isEdit, setIsEdit] = useState(false);
    const [changeComment, setChangeComment] = useState(list.text);
    const user = auth.currentUser;

    const onCancel = () =>{
        setIsEdit(false);
    }

    const onDelete = async (e:React.MouseEvent<HTMLButtonElement>) => {
        const eventTarget = e.target as HTMLButtonElement;
        const commentId = eventTarget.value;
        try{
            // uid가 로그인된 아이디와 일치하면 db안에 해당 트윗을 삭제
            await deleteDoc(doc(db, 'comments', commentId)); 
        }catch(e){
            console.log(e);
        } 
      }
    
      const onEditMode = async() => {
        if(isEdit){
            
        const userDoc = doc(db, "comments", list.id);

        if(user?.uid !== list.userId) return;

        try{ 
            await updateDoc(userDoc, {
                text: changeComment,
            }); 
        }catch(e){
            console.log(e);
        }finally{
            setIsEdit(false);
        }
        }else{
            setIsEdit(true)
        }
      }

      const onChange = (e:React.ChangeEvent<HTMLTextAreaElement>) =>{
        setChangeComment(e.target.value);
      }
    return(
        <>
        {isEdit ? ( 
            <Column>
                <TextArea value={changeComment} onChange={onChange}/>
                <DisplayFlex> 
                <EditButton onClick={onCancel}>Cancel</EditButton>
                <ConfirmButton onClick={onEditMode}>Edit</ConfirmButton>
                </DisplayFlex>
            </Column>
          ) : (
          <TextBox>
            {list.text}
          </TextBox>
          )}
          {user?.uid == list.userId && isEdit == false ? (
          <DisplayFlex>
            <DeleteButton value={list.id} onClick={onDelete}>Delete</DeleteButton>
            <EditButton onClick={onEditMode}>Edit</EditButton>
          </DisplayFlex>
          ) : null }
          </>

    )
}
export default CommentEdit;