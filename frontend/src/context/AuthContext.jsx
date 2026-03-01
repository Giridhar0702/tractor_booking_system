import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Try to fetch additional user data (role, etc.) from Firestore (with 3s timeout)
          let userData = {};
          try {
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 3000));
            const userDoc = await Promise.race([getDoc(doc(db, 'users', firebaseUser.uid)), timeoutPromise]);
            userData = userDoc.exists() ? userDoc.data() : {};
          } catch (firestoreError) {
            console.warn('Could not fetch user profile from Firestore:', firestoreError.message);
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || userData.name || 'User',
            photoURL: firebaseUser.photoURL,
            role: userData.role || null, // null means role not yet selected
            phone: userData.phone || '',
            ...userData
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Email/Password Login
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  // Email/Password Registration
  const registerWithEmail = async (email, password, name, role = 'FARMER') => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name in Firebase Auth
    try {
      await updateProfile(result.user, { displayName: name });
    } catch (err) {
      console.warn('Could not update display name:', err.message);
    }

    // Store additional user data in Firestore (non-critical)
    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (firestoreErr) {
      console.warn('Could not save user profile to Firestore:', firestoreErr.message);
    }

    // Update local user state immediately with the role
    setUser({
      uid: result.user.uid,
      email: result.user.email,
      name: name,
      photoURL: result.user.photoURL,
      role: role,
      phone: ''
    });

    return result.user;
  };

  // Google Sign-In — returns { user, isNewUser }
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Check if user already exists in Firestore (with 3s timeout to avoid hanging)
    let isNewUser = true;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 3000));
      const userDoc = await Promise.race([getDoc(userDocRef), timeoutPromise]);
      isNewUser = !userDoc.exists();
    } catch (firestoreErr) {
      console.warn('Could not check user profile in Firestore:', firestoreErr.message);
    }

    return { user: firebaseUser, isNewUser };
  };

  // Facebook Sign-In — returns { user, isNewUser }
  const loginWithFacebook = async () => {
    const result = await signInWithPopup(auth, facebookProvider);
    const firebaseUser = result.user;

    // Check if user already exists in Firestore (with 3s timeout to avoid hanging)
    let isNewUser = true;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 3000));
      const userDoc = await Promise.race([getDoc(userDocRef), timeoutPromise]);
      isNewUser = !userDoc.exists();
    } catch (firestoreErr) {
      console.warn('Could not check user profile in Firestore:', firestoreErr.message);
    }

    return { user: firebaseUser, isNewUser };
  };

  // Set user role (called after social sign-up role selection)
  const setUserRole = async (role) => {
    if (!auth.currentUser) return;

    const firebaseUser = auth.currentUser;

    // Update local user state IMMEDIATELY so UI unblocks
    setUser(prev => ({
      ...prev,
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || prev?.name || 'User',
      photoURL: firebaseUser.photoURL,
      role: role
    }));

    // Save to Firestore in the background (fire-and-forget, non-blocking)
    setDoc(doc(db, 'users', firebaseUser.uid), {
      name: firebaseUser.displayName || '',
      email: firebaseUser.email,
      role,
      photoURL: firebaseUser.photoURL || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).catch(err => {
      console.warn('Could not save user role to Firestore:', err.message);
    });
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Update user profile in Firestore
  const updateUserProfile = async (updates) => {
    if (!user?.uid) return;

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Update local state
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      loginWithFacebook,
      setUserRole,
      logout,
      updateUserProfile
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
