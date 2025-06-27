"use client";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
// next
// components
//
import Login from "@/app/auth/login/page";
import { useAuthContext } from "./useAuthContext";
import { usePathname, useRouter } from "next/navigation";

// ----------------------------------------------------------------------

AuthGuard.propTypes = {
  children: PropTypes.node,
};

export default function AuthGuard({ children }) {
  const { isAuthenticated, isInitialized } = useAuthContext();

  const pathname = usePathname();

  const { push } = useRouter();

  const [requestedLocation, setRequestedLocation] = useState(null);

  useEffect(() => {
    if (requestedLocation && pathname !== requestedLocation) {
      push(requestedLocation);
    }
    if (isAuthenticated) {
      setRequestedLocation(null);
    }
  }, [isAuthenticated, pathname, push, requestedLocation]);

  if (!isInitialized) {
    return <main className="w-100 h-screen flex justify-center">
    <div className="main-spinner"></div>
  </main>;
  }

  if (!isAuthenticated) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }

    // return <Login />;
  }

  return <>{children} </>;
}


// "use client";
// import PropTypes from "prop-types";
// import { useEffect, useState } from "react";
// import { useAuthContext } from "./useAuthContext";
// import { usePathname, useRouter } from "next/navigation";

// // ----------------------------------------------------------------------

// AuthGuard.propTypes = {
//   children: PropTypes.node,
// };

// export default function AuthGuard({ children }) {
//   const { isAuthenticated, isInitialized } = useAuthContext();
//   const pathname = usePathname();
//   const { push } = useRouter();
//   const [requestedLocation, setRequestedLocation] = useState(null);

//   useEffect(() => {
//     if (isInitialized) {
//       if (!isAuthenticated) {
//         if (!requestedLocation) {
//           setRequestedLocation(pathname);
//         }
//         if (pathname !== '/auth/login') {
//           push('/auth/login');
//         }
//       } else {
//         if (requestedLocation) {
//           push(requestedLocation);
//         }
//       }
//     }
//   }, [isAuthenticated, isInitialized, pathname, push, requestedLocation])

//   if (!isInitialized) {
//     return (
//       <main className="w-100 h-screen flex justify-center">
//         <div className="main-spinner"></div>
//       </main>
//     );
//   }

//   if (isAuthenticated) {
//     return <>{children}</>;
//   }


//   return null; 
// }
