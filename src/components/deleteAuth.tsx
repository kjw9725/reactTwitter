import styled from "styled-components"
import { auth } from "../routes/firebase";
import { deleteUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";  

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
    const navigate = useNavigate();

    const deleteAuth = async () =>{
        const ok = confirm('계정을 삭제 하시겠습니까?');  
        const userAuth = auth.currentUser; 
        if(!ok) return;
 
         deleteUser(userAuth!);    
     navigate('/');   
    }


    return <DeleteAuthButton onClick={deleteAuth}> 회원 탈퇴 </DeleteAuthButton>
}