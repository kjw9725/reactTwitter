import styled from "styled-components";
import { auth, db, storage } from "./firebase";
import React, { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Unsubscribe, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";
import DeleteAuth from "../components/deleteAuth";
import PasswordChange from "../components/passwordChange";


const Wrapper = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
`;
const AvatarUpload = styled.label`
    width: 80px;
    overflow: hidden;
    height: 80px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    svg{
        width: 50px;
    }
`;
const AvatarImg = styled.img``;
const AvatarInput = styled.input`
    display: none;
`;
const Name = styled.span`
    display: flex;
    justify-content: center;
    align-items: flex-end;
    font-size: 22px;
    gap: 4px;
    svg{
        width: 14px;
    }
`;

const Tweets = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const NameInput = styled.input`
    height: 40px;
    background: transparent;
    border: none;
    border-bottom: 1px solid gray;
    color: white;
    font-size: 18px;
`;

const EditButton = styled.button`
    background-color: #1d9bf0;
    color: white;
    font-weight: 600;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 4px;
    &:hover{
        background-color: #1d9bf0;
        color: white;
    }`;

const CancelButton = styled.button`
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
    }`;

    const DisplayFlex = styled.div`
        display: flex;
        gap: 10px;
    `;


export default function Profile(){
    const user = auth.currentUser;
    const urlparam = window.location.href.split('?')[1] ? window.location.href.split('?')[1] : user?.uid;
    const [avatar, setAvatar] = useState('');
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [editName, setEditName] = useState('');
    const [isEdit, setEdit] = useState(false);
    const [profileName, setProfileName] = useState('');

    const avatarImporter = async() => {
        const avatarRef = await ref(storage, `avartars/${urlparam}`);
        try{
            const avatarImg = await getDownloadURL(avatarRef);
            setAvatar(avatarImg);
        } catch {
            setAvatar('');
        }
    }
    const onAvatarChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;
        if(!user) return;

        if(files && files.length === 1){
            const file = files[0];
            const locationRef = ref(storage, `avartars/${user?.uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);

            setAvatar(avatarUrl);
            await updateProfile(user, {
                photoURL: avatarUrl
            }) 

        
            //댓글 프로필사진 수정
            const q = query(collection(db, "comments"), where("userId", "==", user?.uid));
        
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (data) => { 
                const commentRef = doc(db, "comments", data.id);
                const batch = updateDoc(commentRef, {
                    avatar: avatarUrl
                });
                await batch;
            });
        }
    } 
    const onEditName = async() => {
        try{
            await updateProfile(user!, {
                displayName: editName,
            })
            // 이름변경시 트윗 username을 변경
            userTweetEdit();
        }catch(e){
            console.log(e);
        }finally{
            setEdit(false);
        }
    }

    const userTweetEdit = async () => {

        const tweetQuery = query(
            collection(db, 'tweets'),
            where("userId", "==", user?.uid),
        );

        const snapshot = await getDocs(tweetQuery);
        const tweets = snapshot.docs.map((doc) => {
            const {tweet, createdAt, userId, username, photo} = doc.data();
            return{
                tweet,
                createdAt,
                userId,
                username,
                photo,
                id: doc.id
            }
        })
        tweets.map((res) => { 
            const userDoc = doc(db, "tweets", res.id);
            updateDoc(userDoc, {
                username: editName,
            });
        })
    }


    useEffect(() => { 
        avatarImporter(); //프로필사진 불러오기
        fetchTweets(); //트윗 불러오기
    }, []);
    
    const fetchTweets = async () => {
        let unsubscribe: Unsubscribe | null = null;
        const tweetQuery = query(
            collection(db, 'tweets'),
            where("userId", "==", urlparam),
            orderBy("createdAt", "desc"),
            limit(25)
        );
 
        unsubscribe = await onSnapshot(tweetQuery, (snapshot) => {
                const tweets = snapshot.docs.map((doc) => {
                    const {tweet, createdAt, userId, username, photo} = doc.data();
                    setProfileName(username);
                    return {
                        tweet,
                        createdAt,
                        userId,
                        username,
                        photo,
                        id: doc.id
                    };
                });
                setTweets(tweets);
                console.log(tweets);
            })
            return () => {
                unsubscribe && unsubscribe();
            }
    }
    
    const onName = () => {
        setEditName(user?.displayName || '');
        setEdit(true);
    }

    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nameEdit = e.target.value;
        setEditName(nameEdit);
    }
    const onCancel = () => {
        setEditName('');
        setEdit(false);
    }


 
    return (
        <Wrapper>
            <AvatarUpload htmlFor="avatar">
                {avatar ? (<AvatarImg src={avatar}/>) : (<svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>)}
            </AvatarUpload>
            <AvatarInput type='file' id="avatar" accept="image/*" onChange={onAvatarChange} />
                {isEdit ?  (
                 <Name>
                    <NameInput value={editName} onChange={onNameChange}/>
                    <CancelButton onClick={onCancel}> Cancel </CancelButton>
                    <EditButton onClick={onEditName}>Edit </EditButton>
                </Name>
                ):(
                    <Name>
                        {user?.uid === urlparam ? user?.displayName : profileName}
                        {user?.uid === urlparam ? (
                            <svg fill="none" onClick={onName} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>): null}
                    </Name>
                     )}
            <Tweets>
                {tweets.map((tweet) => <Tweet key={tweet.id} {...tweet} />)}
            </Tweets>
            {urlparam === user?.uid ? (
            <DisplayFlex>
                <PasswordChange />
                <DeleteAuth />
            </DisplayFlex>
            ): null}
        </Wrapper>
    )
}