import { useRouter } from "next/router";
import { useEffect } from "react";
import { auth } from "../firebase/config";

const withAuth = (WrappedComponent) => {
    return (props) => {
        const router = useRouter();

        useEffect(() => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                if (!user) {
                    router.push("/signin");
                }
            });

            return () => unsubscribe();
        }, [router]);

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
