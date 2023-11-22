import {styled} from "styled-components";

const Wrapper = styled.div`
    height: 100vh;
    display: flex;
    justify-conntent: center,
    align-item: center;
`;
const Text = styled.span`
    font-size: 24px;
`;

export default function LoadingScreen(){
    return <Wrapper><Text>Loading...</Text></Wrapper>
}