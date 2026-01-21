import { Profile } from "../../components/Profile/TSX/Profile";
import { Header } from "../../components/HeaderFooter/TSX/Header";
import { Footer } from "../../components/HeaderFooter/TSX/Footer";

const ProfilePage = () => {
    return (
        <>
            <Header />
            <main style={{ minHeight: "60vh", paddingTop: "100px", paddingBottom: "2rem" }}>
                <Profile />
            </main>
            <Footer />
        </>
    );
};

export default ProfilePage;
