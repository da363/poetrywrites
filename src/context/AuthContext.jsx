import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, provider, ADMIN_EMAILS } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,            setUser]            = useState(null)
  const [isAdmin,         setIsAdmin]         = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [profileComplete, setProfileComplete] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setIsAdmin(ADMIN_EMAILS.includes(firebaseUser.email))

        // Always check Firestore for profileComplete before unblocking UI
        try {
          const ref  = doc(db, 'users', firebaseUser.uid)
          const snap = await getDoc(ref)
          if (!snap.exists()) {
            await setDoc(ref, {
              uid:             firebaseUser.uid,
              email:           firebaseUser.email,
              displayName:     firebaseUser.displayName,
              photoURL:        firebaseUser.photoURL,
              joinedAt:        new Date().toISOString(),
              profileComplete: false,
            })
            setProfileComplete(false)
          } else {
            setProfileComplete(snap.data().profileComplete === true)
          }
        } catch (err) {
          console.error('User record sync error:', err)
          setProfileComplete(false)
        }
      } else {
        setUser(null)
        setIsAdmin(false)
        setProfileComplete(false)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Call this after profile is saved so rest of app updates instantly
  const markProfileComplete = () => setProfileComplete(true)

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error('Sign-in error:', err)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setProfileComplete(false)
    } catch (err) {
      console.error('Sign-out error:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, profileComplete, markProfileComplete, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
