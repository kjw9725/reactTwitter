import React, { useState } from "react";
import styled from "styled-components";
import { Error, Input, Title } from "./auth-components";
import { auth } from "../routes/firebase";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";


const PasswordButton = styled.button`
background-color: transparent;
border: 1px solid #1d9bf0;
color: #1d9bf0;
font-weight: 600;
font-size: 18px;
padding: 5px 10px;
text-transform: uppercase;
border-radius: 5px;
cursor: pointer;
height: 44px;
&:hover{
    background-color: #1d9bf0;
    color: white;
}`;

const DeleteModal = styled.div`
        position: fixed;
        display: flex;
        left: 50%;
        top: 30%;
        width: 720px;
        background-color: black;
        border: 1px solid white;
        transform: translate(-50%, -50%);
        text-align: center;
        padding: 20px;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        gap: 30px;
        .close{
            position: absolute;
            top: 10px;
            right: 10px;
            width: 20px;
            height: 20px;
            color: gray;
        }
    `;
 



export default function PasswordChange(){ 
    const [userInput, setUserInput] = useState({ 
        currentPassword: '',
        changedPassword: '',
        reChangedPassword: '' ,
        isModal: false,
        passwordError: false
    });

    const {currentPassword, changedPassword, reChangedPassword, passwordError, isModal} = userInput;

    const onModal = () => {
        // Input 초기화
        setUserInput({
            currentPassword: '',
            changedPassword: '',
            reChangedPassword: '',
            isModal: !userInput.isModal,
            passwordError: false
        })
    }

    const onChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setUserInput({
            ...userInput,
            [name]: value
        })
    }

    const onChangePassword = async() => {
        const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        try{
            const userData = auth.currentUser;

            if(userData && currentPassword && userData.email){
                await signInWithEmailAndPassword(auth, userData.email, currentPassword);
            }

            if(userData && passwordReg.test(changedPassword) && changedPassword === reChangedPassword){
                await updatePassword(userData, changedPassword);
                alert("비밀번호가 변경되었습니다. 다시 로그인 해주세요");
                auth.signOut;
                window.location.replace('/');
            }
             
        } catch(e){
            setUserInput({
                ...userInput,
                passwordError: true,
            })
        }
    }

    return (
        <>
        <PasswordButton onClick={onModal}>비밀번호 변경</PasswordButton>

        { isModal ?(
            <DeleteModal>
                <Title>비밀번호 변경</Title>
                <svg xmlns="http://www.w3.org/2000/svg" onClick={onModal} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 close">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                
                <Input type="password" name="currentPassword" value={currentPassword} placeholder="기존 비밀번호를 입력해주세요" onChange={onChange}/>
                <Input type="password" name="changedPassword" value={changedPassword} placeholder="변경하실 비밀번호를 입력해주세요" onChange={onChange}/>
                <Input type="password" name="reChangedPassword" value={reChangedPassword} placeholder="변경하실 비밀번호를 다시 입력해주세요" onChange={onChange}/>
                {passwordError ? <Error>비밀번호를 다시 확인해 주세요</Error> : null}

                <PasswordButton onClick={onChangePassword}>비밀번호 변경</PasswordButton>

            </DeleteModal>
        ) : null
        }
        </>
    )
}