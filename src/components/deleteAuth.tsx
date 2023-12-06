import styled from "styled-components"
import { auth } from "../routes/firebase";
import { deleteUser, signOut } from "firebase/auth"; 

const DeleteAuthButton = styled.button`
    background-color: tomato;
    color: white;
    font-weight: 600;
    font-size: 18px;
    border: 0;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
    width: 120px;
    height: 44px;
    `;


export default function DeleteAuth(){ 

    const deleteAuth = async () =>{
        const ok = confirm('계정을 삭제하시려면 패스워드를 입력해주세요');
        const userAuth = auth.currentUser; 
        try{ 
            if(!ok) return; 
            else{ 
                if(userAuth){
                    await deleteUser(userAuth);
                    await signOut(auth);
                    window.location.replace('/');
                }
            }
        }catch(error){
            console.log('deleteError', error);
        }
    }


    return <DeleteAuthButton onClick={deleteAuth}> 회원 탈퇴 </DeleteAuthButton>
}